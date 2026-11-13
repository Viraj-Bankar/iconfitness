import { getSupabase, isSupabaseConfigured } from './supabase';
import { getActiveOwnerSession } from './authService';
import type {
  DbMembershipPlan,
  NewMembershipPlanInput,
  UpdateMembershipPlanInput,
  MembershipCategory,
} from '../types/membership';
import type { MembershipPlan } from '../types';
import { MEMBERSHIP_PLANS } from '../data/gymData';

const LOCAL_STORAGE_KEY = 'icon_fitness_owner_plans';

/**
 * Validates membership plan inputs to prevent negative prices, empty names, or malformed data.
 */
export function validatePlanInput(
  input: Partial<NewMembershipPlanInput>
): { isValid: boolean; error?: string } {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Plan name is required.' };
  }
  if (input.name.trim().length < 2) {
    return { isValid: false, error: 'Plan name must be at least 2 characters.' };
  }
  if (input.name.trim().length > 100) {
    return { isValid: false, error: 'Plan name cannot exceed 100 characters.' };
  }

  if (!input.duration || !input.duration.trim()) {
    return { isValid: false, error: 'Duration is required (e.g. 1 Month, 3 Months, 1 Year).' };
  }
  if (input.duration.trim().length < 2) {
    return { isValid: false, error: 'Duration must be at least 2 characters.' };
  }

  if (input.price === undefined || input.price === null || isNaN(Number(input.price))) {
    return { isValid: false, error: 'Price in INR is required.' };
  }

  const numericPrice = Number(input.price);
  if (numericPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative.' };
  }
  if (!Number.isFinite(numericPrice)) {
    return { isValid: false, error: 'Please enter a valid finite price number.' };
  }

  const validCategories: MembershipCategory[] = ['Individual', 'Couple', 'Group'];
  if (input.category && !validCategories.includes(input.category)) {
    return { isValid: false, error: 'Category must be Individual, Couple, or Group.' };
  }

  if (input.displayOrder !== undefined && input.displayOrder !== null) {
    const order = Number(input.displayOrder);
    if (!Number.isInteger(order) || order < 0) {
      return { isValid: false, error: 'Display order must be a non-negative integer.' };
    }
  }

  return { isValid: true };
}

/**
 * Helper to ensure the current client has a verified gym owner session.
 */
async function requireOwnerSession() {
  const session = await getActiveOwnerSession();
  if (!session) {
    throw new Error('Unauthorized: An active gym owner session is required for this operation.');
  }
  return session;
}

/**
 * Initial fallback plans matching the official gym poster.
 */
function getLocalFallbackPlans(): DbMembershipPlan[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DbMembershipPlan[];
    }
  } catch {
    // Ignore
  }

  const defaults: DbMembershipPlan[] = [
    {
      id: '00000000-0000-0000-0001-000000000001',
      name: 'MONTHLY',
      duration: '1 Month',
      price: 1200,
      description: '1 Month complete access to strength, cardio, and workout facilities.',
      category: 'Individual',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0001-000000000002',
      name: 'QUARTERLY',
      duration: '3 Months',
      price: 3000,
      description: '3 Months membership to establish consistent training habits and results.',
      category: 'Individual',
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0001-000000000003',
      name: 'HALF YEARLY',
      duration: '6 Months',
      price: 5500,
      description: '6 Months commitment for sustained discipline, muscle gain, and conditioning.',
      category: 'Individual',
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0001-000000000004',
      name: 'YEARLY',
      duration: '1 Year',
      price: 8000,
      description: '365 Days complete access. The most committed and cost-effective plan.',
      category: 'Individual',
      isActive: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0001-000000000005',
      name: 'COUPLE MEMBERSHIP',
      duration: '3 Months (2 Persons)',
      price: 4500,
      description: 'Special membership for two people training together for three months.',
      category: 'Couple',
      isActive: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // Ignore
  }

  return defaults;
}

function saveLocalFallbackPlans(plans: DbMembershipPlan[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save to local fallback store:', err);
  }
}

