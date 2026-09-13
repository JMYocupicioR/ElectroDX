-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Sistema de Calificaciones, Calendarización y Asistencias
-- Hitos curriculares con checklist de temas por fecha, ponderación personalizable
-- y registro de asistencia para generación de Kardex Académico Oficial.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Tabla de Configuración de Rúbricas y Ponderación del Gradebook
CREATE TABLE IF NOT EXISTS public.academic_rubric_configs (
  id TEXT PRIMARY KEY DEFAULT 'default_rubric_2026',
  title TEXT NOT NULL DEFAULT 'Criterios de Evaluación Oficial COMEFYR 2026',
  min_passing_grade NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  rubrics JSONB NOT NULL DEFAULT '[
    {"id": "exams", "name": "Exámenes y Quizzes Teóricos", "weight": 30, "enabled": true, "description": "Promedio de evaluaciones y simulaciones clínicas"},
    {"id": "assignments", "name": "Tareas y Casos Prácticos", "weight": 30, "enabled": true, "description": "Reportes EMG, casos clínicos y tareas entregadas"},
    {"id": "attendance", "name": "Asistencia a Clases y Talleres", "weight": 20, "enabled": true, "description": "Puntualidad y asistencia a sesiones síncronas en vivo"},
    {"id": "curriculum", "name": "Avance Curricular en Plataforma", "weight": 20, "enabled": true, "description": "Checklist de temas vistos y completados en temario"}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Tabla de Hitos de Calendarización Académica (Milestones & Checklist)
CREATE TABLE IF NOT EXISTS public.academic_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id TEXT NOT NULL DEFAULT '2026-general',
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  target_topic_ids TEXT[] NOT NULL DEFAULT '{}',
  target_quiz_ids TEXT[] DEFAULT '{}',
  target_assignment_ids UUID[] DEFAULT '{}',
  passing_grade NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Asistencias a Clases y Talleres
CREATE TABLE IF NOT EXISTS public.class_attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES public.live_workshops(id) ON DELETE SET NULL,
  session_title TEXT NOT NULL,
  session_date DATE NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'excused', 'absent')),
  minutes_attended INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_student_session UNIQUE (student_id, session_title, session_date)
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.academic_rubric_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendances ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura para usuarios autenticados
CREATE POLICY "academic_rubric_configs_read"
  ON public.academic_rubric_configs FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "academic_milestones_read"
  ON public.academic_milestones FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "class_attendances_read_own_or_admin"
  ON public.class_attendances FOR SELECT
  TO authenticated USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'committee_chair'))
  );

-- Políticas de escritura para administradores y docentes
CREATE POLICY "academic_rubric_configs_admin_write"
  ON public.academic_rubric_configs FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'committee_chair'))
  );

CREATE POLICY "academic_milestones_admin_write"
  ON public.academic_milestones FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'committee_chair'))
  );

CREATE POLICY "class_attendances_admin_write"
  ON public.class_attendances FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'committee_chair'))
  );
