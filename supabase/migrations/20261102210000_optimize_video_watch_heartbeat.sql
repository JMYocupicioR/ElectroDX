-- ============================================================================
-- Optimiza log_video_watch_heartbeat:
-- 1) Fusiona intervalos en servidor (no pisa con un payload incompleto)
-- 2) Early-return si ya acreditado y el delta es mínimo (menos writes)
-- 3) Actualiza completed_at solo en la primera acreditación
-- ============================================================================

CREATE OR REPLACE FUNCTION public.merge_watch_interval_arrays(
  p_existing JSONB,
  p_incoming JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_all JSONB := '[]'::jsonb;
  v_merged JSONB := '[]'::jsonb;
  v_elem JSONB;
  v_start NUMERIC;
  v_end NUMERIC;
  v_prev_start NUMERIC;
  v_prev_end NUMERIC;
  v_tol NUMERIC := 1.5;
BEGIN
  IF p_existing IS NULL OR jsonb_typeof(p_existing) <> 'array' THEN
    p_existing := '[]'::jsonb;
  END IF;
  IF p_incoming IS NULL OR jsonb_typeof(p_incoming) <> 'array' THEN
    p_incoming := '[]'::jsonb;
  END IF;

  -- Concatenar y normalizar a [[start,end], ...]
  FOR v_elem IN
    SELECT value
    FROM jsonb_array_elements(p_existing || p_incoming) AS t(value)
  LOOP
    IF jsonb_typeof(v_elem) <> 'array' OR jsonb_array_length(v_elem) < 2 THEN
      CONTINUE;
    END IF;
    v_start := ROUND(GREATEST(0, (v_elem->>0)::numeric)::numeric, 1);
    v_end := ROUND(GREATEST(0, (v_elem->>1)::numeric)::numeric, 1);
    IF v_end > v_start THEN
      v_all := v_all || jsonb_build_array(jsonb_build_array(v_start, v_end));
    END IF;
  END LOOP;

  -- Ordenar por start
  SELECT COALESCE(jsonb_agg(value ORDER BY (value->>0)::numeric), '[]'::jsonb)
  INTO v_all
  FROM jsonb_array_elements(v_all) AS t(value);

  -- Fusionar con tolerancia 1.5s
  FOR v_elem IN SELECT value FROM jsonb_array_elements(v_all) AS t(value)
  LOOP
    v_start := (v_elem->>0)::numeric;
    v_end := (v_elem->>1)::numeric;

    IF jsonb_array_length(v_merged) = 0 THEN
      v_merged := jsonb_build_array(jsonb_build_array(v_start, v_end));
      CONTINUE;
    END IF;

    v_prev_start := (v_merged->-1->>0)::numeric;
    v_prev_end := (v_merged->-1->>1)::numeric;

    IF v_start <= v_prev_end + v_tol THEN
      v_merged := jsonb_set(
        v_merged,
        ARRAY[(jsonb_array_length(v_merged) - 1)::text],
        jsonb_build_array(v_prev_start, GREATEST(v_prev_end, v_end))
      );
    ELSE
      v_merged := v_merged || jsonb_build_array(jsonb_build_array(v_start, v_end));
    END IF;
  END LOOP;

  RETURN v_merged;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_video_watch_heartbeat(
  p_workshop_id UUID,
  p_current_time NUMERIC,
  p_duration NUMERIC,
  p_new_segments JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_min_percent INT;
  v_allow_attendance BOOLEAN;
  v_session_title TEXT;
  v_session_date DATE;
  v_calc_percentage NUMERIC(5,2);
  v_is_complete BOOLEAN := false;
  v_already_completed BOOLEAN := false;
  v_prev_percentage NUMERIC(5,2) := 0;
  v_prev_position NUMERIC(10,2) := 0;
  v_prev_segments JSONB := '[]'::jsonb;
  v_merged_segments JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF p_duration IS NULL OR p_duration <= 0 THEN
    RAISE EXCEPTION 'Duración de video inválida';
  END IF;

  SELECT title, scheduled_at::date, min_watch_percent, allow_recording_attendance
  INTO v_session_title, v_session_date, v_min_percent, v_allow_attendance
  FROM public.live_workshops
  WHERE id = p_workshop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Taller no encontrado';
  END IF;

  SELECT
    COALESCE(is_fully_watched, false),
    COALESCE(watched_percentage, 0),
    COALESCE(last_position_seconds, 0),
    COALESCE(watched_segments, '[]'::jsonb)
  INTO
    v_already_completed,
    v_prev_percentage,
    v_prev_position,
    v_prev_segments
  FROM public.workshop_video_progress
  WHERE user_id = v_user_id AND workshop_id = p_workshop_id;

  IF NOT FOUND THEN
    v_already_completed := false;
    v_prev_percentage := 0;
    v_prev_position := 0;
    v_prev_segments := '[]'::jsonb;
  END IF;

  -- Fusionar segmentos existentes + entrantes (anti-pérdida entre pestañas / payloads parciales)
  v_merged_segments := public.merge_watch_interval_arrays(v_prev_segments, p_new_segments);

  v_calc_percentage := LEAST(100.0, GREATEST(0.0, (
    SELECT COALESCE(SUM((elem->>1)::numeric - (elem->>0)::numeric), 0)
    FROM jsonb_array_elements(v_merged_segments) AS elem
  ) / NULLIF(p_duration, 0) * 100.0));

  -- Early-return: ya acreditado y casi sin cambio → evita write
  IF v_already_completed
     AND ABS(v_calc_percentage - v_prev_percentage) < 0.5
     AND ABS(COALESCE(p_current_time, 0) - v_prev_position) < 5 THEN
    RETURN jsonb_build_object(
      'watched_percentage', v_prev_percentage,
      'is_fully_watched', true,
      'min_required', v_min_percent,
      'accredited', v_allow_attendance,
      'skipped', true
    );
  END IF;

  IF v_calc_percentage >= v_min_percent THEN
    v_is_complete := true;
  END IF;

  INSERT INTO public.workshop_video_progress (
    user_id,
    workshop_id,
    watched_percentage,
    last_position_seconds,
    total_duration_seconds,
    watched_segments,
    is_fully_watched,
    completed_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_workshop_id,
    v_calc_percentage,
    COALESCE(p_current_time, 0),
    p_duration,
    v_merged_segments,
    v_is_complete OR v_already_completed,
    CASE WHEN (v_is_complete AND NOT v_already_completed) THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, workshop_id)
  DO UPDATE SET
    watched_percentage = GREATEST(workshop_video_progress.watched_percentage, EXCLUDED.watched_percentage),
    last_position_seconds = EXCLUDED.last_position_seconds,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    watched_segments = EXCLUDED.watched_segments,
    is_fully_watched = workshop_video_progress.is_fully_watched OR EXCLUDED.is_fully_watched,
    completed_at = COALESCE(workshop_video_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  IF v_is_complete AND NOT v_already_completed AND v_allow_attendance THEN
    INSERT INTO public.class_attendances (
      workshop_id,
      session_title,
      session_date,
      student_id,
      status,
      session_modality,
      minutes_attended,
      notes,
      updated_at
    )
    VALUES (
      p_workshop_id,
      v_session_title,
      v_session_date,
      v_user_id,
      'present',
      'online',
      ROUND(p_duration / 60),
      format('Asistencia acreditada automáticamente por visualización de grabación (%s%% visto)', ROUND(v_calc_percentage)),
      now()
    )
    ON CONFLICT (student_id, workshop_id) WHERE workshop_id IS NOT NULL
    DO UPDATE SET
      status = 'present',
      minutes_attended = EXCLUDED.minutes_attended,
      notes = EXCLUDED.notes,
      updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'watched_percentage', GREATEST(v_prev_percentage, v_calc_percentage),
    'is_fully_watched', v_is_complete OR v_already_completed,
    'min_required', v_min_percent,
    'accredited', v_is_complete AND v_allow_attendance,
    'skipped', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_watch_interval_arrays(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_video_watch_heartbeat(UUID, NUMERIC, NUMERIC, JSONB) TO authenticated;
