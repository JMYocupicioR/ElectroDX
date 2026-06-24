REVOKE ALL ON FUNCTION public.is_enrolled_physician(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_physician_enrollment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_physician_enrollment(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_physician_enrollment(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.verify_physician_enrollment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_physician_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_physician_enrollment(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.sync_enrollment_request() FROM PUBLIC, anon, authenticated;
