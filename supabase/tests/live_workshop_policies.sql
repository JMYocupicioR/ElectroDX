-- Chequeo de policies de live_workshops para el tablero del profesor.
-- No requiere pgTAP. Ejecutar tal cual: cada fila debe tener passed = true.
-- (El RESUMEN al final también debe quedar en true.)

WITH actual AS (
  SELECT
    pol.polname,
    pol.polcmd::text AS polcmd,
    pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expr
  FROM pg_policy pol
  WHERE pol.polrelid = to_regclass('public.live_workshops')
),
checks AS (
  SELECT
    'existe policy workshops_staff_write' AS check_name,
    EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_staff_write') AS passed,
    COALESCE(
      (SELECT using_expr FROM actual WHERE polname = 'workshops_staff_write'),
      'NO EXISTE'
    ) AS detail
  UNION ALL
  SELECT
    'existe policy workshops_public_read',
    EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_public_read'),
    COALESCE(
      (SELECT using_expr FROM actual WHERE polname = 'workshops_public_read'),
      'NO EXISTE'
    )
  UNION ALL
  SELECT
    'ya no existe workshops_admin_write',
    NOT EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_admin_write'),
    CASE
      WHEN EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_admin_write')
        THEN 'todavía está la policy antigua'
      ELSE 'ok'
    END
  UNION ALL
  SELECT
    'workshops_public_read es SELECT',
    EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_public_read' AND polcmd = 'r'),
    COALESCE((SELECT polcmd FROM actual WHERE polname = 'workshops_public_read'), 'ausente')::text
  UNION ALL
  SELECT
    'workshops_staff_write cubre ALL',
    EXISTS (SELECT 1 FROM actual WHERE polname = 'workshops_staff_write' AND polcmd = '*'),
    COALESCE((SELECT polcmd FROM actual WHERE polname = 'workshops_staff_write'), 'ausente')::text
  UNION ALL
  SELECT
    'workshops_staff_write usa is_editor',
    EXISTS (
      SELECT 1
      FROM actual
      WHERE polname = 'workshops_staff_write'
        AND using_expr ILIKE '%is_editor%'
        AND COALESCE(check_expr, '') ILIKE '%is_editor%'
    ),
    COALESCE(
      (SELECT using_expr || ' / ' || COALESCE(check_expr, '') FROM actual WHERE polname = 'workshops_staff_write'),
      'NO EXISTE'
    )
  UNION ALL
  SELECT
    'workshops_public_read usa is_editor',
    EXISTS (
      SELECT 1
      FROM actual
      WHERE polname = 'workshops_public_read'
        AND using_expr ILIKE '%is_editor%'
    ),
    COALESCE((SELECT using_expr FROM actual WHERE polname = 'workshops_public_read'), 'NO EXISTE')
),
report AS (
  SELECT check_name, passed, detail, 0 AS sort_group
  FROM checks
  UNION ALL
  SELECT
    'RESUMEN',
    bool_and(passed),
    format('%s/%s pasaron', count(*) FILTER (WHERE passed), count(*)),
    1
  FROM checks
)
SELECT check_name, passed, detail
FROM report
ORDER BY sort_group, passed, check_name;
