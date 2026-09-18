-- ============================================================================
-- Migración: Unificación de Asistencias, Catálogo de Talleres y Kardex
-- 2026-09-17
-- ============================================================================

-- 1. Agregar campos de control académico a live_workshops
ALTER TABLE public.live_workshops
  ADD COLUMN IF NOT EXISTS counts_for_kardex BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'workshop_online',
  ADD COLUMN IF NOT EXISTS session_modality TEXT NOT NULL DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS attendance_closed BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'live_workshops_session_modality_check'
  ) THEN
    ALTER TABLE public.live_workshops
      ADD CONSTRAINT live_workshops_session_modality_check
      CHECK (session_modality IN ('in_person', 'online'));
  END IF;
END $$;

COMMENT ON COLUMN public.live_workshops.counts_for_kardex IS
  'Indica si esta sesión computa dentro de la rúbrica de asistencia (20%) del Kardex.';
COMMENT ON COLUMN public.live_workshops.session_type IS
  'Tipo de sesión: workshop_online, hands_on_presencial, masterclass, clinical_round.';
COMMENT ON COLUMN public.live_workshops.attendance_closed IS
  'Indica si el pase de lista oficial ha sido concluido y auditado por la coordinación.';

-- 2. Enriquecer class_attendances con auditoría y justificación
ALTER TABLE public.class_attendances
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS excuse_reason TEXT;

COMMENT ON COLUMN public.class_attendances.recorded_by IS
  'Usuario docente o administrador que asentó o modificó el pase de lista.';
COMMENT ON COLUMN public.class_attendances.excuse_reason IS
  'Motivo clínico o institucional de una falta justificada (ej. guardia médica, incapacidad).';

-- 3. Índice único parcial para evitar duplicados por taller y cursista
CREATE UNIQUE INDEX IF NOT EXISTS uq_class_attendances_student_workshop
  ON public.class_attendances (student_id, workshop_id)
  WHERE workshop_id IS NOT NULL;
