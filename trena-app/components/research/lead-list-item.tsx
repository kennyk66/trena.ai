'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BuyingSignals } from './buying-signals';
import { PriorityBadge } from '@/components/priority/priority-badge';
import { Building2, Mail, ArrowRight } from 'lucide-react';
import type { ResearchedLead } from '@/types/research';
import Link from 'next/link';

interface LeadListItemProps {
  lead: ResearchedLead;
}

export function LeadListItem({ lead }: LeadListItemProps) {
  const formattedDate = new Date(lead.researched_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Lead Info */}
          <div className="flex-1 space-y-3">
            {/* Name and Title */}
            <div>
              <h3 className="font-semibold text-lg">{lead.person_name || 'Unknown'}</h3>
              <p className="text-sm text-muted-foreground">{lead.person_title || 'No title'}</p>
            </div>

            {/* Priority Badge */}
            <PriorityBadge
              priority={lead.priority_level}
              showScore={true}
              score={lead.priority_score}
              size="sm"
            />

            {/* Company Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{lead.company_name || 'Unknown Company'}</span>
              {lead.company_industry && (
                <>
                  <span>•</span>
                  <span>{lead.company_industry}</span>
                </>
              )}
              {lead.company_size && (
                <>
                  <span>•</span>
                  <span>{lead.company_size} employees</span>
                </>
              )}
            </div>

            {/* Email Badge */}
            {lead.person_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">Has email</span>
              </div>
            )}

            {/* Buying Signals */}
            {lead.buying_signals && lead.buying_signals.length > 0 && (
              <BuyingSignals signals={lead.buying_signals} variant="compact" />
            )}

            {/* Research Date */}
            <p className="text-xs text-muted-foreground">Researched {formattedDate}</p>
          </div>

          {/* Right: Action Button */}
          <div className="flex-shrink-0">
            <Link href={`/research/leads/${lead.id}`}>
              <Button variant="outline" className="gap-2">
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
