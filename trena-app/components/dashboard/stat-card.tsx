'use client';

import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: keyof typeof Icons;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({
  title,
  value,
  iconName,
  description,
  trend,
  variant = 'default',
}: StatCardProps) {
  const Icon = Icons[iconName] as Icons.LucideIcon;
  const variantStyles = {
    default: 'bg-blue-50 text-blue-600',
    primary: 'bg-purple-50 text-purple-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value} {trend.label}
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
        <div className={cn('rounded-lg p-3', variantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
