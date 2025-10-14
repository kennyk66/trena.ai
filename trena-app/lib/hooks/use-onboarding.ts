'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStep, ONBOARDING_STEPS } from '@/types/onboarding';

export function useOnboarding(currentStep: OnboardingStep) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const getCurrentStepNumber = (): number => {
    return ONBOARDING_STEPS.indexOf(currentStep) + 1;
  };

  const goToNextStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      setIsNavigating(true);
      router.push(`/${nextStep}`);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
      setIsNavigating(true);
      router.push(`/${previousStep}`);
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setIsNavigating(true);
    router.push(`/${step}`);
  };

  const goToDashboard = () => {
    setIsNavigating(true);
    router.push('/home');
  };

  return {
    isNavigating,
    currentStepNumber: getCurrentStepNumber(),
    totalSteps: ONBOARDING_STEPS.length,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    goToDashboard,
  };
}
