// PRD #0005: Coaching Tips Service
// Analyzes outreach messages and provides inline coaching tips

import type { CoachingAnalysis, CoachingTip } from '@/types/outreach';

/**
 * Weak phrase patterns and their alternatives
 */
const WEAK_PHRASES = [
  {
    phrase: 'just checking in',
    alternatives: [
      'following up on',
      'wanted to share',
      'reaching out about',
    ],
    reason: 'Too passive. Provide context or value instead.',
    impact: 'high' as const,
  },
  {
    phrase: 'touching base',
    alternatives: ['wanted to connect about', 'following up on', 'checking on'],
    reason: 'Vague and overused. Be specific about why you\'re reaching out.',
    impact: 'high' as const,
  },
  {
    phrase: 'circle back',
    alternatives: ['follow up on', 'revisit', 'continue our conversation about'],
    reason: 'Corporate jargon. Use clear language.',
    impact: 'medium' as const,
  },
  {
    phrase: 'synergy',
    alternatives: ['collaboration', 'partnership', 'working together'],
    reason: 'Overused buzzword. Be more specific.',
    impact: 'medium' as const,
  },
  {
    phrase: 'low-hanging fruit',
    alternatives: ['quick wins', 'immediate opportunities', 'easy improvements'],
    reason: 'Cliché metaphor. Use concrete language.',
    impact: 'low' as const,
  },
  {
    phrase: 'at your earliest convenience',
    alternatives: ['this week', 'by Friday', 'when you have a moment'],
    reason: 'Too formal and vague. Set a clear timeframe.',
    impact: 'medium' as const,
  },
  {
    phrase: 'hope you are well',
    alternatives: ['I noticed', 'Congrats on', 'I saw that'],
    reason: 'Generic opener. Start with personalization instead.',
    impact: 'high' as const,
  },
  {
    phrase: 'i hope this email finds you well',
    alternatives: ['I noticed', 'Congrats on', 'I saw your team'],
    reason: 'Extremely generic. Start with something specific to them.',
    impact: 'high' as const,
  },
  {
    phrase: 'per my last email',
    alternatives: ['following up on', 'as mentioned', 'regarding'],
    reason: 'Can sound passive-aggressive. Be more collaborative.',
    impact: 'medium' as const,
  },
  {
    phrase: 'sorry to bother you',
    alternatives: ['I wanted to reach out', 'Quick question', 'I have an idea'],
    reason: 'Undermines your confidence. You\'re providing value, not bothering.',
    impact: 'high' as const,
  },
  {
    phrase: 'i was wondering if',
    alternatives: ['Would you be open to', 'Can we', 'Let\'s'],
    reason: 'Weak and uncertain. Be more direct and confident.',
    impact: 'medium' as const,
  },
  {
    phrase: 'let me know if you have any questions',
    alternatives: [
      'What questions do you have?',
      'When can we discuss this?',
      'Should we set up a call?',
    ],
    reason: 'Passive CTA. Ask for specific next steps instead.',
    impact: 'high' as const,
  },
  {
    phrase: 'feel free to',
    alternatives: ['I recommend', 'You can', 'The next step is'],
    reason: 'Too passive. Give clear direction.',
    impact: 'medium' as const,
  },
  {
    phrase: 'thought i would reach out',
    alternatives: ['I\'m reaching out because', 'I wanted to connect about', 'Quick note on'],
    reason: 'Filler language. Get to the point faster.',
    impact: 'medium' as const,
  },
];

/**
 * Best practice tips
 */
const BEST_PRACTICES = [
  {
    type: 'personalization',
    title: 'Personalization',
    description: 'Reference specific details about their company, role, or recent news',
  },
  {
    type: 'value_prop',
    title: 'Clear Value',
    description: 'Lead with value or insight, not your product pitch',
  },
  {
    type: 'brevity',
    title: 'Keep it Short',
    description: 'Emails under 200 words get 50% more replies',
  },
  {
    type: 'cta',
    title: 'Strong CTA',
    description: 'End with one specific, low-friction ask',
  },
  {
    type: 'subject',
    title: 'Subject Line',
    description: 'Keep subject under 60 characters for mobile readability',
  },
];

/**
 * Analyze message and provide coaching tips
 */
export async function analyzeMessage(params: {
  content: string;
  subject?: string | null;
  messageType: 'email' | 'linkedin' | 'call_script';
}): Promise<CoachingAnalysis> {
  const { content, subject, messageType } = params;

  const weakPhrases = detectWeakPhrases(content);
  const tips = generateTips(content, subject, messageType, weakPhrases);
  const score = calculateCoachingScore(content, subject, messageType, weakPhrases);
  const strengths = identifyStrengths(content, subject);
  const improvements = generateImprovements(content, subject, messageType, weakPhrases);

  return {
    score,
    tips,
    weakPhrases,
    strengths,
    improvements,
  };
}

