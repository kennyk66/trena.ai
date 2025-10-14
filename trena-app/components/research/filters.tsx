'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { RESEARCH_SORT_OPTIONS, INDUSTRY_OPTIONS, COMPANY_SIZE_OPTIONS, PRIORITY_LEVEL_OPTIONS } from '@/lib/constants/research-options';
import type { ResearchFilters, ResearchSortOption } from '@/types/research';

interface FiltersProps {
  filters: ResearchFilters;
  sortBy: ResearchSortOption;
  onFilterChange: (filters: ResearchFilters) => void;
  onSortChange: (sortBy: ResearchSortOption) => void;
  onReset: () => void;
}

export function Filters({ filters, sortBy, onFilterChange, onSortChange, onReset }: FiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search_query || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search_query: searchInput });
  };

  const hasActiveFilters =
    filters.industry ||
    filters.company_size ||
    filters.has_email ||
    filters.has_buying_signals ||
    filters.search_query ||
    filters.priority_level;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as ResearchSortOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESEARCH_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority_level || 'all'}
              onValueChange={(value) =>
                onFilterChange({ ...filters, priority_level: value === 'all' ? undefined : value as 'high' | 'medium' | 'low' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Industry Filter */}
          <div className="space-y-2">
            <Label>Industry</Label>
            <Select
              value={filters.industry || 'all'}
              onValueChange={(value) =>
                onFilterChange({ ...filters, industry: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Size Filter */}
          <div className="space-y-2">
            <Label>Company Size</Label>
            <Select
              value={filters.company_size || 'all'}
              onValueChange={(value) =>
                onFilterChange({ ...filters, company_size: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {COMPANY_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label>Quick Filters</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_email"
                  checked={filters.has_email || false}
                  onCheckedChange={(checked) =>
                    onFilterChange({ ...filters, has_email: checked as boolean })
                  }
                />
                <label
                  htmlFor="has_email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Has Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_buying_signals"
                  checked={filters.has_buying_signals || false}
                  onCheckedChange={(checked) =>
                    onFilterChange({ ...filters, has_buying_signals: checked as boolean })
                  }
                />
                <label
                  htmlFor="has_buying_signals"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Has Buying Signals
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
