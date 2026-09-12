# NeuroSAFEMX

Plataforma integral de recursos de neurorehabilitación y cursos de electrodiagnóstico (electromiografía, neuroconducción y potenciales evocados) avalada por la **COMEFYR** (Colegio Mexicano de Medicina de Rehabilitación). Cuenta con temario interactivo, casos clínicos con retroalimentación, simuladores y sistema de roles para estudiantes, colaboradores y administradores.

## Environment Setup

1. Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > API
   - Copy the Project URL and paste it as `VITE_SUPABASE_URL`
   - Copy the publishable (or `anon`) public key and paste it as `VITE_SUPABASE_ANON_KEY`

3. Install dependencies:

```bash
npm install
```

4. Apply Supabase migrations and configure Auth — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

5. Start the development server:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Rutas principales

### Público (sin login)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing y módulos |
| `/modulo/:moduleId/*` | Contenido educativo |
| `/ejercicios` | Modo ejercicios clínicos |
| `/herramientas/plexo-braquial` | Calculadora de plexo |
| `/especialistas` | Perfiles públicos verificados |
| `/comite-editorial` | Proceso editorial |

### Médicos inscritos

| Ruta | Descripción |
|------|-------------|
| `/auth/login` | Magic link (acceso médico) |
| `/colaborador/perfil` | Perfil profesional + solicitud de inscripción |
| `/mi-progreso` | Historial de evaluaciones (requiere inscripción aprobada) |

Las evaluaciones al final de cada tema hoja están protegidas por RLS: solo médicos con `enrollment_status = approved` (o colaboradores verificados).

### Colaboradores verificados

| Ruta | Descripción |
|------|-------------|
| `/colaborador` | Panel del colaborador |
| `/colaborador/nueva-revision` | Proponer tema/subtema |
| `/colaborador/cuestionario` | Proponer cuestionario por tema |
| `/admin/revisiones` | Cola de revisión (editores/admin) |

### Admin

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard |
| `/admin/usuarios` | Inscripciones médicas y colaboradores |
| `/admin/revisiones` | Revisión de contenido y cuestionarios |
| `/admin/evaluaciones` | Historial de intentos de evaluación |
| `/admin/auditoria` | Log de auditoría |

## Security Notes

- Never commit the `.env` file to version control
- Keep your environment variables secure
- The publishable/anon key is for public client-side access but should still be kept out of version control
- Never expose the service role key as it has full admin access
- Quiz questions are never embedded in public topic JSON; access is enforced via Supabase RLS
