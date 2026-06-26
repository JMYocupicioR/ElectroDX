-- ═══════════════════════════════════════════════════════════════════════════════
-- E-Learning Access Tiers, Subscriptions & Live Workshops
-- Phase 1: Data model & access-control functions
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1A. ENUMs ──────────────────────────────────────────────────────────────

DO $$ BEGIN
    CREATE TYPE public.access_tier AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.workshop_status AS ENUM ('draft', 'scheduled', 'live', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── 1B. Subscriptions (separate from profiles) ────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier public.access_tier NOT NULL DEFAULT 'premium',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,                     -- NULL = lifetime
    payment_method TEXT,                         -- 'stripe', 'transfer', 'manual', 'promo'
    payment_reference TEXT,                      -- External transaction ID
    notes TEXT,                                  -- Admin notes ("Beca", "Cortesía congreso")
    granted_by UUID REFERENCES auth.users(id),   -- Who granted the subscription
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, is_active)
    WHERE is_active = true;

-- ─── 1C. Module access control ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.module_access (
    module_id TEXT PRIMARY KEY,
    required_tier public.access_tier NOT NULL DEFAULT 'free',
    preview_topic_ids TEXT[] DEFAULT '{}',        -- Topics visible as preview even if module is premium
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- ─── 1D. video_url on published_topics ──────────────────────────────────────

ALTER TABLE public.published_topics
    ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ─── 1E. Live Workshops ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.live_workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    topic_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 90,
    stream_url TEXT,                              -- Zoom / YouTube / Vimeo live URL
    recording_url TEXT,                           -- Post-workshop recording URL
    max_capacity INT,                             -- NULL = unlimited
    clinical_case_revision_id UUID                -- Link to processed clinical case
        REFERENCES public.content_revisions(id) ON DELETE SET NULL,
    clinical_case_json JSONB,                     -- Snapshot of processed EMG case
    status public.workshop_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workshops_scheduled ON public.live_workshops(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_workshops_module ON public.live_workshops(module_id);

-- ─── 1F. Workshop registrations ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workshop_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID NOT NULL REFERENCES public.live_workshops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    UNIQUE (workshop_id, user_id)
);

-- ─── Triggers ───────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS live_workshops_updated_at ON public.live_workshops;
CREATE TRIGGER live_workshops_updated_at
    BEFORE UPDATE ON public.live_workshops
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS module_access_updated_at ON public.module_access;
CREATE TRIGGER module_access_updated_at
    BEFORE UPDATE ON public.module_access
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Access-control functions
-- ═══════════════════════════════════════════════════════════════════════════════

-- Does the user have active premium access?
CREATE OR REPLACE FUNCTION public.has_premium_access(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT public.is_admin(check_user_id)
        OR public.is_verified_contributor(check_user_id)
        OR EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE user_id = check_user_id
              AND tier = 'premium'
              AND is_active = true
              AND (expires_at IS NULL OR expires_at > now())
        );
$$;

-- Can the user access this module?
CREATE OR REPLACE FUNCTION public.can_access_module(
    p_module_id TEXT,
    check_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT
        -- No access config means free by default
        NOT EXISTS (SELECT 1 FROM public.module_access WHERE module_id = p_module_id)
        -- Explicitly free module
        OR (SELECT required_tier FROM public.module_access WHERE module_id = p_module_id) = 'free'
        -- User has premium
        OR public.has_premium_access(check_user_id);
$$;

-- Admin: grant premium subscription manually
CREATE OR REPLACE FUNCTION public.grant_premium_access(
    target_user_id UUID,
    p_method TEXT DEFAULT 'manual',
    p_reference TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo administradores pueden otorgar acceso premium';
    END IF;

    INSERT INTO public.subscriptions (user_id, tier, payment_method, payment_reference, notes, granted_by, expires_at)
    VALUES (target_user_id, 'premium', p_method, p_reference, p_notes, auth.uid(), p_expires_at)
    ON CONFLICT (user_id, tier) DO UPDATE SET
        is_active = true,
        starts_at = now(),
        payment_method = EXCLUDED.payment_method,
        payment_reference = EXCLUDED.payment_reference,
        notes = EXCLUDED.notes,
        expires_at = EXCLUDED.expires_at,
        granted_by = EXCLUDED.granted_by;

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata)
    VALUES (auth.uid(), 'grant_premium', 'user', target_user_id::text,
        jsonb_build_object('method', p_method, 'reference', p_reference, 'expires', p_expires_at));
END;
$$;

-- Admin: revoke premium subscription
CREATE OR REPLACE FUNCTION public.revoke_premium_access(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo administradores pueden revocar acceso premium';
    END IF;

    UPDATE public.subscriptions
    SET is_active = false
    WHERE user_id = target_user_id AND tier = 'premium';

    INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id)
    VALUES (auth.uid(), 'revoke_premium', 'user', target_user_id::text);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Update admin_get_stats with business metrics
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
    IF NOT public.is_admin() AND NOT public.has_role('editor') THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;
    SELECT jsonb_build_object(
        'pending_users',       (SELECT count(*) FROM public.profiles WHERE verified_at IS NULL),
        'verified_users',      (SELECT count(*) FROM public.profiles WHERE verified_at IS NOT NULL),
        'pending_enrollments', (SELECT count(*) FROM public.profiles WHERE enrollment_status = 'pending'),
        'enrolled_physicians', (SELECT count(*) FROM public.profiles WHERE enrollment_status = 'approved'),
        'premium_users',       (SELECT count(*) FROM public.subscriptions WHERE tier = 'premium' AND is_active = true AND (expires_at IS NULL OR expires_at > now())),
        'pending_revisions',   (SELECT count(*) FROM public.content_revisions WHERE status = 'pending_review'),
        'published_topics',    (SELECT count(*) FROM public.published_topics),
        'published_quizzes',   (SELECT count(*) FROM public.published_quizzes),
        'quiz_attempts_total', (SELECT count(*) FROM public.quiz_attempts),
        'approved_revisions',  (SELECT count(*) FROM public.content_revisions WHERE status = 'approved'),
        'upcoming_workshops',  (SELECT count(*) FROM public.live_workshops WHERE status IN ('scheduled', 'live') AND scheduled_at > now()),
        'total_workshops',     (SELECT count(*) FROM public.live_workshops WHERE status != 'draft')
    ) INTO result;
    RETURN result;
END; $$;

-- Update admin_list_profiles to include premium status and filter
DROP FUNCTION IF EXISTS public.admin_list_profiles(boolean, text);
CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  pending_only boolean DEFAULT false,
  enrollment_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid, email text, display_name text, credentials text, institution text,
  specialty text, bio text, avatar_url text, is_public boolean,
  cedula_profesional text,
  verified_at timestamptz,
  enrollment_status public.enrollment_status,
  enrollment_verified_at timestamptz,
  enrollment_requested_at timestamptz,
  created_at timestamptz,
  roles text[],
  has_premium boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
  SELECT
    p.id, u.email::text, p.display_name, p.credentials, p.institution, p.specialty,
    p.bio, p.avatar_url, p.is_public, p.cedula_profesional,
    p.verified_at, p.enrollment_status, p.enrollment_verified_at, p.enrollment_requested_at,
    p.created_at,
    COALESCE(ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.id), '{}'::text[]),
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = p.id
          AND s.tier = 'premium'
          AND s.is_active = true
          AND (s.expires_at IS NULL OR s.expires_at > now())
    ) AS has_premium
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE
    CASE enrollment_filter
      WHEN 'enrollment_pending' THEN p.enrollment_status = 'pending'
      WHEN 'enrolled' THEN p.enrollment_status = 'approved'
      WHEN 'contributor_pending' THEN p.verified_at IS NULL
      WHEN 'contributors' THEN p.verified_at IS NOT NULL
      WHEN 'premium' THEN EXISTS (
          SELECT 1 FROM public.subscriptions s
          WHERE s.user_id = p.id
            AND s.tier = 'premium'
            AND s.is_active = true
            AND (s.expires_at IS NULL OR s.expires_at > now())
      )
      ELSE NOT pending_only OR p.verified_at IS NULL
    END
  ORDER BY p.created_at DESC;
