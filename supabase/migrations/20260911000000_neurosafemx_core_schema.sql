-- ═══════════════════════════════════════════════════════════════════════════════
-- NeuroSAFEMX: Plataforma de Recursos de Neurorehabilitación y Electrodiagnóstico
-- Avalado por la COMEFYR (Colegio Mexicano de Medicina de Rehabilitación)
-- Esquema Consolidado Inicial de Base de Datos y Reglas RLS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. ENUMs y Tipos del Sistema ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'contributor', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.revision_status AS ENUM (
    'draft', 'pending_review', 'approved', 'rejected', 'changes_requested'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.revision_action AS ENUM ('create', 'update', 'delete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.enrollment_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.access_tier AS ENUM ('free', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.workshop_status AS ENUM ('draft', 'scheduled', 'live', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─── 2. Tablas Principales ───────────────────────────────────────────────────

-- 2A. Perfiles de Usuario (Médicos, Residentes, Colaboradores, Especialistas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Usuario',
  credentials TEXT,                               -- ej. 'Esp. Medicina de Rehabilitación', 'Residente de Neurofisiología'
  institution TEXT,                               -- Hospital sede o universidad
  specialty TEXT,                                 -- Especialidad médica
  residency_year TEXT,                            -- ej. 'R1', 'R2', 'R3', 'R4', 'Médico Adscrito', 'Especialista'
  cedula_profesional TEXT,                        -- Cédula profesional federal o estatal
  comefyr_member_id TEXT,                         -- Número de socio o registro COMEFYR
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMPTZ,                        -- Verificación de credenciales
  enrollment_status public.enrollment_status NOT NULL DEFAULT 'none',
  enrollment_verified_at TIMESTAMPTZ,
  enrollment_verified_by UUID REFERENCES auth.users(id),
  enrollment_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2B. Roles de Usuario (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2C. Módulos Publicados (Dinámicos)
CREATE TABLE IF NOT EXISTS public.published_modules (
  id TEXT PRIMARY KEY,
  number INT NOT NULL DEFAULT 99,
  title TEXT NOT NULL,
  title_en TEXT,
  emoji TEXT NOT NULL DEFAULT '📚',
  description TEXT,
  description_en TEXT,
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID
);

-- 2D. Temas y Lecciones Publicadas
CREATE TABLE IF NOT EXISTS public.published_topics (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  parent_id TEXT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  content TEXT,
  content_en TEXT,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_pearls JSONB NOT NULL DEFAULT '[]'::jsonb,
  clinical_pearls_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  key_terms TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID,
  video_url TEXT
);

-- 2E. Revisiones y Propuestas Editoriales
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_topic_id TEXT,
  module_id TEXT NOT NULL,
  parent_id TEXT,
  action public.revision_action NOT NULL DEFAULT 'update',
  payload JSONB NOT NULL,
  status public.revision_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2F. Registro de Auditoría
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2G. Cuestionarios y Evaluaciones por Tema
CREATE TABLE IF NOT EXISTS public.published_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT UNIQUE NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT,
  pass_score INT NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  max_attempts INT CHECK (max_attempts IS NULL OR max_attempts > 0),
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_options BOOLEAN NOT NULL DEFAULT true,
  question_count INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id),
  source_revision_id UUID REFERENCES public.content_revisions(id) ON DELETE SET NULL
);

-- 2H. Preguntas de Cuestionarios
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.published_quizzes(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'true_false', 'image_choice')),
  stem TEXT NOT NULL,
  stem_en TEXT,
  image_url TEXT,
  image_alt TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  explanation_en TEXT,
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('basic', 'intermediate', 'advanced'))
);

-- 2I. Intentos y Evaluaciones de Estudiantes
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.published_quizzes(id) ON DELETE CASCADE,
  quiz_version INT NOT NULL,
  topic_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2J. Suscripciones y Niveles de Acceso Premium
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.access_tier NOT NULL DEFAULT 'premium',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  granted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tier)
);

-- 2K. Control de Acceso a Módulos
CREATE TABLE IF NOT EXISTS public.module_access (
  module_id TEXT PRIMARY KEY,
  required_tier public.access_tier NOT NULL DEFAULT 'free',
  preview_topic_ids TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2L. Talleres Clínicos en Vivo
CREATE TABLE IF NOT EXISTS public.live_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  topic_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 90,
  stream_url TEXT,
  recording_url TEXT,
  max_capacity INT,
  clinical_case_revision_id UUID REFERENCES public.content_revisions(id) ON DELETE SET NULL,
  clinical_case_json JSONB,
  status public.workshop_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2M. Registros a Talleres
CREATE TABLE IF NOT EXISTS public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.live_workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE (workshop_id, user_id)
);

