-- ==============================================================================
-- Migración: Índices de Rendimiento y Optimización de Consultas Recurrentes
-- Fecha: 2026-10-07
-- Descripción:
--   1. Optimiza RLS y vistas de evaluaciones (quiz_attempts, quiz_topic_flags).
--   2. Optimiza lecturas masivas de bitácora de actividad (student_activity_logs).
--   3. Optimiza lecturas de avance estudiantil (student_completed_topics).
--   4. Optimiza métricas administrativas de admin_get_stats(), admin_list_profiles()
--      y get_my_auth_context() (profiles, user_roles, course_enrollments).
--
-- NOTA:
--   Dentro de migraciones transaccionales se usa CREATE INDEX IF NOT EXISTS.
--   Para ejecutar manualmente en el SQL Editor de Supabase en vivo sin locks de tabla,
--   se puede agregar CONCURRENTLY: CREATE INDEX CONCURRENTLY IF NOT EXISTS ...
-- ==============================================================================

-- 1. Evaluaciones y RLS de Quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id
  ON public.quiz_attempts (user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_topic_passed
  ON public.quiz_attempts (user_id, topic_id, passed);

-- 2. Bitácora de actividad de estudiantes (ordenada por fecha descendente)
CREATE INDEX IF NOT EXISTS idx_student_activity_logs_user_created
  ON public.student_activity_logs (user_id, created_at DESC);

-- 3. Temas completados por estudiante
CREATE INDEX IF NOT EXISTS idx_student_completed_topics_user_id
  ON public.student_completed_topics (user_id);

-- 4. Soporte para conteos administrativos y filtrado de usuarios
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment_status
  ON public.profiles (enrollment_status);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON public.user_roles (role);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_status
  ON public.course_enrollments (status);
