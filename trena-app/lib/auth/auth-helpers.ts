'use client';

import { createClient } from '@/lib/supabase/client';

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResult {
  success: boolean;
  error?: AuthError;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during sign up' },
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during sign in' },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { message: 'An unexpected error occurred during sign out' },
    };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Update user password
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: { message: 'An unexpected error occurred while updating password' },
    };
  }
}
