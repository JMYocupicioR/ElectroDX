-- EMG Editorial Platform: profiles, RBAC, revisions, published content, audit

CREATE TYPE public.app_role AS ENUM ('contributor', 'editor', 'admin');
CREATE TYPE public.revision_status AS ENUM (
  'draft', 'pending_review', 'approved', 'rejected', 'changes_requested'
);
CREATE TYPE public.revision_action AS ENUM ('create', 'update', 'delete');

-- ─── Profiles ───────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  credentials TEXT,
  institution TEXT,
  specialty TEXT,
  cedula_profesional TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.published_topics (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  parent_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  content TEXT,
  content_en TEXT,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_pearls JSONB NOT NULL DEFAULT '[]'::jsonb,
  clinical_pearls_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  key_terms TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID
);

CREATE TABLE public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_topic_id TEXT REFERENCES public.published_topics(id) ON DELETE SET NULL,
  module_id TEXT NOT NULL,
  parent_id TEXT,
  action public.revision_action NOT NULL DEFAULT 'update',
  payload JSONB NOT NULL,
  status public.revision_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_revisions_status ON public.content_revisions(status);
CREATE INDEX idx_content_revisions_author ON public.content_revisions(author_id);
CREATE INDEX idx_published_topics_module ON public.published_topics(module_id);
CREATE INDEX idx_profiles_public ON public.profiles(is_public) WHERE is_public = true;

-- ─── Helpers ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER content_revisions_updated_at
  BEFORE UPDATE ON public.content_revisions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(
  required_role public.app_role,
  check_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(check_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = check_user_id AND role = required_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_verified_contributor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE p.id = check_user_id
      AND p.verified_at IS NOT NULL
      AND ur.role IN ('contributor', 'editor', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.grant_user_role(
  target_user_id UUID,
  target_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden asignar roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, target_role, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'grant_role',
    'user',
    target_user_id::text,
    jsonb_build_object('role', target_role)
  );
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
  SET verified_at = now()
  WHERE id = target_user_id;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, 'contributor', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'verify_contributor', 'user', target_user_id::text, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_revision(revision_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_verified_contributor() THEN
    RAISE EXCEPTION 'Debes ser colaborador verificado para enviar revisiones';
  END IF;

  UPDATE public.content_revisions
  SET
    status = 'pending_review',
    submitted_at = now(),
    review_notes = NULL
  WHERE id = revision_id
    AND author_id = auth.uid()
    AND status IN ('draft', 'changes_requested');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada o no editable';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'submit_revision', 'content_revision', revision_id::text);
END;
$$;

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
  p JSONB;
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
    'review_' || new_status::text,
    'content_revision',
    revision_id::text,
    jsonb_build_object('notes', notes, 'topic_id', topic_id)
  );
END;
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- user_roles
CREATE POLICY "user_roles_self_read"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- published_topics: lectura pública total
CREATE POLICY "published_topics_public_read"
  ON public.published_topics FOR SELECT
  USING (true);

-- content_revisions
CREATE POLICY "revisions_author_read"
  ON public.content_revisions FOR SELECT
  USING (
    author_id = auth.uid()
    OR public.is_admin()
    OR public.has_role('editor')
  );

CREATE POLICY "revisions_author_insert"
  ON public.content_revisions FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND public.is_verified_contributor()
    AND status IN ('draft', 'pending_review')
  );

CREATE POLICY "revisions_author_update_draft"
  ON public.content_revisions FOR UPDATE
  USING (
    (author_id = auth.uid() AND status IN ('draft', 'changes_requested'))
    OR public.is_admin()
    OR public.has_role('editor')
  )
  WITH CHECK (
    (author_id = auth.uid() AND status IN ('draft', 'changes_requested', 'pending_review'))
    OR public.is_admin()
    OR public.has_role('editor')
  );

-- audit_log
CREATE POLICY "audit_log_admin_read"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- ─── Storage: avatars ───────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  524288,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public bucket: object URLs work without a broad SELECT policy (avoids bucket listing)
-- See migration 20250624000003 for avatars_owner_read policy

CREATE POLICY "avatars_self_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_self_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_self_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
