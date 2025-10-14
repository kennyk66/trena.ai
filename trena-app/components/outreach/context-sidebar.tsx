'use client';

import type { ResearchedLead } from '@/types/research';
import { Card } from '@/components/ui/card';
import { Building2, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { PriorityBadge } from '@/components/priority/priority-badge';
import { BuyingSignals } from '@/components/research/buying-signals';

interface ContextSidebarProps {
  lead: ResearchedLead;
}

export function ContextSidebar({ lead }: ContextSidebarProps) {
  return (
    <div className="space-y-4 sticky top-4">
      {/* Lead Info */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{lead.person_name}</h3>
            {lead.person_title && (
              <p className="text-sm text-gray-600 truncate">{lead.person_title}</p>
            )}
            {lead.company_name && (
              <p className="text-sm text-gray-500 truncate">{lead.company_name}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Priority */}
      {lead.priority_level && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-sm">Priority</h4>
          </div>
          <PriorityBadge
            priority={lead.priority_level}
            score={lead.priority_score}
            showScore={true}
          />
        </Card>
      )}

      {/* Buying Signals */}
      {lead.buying_signals && lead.buying_signals.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-sm">Buying Signals</h4>
          </div>
          <BuyingSignals
            signals={lead.buying_signals.slice(0, 3)}
            variant="default"
          />
        </Card>
      )}

      {/* Persona Insights */}
      {lead.ai_persona && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <h4 className="font-semibold text-sm">Persona Insights</h4>
          </div>

          {/* Pain Points */}
          {lead.ai_persona.pain_points.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1">Pain Points</div>
              <ul className="space-y-1">
                {lead.ai_persona.pain_points.slice(0, 3).map((pain, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{pain}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {lead.ai_persona.goals.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-700 mb-1">Goals</div>
              <ul className="space-y-1">
                {lead.ai_persona.goals.slice(0, 2).map((goal, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Talk Tracks */}
          {lead.ai_persona.talk_tracks.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Talk Tracks</div>
              <ul className="space-y-1">
                {lead.ai_persona.talk_tracks.slice(0, 2).map((track, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{track}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Company Info */}
      {(lead.company_industry || lead.company_size) && (
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-2">Company Details</h4>
          <div className="space-y-2 text-xs">
            {lead.company_industry && (
              <div>
                <span className="text-gray-500">Industry:</span>{' '}
                <span className="text-gray-700">{lead.company_industry}</span>
              </div>
            )}
            {lead.company_size && (
              <div>
                <span className="text-gray-500">Size:</span>{' '}
                <span className="text-gray-700">{lead.company_size}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