/**
 * Detect weak phrases in content
 */
function detectWeakPhrases(content: string): Array<{
  phrase: string;
  position: { start: number; end: number };
  suggestion: string;
  reason: string;
}> {
  const detected: Array<{
    phrase: string;
    position: { start: number; end: number };
    suggestion: string;
    reason: string;
  }> = [];

  const lowerContent = content.toLowerCase();

  WEAK_PHRASES.forEach((weakPhrase) => {
    const phrase = weakPhrase.phrase.toLowerCase();
    let startIndex = 0;

    while (true) {
      const index = lowerContent.indexOf(phrase, startIndex);
      if (index === -1) break;

      detected.push({
        phrase: content.substring(index, index + phrase.length),
        position: {
          start: index,
          end: index + phrase.length,
        },
        suggestion: weakPhrase.alternatives[0], // Use first alternative as main suggestion
        reason: weakPhrase.reason,
      });

      startIndex = index + phrase.length;
    }
  });

  return detected;
}

/**
 * Generate coaching tips
 */
function generateTips(
  content: string,
  subject: string | null | undefined,
  messageType: string,
  weakPhrases: Array<{ phrase: string; position: { start: number; end: number }; suggestion: string; reason: string }>
): CoachingTip[] {
  const tips: CoachingTip[] = [];

  // Add tips for detected weak phrases
  weakPhrases.slice(0, 5).forEach((weak) => {
    const weakPhraseData = WEAK_PHRASES.find(
      (wp) => wp.phrase.toLowerCase() === weak.phrase.toLowerCase()
    );

    tips.push({
      type: 'weak_phrase',
      title: `Replace "${weak.phrase}"`,
      description: weak.reason,
      position: weak.position,
      suggestion: weak.suggestion,
      impact: weakPhraseData?.impact || 'medium',
      example: `Try: "${weak.suggestion}" instead`,
    });
  });

  // Length check
  const wordCount = content.split(/\s+/).length;
  if (messageType === 'email' && wordCount > 200) {
    tips.push({
      type: 'improvement',
      title: 'Message Too Long',
      description: 'Emails over 200 words get fewer replies. Try to cut 30% of the content.',
      impact: 'high',
    });
  }

  if (messageType === 'linkedin' && wordCount > 150) {
    tips.push({
      type: 'improvement',
      title: 'LinkedIn Message Too Long',
      description: 'LinkedIn messages should be under 150 words. Cut to the essentials.',
      impact: 'high',
    });
  }

  // Subject line check (email only)
  if (messageType === 'email' && subject) {
    if (subject.length > 60) {
      tips.push({
        type: 'improvement',
        title: 'Subject Line Too Long',
        description: 'Keep subject under 60 characters for mobile readability.',
        impact: 'medium',
      });
    }

    if (subject.toLowerCase().includes('free') || subject.toLowerCase().includes('guarantee')) {
      tips.push({
        type: 'improvement',
        title: 'Avoid Spam Triggers',
        description: 'Words like "free" and "guarantee" can trigger spam filters.',
        impact: 'medium',
      });
    }
  }

  // CTA check
  const hasWeakCTA =
    content.toLowerCase().includes('let me know') ||
    content.toLowerCase().includes('feel free');

  if (hasWeakCTA) {
    tips.push({
      type: 'improvement',
      title: 'Strengthen Your Call-to-Action',
      description: 'Replace passive phrases with specific asks like "Can we chat Thursday at 2pm?"',
      impact: 'high',
      example: 'Try: "Are you available for a 15-min call this week?"',
    });
  }

  // Personalization check
  const hasPersonalization =
    content.toLowerCase().includes('i noticed') ||
    content.toLowerCase().includes('i saw') ||
    content.toLowerCase().includes('congrats');

  if (!hasPersonalization && messageType !== 'call_script') {
    tips.push({
      type: 'best_practice',
      title: 'Add Personalization',
      description: 'Reference something specific about their company, role, or recent news.',
      impact: 'high',
      example: 'Try: "I noticed [Company] just raised funding..." or "Congrats on the new product launch"',
    });
  }

  return tips;
}

/**
 * Calculate coaching score (0-100)
 */
