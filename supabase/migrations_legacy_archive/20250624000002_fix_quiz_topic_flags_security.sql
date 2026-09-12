-- Fix Supabase linter: security_definer_view on quiz_topic_flags
-- Store question_count on published_quizzes; expose public metadata via security_invoker view + RLS

ALTER TABLE public.published_quizzes
  ADD COLUMN IF NOT EXISTS question_count INT NOT NULL DEFAULT 0;

UPDATE public.published_quizzes pq
SET question_count = (
  SELECT count(*)::int FROM public.quiz_questions q WHERE q.quiz_id = pq.id
);

DROP VIEW IF EXISTS public.quiz_topic_flags;

CREATE VIEW public.quiz_topic_flags
WITH (security_invoker = true)
AS
SELECT
  topic_id,
  module_id,
  title,
  pass_score,
  max_attempts,
  version,
  question_count
FROM public.published_quizzes
WHERE question_count > 0;

GRANT SELECT ON public.quiz_topic_flags TO anon, authenticated;

-- Public metadata only (no questions in this table); quiz_questions stays enrolled-only
DROP POLICY IF EXISTS "published_quizzes_public_metadata" ON public.published_quizzes;
CREATE POLICY "published_quizzes_public_metadata"
  ON public.published_quizzes FOR SELECT
  TO anon, authenticated
  USING (true);

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
