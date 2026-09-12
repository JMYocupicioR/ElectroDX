-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Motor de Exámenes Personalizados por Módulo/Tema
-- Banco de preguntas EMG con metadatos clínicos, sesiones de examen,
-- auto-guardado en tiempo real y análisis de brechas de conocimiento.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Tabla Maestra de Preguntas ───────────────────────────────────────────
-- Banco centralizado de preguntas de neurofisiología clínica.
-- Incluye metadatos clínicos ricos: perla, dificultad, preguntas críticas,
-- hallazgos electrodiagnósticos y fuentes bibliográficas.
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Agrupación temática
  island_name TEXT NOT NULL DEFAULT 'EMG',  -- "EMG", "Neuroconducción", etc.
  module_id TEXT NOT NULL,                   -- FK lógica a published_modules.id
  topic_name TEXT NOT NULL,                  -- Nombre del tema (ej. "Reflejo H")
  topic_id TEXT,                             -- FK lógica a published_topics.id (si existe)
  -- Contenido de la pregunta
  stem TEXT NOT NULL,                        -- Viñeta o caso clínico (soporta Markdown)
  findings JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{type, label, value}] hallazgos estructurados
  image_url TEXT,                            -- URL de imagen clínica opcional
  image_alt TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{text, is_correct, feedback}]
  -- Metadatos clínicos
  difficulty INT NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  is_critical BOOLEAN NOT NULL DEFAULT false,   -- Preguntas de alta rentabilidad del Consejo
  pearl TEXT,                                   -- Perla clínica oficial del Consejo COMEFYR
  source_reference TEXT,                        -- Referencia bibliográfica (ej. "EMG.doc pág 12")
  tags TEXT[] DEFAULT '{}',                     -- Etiquetas para búsqueda y filtrado
  -- Estado editorial
  status TEXT NOT NULL DEFAULT 'PUBLISHED'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exam_questions IS
  'Banco maestro de preguntas de electrodiagnóstico para el simulador de exámenes NeuroSAFEMX. Cada pregunta incluye metadatos clínicos completos para analítica de brechas y repetición espaciada.';

-- ─── 2. Sesiones de Examen Completadas ───────────────────────────────────────
-- Historial permanente de cada examen tomado por el alumno.
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Configuración del examen tomado
  mode TEXT NOT NULL
    CHECK (mode IN ('FULL_SIMULATION', 'TOPIC_SPECIFIC', 'CUSTOM', 'FAILED_REVIEW', 'CRITICAL_ONLY')),
  module_id TEXT,                          -- Módulo principal del examen (si aplica)
  selected_topics TEXT[] DEFAULT '{}',     -- Temas seleccionados por el alumno
  question_count_config INT,               -- Cuántas preguntas configuró el alumno (10/20/50/todas)
  feedback_mode TEXT NOT NULL DEFAULT 'immediate'
    CHECK (feedback_mode IN ('immediate', 'end')), -- Modo Tutor vs Modo Examen Real
  time_limit_seconds INT,                  -- null = sin límite de tiempo
  -- Resultados
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  passed BOOLEAN GENERATED ALWAYS AS (score_percentage >= 70) STORED,
  -- Estado y fechas
  status TEXT NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.exam_sessions IS
  'Historial de exámenes completados. Usado para analítica de progreso, cálculo de maestría por tema y detección de brechas de conocimiento.';

-- ─── 3. Respuestas Detalladas por Sesión ─────────────────────────────────────
-- Registro granular de cada respuesta para analítica y revisión posterior.
CREATE TABLE IF NOT EXISTS public.exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  -- Datos denormalizados para analítica rápida
  topic_name TEXT,
  module_id TEXT,
  is_critical BOOLEAN DEFAULT false,
  difficulty INT,
  -- Resultado de esta pregunta
  selected_option_index INT NOT NULL,       -- Índice (0-based) de la opción elegida
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exam_answers IS
  'Registro detallado de cada respuesta en una sesión de examen. Permite desglose analítico por tema, dificultad y criticidad.';

-- ─── 4. Intentos en Curso (Auto-guardado / Crash Recovery) ───────────────────
-- Estado volátil del examen en tiempo real. Se escribe cada 10 segundos
-- y en cada cambio de respuesta. Permite reanudar si el alumno recarga.
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Tipo y configuración del intento
  mode TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- {
  --   topicNames: string[],
  --   moduleId: string,
  --   questionCount: number | null,
  --   timeLimit: number | null,
  --   feedbackMode: 'immediate' | 'end'
  -- }
  -- Preguntas del intento (orden ya aleatorizado)
  question_ids UUID[] NOT NULL,
  -- Estado actual del examen
  current_question_index INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { "uuid": selectedIndex }
  flagged JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { "uuid": true }
  time_remaining_seconds INT,                  -- null si no hay límite de tiempo
  -- Estado del intento
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS'
    CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exam_attempts IS
  'Estado en tiempo real de un examen en curso. Permite recuperar el examen exactamente donde se quedó el alumno ante una recarga o cierre accidental del navegador.';

-- ─── 5. Progreso por Pregunta (Dominio Individual / Repetición Espaciada) ────
-- Seguimiento granular por usuario y pregunta para algoritmo de dominio.
CREATE TABLE IF NOT EXISTS public.user_question_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  -- Estadísticas acumuladas
  attempts INT DEFAULT 0,
  successes INT DEFAULT 0,
  consecutive_correct INT DEFAULT 0,
  is_mastered BOOLEAN DEFAULT false,        -- true si consecutive_correct >= 3
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at TIMESTAMPTZ,               -- Para repetición espaciada futura
  UNIQUE (user_id, question_id)
);