/**
 * Transforms a raw database row into the UI MembershipPlan shape.
 */
function mapRowToUiPlan(row: any, index: number): MembershipPlan {
  const numericPrice = Number(row.price);
  const formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;
  const isCouple = row.category === 'Couple';
  const isYearly =
    row.duration.toLowerCase().includes('1 year') ||
    row.name.toLowerCase().includes('yearly') ||
    numericPrice >= 8000;

  // Features list derived from plan attributes
  const features: string[] = [];
  if (isCouple) {
    features.push('Combined Plan for 2 Members');
    features.push(`Duration: ${row.duration} for Both`);
    features.push('Full 4,000 Sq. Ft. Floor Access');
    features.push('Steam Bath & Cardio Facilities');
  } else if (isYearly) {
    features.push('Full 1 Year Unrestricted Access');
    features.push('All Strength, Plate-Loaded & Cardio Gear');
    features.push('Continuous Workout Plan Guidance');
    features.push('Steam Bath & Recovery Access');
    features.push('Highest Annual Savings');
  } else {
    features.push(`Full Gym Floor Access (${row.duration})`);
    features.push('Modern Strength & Cardio Equipment');
    features.push('Trainer Workout & Posture Guidance');
    features.push('Steam Bath & Locker Access');
  }

  let tag: string | undefined = undefined;
  if (isYearly) tag = 'BEST VALUE PLAN';
  else if (isCouple) tag = 'COUPLE DISCOUNT (3 MONTHS)';
  else if (row.duration.includes('3')) tag = 'POPULAR QUARTERLY';

  return {
    id: row.id,
    planNumber: String(index + 1).padStart(2, '0'),
    name: row.name,
    duration: row.duration,
    price: formattedPrice,
    priceFormatted: numericPrice.toLocaleString('en-IN'),
    priceNumber: numericPrice,
    featured: isYearly,
    isCouple,
    tag,
    category: row.category,
    description: row.description || `${row.duration} complete access to gym facilities.`,
    features,
    ctaText: 'ENQUIRE NOW',
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 0,
  };
}

/**
 * Fetches all active membership plans for the public website.
 * Public visitors only receive plans where is_active = true.
 */
export async function getPublicMembershipPlans(): Promise<MembershipPlan[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('price', { ascending: true });

      if (error) {
        console.warn('Supabase fetch public membership plans error (using fallback):', error.message);
        return MEMBERSHIP_PLANS.map((p) => ({ ...p, isActive: true }));
      }

      if (data && data.length > 0) {
        return data.map((row, idx) => mapRowToUiPlan(row, idx));
      }

      return MEMBERSHIP_PLANS.map((p) => ({ ...p, isActive: true }));
    } catch (err) {
      console.error('Error fetching public membership plans:', err);
      return MEMBERSHIP_PLANS.map((p) => ({ ...p, isActive: true }));
    }
  }

  // Fallback to active plans from local storage or gymData
  const activeFallback = getLocalFallbackPlans().filter((p) => p.isActive);
  if (activeFallback.length > 0) {
    return activeFallback.map((row, idx) =>
      mapRowToUiPlan(
        {
          id: row.id,
          name: row.name,
          duration: row.duration,
          price: row.price,
          description: row.description,
          category: row.category,
          is_active: row.isActive,
          display_order: row.displayOrder,
        },
        idx
      )
    );
  }

  return MEMBERSHIP_PLANS.map((p) => ({ ...p, isActive: true }));
}

/**
 * Fetches all membership plans (both active and inactive) for the Owner Dashboard.
 * Requires authenticated owner session.
 */
