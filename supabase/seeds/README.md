# Semillas académicas (solo local)

- `legacy_local_quizzes.json` — banco histórico retirado del bundle del cliente.
- `topic_quizzes_pending_validation.json` — reactivos generados para hojas evaluables. Estado `pending_review`. **No acreditar** hasta revisión clínica humana.
- `import_pending_quizzes.sql` — generado por `npm run import:pending-quizzes`. Llama a `admin_import_pending_quizzes` con `module_id` resuelto desde TEMARIO. No pisa `topic_id` existentes.

Cargar en Supabase **local** después de `npx supabase start` y `npx supabase db reset`. No aplicar al proyecto remoto desde el agente.

El cliente nunca debe importar estos JSON.
