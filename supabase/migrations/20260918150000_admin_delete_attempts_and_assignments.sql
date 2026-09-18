-- ============================================================================
-- Migración: Políticas y funciones seguras para eliminación de historial
-- de intentos de examen y tareas asignadas por docentes y administradores
-- 2026-09-18
-- ============================================================================

-- 1. Permitir eliminación administrativa de intentos de examen (quiz_attempts)
GRANT DELETE ON public.quiz_attempts TO authenticated;

DROP POLICY IF EXISTS "quiz_attempts_admin_delete" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_admin_delete" ON public.quiz_attempts FOR DELETE
  USING (public.is_admin() OR public.is_editor());

-- Función RPC segura para eliminar intentos de examen
CREATE OR REPLACE FUNCTION public.admin_delete_quiz_attempt(p_attempt_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores o docentes pueden eliminar intentos de examen.';
  END IF;

  DELETE FROM public.quiz_attempts WHERE id = p_attempt_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_quiz_attempt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_quiz_attempt(uuid) TO authenticated;

-- 2. Función RPC segura para eliminar asignaciones y tareas (student_assignments)
CREATE OR REPLACE FUNCTION public.admin_delete_student_assignment(p_assignment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Acceso denegado: solo administradores o docentes pueden eliminar tareas asignadas.';
  END IF;

  DELETE FROM public.student_assignments WHERE id = p_assignment_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_student_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_student_assignment(uuid) TO authenticated;
