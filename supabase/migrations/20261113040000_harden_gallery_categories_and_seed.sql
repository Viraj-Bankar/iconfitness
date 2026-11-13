-- ============================================================
-- ICON FITNESS — Gallery Category Management & Baseline Media Seed
-- Idempotent Migration: Standardizes 10 Predefined Categories & Seeds Baseline Media
-- ============================================================

-- 1. Ensure category and category_label columns exist and default to 'Other'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.gallery_items ADD COLUMN category VARCHAR(60) NOT NULL DEFAULT 'Other';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category_label'
    ) THEN
        ALTER TABLE public.gallery_items ADD COLUMN category_label VARCHAR(60) NOT NULL DEFAULT 'Other';
    END IF;
END $$;

ALTER TABLE public.gallery_items ALTER COLUMN category SET DEFAULT 'Other';
ALTER TABLE public.gallery_items ALTER COLUMN category_label SET DEFAULT 'Other';

-- 2. Migrate legacy category slugs to official predefined categories
UPDATE public.gallery_items SET category = 'Gym Interior', category_label = 'Gym Interior' 
WHERE lower(category) IN ('interior', 'gym interior');

UPDATE public.gallery_items SET category = 'Equipment', category_label = 'Equipment' 
WHERE lower(category) IN ('equipment');

UPDATE public.gallery_items SET category = 'Strength Training', category_label = 'Strength Training' 
WHERE lower(category) IN ('strength', 'strength training');

UPDATE public.gallery_items SET category = 'Cardio', category_label = 'Cardio' 
WHERE lower(category) IN ('cardio');

UPDATE public.gallery_items SET category = 'Zumba', category_label = 'Zumba' 
WHERE lower(category) IN ('zumba');

UPDATE public.gallery_items SET category = 'Yoga', category_label = 'Yoga' 
WHERE lower(category) IN ('yoga');

UPDATE public.gallery_items SET category = 'Personal Training', category_label = 'Personal Training' 
WHERE lower(category) IN ('trainers', 'personal training');

UPDATE public.gallery_items SET category = 'Events & Activities', category_label = 'Events & Activities' 
WHERE lower(category) LIKE '%event%' OR lower(category) LIKE '%activit%';

UPDATE public.gallery_items SET category = 'Transformations', category_label = 'Transformations' 
WHERE lower(category) LIKE '%transform%';

-- 3. Indexes for fast category and status filtering
CREATE INDEX IF NOT EXISTS idx_gallery_items_published_created 
    ON public.gallery_items (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category_published 
    ON public.gallery_items (category, is_published);

-- 4. Verify & Harden RLS Policies on public.gallery_items
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published gallery items" ON public.gallery_items;
CREATE POLICY "Public can view published gallery items"
    ON public.gallery_items
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR public.is_authorized_owner());

DROP POLICY IF EXISTS "Authorized owner can insert gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can insert gallery items"
    ON public.gallery_items
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_owner());

DROP POLICY IF EXISTS "Authorized owner can update gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can update gallery items"
    ON public.gallery_items
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_owner())
    WITH CHECK (public.is_authorized_owner());

DROP POLICY IF EXISTS "Authorized owner can delete gallery items" ON public.gallery_items;
CREATE POLICY "Authorized owner can delete gallery items"
    ON public.gallery_items
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_owner());

DROP POLICY IF EXISTS "Service role unrestricted gallery access" ON public.gallery_items;
CREATE POLICY "Service role unrestricted gallery access"
    ON public.gallery_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Seed Baseline Official Gym Media (Idempotent: only inserts when missing)
INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000001'::uuid,
    '4,000 Sq. Ft. Workout Floor',
    'Actual Photo: Wide-angle view of ICON FITNESS main floor with green turf strip, strength equipment, and mirror walls in Moshi.',
    'Gym Interior',
    'Gym Interior',
    '/assets/gallery/real-gym-wide-interior.jpg',
    'image',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = '/assets/gallery/real-gym-wide-interior.jpg'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000002'::uuid,
    'Turf Lane & Battle Ropes',
    'Actual Photo: Functional training turf strip with battle ropes, agility ladder, heavy tire, and plate-loaded machines.',
    'Strength Training',
    'Strength Training',
    '/assets/gallery/real-gym-floor-battleropes.jpg',
    'image',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = '/assets/gallery/real-gym-floor-battleropes.jpg'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000003'::uuid,
    'Dedicated Cardio Section',
    'Actual Photo: Commercial treadmills, ellipticals, and stationary spin bikes for endurance conditioning.',
    'Cardio',
    'Cardio',
    '/assets/gallery/real-gym-cardio.jpg',
    'image',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = '/assets/gallery/real-gym-cardio.jpg'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000004'::uuid,
    'Official Gym Fees & Brand Poster',
    'Official promotional poster displaying ICON FITNESS gym fees, slogans, and contact details.',
    'Gym Interior',
    'Gym Interior',
    '/assets/gallery/official-poster.jpg',
    'image',
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = '/assets/gallery/official-poster.jpg'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000005'::uuid,
    'Heavy Free Weights Station',
    'Commercial dumbbells, barbells, and ergonomic benches for progressive resistance.',
    'Equipment',
    'Equipment',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    'image',
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000006'::uuid,
    'High-Energy Zumba Class',
    'Rhythmic group dance sessions combining calorie burn with uplifting music.',
    'Zumba',
    'Zumba',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    'image',
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000007'::uuid,
    'Mindful Yoga & Mobility',
    'Dedicated space for flexibility, mobility routines, and yoga flows.',
    'Yoga',
    'Yoga',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    'image',
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO public.gallery_items (
    id, title, caption, category, category_label, media_url, media_type, is_published, is_real_gym_photo
)
SELECT
    '10000000-0000-0000-0000-000000000008'::uuid,
    'Personal Training Guidance',
    'Floor coaches offering form checking, posture guidance, and training support.',
    'Personal Training',
    'Personal Training',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
    'image',
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.gallery_items WHERE media_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80'
);

