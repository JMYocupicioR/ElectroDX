# Archivos de marca (esta instancia)

Al clonar, busca y sustituye estos puntos. El slug del seed (`curso-principal` en `database/05_seed.example.sql`) debe coincidir con `DEFAULT_COURSE_SLUG`.

## Identidad

| Qué | Dónde |
|-----|--------|
| Nombre npm | `package.json` → `name` |
| Slug por defecto | `src/lib/data.ts` → `DEFAULT_COURSE_SLUG` |
| Slug Stripe | `src/app/api/webhooks/stripe/route.ts` → `DEFAULT_COURSE_SLUG` |
| PWA | `src/app/manifest.ts` |
| Logo componente | `src/components/ui/logo.tsx` |
| Logo login | `src/app/login/page.tsx` |
| Assets | `public/logos/` |
| Splash PWA | `package.json` → `generate-pwa-assets` |

## Copy y legal

| Qué | Dónde |
|-----|--------|
| Landing | `src/app/page.tsx`, `src/app/LandingNavClient.tsx` |
| Registro / login / pending | `src/app/register/page.tsx`, `src/app/login/page.tsx`, `src/app/pending/` |
| Términos | `src/app/terminos/page.tsx` |
| Privacidad | `src/app/privacidad/page.tsx` |
| Soporte | `src/app/soporte/page.tsx` |
| Certificados (copy y firmantes) | `src/app/certificates/page.tsx`, `src/components/certificates/` |
| Dashboard (placeholders USG) | `src/app/dashboard/page.tsx` |
| Player dual (cámara + ultrasonido) | `src/components/player/DualPlayer.tsx` — el hardware es de este diplomado; otro curso puede dejar un solo stream |

## Certificados en base de datos

El seed genérico no pone el nombre de Raúl Morales. Ajusta después en `/admin/certificados` o con:

```sql
update public.certificate_config
set
  course_name = 'Título del curso',
  folio_prefix = 'CERT-XXX-',
  course_hours = '40',
  institutional_text = '…',
  signers = '[{"name":"…","role":"Director del Curso","signature_url":null}]'::jsonb;
```

## Búsqueda rápida de copy de esta instancia

```
Raúl Morales
raulmorales
diplomado-rehabilitacion-intervencionista
CursoUSG
ultrasonido
Ecografía
```