function calculateCoachingScore(
  content: string,
  subject: string | null | undefined,
  messageType: string,
  weakPhrases: Array<unknown>
): number {
  let score = 100;

  // Deduct for weak phrases (10 points each, max -40)
  const weakPhraseDeduction = Math.min(weakPhrases.length * 10, 40);
  score -= weakPhraseDeduction;

  // Deduct for length issues
  const wordCount = content.split(/\s+/).length;
  if (messageType === 'email' && wordCount > 200) {
    score -= 15;
  } else if (messageType === 'linkedin' && wordCount > 150) {
    score -= 15;
  }

  // Deduct for subject line issues (email only)
  if (messageType === 'email' && subject) {
    if (subject.length > 60) {
      score -= 10;
    }
    if (subject.toLowerCase().includes('free') || subject.toLowerCase().includes('guarantee')) {
      score -= 10;
    }
  }

  // Check for best practices
  const lowerContent = content.toLowerCase();

  // Personalization bonus
  const hasPersonalization =
    lowerContent.includes('i noticed') ||
    lowerContent.includes('i saw') ||
    lowerContent.includes('congrats');

  if (!hasPersonalization) {
    score -= 10;
  }

  // Weak CTA
  const hasWeakCTA =
    lowerContent.includes('let me know') ||
    lowerContent.includes('feel free');

  if (hasWeakCTA) {
    score -= 10;
  }

  // Multiple questions (can be overwhelming)
  const questionCount = (content.match(/\?/g) || []).length;
  if (questionCount > 2 && messageType !== 'call_script') {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Identify strengths in the message
 */
function identifyStrengths(content: string, subject: string | null | undefined): string[] {
  const strengths: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for personalization
  if (
    lowerContent.includes('i noticed') ||
    lowerContent.includes('i saw') ||
    lowerContent.includes('congrats')
  ) {
    strengths.push('Strong personalization - references specific context');
  }

  // Check for brevity (email)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 100 && wordCount <= 180) {
    strengths.push('Good length - concise but informative');
  }

  // Check for clear CTA
  if (
    lowerContent.includes('can we') ||
    lowerContent.includes('would you be open to') ||
    lowerContent.includes('are you available')
  ) {
    strengths.push('Clear call-to-action with specific ask');
  }

  // Check for value proposition
  if (
    lowerContent.includes('help') ||
    lowerContent.includes('impact') ||
    lowerContent.includes('results')
  ) {
    strengths.push('Focuses on value and outcomes');
  }

  // Subject line strength (if applicable)
  if (subject && subject.length > 0 && subject.length <= 50) {
    strengths.push('Strong subject line - concise and clear');
  }

  // If no strengths found, add a generic positive
  if (strengths.length === 0) {
    strengths.push('Message has good foundation - focus on improvements below');
  }

  return strengths;
}

/**
 * Generate improvement suggestions
 */
function generateImprovements(
  content: string,
  subject: string | null | undefined,
  messageType: string,
  weakPhrases: Array<unknown>
): string[] {
  const improvements: string[] = [];
  const lowerContent = content.toLowerCase();

  // Weak phrases
  if (weakPhrases.length > 0) {
    improvements.push(`Remove ${weakPhrases.length} weak phrase${weakPhrases.length > 1 ? 's' : ''} to sound more confident`);
  }

  // Length
  const wordCount = content.split(/\s+/).length;
  if (messageType === 'email' && wordCount > 200) {
    improvements.push('Shorten message to under 200 words for better response rates');
  }

  if (messageType === 'linkedin' && wordCount > 150) {
    improvements.push('Cut message to under 150 words - LinkedIn users prefer brevity');
  }

  // Personalization
  if (
    !lowerContent.includes('i noticed') &&
    !lowerContent.includes('i saw') &&
    !lowerContent.includes('congrats')
  ) {
    improvements.push('Add personalization - reference their company, role, or recent news');
  }

  // CTA
  if (
    lowerContent.includes('let me know') ||
    lowerContent.includes('feel free')
  ) {
    improvements.push('Replace passive CTA with specific ask (e.g., "Can we chat Thursday?")');
  }

  // Value proposition
  if (
    !lowerContent.includes('help') &&
    !lowerContent.includes('impact') &&
    !lowerContent.includes('results')
  ) {
    improvements.push('Add clear value proposition - what\'s in it for them?');
  }

  // Subject line
  if (messageType === 'email' && subject && subject.length > 60) {
    improvements.push('Shorten subject line to under 60 characters for mobile');
  }

  // If no improvements needed
  if (improvements.length === 0) {
    improvements.push('Great message! Consider A/B testing variations to optimize further.');
  }

  return improvements;
}
