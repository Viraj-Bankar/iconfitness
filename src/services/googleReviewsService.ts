import { GYM_CONTACT } from '../data/gymData';
import type { Review } from '../types/review';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const googlePlaceId = env.VITE_GOOGLE_PLACE_ID as string | undefined;
const googleApiKey = env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
const googleWriteReviewUrlEnv = env.VITE_GOOGLE_WRITE_REVIEW_URL as string | undefined;
const googleProxyUrl = env.VITE_GOOGLE_REVIEWS_PROXY_URL as string | undefined;

export interface GoogleBusinessInfo {
  name: string;
  rating: number;
  totalReviews: number;
  placeId?: string;
  mapsUrl: string;
  writeReviewUrl: string;
  isApiConfigured: boolean;
}

/**
 * Returns Google Business Profile information and direct links.
 * Respects official attribution guidelines and canonical Google Place IDs.
 */
export function getGoogleBusinessInfo(): GoogleBusinessInfo {
  const writeReviewUrl =
    googleWriteReviewUrlEnv ||
    (googlePlaceId
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(googlePlaceId)}`
      : GYM_CONTACT.googleMapsUrl);

  const isApiConfigured = Boolean((googleApiKey && googlePlaceId) || googleProxyUrl);

  return {
    name: GYM_CONTACT.name,
    rating: GYM_CONTACT.rating,
    totalReviews: GYM_CONTACT.totalReviews,
    placeId: googlePlaceId,
    mapsUrl: GYM_CONTACT.googleMapsUrl,
    writeReviewUrl,
    isApiConfigured,
  };
}

/**
 * Fetches verified Google reviews via backend proxy or official Places API endpoint.
 * In compliance with requirements:
 * - Never scrapes Google Maps
 * - Never invents Google reviews or fake reviewer names
 * - If official integration credentials are not configured, returns empty list with integration status
 */
export async function fetchGoogleReviews(): Promise<{
  reviews: Review[];
  isConfigured: boolean;
  errorMessage?: string;
}> {
  if (googleProxyUrl) {
    try {
      const res = await fetch(googleProxyUrl, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`Google proxy responded with status ${res.status}`);
      }
      const data = await res.json();
      const rawReviews = (data.reviews || []) as Array<{
        author_name: string;
        rating: number;
        text: string;
        time?: number;
        relative_time_description?: string;
        profile_photo_url?: string;
        author_url?: string;
      }>;

      const formatted: Review[] = rawReviews.map((r, i) => ({
        id: `google-rev-${i}-${r.time || Date.now()}`,
        customer_name: r.author_name,
        rating: r.rating,
        review_text: r.text,
        source: 'google',
        status: 'approved',
        created_at: r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString(),
        relative_time_description: r.relative_time_description,
        reviewer_photo: r.profile_photo_url,
        google_profile_url: r.author_url,
      }));

      return { reviews: formatted, isConfigured: true };
    } catch (err) {
      console.warn('Failed to fetch from Google reviews proxy:', err);
      return {
        reviews: [],
        isConfigured: true,
        errorMessage: 'Unable to load live Google reviews from proxy at this moment.',
      };
    }
  }

  // If client-side API key and Place ID are present
  if (googleApiKey && googlePlaceId) {
    // Note: Google Places API details endpoint does not support direct browser CORS requests.
    // It requires a server-side proxy or Places JS SDK library.
    return {
      reviews: [],
      isConfigured: true,
      errorMessage:
        'Google Places API key is present. A server-side proxy endpoint (VITE_GOOGLE_REVIEWS_PROXY_URL) is required to securely call Places API without exposing your key or hitting browser CORS restrictions.',
    };
  }

  return {
    reviews: [],
    isConfigured: false,
    errorMessage:
      'Google Places API integration is not yet connected. Configure VITE_GOOGLE_PLACE_ID and VITE_GOOGLE_REVIEWS_PROXY_URL to stream verified Google reviews.',
  };
}
