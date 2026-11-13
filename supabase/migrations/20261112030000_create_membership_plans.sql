-- ============================================================
-- ICON FITNESS — Membership Plans Database Migration
-- Table: public.membership_plans
-- Security: Strict Row Level Security (RLS) Owner Authorization
-- ============================================================

-- 1. Create membership_plans table
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Individual' CHECK (category IN ('Individual', 'Couple', 'Group')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast query ordering and filtering
CREATE INDEX IF NOT EXISTS idx_membership_plans_active_order 
    ON public.membership_plans (is_active, display_order ASC, price ASC);
CREATE INDEX IF NOT EXISTS idx_membership_plans_category 
    ON public.membership_plans (category);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_membership_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_membership_plans_updated_at ON public.membership_plans;
CREATE TRIGGER trigger_membership_plans_updated_at
    BEFORE UPDATE ON public.membership_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_membership_plans_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- 5. Database Row Level Security Policies

-- Policy A: Public anonymous visitors and non-owners can ONLY SELECT active plans
-- The authorized owner can SELECT all plans (both active and inactive)
DROP POLICY IF EXISTS "Public can view active membership plans" ON public.membership_plans;
CREATE POLICY "Public can view active membership plans"
    ON public.membership_plans
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true OR public.is_authorized_owner());

-- Policy B: Only the explicitly authorized gym owner can INSERT plans
DROP POLICY IF EXISTS "Authorized owner can insert membership plans" ON public.membership_plans;
CREATE POLICY "Authorized owner can insert membership plans"
    ON public.membership_plans
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_owner());

-- Policy C: Only the explicitly authorized gym owner can UPDATE plans
DROP POLICY IF EXISTS "Authorized owner can update membership plans" ON public.membership_plans;
CREATE POLICY "Authorized owner can update membership plans"
    ON public.membership_plans
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_owner())
    WITH CHECK (public.is_authorized_owner());

-- Policy D: Only the explicitly authorized gym owner can DELETE plans
DROP POLICY IF EXISTS "Authorized owner can delete membership plans" ON public.membership_plans;
CREATE POLICY "Authorized owner can delete membership plans"
    ON public.membership_plans
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_owner());

-- Policy E: Service role has unrestricted access for administrative maintenance
DROP POLICY IF EXISTS "Service role unrestricted membership plans access" ON public.membership_plans;
CREATE POLICY "Service role unrestricted membership plans access"
    ON public.membership_plans
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Initial Seed Data (5 Official Poster Plans) with deterministic UUIDs for safe idempotent execution
INSERT INTO public.membership_plans (id, name, duration, price, description, category, is_active, display_order)
VALUES
(
    '00000000-0000-0000-0001-000000000001',
    'MONTHLY',
    '1 Month',
    1200.00,
    '1 Month complete access to strength, cardio, and workout facilities.',
    'Individual',
    true,
    1
),
(
    '00000000-0000-0000-0001-000000000002',
    'QUARTERLY',
    '3 Months',
    3000.00,
    '3 Months membership to establish consistent training habits and results.',
    'Individual',
    true,
    2
),
(
    '00000000-0000-0000-0001-000000000003',
    'HALF YEARLY',
    '6 Months',
    5500.00,
    '6 Months commitment for sustained discipline, muscle gain, and conditioning.',
    'Individual',
    true,
    3
),
(
    '00000000-0000-0000-0001-000000000004',
    'YEARLY',
    '1 Year',
    8000.00,
    '365 Days complete access. The most committed and cost-effective plan.',
    'Individual',
    true,
    4
),
(
    '00000000-0000-0000-0001-000000000005',
    'COUPLE MEMBERSHIP',
    '3 Months (2 Persons)',
    4500.00,
    'Special membership for two people training together for three months.',
    'Couple',
    true,
    5
)
ON CONFLICT (id) DO NOTHING;

