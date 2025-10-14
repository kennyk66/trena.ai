import { createClient } from '@/lib/supabase/server';
import { OnboardingData, OnboardingStep } from '@/types/onboarding';
import { UserProfile } from '@/types/database';

/**
 * Save onboarding step data to user_profiles table
 */
export async function saveOnboardingStep(
  stepData: Partial<OnboardingData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(stepData)
      .eq('id', user.id);

    if (error) {
      console.error('Error saving onboarding step:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving onboarding step:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current onboarding progress for the user
 */
export async function getOnboardingProgress(): Promise<{
  completed: boolean;
  currentStep: OnboardingStep | null;
  data: Partial<UserProfile> | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { completed: false, currentStep: null, data: null };
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return { completed: false, currentStep: null, data: null };
    }

    // Determine current step based on what's filled in
    const currentStep = determineCurrentStep(profile);

    return {
      completed: profile.onboarding_completed || false,
      currentStep,
      data: profile,
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    return { completed: false, currentStep: null, data: null };
  }
}

/**
 * Determine which step the user should be on based on their data
 */
function determineCurrentStep(profile: Partial<UserProfile>): OnboardingStep {
  // If onboarding is complete, go to quick-win
  if (profile.onboarding_completed) {
    return 'quick-win';
  }

  // Check each step's required fields
  if (!profile.name || !profile.job_title || !profile.company_name) {
    return 'personal';
  }

  if (!profile.motivators || profile.motivators.length === 0 || !profile.selling_style) {
    return 'motivators';
  }

  if (
    !profile.target_industries ||
    profile.target_industries.length === 0 ||
    !profile.target_region
  ) {
    return 'target-buyer';
  }

  // If all data is filled, go to summary
  return 'summary';
}

/**
 * Get all onboarding data for the current user
 */
export async function getOnboardingData(): Promise<OnboardingData | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    // Map database fields to OnboardingData interface
    return {
      name: profile.name || '',
      job_title: profile.job_title || '',
      company_name: profile.company_name || '',
      sales_quota: profile.sales_quota || '',
      experience_level: profile.experience_level || '',
      motivators: profile.motivators || [],
      selling_style: profile.selling_style || '',
      target_industries: profile.target_industries || [],
      target_roles: profile.target_roles || [],
      target_region: profile.target_region || '',
      sales_motion: profile.sales_motion || '',
      onboarding_completed: profile.onboarding_completed,
      onboarding_completed_at: profile.onboarding_completed_at || undefined,
    };
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
}

/**
 * Mark onboarding as complete
 */
export async function markOnboardingComplete(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error marking onboarding complete:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error marking onboarding complete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    return profile?.onboarding_completed || false;
  } catch (error) {
    console.error('Error checking onboarding completion:', error);
    return false;
  }
}
