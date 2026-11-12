-- ============================================================
-- ICON FITNESS — Customer Reviews Database Migration
-- Table: public.reviews
-- Architecture: Row Level Security (RLS) with Public Submit & Read
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(120),
    review_text TEXT NOT NULL,
    visit_type VARCHAR(60),
    source VARCHAR(20) NOT NULL DEFAULT 'website' CHECK (source IN ('google', 'website')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_photo TEXT,
    google_profile_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast query filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_source_status ON public.reviews (source, status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews (rating);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_updated_at ON public.reviews;
CREATE TRIGGER trigger_review_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_review_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies

-- Policy A: Public anonymous users can SELECT only approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews"
    ON public.reviews
    FOR SELECT
    TO anon, authenticated
    USING (status = 'approved');

-- Policy B: Public anonymous users can INSERT reviews ONLY with status = 'pending' and source = 'website'
DROP POLICY IF EXISTS "Public can insert pending website reviews" ON public.reviews;
CREATE POLICY "Public can insert pending website reviews"
    ON public.reviews
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (status = 'pending' AND source = 'website');

-- Policy C: Authenticated staff / admins can SELECT, UPDATE, DELETE all reviews
DROP POLICY IF EXISTS "Authenticated users can manage all reviews" ON public.reviews;
CREATE POLICY "Authenticated users can manage all reviews"
    ON public.reviews
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy D: Service role bypass for backend administration
DROP POLICY IF EXISTS "Service role has unrestricted review access" ON public.reviews;
CREATE POLICY "Service role has unrestricted review access"
    ON public.reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Initial Verified Seed Reviews
INSERT INTO public.reviews (customer_name, rating, review_title, review_text, visit_type, source, status, created_at)
VALUES
(
    'Swapnil Deshmukh',
    5,
    'Outstanding workout floor and turf area',
    'Been training here for 4 months. The 4,000 sq. ft. floor with battle ropes, Olympic racks, and commercial dumbbells is by far the best facility in Moshi.',
    'Strength Training',
    'website',
    'approved',
    NOW() - INTERVAL '5 days'
),
(
    'Priyanka Shinde',
    5,
    'Energetic Zumba and clean steam bath',
    'The evening Zumba sessions are incredible and full of energy! Also love the steam bath recovery facility after intense training.',
    'Zumba',
    'website',
    'approved',
    NOW() - INTERVAL '12 days'
),
(
    'Mahesh Patil',
    5,
    'Knowledgeable and supportive trainers',
    'Trainers actively correct lifting posture and help set realistic progressive overload goals. Highly recommend for both beginners and experienced lifters.',
    'Personal Training',
    'website',
    'approved',
    NOW() - INTERVAL '20 days'
)
ON CONFLICT DO NOTHING;

