'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import type { ResearchedLead } from '@/types/research';

interface SearchFormProps {
  onSuccess: (lead: ResearchedLead, cached: boolean) => void;
  onError: (error: string) => void;
}

export function SearchForm({ onSuccess, onError }: SearchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    person_name: '',
    company_name: '',
    email: '',
    linkedin_url: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation: at least one field required
    if (
      !formData.person_name &&
      !formData.company_name &&
      !formData.email &&
      !formData.linkedin_url
    ) {
      onError('Please provide at least one search field');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/research/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        onError(result.error || 'Research failed');
        return;
      }

      onSuccess(result.lead, result.cached || false);

      // Reset form after successful research
      setFormData({
        person_name: '',
        company_name: '',
        email: '',
        linkedin_url: '',
      });
    } catch (error) {
      console.error('Search error:', error);
      onError('An error occurred while researching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Research a Prospect
        </CardTitle>
        <CardDescription>
          Enter as much information as you have. We&apos;ll find the rest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person_name">Person Name</Label>
            <Input
              id="person_name"
              placeholder="e.g., John Smith"
              value={formData.person_name}
              onChange={(e) =>
                setFormData({ ...formData, person_name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              placeholder="e.g., TechCorp Solutions"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., john@techcorp.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL (optional)</Label>
            <Input
              id="linkedin_url"
              placeholder="e.g., https://linkedin.com/in/johnsmith"
              value={formData.linkedin_url}
              onChange={(e) =>
                setFormData({ ...formData, linkedin_url: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Research Prospect
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Research typically takes 10-30 seconds per prospect
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
