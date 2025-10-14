'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OutreachMessage } from '@/types/outreach';
import { Mail, Linkedin, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { getMessageType, getStatus } from '@/lib/constants/outreach-options';
import { formatDistanceToNow } from 'date-fns';

interface MessageCardProps {
  message: OutreachMessage;
  leadName?: string;
  onView?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageCard({ message, leadName, onView, onEdit, onDelete }: MessageCardProps) {
  const messageTypeInfo = getMessageType(message.message_type);
  const statusInfo = getStatus(message.status);

  const getIcon = () => {
    switch (message.message_type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'call_script':
        return <Phone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'opened':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'clicked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const preview = message.edited_content || message.generated_content;
  const previewText = preview.substring(0, 120) + (preview.length > 120 ? '...' : '');

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              {message.subject ? (
                <h3 className="font-semibold text-sm truncate">{message.subject}</h3>
              ) : (
                <h3 className="font-semibold text-sm text-gray-500">
                  {messageTypeInfo?.label || message.message_type}
                </h3>
              )}
              {leadName && <p className="text-xs text-gray-600 truncate">{leadName}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={getStatusColor(message.status)} variant="outline">
                {statusInfo?.label || message.status}
              </Badge>
              {message.coaching_score > 0 && (
                <Badge
                  variant="outline"
                  className={
                    message.coaching_score >= 80
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : message.coaching_score >= 60
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }
                >
                  {message.coaching_score}/100
                </Badge>
              )}
            </div>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{previewText}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {message.sent_at
                ? `Sent ${formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}`
                : `Created ${formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}`}
            </div>

            <div className="flex items-center gap-2">
              {message.status === 'draft' && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(message.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}

              {onView && (
                <Button
                  variant={message.status === 'draft' ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => onView(message.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}

              {message.status === 'draft' && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
