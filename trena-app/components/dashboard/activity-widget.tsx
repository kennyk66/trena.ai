'use client';

import { Card } from '@/components/ui/card';
import { Clock, Search, Mail, Send, UserCheck } from 'lucide-react';
import type { RecentActivity } from '@/lib/analytics/analytics-service';
import { formatDistanceToNow } from 'date-fns';

interface ActivityWidgetProps {
  activities: RecentActivity[];
}

export function ActivityWidget({ activities }: ActivityWidgetProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lead_researched':
        return Search;
      case 'message_generated':
        return Mail;
      case 'message_sent':
        return Send;
      case 'lead_contacted':
        return UserCheck;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lead_researched':
        return 'bg-blue-50 text-blue-600';
      case 'message_generated':
        return 'bg-yellow-50 text-yellow-600';
      case 'message_sent':
        return 'bg-green-50 text-green-600';
      case 'lead_contacted':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${colorClass} flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
