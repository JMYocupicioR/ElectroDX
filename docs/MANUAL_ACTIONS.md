# Acciones manuales pendientes (no ejecutadas por el agente)

1. Aplicar migraciones **solo en Supabase local** (`npx supabase start` + `db reset`). No hacer `db push` remoto desde esta sesión.
2. Configurar secrets de Edge Functions: `SEP_API_KEY`, `SEP_CLIENT_ID`, `ALLOWED_ORIGINS`, `VAPID_*`.
3. Rotar la clave SEP si alguna vez se publicó en git.
4. Revisar clínicamente `supabase/seeds/topic_quizzes_pending_validation.json` antes de marcarlo `approved`.
5. Cargar el banco de quizzes en local: `npm run import:pending-quizzes` y ejecutar `supabase/seeds/import_pending_quizzes.sql` (o `npx supabase db reset`). Validar clínicamente desde `/admin/revisiones` → Validación clínica, empezando por el módulo 01.
6. Habilitar `BRAND.enableAccreditation` solo cuando el aval institucional esté vigente.
7. `template/` permanece como material no productivo. Los duplicados `ejercicios/src/**/* copy.ts` se archivaron en `ejercicios/archive/`.
8. Completar revisión humana de las hojas ampliadas en `src/content/lessonExpansions.ts`.
9. Aplicar `supabase/migrations/20260918120000_exam_attempt_lifecycle.sql` en local (`npx supabase db reset`, requiere Docker en marcha). Cierra los intentos de examen huérfanos, crea el índice único parcial `uq_exam_attempts_one_in_progress` y agrega `option_order` / `expires_at` / `assignment_id` a `exam_attempts`. Si `pg_cron` no está habilitado, programar `public.abandon_stale_exam_attempts(24)` por otra vía.
