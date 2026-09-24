-- Inducción de primer ingreso al portal del alumno.
-- La marca vive en el perfil. No es dato público ni académico.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS portal_guide_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS portal_guide_version smallint NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.portal_guide_completed_at IS
  'Momento en que el alumno terminó o saltó la guía del portal. NULL solo si portal_guide_version es 0.';
COMMENT ON COLUMN public.profiles.portal_guide_version IS
  'Última edición de la guía del portal que el alumno ya vio. 0 = nunca.';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_portal_guide_version_range;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_portal_guide_version_range
  CHECK (portal_guide_version >= 0 AND portal_guide_version <= 20);

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

  IF p_version IS NULL OR p_version < 1 OR p_version > 20 THEN
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

COMMENT ON FUNCTION public.mark_portal_guide_seen(smallint) IS
  'Marca la guía del portal como vista para auth.uid(). El servidor pone now(). No baja la versión ya guardada.';

REVOKE ALL ON FUNCTION public.mark_portal_guide_seen(smallint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_portal_guide_seen(smallint) TO authenticated;
