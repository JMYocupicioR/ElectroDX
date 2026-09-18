-- ============================================================================
-- Migración: Eliminación administrativa de cursos y limpieza de curso 'referencia'
-- 2026-09-18
-- ============================================================================

-- 1. Asegurar que la referencia de constancias no bloquee la eliminación de cursos
ALTER TABLE public.academic_certificates
  DROP CONSTRAINT IF EXISTS academic_certificates_course_id_fkey;

ALTER TABLE public.academic_certificates
  ADD CONSTRAINT academic_certificates_course_id_fkey
  FOREIGN KEY (course_id)
  REFERENCES public.courses(id)
  ON DELETE SET NULL;

-- 2. Función RPC para eliminar un curso de forma segura verificando rol administrativo
CREATE OR REPLACE FUNCTION public.admin_delete_course(
  p_course_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_is_staff BOOLEAN := false;
  v_course_title TEXT;
  v_modules_count INT := 0;
  v_enrollments_count INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para realizar esta acción.';
  END IF;

  -- Verificar si el usuario es admin o editor
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = v_uid
      AND ur.role IN ('admin', 'editor')
  ) INTO v_is_staff;

  IF NOT v_is_staff THEN
    RAISE EXCEPTION 'No tiene permisos de administrador o editor para eliminar cursos.';
  END IF;

  -- Obtener información del curso antes de eliminar
  SELECT title INTO v_course_title
  FROM public.courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El curso "%" no existe en el catálogo.', p_course_id;
  END IF;

  SELECT count(*) INTO v_modules_count
  FROM public.course_modules
  WHERE course_id = p_course_id;

  SELECT count(*) INTO v_enrollments_count
  FROM public.course_enrollments
  WHERE course_id = p_course_id;

  -- 1. Desvincular constancias previas fijando course_id en NULL
  UPDATE public.academic_certificates
  SET course_id = NULL
  WHERE course_id = p_course_id;

  -- 2. Eliminar asignaciones de módulos (pasan a ser no asignados)
  DELETE FROM public.course_modules
  WHERE course_id = p_course_id;

  -- 3. Eliminar inscripciones del curso
  DELETE FROM public.course_enrollments
  WHERE course_id = p_course_id;

  -- 4. Eliminar el registro del curso
  DELETE FROM public.courses
  WHERE id = p_course_id;

  RETURN jsonb_build_object(
    'success', true,
    'course_id', p_course_id,
    'title', v_course_title,
    'unassigned_modules_count', v_modules_count,
    'deleted_enrollments_count', v_enrollments_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_course(TEXT) TO authenticated;

-- 3. Limpieza automática del curso 'referencia' obsoleto si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.courses WHERE id = 'referencia') THEN
    -- Desasignar módulos del curso referencia
    DELETE FROM public.course_modules WHERE course_id = 'referencia';
    -- Eliminar inscripciones huérfanas si las hubiera
    DELETE FROM public.course_enrollments WHERE course_id = 'referencia';
    -- Desvincular constancias
    UPDATE public.academic_certificates SET course_id = NULL WHERE course_id = 'referencia';
    -- Eliminar curso de la tabla
    DELETE FROM public.courses WHERE id = 'referencia';
  END IF;
END $$;
