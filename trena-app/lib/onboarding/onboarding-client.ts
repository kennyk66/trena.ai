'use client';

import { OnboardingData } from '@/types/onboarding';

/**
 * Save onboarding step data (client-side version using API route)
 */
export async function saveOnboardingStep(
  stepData: Partial<OnboardingData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/onboarding/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stepData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving onboarding step:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Mark onboarding as complete (client-side version using API route)
 */
export async function markOnboardingComplete(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
