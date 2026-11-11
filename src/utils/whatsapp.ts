export const WHATSAPP_NUMBER = '919637545941';
export const WHATSAPP_DISPLAY_NUMBER = '+91 9637545941';

export const INTERESTED_IN_OPTIONS = [
  'General Gym Enquiry',
  'Membership',
  'Personal Training',
  'Zumba',
  'Yoga',
  'Cardio Training',
  'Steam Bath',
  'Diet Plan',
  'Other',
] as const;

export type InterestedInOption = (typeof INTERESTED_IN_OPTIONS)[number];

export interface MembershipPlanOption {
  id: string;
  label: string;
  name: string;
  duration: string;
  price: string;
}

export const MEMBERSHIP_PLAN_OPTIONS: MembershipPlanOption[] = [
  {
    id: '1-month',
    label: '1 Month – ₹1,200',
    name: 'MONTHLY',
    duration: '1 Month',
    price: '₹1,200',
  },
  {
    id: '3-months',
    label: '3 Months – ₹3,000',
    name: 'QUARTERLY',
    duration: '3 Months',
    price: '₹3,000',
  },
  {
    id: '6-months',
    label: '6 Months – ₹5,500',
    name: 'HALF YEARLY',
    duration: '6 Months',
    price: '₹5,500',
  },
  {
    id: '1-year',
    label: '1 Year – ₹8,000',
    name: 'YEARLY',
    duration: '1 Year',
    price: '₹8,000',
  },
  {
    id: 'couple-3-months',
    label: 'Couple Membership (3 Months) – ₹4,500',
    name: 'COUPLE MEMBERSHIP',
    duration: '3 Months (2 Persons)',
    price: '₹4,500',
  },
];

export interface WhatsAppEnquiryData {
  fullName: string;
  phone: string;
  interestedIn: string;
  membershipPlan?: string;
  message?: string;
}

/**
 * Validates 10-digit Indian mobile number
 * Accepts formats like: 9637545941, +91 9637545941, 09637545941, 9637-545-941
 * Returns validated 10-digit string or error message
 */
export function validateIndianMobile(raw: string): { isValid: boolean; cleaned: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, cleaned: '', error: 'Mobile number is required.' };
  }

  // Strip spaces, dashes, parentheses, plus
  const digits = raw.replace(/\D/g, '');

  let phone10 = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    phone10 = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    phone10 = digits.slice(1);
  }

  if (phone10.length !== 10) {
    return {
      isValid: false,
      cleaned: phone10,
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  if (!/^[6-9]\d{9}$/.test(phone10)) {
    return {
      isValid: false,
      cleaned: phone10,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  return { isValid: true, cleaned: phone10 };
}

/**
 * Formats enquiry according to the standard template:
 *
 * Hello ICON FITNESS!
 *
 * I would like to enquire about your gym facilities.
 *
 * My Details:
 * Name: [Customer Name]
 * Mobile: [Customer Mobile]
 *
 * Interested In: [Selected Service]
 *
 * Membership Details:
 * [Selected Membership Plan and Price, if applicable]
 *
 * Additional Message:
 * [Customer Message]
 *
 * I would like to know more about the available facilities and membership details.
 *
 * Thank you!
 */
export function formatWhatsAppMessage(data: WhatsAppEnquiryData): string {
  const parts: string[] = [
    'Hello ICON FITNESS!',
    '',
    'I would like to enquire about your gym facilities.',
    '',
    'My Details:',
    `Name: ${data.fullName.trim()}`,
    `Mobile: ${data.phone.trim()}`,
    '',
    `Interested In: ${data.interestedIn}`,
  ];

  if (data.interestedIn === 'Membership' && data.membershipPlan && data.membershipPlan.trim()) {
    parts.push('', 'Membership Details:', data.membershipPlan.trim());
  }

  if (data.message && data.message.trim().length > 0) {
    parts.push('', 'Additional Message:', data.message.trim());
  }

  parts.push(
    '',
    'I would like to know more about the available facilities and membership details.',
    '',
    'Thank you!'
  );

  return parts.join('\n');
}

/**
 * Builds the canonical WhatsApp link
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens WhatsApp in a new tab with safety attributes
 */
export function openWhatsApp(message: string): Window | null {
  const url = buildWhatsAppUrl(message);
  return window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Maps incoming initial topics (e.g. from facility cards or banners) to valid InterestedIn options
 */
export function mapTopicToInterestedIn(topic?: string): {
  interestedIn: InterestedInOption;
  membershipPlan?: string;
  defaultMessage?: string;
} {
  if (!topic) {
    return { interestedIn: 'General Gym Enquiry' };
  }

  const t = topic.trim().toUpperCase();

  if (t.includes('ZUMBA')) {
    return { interestedIn: 'Zumba' };
  }
  if (t.includes('YOGA')) {
    return { interestedIn: 'Yoga' };
  }
  if (t.includes('STEAM')) {
    return { interestedIn: 'Steam Bath' };
  }
  if (t.includes('CARDIO')) {
    return { interestedIn: 'Cardio Training' };
  }
  if (t.includes('PERSONAL TRAINING') || t.includes('COACHING') || t.includes('1-ON-1')) {
    return { interestedIn: 'Personal Training' };
  }
  if (t.includes('DIET') || t.includes('NUTRITION')) {
    return { interestedIn: 'Diet Plan' };
  }
  if (t.includes('MEMBERSHIP') || t.includes('MONTH') || t.includes('YEAR') || t.includes('COUPLE')) {
    // Check if matches a known plan
    const matchingPlan = MEMBERSHIP_PLAN_OPTIONS.find(
      (p) =>
        t.includes(p.duration.toUpperCase()) ||
        t.includes(p.name.toUpperCase()) ||
        t.includes(p.label.toUpperCase())
    );
    return {
      interestedIn: 'Membership',
      membershipPlan: matchingPlan ? matchingPlan.label : MEMBERSHIP_PLAN_OPTIONS[3].label,
    };
  }
  if (t.includes('GROUP DISCOUNT')) {
    return {
      interestedIn: 'Other',
      defaultMessage: 'Enquiring about group discounts for working out with friends.',
    };
  }
  if (t.includes('STRENGTH')) {
    return { interestedIn: 'General Gym Enquiry' };
  }

  // Exact match check
  const exact = INTERESTED_IN_OPTIONS.find((opt) => opt.toLowerCase() === topic.toLowerCase());
  if (exact) {
    return { interestedIn: exact };
  }

  return { interestedIn: 'General Gym Enquiry' };
}

