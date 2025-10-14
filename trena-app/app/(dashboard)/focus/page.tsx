'use client';

// PRD #0004: Lead Prioritization - Today's Focus Page
// Displays daily list of top 5 priority leads for user to focus on

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FocusCard } from '@/components/priority/focus-card';
import { Target, RefreshCw, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { ResearchedLead } from '@/types/research';

export default function FocusPage() {
  const [leads, setLeads] = useState<ResearchedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFocus();
  }, []);

  const loadFocus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/priority/focus');
      const result = await response.json();

      if (result.success) {
        setLeads(result.leads || []);
      } else {
        setError(result.error || 'Failed to load focus');
      }
    } catch (err) {
      console.error('Error loading focus:', err);
      setError('Failed to load focus list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFocus();
    setIsRefreshing(false);
  };

  const handleLeadContacted = (leadId: string) => {
    // Remove from current leads list (optimistic update)
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              Today&apos;s Focus
            </h1>
            <p className="text-muted-foreground mt-1">
              Your top priority leads for{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              Today&apos;s Focus
            </h1>
            <p className="text-muted-foreground mt-1">
              Your top priority leads for{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No High-Priority Leads Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Research new prospects to build your focus list. We&apos;ll automatically identify your
              top 5 priority leads based on buying signals and target buyer fit.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/research">
                <Button className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Research New Leads
                </Button>
              </Link>
              <Link href="/research/leads">
                <Button variant="outline">View All Leads</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 How Today&apos;s Focus Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Focus shows your top 5 priority leads each day</p>
            <p>• Priority is based on buying signals and target buyer fit</p>
            <p>• Leads you&apos;ve contacted are automatically excluded</p>
            <p>• Focus refreshes daily at midnight</p>
            <p>• Mark leads as contacted to help us improve your list</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            Today&apos;s Focus
          </h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} for{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Focus Cards */}
      <div className="space-y-4">
        {leads.map((lead, index) => (
          <FocusCard
            key={lead.id}
            lead={lead}
            position={index + 1}
            onMarkContacted={handleLeadContacted}
          />
        ))}
      </div>

      {/* Info Alert */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Your focus list is generated daily based on priority scores, buying signals, and recent
          activity. Leads you contact are automatically removed from future lists.
        </AlertDescription>
      </Alert>
    </div>
  );
}
