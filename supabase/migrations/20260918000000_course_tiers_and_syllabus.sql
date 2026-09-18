-- ==============================================================================
-- ElectoDX — Cursos por nivel (Principiante / Intermedio / Avanzado)
-- + organizador de temario + constancias por curso + overrides de temas
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  price_display TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_sellable BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.course_modules (
  module_id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course
  ON public.course_modules (course_id, sort_order);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user
  ON public.course_enrollments (user_id, status);

CREATE TABLE IF NOT EXISTS public.syllabus_topic_overrides (
  module_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (module_id, topic_id)
);

ALTER TABLE public.academic_certificates
  ADD COLUMN IF NOT EXISTS course_id TEXT REFERENCES public.courses(id);

CREATE UNIQUE INDEX IF NOT EXISTS academic_certificates_user_course_active_uidx
  ON public.academic_certificates (user_id, COALESCE(course_id, ''))
  WHERE revoked_at IS NULL;

-- Catálogo inicial
INSERT INTO public.courses (id, title, description, sort_order, price_display, is_active, is_sellable)
VALUES
  (
    'principiante',
    'Curso Principiante',
    'Fundamentos de neurofisiología clínica, técnicas de neuroconducción y EMG de aguja, anatomía topográfica, patologías neuromusculares frecuentes y control de calidad. Pensado para quien inicia en electrodiagnóstico.',
    1,
    'Consultar',
    true,
    true
  ),
  (
    'intermedio',
    'Curso Intermedio',
    'De la técnica a la práctica real: criterios diagnósticos, algoritmos, diagnóstico diferencial por síndrome y planificación del estudio con informe EMG.',
    2,
    'Consultar',
    true,
    true
  ),
  (
    'avanzado',
    'Curso Avanzado',
    'Técnicas especiales, casos clínicos de alta complejidad y actualizaciones por patología para el electrodiagnóstico de referencia.',
    3,
    'Consultar',
    true,
    true
  ),
  (
    'referencia',
    'Referencia rápida y bibliografía',
    'Tablas clínicas y fuentes bibliográficas. Se desbloquea con cualquier curso activo.',
    4,
    NULL,
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.course_modules (module_id, course_id, sort_order, is_visible)
VALUES
  ('fundamentals', 'principiante', 1, true),
  ('nerve-conduction', 'principiante', 2, true),
  ('emg-needle', 'principiante', 3, true),
  ('late-responses', 'principiante', 4, true),
  ('repetitive-stimulation', 'principiante', 5, true),
  ('evoked-potentials', 'principiante', 6, true),
  ('topographic-anatomy', 'principiante', 7, true),
  ('pathologies', 'principiante', 8, true),
  ('safety-qc', 'principiante', 9, true),
  ('diagnostic-criteria', 'intermedio', 1, true),
  ('syndrome-differential', 'intermedio', 2, true),
  ('emg-report-planning', 'intermedio', 3, true),
  ('special-studies', 'avanzado', 1, true),
  ('complex-clinical-cases', 'avanzado', 2, true),
  ('pathology-updates', 'avanzado', 3, true),
  ('quick-reference', 'referencia', 1, true),
  ('bibliography', 'referencia', 2, true)
ON CONFLICT (module_id) DO NOTHING;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topic_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS courses_public_read ON public.courses;
CREATE POLICY courses_public_read ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS courses_staff_write ON public.courses;
CREATE POLICY courses_staff_write ON public.courses
  FOR ALL
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS course_modules_public_read ON public.course_modules;
CREATE POLICY course_modules_public_read ON public.course_modules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS course_modules_staff_write ON public.course_modules;
CREATE POLICY course_modules_staff_write ON public.course_modules
  FOR ALL
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS course_enrollments_self_read ON public.course_enrollments;
CREATE POLICY course_enrollments_self_read ON public.course_enrollments
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS course_enrollments_admin_write ON public.course_enrollments;
CREATE POLICY course_enrollments_admin_write ON public.course_enrollments
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS syllabus_overrides_public_read ON public.syllabus_topic_overrides;
CREATE POLICY syllabus_overrides_public_read ON public.syllabus_topic_overrides
  FOR SELECT USING (true);

DROP POLICY IF EXISTS syllabus_overrides_staff_write ON public.syllabus_topic_overrides;
CREATE POLICY syllabus_overrides_staff_write ON public.syllabus_topic_overrides
  FOR ALL
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;

GRANT SELECT ON public.course_modules TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;

GRANT SELECT ON public.course_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;

GRANT SELECT ON public.syllabus_topic_overrides TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.syllabus_topic_overrides TO authenticated;

-- ─── Acceso a curso ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.has_course_access(p_course_id TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sellable BOOLEAN;
BEGIN
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF public.is_admin(check_user_id) OR public.is_editor(check_user_id) THEN
    RETURN true;
  END IF;

  IF public.has_premium_access(check_user_id) THEN
    RETURN true;
  END IF;

  SELECT is_sellable INTO v_sellable
  FROM public.courses
  WHERE id = p_course_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Referencia compartida: cualquier curso vendible activo desbloquea M11/M12
  IF p_course_id = 'referencia' OR v_sellable IS NOT TRUE THEN
    RETURN EXISTS (
      SELECT 1
      FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE ce.user_id = check_user_id
        AND ce.status = 'active'
        AND c.is_sellable = true
        AND (ce.expires_at IS NULL OR ce.expires_at > now())
    );
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.course_enrollments ce
    WHERE ce.user_id = check_user_id
      AND ce.course_id = p_course_id
      AND ce.status = 'active'
      AND (ce.expires_at IS NULL OR ce.expires_at > now())
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_module(p_module_id TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.access_tier;
  v_course TEXT;
BEGIN
  SELECT required_tier INTO v_req
  FROM public.module_access
  WHERE module_id = p_module_id;

  IF NOT FOUND OR v_req = 'free' THEN
    RETURN true;
  END IF;

  IF public.has_premium_access(check_user_id) THEN
    RETURN true;
  END IF;

  SELECT course_id INTO v_course
  FROM public.course_modules
  WHERE module_id = p_module_id AND is_visible = true;

  IF v_course IS NULL THEN
    RETURN false;
  END IF;

  RETURN public.has_course_access(v_course, check_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_course_access(
  target_user_id UUID,
  p_course_id TEXT,
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
DECLARE
  v_sellable BOOLEAN;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden otorgar acceso a un curso';
  END IF;

  SELECT is_sellable INTO v_sellable FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Curso no encontrado';
  END IF;

  INSERT INTO public.course_enrollments (
    user_id, course_id, status, granted_by, granted_at, expires_at,
    payment_method, payment_reference, notes, updated_at
  ) VALUES (
    target_user_id, p_course_id, 'active', auth.uid(), now(), p_expires_at,
    p_method, p_reference, p_notes, now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    status = 'active',
    granted_by = auth.uid(),
    granted_at = now(),
    expires_at = p_expires_at,
    payment_method = EXCLUDED.payment_method,
    payment_reference = EXCLUDED.payment_reference,
    notes = EXCLUDED.notes,
    updated_at = now();

  IF v_sellable IS TRUE THEN
    INSERT INTO public.course_enrollments (
      user_id, course_id, status, granted_by, granted_at, notes, updated_at
    ) VALUES (
      target_user_id, 'referencia', 'active', auth.uid(), now(),
      'Incluida con curso vendible', now()
    )
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      status = 'active',
      granted_by = auth.uid(),
      granted_at = now(),
      updated_at = now();
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'grant_course',
    'user',
    target_user_id::text,
    jsonb_build_object('course_id', p_course_id, 'method', p_method, 'reference', p_reference)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_course_access(target_user_id UUID, p_course_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden revocar acceso a un curso';
  END IF;

  UPDATE public.course_enrollments
  SET status = 'revoked', updated_at = now()
  WHERE user_id = target_user_id AND course_id = p_course_id;

  SELECT COUNT(*)::INT INTO v_remaining
  FROM public.course_enrollments ce
  JOIN public.courses c ON c.id = ce.course_id
  WHERE ce.user_id = target_user_id
    AND ce.status = 'active'
    AND c.is_sellable = true
    AND (ce.expires_at IS NULL OR ce.expires_at > now());

  IF v_remaining = 0 THEN
    UPDATE public.course_enrollments
    SET status = 'revoked', updated_at = now()
    WHERE user_id = target_user_id AND course_id = 'referencia';
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'revoke_course',
    'user',
    target_user_id::text,
    jsonb_build_object('course_id', p_course_id)
  );
END;
$$;

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
      ),
      'course_ids', COALESCE(
        (
          SELECT jsonb_agg(ce.course_id ORDER BY ce.course_id)
          FROM public.course_enrollments ce
          WHERE ce.user_id = auth.uid()
            AND ce.status = 'active'
            AND (ce.expires_at IS NULL OR ce.expires_at > now())
        ),
        '[]'::jsonb
      )
    )
  END;
$$;

-- ─── Constancias por curso ────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.issue_my_certificate();
DROP FUNCTION IF EXISTS public.issue_my_certificate(text);

CREATE OR REPLACE FUNCTION public.issue_my_certificate(p_course_id TEXT)
RETURNS public.academic_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_avg int;
  v_progress int;
  v_available int;
  v_row public.academic_certificates;
  v_folio text;
  v_prefix text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  IF v_profile.cedula_verified IS NOT TRUE THEN
    RAISE EXCEPTION 'Requiere cédula profesional verificada';
  END IF;

  IF p_course_id IS NOT NULL AND btrim(p_course_id) = '' THEN
    p_course_id := NULL;
  END IF;

  IF p_course_id IS NOT NULL THEN
    IF NOT public.has_course_access(p_course_id, v_uid) THEN
      RAISE EXCEPTION 'No tiene acceso al curso solicitado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = p_course_id AND c.is_sellable = true) THEN
      RAISE EXCEPTION 'Solo se emite constancia para cursos formativos';
    END IF;
  END IF;

  IF p_course_id IS NULL THEN
    SELECT COALESCE(round(avg(best)), 0)::int, count(*)
    INTO v_avg, v_available
    FROM (
      SELECT topic_id, max(score) AS best
      FROM public.quiz_attempts
      WHERE user_id = v_uid
      GROUP BY topic_id
    ) s;

    SELECT COUNT(*)::int INTO v_progress
    FROM public.student_completed_topics
    WHERE user_id = v_uid;

    IF v_avg < 80 OR v_available < 8 THEN
      RAISE EXCEPTION 'Promedio o cobertura de evaluaciones insuficiente para emitir constancia';
    END IF;
  ELSE
    SELECT COALESCE(round(avg(best)), 0)::int, count(*)
    INTO v_avg, v_available
    FROM (
      SELECT qa.topic_id, max(qa.score) AS best
      FROM public.quiz_attempts qa
      JOIN public.course_modules cm ON cm.module_id = qa.module_id
      WHERE qa.user_id = v_uid
        AND cm.course_id = p_course_id
        AND cm.is_visible = true
      GROUP BY qa.topic_id
    ) s;

    SELECT COUNT(*)::int INTO v_progress
    FROM public.student_completed_topics sct
    JOIN public.course_modules cm ON cm.module_id = sct.module_id
    WHERE sct.user_id = v_uid
      AND cm.course_id = p_course_id
      AND cm.is_visible = true;

    IF v_avg < 80 OR v_available < 3 THEN
      RAISE EXCEPTION 'Promedio o cobertura de evaluaciones insuficiente para emitir la constancia de este curso';
    END IF;
  END IF;

  SELECT folio INTO v_folio
  FROM public.academic_certificates
  WHERE user_id = v_uid
    AND revoked_at IS NULL
    AND COALESCE(course_id, '') = COALESCE(p_course_id, '')
  LIMIT 1;

  IF v_folio IS NOT NULL THEN
    SELECT * INTO v_row FROM public.academic_certificates WHERE folio = v_folio;
    RETURN v_row;
  END IF;

  v_prefix := CASE p_course_id
    WHEN 'principiante' THEN 'EDX-P'
    WHEN 'intermedio' THEN 'EDX-I'
    WHEN 'avanzado' THEN 'EDX-A'
    ELSE 'EDX'
  END;

  v_folio := v_prefix || '-' || to_char(now(), 'YYYY') || '-' || upper(encode(gen_random_bytes(6), 'hex'));

  INSERT INTO public.academic_certificates (
    user_id, folio, overall_progress_pct, average_score, course_id
  )
  VALUES (v_uid, v_folio, LEAST(100, v_progress), v_avg, p_course_id)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_folio text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN c.id IS NULL THEN jsonb_build_object('valid', false)
    ELSE jsonb_build_object(
      'valid', c.revoked_at IS NULL,
      'folio', c.folio,
      'issued_at', c.issued_at,
      'display_name', p.display_name,
      'revoked', c.revoked_at IS NOT NULL,
      'course_id', c.course_id,
      'course_title', cr.title
    )
  END
  FROM (SELECT p_folio AS folio) q
  LEFT JOIN public.academic_certificates c ON c.folio = q.folio
  LEFT JOIN public.profiles p ON p.id = c.user_id
  LEFT JOIN public.courses cr ON cr.id = c.course_id;
$$;

-- Backfill: alumnos ya admitidos conservan los 3 cursos (legacy)
INSERT INTO public.course_enrollments (user_id, course_id, status, notes)
SELECT p.id, c.id, 'active', 'legacy-backfill'
FROM public.profiles p
CROSS JOIN public.courses c
WHERE p.enrollment_status = 'approved'
  AND c.id IN ('principiante', 'intermedio', 'avanzado', 'referencia')
ON CONFLICT (user_id, course_id) DO NOTHING;

REVOKE ALL ON FUNCTION public.has_course_access(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_course_access(text, uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.can_access_module(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_module(text, uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.grant_course_access(uuid, text, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_course_access(uuid, text, text, text, text, timestamptz) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_course_access(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_course_access(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_auth_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_auth_context() TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_my_certificate()
RETURNS public.academic_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.issue_my_certificate(NULL::text);
END;
$$;

REVOKE ALL ON FUNCTION public.issue_my_certificate(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_my_certificate(text) TO authenticated;
REVOKE ALL ON FUNCTION public.issue_my_certificate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_my_certificate() TO authenticated;

GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- ─── Organizador del temario: auditoría y reorden atómico ────────────────────

-- updated_at/updated_by confiables en cualquier escritura (antes updated_at solo
-- se fijaba en el INSERT y updated_by nunca se escribía desde la UI).
CREATE OR REPLACE FUNCTION public.touch_syllabus_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_courses ON public.courses;
CREATE TRIGGER trg_touch_courses
  BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.touch_syllabus_row();

DROP TRIGGER IF EXISTS trg_touch_course_modules ON public.course_modules;
CREATE TRIGGER trg_touch_course_modules
  BEFORE INSERT OR UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.touch_syllabus_row();

DROP TRIGGER IF EXISTS trg_touch_syllabus_topic_overrides ON public.syllabus_topic_overrides;
CREATE TRIGGER trg_touch_syllabus_topic_overrides
  BEFORE INSERT OR UPDATE ON public.syllabus_topic_overrides
  FOR EACH ROW EXECUTE FUNCTION public.touch_syllabus_row();

-- Reorden de los módulos de un curso en UNA transacción. Antes el cliente hacía
-- un UPDATE por módulo: si una escritura intermedia fallaba, el orden quedaba
-- corrupto a la mitad.
CREATE OR REPLACE FUNCTION public.reorder_course_modules(p_course_id TEXT, p_module_ids TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Solo el personal editorial puede reordenar el temario';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = p_course_id) THEN
    RAISE EXCEPTION 'Curso no encontrado';
  END IF;

  UPDATE public.course_modules cm
  SET sort_order = u.ord::int,
      course_id = p_course_id
  FROM unnest(p_module_ids) WITH ORDINALITY AS u(module_id, ord)
  WHERE cm.module_id = u.module_id;
END;
$$;

-- Upsert atómico de overrides de temas (orden + visibilidad) de un módulo.
CREATE OR REPLACE FUNCTION public.set_syllabus_topic_overrides(p_module_id TEXT, p_overrides JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_editor()) THEN
    RAISE EXCEPTION 'Solo el personal editorial puede editar el temario';
  END IF;

  INSERT INTO public.syllabus_topic_overrides (module_id, topic_id, sort_order, is_visible)
  SELECT p_module_id, o.topic_id, COALESCE(o.sort_order, 0), COALESCE(o.is_visible, true)
  FROM jsonb_to_recordset(p_overrides) AS o(topic_id TEXT, sort_order INT, is_visible BOOLEAN)
  WHERE o.topic_id IS NOT NULL
  ON CONFLICT (module_id, topic_id) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    is_visible = EXCLUDED.is_visible;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_course_modules(text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_course_modules(text, text[]) TO authenticated;

REVOKE ALL ON FUNCTION public.set_syllabus_topic_overrides(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_syllabus_topic_overrides(text, jsonb) TO authenticated;
