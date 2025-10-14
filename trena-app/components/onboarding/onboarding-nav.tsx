'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingNavProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  isLoading?: boolean;
  isNextDisabled?: boolean;
  showBack?: boolean;
}

export function OnboardingNav({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  isLoading = false,
  isNextDisabled = false,
  showBack = true,
}: OnboardingNavProps) {
  return (
    <div className="flex justify-between items-center gap-4 mt-8">
      {showBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      ) : (
        <div />
      )}

      <Button
        type="submit"
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className="gap-2 min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
