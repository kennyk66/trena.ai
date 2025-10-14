'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filters } from '@/components/research/filters';
import { LeadListItem } from '@/components/research/lead-list-item';
import { Loader2, Search, UserSearch } from 'lucide-react';
import Link from 'next/link';
import type { ResearchedLead, ResearchFilters, ResearchSortOption } from '@/types/research';

export default function ResearchedLeadsPage() {
  const [leads, setLeads] = useState<ResearchedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  const [filters, setFilters] = useState<ResearchFilters>({});
  const [sortBy, setSortBy] = useState<ResearchSortOption>('researched_at_desc');

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, sortBy]);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
      });

      if (filters.industry) params.append('industry', filters.industry);
      if (filters.company_size) params.append('company_size', filters.company_size);
      if (filters.has_email) params.append('has_email', 'true');
      if (filters.has_buying_signals) params.append('has_buying_signals', 'true');
      if (filters.search_query) params.append('search_query', filters.search_query);

      const response = await fetch(`/api/research/leads?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLeads(result.leads || []);
        setTotal(result.total || 0);
        setHasMore(result.has_more || false);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ResearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy: ResearchSortOption) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setSortBy('researched_at_desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserSearch className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            Researched Leads
          </h1>
          <p className="text-muted-foreground mt-2">
            {total} {total === 1 ? 'lead' : 'leads'} researched
          </p>
        </div>
        <Link href="/research">
          <Button className="gap-2">
            <Search className="h-4 w-4" />
            Research New Lead
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Filters
        filters={filters}
        sortBy={sortBy}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <UserSearch className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No leads found</h3>
          <p className="text-muted-foreground mb-4">
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters or search query'
              : "You haven't researched any leads yet"}
          </p>
          <Link href="/research">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Research Your First Lead
            </Button>
          </Link>
        </div>
      )}

      {/* Leads List */}
      {!isLoading && leads.length > 0 && (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadListItem key={lead.id} lead={lead} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && leads.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} leads
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
