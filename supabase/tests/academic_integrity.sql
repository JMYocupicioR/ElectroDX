-- Chequeo de integridad académica para el SQL Editor de Supabase.
-- No requiere pgTAP. Ejecutar tal cual: cada fila debe tener passed = true.
-- (El RESUMEN al final también debe quedar en true.)

WITH expected_functions AS (
  SELECT *
  FROM (
    VALUES
      ('get_quiz_for_attempt', 'text'),
      ('submit_quiz_attempt', 'text, jsonb, integer'),
      ('admin_list_quizzes_for_validation', 'text, text'),
      ('admin_set_quiz_validation_status', 'uuid[], text, text'),
      ('update_my_profile', 'jsonb'),
      ('submit_my_assignment', 'uuid, text, text'),
      ('add_my_submission_link', 'uuid, text, text'),
      ('register_my_submission_file', 'uuid, text, text, text, integer'),
      ('delete_my_submission', 'uuid'),
      ('complete_my_assigned_exam', 'uuid, uuid, numeric, integer'),
      ('start_my_clinical_case', 'uuid, jsonb'),
      ('complete_my_clinical_case', 'uuid, text, integer'),
      ('issue_my_certificate', ''),
      ('issue_my_certificate', 'text'),
      ('compute_kardex_scores', 'uuid, text'),
      ('verify_certificate', 'text'),
      ('get_exam_questions_for_attempt', 'text[], text, uuid[], boolean, boolean'),
      ('get_exam_topic_stats', ''),
      ('grade_exam_answer', 'uuid, uuid, integer'),
      ('get_exam_attempt_reveals', 'uuid'),
      ('submit_exam_session', 'uuid, jsonb, integer'),
      ('get_exam_session_review', 'uuid'),
      ('get_exam_gap_analysis', 'uuid'),
      ('mark_portal_guide_seen', 'smallint')
  ) AS t(proname, args)
),
actual_functions AS (
  SELECT
    p.proname,
    pg_catalog.oidvectortypes(p.proargtypes) AS args
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
),
function_checks AS (
  SELECT
    format('rpc %s(%s)', e.proname, e.args) AS check_name,
    EXISTS (
      SELECT 1
      FROM actual_functions a
      WHERE a.proname = e.proname
        AND a.args = e.args
    ) AS passed,
    COALESCE(
      (
        SELECT string_agg(NULLIF(a.args, ''), ' | ')
        FROM actual_functions a
        WHERE a.proname = e.proname
      ),
      'NO EXISTE'
    ) AS detail
  FROM expected_functions e
),
view_checks AS (
  SELECT
    'existe vista public_specialist_profiles' AS check_name,
    to_regclass('public.public_specialist_profiles') IS NOT NULL AS passed,
    NULL::text AS detail
  UNION ALL
  SELECT
    'vista public_specialist_profiles.display_name',
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'public_specialist_profiles'
        AND column_name = 'display_name'
    ),
    NULL
  UNION ALL
  SELECT
    'vista oculta admin_notes',
    to_regclass('public.public_specialist_profiles') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'public_specialist_profiles'
        AND column_name = 'admin_notes'
    ),
    NULL
  UNION ALL
  SELECT
    'vista oculta cedula_profesional',
    to_regclass('public.public_specialist_profiles') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'public_specialist_profiles'
        AND column_name = 'cedula_profesional'
    ),
    NULL
  UNION ALL
  SELECT
    'vista oculta enrollment_status',
    to_regclass('public.public_specialist_profiles') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'public_specialist_profiles'
        AND column_name = 'enrollment_status'
    ),
    NULL
),
rls_checks AS (
  SELECT
    'anon sin GRANT SELECT en quiz_questions' AS check_name,
    CASE
      WHEN to_regclass('public.quiz_questions') IS NULL THEN false
      ELSE NOT has_table_privilege('anon', 'public.quiz_questions', 'SELECT')
    END AS passed,
    CASE
      WHEN to_regclass('public.quiz_questions') IS NULL THEN 'tabla no existe'
      WHEN has_table_privilege('anon', 'public.quiz_questions', 'SELECT') THEN 'anon todavía tiene SELECT'
      ELSE 'ok'
    END AS detail
  UNION ALL
  SELECT
    'RLS activo en quiz_questions',
    COALESCE(
      (
        SELECT c.relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'quiz_questions'
      ),
      false
    ),
    NULL
  UNION ALL
  SELECT
    'política staff-only quiz_questions',
    EXISTS (
      SELECT 1
      FROM pg_policy
      WHERE polrelid = to_regclass('public.quiz_questions')
        AND polname = 'quiz_questions_staff_read'
    ),
    NULL
  UNION ALL
  SELECT
    'política staff-only exam_questions',
    EXISTS (
      SELECT 1
      FROM pg_policy
      WHERE polrelid = to_regclass('public.exam_questions')
        AND polname = 'Staff can read exam questions'
    ),
    NULL
  UNION ALL
  SELECT
    'alumnos inscritos ya no leen exam_questions directo',
    NOT EXISTS (
      SELECT 1
      FROM pg_policy
      WHERE polrelid = to_regclass('public.exam_questions')
        AND polname = 'Enrolled users can read exam questions'
    ),
    NULL
  UNION ALL
  SELECT
    'RPC submit_exam_session existe',
    EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'submit_exam_session'
    ),
    NULL
),
all_checks AS (
  SELECT * FROM function_checks
  UNION ALL
  SELECT * FROM view_checks
  UNION ALL
  SELECT * FROM rls_checks
),
report AS (
  SELECT check_name, passed, detail, 0 AS sort_group
  FROM all_checks
  UNION ALL
  SELECT
    'RESUMEN',
    bool_and(passed),
    format('%s/%s pasaron', count(*) FILTER (WHERE passed), count(*)),
    1
  FROM all_checks
)
SELECT check_name, passed, detail
FROM report
ORDER BY sort_group, passed, check_name;
