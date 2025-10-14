'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Search, Building2, Briefcase, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecommendedLead {
  lead_name: string;
  job_title?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  match_reasoning?: string;
  match_score?: number;
}

interface RecommendedLeadsWidgetProps {
  limit?: number;
}

export function RecommendedLeadsWidget({ limit = 3 }: RecommendedLeadsWidgetProps) {
  const [leads, setLeads] = useState<RecommendedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [rateLimitWait, setRateLimitWait] = useState<number | null>(null);
  const router = useRouter();

  const fetchRecommendedLeads = async () => {
    try {
      setIsRefreshing(true);
      setRateLimitWait(null);
      const response = await fetch(`/api/leads/recommended?limit=${limit}`);
      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        setRateLimitWait(data.waitSeconds || 30);
        setError(data.error || 'Please wait before refreshing');
      } else if (data.success) {
        setLeads(data.leads || []);
        setIsCached(data.cached || false);
        setError(null);
        setRateLimitWait(null);
      } else {
        setError(data.error || 'Failed to fetch recommended leads');
        setRateLimitWait(null);
      }
    } catch (err) {
      console.error('Error fetching recommended leads:', err);
      setError('Failed to load recommendations');
      setRateLimitWait(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendedLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResearchLead = (lead: RecommendedLead) => {
    // Navigate to research page with pre-filled data
    const searchParams = new URLSearchParams();
    if (lead.lead_name) searchParams.set('name', lead.lead_name);
    if (lead.company_name) searchParams.set('company', lead.company_name);
    if (lead.email) searchParams.set('email', lead.email);
    if (lead.linkedin_url) searchParams.set('linkedin', lead.linkedin_url);

    router.push(`/research?${searchParams.toString()}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Recommended Leads</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={fetchRecommendedLeads}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-medium">High-priority prospects</span> matching your target
          industries and roles
          {isCached && <span className="ml-2 text-xs text-blue-600">(Cached)</span>}
        </p>
        {rateLimitWait && (
          <p className="text-xs text-orange-700 mt-1">
            ⏱️ Rate limit: Wait {rateLimitWait}s before refreshing
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 text-gray-300 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Finding perfect matches...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchRecommendedLeads}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && leads.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">
            No recommendations available at the moment
          </p>
          <Button size="sm" variant="outline" onClick={fetchRecommendedLeads}>
            Refresh Recommendations
          </Button>
        </div>
      )}

      {/* Leads List */}
      {!isLoading && !error && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Name & Title */}
                  <div className="mb-2">
                    <p className="font-semibold text-base truncate">{lead.lead_name}</p>
                    {lead.job_title && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="truncate">{lead.job_title}</span>
                      </div>
                    )}
                  </div>

                  {/* Company */}
                  {lead.company_name && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate">{lead.company_name}</span>
                      {lead.company_size && (
                        <span className="text-gray-400">• {lead.company_size}</span>
                      )}
                    </div>
                  )}

                  {/* Industry */}
                  {lead.industry && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{lead.industry}</span>
                    </div>
                  )}

                  {/* Match Reasoning */}
                  {lead.match_reasoning && (
                    <div className="mt-2 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-800 inline-block">
                      {lead.match_reasoning}
                    </div>
                  )}
                </div>

                {/* Research Button */}
                <Button
                  size="sm"
                  onClick={() => handleResearchLead(lead)}
                  className="gap-1 shrink-0"
                >
                  <Search className="h-3.5 w-3.5" />
                  Research
                </Button>
              </div>
            </div>
          ))}

          {leads.length >= 3 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              onClick={fetchRecommendedLeads}
            >
              <RefreshCw className="h-4 w-4" />
              Show New Recommendations
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
