-- ==============================================================================
-- Migration: 20260924190000_topic_media_pdf_support.sql
-- Description: Update review_revision RPC to explicitly persist pdfUrls in media JSONB
-- ==============================================================================

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
  v_target_topic_id TEXT;
  v_target_module_id TEXT;
  p JSONB;
  v_rev_type TEXT;
  v_quiz_id UUID;
  q_item JSONB;
  q_order INT := 0;
  q_count INT := 0;
  v_media JSONB;
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

  UPDATE public.content_revisions
  SET
    status = new_status,
    reviewer_id = auth.uid(),
    review_notes = notes,
    reviewed_at = now()
  WHERE id = revision_id;

  IF new_status = 'approved' THEN
    p := rev.payload;
    v_rev_type := COALESCE(p->>'revisionType', 'topic');

    IF v_rev_type = 'module' THEN
      v_target_module_id := COALESCE(p->>'id', rev.module_id);
      IF rev.action = 'delete' THEN
        DELETE FROM public.published_modules WHERE id = v_target_module_id;
      ELSE
        INSERT INTO public.published_modules (
          id, number, title, title_en, emoji, description, description_en,
          color, icon, sort_order, version, published_at, published_by,
          last_edited_by, source_revision_id
        ) VALUES (
          v_target_module_id,
          COALESCE((p->>'number')::int, 99),
          COALESCE(NULLIF(p->>'title', ''), 'Módulo sin título'),
          p->>'titleEn',
          COALESCE(p->>'emoji', '📚'),
          p->>'description',
          p->>'descriptionEn',
          COALESCE(p->>'color', 'from-blue-500 to-indigo-600'),
          COALESCE(p->>'icon', 'BookOpen'),
          COALESCE((p->>'sortOrder')::int, 0),
          1,
          now(),
          rev.author_id,
          auth.uid(),
          revision_id
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
          published_at = now(),
          last_edited_by = auth.uid(),
          source_revision_id = revision_id;
      END IF;

    ELSIF v_rev_type = 'quiz' THEN
      v_target_topic_id := COALESCE(p->>'quizTopicId', rev.target_topic_id, rev.module_id);

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_quizzes WHERE topic_id = v_target_topic_id;
      ELSE
        IF p->'questions' IS NOT NULL AND jsonb_typeof(p->'questions') = 'array' THEN
          q_count := jsonb_array_length(p->'questions');
        ELSE
          q_count := 0;
        END IF;

        INSERT INTO public.published_quizzes (
          topic_id, module_id, title, pass_score, max_attempts,
          shuffle_questions, shuffle_options, question_count,
          version, published_at, published_by, last_edited_by, source_revision_id
        ) VALUES (
          v_target_topic_id,
          rev.module_id,
          p->>'title',
          COALESCE((p->>'passScore')::int, 70),
          (p->>'maxAttempts')::int,
          COALESCE((p->>'shuffleQuestions')::boolean, true),
          COALESCE((p->>'shuffleOptions')::boolean, true),
          q_count,
          1,
          now(),
          rev.author_id,
          auth.uid(),
          revision_id
        )
        ON CONFLICT (topic_id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          title = EXCLUDED.title,
          pass_score = EXCLUDED.pass_score,
          max_attempts = EXCLUDED.max_attempts,
          shuffle_questions = EXCLUDED.shuffle_questions,
          shuffle_options = EXCLUDED.shuffle_options,
          question_count = EXCLUDED.question_count,
          version = public.published_quizzes.version + 1,
          published_at = now(),
          last_edited_by = auth.uid(),
          source_revision_id = revision_id
        RETURNING id INTO v_quiz_id;

        DELETE FROM public.quiz_questions WHERE quiz_id = v_quiz_id;

        IF q_count > 0 THEN
          FOR q_item IN SELECT * FROM jsonb_array_elements(p->'questions')
          LOOP
            INSERT INTO public.quiz_questions (
              quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
              options, explanation, explanation_en, difficulty
            ) VALUES (
              v_quiz_id,
              q_order,
              COALESCE(q_item->>'type', 'single'),
              COALESCE(q_item->>'stem', ''),
              q_item->>'stemEn',
              q_item->>'imageUrl',
              q_item->>'imageAlt',
              COALESCE(q_item->'options', '[]'::jsonb),
              q_item->>'explanation',
              q_item->>'explanationEn',
              q_item->>'difficulty'
            );
            q_order := q_order + 1;
          END LOOP;
        END IF;
      END IF;

    ELSE
      -- Tipo Tema (Topic)
      v_target_topic_id := COALESCE(rev.target_topic_id, p->>'id', p->>'slug', 'tema');

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_topics WHERE id = v_target_topic_id;
      ELSE
        -- Unificar estructura de media incluyendo pdfUrls
        v_media := CASE 
          WHEN p->'media' IS NOT NULL AND jsonb_typeof(p->'media') = 'object' THEN p->'media'
          ELSE jsonb_build_object(
            'videoUrls', COALESCE(p->'videoUrls', '[]'::jsonb),
            'youtubeUrls', COALESCE(p->'youtubeUrls', '[]'::jsonb),
            'vimeoUrls', COALESCE(p->'vimeoUrls', '[]'::jsonb),
            'embedUrls', COALESCE(p->'embedUrls', '[]'::jsonb),
            'imageUrls', COALESCE(p->'imageUrls', '[]'::jsonb),
            'pdfUrls', COALESCE(p->'pdfUrls', '[]'::jsonb)
          )
        END;

        -- Si p->'media' era objeto pero no tenía pdfUrls, aseguramos conservarlo
        IF p->'pdfUrls' IS NOT NULL AND (v_media->'pdfUrls' IS NULL OR v_media->'pdfUrls' = '[]'::jsonb) THEN
          v_media := jsonb_set(v_media, '{pdfUrls}', p->'pdfUrls');
        END IF;

        INSERT INTO public.published_topics (
          id, module_id, parent_id, slug, title, title_en, description,
          description_en, content, content_en, media, clinical_pearls,
          clinical_pearls_en, key_points, key_points_en, tags, key_terms,
          sort_order, version, published_at, published_by, last_edited_by,
          source_revision_id, video_url
        ) VALUES (
          v_target_topic_id,
          rev.module_id,
          rev.parent_id,
          COALESCE(NULLIF(p->>'slug', ''), v_target_topic_id, 'tema'),
          COALESCE(NULLIF(p->>'title', ''), 'Tema sin título'),
          p->>'titleEn',
          p->>'description',
          p->>'descriptionEn',
          p->>'content',
          p->>'contentEn',
          v_media,
          COALESCE(p->'clinicalPearls', '[]'::jsonb),
          COALESCE(p->'clinicalPearlsEn', '[]'::jsonb),
          COALESCE(p->'keyPoints', '[]'::jsonb),
          COALESCE(p->'keyPointsEn', '[]'::jsonb),
          COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'tags')), '{}'),
          COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'keyTerms')), '{}'),
          COALESCE((p->>'sortOrder')::int, 0),
          1,
          now(),
          rev.author_id,
          auth.uid(),
          revision_id,
          COALESCE(p->>'videoUrl', p->'youtubeUrls'->0->>'videoId')
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          parent_id = EXCLUDED.parent_id,
          slug = COALESCE(NULLIF(EXCLUDED.slug, ''), public.published_topics.slug, EXCLUDED.id),
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
          sort_order = EXCLUDED.sort_order,
          version = public.published_topics.version + 1,
          published_at = now(),
          last_edited_by = auth.uid(),
          source_revision_id = revision_id,
          video_url = EXCLUDED.video_url;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'review_revision_' || new_status,
    'content_revision',
    revision_id::text,
    jsonb_build_object('notes', notes, 'action', rev.action, 'author_id', rev.author_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_revision(UUID, public.revision_status, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_revision(UUID, public.revision_status, TEXT) TO authenticated;
