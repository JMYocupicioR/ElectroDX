-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Columna usage_mode para Diferenciación de Casos (Práctica vs Examen)
-- Permite separar preguntas reservadas para evaluación oficial de las de aprendizaje libre.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.emg_case_templates
ADD COLUMN IF NOT EXISTS usage_mode TEXT NOT NULL DEFAULT 'practice'
CHECK (usage_mode IN ('practice', 'exam_only', 'both'));

COMMENT ON COLUMN public.emg_case_templates.usage_mode IS 'Destino del caso: practice (aprendizaje libre), exam_only (banco de exámenes protegido), both (ambos)';

CREATE INDEX IF NOT EXISTS idx_emg_cases_usage_mode ON public.emg_case_templates(usage_mode);
