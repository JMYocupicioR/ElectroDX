-- Varios medios por pantalla de inducción: imagen, video o enlace.

ALTER TABLE public.portal_welcome_slides
  ADD COLUMN IF NOT EXISTS media_items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.portal_welcome_slides
  DROP CONSTRAINT IF EXISTS portal_welcome_slides_media_items_array;

ALTER TABLE public.portal_welcome_slides
  ADD CONSTRAINT portal_welcome_slides_media_items_array
  CHECK (
    jsonb_typeof(media_items) = 'array'
    AND jsonb_array_length(media_items) <= 30
  );

COMMENT ON COLUMN public.portal_welcome_slides.media_items IS
  'Lista de medios: {id, kind: image|video|link, url, label}.';

UPDATE public.portal_welcome_slides
SET media_items = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'kind', media_kind,
    'url', media_url,
    'label', COALESCE(media_alt, '')
  )
)
WHERE media_kind IN ('image', 'video')
  AND media_url IS NOT NULL
  AND media_items = '[]'::jsonb;