END; $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Update get_my_auth_context to include premium status
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_my_auth_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE
        WHEN auth.uid() IS NULL THEN NULL
        ELSE jsonb_build_object(
            'profile', (SELECT to_jsonb(p.*) FROM public.profiles p WHERE p.id = auth.uid()),
            'roles', COALESCE(
                (SELECT jsonb_agg(ur.role ORDER BY ur.role) FROM public.user_roles ur WHERE ur.user_id = auth.uid()),
                '[]'::jsonb
            ),
            'bootstrap_available', NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'),
            'has_premium', public.has_premium_access(auth.uid()),
            'subscription', (
                SELECT to_jsonb(s.*)
                FROM public.subscriptions s
                WHERE s.user_id = auth.uid()
                  AND s.tier = 'premium'
                  AND s.is_active = true
                  AND (s.expires_at IS NULL OR s.expires_at > now())
                LIMIT 1
            )
        )
    END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS policies
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Subscriptions: self-read + admin reads all
DROP POLICY IF EXISTS "subscriptions_self_read" ON public.subscriptions;
CREATE POLICY "subscriptions_self_read" ON public.subscriptions FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

-- Module access: public read (frontend needs this to show locks)
DROP POLICY IF EXISTS "module_access_public_read" ON public.module_access;
CREATE POLICY "module_access_public_read" ON public.module_access FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "module_access_admin_insert" ON public.module_access;
CREATE POLICY "module_access_admin_insert" ON public.module_access FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "module_access_admin_update" ON public.module_access;
CREATE POLICY "module_access_admin_update" ON public.module_access FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "module_access_admin_delete" ON public.module_access;
CREATE POLICY "module_access_admin_delete" ON public.module_access FOR DELETE
    USING (public.is_admin());

