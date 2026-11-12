-- ============================================================================
-- MIGRACIÓN: SISTEMA DE CONTEO REAL DE PARTICIPACIÓN, LOGS LEGALES INMUTABLES
--            Y ACTA DE CRÉDITOS (CONTRATO CL. 1-11 Y REGLAMENTO ART. 1-17)
-- ============================================================================

-- 1. Ampliar columnas de trazabilidad en tablas existentes
ALTER TABLE public.published_topics
  ADD COLUMN IF NOT EXISTS last_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_static_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS baseline_word_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clean_word_count INT NOT NULL DEFAULT 0;

ALTER TABLE public.published_modules
  ADD COLUMN IF NOT EXISTS last_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.published_quizzes
  ADD COLUMN IF NOT EXISTS last_reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Autoría granular por reactivo individual (Reglamento Art. 10: Reactivo publicado = 1 unidad)
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS stable_question_key TEXT,
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_system_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_quiz_questions_author_id ON public.quiz_questions(author_id);

ALTER TABLE public.exam_questions
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_system_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_for_editorial_units BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_exam_questions_author_id ON public.exam_questions(author_id);

-- Protección de línea base y coautoría en Casos Clínicos EMG (Reglamento Art. 10: Caso = 2 unidades)
ALTER TABLE public.emg_case_templates
  ADD COLUMN IF NOT EXISTS is_system_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS edition_label TEXT DEFAULT '1.0';

CREATE INDEX IF NOT EXISTS idx_emg_case_templates_created_by ON public.emg_case_templates(created_by);

-- Validación formal de Dirección Académica y duración en Docencia (Contrato Cl. 6 y Reglamento Art. 13-14)
ALTER TABLE public.live_workshops
  ADD COLUMN IF NOT EXISTS edition_label TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS actual_duration_seconds INT,
  ADD COLUMN IF NOT EXISTS recording_duration_seconds INT,
  ADD COLUMN IF NOT EXISTS computable_session_value NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS material_delivered BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recording_available BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS validated_by_direction UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validation_notes TEXT;

ALTER TABLE public.workshop_instructors
  ADD COLUMN IF NOT EXISTS session_share NUMERIC(4,3) NOT NULL DEFAULT 1.000
    CHECK (session_share > 0 AND session_share <= 1.000);

