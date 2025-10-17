'use client';

import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

export default function WelcomePage() {
  const { goToNextStep } = useOnboarding('welcome');

  return (
    <div className="space-y-8 text-center">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-4">
          <Sparkles className="h-8 w-8" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Trena.ai
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hey there! Before we jump into lead gen and outreach, let&apos;s make Trena feel like your own sidekick. Just a few quick questions and we&apos;re off to find your next win.
        </p>
      </div>

      {/* Value Props */}
      <div className="grid md:grid-cols-3 gap-6 my-12">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Hyper-Personalized Outreach</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated messages that sound like you, tailored to each buyer
          </p>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Smart Lead Prioritization</h3>
          <p className="text-sm text-muted-foreground">
            Know exactly who to contact and when, based on real buying signals
          </p>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Save Hours Every Day</h3>
          <p className="text-sm text-muted-foreground">
            Automate research and drafting so you can focus on selling
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4 pt-8">
        <p className="text-muted-foreground">
          Let&apos;s personalize Trena to match your selling style and goals.
          <br />
          This will only take 5 minutes and will make Trena feel like your own assistant.
        </p>

        <Button
          size="lg"
          onClick={goToNextStep}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
