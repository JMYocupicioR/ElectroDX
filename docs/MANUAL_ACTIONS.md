# Acciones manuales pendientes (no ejecutadas por el agente)

1. Aplicar migraciones **solo en Supabase local** (`npx supabase start` + `db reset`). No hacer `db push` remoto desde esta sesión.
2. Configurar secrets de Edge Functions: `SEP_API_KEY`, `SEP_CLIENT_ID`, `ALLOWED_ORIGINS`, `VAPID_*`.
3. Rotar la clave SEP si alguna vez se publicó en git.
4. Revisar clínicamente `supabase/seeds/topic_quizzes_pending_validation.json` antes de marcarlo `approved`.
5. Cargar el banco de quizzes en local: `npm run import:pending-quizzes` y ejecutar `supabase/seeds/import_pending_quizzes.sql` (o `npx supabase db reset`). Validar clínicamente desde `/admin/revisiones` → Validación clínica, empezando por el módulo 01.
6. Habilitar `BRAND.enableAccreditation` solo cuando el aval institucional esté vigente.
7. `template/` permanece como material no productivo. Los duplicados `ejercicios/src/**/* copy.ts` se archivaron en `ejercicios/archive/`.
8. Completar revisión humana de las hojas ampliadas en `src/content/lessonExpansions.ts`.
