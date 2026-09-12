# Kit de réplica LMS (CursoUSG)

Esta carpeta convierte **este repositorio** en la plantilla de un LMS médico reutilizable.

CursoUSG (Diplomado Dr. Raúl Morales) sigue siendo una instancia. Un curso nuevo **no se genera desde cero**: se clona este código, se aplica el SQL de `database/` en un proyecto Supabase vacío y se sustituye la marca.

```
template/                     ← kit de bootstrap (esta carpeta)
├── README.md
├── CHECKLIST.md
├── env.example
├── brand.config.example.ts
├── customize-map.md          ← archivos de marca en src/ y public/
├── netlify.toml.example
├── database/                 ← schema + RLS + funciones + storage + seed
└── skills/INDEX.md           ← skills de agente que ya existen en el repo
```

El código de la app vive fuera de aquí (`src/`, `supabase/migrations/`, `.agents/skills/`). Este kit es lo que hace falta para **levantar otra instancia** sin arrastrar el historial de 40 migraciones ni el seed del diplomado.

## Qué replica y qué no

| Incluido | No incluido |
|----------|-------------|
| Tablas, RLS, triggers, RPCs y buckets | Contenido académico (módulos, videos, quizzes) |
| Seed genérico (1 curso vacío + settings) | Logos, textos y certificados de Raúl Morales |
| Mapa de archivos de marca | Usuarios, pagos ni certificados emitidos |
| Inventario de skills de agente | Proyecto Supabase / Mux / Stripe / Netlify |

## Cómo replicar (resumen)

1. Clonar este repo (o copiarlo) a una carpeta nueva.
2. Crear un proyecto Supabase vacío.
3. En el SQL Editor, ejecutar en orden `database/00` → `05`.
4. Copiar `env.example` a `.env.local` y a Netlify.
5. Sustituir marca según `customize-map.md` y `brand.config.example.ts`.
6. Crear el primer admin: registrarse y poner `role = 'admin'` e `is_active = true` en `profiles`.
7. Desplegar (Netlify). Webhooks de Mux/Stripe deben apuntar a la URL nueva.

Detalle en `CHECKLIST.md`. SQL en `database/README.md`.

## Relación con `supabase/migrations/`

Las migraciones de este repo son el historial **de esta instancia**. Tienen seed del diplomado, SQL huérfano (foro/microlearning) y tablas que la app usa pero nunca se versionaron.

Para un curso nuevo usa **solo** `template/database/`. No copies `supabase/migrations/` ni `supabase_setup_*.sql` al proyecto nuevo.

Si más adelante evolucionas CursoUSG, vuelve a extraer el estado vivo a esta carpeta (ver skill `lms-course-template`).
