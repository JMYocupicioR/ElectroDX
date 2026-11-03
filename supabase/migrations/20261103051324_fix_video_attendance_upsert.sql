-- ============================================================================
-- Fix: acreditación por grabación no asentaba class_attendances
-- Causas en producción:
-- 1) class_attendances no tenía columna updated_at (el INSERT de la RPC fallaba)
-- 2) ON CONFLICT (student_id, workshop_id) sin predicado del índice parcial
-- 3) Si is_fully_watched ya era true pero no había pase, no se reintentaba
-- ============================================================================

ALTER TABLE public.class_attendances
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS uq_class_attendances_student_workshop
  ON public.class_attendances (student_id, workshop_id)
  WHERE workshop_id IS NOT NULL;

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
  v_has_attendance BOOLEAN := false;
  v_attendance_written BOOLEAN := false;
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

  SELECT EXISTS (
    SELECT 1
    FROM public.class_attendances
    WHERE student_id = v_user_id
      AND (
        workshop_id = p_workshop_id
        OR (
          workshop_id IS NULL
          AND session_title = v_session_title
          AND session_date = v_session_date
        )
      )
  ) INTO v_has_attendance;

  v_merged_segments := public.merge_watch_interval_arrays(v_prev_segments, p_new_segments);

  v_calc_percentage := LEAST(100.0, GREATEST(0.0, (
    SELECT COALESCE(SUM((elem->>1)::numeric - (elem->>0)::numeric), 0)
    FROM jsonb_array_elements(v_merged_segments) AS elem
  ) / NULLIF(p_duration, 0) * 100.0));

  IF v_calc_percentage >= v_min_percent THEN
    v_is_complete := true;
  END IF;

  IF v_already_completed
     AND v_has_attendance
     AND ABS(v_calc_percentage - v_prev_percentage) < 0.5
     AND ABS(COALESCE(p_current_time, 0) - v_prev_position) < 5 THEN
    RETURN jsonb_build_object(
      'watched_percentage', v_prev_percentage,
      'is_fully_watched', true,
      'min_required', v_min_percent,
      'accredited', COALESCE(v_allow_attendance, false),
      'skipped', true
    );
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

  IF v_is_complete AND COALESCE(v_allow_attendance, false) AND NOT v_has_attendance THEN
    BEGIN
      -- Preferir conflicto por sesión (constraint real en prod: uq_student_session)
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
        format(
          'Asistencia acreditada automáticamente por visualización de grabación (%s%% visto)',
          ROUND(v_calc_percentage)
        ),
        now()
      )
      ON CONFLICT (student_id, session_title, session_date)
      DO UPDATE SET
        workshop_id = COALESCE(public.class_attendances.workshop_id, EXCLUDED.workshop_id),
        status = 'present',
        minutes_attended = EXCLUDED.minutes_attended,
        notes = EXCLUDED.notes,
        session_modality = EXCLUDED.session_modality,
        updated_at = now();

      v_attendance_written := true;
    EXCEPTION
      WHEN unique_violation THEN
        -- Índice parcial (student_id, workshop_id)
        UPDATE public.class_attendances
        SET
          status = 'present',
          minutes_attended = ROUND(p_duration / 60),
          session_modality = 'online',
          notes = format(
            'Asistencia acreditada automáticamente por visualización de grabación (%s%% visto)',
            ROUND(v_calc_percentage)
          ),
          updated_at = now()
        WHERE student_id = v_user_id
          AND workshop_id = p_workshop_id;

        IF FOUND THEN
          v_attendance_written := true;
        ELSE
          BEGIN
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
              format(
                'Asistencia acreditada automáticamente por visualización de grabación (%s%% visto)',
                ROUND(v_calc_percentage)
              ),
              now()
            )
            ON CONFLICT (student_id, workshop_id) WHERE workshop_id IS NOT NULL
            DO UPDATE SET
              status = 'present',
              minutes_attended = EXCLUDED.minutes_attended,
              notes = EXCLUDED.notes,
              session_modality = EXCLUDED.session_modality,
              updated_at = now();
            v_attendance_written := true;
          EXCEPTION
            WHEN OTHERS THEN
              v_attendance_written := false;
              RAISE WARNING 'log_video_watch_heartbeat attendance fallback failed: %', SQLERRM;
          END;
        END IF;
      WHEN OTHERS THEN
        v_attendance_written := false;
        RAISE WARNING 'log_video_watch_heartbeat attendance upsert failed: %', SQLERRM;
    END;
  ELSIF v_has_attendance AND v_is_complete THEN
    v_attendance_written := true;
  END IF;

  RETURN jsonb_build_object(
    'watched_percentage', GREATEST(v_prev_percentage, v_calc_percentage),
    'is_fully_watched', v_is_complete OR v_already_completed,
    'min_required', v_min_percent,
    'accredited', (v_is_complete OR v_already_completed)
      AND COALESCE(v_allow_attendance, false)
      AND (v_attendance_written OR v_has_attendance),
    'skipped', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.merge_watch_interval_arrays(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_video_watch_heartbeat(UUID, NUMERIC, NUMERIC, JSONB) TO authenticated;

-- Backfill: completaron grabación pero no tienen pase
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
SELECT
  p.workshop_id,
  w.title,
  w.scheduled_at::date,
  p.user_id,
  'present',
  'online',
  ROUND(COALESCE(NULLIF(p.total_duration_seconds, 0), w.duration_minutes * 60) / 60.0),
  format(
    'Asistencia acreditada automáticamente por visualización de grabación (%s%% visto) [backfill]',
    ROUND(p.watched_percentage)
  ),
  now()
FROM public.workshop_video_progress p
JOIN public.live_workshops w ON w.id = p.workshop_id
WHERE p.is_fully_watched = true
  AND COALESCE(w.allow_recording_attendance, true) = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.class_attendances a
    WHERE a.student_id = p.user_id
      AND (
        a.workshop_id = p.workshop_id
        OR (
          a.workshop_id IS NULL
          AND a.session_title = w.title
          AND a.session_date = w.scheduled_at::date
        )
      )
  )
ON CONFLICT (student_id, session_title, session_date)
DO UPDATE SET
  workshop_id = COALESCE(public.class_attendances.workshop_id, EXCLUDED.workshop_id),
  status = CASE
    WHEN public.class_attendances.status IN ('excused', 'absent') THEN public.class_attendances.status
    ELSE 'present'
  END,
  notes = COALESCE(public.class_attendances.notes, EXCLUDED.notes),
  updated_at = now();
