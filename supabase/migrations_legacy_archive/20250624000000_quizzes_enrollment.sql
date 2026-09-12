-- Physician enrollment + topic quizzes + attempt tracking

CREATE TYPE public.enrollment_status AS ENUM ('none', 'pending', 'approved', 'rejected');

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS enrollment_status public.enrollment_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS enrollment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrollment_verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS enrollment_requested_at TIMESTAMPTZ;

-- ─── Enrollment helpers ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_enrollment_profile_complete(p public.profiles)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    NULLIF(trim(p.display_name), '') IS NOT NULL
    AND NULLIF(trim(p.credentials), '') IS NOT NULL
    AND NULLIF(trim(p.institution), '') IS NOT NULL
    AND NULLIF(trim(p.cedula_profesional), '') IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_physician(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_verified_contributor(check_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = check_user_id
        AND p.enrollment_status = 'approved'
        AND p.enrollment_verified_at IS NOT NULL
    );
$$;

CREATE OR REPLACE FUNCTION public.sync_enrollment_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_enrollment_profile_complete(NEW) THEN
    IF NEW.enrollment_status IN ('none', 'rejected') THEN
      NEW.enrollment_status := 'pending';
      NEW.enrollment_requested_at := COALESCE(NEW.enrollment_requested_at, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_enrollment_request ON public.profiles;
CREATE TRIGGER profiles_sync_enrollment_request
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_enrollment_request();

CREATE OR REPLACE FUNCTION public.verify_physician_enrollment(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden aprobar inscripciones';
  END IF;

  SELECT * INTO p FROM public.profiles WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil no encontrado';
  END IF;

  IF NOT public.is_enrollment_profile_complete(p) THEN
    RAISE EXCEPTION 'El perfil está incompleto (falta cédula profesional u otros datos)';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'approved',
    enrollment_verified_at = now(),
    enrollment_verified_by = auth.uid()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'verify_physician_enrollment', 'user', target_user_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_physician_enrollment(
  target_user_id UUID,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden rechazar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'rejected',
    enrollment_verified_at = NULL,
    enrollment_verified_by = auth.uid()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'reject_physician_enrollment',
    'user',
    target_user_id::text,
    jsonb_build_object('notes', notes)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_physician_enrollment(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar inscripciones';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes revocarte a ti mismo';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'none',
    enrollment_verified_at = NULL,
    enrollment_verified_by = NULL,
    enrollment_requested_at = NULL
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_physician_enrollment', 'user', target_user_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_contributor(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden verificar colaboradores';
  END IF;

  UPDATE public.profiles
  SET
    verified_at = now(),
    enrollment_status = 'approved',
    enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
    enrollment_verified_by = COALESCE(enrollment_verified_by, auth.uid())
  WHERE id = target_user_id;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, 'contributor', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'verify_contributor', 'user', target_user_id::text, '{}'::jsonb);
END;
$$;

-- ─── Quiz tables ──────────────────────────────────────────────────────────────

CREATE TABLE public.published_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT UNIQUE NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT,
  pass_score INT NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  max_attempts INT CHECK (max_attempts IS NULL OR max_attempts > 0),
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_options BOOLEAN NOT NULL DEFAULT true,
  question_count INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID REFERENCES public.content_revisions(id)
);

CREATE INDEX idx_published_quizzes_module ON public.published_quizzes(module_id);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.published_quizzes(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'true_false', 'image_choice')),
  stem TEXT NOT NULL,
  stem_en TEXT,
  image_url TEXT,
  image_alt TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  explanation_en TEXT,
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('basic', 'intermediate', 'advanced'))
);

CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, sort_order);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.published_quizzes(id) ON DELETE CASCADE,
  quiz_version INT NOT NULL,
  topic_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id, completed_at DESC);
CREATE INDEX idx_quiz_attempts_topic ON public.quiz_attempts(topic_id, user_id);

CREATE VIEW public.quiz_topic_flags
WITH (security_invoker = true)
AS
SELECT
  pq.topic_id,
  pq.module_id,
  pq.title,
  pq.pass_score,
  pq.max_attempts,
  pq.version,
  pq.question_count
FROM public.published_quizzes pq
WHERE pq.question_count > 0;

GRANT SELECT ON public.quiz_topic_flags TO anon, authenticated;

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.published_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published_quizzes_enrolled_read"
  ON public.published_quizzes FOR SELECT
  TO authenticated
  USING (public.is_enrolled_physician());

CREATE POLICY "published_quizzes_public_metadata"
  ON public.published_quizzes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "quiz_questions_enrolled_read"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    public.is_enrolled_physician()
    AND EXISTS (
      SELECT 1 FROM public.published_quizzes q
      WHERE q.id = quiz_id
    )
  );

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_enrolled_physician());

CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ─── review_revision: add quiz branch ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.review_revision(
  revision_id UUID,
  new_status public.revision_status,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rev public.content_revisions;
  topic_id TEXT;
  module_id TEXT;
  quiz_id UUID;
  p JSONB;
  q JSONB;
  qid UUID;
  i INT;
BEGIN
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN
    RAISE EXCEPTION 'No autorizado para revisar contenido';
  END IF;

  IF new_status NOT IN ('approved', 'rejected', 'changes_requested') THEN
    RAISE EXCEPTION 'Estado de revisión inválido';
  END IF;

  SELECT * INTO rev
  FROM public.content_revisions
  WHERE id = revision_id AND status = 'pending_review';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada o no está pendiente';
  END IF;

  IF new_status = 'approved' THEN
    p := rev.payload;

    IF COALESCE(p->>'revisionType', 'topic') = 'quiz' THEN
      topic_id := COALESCE(rev.target_topic_id, p->>'quizTopicId', p->>'id');

      IF topic_id IS NULL THEN
        RAISE EXCEPTION 'Revisión de cuestionario sin topic_id';
      END IF;

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_quizzes WHERE topic_id = topic_id;
      ELSE
        INSERT INTO public.published_quizzes (
          topic_id, module_id, title, pass_score, max_attempts,
          shuffle_questions, shuffle_options, version, question_count,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          topic_id,
          rev.module_id,
          COALESCE(p->>'title', 'Evaluación'),
          COALESCE((p->>'passScore')::int, 70),
          NULLIF(p->>'maxAttempts', '')::int,
          COALESCE((p->>'shuffleQuestions')::boolean, true),
          COALESCE((p->>'shuffleOptions')::boolean, true),
          COALESCE((SELECT version FROM public.published_quizzes WHERE topic_id = topic_id), 0) + 1,
          0,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (topic_id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          title = EXCLUDED.title,
          pass_score = EXCLUDED.pass_score,
          max_attempts = EXCLUDED.max_attempts,
          shuffle_questions = EXCLUDED.shuffle_questions,
          shuffle_options = EXCLUDED.shuffle_options,
          version = public.published_quizzes.version + 1,
          question_count = 0,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now()
        RETURNING id INTO quiz_id;

        DELETE FROM public.quiz_questions WHERE quiz_id = quiz_id;

        i := 0;
        FOR q IN SELECT jsonb_array_elements(COALESCE(p->'questions', '[]'::jsonb))
        LOOP
          INSERT INTO public.quiz_questions (
            quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
            options, explanation, explanation_en, difficulty
          )
          VALUES (
            quiz_id,
            COALESCE((q->>'sortOrder')::int, i),
            COALESCE(q->>'type', 'single'),
            COALESCE(q->>'stem', ''),
            q->>'stemEn',
            q->>'imageUrl',
            q->>'imageAlt',
            COALESCE(q->'options', '[]'::jsonb),
            q->>'explanation',
            q->>'explanationEn',
            q->>'difficulty'
          );
          i := i + 1;
        END LOOP;

        UPDATE public.published_quizzes
        SET question_count = i
        WHERE id = quiz_id;
      END IF;

    ELSIF COALESCE(p->>'revisionType', 'topic') = 'module' THEN
      module_id := COALESCE(rev.module_id, p->>'id', p->>'slug', gen_random_uuid()::text);

      IF rev.action = 'delete' AND rev.module_id IS NOT NULL THEN
        DELETE FROM public.published_modules WHERE id = rev.module_id;
      ELSE
        INSERT INTO public.published_modules (
          id, number, title, title_en, emoji, description, description_en,
          color, icon, sort_order, version,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          module_id,
          COALESCE((p->>'number')::int, 99),
          COALESCE(p->>'title', 'Sin título'),
          p->>'titleEn',
          COALESCE(p->>'emoji', '📚'),
          p->>'description',
          p->>'descriptionEn',
          COALESCE(p->>'color', 'from-blue-500 to-indigo-600'),
          COALESCE(p->>'icon', 'BookOpen'),
          COALESCE((p->>'sortOrder')::int, COALESCE((p->>'number')::int, 99)),
          COALESCE((SELECT version FROM public.published_modules WHERE id = module_id), 0) + 1,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          number = EXCLUDED.number,
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          emoji = EXCLUDED.emoji,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          version = public.published_modules.version + 1,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now();
      END IF;
    ELSE
      topic_id := COALESCE(rev.target_topic_id, p->>'id', gen_random_uuid()::text);

      IF rev.action = 'delete' AND rev.target_topic_id IS NOT NULL THEN
        DELETE FROM public.published_topics WHERE id = rev.target_topic_id;
      ELSE
        INSERT INTO public.published_topics (
          id, module_id, parent_id, slug,
          title, title_en, description, description_en,
          content, content_en, media,
          clinical_pearls, clinical_pearls_en, key_points, key_points_en,
          tags, key_terms, version,
          published_by, last_edited_by, source_revision_id, published_at
        )
        VALUES (
          topic_id,
          rev.module_id,
          rev.parent_id,
          COALESCE(p->>'slug', topic_id),
          COALESCE(p->>'title', 'Sin título'),
          p->>'titleEn',
          p->>'description',
          p->>'descriptionEn',
          p->>'content',
          p->>'contentEn',
          jsonb_build_object(
            'videoUrls', COALESCE(p->'videoUrls', '[]'::jsonb),
            'youtubeUrls', COALESCE(p->'youtubeUrls', '[]'::jsonb),
            'vimeoUrls', COALESCE(p->'vimeoUrls', '[]'::jsonb),
            'embedUrls', COALESCE(p->'embedUrls', '[]'::jsonb),
            'imageUrls', COALESCE(p->'imageUrls', '[]'::jsonb)
          ),
          COALESCE(p->'clinicalPearls', '[]'::jsonb),
          COALESCE(p->'clinicalPearlsEn', '[]'::jsonb),
          COALESCE(p->'keyPoints', '[]'::jsonb),
          COALESCE(p->'keyPointsEn', '[]'::jsonb),
          COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(p->'tags', '[]'::jsonb))),
            '{}'::text[]
          ),
          COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(COALESCE(p->'keyTerms', '[]'::jsonb))),
            '{}'::text[]
          ),
          COALESCE((SELECT version FROM public.published_topics WHERE id = topic_id), 0) + 1,
          auth.uid(),
          rev.author_id,
          rev.id,
          now()
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          parent_id = EXCLUDED.parent_id,
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          content = EXCLUDED.content,
          content_en = EXCLUDED.content_en,
          media = EXCLUDED.media,
          clinical_pearls = EXCLUDED.clinical_pearls,
          clinical_pearls_en = EXCLUDED.clinical_pearls_en,
          key_points = EXCLUDED.key_points,
          key_points_en = EXCLUDED.key_points_en,
          tags = EXCLUDED.tags,
          key_terms = EXCLUDED.key_terms,
          version = public.published_topics.version + 1,
          last_edited_by = EXCLUDED.last_edited_by,
          source_revision_id = EXCLUDED.source_revision_id,
          published_at = now();
      END IF;
    END IF;
  END IF;

  UPDATE public.content_revisions
  SET
    status = new_status,
    reviewer_id = auth.uid(),
    review_notes = notes,
    reviewed_at = now()
  WHERE id = revision_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'review_revision',
    'content_revision',
    revision_id::text,
    jsonb_build_object('status', new_status, 'notes', notes)
  );