-- Workshops: public reads scheduled+, admin full access
DROP POLICY IF EXISTS "workshops_public_read" ON public.live_workshops;
CREATE POLICY "workshops_public_read" ON public.live_workshops FOR SELECT
    USING (status IN ('scheduled', 'live', 'completed'));

DROP POLICY IF EXISTS "workshops_admin_insert" ON public.live_workshops;
CREATE POLICY "workshops_admin_insert" ON public.live_workshops FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "workshops_admin_update" ON public.live_workshops;
CREATE POLICY "workshops_admin_update" ON public.live_workshops FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "workshops_admin_delete" ON public.live_workshops;
CREATE POLICY "workshops_admin_delete" ON public.live_workshops FOR DELETE
    USING (public.is_admin());

-- Workshop registrations: self-read + admin reads all
DROP POLICY IF EXISTS "registrations_self_read" ON public.workshop_registrations;
CREATE POLICY "registrations_self_read" ON public.workshop_registrations FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "registrations_premium_insert" ON public.workshop_registrations;
CREATE POLICY "registrations_premium_insert" ON public.workshop_registrations FOR INSERT
    WITH CHECK (user_id = auth.uid() AND public.has_premium_access());

DROP POLICY IF EXISTS "registrations_admin_update" ON public.workshop_registrations;
CREATE POLICY "registrations_admin_update" ON public.workshop_registrations FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "registrations_admin_delete" ON public.workshop_registrations;
CREATE POLICY "registrations_admin_delete" ON public.workshop_registrations FOR DELETE
    USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════════
-- Table-level GRANTs (PostgREST requires these alongside RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.module_access TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_access TO authenticated;
GRANT SELECT ON public.live_workshops TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_workshops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_registrations TO authenticated;

-- Function execution grants
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_module(text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.grant_premium_access(uuid, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_premium_access(uuid, text, text, text, timestamptz) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_premium_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_premium_access(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
