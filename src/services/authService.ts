import { getSupabase, isSupabaseConfigured } from './supabase';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const DEFAULT_OWNER_EMAIL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OWNER_EMAIL) ||
  (env.VITE_OWNER_EMAIL as string) ||
  'owner@iconfitness.com';

const TRUSTED_OWNER_EMAILS: string[] = [
  DEFAULT_OWNER_EMAIL.trim().toLowerCase(),
].filter(Boolean);

export interface OwnerUser {
  id: string;
  email: string;
  role: 'owner';
}

/**
 * Validates whether an authenticated Supabase user matches the authorized owner email
 * or server-controlled app_metadata.
 *
 * SECURITY: NEVER trusts user-editable user_metadata for owner/admin privileges,
 * as users can modify raw_user_meta_data directly via Supabase client SDKs.
 */
export function isAuthorizedOwner(user: {
  email?: string | null;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
} | null | undefined): boolean {
  if (!user) return false;

  const userEmail = (user.email || '').trim().toLowerCase();
  const isEmailMatch = Boolean(userEmail && TRUSTED_OWNER_EMAILS.includes(userEmail));

  // Server-controlled app_metadata ONLY (never user-editable user_metadata)
  const appRole = user.app_metadata?.role;
  const isRoleMatch = appRole === 'owner' || appRole === 'admin';

  return isEmailMatch || isRoleMatch;
}

/**
 * Sign in owner strictly through Supabase Auth.
 * Fallback credentials and local bypasses are disabled.
 */
export async function loginOwner(
  email: string,
  password: string
): Promise<{ success: boolean; user?: OwnerUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Authentication service is not configured. Please contact the administrator.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      error: 'Authentication client could not be initialized.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'User account not found.' };
    }

    // Explicitly verify the authenticated user is the authorized gym owner
    if (!isAuthorizedOwner(data.user)) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Access denied: This account is not authorized as the gym owner.',
      };
    }

    const user: OwnerUser = {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      role: 'owner',
    };

    return { success: true, user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication service error.';
    return { success: false, error: msg };
  }
}

/**
 * Checks if current user has an active authenticated Supabase owner session.
 * Rejects unauthenticated users and ordinary authenticated non-owner users.
 */
export async function getActiveOwnerSession(): Promise<OwnerUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return null;
    }

    const authUser = data.session.user;

    // Reject non-owner authenticated accounts
    if (!isAuthorizedOwner(authUser)) {
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: authUser.id,
      email: authUser.email || '',
      role: 'owner',
    };
  } catch {
    // In case of invalid key, network issue or expired token
    return null;
  }
}

/**
 * Logs out owner and terminates the Supabase session
 */
export async function logoutOwner(): Promise<void> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }

  // Clear any legacy session remnants from localStorage if present
  try {
    localStorage.removeItem('icon_fitness_owner_session');
  } catch {
    // Ignore
  }
}
