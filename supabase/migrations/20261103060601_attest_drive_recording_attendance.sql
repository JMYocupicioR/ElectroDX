-- ============================================================================
-- Auto-declaración de asistencia para grabaciones en Google Drive
-- Drive no expone API de progreso; el alumno confirma que completó la clase.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.attest_drive_recording_attendance(
  p_workshop_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_title TEXT;
  v_session_date DATE;
  v_duration_minutes INT;
  v_allow_attendance BOOLEAN;
  v_attendance_closed BOOLEAN;
  v_recording_url TEXT;
  v_min_percent INT;
  v_already_completed BOOLEAN := false;
  v_has_attendance BOOLEAN := false;
  v_attendance_written BOOLEAN := false;
  v_duration_seconds NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  SELECT
    title,
    scheduled_at::date,
    COALESCE(duration_minutes, 0),
    COALESCE(allow_recording_attendance, true),
    COALESCE(attendance_closed, false),
    recording_url,
    COALESCE(min_watch_percent, 85)
  INTO
    v_title,
    v_session_date,
    v_duration_minutes,
    v_allow_attendance,
    v_attendance_closed,
    v_recording_url,
    v_min_percent
  FROM public.live_workshops
  WHERE id = p_workshop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Taller no encontrado';
  END IF;

  IF v_recording_url IS NULL OR btrim(v_recording_url) = '' THEN
    RAISE EXCEPTION 'Este taller no tiene grabación';
  END IF;

  IF v_recording_url !~* '(drive\.google\.com|docs\.google\.com/file)' THEN
    RAISE EXCEPTION 'Solo aplica a grabaciones alojadas en Google Drive';
  END IF;

  IF NOT v_allow_attendance THEN
    RAISE EXCEPTION 'Este taller no acredita asistencia por grabación';
  END IF;

  IF v_attendance_closed THEN
    RAISE EXCEPTION 'La lista de asistencia de este taller ya está cerrada';
  END IF;

  v_duration_seconds := GREATEST(COALESCE(v_duration_minutes, 0), 1) * 60;

  SELECT COALESCE(is_fully_watched, false)
  INTO v_already_completed
  FROM public.workshop_video_progress
  WHERE user_id = v_user_id AND workshop_id = p_workshop_id;

  IF NOT FOUND THEN
    v_already_completed := false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.class_attendances
    WHERE student_id = v_user_id
      AND (
        workshop_id = p_workshop_id
        OR (
          workshop_id IS NULL
          AND session_title = v_title
          AND session_date = v_session_date
        )
      )
  ) INTO v_has_attendance;

  IF v_already_completed AND v_has_attendance THEN
    RETURN jsonb_build_object(
      'watched_percentage', 100,
      'is_fully_watched', true,
      'min_required', v_min_percent,
      'accredited', true,
      'skipped', true,
      'source', 'drive_self_attest'
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
    100,
    v_duration_seconds,
    v_duration_seconds,
    jsonb_build_array(jsonb_build_array(0, v_duration_seconds)),
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id, workshop_id)
  DO UPDATE SET
    watched_percentage = GREATEST(workshop_video_progress.watched_percentage, 100),
    last_position_seconds = EXCLUDED.last_position_seconds,
    total_duration_seconds = GREATEST(
      COALESCE(workshop_video_progress.total_duration_seconds, 0),
      EXCLUDED.total_duration_seconds
    ),
    watched_segments = EXCLUDED.watched_segments,
    is_fully_watched = true,
    completed_at = COALESCE(workshop_video_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  IF v_allow_attendance AND NOT v_has_attendance THEN
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
        v_title,
        v_session_date,
        v_user_id,
        'present',
        'online',
        GREATEST(v_duration_minutes, 1),
        'Asistencia por auto-declaración del alumno (Google Drive, sin API de progreso)',
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
        UPDATE public.class_attendances
        SET
          status = 'present',
          minutes_attended = GREATEST(v_duration_minutes, 1),
          session_modality = 'online',
          notes = 'Asistencia por auto-declaración del alumno (Google Drive, sin API de progreso)',
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
              v_title,
              v_session_date,
              v_user_id,
              'present',
              'online',
              GREATEST(v_duration_minutes, 1),
              'Asistencia por auto-declaración del alumno (Google Drive, sin API de progreso)',
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
              RAISE WARNING 'attest_drive_recording_attendance attendance fallback failed: %', SQLERRM;
          END;
        END IF;
      WHEN OTHERS THEN
        v_attendance_written := false;
        RAISE WARNING 'attest_drive_recording_attendance attendance upsert failed: %', SQLERRM;
    END;
  ELSIF v_has_attendance THEN
    v_attendance_written := true;
  END IF;

  RETURN jsonb_build_object(
    'watched_percentage', 100,
    'is_fully_watched', true,
    'min_required', v_min_percent,
    'accredited', v_allow_attendance AND (v_attendance_written OR v_has_attendance),
    'skipped', false,
    'source', 'drive_self_attest'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.attest_drive_recording_attendance(UUID) TO authenticated;

COMMENT ON FUNCTION public.attest_drive_recording_attendance(UUID) IS
  'Permite al alumno auto-declarar asistencia cuando la grabación está en Google Drive (sin API de progreso).';
