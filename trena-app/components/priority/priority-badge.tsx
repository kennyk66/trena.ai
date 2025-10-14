// PRD #0004: Lead Prioritization - Priority Badge Component
// Displays priority level with appropriate color coding

import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { PriorityLevel } from '@/types/priority';

interface PriorityBadgeProps {
  priority: PriorityLevel | null;
  showScore?: boolean;
  score?: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  fitScore?: number; // Fit score (0-4) to determine "Perfect Fit"
  buyingSignalCount?: number; // Number of buying signals
}

export function PriorityBadge({
  priority,
  showScore = false,
  score,
  maxScore = 14,
  size = 'md',
  fitScore = 0,
  buyingSignalCount = 0,
}: PriorityBadgeProps) {
  if (!priority) {
    return null;
  }

  // Determine if this is a "Perfect Fit" lead
  // Perfect Fit = 4/4 fit score (exact industry + exact title match) + 2+ buying signals
  const isPerfectFit = fitScore >= 4 && buyingSignalCount >= 2;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const variantClasses = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const label = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`${variantClasses[priority]} ${sizeClasses[size]} font-medium`}
      >
        {label} Priority
      </Badge>
      {isPerfectFit && (
        <Badge
          variant="outline"
          className={`${sizeClasses[size]} bg-purple-100 text-purple-800 border-purple-300 font-medium flex items-center gap-1`}
        >
          <Star className="h-3 w-3 fill-purple-600" />
          Perfect Fit
        </Badge>
      )}
      {showScore && score !== undefined && (
        <span className="text-sm text-muted-foreground font-medium">
          {score}/{maxScore}
        </span>
      )}
    </div>
  );
}
