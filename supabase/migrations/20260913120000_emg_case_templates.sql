-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Tabla de Plantillas de Casos Clínicos EMG (Modo Ejercicio)
-- Permite al Administrador y Editores crear, actualizar y gestionar casos dinámicos.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.emg_case_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id TEXT UNIQUE NOT NULL,
  pattern_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'normal', 'axonal', 'demyelinating', 'myopathic', 'entrapment',
    'radiculopathy', 'plexopathy', 'motor_neuron_disease', 'neuromuscular_junction', 'pitfall'
  )),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  patient JSONB NOT NULL,
  ncs JSONB NOT NULL DEFAULT '[]'::jsonb,
  emg JSONB NOT NULL DEFAULT '[]'::jsonb,
  rns JSONB,
  late_responses JSONB,
  skin_temperature NUMERIC(4,1)[],
  technical_notes TEXT[] DEFAULT '{}',
  is_pitfall BOOLEAN DEFAULT false,
  pitfall_explanation TEXT,
  severity_grade TEXT DEFAULT 'moderate' CHECK (severity_grade IN ('mild', 'moderate', 'severe', 'very_severe')),
  severity_explanation TEXT,
  explanation TEXT NOT NULL,
  differentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations TEXT[] DEFAULT '{}',
  hints TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.emg_case_templates IS 'Plantillas de casos clínicos interactivos de EMG gestionadas por el cuerpo docente';

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_emg_cases_category ON public.emg_case_templates(category);
CREATE INDEX IF NOT EXISTS idx_emg_cases_status ON public.emg_case_templates(status);
CREATE INDEX IF NOT EXISTS idx_emg_cases_pattern ON public.emg_case_templates(pattern_id);

-- Habilitar RLS
ALTER TABLE public.emg_case_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad RLS
CREATE POLICY "emg_cases_select_published" ON public.emg_case_templates
  FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin() OR public.is_editor());

CREATE POLICY "emg_cases_admin_manage" ON public.emg_case_templates
  FOR ALL USING (public.is_admin() OR public.is_editor());