-- ============================================================================
-- 2. TABLA DE BITÁCORA LEGAL INMUTABLE DE PARTICIPACIÓN (participation_audit_logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.participation_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  edition_label TEXT NOT NULL DEFAULT '1.0',
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  marked_role_at_event TEXT CHECK (marked_role_at_event IS NULL OR marked_role_at_event IN ('profesor', 'editor', 'ambos')),
  bag_category TEXT NOT NULL CHECK (bag_category IN ('docencia', 'obra', 'editorial', 'excluded', 'governance')),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  module_id TEXT,
  topic_id TEXT,
  delta_words INT NOT NULL DEFAULT 0,
  surviving_words_after INT,
  delta_editorial_units NUMERIC(6,2) NOT NULL DEFAULT 0,
  delta_sessions NUMERIC(6,2) NOT NULL DEFAULT 0,
  duration_seconds INT,
  is_orthographic_only BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_reason TEXT,
  legal_clause_ref TEXT NOT NULL,
  payload_sha256 TEXT,
  diff_summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_participation_audit_logs_occurred_at
  ON public.participation_audit_logs (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_participation_audit_logs_author_id
  ON public.participation_audit_logs (author_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_participation_audit_logs_bag
  ON public.participation_audit_logs (bag_category, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_participation_audit_logs_topic
  ON public.participation_audit_logs (topic_id, occurred_at DESC);

ALTER TABLE public.participation_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff y autor leen logs de participacion" ON public.participation_audit_logs;
CREATE POLICY "Staff y autor leen logs de participacion"
  ON public.participation_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_editor()
    OR auth.uid() = author_id
    OR auth.uid() = actor_id
  );

DROP POLICY IF EXISTS "Usuarios autenticados insertan logs de participacion" ON public.participation_audit_logs;
CREATE POLICY "Usuarios autenticados insertan logs de participacion"
  ON public.participation_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = actor_id
    OR public.is_admin()
    OR public.is_editor()
  );

-- Candado de inmutabilidad: la bitácora legal es append-only (no permite UPDATE ni DELETE)
CREATE OR REPLACE FUNCTION public.prevent_participation_log_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'La bitácora legal de participación (participation_audit_logs) es inmutable y no permite modificaciones ni borrados.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_participation_log_mutation ON public.participation_audit_logs;
CREATE TRIGGER trg_prevent_participation_log_mutation
  BEFORE UPDATE OR DELETE ON public.participation_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_participation_log_mutation();

GRANT SELECT, INSERT ON public.participation_audit_logs TO authenticated;

-- ============================================================================
-- 3. TABLA DE ACTIVOS MULTIMEDIA Y GRÁFICOS CON AUTORÍA Y DURACIÓN (Escenarios 5 y 6)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.topic_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'pdf', 'video', 'emg_trace')),
  url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  duration_seconds INT CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  is_own_authored_figure BOOLEAN NOT NULL DEFAULT TRUE,
  counts_as_docencia_session_id UUID REFERENCES public.live_workshops(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_topic_media_assets_topic ON public.topic_media_assets(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_media_assets_uploader ON public.topic_media_assets(uploaded_by);

ALTER TABLE public.topic_media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de activos multimedia" ON public.topic_media_assets;
CREATE POLICY "Lectura publica de activos multimedia"
  ON public.topic_media_assets
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Colaboradores registran activos multimedia" ON public.topic_media_assets;
CREATE POLICY "Colaboradores registran activos multimedia"
  ON public.topic_media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by
    OR public.is_admin()
    OR public.is_editor()
  );

GRANT SELECT, INSERT, UPDATE ON public.topic_media_assets TO authenticated;

-- ============================================================================
-- 4. TABLA DE TAREAS DE CONFIGURACIÓN POR ESCRITO (Reglamento Art. 10 = 1 Unidad)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.editorial_config_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_label TEXT NOT NULL DEFAULT '1.0',
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  written_brief TEXT NOT NULL,
  deliverable_reference TEXT,
  editorial_units NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (editorial_units = 1.00),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'submitted', 'closed_by_direction', 'cancelled')),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_by_direction UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  direction_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_editorial_config_tasks_assigned_to ON public.editorial_config_tasks(assigned_to);

ALTER TABLE public.editorial_config_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de tareas de configuracion" ON public.editorial_config_tasks;
CREATE POLICY "Lectura de tareas de configuracion"
  ON public.editorial_config_tasks
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_editor()
    OR auth.uid() = assigned_to
  );

DROP POLICY IF EXISTS "Admin gestiona tareas de configuracion" ON public.editorial_config_tasks;
CREATE POLICY "Admin gestiona tareas de configuracion"
  ON public.editorial_config_tasks
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE ON public.editorial_config_tasks TO authenticated;

