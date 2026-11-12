export type ReviewSource = 'google' | 'website';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export const VISIT_TYPE_OPTIONS = [
  'General Gym Experience',
  'Strength Training',
  'Personal Training',
  'Zumba',
  'Yoga',
  'Cardio',
  'Other',
] as const;

export type VisitType = (typeof VISIT_TYPE_OPTIONS)[number];

export interface Review {
  id: string;
  customer_name: string;
  rating: number; // 1 to 5
  review_title?: string;
  review_text: string;
  visit_type?: string;
  source: ReviewSource;
  status: ReviewStatus;
  created_at: string;
  updated_at?: string;
  reviewer_photo?: string;
  google_profile_url?: string;
  relative_time_description?: string;
}

export interface NewReviewInput {
  customer_name: string;
  rating: number;
  review_title?: string;
  review_text: string;
  visit_type?: string;
  website_url_hp?: string; // honeypot for bot detection
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>; // count per star 1-5
  googleRating: number;
  googleReviewCount: number;
  websiteRating: number;
  websiteReviewCount: number;
}

