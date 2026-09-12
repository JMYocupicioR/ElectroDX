# Configuración Supabase — NeuroSAFEMX

Plataforma de recursos de neurorehabilitación y cursos de electrodiagnóstico avalada por la COMEFYR.

## Credenciales del Proyecto

Configuradas en `.env`:

```env
VITE_SUPABASE_URL=https://pubodzfmiqmawrfnmrce.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KRurFJ2qlMynInI4XGyAUA_wwu8s5AN
```

**Project Ref:** `pubodzfmiqmawrfnmrce`

---

## Pasos obligatorios en el dashboard de Supabase

### 1. URL de redirección para autenticación

En **Authentication → URL Configuration**:

| Campo | Valor |
|-------|--------|
| Site URL | `http://localhost:5173` (desarrollo) o dominio en producción |
| Redirect URLs | `http://localhost:5173/auth/callback`, `https://tu-dominio.com/auth/callback` |

### 2. Habilitar proveedor Email (Magic Link y Contraseñas)

En **Authentication → Providers → Email**: activar **Email**.

### 3. Migraciones del Sistema

El esquema completo de base de datos se encuentra consolidado y endurecido en:
`supabase/migrations/20260911000000_neurosafemx_core_schema.sql`

Para aplicar cambios directamente mediante Supabase CLI:

```bash
# Push con conexión directa
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.pubodzfmiqmawrfnmrce.supabase.co:5432/postgres"

# O vinculando el proyecto con CLI
npx supabase login
npx supabase link --project-ref pubodzfmiqmawrfnmrce
npx supabase db push
```

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