-- ============================================================================
-- 5. TABLA DE ATRIBUCIÓN DE PALABRAS POR TEMA Y AUTOR (Reglamento Art. 5, 6, 7 y 8)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.topic_word_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_label TEXT NOT NULL DEFAULT '1.0',
  topic_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_platform_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  surviving_words INT NOT NULL DEFAULT 0 CHECK (surviving_words >= 0),
  total_topic_authored_words INT NOT NULL DEFAULT 0,
  total_topic_all_words INT NOT NULL DEFAULT 0,
  author_share_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  is_principal_author BOOLEAN NOT NULL DEFAULT FALSE,
  author_rank INT NOT NULL DEFAULT 99,
  orthographic_edits_ignored INT NOT NULL DEFAULT 0,
  source_revision_ids UUID[] NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (edition_label, topic_id, author_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_word_attributions_topic
  ON public.topic_word_attributions (edition_label, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_word_attributions_author
  ON public.topic_word_attributions (edition_label, author_id);

ALTER TABLE public.topic_word_attributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de atribuciones de palabras" ON public.topic_word_attributions;
CREATE POLICY "Lectura de atribuciones de palabras"
  ON public.topic_word_attributions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Staff actualiza atribuciones de palabras" ON public.topic_word_attributions;
CREATE POLICY "Staff actualiza atribuciones de palabras"
  ON public.topic_word_attributions
  FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.topic_word_attributions TO authenticated;

-- ============================================================================
-- 6. TABLAS DEL ACTA DE CRÉDITOS POR EDICIÓN (Contrato Cl. 10 y Reglamento Art. 3 y 16)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edition_credit_acts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_label TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'notified', 'final_frozen')),
  total_computable_sessions NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_published_words INT NOT NULL DEFAULT 0,
  total_editorial_units NUMERIC(8,2) NOT NULL DEFAULT 0,
  docencia_pool_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  obra_pool_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  editorial_pool_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  snapshot_sha256 TEXT NOT NULL,
  frozen_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notified_at TIMESTAMPTZ,
  objection_deadline_at TIMESTAMPTZ,
  frozen_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.edition_credit_act_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  act_id UUID NOT NULL REFERENCES public.edition_credit_acts(id) ON DELETE CASCADE,
  physician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  agreement_folio TEXT,
  marked_role TEXT NOT NULL CHECK (marked_role IN ('profesor', 'editor', 'ambos', 'sin_convenio')),
  -- Bolsa 1: Docencia (Cláusula 6)
  validated_sessions NUMERIC(8,2) NOT NULL DEFAULT 0,
  computable_sessions NUMERIC(8,2) NOT NULL DEFAULT 0,
  docencia_share_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  docencia_payout_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Bolsa 2: Obra (Cláusula 7)
  raw_surviving_words INT NOT NULL DEFAULT 0,
  computable_words INT NOT NULL DEFAULT 0,
  obra_share_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  obra_payout_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  principal_author_topic_ids TEXT[] NOT NULL DEFAULT '{}',
  coauthor_topic_ids TEXT[] NOT NULL DEFAULT '{}',
  -- Bolsa 3: Labor Editorial (Cláusula 8 y Art. 10)
  published_quiz_questions INT NOT NULL DEFAULT 0,
  published_clinical_cases INT NOT NULL DEFAULT 0,
  closed_config_tasks INT NOT NULL DEFAULT 0,
  raw_editorial_units NUMERIC(8,2) NOT NULL DEFAULT 0,
  computable_editorial_units NUMERIC(8,2) NOT NULL DEFAULT 0,
  editorial_share_pct NUMERIC(6,3) NOT NULL DEFAULT 0,
  editorial_payout_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Total
  total_payout_mxn NUMERIC(12,2) NOT NULL DEFAULT 0,
  breakdown_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (act_id, physician_id)
);

ALTER TABLE public.edition_credit_acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edition_credit_act_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de actas de creditos" ON public.edition_credit_acts;
CREATE POLICY "Lectura de actas de creditos"
  ON public.edition_credit_acts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin gestiona actas de creditos" ON public.edition_credit_acts;
CREATE POLICY "Admin gestiona actas de creditos"
  ON public.edition_credit_acts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Lectura de items de acta de creditos" ON public.edition_credit_act_items;
CREATE POLICY "Lectura de items de acta de creditos"
  ON public.edition_credit_act_items
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_editor()
    OR auth.uid() = physician_id
  );

DROP POLICY IF EXISTS "Admin gestiona items de acta de creditos" ON public.edition_credit_act_items;
CREATE POLICY "Admin gestiona items de acta de creditos"
  ON public.edition_credit_act_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.edition_credit_acts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edition_credit_act_items TO authenticated;

