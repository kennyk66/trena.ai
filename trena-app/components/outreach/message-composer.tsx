'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Save, Eye, Copy } from 'lucide-react';
import type { MessageType, ToneOption } from '@/types/outreach';

interface MessageComposerProps {
  messageType: MessageType;
  subject: string | null;
  body: string;
  onSubjectChange?: (subject: string) => void;
  onBodyChange?: (body: string) => void;
  onGenerate?: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export function MessageComposer({
  messageType,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onGenerate,
  onRegenerate,
  onSave,
  onPreview,
  isGenerating = false,
  disabled = false,
}: MessageComposerProps) {
  const [localSubject, setLocalSubject] = useState(subject || '');
  const [localBody, setLocalBody] = useState(body || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync props with local state
  useEffect(() => {
    setLocalSubject(subject || '');
  }, [subject]);

  useEffect(() => {
    setLocalBody(body || '');
  }, [body]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!body || !onSave) return;

    const interval = setInterval(() => {
      onSave();
      setLastSaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [body, onSave]);

  const handleSubjectChange = (value: string) => {
    setLocalSubject(value);
    onSubjectChange?.(value);
  };

  const handleBodyChange = (value: string) => {
    setLocalBody(value);
    onBodyChange?.(value);
  };

  const handleCopy = () => {
    const content = messageType === 'email' && localSubject
      ? `Subject: ${localSubject}\n\n${localBody}`
      : localBody;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = localBody.split(/\s+/).filter(Boolean).length;
  const charCount = localBody.length;

  const getRecommendedLength = () => {
    if (messageType === 'email') return '150-200 words';
    if (messageType === 'linkedin') return '100-150 words';
    if (messageType === 'call_script') return '250-300 words';
    return '';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Subject Line (Email only) */}
        {messageType === 'email' && (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={localSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="Enter email subject..."
              disabled={disabled || isGenerating}
              className="font-medium"
            />
            {localSubject.length > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {localSubject.length} characters
                </span>
                {localSubject.length > 60 && (
                  <span className="text-yellow-600">
                    Recommended: under 60 chars for mobile
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body">
              {messageType === 'call_script' ? 'Script' : 'Message'}
            </Label>
            {onGenerate && !body && (
              <Button
                size="sm"
                onClick={onGenerate}
                disabled={disabled || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            )}
          </div>
          <Textarea
            id="body"
            value={localBody}
            onChange={(e) => handleBodyChange(e.target.value)}
            placeholder={
              messageType === 'email'
                ? 'Your email content will appear here...'
                : messageType === 'linkedin'
                ? 'Your LinkedIn message will appear here...'
                : 'Your call script will appear here...'
            }
            disabled={disabled || isGenerating}
            rows={messageType === 'call_script' ? 20 : 12}
            className="font-mono text-sm leading-relaxed"
          />

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                <span className="font-medium">{wordCount}</span> words
              </span>
              <span>
                <span className="font-medium">{charCount}</span> characters
              </span>
              {getRecommendedLength() && (
                <span className="text-gray-500">
                  Recommended: {getRecommendedLength()}
                </span>
              )}
            </div>
            {lastSaved && (
              <span className="text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {onRegenerate && body && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={disabled || isGenerating}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
            )}
            {body && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={disabled}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSave();
                  setLastSaved(new Date());
                }}
                disabled={disabled || !body}
              >
                <Save className="h-3 w-3 mr-1" />
                Save Draft
              </Button>
            )}
            {onPreview && (
              <Button
                size="sm"
                onClick={onPreview}
                disabled={disabled || !body}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
