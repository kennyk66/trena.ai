'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import type { AIPersona } from '@/types/research';

interface AIPersonaProps {
  persona: AIPersona | null;
  leadId: string;
  onRegenerate?: (newPersona: AIPersona) => void;
}

export function AIPersonaComponent({ persona, leadId, onRegenerate }: AIPersonaProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/research/${leadId}/regenerate-persona`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success && result.lead?.ai_persona) {
        onRegenerate?.(result.lead.ai_persona);
      }
    } catch (error) {
      console.error('Error regenerating persona:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!persona) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            AI Buyer Persona
          </CardTitle>
          <CardDescription>
            AI-powered insights to help you connect with this prospect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No AI persona available. This lead may have been created before persona generation was
            enabled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              AI Buyer Persona
            </CardTitle>
            <CardDescription>
              AI-powered insights to help you connect with this prospect
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Summary */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-orange-600 dark:text-orange-400">📋</span>
            Role Summary
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{persona.role_summary}</p>
        </div>

        {/* Pain Points */}
        {persona.pain_points && persona.pain_points.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">💢</span>
              Likely Pain Points
            </h4>
            <ul className="space-y-2">
              {persona.pain_points.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span className="text-sm text-muted-foreground flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Goals & Motivations */}
        {persona.goals && persona.goals.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">🎯</span>
              Goals & Motivations
            </h4>
            <ul className="space-y-2">
              {persona.goals.map((goal, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                  <span className="text-sm text-muted-foreground flex-1">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Talk Tracks */}
        {persona.talk_tracks && persona.talk_tracks.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">💬</span>
              Talk Tracks
            </h4>
            <div className="space-y-3">
              {persona.talk_tracks.map((track, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
                >
                  <p className="text-sm">{track}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Starters */}
        {persona.conversation_starters && persona.conversation_starters.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">💡</span>
              Conversation Starters
            </h4>
            <div className="space-y-2">
              {persona.conversation_starters.map((starter, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-muted/50 border text-sm italic"
                >
                  &quot;{starter}&quot;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buying Signal Context */}
        {persona.buying_signal_context && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400">🎯</span>
              Buying Signal Context
            </h4>
            <p className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              {persona.buying_signal_context}
            </p>
          </div>
        )}

        {/* Generated At */}
        <p className="text-xs text-muted-foreground text-center pt-4 border-t">
          Generated {new Date(persona.generated_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