COMMENT ON TABLE public.user_question_progress IS
  'Dominio individual por pregunta. Clave para el algoritmo de repetición espaciada: detectar qué preguntas necesita repasar cada alumno.';

-- ─── 6. Índices de Rendimiento ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exam_questions_module ON public.exam_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_topic ON public.exam_questions(topic_name);
CREATE INDEX IF NOT EXISTS idx_exam_questions_critical ON public.exam_questions(is_critical) WHERE is_critical = true;
CREATE INDEX IF NOT EXISTS idx_exam_questions_difficulty ON public.exam_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_questions_status ON public.exam_questions(status);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON public.exam_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_module ON public.exam_sessions(module_id);

CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON public.exam_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_question ON public.exam_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_status ON public.exam_attempts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_user_question_progress_user ON public.user_question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_progress_mastery ON public.user_question_progress(user_id, is_mastered);

-- ─── 7. Trigger: auto-actualizar updated_at en exam_attempts ─────────────────
CREATE OR REPLACE FUNCTION public.update_exam_attempt_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exam_attempts_updated_at ON public.exam_attempts;
CREATE TRIGGER trg_exam_attempts_updated_at
  BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_exam_attempt_timestamp();

-- ─── 8. Trigger: actualizar progreso al insertar respuestas ──────────────────
CREATE OR REPLACE FUNCTION public.update_question_progress_on_answer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session_user UUID;
BEGIN
  -- Obtener user_id de la sesión
  SELECT user_id INTO v_session_user
  FROM public.exam_sessions
  WHERE id = NEW.session_id;

  IF v_session_user IS NULL THEN RETURN NEW; END IF;

  -- Upsert en user_question_progress
  INSERT INTO public.user_question_progress (user_id, question_id, attempts, successes, consecutive_correct, is_mastered, last_attempt)
  VALUES (
    v_session_user,
    NEW.question_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    false,
    now()
  )
  ON CONFLICT (user_id, question_id) DO UPDATE SET
    attempts = user_question_progress.attempts + 1,
    successes = user_question_progress.successes + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    consecutive_correct = CASE
      WHEN NEW.is_correct THEN user_question_progress.consecutive_correct + 1
      ELSE 0
    END,
    is_mastered = CASE
      WHEN NEW.is_correct THEN (user_question_progress.consecutive_correct + 1) >= 3
      ELSE false
    END,
    last_attempt = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_progress_on_answer ON public.exam_answers;
CREATE TRIGGER trg_update_progress_on_answer
  AFTER INSERT ON public.exam_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_question_progress_on_answer();

-- ─── 9. Función RPC: Analítica de Brechas por Módulo ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_exam_gap_analysis(p_user_id UUID)
RETURNS TABLE (
  topic_name TEXT,
  module_id TEXT,
  total_attempts BIGINT,
  correct_attempts BIGINT,
  accuracy_pct NUMERIC,
  critical_failures BIGINT
)
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    ea.topic_name,
    ea.module_id,
    COUNT(*)                                          AS total_attempts,
    SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END)   AS correct_attempts,
    ROUND(AVG(CASE WHEN ea.is_correct THEN 100.0 ELSE 0 END), 1) AS accuracy_pct,
    SUM(CASE WHEN ea.is_critical AND NOT ea.is_correct THEN 1 ELSE 0 END) AS critical_failures
  FROM public.exam_answers ea
  INNER JOIN public.exam_sessions es ON es.id = ea.session_id
  WHERE es.user_id = p_user_id
    AND es.status = 'COMPLETED'
  GROUP BY ea.topic_name, ea.module_id
  ORDER BY accuracy_pct ASC;
$$;

-- ─── 10. Seguridad (RLS) ──────────────────────────────────────────────────────

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;

-- exam_questions: Legible para alumnos aprobados y contribuidores; escritura para admin/editor
CREATE POLICY "Enrolled users can read exam questions"
  ON public.exam_questions FOR SELECT
  USING (
    status = 'PUBLISHED' AND (
      -- Admin/editor siempre puede leer
      public.has_role('admin') OR public.has_role('editor') OR public.has_role('contributor')
      -- O usuario con matrícula aprobada
      OR public.is_enrolled_physician()
    )
  );

CREATE POLICY "Admins can manage exam questions"
  ON public.exam_questions FOR ALL
  USING (public.has_role('admin') OR public.has_role('editor'));

-- exam_sessions: Solo el propio usuario
CREATE POLICY "Users can view own exam sessions"
  ON public.exam_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam sessions"
  ON public.exam_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam sessions"
  ON public.exam_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam sessions"
  ON public.exam_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins pueden ver todas las sesiones (para analítica)
CREATE POLICY "Admins can view all exam sessions"
  ON public.exam_sessions FOR SELECT
  USING (public.has_role('admin'));

-- exam_answers: Solo el propio usuario (vía sesión)
CREATE POLICY "Users can view own exam answers"
  ON public.exam_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exam_sessions
      WHERE exam_sessions.id = exam_answers.session_id
        AND exam_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exam answers"
  ON public.exam_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exam_sessions
      WHERE exam_sessions.id = session_id
        AND exam_sessions.user_id = auth.uid()
    )
  );

-- exam_attempts: CRUD completo para el propio usuario
CREATE POLICY "Users can view own exam attempts"
  ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam attempts"
  ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam attempts"
  ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam attempts"
  ON public.exam_attempts FOR DELETE USING (auth.uid() = user_id);

-- user_question_progress: CRUD para el propio usuario
CREATE POLICY "Users can view own question progress"
  ON public.user_question_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question progress"
  ON public.user_question_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question progress"
  ON public.user_question_progress FOR UPDATE USING (auth.uid() = user_id);
