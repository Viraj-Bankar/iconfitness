export interface Facility {
  id: string;
  number: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  iconName: 'Dumbbell' | 'Flame' | 'Flower2' | 'Sparkles' | 'UserCheck' | 'Activity';
  highlights: string[];
}

export interface MembershipPlan {
  id: string;
  planNumber: string;
  name: string;
  duration: string;
  price: string;
  priceFormatted: string;
  priceNumber?: number;
  featured?: boolean;
  isCouple?: boolean;
  tag?: string;
  category?: 'Individual' | 'Couple' | 'Group' | string;
  description: string;
  features: string[];
  ctaText: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const GALLERY_PREDEFINED_CATEGORIES = [
  'Gym Interior',
  'Equipment',
  'Strength Training',
  'Cardio',
  'Zumba',
  'Yoga',
  'Personal Training',
  'Events & Activities',
  'Transformations',
  'Other',
] as const;

export type GalleryPredefinedCategory = (typeof GALLERY_PREDEFINED_CATEGORIES)[number];

export type GalleryCategory =
  | 'all'
  | 'All'
  | 'interior'
  | 'equipment'
  | 'strength'
  | 'cardio'
  | 'zumba'
  | 'yoga'
  | 'trainers'
  | GalleryPredefinedCategory;

/**
 * Normalizes legacy category slugs or user inputs into one of the 10 official categories.
 */
export function normalizeGalleryCategory(category?: string | null): GalleryPredefinedCategory {
  if (!category) return 'Other';
  const c = category.trim().toLowerCase();
  if (c === 'interior' || c === 'gym interior') return 'Gym Interior';
  if (c === 'equipment') return 'Equipment';
  if (c === 'strength' || c === 'strength training') return 'Strength Training';
  if (c === 'cardio') return 'Cardio';
  if (c === 'zumba') return 'Zumba';
  if (c === 'yoga') return 'Yoga';
  if (c === 'trainers' || c === 'personal training') return 'Personal Training';
  if (c.includes('event') || c.includes('activit')) return 'Events & Activities';
  if (c.includes('transform')) return 'Transformations';
  if (c === 'other') return 'Other';

  const exact = GALLERY_PREDEFINED_CATEGORIES.find((item) => item.toLowerCase() === c);
  if (exact) return exact;

  return 'Other';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  image: string;
  caption: string;
  isRealGymPhoto?: boolean;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  isPublished?: boolean;
  createdAt?: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  theme: string;
  text: string;
  reviewerTag: string;
  verified: boolean;
  facilityMentioned: string;
}

export interface WhyChooseItem {
  number: string;
  title: string;
  description: string;
  iconName: string;
  highlightText: string;
}

export interface ContactFormData {
  fullName: string;
  phone: string;
  interestedIn: string;
  membershipPlan?: string;
  message?: string;
}