-- ─── 3. Índices de Rendimiento ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_public ON public.profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment ON public.profiles(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_published_modules_sort ON public.published_modules(sort_order);
CREATE INDEX IF NOT EXISTS idx_published_topics_module ON public.published_topics(module_id);
CREATE INDEX IF NOT EXISTS idx_published_topics_slug ON public.published_topics(slug);
CREATE INDEX IF NOT EXISTS idx_content_revisions_status ON public.content_revisions(status);
CREATE INDEX IF NOT EXISTS idx_content_revisions_author ON public.content_revisions(author_id);
CREATE INDEX IF NOT EXISTS idx_published_quizzes_module ON public.published_quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON public.quiz_attempts(topic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workshops_scheduled ON public.live_workshops(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_module ON public.live_workshops(module_id);

-- ─── 4. Vista Segura de Banderas de Quizzes ───────────────────────────────────

CREATE OR REPLACE VIEW public.quiz_topic_flags
WITH (security_invoker = true)
AS
SELECT
  pq.topic_id,
  pq.module_id,
  pq.title,
  pq.pass_score,
  pq.question_count,
  pq.max_attempts,
  EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    WHERE qa.topic_id = pq.topic_id
      AND qa.user_id = auth.uid()
      AND qa.passed = true
  ) AS user_has_passed,
  (
    SELECT COUNT(*)::int
    FROM public.quiz_attempts qa
    WHERE qa.topic_id = pq.topic_id
      AND qa.user_id = auth.uid()
  ) AS user_attempt_count
FROM public.published_quizzes pq;

-- ─── 5. Funciones Auxiliares y RBAC ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Triggers de actualización de timestamps
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS content_revisions_updated_at ON public.content_revisions;
CREATE TRIGGER content_revisions_updated_at
  BEFORE UPDATE ON public.content_revisions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS live_workshops_updated_at ON public.live_workshops;
CREATE TRIGGER live_workshops_updated_at
  BEFORE UPDATE ON public.live_workshops
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = required_role
  );
$$;

-- Helpers de rol
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin', check_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_editor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('editor', check_user_id) OR public.is_admin(check_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_contributor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('contributor', check_user_id) OR public.is_editor(check_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_student(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('student', check_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_verified_contributor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(check_user_id)
    OR public.has_role('editor', check_user_id)
    OR (
      public.has_role('contributor', check_user_id)
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = check_user_id AND verified_at IS NOT NULL
      )
    );
$$;

-- Perfil completo de inscripción
CREATE OR REPLACE FUNCTION public.is_enrollment_profile_complete(p public.profiles)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    NULLIF(trim(p.display_name), '') IS NOT NULL
    AND NULLIF(trim(p.institution), '') IS NOT NULL
    AND (
      NULLIF(trim(p.cedula_profesional), '') IS NOT NULL
      OR NULLIF(trim(p.comefyr_member_id), '') IS NOT NULL
    );
$$;

