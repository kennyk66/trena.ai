'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Briefcase, Megaphone, Sparkles } from 'lucide-react';
import type { BuyingSignal } from '@/types/research';

interface BuyingSignalsProps {
  signals: BuyingSignal[];
  variant?: 'default' | 'compact';
}

export function BuyingSignals({ signals, variant = 'default' }: BuyingSignalsProps) {
  if (!signals || signals.length === 0) {
    return null;
  }

  const getIcon = (type: BuyingSignal['type']) => {
    switch (type) {
      case 'funding':
        return <TrendingUp className="h-3 w-3" />;
      case 'hiring':
        return <Users className="h-3 w-3" />;
      case 'leadership_change':
        return <Briefcase className="h-3 w-3" />;
      case 'product_launch':
        return <Megaphone className="h-3 w-3" />;
      case 'expansion':
        return <Sparkles className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  const getVariant = (type: BuyingSignal['type']) => {
    switch (type) {
      case 'funding':
        return 'default'; // Orange
      case 'hiring':
        return 'secondary';
      case 'leadership_change':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-1">
        {signals.map((signal, index) => (
          <Badge key={index} variant={getVariant(signal.type)} className="gap-1 text-xs">
            {getIcon(signal.type)}
            {signal.title}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {signals.map((signal, index) => (
        <div
          key={index}
          className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm"
        >
          <div className="mt-0.5 text-orange-600 dark:text-orange-400">
            {getIcon(signal.type)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-medium">{signal.title}</div>
            <div className="text-muted-foreground">{signal.description}</div>
            {signal.date && (
              <div className="text-xs text-muted-foreground">
                {new Date(signal.date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
