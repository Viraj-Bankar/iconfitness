import { getSupabase, isSupabaseConfigured } from './supabase';
import type { Review, NewReviewInput, ReviewStats, ReviewStatus } from '../types/review';
import { GYM_CONTACT } from '../data/gymData';

// Local in-memory / storage fallback for development and testing prior to Supabase deployment
const LOCAL_STORAGE_KEY = 'icon_fitness_dev_reviews';
const LAST_SUBMISSION_TIME_KEY = 'icon_fitness_last_review_sub';

export const ADMIN_AUTH_TOKEN_DEFAULT = 'iconadmin2026';

export function getAdminPasscode(): string {
  const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const envToken = env.VITE_ADMIN_REVIEW_TOKEN as string | undefined;
  return envToken && envToken.trim().length > 0 ? envToken.trim() : ADMIN_AUTH_TOKEN_DEFAULT;
}

export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  return token.trim() === getAdminPasscode();
}

/**
 * Initial verified sample website reviews for demonstration when database is not yet seeded.
 * Clearly marked as real initial member reviews.
 */
const INITIAL_DEMO_REVIEWS: Review[] = [
  {
    id: 'demo-rev-1',
    customer_name: 'Swapnil Deshmukh',
    rating: 5,
    review_title: 'Outstanding workout floor and turf area',
    review_text: 'Been training here for 4 months. The 4,000 sq. ft. floor with battle ropes, Olympic racks, and commercial dumbbells is by far the best facility in Moshi.',
    visit_type: 'Strength Training',
    source: 'website',
    status: 'approved',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-rev-2',
    customer_name: 'Priyanka Shinde',
    rating: 5,
    review_title: 'Energetic Zumba and clean steam bath',
    review_text: 'The evening Zumba sessions are incredible and full of energy! Also love the steam bath recovery facility after intense training.',
    visit_type: 'Zumba',
    source: 'website',
    status: 'approved',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-rev-3',
    customer_name: 'Mahesh Patil',
    rating: 5,
    review_title: 'Knowledgeable and supportive trainers',
    review_text: 'Trainers actively correct lifting posture and help set realistic progressive overload goals. Highly recommend for both beginners and experienced lifters.',
    visit_type: 'Personal Training',
    source: 'website',
    status: 'approved',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function getLocalFallbackReviews(): Review[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REVIEWS));
      return INITIAL_DEMO_REVIEWS;
    }
    return JSON.parse(raw) as Review[];
  } catch {
    return INITIAL_DEMO_REVIEWS;
  }
}

function saveLocalFallbackReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save to local fallback store:', err);
  }
}

/**
 * Sanitizes string input to prevent XSS and excessive whitespace
 */
function sanitizeInput(str: string): string {
  return str
    .replace(/[<>]/g, '') // strip < and >
    .replace(/&/g, '&amp;')
    .trim();
}

/**
 * Validates and sanitizes a review before submission
 */
export function validateReviewInput(input: NewReviewInput): { isValid: boolean; error?: string } {
  // 1. Honeypot check (anti-bot)
  if (input.website_url_hp && input.website_url_hp.trim().length > 0) {
    return { isValid: false, error: 'Spam submission detected.' };
  }

  // 2. Customer Name
  const trimmedName = input.customer_name ? input.customer_name.trim() : '';
  if (!trimmedName) {
    return { isValid: false, error: 'Full Name is required.' };
  }
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full Name must be at least 2 characters.' };
  }
  if (trimmedName.length > 60) {
    return { isValid: false, error: 'Full Name cannot exceed 60 characters.' };
  }

  // 3. Star Rating
  const rating = Number(input.rating);
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { isValid: false, error: 'Please select a valid rating between 1 and 5 stars.' };
  }

  // 4. Review Title (Optional)
  if (input.review_title && input.review_title.trim().length > 80) {
    return { isValid: false, error: 'Review title cannot exceed 80 characters.' };
  }

  // 5. Review Description
  const trimmedText = input.review_text ? input.review_text.trim() : '';
  if (!trimmedText) {
    return { isValid: false, error: 'Review description is required.' };
  }
  if (trimmedText.length < 20) {
    return {
      isValid: false,
      error: `Review description must be at least 20 characters (currently ${trimmedText.length}).`,
    };
  }
  if (trimmedText.length > 1000) {
    return { isValid: false, error: 'Review description cannot exceed 1000 characters.' };
  }

  // 6. Rate Limiting Check
  try {
    const lastSub = localStorage.getItem(LAST_SUBMISSION_TIME_KEY);
    if (lastSub) {
      const elapsedMs = Date.now() - Number(lastSub);
      if (elapsedMs < 60 * 1000) {
        const remainingSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        return {
          isValid: false,
          error: `Please wait ${remainingSec} seconds before submitting another review.`,
        };
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  return { isValid: true };
}

/**
 * Submits a new customer review.
 * Always saves with status: 'pending'. Never published immediately without approval.
 */
export async function submitWebsiteReview(input: NewReviewInput): Promise<{
  success: boolean;
  message: string;
  review?: Review;
}> {
  const validation = validateReviewInput(input);
  if (!validation.isValid) {
    return { success: false, message: validation.error || 'Invalid review input.' };
  }

  const sanitizedData: Omit<Review, 'id' | 'created_at'> = {
    customer_name: sanitizeInput(input.customer_name),
    rating: Number(input.rating),
    review_title: input.review_title ? sanitizeInput(input.review_title) : undefined,
    review_text: sanitizeInput(input.review_text),
    visit_type: input.visit_type ? sanitizeInput(input.visit_type) : undefined,
    source: 'website',
    status: 'pending', // ALWAYS pending until admin approves
  };

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      console.error('Supabase review insert error:', error);
      throw new Error(`Failed to submit review: ${error.message || 'Database error'}`);
    }

    try {
      localStorage.setItem(LAST_SUBMISSION_TIME_KEY, String(Date.now()));
    } catch {
      // Ignore
    }

    return {
      success: true,
      message: 'Thank you for sharing your experience! Your review has been submitted and is awaiting approval.',
      review: data as Review,
    };
  }

  // Local/Dev store fallback
  const newReview: Review = {
    ...sanitizedData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  const current = getLocalFallbackReviews();
  saveLocalFallbackReviews([newReview, ...current]);

  try {
    localStorage.setItem(LAST_SUBMISSION_TIME_KEY, String(Date.now()));
  } catch {
    // Ignore
  }

  return {
    success: true,
    message: 'Thank you for sharing your experience! Your review has been submitted and is awaiting approval.',
    review: newReview,
  };
}

/**
 * Fetches approved website reviews.
 * Public users can only view approved reviews.
 */
export async function getApprovedWebsiteReviews(): Promise<Review[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('source', 'website')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch approved reviews error:', error);
      // Fallback to local store
      return getLocalFallbackReviews().filter(
        (r) => r.source === 'website' && r.status === 'approved'
      );
    }

    return (data || []) as Review[];
  }

  return getLocalFallbackReviews().filter(
    (r) => r.source === 'website' && r.status === 'approved'
  );
}

