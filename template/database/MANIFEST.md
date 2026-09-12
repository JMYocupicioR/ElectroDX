# Inventario (estado listo para réplica)

Fuente: migraciones de CursoUSG + `supabase_setup_forum.sql` + `supabase_setup_microlearning.sql` + tablas que la app ya usa sin SQL.

## Núcleo

| Tabla | Función |
|-------|---------|
| `profiles` | 1:1 con `auth.users`. `role`, `is_active`, datos profesionales, `public_photo_url` |
| `courses` | Cursos publicados. Unique `slug` |
| `modules` | Pertenecen a un curso. Prerequisito opcional |
| `lessons` | Video dual, Mux, quiz, documento, `publish_at` |
| `enrollments` | Progreso **por módulo**. Unique `(user_id, module_id)` |
| `course_enrollments` | Progreso **por curso**. Unique `(user_id, course_id)` |

## Aprendizaje

| Tabla | Función |
|-------|---------|
| `quizzes` / `questions` | Evaluaciones por lección |
| `quiz_attempts` / `quiz_attempt_answers` | Intentos y respuestas |
| `lesson_progress` | Completado por lección (dispara certificados) |
| `video_watch_progress` | Segmentos vistos |
| `lesson_notes` | Notas del alumno |
| `micro_lessons` | Microlearning |

## Operación

| Tabla | Función |
|-------|---------|
| `app_settings` | Feature flags JSON |
| `payments` | Stripe (escritura típica con service role) |
| `activity_logs` | Tiempo de estudio |
| `admin_audit_log` | Auditoría (SELECT denegado a alumnos) |
| `assignments` / `assignment_submissions` | Tareas |
| `custom_surveys*` | Encuestas |
| `workshops` / `workshop_attendance` | Talleres + QR |
| `live_sessions` / `session_recipients` | Zoom / Mux live / LiveKit |
| `notifications` | Inbound admin / outbound alumno |
| `push_subscriptions` | Web Push |
| `certificate_config` / `certificates` / `certificate_issue_events` | Emisión y folio |

## Comunidad

| Tabla | Función |
|-------|---------|
| `forum_threads` / `forum_posts` / `forum_thread_likes` | Foro. RPC `toggle_thread_like` |
| `lesson_comments` | Comentarios en lección |

## Storage

`docs`, `thumbnails`, `question_images`, `certificates`, `certificate-assets`, `assignment-submissions`, `avatars`.

## Funciones críticas

- `handle_new_user` — perfil al signup (`is_active = false`)
- `update_enrollment_progress` — % módulo/curso + auto-certificado
- `issue_automatic_certificate` / `get_next_certificate_folio`
- `calculate_course_progress` / `module_evaluations_passed`
- `toggle_thread_like` / `update_thread_reply_count`
- `queue_certificate_issue_event`
