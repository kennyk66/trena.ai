'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/priority/priority-badge';
import type { ResearchedLead } from '@/types/research';

interface FocusWidgetProps {
  focusLeads: ResearchedLead[];
  focusCompletionRate: number;
}

export function FocusWidget({ focusLeads, focusCompletionRate }: FocusWidgetProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Today&apos;s Focus</h3>
        </div>
        <Link href="/focus">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Completion Rate */}
      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-purple-900">Completion Rate</span>
          <span className="text-sm font-bold text-purple-600">{focusCompletionRate}%</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(focusCompletionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Focus Leads Preview */}
      {focusLeads.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No focus leads for today</p>
          <Link href="/focus">
            <Button size="sm" variant="outline">
              Generate Focus List
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {focusLeads.slice(0, 3).map((lead) => (
            <Link
              key={lead.id}
              href={`/research/leads/${lead.id}`}
              className="block p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{lead.person_name}</p>
                    {lead.priority_level && (
                      <PriorityBadge
                        priority={lead.priority_level}
                        score={lead.priority_score}
                        showScore={false}
                        size="sm"
                      />
                    )}
                  </div>
                  {lead.person_title && (
                    <p className="text-xs text-gray-600 truncate">{lead.person_title}</p>
                  )}
                  {lead.company_name && (
                    <p className="text-xs text-gray-500 truncate">{lead.company_name}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {focusLeads.length > 3 && (
            <Link href="/focus">
              <Button variant="outline" size="sm" className="w-full">
                View {focusLeads.length - 3} More
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
