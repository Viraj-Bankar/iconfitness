-- ============================================================
-- ICON FITNESS — Production Security Hardening Migration
-- Idempotent Security Patch for Existing Supabase Databases
-- Scope: public.gallery_items, public.reviews, storage.objects
-- ============================================================

-- 1. Helper Function: Verify Authenticated Owner Identity
-- Restricts administrative access strictly to the verified gym owner email or 'owner' / 'admin' role in app_metadata.
-- SECURITY: NEVER trusts user-editable user_metadata (raw_user_meta_data).
CREATE OR REPLACE FUNCTION public.is_authorized_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND (
            coalesce(auth.jwt() ->> 'email', '') = 'owner@iconfitness.com'
            OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('owner', 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 2. Harden public.reviews Table RLS
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop all legacy and current policies on public.reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can insert pending website reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authorized owner can manage all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Service role has unrestricted review access" ON public.reviews;

-- Recreate hardened policies on public.reviews
CREATE POLICY "Public can view approved reviews"
    ON public.reviews
    FOR SELECT
    TO anon, authenticated
    USING (status = 'approved' OR public.is_authorized_owner());

CREATE POLICY "Public can insert pending website reviews"
    ON public.reviews
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending' AND source = 'website');

CREATE POLICY "Authorized owner can manage all reviews"
    ON public.reviews
    FOR ALL
    TO authenticated
    USING (public.is_authorized_owner())
    WITH CHECK (public.is_authorized_owner());

CREATE POLICY "Service role has unrestricted review access"
    ON public.reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------
-- 3. Harden public.gallery_items Table RLS
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Drop all legacy and current policies on public.gallery_items
DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Authenticated owner has full access to gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Authorized owner can insert gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Authorized owner can update gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Authorized owner can delete gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Service role unrestricted gallery access" ON public.gallery_items;

-- Recreate hardened policies on public.gallery_items
CREATE POLICY "Public can view published gallery items"
    ON public.gallery_items
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR public.is_authorized_owner());

CREATE POLICY "Authorized owner can insert gallery items"
    ON public.gallery_items
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_owner());

CREATE POLICY "Authorized owner can update gallery items"
    ON public.gallery_items
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_owner())
    WITH CHECK (public.is_authorized_owner());

CREATE POLICY "Authorized owner can delete gallery items"
    ON public.gallery_items
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_owner());

CREATE POLICY "Service role unrestricted gallery access"
    ON public.gallery_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------
-- 4. Ensure Storage Bucket & Harden storage.objects Policies
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gym-gallery',
    'gym-gallery',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Drop all legacy and current storage policies for gym-gallery
DROP POLICY IF EXISTS "Public can view gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Owner can upload gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can upload gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can update gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can delete gallery objects" ON storage.objects;

-- Recreate hardened storage policies
CREATE POLICY "Public can view gallery objects"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'gym-gallery');

CREATE POLICY "Authorized owner can upload gallery objects"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'gym-gallery' AND public.is_authorized_owner());

CREATE POLICY "Authorized owner can update gallery objects"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'gym-gallery' AND public.is_authorized_owner())
    WITH CHECK (bucket_id = 'gym-gallery' AND public.is_authorized_owner());

CREATE POLICY "Authorized owner can delete gallery objects"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'gym-gallery' AND public.is_authorized_owner());