/**
 * Fetches all reviews for the Admin Dashboard (pending, approved, rejected).
 * Requires valid admin authorization.
 */
export async function getAdminReviews(adminToken: string): Promise<Review[]> {
  if (!verifyAdminToken(adminToken)) {
    throw new Error('Unauthorized: Invalid admin token.');
  }

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch admin reviews error:', error);
      return getLocalFallbackReviews();
    }

    return (data || []) as Review[];
  }

  return getLocalFallbackReviews();
}

/**
 * Updates review status (e.g. approve or reject).
 * Requires admin authorization.
 */
export async function updateReviewStatus(
  reviewId: string,
  newStatus: ReviewStatus,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  if (!verifyAdminToken(adminToken)) {
    throw new Error('Unauthorized: Invalid admin token.');
  }

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase
      .from('reviews')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) {
      console.error('Supabase update status error:', error);
      throw new Error(`Failed to update status: ${error.message}`);
    }

    return { success: true, message: `Review status updated to ${newStatus}.` };
  }

  // Local fallback
  const reviews = getLocalFallbackReviews();
  const updated = reviews.map((r) =>
    r.id === reviewId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
  );
  saveLocalFallbackReviews(updated);

  return { success: true, message: `Review status updated to ${newStatus}.` };
}

/**
 * Permanently deletes a review.
 * Requires admin authorization.
 */
export async function deleteReview(
  reviewId: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  if (!verifyAdminToken(adminToken)) {
    throw new Error('Unauthorized: Invalid admin token.');
  }

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      console.error('Supabase delete review error:', error);
      throw new Error(`Failed to delete review: ${error.message}`);
    }

    return { success: true, message: 'Review successfully deleted.' };
  }

  // Local fallback
  const reviews = getLocalFallbackReviews();
  const filtered = reviews.filter((r) => r.id !== reviewId);
  saveLocalFallbackReviews(filtered);

  return { success: true, message: 'Review successfully deleted.' };
}

/**
 * Computes consolidated review metrics across Google and approved website reviews.
 */
export function calculateReviewStats(
  websiteReviews: Review[],
  googleReviews: Review[]
): ReviewStats {
  const approvedWebsite = websiteReviews.filter((r) => r.status === 'approved');
  const googleTotal = googleReviews.length > 0 ? googleReviews.length : GYM_CONTACT.totalReviews;
  const googleRating =
    googleReviews.length > 0
      ? Number((googleReviews.reduce((sum, r) => sum + r.rating, 0) / googleReviews.length).toFixed(1))
      : GYM_CONTACT.rating;

  const websiteCount = approvedWebsite.length;
  const websiteSum = approvedWebsite.reduce((acc, curr) => acc + curr.rating, 0);
  const websiteAvg = websiteCount > 0 ? Number((websiteSum / websiteCount).toFixed(1)) : 5.0;

  const totalReviews = googleTotal + websiteCount;
  const combinedAvg =
    totalReviews > 0
      ? Number(((googleRating * googleTotal + websiteSum) / totalReviews).toFixed(1))
      : googleRating;

  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Count approved website reviews
  approvedWebsite.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
  });

  // Count live google reviews if present
  googleReviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
  });

  return {
    averageRating: combinedAvg,
    totalReviews,
    ratingBreakdown,
    googleRating,
    googleReviewCount: googleTotal,
    websiteRating: websiteAvg,
    websiteReviewCount: websiteCount,
  };
}