END;
$$;

-- ─── Admin RPC updates ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  pending_only boolean DEFAULT false,
  enrollment_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid, email text, display_name text, credentials text, institution text,
  specialty text, bio text, avatar_url text, is_public boolean,
  cedula_profesional text,
  verified_at timestamptz,
  enrollment_status public.enrollment_status,
  enrollment_verified_at timestamptz,
  enrollment_requested_at timestamptz,
  created_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
  SELECT
    p.id, u.email::text, p.display_name, p.credentials, p.institution, p.specialty,
    p.bio, p.avatar_url, p.is_public, p.cedula_profesional,
    p.verified_at, p.enrollment_status, p.enrollment_verified_at, p.enrollment_requested_at,
    p.created_at,
    COALESCE(ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id), '{}'::text[])
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE
    CASE enrollment_filter
      WHEN 'enrollment_pending' THEN p.enrollment_status = 'pending'
      WHEN 'enrolled' THEN p.enrollment_status = 'approved'
      WHEN 'contributor_pending' THEN p.verified_at IS NULL
      WHEN 'contributors' THEN p.verified_at IS NOT NULL
      ELSE NOT pending_only OR p.verified_at IS NULL
    END
  ORDER BY p.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT jsonb_build_object(
    'pending_users', (SELECT count(*) FROM public.profiles WHERE verified_at IS NULL),
    'verified_users', (SELECT count(*) FROM public.profiles WHERE verified_at IS NOT NULL),
    'pending_enrollments', (SELECT count(*) FROM public.profiles WHERE enrollment_status = 'pending'),
    'enrolled_physicians', (SELECT count(*) FROM public.profiles WHERE enrollment_status = 'approved'),
    'pending_revisions', (SELECT count(*) FROM public.content_revisions WHERE status = 'pending_review'),
    'published_topics', (SELECT count(*) FROM public.published_topics),
    'published_quizzes', (SELECT count(*) FROM public.published_quizzes),
    'quiz_attempts_total', (SELECT count(*) FROM public.quiz_attempts),
    'approved_revisions', (SELECT count(*) FROM public.content_revisions WHERE status = 'approved')
  ) INTO result;
  RETURN result;
END; $$;
