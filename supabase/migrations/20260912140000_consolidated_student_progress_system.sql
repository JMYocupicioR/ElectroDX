-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Sistema Consolidado de Progreso, Asignaciones y Sincronización
-- Ejecutar en el Editor SQL de Supabase (Dashboard -> SQL Editor -> Run)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Ampliación de columnas en public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subspecialty TEXT,
  ADD COLUMN IF NOT EXISTS specialty_cedula TEXT,
  ADD COLUMN IF NOT EXISTS cmmr_certified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cmmr_number TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS orcid_id TEXT,
  ADD COLUMN IF NOT EXISTS clinical_interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS completed_topics TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.subspecialty IS 'Subespecialidad o alta especialidad médica (ej. Electrodiagnóstico y Neuromuscular)';
COMMENT ON COLUMN public.profiles.specialty_cedula IS 'Cédula profesional de especialista expedida por la SEP';
COMMENT ON COLUMN public.profiles.cmmr_certified IS 'Certificación vigente ante el Consejo Mexicano de Medicina de Rehabilitación';
COMMENT ON COLUMN public.profiles.admin_notes IS 'Notas académicas y docentes confidenciales de la dirección sobre el alumno';
COMMENT ON COLUMN public.profiles.completed_topics IS 'Array con IDs de temas y lecciones completadas por el alumno en el currículo';

-- 2. Tabla de Planes de Estudio Personalizados
CREATE TABLE IF NOT EXISTS public.student_learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority_modules TEXT[] DEFAULT '{}',
  priority_topics TEXT[] DEFAULT '{}',
  target_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Asignaciones (Exámenes y Tareas Calendarizadas)
CREATE TABLE IF NOT EXISTS public.student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.student_learning_plans(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam', 'clinical_case', 'reading', 'emg_report', 'practical_task')),
  description TEXT NOT NULL,
  target_module_id TEXT,
  target_topic_id TEXT,
  target_exam_config JSONB DEFAULT '{}'::jsonb,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'needs_revision', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  min_score NUMERIC(5,2),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  student_notes TEXT,
  submission_url TEXT,
  grade NUMERIC(5,2),
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla de Registro de Actividad y Logins del Alumno
CREATE TABLE IF NOT EXISTS public.student_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla Relacional de Temas Completados con Marca de Tiempo
CREATE TABLE IF NOT EXISTS public.student_completed_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  module_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- 6. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_student_plans_user ON public.student_learning_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_user ON public.student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON public.student_assignments(status);
CREATE INDEX IF NOT EXISTS idx_student_assignments_due ON public.student_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_student_activity_user_date ON public.student_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_user ON public.student_completed_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_topic ON public.student_completed_topics(topic_id);

-- 7. Seguridad (RLS)
ALTER TABLE public.student_learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_completed_topics ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para student_learning_plans
DROP POLICY IF EXISTS "student_plans_select" ON public.student_learning_plans;
CREATE POLICY "student_plans_select" ON public.student_learning_plans
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_plans_admin_manage" ON public.student_learning_plans;
CREATE POLICY "student_plans_admin_manage" ON public.student_learning_plans
  FOR ALL USING (public.is_admin() OR public.is_editor());

-- Políticas de RLS para student_assignments
DROP POLICY IF EXISTS "student_assignments_select" ON public.student_assignments;
CREATE POLICY "student_assignments_select" ON public.student_assignments
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_assignments_admin_manage" ON public.student_assignments;
CREATE POLICY "student_assignments_admin_manage" ON public.student_assignments
  FOR ALL USING (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_assignments_submit" ON public.student_assignments;
CREATE POLICY "student_assignments_submit" ON public.student_assignments
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Políticas de RLS para student_activity_logs
DROP POLICY IF EXISTS "student_activity_select" ON public.student_activity_logs;
CREATE POLICY "student_activity_select" ON public.student_activity_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_activity_insert" ON public.student_activity_logs;
CREATE POLICY "student_activity_insert" ON public.student_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

-- Políticas de RLS para student_completed_topics
DROP POLICY IF EXISTS "student_completed_topics_select" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_select" ON public.student_completed_topics
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "student_completed_topics_insert" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_insert" ON public.student_completed_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "student_completed_topics_delete" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_delete" ON public.student_completed_topics
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "student_completed_topics_update" ON public.student_completed_topics;
CREATE POLICY "student_completed_topics_update" ON public.student_completed_topics
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