-- ============================================================================
-- 7. FUNCIÓN HELPER PARA CONSULTAR EL ROL FIRMADO EN EL ANEXO (Cláusula 2)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_physician_marked_role(
  p_user_id UUID,
  p_edition_label TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pa.marked_role
  FROM public.physician_agreements pa
  WHERE pa.user_id = p_user_id
    AND pa.document_type = 'anexo'
    AND pa.marked_role IS NOT NULL
    AND (p_edition_label IS NULL OR pa.document_version = p_edition_label)
  ORDER BY pa.signed_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_physician_marked_role(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 8. CORRECCIÓN DE review_revision: AUTORÍA REAL (rev.author_id), PRESERVACIÓN
--    DE AUTORES POR PREGUNTA EN QUIZ, REFERENCIAS EN MEDIA Y BITÁCORA LEGAL
-- ============================================================================
DROP FUNCTION IF EXISTS public.review_revision(UUID, public.revision_status, TEXT);

CREATE OR REPLACE FUNCTION public.review_revision(
  revision_id UUID,
  new_status public.revision_status,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rev public.content_revisions;
  v_target_topic_id TEXT;
  v_target_module_id TEXT;
  p JSONB;
  v_rev_type TEXT;
  v_quiz_id UUID;
  q_item JSONB;
  q_order INT := 0;
  q_count INT := 0;
  v_media JSONB;
  v_author_role TEXT;
  v_existing_authors JSONB;
  v_q_key TEXT;
  v_q_author UUID;
  v_q_baseline BOOLEAN;
  v_q_created TIMESTAMPTZ;
  v_new_questions_count INT := 0;
BEGIN
  IF NOT public.is_admin() AND NOT public.has_role('editor') THEN
    RAISE EXCEPTION 'No autorizado para revisar contenido';
  END IF;

  IF new_status NOT IN ('approved', 'rejected', 'changes_requested') THEN
    RAISE EXCEPTION 'Estado de revisión inválido';
  END IF;

  SELECT * INTO rev
  FROM public.content_revisions
  WHERE id = revision_id AND status = 'pending_review';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada o no está pendiente';
  END IF;

  UPDATE public.content_revisions
  SET
    status = new_status,
    reviewer_id = auth.uid(),
    review_notes = notes,
    reviewed_at = now()
  WHERE id = revision_id;

  v_author_role := public.get_physician_marked_role(rev.author_id, NULL);

  IF new_status = 'approved' THEN
    p := rev.payload;
    v_rev_type := COALESCE(p->>'revisionType', 'topic');

    -- ── RAMA 1: MÓDULO ────────────────────────────────────────────────────────
    IF v_rev_type = 'module' THEN
      v_target_module_id := COALESCE(p->>'id', rev.module_id);
      IF rev.action = 'delete' THEN
        DELETE FROM public.published_modules WHERE id = v_target_module_id;
      ELSE
        INSERT INTO public.published_modules (
          id, number, title, title_en, emoji, description, description_en,
          color, icon, sort_order, version, published_at, published_by,
          last_edited_by, last_reviewed_by, source_revision_id
        ) VALUES (
          v_target_module_id,
          COALESCE((p->>'number')::int, 99),
          COALESCE(NULLIF(p->>'title', ''), 'Módulo sin título'),
          p->>'titleEn',
          COALESCE(p->>'emoji', '📚'),
          p->>'description',
          p->>'descriptionEn',
          COALESCE(p->>'color', 'from-blue-500 to-indigo-600'),
          COALESCE(p->>'icon', 'BookOpen'),
          COALESCE((p->>'sortOrder')::int, 0),
          1,
          now(),
          rev.author_id,
          rev.author_id,
          auth.uid(),
          revision_id
        )
        ON CONFLICT (id) DO UPDATE SET
          number = EXCLUDED.number,
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          emoji = EXCLUDED.emoji,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order,
          version = public.published_modules.version + 1,
          published_at = now(),
          last_edited_by = rev.author_id,
          last_reviewed_by = auth.uid(),
          source_revision_id = revision_id;
      END IF;

      INSERT INTO public.participation_audit_logs (
        actor_id, author_id, marked_role_at_event, bag_category, action_type,
        entity_type, entity_id, module_id,
        legal_clause_ref, diff_summary, metadata
      ) VALUES (
        auth.uid(), rev.author_id, v_author_role, 'excluded', 'module_container_published',
        'published_module', v_target_module_id, v_target_module_id,
        'Reglamento Editorial Art. 6 (Estructura/contenedor de módulo no genera palabras por sí solo)',
        'Publicación o edición de cabecera de módulo: ' || COALESCE(p->>'title', v_target_module_id),
        jsonb_build_object('revision_id', revision_id, 'reviewer_id', auth.uid())
      );

    -- ── RAMA 2: CUESTIONARIO (QUIZ) ───────────────────────────────────────────
    ELSIF v_rev_type = 'quiz' THEN
      v_target_topic_id := COALESCE(p->>'quizTopicId', rev.target_topic_id, rev.module_id);

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_quizzes WHERE topic_id = v_target_topic_id;
      ELSE
        IF p->'questions' IS NOT NULL AND jsonb_typeof(p->'questions') = 'array' THEN
          q_count := jsonb_array_length(p->'questions');
        ELSE
          q_count := 0;
        END IF;

        -- CORREGIDO: last_edited_by recibe rev.author_id y last_reviewed_by recibe auth.uid()
        INSERT INTO public.published_quizzes (
          topic_id, module_id, title, pass_score, max_attempts,
          shuffle_questions, shuffle_options, question_count,
          version, published_at, published_by, last_edited_by, last_reviewed_by, source_revision_id
        ) VALUES (
          v_target_topic_id,
          rev.module_id,
          p->>'title',
          COALESCE((p->>'passScore')::int, 70),
          (p->>'maxAttempts')::int,
          COALESCE((p->>'shuffleQuestions')::boolean, true),
          COALESCE((p->>'shuffleOptions')::boolean, true),
          q_count,
          1,
          now(),
          rev.author_id,
          rev.author_id,
          auth.uid(),
          revision_id
        )
        ON CONFLICT (topic_id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          title = EXCLUDED.title,
          pass_score = EXCLUDED.pass_score,
          max_attempts = EXCLUDED.max_attempts,
          shuffle_questions = EXCLUDED.shuffle_questions,
          shuffle_options = EXCLUDED.shuffle_options,
          question_count = EXCLUDED.question_count,
          version = public.published_quizzes.version + 1,
          published_at = now(),
          last_edited_by = rev.author_id,
          last_reviewed_by = auth.uid(),
          source_revision_id = revision_id
        RETURNING id INTO v_quiz_id;

        -- Preservar el author_id original de cada pregunta antes de actualizar
        SELECT COALESCE(
          jsonb_object_agg(
            COALESCE(stable_question_key, md5(lower(trim(stem)))),
            jsonb_build_object(
              'author_id', author_id,
              'is_system_baseline', is_system_baseline,
              'created_at', created_at
            )
          ),
          '{}'::jsonb
        )
        INTO v_existing_authors
        FROM public.quiz_questions
        WHERE quiz_id = v_quiz_id;

        DELETE FROM public.quiz_questions WHERE quiz_id = v_quiz_id;

        IF q_count > 0 THEN
          FOR q_item IN SELECT * FROM jsonb_array_elements(p->'questions')
          LOOP
            v_q_key := COALESCE(NULLIF(trim(q_item->>'id'), ''), md5(lower(trim(COALESCE(q_item->>'stem', '')))));
            v_q_author := COALESCE(
              NULLIF(trim(q_item->>'authorId'), '')::UUID,
              (v_existing_authors -> v_q_key ->> 'author_id')::UUID,
              rev.author_id
            );
            v_q_baseline := COALESCE(
              (v_existing_authors -> v_q_key ->> 'is_system_baseline')::BOOLEAN,
              FALSE
            );
            v_q_created := COALESCE(
              (v_existing_authors -> v_q_key ->> 'created_at')::TIMESTAMPTZ,
              now()
            );

            INSERT INTO public.quiz_questions (
              quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
              options, explanation, explanation_en, difficulty,
              stable_question_key, author_id, last_edited_by, is_system_baseline, created_at, updated_at
            ) VALUES (
              v_quiz_id,
              q_order,
              COALESCE(q_item->>'type', 'single'),
              COALESCE(q_item->>'stem', ''),
              q_item->>'stemEn',
              q_item->>'imageUrl',
              q_item->>'imageAlt',
              COALESCE(q_item->'options', '[]'::jsonb),
              q_item->>'explanation',
              q_item->>'explanationEn',
              q_item->>'difficulty',
              v_q_key,
              v_q_author,
              rev.author_id,
              v_q_baseline,
              v_q_created,
              now()
            );
            q_order := q_order + 1;
          END LOOP;
        END IF;

        SELECT COUNT(*) INTO v_new_questions_count
        FROM public.quiz_questions
        WHERE quiz_id = v_quiz_id AND author_id = rev.author_id AND is_system_baseline = FALSE;

        INSERT INTO public.participation_audit_logs (
          actor_id, author_id, marked_role_at_event, bag_category, action_type,
          entity_type, entity_id, module_id, topic_id,
          delta_editorial_units, legal_clause_ref, diff_summary, metadata
        ) VALUES (
          auth.uid(), rev.author_id, v_author_role,
          CASE WHEN v_author_role = 'profesor' THEN 'excluded' ELSE 'editorial' END,
          'quiz_revision_approved',
          'published_quiz', v_target_topic_id, rev.module_id, v_target_topic_id,
          CASE WHEN v_author_role = 'profesor' THEN 0 ELSE v_new_questions_count END,
          'Contrato Cl. 8 y Reglamento Art. 10 (Reactivo de evaluación publicado = 1 unidad editorial)',
          format('Cuestionario aprobado (%s reactivos atribuidos al autor en este cuestionario)', v_new_questions_count),
          jsonb_build_object('revision_id', revision_id, 'quiz_id', v_quiz_id, 'reviewer_id', auth.uid(), 'author_questions_in_quiz', v_new_questions_count)
        );
      END IF;

    -- ── RAMA 3: TEMA (TOPIC) ──────────────────────────────────────────────────
    ELSE
      v_target_topic_id := COALESCE(rev.target_topic_id, p->>'id', p->>'slug', 'tema');

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_topics WHERE id = v_target_topic_id;
      ELSE
        -- Unificar estructura de media incluyendo pdfUrls y references
        v_media := CASE
          WHEN p->'media' IS NOT NULL AND jsonb_typeof(p->'media') = 'object' THEN p->'media'
          ELSE jsonb_build_object(
            'videoUrls', COALESCE(p->'videoUrls', '[]'::jsonb),
            'youtubeUrls', COALESCE(p->'youtubeUrls', '[]'::jsonb),
            'vimeoUrls', COALESCE(p->'vimeoUrls', '[]'::jsonb),
            'embedUrls', COALESCE(p->'embedUrls', '[]'::jsonb),
            'imageUrls', COALESCE(p->'imageUrls', '[]'::jsonb),
            'pdfUrls', COALESCE(p->'pdfUrls', '[]'::jsonb),
            'references', COALESCE(p->'references', '[]'::jsonb)
          )
        END;

        IF p->'pdfUrls' IS NOT NULL AND (v_media->'pdfUrls' IS NULL OR v_media->'pdfUrls' = '[]'::jsonb) THEN
          v_media := jsonb_set(v_media, '{pdfUrls}', p->'pdfUrls');
        END IF;
        IF p->'references' IS NOT NULL AND (v_media->'references' IS NULL OR v_media->'references' = '[]'::jsonb) THEN
          v_media := jsonb_set(v_media, '{references}', p->'references');
        END IF;

        -- CORREGIDO: last_edited_by recibe rev.author_id (el médico autor) y last_reviewed_by recibe auth.uid()
        INSERT INTO public.published_topics (
          id, module_id, parent_id, slug, title, title_en, description,
          description_en, content, content_en, media, clinical_pearls,
          clinical_pearls_en, key_points, key_points_en, tags, key_terms,
          sort_order, version, published_at, published_by, last_edited_by, last_reviewed_by,
          source_revision_id, video_url
        ) VALUES (
          v_target_topic_id,
          rev.module_id,
          rev.parent_id,
          COALESCE(NULLIF(p->>'slug', ''), v_target_topic_id, 'tema'),
          COALESCE(NULLIF(p->>'title', ''), 'Tema sin título'),
          p->>'titleEn',
          p->>'description',
          p->>'descriptionEn',
          p->>'content',
          p->>'contentEn',
          v_media,
          COALESCE(p->'clinicalPearls', '[]'::jsonb),
          COALESCE(p->'clinicalPearlsEn', '[]'::jsonb),
          COALESCE(p->'keyPoints', '[]'::jsonb),
          COALESCE(p->'keyPointsEn', '[]'::jsonb),
          COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'tags')), '{}'),
          COALESCE(ARRAY(SELECT jsonb_array_elements_text(p->'keyTerms')), '{}'),
          COALESCE((p->>'sortOrder')::int, 0),
          1,
          now(),
          rev.author_id,
          rev.author_id,
          auth.uid(),
          revision_id,
          COALESCE(p->>'videoUrl', p->'youtubeUrls'->0->>'videoId')
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          parent_id = EXCLUDED.parent_id,
          slug = COALESCE(NULLIF(EXCLUDED.slug, ''), public.published_topics.slug, EXCLUDED.id),
          title = EXCLUDED.title,
          title_en = EXCLUDED.title_en,
          description = EXCLUDED.description,
          description_en = EXCLUDED.description_en,
          content = EXCLUDED.content,
          content_en = EXCLUDED.content_en,
          media = EXCLUDED.media,
          clinical_pearls = EXCLUDED.clinical_pearls,
          clinical_pearls_en = EXCLUDED.clinical_pearls_en,
          key_points = EXCLUDED.key_points,
          key_points_en = EXCLUDED.key_points_en,
          tags = EXCLUDED.tags,
          key_terms = EXCLUDED.key_terms,
          sort_order = EXCLUDED.sort_order,
          version = public.published_topics.version + 1,
          published_at = now(),
          last_edited_by = rev.author_id,
          last_reviewed_by = auth.uid(),
          source_revision_id = revision_id,
          video_url = EXCLUDED.video_url;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'review_revision_' || new_status,
    'content_revision',
    revision_id::text,
    jsonb_build_object('notes', notes, 'action', rev.action, 'author_id', rev.author_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_revision(UUID, public.revision_status, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_revision(UUID, public.revision_status, TEXT) TO authenticated;

-- Backfill: corregir en published_topics y published_quizzes aquellos registros donde
-- last_edited_by quedó con el reviewer_id en lugar del author_id de source_revision_id
UPDATE public.published_topics pt
SET
  last_reviewed_by = COALESCE(pt.last_reviewed_by, cr.reviewer_id),
  last_edited_by = cr.author_id,
  published_by = COALESCE(
    (SELECT cr_first.author_id
     FROM public.content_revisions cr_first
     WHERE (cr_first.target_topic_id = pt.id OR cr_first.payload->>'id' = pt.id)
       AND cr_first.status = 'approved'
     ORDER BY cr_first.reviewed_at ASC NULLS LAST, cr_first.created_at ASC
     LIMIT 1),
    cr.author_id
  )
FROM public.content_revisions cr
WHERE pt.source_revision_id = cr.id
  AND cr.author_id IS NOT NULL;

UPDATE public.published_quizzes pq
SET
  last_reviewed_by = COALESCE(pq.last_reviewed_by, cr.reviewer_id),
  last_edited_by = cr.author_id,
  published_by = COALESCE(pq.published_by, cr.author_id)
FROM public.content_revisions cr
WHERE pq.source_revision_id = cr.id
  AND cr.author_id IS NOT NULL;
