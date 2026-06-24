# Configuración Supabase — Plataforma editorial EMG

## Credenciales

Copia `.env.example` a `.env` y configura:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

## Pasos obligatorios en el dashboard de Supabase

### 1. URL de redirección para magic link

En **Authentication → URL Configuration**:

| Campo | Valor |
|-------|--------|
| Site URL | `http://localhost:5173` (dev) o tu dominio de producción |
| Redirect URLs | `http://localhost:5173/auth/callback`, `https://tu-dominio.com/auth/callback` |

### 2. Habilitar Email (magic link)

En **Authentication → Providers → Email**: activar **Email**.

### 3. Aplicar migraciones

Ejecuta el SQL de `supabase/migrations/` en orden (SQL Editor o Supabase CLI):

1. `20250621000000_editorial_platform.sql`
2. `20250621000001_rpc_grants.sql`
3. `20250622000000_admin_rpc.sql`
4. `20250623000000_published_modules.sql`
5. `20250624000000_quizzes_enrollment.sql`
6. `20250624000001_quiz_rpc_grants.sql`
7. `20250624000002_fix_quiz_topic_flags_security.sql`
8. `20250624000003_security_linter_fixes.sql`
9. `20250624000004_quiz_hardening.sql`
10. `20250624000005_verified_contributor_fix.sql`
11. `20250624000006_table_grants_bootstrap.sql`
12. `20250624000007_fix_rls_helper_grants.sql`

### Protección de contraseñas filtradas (dashboard)

En **Authentication → Settings**, activa **Leaked password protection** (HaveIBeenPwned). No se configura por SQL.

### 4. Convertirte en administrador (CEO / primer usuario)

**Opción A — desde la app (recomendada):**

1. Regístrate en `/auth/login` con tu correo.
2. Aplica la migración `20250624000006_table_grants_bootstrap.sql` (corrige errores 403).
3. Abre el menú de usuario (avatar arriba a la derecha) y pulsa **Activar administrador**.
4. Cierra sesión y vuelve a entrar para refrescar permisos.

**Opción B — SQL manual:**

```sql
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT id, 'admin', id
FROM auth.users
WHERE email = 'tu@correo.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET
  verified_at = now(),
  enrollment_status = 'approved',
  enrollment_verified_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@correo.com');
```

## Esquema aplicado

### Editorial

- `profiles` — perfiles con campos de inscripción médica (`enrollment_status`, `cedula_profesional`)
- `user_roles` — RBAC: `contributor`, `editor`, `admin`
- `content_revisions` — propuestas (temas, módulos, cuestionarios)
- `published_topics` / `published_modules` — contenido aprobado (lectura pública)
- `audit_log` — trazabilidad (solo admin)
- Bucket `avatars` — fotos de perfil

### Cuestionarios

- `published_quizzes` — un cuestionario por tema (solo lectura para médicos inscritos)
- `quiz_questions` — preguntas con tipos: single, multiple, true_false, image_choice
- `quiz_attempts` — intentos guardados por usuario inscrito
- `quiz_topic_flags` (vista pública) — metadatos sin respuestas (topic_id, question_count, pass_score)

## Flujos de uso

### Visitante

Lee todo el contenido sin login. Ve aviso de evaluación disponible pero no puede cargar preguntas.

### Médico inscrito (Opción C)

1. Login con magic link → `/colaborador/perfil`
2. Completa perfil incluyendo **cédula profesional**
3. Estado pasa a `enrollment_status = pending`
4. Admin aprueba en `/admin/usuarios` → tab **Inscripciones pendientes**
5. Accede a evaluaciones y `/mi-progreso`

Colaboradores verificados heredan acceso a evaluaciones automáticamente.

### Colaborador

1. Admin verifica como colaborador (tab **Colaboradores**)
2. Propone temas o cuestionarios
3. Editor/admin aprueba en `/admin/revisiones`

## RPC relevantes

| Función | Uso |
|---------|-----|
| `verify_physician_enrollment` | Admin aprueba inscripción médica |
| `reject_physician_enrollment` | Admin rechaza inscripción |
| `is_enrolled_physician` | RLS para quizzes |
| `review_revision` | Publica temas/módulos/cuestionarios |
| `submit_quiz_attempt` | Guarda intento con puntuación validada en servidor |
| `admin_list_quiz_attempts` | Admin/editor: historial de intentos |

## Lo que NO necesitas configurar

- **Service role key** — nunca va al frontend
- **Almacenamiento de videos/imágenes de contenido** — solo URLs externas
- Imágenes en preguntas de quiz — URLs externas (misma política que el contenido)
