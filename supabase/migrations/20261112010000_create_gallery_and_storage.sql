-- ============================================================
-- ICON FITNESS — Owner Gallery & Supabase Storage Migration
-- Table: public.gallery_items
-- Bucket: gym-gallery
-- Security: Strict Row Level Security (RLS) Owner Authorization
-- ============================================================

-- 1. Create gallery_items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150),
    caption TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'interior',
    category_label VARCHAR(60) NOT NULL DEFAULT 'Gym Gallery',
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    file_path TEXT,
    file_size BIGINT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_real_gym_photo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast query filtering
CREATE INDEX IF NOT EXISTS idx_gallery_items_published ON public.gallery_items (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items (category);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gallery_updated_at ON public.gallery_items;
CREATE TRIGGER trigger_gallery_updated_at
    BEFORE UPDATE ON public.gallery_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_gallery_updated_at();

-- 4. Helper Function: Verify Authenticated Owner Identity
-- Restricts administrative access strictly to the verified gym owner email or 'owner' / 'admin' role in app_metadata.
-- SECURITY: NEVER trusts user-editable user_metadata.
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

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- 6. Database Row Level Security Policies

-- Policy A: Public anonymous visitors and non-owners can ONLY SELECT published gallery items
-- The authorized owner can SELECT all items (including unpublished drafts)
DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery_items;
CREATE POLICY "Public can view published gallery items"
    ON public.gallery_items
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR public.is_authorized_owner());

-- Policy B: Only the explicitly authorized gym owner can INSERT gallery items
DROP POLICY IF EXISTS "Authenticated owner has full access to gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Authorized owner can insert gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can insert gallery items"
    ON public.gallery_items
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_owner());

-- Policy C: Only the explicitly authorized gym owner can UPDATE gallery items
DROP POLICY IF EXISTS "Authorized owner can update gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can update gallery items"
    ON public.gallery_items
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_owner())
    WITH CHECK (public.is_authorized_owner());

-- Policy D: Only the explicitly authorized gym owner can DELETE gallery items
DROP POLICY IF EXISTS "Authorized owner can delete gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can delete gallery items"
    ON public.gallery_items
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_owner());

-- Policy E: Service role has unrestricted access for server-side maintenance
DROP POLICY IF EXISTS "Service role unrestricted gallery access" ON public.gallery_items;
CREATE POLICY "Service role unrestricted gallery access"
    ON public.gallery_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Supabase Storage Bucket Configuration
-- Create public storage bucket for gym media
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

-- 8. Storage Policies for 'gym-gallery' bucket

-- Public read access for images and videos
DROP POLICY IF EXISTS "Public can view gallery objects" ON storage.objects;
CREATE POLICY "Public can view gallery objects"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'gym-gallery');

-- Strictly authorized owner can upload media
DROP POLICY IF EXISTS "Owner can upload gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can upload gallery objects" ON storage.objects;
CREATE POLICY "Authorized owner can upload gallery objects"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'gym-gallery' AND public.is_authorized_owner());

-- Strictly authorized owner can update media
DROP POLICY IF EXISTS "Owner can update gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can update gallery objects" ON storage.objects;
CREATE POLICY "Authorized owner can update gallery objects"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'gym-gallery' AND public.is_authorized_owner())
    WITH CHECK (bucket_id = 'gym-gallery' AND public.is_authorized_owner());

-- Strictly authorized owner can delete media
DROP POLICY IF EXISTS "Owner can delete gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Authorized owner can delete gallery objects" ON storage.objects;
CREATE POLICY "Authorized owner can delete gallery objects"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'gym-gallery' AND public.is_authorized_owner());
