-- Guía de primer ingreso configurable desde el panel.
-- El alumno lee las pantallas activas. Publicar sube la versión y la vuelve a mostrar
-- a quien ya la había cerrado. Si no hay filas, el portal usa el recorrido fijo del código.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_portal_guide_version_range;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_portal_guide_version_range
  CHECK (portal_guide_version >= 0 AND portal_guide_version <= 32767);

CREATE OR REPLACE FUNCTION public.mark_portal_guide_seen(p_version smallint)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.profiles;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF p_version IS NULL OR p_version < 1 OR p_version > 32767 THEN
    RAISE EXCEPTION 'Versión de guía inválida';
  END IF;

  UPDATE public.profiles
  SET
    portal_guide_completed_at = now(),
    portal_guide_version = GREATEST(portal_guide_version, p_version)
  WHERE id = v_uid
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado';
  END IF;

  RETURN v_row;
END;
$$;

CREATE TABLE public.portal_welcome_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  published_version smallint NOT NULL DEFAULT 1 CHECK (published_version >= 1 AND published_version <= 32767),
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.portal_welcome_settings IS
  'Versión publicada de la guía del portal. Una sola fila (id = 1).';

CREATE TABLE public.portal_welcome_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'enrolled', 'waitlist', 'no_course')),
  kicker text NOT NULL DEFAULT '',
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 140),
  body text NOT NULL DEFAULT '',
  detail text[] NOT NULL DEFAULT '{}',
  media_kind text NOT NULL DEFAULT 'none' CHECK (media_kind IN ('none', 'image', 'video')),
  media_url text,
  media_alt text,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_welcome_slides_body_len CHECK (char_length(body) <= 2000),
  CONSTRAINT portal_welcome_slides_kicker_len CHECK (char_length(kicker) <= 60),
  CONSTRAINT portal_welcome_slides_alt_len CHECK (media_alt IS NULL OR char_length(media_alt) <= 180),
  CONSTRAINT portal_welcome_slides_detail_count CHECK (cardinality(detail) <= 8),
  CONSTRAINT portal_welcome_slides_media_url CHECK (
    media_url IS NULL OR (media_url LIKE 'https://%' AND char_length(media_url) <= 2000)
  )
);

COMMENT ON TABLE public.portal_welcome_slides IS
  'Pantallas de la inducción del alumno. audience limita a inscritos, lista de espera o sin curso.';
COMMENT ON COLUMN public.portal_welcome_slides.media_kind IS
  'none, image (JPG/PNG/WebP en course-images) o video (enlace YouTube, Vimeo, Drive o Loom).';

CREATE INDEX portal_welcome_slides_order_idx
  ON public.portal_welcome_slides (sort_order, created_at);

DROP TRIGGER IF EXISTS portal_welcome_settings_updated_at ON public.portal_welcome_settings;
CREATE TRIGGER portal_welcome_settings_updated_at
  BEFORE UPDATE ON public.portal_welcome_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS portal_welcome_slides_updated_at ON public.portal_welcome_slides;
CREATE TRIGGER portal_welcome_slides_updated_at
  BEFORE UPDATE ON public.portal_welcome_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.portal_welcome_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_welcome_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS portal_welcome_settings_read ON public.portal_welcome_settings;
CREATE POLICY portal_welcome_settings_read ON public.portal_welcome_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS portal_welcome_settings_staff_update ON public.portal_welcome_settings;
CREATE POLICY portal_welcome_settings_staff_update ON public.portal_welcome_settings
  FOR UPDATE TO authenticated
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

DROP POLICY IF EXISTS portal_welcome_slides_read ON public.portal_welcome_slides;
CREATE POLICY portal_welcome_slides_read ON public.portal_welcome_slides
  FOR SELECT TO authenticated
  USING (enabled OR public.is_editor());

DROP POLICY IF EXISTS portal_welcome_slides_staff_write ON public.portal_welcome_slides;
CREATE POLICY portal_welcome_slides_staff_write ON public.portal_welcome_slides
  FOR ALL TO authenticated
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

REVOKE ALL ON TABLE public.portal_welcome_settings FROM anon;
REVOKE ALL ON TABLE public.portal_welcome_slides FROM anon;
GRANT SELECT, UPDATE ON TABLE public.portal_welcome_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.portal_welcome_slides TO authenticated;

CREATE OR REPLACE FUNCTION public.publish_portal_welcome()
RETURNS smallint
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_version smallint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debe iniciar sesión';
  END IF;

  IF NOT public.is_editor() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE public.portal_welcome_settings
  SET
    published_version = LEAST(published_version + 1, 32767),
    published_at = now()
  WHERE id = 1
  RETURNING published_version INTO v_version;

  IF v_version IS NULL THEN
    RAISE EXCEPTION 'La configuración de la guía no existe';
  END IF;

  RETURN v_version;
