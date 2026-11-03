-- Endurece la consulta pública de acuerdos del alumno:
-- devuelve el nombre enmascarado y deja de exponer el nombre completo.

CREATE OR REPLACE FUNCTION public.verify_student_agreement(p_folio text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN a.id IS NULL THEN jsonb_build_object('valid', false)
    ELSE jsonb_build_object(
      'valid', true,
      'folio', a.verification_folio,
      'document_type', a.document_type,
      'document_version', a.document_version,
      'full_name_masked', regexp_replace(a.full_name_typed, E'(\\S)\\S*', E'\\1***', 'g'),
      'signed_at', a.signed_at
    )
  END
  FROM (SELECT nullif(btrim(p_folio), '') AS folio) q
  LEFT JOIN public.student_agreements a ON a.verification_folio = q.folio;
$$;

GRANT EXECUTE ON FUNCTION public.verify_student_agreement(text) TO anon, authenticated;

COMMENT ON FUNCTION public.verify_student_agreement(text) IS
  'Verificación pública de un acuerdo firmado. Devuelve el nombre enmascarado. No expone IP, hash ni rutas de archivo.';
