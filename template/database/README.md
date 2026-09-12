# Base de datos de una instancia nueva

Ejecuta **en este orden** en el SQL Editor del proyecto Supabase vacío:

1. `00_extensions.sql`
2. `01_schema.sql` — tablas e índices (estado final, no el historial de ALTER)
3. `02_rls.sql` — Row Level Security
4. `03_functions.sql` — triggers y RPCs
5. `04_storage.sql` — buckets
6. `05_seed.example.sql` — 1 curso + settings + plantilla de certificado

Idempotente en lo razonable (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`). No lo mezcles con `supabase/migrations/` de CursoUSG.

## Qué corrige este kit respecto al historial

| Problema en CursoUSG | En este bootstrap |
|----------------------|-------------------|
| Foro y microlearning fuera de migraciones | Incluidos |
| `workshops`, `workshop_attendance`, `lesson_comments`, `push_subscriptions` usados por la app sin SQL | Incluidos |
| `profiles.public_photo_url` en código, no en SQL | Incluido |
| Seed del diplomado / Raúl Morales | Seed genérico |
| `live_sessions` / `payments` / `activity_logs` con RLS y **cero** policies | Policies explícitas (si no, el cliente JWT no ve filas) |
| `secure_function_search_paths` fallaba si el foro no existía | Funciones se crean juntas |

## Roles

El CHECK de `profiles.role` es `user | admin`. El alumno es `user` con `is_active`.
Algunas policies antiguas mencionan `creator`; se dejan por compatibilidad, pero no hay rol `creator` en el CHECK.

## Después de aplicar

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by 1;
```

Todas las tablas `public` deben tener `rowsecurity = true`.
