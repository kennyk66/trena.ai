'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MessageComposer } from '@/components/outreach/message-composer';
import { ToneSelector } from '@/components/outreach/tone-selector';
import { ContextSidebar } from '@/components/outreach/context-sidebar';
import { CoachingHighlight } from '@/components/outreach/coaching-highlight';
import { MESSAGE_TYPE_OPTIONS } from '@/lib/constants/outreach-options';
import type { MessageType, ToneOption, OutreachMessage, CoachingAnalysis } from '@/types/outreach';
import type { ResearchedLead } from '@/types/research';

function ComposePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');

  const [lead, setLead] = useState<ResearchedLead | null>(null);
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [tone, setTone] = useState<ToneOption>('warm');
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState<string>('');
  const [message, setMessage] = useState<OutreachMessage | null>(null);
  const [coaching, setCoaching] = useState<CoachingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lead data
  useEffect(() => {
    if (!leadId) {
      setError('No lead selected');
      setIsLoading(false);
      return;
    }

    async function fetchLead() {
      try {
        const response = await fetch(`/api/research/${leadId}`);
        if (!response.ok) throw new Error('Failed to fetch lead');
        const data = await response.json();
        setLead(data.lead);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lead');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLead();
  }, [leadId]);

  const handleGenerate = async () => {
    if (!leadId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          message_type: messageType,
          tone,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate message');

      const data = await response.json();

      if (data.success && data.message) {
        setMessage(data.message);
        setSubject(data.message.subject);
        setBody(data.message.generated_content);
        setCoaching(data.coaching);
      } else {
        throw new Error(data.error || 'Failed to generate message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!message) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/outreach/${message.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Failed to regenerate message');

      const data = await response.json();

      if (data.success && data.message) {
        setMessage(data.message);
        setSubject(data.message.subject);
        setBody(data.message.generated_content);
        setCoaching(data.coaching);
      } else {
        throw new Error(data.error || 'Failed to regenerate message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!message) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/outreach/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edited_content: body !== message.generated_content ? body : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save message');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save message');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!leadId || error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <p className="text-red-600 mb-4">{error || 'No lead selected'}</p>
          <Button onClick={() => router.push('/research/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/research/leads')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
        <h1 className="text-3xl font-bold">Compose Outreach</h1>
        <p className="text-gray-600 mt-1">
          Generate personalized outreach for {lead?.person_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Type Selector */}
          <Card className="p-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Message Type</label>
              <div className="grid grid-cols-3 gap-3">
                {MESSAGE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMessageType(option.value)}
                    disabled={isGenerating || !!message}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      messageType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${
                      isGenerating || message ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Tone Selector */}
          <ToneSelector
            value={tone}
            onChange={setTone}
            disabled={isGenerating || !!message}
          />

          {/* Message Composer */}
          <MessageComposer
            messageType={messageType}
            subject={subject}
            body={body}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
            onGenerate={handleGenerate}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            isGenerating={isGenerating}
            disabled={isSaving}
          />

          {/* Coaching Tips */}
          {coaching && <CoachingHighlight coaching={coaching} />}

          {/* Error Message */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {lead && <ContextSidebar lead={lead} />}
        </div>
      </div>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ComposePageContent />
    </Suspense>
  );
}
