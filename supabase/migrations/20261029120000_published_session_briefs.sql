-- Ficha pública de una clase ya programada: docentes y temas.
-- El docente suele estar asignado al tema, sin workshop_id en el compromiso.
-- Por eso se busca por la clase y también por el tema de esa clase.

DROP FUNCTION IF EXISTS public.get_published_session_briefs(uuid[]);

CREATE FUNCTION public.get_published_session_briefs(p_workshop_ids uuid[])
RETURNS TABLE (
  workshop_id uuid,
  kind text,
  teacher_id uuid,
  teacher_name text,
  topic_id text,
  module_id text,
  teacher_specialty text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH requested AS (
    SELECT id
    FROM unnest(COALESCE(p_workshop_ids, '{}'::uuid[])) AS t(id)
    LIMIT 200
  ),
  visible AS (
    SELECT w.id, w.topic_id, w.module_id
    FROM public.live_workshops w
    JOIN requested r ON r.id = w.id
    WHERE w.status IS DISTINCT FROM 'draft'
      AND w.status IS DISTINCT FROM 'cancelled'
  )
  SELECT v.id, 'topic', NULL::uuid, NULL::text, v.topic_id, v.module_id, NULL::text
  FROM visible v
  WHERE v.topic_id IS NOT NULL AND length(trim(v.topic_id)) > 0
  UNION
  SELECT v.id, 'topic', NULL::uuid, NULL::text, c.topic_id, c.module_id, NULL::text
  FROM public.topic_teaching_commitments c
  JOIN visible v ON v.id = c.workshop_id
  WHERE c.status <> 'withdrawn'
    AND c.topic_id IS NOT NULL
    AND length(trim(c.topic_id)) > 0
  UNION
  SELECT DISTINCT
    v.id,
    'teacher',
    c.teacher_id,
    COALESCE(NULLIF(trim(p.display_name), ''), 'Profesor'),
    NULL::text,
    NULL::text,
    COALESCE(NULLIF(trim(p.specialty), ''), NULLIF(trim(p.credentials), ''))
  FROM visible v
  JOIN public.topic_teaching_commitments c
    ON c.status <> 'withdrawn'
   AND (
     c.workshop_id = v.id
     OR (v.topic_id IS NOT NULL AND c.topic_id = v.topic_id)
   )
  LEFT JOIN public.profiles p ON p.id = c.teacher_id
  UNION
  SELECT DISTINCT
    v.id,
    'teacher',
    i.teacher_id,
    COALESCE(NULLIF(trim(p.display_name), ''), 'Profesor'),
    NULL::text,
    NULL::text,
    COALESCE(NULLIF(trim(p.specialty), ''), NULLIF(trim(p.credentials), ''))
  FROM visible v
  JOIN public.workshop_instructors i ON i.workshop_id = v.id
  LEFT JOIN public.profiles p ON p.id = i.teacher_id;
$$;

REVOKE ALL ON FUNCTION public.get_published_session_briefs(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_session_briefs(uuid[]) TO anon, authenticated;
