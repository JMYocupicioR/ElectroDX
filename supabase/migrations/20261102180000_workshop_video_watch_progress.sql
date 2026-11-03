-- ============================================================================
-- Migración: Tabla de Progreso de Video de Talleres y Acreditación de Asistencia
-- 2026-11-02
-- ============================================================================

-- 1. Agregar configuración de umbral a live_workshops
ALTER TABLE public.live_workshops
  ADD COLUMN IF NOT EXISTS min_watch_percent INT NOT NULL DEFAULT 85 CHECK (min_watch_percent BETWEEN 1 AND 100),
  ADD COLUMN IF NOT EXISTS allow_recording_attendance BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.live_workshops.min_watch_percent IS 
  'Porcentaje mínimo de reproducción (ej. 85%) requerido para acreditar la sesión si el alumno no asistió en vivo.';

-- 2. Tabla de progreso de visualización de grabaciones
CREATE TABLE IF NOT EXISTS public.workshop_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES public.live_workshops(id) ON DELETE CASCADE,
  watched_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (watched_percentage >= 0 AND watched_percentage <= 100),
  last_position_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_duration_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  watched_segments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de pares [[0, 15], [30, 45]]
  is_fully_watched BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_workshop_progress UNIQUE (user_id, workshop_id)
);

CREATE INDEX IF NOT EXISTS idx_workshop_video_progress_lookup 
  ON public.workshop_video_progress (user_id, workshop_id);

-- 3. Habilitar RLS
ALTER TABLE public.workshop_video_progress ENABLE ROW LEVEL SECURITY;

-- Solo lectura para el usuario dueño y staff
CREATE POLICY "video_progress_select_own_or_staff"
  ON public.workshop_video_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

-- 4. RPC Segura: Registra el latido (heartbeat) y verifica umbral en el servidor
CREATE OR REPLACE FUNCTION public.log_video_watch_heartbeat(
  p_workshop_id UUID,
  p_current_time NUMERIC,
  p_duration NUMERIC,
  p_new_segments JSONB -- Segmentos acumulados por el cliente
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_min_percent INT;
  v_counts_kardex BOOLEAN;
  v_allow_attendance BOOLEAN;
  v_session_title TEXT;
  v_session_date DATE;
  v_calc_percentage NUMERIC(5,2);
  v_is_complete BOOLEAN := false;
  v_already_completed BOOLEAN := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener configuración del taller
  SELECT title, scheduled_at::date, min_watch_percent, counts_for_kardex, allow_recording_attendance
  INTO v_session_title, v_session_date, v_min_percent, v_counts_kardex, v_allow_attendance
  FROM public.live_workshops
  WHERE id = p_workshop_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Taller no encontrado';
  END IF;

  -- Verificar estado previo
  SELECT is_fully_watched INTO v_already_completed
  FROM public.workshop_video_progress
  WHERE user_id = v_user_id AND workshop_id = p_workshop_id;

  -- Calcular el porcentaje basado en los segmentos enviados
  v_calc_percentage := LEAST(100.0, GREATEST(0.0, (
    SELECT COALESCE(SUM((elem->>1)::numeric - (elem->>0)::numeric), 0)
    FROM jsonb_array_elements(p_new_segments) AS elem
  ) / NULLIF(p_duration, 0) * 100.0));

  IF v_calc_percentage >= v_min_percent THEN
    v_is_complete := true;
  END IF;

  -- Upsert en el progreso del video
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
    p_current_time,
    p_duration,
    p_new_segments,
    v_is_complete OR COALESCE(v_already_completed, false),
    CASE WHEN (v_is_complete AND NOT COALESCE(v_already_completed, false)) THEN now() ELSE NULL END,
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

  -- Si se completó por primera vez y la clase otorga asistencia
  IF v_is_complete AND NOT COALESCE(v_already_completed, false) AND v_allow_attendance THEN
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
    ON CONFLICT (student_id, workshop_id)
    DO UPDATE SET
      status = 'present',
      minutes_attended = EXCLUDED.minutes_attended,
      notes = EXCLUDED.notes,
      updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'watched_percentage', v_calc_percentage,
    'is_fully_watched', v_is_complete OR COALESCE(v_already_completed, false),
    'min_required', v_min_percent,
    'accredited', v_is_complete AND v_allow_attendance
  );
END;
$$;

