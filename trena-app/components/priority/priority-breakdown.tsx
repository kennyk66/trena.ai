// PRD #0004: Lead Prioritization - Priority Breakdown Component
// Displays detailed priority score breakdown with signal analysis

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SignalBreakdown } from '@/types/priority';
import { TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';

interface PriorityBreakdownProps {
  priorityScore: number;
  priorityLevel: 'high' | 'medium' | 'low' | null;
  buyingSignalScore: number;
  fitScore: number;
  signalBreakdown: SignalBreakdown[];
  maxScore?: number;
}

export function PriorityBreakdown({
  priorityScore,
  priorityLevel,
  buyingSignalScore,
  fitScore,
  signalBreakdown,
  maxScore = 14,
}: PriorityBreakdownProps) {
  if (!priorityLevel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Priority Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Priority score has not been calculated for this lead yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const buyingSignals = signalBreakdown.filter((s) => s.category === 'buying_signal');
  const fitSignals = signalBreakdown.filter((s) => s.category === 'fit');

  const priorityColor = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Priority Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Score */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Total Priority Score</p>
            <p className={`text-3xl font-bold ${priorityColor[priorityLevel]}`}>
              {priorityScore}/{maxScore}
            </p>
            <p className="text-sm capitalize mt-1">
              <Badge
                variant="outline"
                className={
                  priorityLevel === 'high'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : priorityLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                }
              >
                {priorityLevel} Priority
              </Badge>
            </p>
          </div>
          <TrendingUp className={`h-12 w-12 ${priorityColor[priorityLevel]}`} />
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium">Buying Signals</p>
            </div>
            <p className="text-2xl font-bold">
              {buyingSignalScore}
              <span className="text-sm text-muted-foreground font-normal">/10</span>
            </p>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">Target Fit</p>
            </div>
            <p className="text-2xl font-bold">
              {fitScore}
              <span className="text-sm text-muted-foreground font-normal">/4</span>
            </p>
          </div>
        </div>

        {/* Buying Signals Breakdown */}
        {buyingSignals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Buying Signals Detected
            </h4>
            <div className="space-y-1">
              {buyingSignals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {signal.signal_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">{signal.signal_name}</span>
                  </div>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    +{signal.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fit Score Breakdown */}
        {fitSignals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Target Buyer Fit
            </h4>
            <div className="space-y-1">
              {fitSignals.map((signal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {signal.signal_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground">{signal.signal_name}</span>
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{signal.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No signals message */}
        {buyingSignals.length === 0 && fitSignals.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>No buying signals or fit indicators detected.</p>
            <p className="mt-1">Priority score is based on available lead data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
