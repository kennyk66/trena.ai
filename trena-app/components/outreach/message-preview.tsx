'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Send } from 'lucide-react';
import type { MessageType } from '@/types/outreach';
import { useState } from 'react';

interface MessagePreviewProps {
  subject: string | null;
  body: string;
  messageType: MessageType;
  onEdit?: () => void;
  onCopy?: () => void;
  onSend?: () => void;
}

export function MessagePreview({
  subject,
  body,
  messageType,
  onEdit,
  onCopy,
  onSend,
}: MessagePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const content = subject ? `${subject}\n\n${body}` : body;
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = body.split(/\s+/).length;
  const charCount = body.length;

  // Character limits
  const getCharLimit = () => {
    if (messageType === 'linkedin') return 300;
    return null;
  };

  const charLimit = getCharLimit();
  const isOverLimit = charLimit && charCount > charLimit;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Preview</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {onSend && (
            <Button size="sm" onClick={onSend}>
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Email Preview */}
        {messageType === 'email' && subject && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Subject</div>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="font-semibold text-sm">{subject}</p>
            </div>
            {subject.length > 60 && (
              <p className="text-xs text-yellow-600 mt-1">
                Subject is {subject.length} characters (recommended: under 60)
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">
            {messageType === 'call_script' ? 'Script' : 'Message'}
          </div>
          <div className="p-4 bg-white border rounded whitespace-pre-wrap text-sm leading-relaxed">
            {body}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">{wordCount}</span> words
          </div>
          <div>
            <span className={`font-medium ${isOverLimit ? 'text-red-600' : ''}`}>
              {charCount}
            </span>{' '}
            characters
            {charLimit && ` / ${charLimit}`}
          </div>
        </div>

        {/* Validation Messages */}
        {isOverLimit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Message exceeds {charLimit} character limit for {messageType}. Please shorten it.
          </div>
        )}

        {messageType === 'email' && wordCount > 200 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            Emails over 200 words typically get fewer responses. Consider shortening.
          </div>
        )}

        {messageType === 'linkedin' && wordCount > 150 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            LinkedIn messages over 150 words are often too long. Consider being more concise.
          </div>
        )}
      </div>
    </Card>
  );
}
