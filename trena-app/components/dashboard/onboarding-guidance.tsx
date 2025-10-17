'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Target, Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingGuidanceProps {
  className?: string;
}

export function OnboardingGuidance({ className }: OnboardingGuidanceProps) {
  const router = useRouter();

  const handleCompleteOnboarding = () => {
    router.push('/onboarding');
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>

        <p className="text-sm text-gray-600 mb-4">
          Tell us about your target industries and roles to get personalized lead recommendations
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-left p-3 bg-gray-50 rounded-lg">
            <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span>
              <span className="font-medium">Smart Matching:</span> We&apos;ll find leads that match your ideal customer profile
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-left p-3 bg-gray-50 rounded-lg">
            <Target className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>
              <span className="font-medium">Industry Focus:</span> Get recommendations from your target sectors
            </span>
          </div>
        </div>

        <Button onClick={handleCompleteOnboarding} className="gap-2">
          Complete Profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}