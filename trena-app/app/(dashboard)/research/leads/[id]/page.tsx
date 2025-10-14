'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContactInfo } from '@/components/research/contact-info';
import { AIPersonaComponent } from '@/components/research/ai-persona';
import { BuyingSignals } from '@/components/research/buying-signals';
import { PriorityBreakdown } from '@/components/priority/priority-breakdown';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  Code,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ResearchedLead, AIPersona } from '@/types/research';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<ResearchedLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyOpen, setCompanyOpen] = useState(true);
  const [roleOpen, setRoleOpen] = useState(true);
  const [techStackOpen, setTechStackOpen] = useState(false);
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadLead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/research/${id}`);
      const result = await response.json();

      if (result.success) {
        setLead(result.lead);
      }
    } catch (error) {
      console.error('Error loading lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaRegenerate = (newPersona: AIPersona) => {
    if (lead) {
      setLead({ ...lead, ai_persona: newPersona });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <Link href="/research/leads">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground">
            The lead you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/research/leads">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{lead.person_name || 'Unknown'}</h1>
            <p className="text-xl text-muted-foreground mt-1">{lead.person_title || 'No title'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" disabled>
              <Star className="h-4 w-4" />
              Add to Priorities
              <Badge variant="secondary" className="ml-1">
                Soon
              </Badge>
            </Button>
            <Button
              className="gap-2"
              onClick={() => router.push(`/outreach/compose?lead_id=${id}`)}
            >
              <Send className="h-4 w-4" />
              Generate Outreach
            </Button>
          </div>
        </div>

        {/* Company Info */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-5 w-5" />
          <span className="font-medium">{lead.company_name || 'Unknown Company'}</span>
          {lead.company_industry && (
            <>
              <span>•</span>
              <span>{lead.company_industry}</span>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Researched {new Date(lead.researched_at).toLocaleDateString()} via {lead.research_method}
        </p>
      </div>

      {/* Buying Signals */}
      {lead.buying_signals && lead.buying_signals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            🎯 BUYING SIGNALS
          </h3>
          <BuyingSignals signals={lead.buying_signals} />
        </div>
      )}

      {/* Priority Breakdown */}
      <PriorityBreakdown
        priorityScore={lead.priority_score}
        priorityLevel={lead.priority_level}
        buyingSignalScore={lead.buying_signal_score}
        fitScore={lead.fit_score}
        signalBreakdown={lead.signal_breakdown}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <ContactInfo
          email={lead.person_email}
          phone={lead.person_phone}
          linkedin={lead.person_linkedin}
        />

        {/* Company Overview */}
        <Collapsible open={companyOpen} onOpenChange={setCompanyOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Company Overview
                </CardTitle>
                {companyOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-medium">{lead.company_name || 'Unknown'}</p>
                </div>
                {lead.company_domain && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    <a
                      href={`https://${lead.company_domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {lead.company_domain}
                    </a>
                  </div>
                )}
                {lead.company_industry && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p>{lead.company_industry}</p>
                  </div>
                )}
                {lead.company_size && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                    <p>{lead.company_size} employees</p>
                  </div>
                )}
                {lead.company_revenue && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p>{lead.company_revenue}</p>
                  </div>
                )}
                {lead.company_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{lead.company_location}</p>
                  </div>
                )}
                {lead.company_description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lead.company_description}
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Role & Background */}
      <Collapsible open={roleOpen} onOpenChange={setRoleOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Role & Background
              </CardTitle>
              {roleOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="font-medium">{lead.person_title || 'Unknown'}</p>
              </div>
              {lead.person_seniority && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seniority</p>
                  <Badge variant="secondary">{lead.person_seniority}</Badge>
                </div>
              )}
              {lead.person_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{lead.person_location}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tech Stack */}
      {lead.tech_stack && lead.tech_stack.length > 0 && (
        <Collapsible open={techStackOpen} onOpenChange={setTechStackOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Tech Stack ({lead.tech_stack.length})
                </CardTitle>
                {techStackOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {tech.name}
                      {tech.category && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          • {tech.category}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Work History */}
      {lead.work_history && lead.work_history.length > 0 && (
        <Collapsible open={workHistoryOpen} onOpenChange={setWorkHistoryOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Work History ({lead.work_history.length})
                </CardTitle>
                {workHistoryOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {lead.work_history.map((job, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{job.job_title}</p>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {job.start_date
                            ? new Date(job.start_date).getFullYear()
                            : 'Unknown'}{' '}
                          -{' '}
                          {job.is_current
                            ? 'Present'
                            : job.end_date
                              ? new Date(job.end_date).getFullYear()
                              : 'Unknown'}
                          {job.duration && <span> • {job.duration}</span>}
                        </p>
                      </div>
                      {job.is_current && (
                        <Badge variant="secondary" className="h-fit">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* AI Persona */}
      <AIPersonaComponent
        persona={lead.ai_persona}
        leadId={lead.id}
        onRegenerate={handlePersonaRegenerate}
      />
    </div>
  );
}
