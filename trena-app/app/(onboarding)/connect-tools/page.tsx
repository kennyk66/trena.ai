'use client';

import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Building2, Linkedin, CheckCircle2 } from 'lucide-react';

export default function ConnectToolsPage() {
  const { currentStepNumber, totalSteps, goToPreviousStep, goToNextStep } =
    useOnboarding('connect-tools');

  const integrations = [
    {
      name: 'Email',
      icon: Mail,
      description: 'Connect Gmail or Outlook to send emails directly from Trena',
      comingSoon: true,
    },
    {
      name: 'CRM',
      icon: Building2,
      description: 'Sync leads with Salesforce, HubSpot, or Pipedrive',
      comingSoon: true,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Enrich leads with LinkedIn profile data',
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={currentStepNumber} totalSteps={totalSteps} />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Connect your tools</h2>
        <p className="text-muted-foreground">
          Connect your email, CRM, and LinkedIn to supercharge Trena&apos;s
          capabilities. You can skip this step and connect later.
        </p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card
              key={integration.name}
              className="border-2 hover:border-orange-200 dark:hover:border-orange-900 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {integration.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  {integration.comingSoon && (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  disabled={integration.comingSoon}
                  className="w-full"
                >
                  {integration.comingSoon ? 'Coming Soon' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-orange-900 dark:text-orange-100">
            Don&apos;t worry!
          </p>
          <p className="text-orange-700 dark:text-orange-300 mt-1">
            You can connect these tools anytime from your settings. Let&apos;s
            continue setting up your profile for now.
          </p>
        </div>
      </div>

      <OnboardingNav
        onBack={goToPreviousStep}
        onNext={goToNextStep}
        nextLabel="Skip for Now"
        isLoading={false}
        isNextDisabled={false}
      />
    </div>
  );
}
