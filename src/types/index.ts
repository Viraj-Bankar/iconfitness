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
  featured?: boolean;
  isCouple?: boolean;
  tag?: string;
  description: string;
  features: string[];
  ctaText: string;
}

export type GalleryCategory = 'all' | 'interior' | 'equipment' | 'strength' | 'cardio' | 'zumba' | 'yoga' | 'trainers';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  image: string;
  caption: string;
  isRealGymPhoto?: boolean;
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
  email?: string;
  planOrFacility: string;
  message: string;
}
