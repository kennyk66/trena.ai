// PRD #0004: Lead Prioritization - Focus Card Component
// Displays individual lead in Today's Focus list with action buttons

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from './priority-badge';
import {
  Building2,
  Mail,
  Phone,
  Linkedin,
  CheckCircle2,
  Send,
  Eye,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type { ResearchedLead } from '@/types/research';

interface FocusCardProps {
  lead: ResearchedLead;
  position: number;
  onMarkContacted?: (leadId: string) => void;
}

export function FocusCard({ lead, position, onMarkContacted }: FocusCardProps) {
  const [isMarkingContacted, setIsMarkingContacted] = useState(false);
  const [isContacted, setIsContacted] = useState(false);

  const handleMarkContacted = async () => {
    if (isContacted) return;

    setIsMarkingContacted(true);
    try {
      const response = await fetch('/api/priority/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          action_type: 'contacted',
          metadata: { from_focus: true, position },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsContacted(true);
        onMarkContacted?.(lead.id);
      }
    } catch (error) {
      console.error('Error marking lead as contacted:', error);
    } finally {
      setIsMarkingContacted(false);
    }
  };

  const topBuyingSignals = lead.buying_signals?.slice(0, 2) || [];

  return (
    <Card className={`transition-all ${isContacted ? 'opacity-50 border-green-500' : 'hover:border-orange-300 dark:hover:border-orange-700'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
              {position}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{lead.person_name || 'Unknown'}</h3>
              <p className="text-sm text-muted-foreground">{lead.person_title || 'No title'}</p>
            </div>
          </div>

          {isContacted && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Contacted
            </Badge>
          )}
        </div>

        {/* Company */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Building2 className="h-4 w-4" />
          <span className="font-medium">{lead.company_name || 'Unknown Company'}</span>
          {lead.company_industry && (
            <>
              <span>•</span>
              <span>{lead.company_industry}</span>
            </>
          )}
        </div>

        {/* Priority Badge */}
        <div className="mb-3">
          <PriorityBadge
            priority={lead.priority_level}
            showScore={true}
            score={lead.priority_score}
            size="sm"
          />
        </div>

        {/* Top Buying Signals */}
        {topBuyingSignals.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">TOP SIGNALS:</p>
            <div className="space-y-1">
              {topBuyingSignals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">•</span>
                  <span className="text-muted-foreground">{signal.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {lead.person_email && (
            <Badge variant="outline" className="gap-1">
              <Mail className="h-3 w-3" />
              Email
            </Badge>
          )}
          {lead.person_phone && (
            <Badge variant="outline" className="gap-1">
              <Phone className="h-3 w-3" />
              Phone
            </Badge>
          )}
          {lead.person_linkedin && (
            <Badge variant="outline" className="gap-1">
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleMarkContacted}
            disabled={isMarkingContacted || isContacted}
            className="flex-1 gap-2"
            variant={isContacted ? 'outline' : 'default'}
          >
            {isMarkingContacted ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Marking...
              </>
            ) : isContacted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Contacted
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark Contacted
              </>
            )}
          </Button>

          <Link href={`/research/leads/${lead.id}`}>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>

          <Button variant="ghost" size="icon" disabled title="Generate Outreach (Coming Soon)">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
