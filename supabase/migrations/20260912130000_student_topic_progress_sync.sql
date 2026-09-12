-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Sincronización y Persistencia de Progreso de Temas en Base de Datos
-- Guarda en Supabase los temas completados por alumno para que el panel de
-- administración y el dashboard de estudiante estén 100% sincronizados.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Columna completed_topics en public.profiles para lecturas rápidas
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS completed_topics TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.completed_topics IS 'Array con IDs de temas y lecciones completadas por el alumno en el currículo';

-- 2. Tabla relacional de temas completados por alumno con timestamp y módulo
CREATE TABLE IF NOT EXISTS public.student_completed_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  module_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

COMMENT ON TABLE public.student_completed_topics IS 'Registro histórico de lecciones y temas marcados como completados por alumnos';

-- 3. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_user ON public.student_completed_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_topic ON public.student_completed_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_date ON public.student_completed_topics(completed_at DESC);

-- 4. Políticas de Seguridad RLS
ALTER TABLE public.student_completed_topics ENABLE ROW LEVEL SECURITY;

-- Lectura: el propio alumno puede ver sus temas, y los directores/administradores pueden ver el de todos
DROP POLICY IF EXISTS "student_completed_topics_select" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_select" ON public.student_completed_topics
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

-- Inserción: el alumno marca tema completado o el docente
DROP POLICY IF EXISTS "student_completed_topics_insert" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_insert" ON public.student_completed_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Eliminación: el alumno desmarca tema o el docente
DROP POLICY IF EXISTS "student_completed_topics_delete" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_delete" ON public.student_completed_topics
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Actualización: administradores
DROP POLICY IF EXISTS "student_completed_topics_update" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_update" ON public.student_completed_topics
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
