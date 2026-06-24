-- Dynamic modules + improved review_revision (modules, vimeo/embed media)

CREATE TABLE public.published_modules (
  id TEXT PRIMARY KEY,
  number INT NOT NULL DEFAULT 99,
  title TEXT NOT NULL,
  title_en TEXT,
  emoji TEXT NOT NULL DEFAULT '📚',
  description TEXT,
  description_en TEXT,
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID REFERENCES public.content_revisions(id)
);

CREATE INDEX idx_published_modules_sort ON public.published_modules(sort_order);

ALTER TABLE public.published_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published_modules_public_read"
  ON public.published_modules FOR SELECT
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

    IF COALESCE(p->>'revisionType', 'topic') = 'module' THEN
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
