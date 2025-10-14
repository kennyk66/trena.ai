'use client';

import { useState } from 'react';
import type { CoachingAnalysis } from '@/types/outreach';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface CoachingHighlightProps {
  coaching: CoachingAnalysis;
  onApplySuggestion?: (tip: { position?: { start: number; end: number }; suggestion?: string }) => void;
}

export function CoachingHighlight({ coaching, onApplySuggestion }: CoachingHighlightProps) {
  const [expanded, setExpanded] = useState(true);

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const scoreColor = getScoreColor(coaching.score);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full font-bold text-lg ${scoreColor}`}>
            {coaching.score}/100
          </div>
          <h3 className="font-semibold text-sm">Coaching Tips</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Strengths */}
          {coaching.strengths.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Strengths</span>
              </div>
              <ul className="space-y-1 ml-6">
                {coaching.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak Phrases */}
          {coaching.weakPhrases.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>Weak Phrases ({coaching.weakPhrases.length})</span>
              </div>
              <div className="space-y-2">
                {coaching.weakPhrases.slice(0, 5).map((weak, index) => (
                  <div key={index} className="ml-6 p-2 bg-red-50 border border-red-200 rounded text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-red-800">
                          &quot;{weak.phrase}&quot;
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {weak.reason}
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          Try: &quot;{weak.suggestion}&quot;
                        </div>
                      </div>
                      {onApplySuggestion && weak.position && weak.suggestion && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApplySuggestion(weak)}
                          className="text-xs"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {coaching.improvements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Lightbulb className="h-4 w-4" />
                <span>Improvements</span>
              </div>
              <ul className="space-y-1 ml-6">
                {coaching.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {coaching.tips.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Additional Tips</div>
              <div className="space-y-2">
                {coaching.tips
                  .filter((tip) => tip.type === 'improvement' || tip.type === 'best_practice')
                  .slice(0, 3)
                  .map((tip, index) => (
                    <div key={index} className="ml-6 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="flex items-start gap-2">
                        {tip.impact && (
                          <Badge
                            variant={
                              tip.impact === 'high'
                                ? 'destructive'
                                : tip.impact === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {tip.impact}
                          </Badge>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-blue-800">{tip.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{tip.description}</div>
                          {tip.example && (
                            <div className="text-xs text-gray-500 mt-1 italic">{tip.example}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
