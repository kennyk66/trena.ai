'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchForm } from '@/components/research/search-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { ResearchedLead } from '@/types/research';
import Link from 'next/link';

export default function ResearchPage() {
  const [successMessage, setSuccessMessage] = useState<{
    lead: ResearchedLead;
    cached: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = (lead: ResearchedLead, cached: boolean) => {
    setSuccessMessage({ lead, cached });
    setErrorMessage(null);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          Buyer Research
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered prospect research in under 30 seconds. Get comprehensive
          insights, buying signals, and personalized talk tracks.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            {successMessage.cached ? 'Cached Research Retrieved!' : 'Research Complete!'}
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between">
              <span>
                Successfully researched <strong>{successMessage.lead.person_name}</strong> at{' '}
                <strong>{successMessage.lead.company_name}</strong>
                {successMessage.cached && ' (from cache)'}
              </span>
              <Link href={`/research/leads/${successMessage.lead.id}`}>
                <Button size="sm" variant="outline" className="gap-1">
                  View Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Research Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabs for different research methods */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="gap-2">
            <Search className="h-4 w-4" />
            Manual Search
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-2" disabled>
            <Upload className="h-4 w-4" />
            CSV Upload
            <Badge variant="secondary" className="ml-1">
              Coming Soon
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-2" disabled>
            <RefreshCw className="h-4 w-4" />
            CRM Sync
            <Badge variant="secondary" className="ml-1">
              Coming Soon
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Search Form */}
            <SearchForm onSuccess={handleSuccess} onError={handleError} />

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>Research Tips</CardTitle>
                <CardDescription>
                  Get the best results from AI-powered research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">📧 Email is most reliable</h4>
                  <p className="text-sm text-muted-foreground">
                    Work email addresses provide the most accurate and comprehensive
                    data.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🔗 LinkedIn URLs work great</h4>
                  <p className="text-sm text-muted-foreground">
                    We can enrich full profile data from LinkedIn URLs.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🏢 Name + Company works too</h4>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll search across databases to find the right person.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⚡ Cached for 30 days</h4>
                  <p className="text-sm text-muted-foreground">
                    Researching the same prospect within 30 days returns cached data
                    instantly.
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <Link href="/research/leads">
                    <Button variant="outline" className="w-full gap-2">
                      View All Researched Leads <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Upload</CardTitle>
              <CardDescription>
                Upload a CSV file to research multiple prospects at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">CSV upload coming soon</p>
                <p className="text-sm mt-2">
                  Bulk research functionality will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>CRM Sync</CardTitle>
              <CardDescription>
                Connect your CRM to automatically research your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">CRM integration coming soon</p>
                <p className="text-sm mt-2">
                  Salesforce and HubSpot integrations will be available in the next
                  update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
