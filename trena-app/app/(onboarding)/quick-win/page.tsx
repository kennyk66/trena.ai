'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { LeadCard } from '@/components/onboarding/lead-card';
import { Button } from '@/components/ui/button';
import { Loader2, PartyPopper } from 'lucide-react';
import { LeadData } from '@/types/onboarding';
import { markOnboardingComplete } from '@/lib/onboarding/onboarding-client';

export default function QuickWinPage() {
  const { currentStepNumber, totalSteps, goToPreviousStep, goToDashboard } =
    useOnboarding('quick-win');

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateLeads();
  }, []);

  const generateLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/leads/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setLeads(result.leads || []);
        // If no leads found, show a helpful message
        if (!result.leads || result.leads.length === 0) {
          setError(result.message || 'No prospects found matching your criteria. You can still continue to the dashboard and adjust your preferences later.');
        }
      } else {
        setError(result.error || 'Failed to generate leads');
      }
    } catch (err) {
      console.error('Error generating leads:', err);
      setError('An error occurred while generating leads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      const result = await markOnboardingComplete();

      if (result.success) {
        goToDashboard();
      } else {
        console.error('Error completing onboarding:', result.error);
        alert('Failed to complete onboarding. Please try again.');
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An error occurred. Please try again.');
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={currentStepNumber} totalSteps={totalSteps} />

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Finding your first leads...
          </h2>
          <p className="text-muted-foreground">
            Using AI to match your ideal customer profile
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <p className="font-semibold">Oops! Something went wrong</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <div className="space-y-4">
            <Button onClick={generateLeads} variant="outline">
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">or</p>
            <Button onClick={handleComplete}>
              Continue to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-2">
              <PartyPopper className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">🎉 Your First Leads!</h2>
            <p className="text-muted-foreground">
              Here are {leads.length} high-quality leads based on your profile.
              These are people who match your ideal customer criteria.
            </p>
          </div>

          <div className="space-y-4">
            {leads.map((lead, index) => (
              <LeadCard key={index} lead={lead} />
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg p-6 text-center">
            <p className="text-sm text-orange-900 dark:text-orange-100 mb-4">
              <strong>Ready to start selling smarter?</strong>
              <br />
              Let Trena help you research, prioritize, and reach out to leads like
              these every day.
            </p>
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                'Start Using Trena'
              )}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={isCompleting}
              size="sm"
            >
              Back to Summary
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
