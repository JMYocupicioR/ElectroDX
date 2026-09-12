-- LMS kit: seed genérico. Cambia slug, título y certificado antes de producir.
-- Debe coincidir con src/lib/data.ts DEFAULT_COURSE_SLUG.

insert into public.courses (title, slug, description, is_published, order_index)
values (
  'Curso principal',
  'curso-principal',
  'Reemplaza este texto por la descripción pública del programa.',
  true,
  0
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  is_published = true,
  updated_at = now();

insert into public.app_settings (key, value, description)
values
  ('maintenance_mode', 'false'::jsonb, 'Bloquea el acceso a estudiantes.'),
  ('announcement_banner', '{"active": false, "message": "", "type": "info"}'::jsonb, 'Banner global del dashboard.'),
  ('auto_certificates', 'true'::jsonb, 'Emitir certificados al completar módulos.'),
  ('require_evaluations_for_cert', 'true'::jsonb, 'Exigir quizzes aprobados para certificar.'),
  ('allow_certificate_download', 'true'::jsonb, 'Permitir descarga de PDF.'),
  ('min_video_completion_pct', '99'::jsonb, 'Porcentaje mínimo de video para completar lección.'),
  ('admin_notification_prefs', '{"access":{"enabled":true,"push":true},"progress":{"enabled":true,"push":false},"quiz":{"enabled":true,"push":true},"assignment":{"enabled":true,"push":true},"community":{"enabled":true,"push":true},"attendance":{"enabled":true,"push":true},"certificate":{"enabled":true,"push":true},"survey":{"enabled":true,"push":false},"login":{"enabled":true,"inactivity_days":7}}'::jsonb, 'Alertas inbound de administradores')
on conflict (key) do nothing;

insert into public.certificate_config (
  course_id,
  course_name,
  folio_prefix,
  course_hours,
  institutional_text,
  primary_color,
  signers
)
select
  c.id,
  c.title,
  'CERT-',
  '40',
  'Se otorga el presente certificado por haber completado satisfactoriamente el programa.',
  '#0ea5e9',
  '[{"name":"Director del Curso","role":"Director","signature_url":null}]'::jsonb
from public.courses c
where c.slug = 'curso-principal'
  and not exists (
    select 1 from public.certificate_config cc where cc.course_id = c.id
  );

-- Primer admin (después de registrarte en /register):
-- update public.profiles set role = 'admin', is_active = true where email = 'admin@ejemplo.com';