END;
$$;

COMMENT ON FUNCTION public.publish_portal_welcome() IS
  'Sube la versión publicada de la guía. Quien tenga una versión menor la vuelve a ver.';

REVOKE ALL ON FUNCTION public.publish_portal_welcome() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_portal_welcome() TO authenticated;

INSERT INTO public.portal_welcome_settings (id, published_version)
VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_welcome_slides (
  id, sort_order, enabled, audience, kicker, title, body, detail, media_kind
)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    10,
    true,
    'all',
    'Bienvenida',
    'Este es tu portal del curso',
    'Aquí están las clases, las evaluaciones y los talleres. En las siguientes pantallas verás dónde está cada cosa. Puedes saltar la guía y abrirla otra vez desde Resumen.',
    ARRAY[
      'Se muestra la primera vez que entras.',
      'En Resumen queda el enlace Guía del portal.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    20,
    true,
    'all',
    'Tu portal',
    'Cuatro lugares, y ya puedes estudiar',
    'Este portal concentra tu curso. Lo demás (quizzes, tareas, avisos, constancia y estudio) está en las pestañas de arriba cuando lo necesites.',
    ARRAY[
      'Cursos, en Resumen: el programa en el que estás inscrito.',
      'Clases: las lecciones, en orden.',
      'Desempeño: cómo se calcula tu avance.',
      'Talleres en vivo: aquí aparecerán las sesiones cuando se publiquen.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    30,
    true,
    'all',
    'Clases',
    'Las lecciones están en la pestaña Clases',
    'Ahí está el temario. En Resumen, cada módulo tiene Empezar, Continuar o Repasar, y abre la lección que sigue.',
    ARRAY[
      'Pestaña Clases.',
      'En Resumen, el botón del módulo abre la siguiente lección.',
      'Puedes volver al mismo punto: el portal recuerda la última lección visitada.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000004',
    40,
    true,
    'enrolled',
    'Tu curso',
    'Tu curso ya está activo',
    'En Resumen, la tarjeta del curso dice Activo / Cursando. Empezar clases abre la pestaña Clases. La primera lección pendiente es el inicio del curso.',
    ARRAY[
      'Resumen muestra tu tarjeta de curso.',
      'Clases contiene el temario del programa admitido.',
      'Consulta el estado de tu acceso en cualquier momento.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000005',
    41,
    true,
    'waitlist',
    'Tu curso',
    'Tu solicitud de curso está en revisión',
    'La tarjeta del curso en Resumen dice En lista de espera. Cuando la dirección la apruebe, el botón pasa a Empezar clases. Mientras tanto puedes revisar el estado en esa misma tarjeta.',
    ARRAY[
      'Resumen muestra tu tarjeta de curso.',
      'Clases contiene el temario del programa admitido.',
      'Consulta el estado de tu acceso en cualquier momento.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000006',
    42,
    true,
    'no_course',
    'Tu curso',
    'Primero solicita el curso',
    'En Resumen, cada programa tiene Solicitar admisión. Sin esa admisión la pestaña Clases no abre el temario de ese curso.',
    ARRAY[
      'Resumen muestra tu tarjeta de curso.',
      'Clases contiene el temario del programa admitido.',
      'Consulta el estado de tu acceso en cualquier momento.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000007',
    50,
    true,
    'all',
    'Evaluación',
    'Tu avance se ve en Desempeño',
    'La pestaña Desempeño muestra el promedio de Capa A. El promedio junta exámenes y quizzes teóricos (30), tareas y casos prácticos (30), asistencia a clases y talleres (20) y avance curricular en la plataforma (20). Para acreditar hacen falta 80 de 100.',
    ARRAY[
      'Pestaña Desempeño: desglose y ponderación actual.',
      'Pestaña Quizzes: registro de cada intento formativo.',
      'Pestaña Constancia: disponible al acreditar los requisitos.'
    ]::text[],
    'none'
  ),
  (
    'a1000000-0000-4000-8000-000000000008',
    60,
    true,
    'all',
    'Talleres',
    'Los talleres aparecen en Resumen',
    'A la derecha de Resumen está Talleres en vivo. Si hoy dice que no hay sesión, es normal: la convocatoria se publica en ese panel y en Talleres.',
    ARRAY[
      'Panel Talleres en vivo, en Resumen.',
      'Catálogo y grabaciones en la página Talleres.',
      'Cada sesión abierta muestra fecha y enlace al detalle.'
    ]::text[],
    'none'
  )
ON CONFLICT (id) DO NOTHING;
