'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, User, Target, Edit } from 'lucide-react';
import { OnboardingData } from '@/types/onboarding';
import {
  getExperienceLevelLabel,
  getSellingStyleLabel,
  getRegionLabel,
  getSalesMotionLabel,
} from '@/lib/constants/onboarding-options';

export default function SummaryPage() {
  const { currentStepNumber, totalSteps, goToPreviousStep, goToStep, goToNextStep } =
    useOnboarding('summary');

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/onboarding/data');
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <ProgressBar currentStep={currentStepNumber} totalSteps={totalSteps} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={currentStepNumber} totalSteps={totalSteps} />

      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-2">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Your AI sales assistant is ready!</h2>
        <p className="text-muted-foreground">
          Review your profile below. You can always edit this later in settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-lg">Personal & Role</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep('personal')}
                className="gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">
                {data.job_title} at {data.company_name}
              </p>
            </div>
            {data.sales_quota && (
              <div>
                <p className="text-sm text-muted-foreground">Sales Quota</p>
                <p className="font-medium">{data.sales_quota}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">
                {getExperienceLevelLabel(data.experience_level)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Motivators & Style */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-lg">Selling Style</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep('motivators')}
                className="gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">What drives you</p>
              <div className="flex flex-wrap gap-2">
                {data.motivators.map((motivator) => (
                  <Badge key={motivator} variant="secondary">
                    {motivator === 'Other' && data.motivators_other
                      ? data.motivators_other
                      : motivator}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Communication tone</p>
              <p className="font-medium">
                {getSellingStyleLabel(data.selling_style)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Target Buyer */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-lg">Target Buyer Profile</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep('target-buyer')}
                className="gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Industries</p>
              <div className="flex flex-wrap gap-2">
                {data.target_industries.map((industry) => (
                  <Badge key={industry} variant="secondary">
                    {industry === 'Other' && data.industries_other
                      ? data.industries_other
                      : industry}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Buyer roles</p>
              <div className="flex flex-wrap gap-2">
                {data.target_roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role === 'Other' && data.roles_other
                      ? data.roles_other
                      : role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-medium">
                  {getRegionLabel(data.target_region)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales motion</p>
                <p className="font-medium">
                  {getSalesMotionLabel(data.sales_motion)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 text-center">
        <p className="text-sm text-orange-900 dark:text-orange-100">
          <strong>Next up:</strong> We&apos;ll find your first 3 high-quality leads
          based on this profile!
        </p>
      </div>

      <OnboardingNav
        onBack={goToPreviousStep}
        onNext={goToNextStep}
        nextLabel="Find My Leads"
        isLoading={false}
        isNextDisabled={false}
      />
    </div>
  );
}
