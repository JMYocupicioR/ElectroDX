# Checklist de un curso nuevo

Marca cada paso. El orden importa.

## 1. Repositorio

- [ ] Copiar / clonar este repo a un directorio nuevo
- [ ] Cambiar `name` en `package.json` (hoy: `diplomado-raul-morales`)
- [ ] Quitar `.env.local` si se copió (no reutilizar keys)
- [ ] `npm install`

## 2. Supabase

- [ ] Proyecto nuevo (región cercana a los alumnos)
- [ ] Auth: email + confirmación de correo
- [ ] Redirect URLs: `http://localhost:3000/auth/callback` y `https://TU-DOMINIO/auth/callback`
- [ ] Site URL = `NEXT_PUBLIC_APP_URL`
- [ ] SQL Editor: `00_extensions.sql` → `01_schema.sql` → `02_rls.sql` → `03_functions.sql` → `04_storage.sql` → `05_seed.example.sql`
- [ ] Authentication → Providers: desactivar los que no uses
- [ ] Copiar URL, anon key y service role al `.env.local`

## 3. Primer admin

- [ ] Registrarse en `/register` (el perfil nace como `role=user`, `is_active=false`)
- [ ] En SQL: `update public.profiles set role = 'admin', is_active = true where email = 'TU_EMAIL';`
- [ ] Entrar a `/admin`

## 4. Marca y contenido

- [ ] Completar `src/lib/brand.config.ts` a partir de `brand.config.example.ts`
- [ ] Recorrer `customize-map.md` (logos, PWA, copy legal, slug del curso)
- [ ] En `/admin/contenido`: publicar el curso, módulos y lecciones
- [ ] En `/admin/certificados`: folio, firmantes, horas, layout

## 5. Servicios externos (opcionales según el curso)

| Servicio | Variables | Webhook |
|----------|-----------|---------|
| Mux video | `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET` | `https://TU-DOMINIO/api/webhooks/mux` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` | `https://TU-DOMINIO/api/webhooks/stripe` |
| LiveKit | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_*` | `https://TU-DOMINIO/api/webhooks/livekit` |
| Web Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | — |
| QR asistencia | `QR_ATTENDANCE_HMAC_SECRET` | — |

- [ ] Stripe Price ID del producto de **este** curso (no reutilizar el del diplomado)
- [ ] Mux signing keys si usas playback firmado

## 6. Deploy

- [ ] Site en Netlify (o copiar `netlify.toml.example`)
- [ ] Node 20+
- [ ] Todas las env vars en el panel (las `NEXT_PUBLIC_*` requieren rebuild)
- [ ] Auth redirect URLs de producción en Supabase

## 7. Humo

- [ ] Registro → queda en `/pending` hasta que un admin active
- [ ] Admin activa alumno → entra a `/dashboard`
- [ ] Subir una lección de video (Mux) y un quiz
- [ ] Completar quiz → progreso de módulo y certificado si `auto_certificates` está en true
- [ ] Foro, comentarios de lección y QR de un taller
