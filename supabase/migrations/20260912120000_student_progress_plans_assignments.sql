-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Sistema Integral de Gestión de Progreso Estudiantil
-- Planes de estudio personalizados, asignaciones calendarizadas,
-- auditoría de logins y ampliación de expediente curricular médico.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Ampliación de columnas curriculares y notas académicas en public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subspecialty TEXT,
  ADD COLUMN IF NOT EXISTS specialty_cedula TEXT,
  ADD COLUMN IF NOT EXISTS cmmr_certified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cmmr_number TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS orcid_id TEXT,
  ADD COLUMN IF NOT EXISTS clinical_interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

COMMENT ON COLUMN public.profiles.subspecialty IS 'Subespecialidad o alta especialidad médica (ej. Electrodiagnóstico y Neuromuscular)';
COMMENT ON COLUMN public.profiles.specialty_cedula IS 'Cédula profesional de especialista expedida por la SEP';
COMMENT ON COLUMN public.profiles.cmmr_certified IS 'Certificación vigente ante el Consejo Mexicano de Medicina de Rehabilitación';
COMMENT ON COLUMN public.profiles.admin_notes IS 'Notas académicas y docentes confidenciales de la dirección sobre el alumno';

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

COMMENT ON TABLE public.student_learning_plans IS 'Planes de estudio personalizados creados por docentes para alumnos específicos';

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
  -- Entrega del alumno
  submitted_at TIMESTAMPTZ,
  student_notes TEXT,
  submission_url TEXT,
  -- Evaluación docente
  grade NUMERIC(5,2),
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_assignments IS 'Tareas y exámenes calendarizados asignados por profesores con fecha límite de entrega';

-- 4. Tabla de Registro de Actividad y Logins del Alumno
CREATE TABLE IF NOT EXISTS public.student_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'user_login', 'topic_completed', 'quiz_submitted', 'assignment_submitted', etc.
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_activity_logs IS 'Bitácora granular de actividad, ingresos y rachas de estudio del alumno';

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_student_plans_user ON public.student_learning_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_user ON public.student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON public.student_assignments(status);
CREATE INDEX IF NOT EXISTS idx_student_assignments_due ON public.student_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_student_activity_user_date ON public.student_activity_logs(user_id, created_at DESC);

-- 6. Seguridad (RLS)
ALTER TABLE public.student_learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para student_learning_plans
CREATE POLICY "student_plans_select" ON public.student_learning_plans
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin() OR public.is_editor());

CREATE POLICY "student_plans_admin_manage" ON public.student_learning_plans
  FOR ALL USING (public.is_admin() OR public.is_editor());

-- Políticas de RLS para student_assignments
CREATE POLICY "student_assignments_select" ON public.student_assignments
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin() OR public.is_editor());

CREATE POLICY "student_assignments_student_submit" ON public.student_assignments
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "student_assignments_admin_manage" ON public.student_assignments
  FOR ALL USING (public.is_admin() OR public.is_editor());

-- Políticas de RLS para student_activity_logs
CREATE POLICY "student_activity_select" ON public.student_activity_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR public.is_editor());

CREATE POLICY "student_activity_insert" ON public.student_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