-- Verificación de cursista / estudiante médico inscrito
CREATE OR REPLACE FUNCTION public.is_enrolled_physician(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_verified_contributor(check_user_id)
    OR public.is_student(check_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = check_user_id
        AND p.enrollment_status = 'approved'
        AND p.enrollment_verified_at IS NOT NULL
    );
$$;

-- Acceso Premium
CREATE OR REPLACE FUNCTION public.has_premium_access(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(check_user_id)
    OR public.has_role('editor', check_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = check_user_id
        AND s.tier = 'premium'
        AND s.is_active = true
        AND (s.expires_at IS NULL OR s.expires_at > now())
    );
$$;

-- Acceso a Módulo
CREATE OR REPLACE FUNCTION public.can_access_module(p_module_id TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.access_tier;
BEGIN
  SELECT required_tier INTO v_req
  FROM public.module_access
  WHERE module_id = p_module_id;

  IF NOT FOUND OR v_req = 'free' THEN
    RETURN true;
  END IF;

  RETURN public.has_premium_access(check_user_id);
END;
$$;

-- Trigger automático al crear usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Por defecto registrar como rol student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para solicitar inscripción médica automáticamente al completar el perfil
CREATE OR REPLACE FUNCTION public.sync_enrollment_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_enrollment_profile_complete(NEW) THEN
    IF NEW.enrollment_status IN ('none', 'rejected') THEN
      NEW.enrollment_status := 'pending';
      NEW.enrollment_requested_at := COALESCE(NEW.enrollment_requested_at, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_enrollment_request ON public.profiles;
CREATE TRIGGER profiles_sync_enrollment_request
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_enrollment_request();

-- ─── 6. Sistema de Bootstrap Admin (Primer Administrador) ──────────────────────

CREATE OR REPLACE FUNCTION public.bootstrap_admin_available()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.claim_bootstrap_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Ya existe un administrador en la plataforma';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (uid, 'admin', uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles
  SET
    verified_at = COALESCE(verified_at, now()),
    enrollment_status = 'approved',
    enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
    enrollment_verified_by = uid
  WHERE id = uid;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (uid, 'bootstrap_admin', 'user', uid::text, jsonb_build_object('note', 'Primer administrador'));

  RETURN jsonb_build_object('success', true, 'user_id', uid);
END;
$$;

-- ─── 7. Contexto de Autenticación Unificado (Frontend) ────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN NULL
    ELSE jsonb_build_object(
      'profile', (SELECT to_jsonb(p.*) FROM public.profiles p WHERE p.id = auth.uid()),
      'roles', COALESCE(
        (SELECT jsonb_agg(ur.role ORDER BY ur.role) FROM public.user_roles ur WHERE ur.user_id = auth.uid()),
        '[]'::jsonb
      ),
      'bootstrap_available', NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'),
      'has_premium', public.has_premium_access(auth.uid()),
      'subscription', (
        SELECT to_jsonb(s.*)
        FROM public.subscriptions s
        WHERE s.user_id = auth.uid()
          AND s.tier = 'premium'
          AND s.is_active = true
          AND (s.expires_at IS NULL OR s.expires_at > now())
        LIMIT 1
      )
    )
  END;
$$;

-- ─── 8. Calificación y Envío de Quizzes (Server-Side Seguro) ──────────────────

CREATE OR REPLACE FUNCTION public._quiz_correct_option_ids(p_options jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(elem->>'id' ORDER BY elem->>'id'),
    '{}'::text[]
  )
  FROM jsonb_array_elements(p_options) AS elem
  WHERE COALESCE((elem->>'isCorrect')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION public._quiz_is_answer_correct(
  p_type text,
  p_options jsonb,
  p_selected_ids text[]
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_correct text[];
  v_selected text[];
BEGIN
  v_correct := public._quiz_correct_option_ids(p_options);

  SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}'::text[])
  INTO v_selected
  FROM unnest(COALESCE(p_selected_ids, '{}'::text[])) AS s
  WHERE NULLIF(trim(s), '') IS NOT NULL;

  IF p_type = 'multiple' THEN
    RETURN array_length(v_selected, 1) > 0 AND v_selected = v_correct;
  END IF;

  RETURN array_length(v_selected, 1) = 1
    AND array_length(v_correct, 1) = 1
    AND v_selected[1] = v_correct[1];
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_topic_id text,
  p_answers jsonb,
  p_duration_seconds int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_quiz public.published_quizzes;
  v_past_count int;
  v_q public.quiz_questions;
  v_total int := 0;
  v_correct_count int := 0;
  v_score int;
  v_passed boolean;
  v_user_answers jsonb := '[]'::jsonb;
  v_ans_elem jsonb;
  v_selected_ids text[];
  v_is_correct boolean;
  v_attempt_id uuid;
  v_row public.quiz_attempts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión para realizar la evaluación';
  END IF;

  IF NOT public.is_enrolled_physician(v_uid) THEN
    RAISE EXCEPTION 'Requiere inscripción médica aprobada para realizar evaluaciones';
  END IF;

  SELECT * INTO v_quiz
  FROM public.published_quizzes
  WHERE topic_id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuestionario no encontrado para el tema especificado';
  END IF;

  IF v_quiz.max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_past_count
    FROM public.quiz_attempts
    WHERE quiz_id = v_quiz.id AND user_id = v_uid;

    IF v_past_count >= v_quiz.max_attempts THEN
      RAISE EXCEPTION 'Ha alcanzado el número máximo de intentos permitidos (%)', v_quiz.max_attempts;
    END IF;
  END IF;

  FOR v_q IN
    SELECT * FROM public.quiz_questions
    WHERE quiz_id = v_quiz.id
    ORDER BY sort_order
  LOOP
    v_total := v_total + 1;

    SELECT elem INTO v_ans_elem
    FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb)) AS elem
    WHERE elem->>'questionId' = v_q.id::text
    LIMIT 1;

    IF v_ans_elem IS NOT NULL AND jsonb_typeof(v_ans_elem->'selectedIds') = 'array' THEN
      SELECT array_agg(v)::text[]
      INTO v_selected_ids
      FROM jsonb_array_elements_text(v_ans_elem->'selectedIds') AS v;
    ELSE
      v_selected_ids := '{}'::text[];
    END IF;

    v_is_correct := public._quiz_is_answer_correct(v_q.type, v_q.options, v_selected_ids);
    IF v_is_correct THEN
      v_correct_count := v_correct_count + 1;
    END IF;

    v_user_answers := v_user_answers || jsonb_build_object(
      'questionId', v_q.id::text,
      'selectedIds', COALESCE(to_jsonb(v_selected_ids), '[]'::jsonb),
      'isCorrect', v_is_correct
    );
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'El cuestionario no contiene preguntas publicadas';
  END IF;

  v_score := round((v_correct_count::numeric / v_total::numeric) * 100)::int;
  v_passed := v_score >= v_quiz.pass_score;

  INSERT INTO public.quiz_attempts (
    quiz_id,
    quiz_version,
    topic_id,
    module_id,
    user_id,
    score,
    passed,
    answers,
    duration_seconds
  ) VALUES (
    v_quiz.id,
    v_quiz.version,
    v_quiz.topic_id,
    v_quiz.module_id,
    v_uid,
    v_score,
    v_passed,
    v_user_answers,
    p_duration_seconds
  )
  RETURNING * INTO v_row;

  RETURN to_jsonb(v_row);
END;
$$;

-- ─── 9. Revisión y Publicación de Contenido Editorial ─────────────────────────

CREATE OR REPLACE FUNCTION public.submit_revision(revision_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rev public.content_revisions;
BEGIN
  SELECT * INTO rev
  FROM public.content_revisions
  WHERE id = revision_id AND author_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada o no pertenece al usuario';
  END IF;

  IF rev.status NOT IN ('draft', 'changes_requested') THEN
    RAISE EXCEPTION 'Solo revisiones en borrador o con cambios solicitados pueden enviarse';
  END IF;

  UPDATE public.content_revisions
  SET status = 'pending_review', submitted_at = now()
  WHERE id = revision_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'submit_revision', 'content_revision', revision_id::text, jsonb_build_object('module_id', rev.module_id));
END;
$$;

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

  IF new_status = 'approved' THEN
    p := rev.payload;
    v_rev_type := COALESCE(p->>'revisionType', 'topic');

    IF v_rev_type = 'module' THEN
      v_target_module_id := COALESCE(p->>'id', rev.module_id);
      IF rev.action = 'delete' THEN
        DELETE FROM public.published_modules WHERE id = v_target_module_id;
      ELSE
        INSERT INTO public.published_modules (
          id, number, title, title_en, emoji, description, description_en,
          color, icon, sort_order, version, published_at, published_by,
          last_edited_by, source_revision_id
        ) VALUES (
          v_target_module_id,
          COALESCE((p->>'number')::int, 99),
          p->>'title',
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
          last_edited_by = auth.uid(),
          source_revision_id = revision_id;
      END IF;

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

        INSERT INTO public.published_quizzes (
          topic_id, module_id, title, pass_score, max_attempts,
          shuffle_questions, shuffle_options, question_count,
          version, published_at, published_by, last_edited_by, source_revision_id
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
          last_edited_by = auth.uid(),
          source_revision_id = revision_id
        RETURNING id INTO v_quiz_id;

        DELETE FROM public.quiz_questions WHERE quiz_id = v_quiz_id;

        IF q_count > 0 THEN
          FOR q_item IN SELECT * FROM jsonb_array_elements(p->'questions')
          LOOP
            INSERT INTO public.quiz_questions (
              quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,
              options, explanation, explanation_en, difficulty
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
              q_item->>'difficulty'
            );
            q_order := q_order + 1;
          END LOOP;
        END IF;
      END IF;

    ELSE
      -- Tipo Tema (Topic)
      v_target_topic_id := COALESCE(rev.target_topic_id, p->>'id');

      IF rev.action = 'delete' THEN
        DELETE FROM public.published_topics WHERE id = v_target_topic_id;
      ELSE
        INSERT INTO public.published_topics (
          id, module_id, parent_id, slug, title, title_en, description,
          description_en, content, content_en, media, clinical_pearls,
          clinical_pearls_en, key_points, key_points_en, tags, key_terms,
          sort_order, version, published_at, published_by, last_edited_by,
          source_revision_id, video_url
        ) VALUES (
          v_target_topic_id,
          rev.module_id,
          rev.parent_id,
          p->>'slug',
          p->>'title',
          p->>'titleEn',
          p->>'description',
          p->>'descriptionEn',
          p->>'content',
          p->>'contentEn',
          COALESCE(p->'media', '{}'::jsonb),
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
          auth.uid(),
          revision_id,
          p->>'videoUrl'
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          parent_id = EXCLUDED.parent_id,
          slug = EXCLUDED.slug,
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
          last_edited_by = auth.uid(),
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

-- ─── 10. RPCs Administrativas y Gestión de Usuarios/Roles ────────────────────

CREATE OR REPLACE FUNCTION public.grant_user_role(target_user_id UUID, target_role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden asignar roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, target_role, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'grant_role', 'user', target_user_id::text, jsonb_build_object('role', target_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_role(target_user_id UUID, target_role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar roles';
  END IF;

  IF target_user_id = auth.uid() AND target_role = 'admin' THEN
    RAISE EXCEPTION 'No puedes remover tu propio rol de administrador';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = target_role;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'revoke_role', 'user', target_user_id::text, jsonb_build_object('role', target_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_contributor(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden verificar colaboradores';
  END IF;

  UPDATE public.profiles
  SET
    verified_at = now(),
    enrollment_status = 'approved',
    enrollment_verified_at = COALESCE(enrollment_verified_at, now()),
    enrollment_verified_by = COALESCE(enrollment_verified_by, auth.uid())
  WHERE id = target_user_id;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, 'contributor', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'verify_contributor', 'user', target_user_id::text, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_contributor(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar colaboradores';
  END IF;

  UPDATE public.profiles
  SET verified_at = NULL
  WHERE id = target_user_id;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'contributor';

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_contributor', 'user', target_user_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_physician_enrollment(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden aprobar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'approved',
    enrollment_verified_at = now(),
    enrollment_verified_by = auth.uid()
  WHERE id = target_user_id;

  -- Asegurar rol student
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_user_id, 'student', auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'verify_physician_enrollment', 'user', target_user_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_physician_enrollment(target_user_id UUID, notes TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden rechazar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'rejected',
    enrollment_verified_at = NULL,
    enrollment_verified_by = auth.uid()
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'reject_physician_enrollment', 'user', target_user_id::text, jsonb_build_object('notes', notes));
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_physician_enrollment(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar inscripciones';
  END IF;

  UPDATE public.profiles
  SET
    enrollment_status = 'none',
    enrollment_verified_at = NULL,
    enrollment_verified_by = NULL,
    enrollment_requested_at = NULL
  WHERE id = target_user_id;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_physician_enrollment', 'user', target_user_id::text);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  pending_only BOOLEAN DEFAULT false,
  enrollment_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  credentials TEXT,
  institution TEXT,
  specialty TEXT,
  residency_year TEXT,
  cedula_profesional TEXT,
  comefyr_member_id TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN,
  verified_at TIMESTAMPTZ,
  enrollment_status public.enrollment_status,
  enrollment_verified_at TIMESTAMPTZ,
  enrollment_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  roles TEXT[],
  is_verified_contributor BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    p.credentials,
    p.institution,
    p.specialty,
    p.residency_year,
    p.cedula_profesional,
    p.comefyr_member_id,
    p.avatar_url,
    p.bio,
    p.is_public,
    p.verified_at,
    p.enrollment_status,
    p.enrollment_verified_at,
    p.enrollment_requested_at,
    p.created_at,
    p.updated_at,
    COALESCE(
      ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id),
      '{}'
    ) AS roles,
    (p.verified_at IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
    )) AS is_verified_contributor
  FROM public.profiles p
  WHERE
    public.is_admin()
    AND (
      NOT pending_only
      OR p.enrollment_status = 'pending'
      OR (p.verified_at IS NULL AND EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'contributor'
      ))
    )
    AND (
      enrollment_filter IS NULL
      OR p.enrollment_status::text = enrollment_filter
    )
  ORDER BY
    CASE WHEN p.enrollment_status = 'pending' THEN 0 ELSE 1 END,
    p.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_profiles', (SELECT COUNT(*) FROM public.profiles),
    'verified_contributors', (
      SELECT COUNT(DISTINCT p.id)
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.verified_at IS NOT NULL AND ur.role = 'contributor'
    ),
    'pending_verifications', (
      SELECT COUNT(DISTINCT p.id)
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      WHERE p.verified_at IS NULL AND ur.role = 'contributor'
    ),
    'total_revisions', (SELECT COUNT(*) FROM public.content_revisions),
    'pending_revisions', (SELECT COUNT(*) FROM public.content_revisions WHERE status = 'pending_review'),
    'published_topics', (SELECT COUNT(*) FROM public.published_topics),
    'published_modules', (SELECT COUNT(*) FROM public.published_modules),
    'published_quizzes', (SELECT COUNT(*) FROM public.published_quizzes),
    'total_quiz_attempts', (SELECT COUNT(*) FROM public.quiz_attempts),
    'pending_enrollments', (SELECT COUNT(*) FROM public.profiles WHERE enrollment_status = 'pending'),
    'approved_physicians', (SELECT COUNT(*) FROM public.profiles WHERE enrollment_status = 'approved'),
    'total_students', (SELECT COUNT(DISTINCT user_id) FROM public.user_roles WHERE role = 'student')
  )
  WHERE public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.admin_list_quiz_attempts(p_limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  quiz_version int,
  topic_id text,
  module_id text,
  user_id uuid,
  score int,
  passed boolean,
  answers jsonb,
  duration_seconds int,
  completed_at timestamptz,
  user_display_name text,
  user_institution text,
  user_cedula text,
  user_specialty text,
  quiz_title text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    qa.id,
    qa.quiz_id,
    qa.quiz_version,
    qa.topic_id,
    qa.module_id,
    qa.user_id,
    qa.score,
    qa.passed,
    qa.answers,
    qa.duration_seconds,
    qa.completed_at,
    p.display_name,
    p.institution,
    p.cedula_profesional,
    p.specialty,
    pq.title
  FROM public.quiz_attempts qa
  JOIN public.profiles p ON p.id = qa.user_id
  JOIN public.published_quizzes pq ON pq.id = qa.quiz_id
  WHERE public.is_admin()
  ORDER BY qa.completed_at DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.grant_premium_access(
  target_user_id UUID,
  p_method TEXT DEFAULT 'manual',
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden otorgar acceso premium';
  END IF;

  INSERT INTO public.subscriptions (
    user_id, tier, starts_at, expires_at, payment_method, payment_reference, notes, granted_by, is_active
  ) VALUES (
    target_user_id, 'premium', now(), p_expires_at, p_method, p_reference, p_notes, auth.uid(), true
  )
  ON CONFLICT (user_id, tier) DO UPDATE SET
    starts_at = now(),
    expires_at = p_expires_at,
    payment_method = EXCLUDED.payment_method,
    payment_reference = EXCLUDED.payment_reference,
    notes = EXCLUDED.notes,
    granted_by = auth.uid(),
    is_active = true;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'grant_premium', 'user', target_user_id::text, jsonb_build_object(
    'method', p_method, 'reference', p_reference, 'expires_at', p_expires_at
  ));
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_premium_access(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar acceso premium';
  END IF;

  UPDATE public.subscriptions
  SET is_active = false
  WHERE user_id = target_user_id AND tier = 'premium';

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
  VALUES (auth.uid(), 'revoke_premium', 'user', target_user_id::text);
END;
$$;

-- ─── 11. Configuración de Almacenamiento (Storage: avatars) ───────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ─── 12. Políticas RLS (Row Level Security) Endurecidas ───────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- 12A. profiles
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

-- 12B. user_roles
DROP POLICY IF EXISTS "user_roles_self_or_admin_read" ON public.user_roles;
CREATE POLICY "user_roles_self_or_admin_read" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- 12C. published_modules & published_topics
DROP POLICY IF EXISTS "published_modules_public_read" ON public.published_modules;
CREATE POLICY "published_modules_public_read" ON public.published_modules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "published_topics_public_read" ON public.published_topics;
CREATE POLICY "published_topics_public_read" ON public.published_topics FOR SELECT
  USING (true);

-- 12D. content_revisions
DROP POLICY IF EXISTS "content_revisions_author_read" ON public.content_revisions;
CREATE POLICY "content_revisions_author_read" ON public.content_revisions FOR SELECT
  USING (author_id = auth.uid() OR public.is_admin() OR public.has_role('editor'));

DROP POLICY IF EXISTS "content_revisions_author_insert" ON public.content_revisions;
CREATE POLICY "content_revisions_author_insert" ON public.content_revisions FOR INSERT
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "content_revisions_author_update" ON public.content_revisions;
CREATE POLICY "content_revisions_author_update" ON public.content_revisions FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin() OR public.has_role('editor'));

-- 12E. audit_log
DROP POLICY IF EXISTS "audit_log_admin_read" ON public.audit_log;
CREATE POLICY "audit_log_admin_read" ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- 12F. published_quizzes & quiz_questions
DROP POLICY IF EXISTS "published_quizzes_read" ON public.published_quizzes;
CREATE POLICY "published_quizzes_read" ON public.published_quizzes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "quiz_questions_authenticated_read" ON public.quiz_questions;
CREATE POLICY "quiz_questions_authenticated_read" ON public.quiz_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 12G. quiz_attempts
DROP POLICY IF EXISTS "quiz_attempts_self_read" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_self_read" ON public.quiz_attempts FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "quiz_attempts_self_insert" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_self_insert" ON public.quiz_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 12H. subscriptions
DROP POLICY IF EXISTS "subscriptions_self_read" ON public.subscriptions;
CREATE POLICY "subscriptions_self_read" ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- 12I. module_access
DROP POLICY IF EXISTS "module_access_public_read" ON public.module_access;
CREATE POLICY "module_access_public_read" ON public.module_access FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "module_access_admin_write" ON public.module_access;
CREATE POLICY "module_access_admin_write" ON public.module_access FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12J. live_workshops & workshop_registrations
DROP POLICY IF EXISTS "workshops_public_read" ON public.live_workshops;
CREATE POLICY "workshops_public_read" ON public.live_workshops FOR SELECT
  USING (status IN ('scheduled', 'live', 'completed') OR public.is_admin());

DROP POLICY IF EXISTS "workshops_admin_write" ON public.live_workshops;
CREATE POLICY "workshops_admin_write" ON public.live_workshops FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "workshop_registrations_self_read" ON public.workshop_registrations;
CREATE POLICY "workshop_registrations_self_read" ON public.workshop_registrations FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "workshop_registrations_self_insert" ON public.workshop_registrations;
CREATE POLICY "workshop_registrations_self_insert" ON public.workshop_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 12K. storage.objects (avatars)
DROP POLICY IF EXISTS "avatars_self_upload" ON storage.objects;
CREATE POLICY "avatars_self_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars_self_update" ON storage.objects;
CREATE POLICY "avatars_self_update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars_self_delete" ON storage.objects;
CREATE POLICY "avatars_self_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── 13. Permisos de PostgREST y Helper Grants ───────────────────────────────

-- Permisos sobre tablas
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.content_revisions TO authenticated;
GRANT SELECT ON public.published_topics TO anon, authenticated;
GRANT SELECT ON public.published_modules TO anon, authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT ON public.published_quizzes TO anon, authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.module_access TO anon, authenticated;
GRANT SELECT ON public.live_workshops TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.workshop_registrations TO authenticated;

-- Permisos sobre RPCs
REVOKE ALL ON FUNCTION public.sync_enrollment_request() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Helper functions used in RLS policies need EXECUTE permission for anon and authenticated
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_verified_contributor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_enrolled_physician(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_module(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin_available() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.claim_bootstrap_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_auth_context() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_profiles(boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_quiz_attempts(int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grant_user_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_user_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_contributor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_contributor(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_physician_enrollment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_physician_enrollment(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_physician_enrollment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_revision(uuid, public.revision_status, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_revision(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grant_premium_access(uuid, text, text, text, timestamptz) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_premium_access(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_available() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_bootstrap_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(text, jsonb, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_revision(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.admin_list_profiles(boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_attempts(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_contributor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_physician_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_revision(uuid, public.revision_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_premium_access(uuid, text, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_premium_access(uuid) TO authenticated;