export async function getOwnerMembershipPlans(): Promise<DbMembershipPlan[]> {
  await requireOwnerSession();

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch owner membership plans error:', error);
      throw new Error(`Failed to load plans: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      duration: row.duration,
      price: Number(row.price),
      description: row.description,
      category: row.category as MembershipCategory,
      isActive: row.is_active,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  return getLocalFallbackPlans();
}

/**
 * Creates a new membership plan.
 * Requires authenticated owner session.
 */
export async function createMembershipPlan(
  input: NewMembershipPlanInput
): Promise<DbMembershipPlan> {
  await requireOwnerSession();

  const validation = validatePlanInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid membership plan data.');
  }

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const record = {
      name: input.name.trim(),
      duration: input.duration.trim(),
      price: Number(input.price),
      description: input.description?.trim() || null,
      category: input.category || 'Individual',
      is_active: input.isActive ?? true,
      display_order: Number(input.displayOrder ?? 0),
    };

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert membership plan error:', error);
      throw new Error(`Failed to create plan: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      duration: data.duration,
      price: Number(data.price),
      description: data.description,
      category: data.category as MembershipCategory,
      isActive: data.is_active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // Local fallback
  const newPlan: DbMembershipPlan = {
    id: `local-plan-${Date.now()}`,
    name: input.name.trim(),
    duration: input.duration.trim(),
    price: Number(input.price),
    description: input.description?.trim() || null,
    category: input.category || 'Individual',
    isActive: input.isActive ?? true,
    displayOrder: Number(input.displayOrder ?? 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getLocalFallbackPlans();
  saveLocalFallbackPlans([...current, newPlan]);
  return newPlan;
}

/**
 * Updates an existing membership plan.
 * Requires authenticated owner session.
 */
export async function updateMembershipPlan(
  id: string,
  input: UpdateMembershipPlanInput
): Promise<DbMembershipPlan> {
  await requireOwnerSession();

  if (!id) throw new Error('Plan ID is required for update.');

  if (input.price !== undefined && input.price < 0) {
    throw new Error('Price cannot be negative.');
  }
  if (input.name !== undefined && input.name.trim().length === 0) {
    throw new Error('Plan name cannot be empty.');
  }

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.duration !== undefined) updates.duration = input.duration.trim();
    if (input.price !== undefined) updates.price = Number(input.price);
    if (input.description !== undefined) updates.description = input.description.trim() || null;
    if (input.category !== undefined) updates.category = input.category;
    if (input.isActive !== undefined) updates.is_active = input.isActive;
    if (input.displayOrder !== undefined) updates.display_order = Number(input.displayOrder);

    const { data, error } = await supabase
      .from('membership_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update membership plan error:', error);
      throw new Error(`Failed to update plan: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      duration: data.duration,
      price: Number(data.price),
      description: data.description,
      category: data.category as MembershipCategory,
      isActive: data.is_active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // Local fallback
  const current = getLocalFallbackPlans();
  const updated = current.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        name: input.name !== undefined ? input.name.trim() : p.name,
        duration: input.duration !== undefined ? input.duration.trim() : p.duration,
        price: input.price !== undefined ? Number(input.price) : p.price,
        description: input.description !== undefined ? input.description.trim() || null : p.description,
        category: input.category !== undefined ? input.category : p.category,
        isActive: input.isActive !== undefined ? input.isActive : p.isActive,
        displayOrder: input.displayOrder !== undefined ? Number(input.displayOrder) : p.displayOrder,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  saveLocalFallbackPlans(updated);
  const found = updated.find((p) => p.id === id);
  if (!found) throw new Error('Plan not found.');
  return found;
}

/**
 * Toggles a plan between active and inactive.
 * Requires authenticated owner session.
 */
export async function togglePlanActiveStatus(
  id: string,
  isActive: boolean
): Promise<DbMembershipPlan> {
  return updateMembershipPlan(id, { isActive });
}

/**
 * Permanently deletes a membership plan.
 * Requires authenticated owner session.
 */
export async function deleteMembershipPlan(id: string): Promise<void> {
  await requireOwnerSession();

  if (!id) throw new Error('Plan ID is required for deletion.');

  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.from('membership_plans').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete membership plan error:', error);
      throw new Error(`Failed to delete plan: ${error.message}`);
    }
    return;
  }

  const current = getLocalFallbackPlans();
  saveLocalFallbackPlans(current.filter((p) => p.id !== id));
}
