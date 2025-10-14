// PRD #0005: Template Management Service
// Manages message templates and variable replacement

import type { MessageTemplate, MessageType, ToneOption } from '@/types/outreach';

/**
 * Default email templates
 */
const EMAIL_TEMPLATES: Omit<MessageTemplate, 'id' | 'created_by'>[] = [
  {
    name: 'Cold Outreach - Value First',
    description: 'Lead with insight or value, not a pitch',
    message_type: 'email',
    subject_template: 'Quick thought on {{company_name}}',
    body_template: `Hi {{lead_name}},

I noticed {{buying_signal}}. {{signal_context}}

Many {{title}}s I work with in {{industry}} struggle with {{pain_point}}. We've helped companies like yours {{value_proposition}}.

Would you be open to a 15-minute conversation about {{talk_track}}?

Best,
{{user_name}}`,
    tone: 'warm',
    use_case: 'cold_outreach',
    variables: [
      'lead_name',
      'company_name',
      'buying_signal',
      'signal_context',
      'title',
      'industry',
      'pain_point',
      'value_proposition',
      'talk_track',
      'user_name',
    ],
    is_default: true,
  },
  {
    name: 'Follow-Up - No Response',
    description: 'Re-engage prospects who didn\'t respond',
    message_type: 'email',
    subject_template: 'Re: {{previous_subject}}',
    body_template: `Hi {{lead_name}},

I know you're busy - my last email probably got buried.

Quick recap: I help {{title}}s at companies like {{company_name}} {{value_proposition}}.

Given {{buying_signal}}, this might be timely.

Worth a quick 10-minute call?

{{user_name}}`,
    tone: 'direct',
    use_case: 'follow_up',
    variables: [
      'lead_name',
      'previous_subject',
      'title',
      'company_name',
      'value_proposition',
      'buying_signal',
      'user_name',
    ],
    is_default: true,
  },
  {
    name: 'Meeting Request',
    description: 'Request a specific meeting time',
    message_type: 'email',
    subject_template: 'Meeting request - {{topic}}',
    body_template: `Hi {{lead_name}},

I'd love to connect about {{topic}}.

Based on {{buying_signal}}, I think we could help {{company_name}} {{value_proposition}}.

Are you available for a 20-minute call {{meeting_time}}?

If not, what works better for you?

Best,
{{user_name}}`,
    tone: 'formal',
    use_case: 'meeting_request',
    variables: [
      'lead_name',
      'topic',
      'buying_signal',
      'company_name',
      'value_proposition',
      'meeting_time',
      'user_name',
    ],
    is_default: true,
  },
  {
    name: 'Value Share',
    description: 'Share relevant content or insights',
    message_type: 'email',
    subject_template: 'Thought you might find this useful',
    body_template: `Hi {{lead_name}},

I came across {{content_piece}} and immediately thought of {{company_name}}.

Given {{buying_signal}}, I figured you might find it valuable - especially the part about {{key_insight}}.

If you're interested in discussing how we've helped other {{industry}} companies with this, happy to chat.

{{user_name}}`,
    tone: 'casual',
    use_case: 'value_share',
    variables: [
      'lead_name',
      'content_piece',
      'company_name',
      'buying_signal',
      'key_insight',
      'industry',
      'user_name',
    ],
    is_default: true,
  },
];

/**
 * Default LinkedIn templates
 */
const LINKEDIN_TEMPLATES: Omit<MessageTemplate, 'id' | 'created_by'>[] = [
  {
    name: 'LinkedIn Connection Request',
    description: 'Personalized connection request',
    message_type: 'linkedin',
    body_template: `Hi {{lead_name}}, I saw {{company_name}} {{buying_signal}}. Would love to connect and exchange ideas about {{industry}}.`,
    tone: 'warm',
    use_case: 'connection_request',
    variables: ['lead_name', 'company_name', 'buying_signal', 'industry'],
    is_default: true,
  },
  {
    name: 'LinkedIn InMail - Value First',
    description: 'Direct message with value proposition',
    message_type: 'linkedin',
    body_template: `Hi {{lead_name}},

I noticed {{buying_signal}} at {{company_name}}. Congrats!

We help {{title}}s in {{industry}} {{value_proposition}}. Thought it might be relevant given your growth.

Would you be open to a quick chat?

Best,
{{user_name}}`,
    tone: 'direct',
    use_case: 'inmail_outreach',
    variables: [
      'lead_name',
      'buying_signal',
      'company_name',
      'title',
      'industry',
      'value_proposition',
      'user_name',
    ],
    is_default: true,
  },
  {
    name: 'LinkedIn Follow-Up',
    description: 'Follow up after connection accepted',
    message_type: 'linkedin',
    body_template: `Thanks for connecting, {{lead_name}}!

Quick question: how are you handling {{pain_point}} at {{company_name}}?

We've helped similar {{industry}} companies with this - happy to share insights if useful.`,
    tone: 'casual',
    use_case: 'follow_up',
    variables: ['lead_name', 'pain_point', 'company_name', 'industry'],
    is_default: true,
  },
];

/**
 * Default call script templates
 */
const CALL_SCRIPT_TEMPLATES: Omit<MessageTemplate, 'id' | 'created_by'>[] = [
  {
    name: 'Discovery Call Script',
    description: 'Initial discovery conversation',
    message_type: 'call_script',
    body_template: `**Opening (Permission-Based):**
"Hi {{lead_name}}, this is {{user_name}} from {{user_company}}. I noticed {{buying_signal}} - is now a good time for a quick conversation?"

[PAUSE - If yes, continue]

**Discovery Questions:**
1. "What's your biggest priority right now when it comes to {{pain_point}}?"

[PAUSE - Listen and take notes]

2. "How are you currently handling {{pain_point}}?"

[PAUSE - Listen for gaps]

**Value Proposition:**
"That makes sense. We work with {{title}}s at companies like {{company_name}} to {{value_proposition}}. For example, {{case_study}}."

**Next Steps:**
"Based on what you've shared, I think we could help. Would it make sense to set up a 20-minute call next week to explore this further?"

[PAUSE - Confirm time or handle objection]`,
    tone: 'warm',
    use_case: 'discovery',
    variables: [
      'lead_name',
      'user_name',
      'user_company',
      'buying_signal',
      'pain_point',
      'title',
      'company_name',
      'value_proposition',
      'case_study',
    ],
    is_default: true,
  },
  {
    name: 'Demo Call Script',
    description: 'Product demonstration call',
    message_type: 'call_script',
    body_template: `**Opening:**
"Hi {{lead_name}}, thanks for taking the time. Before I show you {{product_name}}, can you tell me what success looks like for you in the next 90 days?"

[PAUSE - Listen]

**Demo (Tailored):**
"Perfect. Let me show you exactly how we help with that. [Share screen]

This is how {{feature_1}} addresses {{pain_point_1}}.

And here's how {{feature_2}} helps with {{pain_point_2}}."

**Questions:**
"What do you think? Does this align with what you're looking for?"

[PAUSE - Address questions]

**Next Steps:**
"Great. The next step would be {{next_step}}. Does {{proposed_timeline}} work for you?"`,
    tone: 'direct',
    use_case: 'demo',
    variables: [
      'lead_name',
      'product_name',
      'feature_1',
      'pain_point_1',
      'feature_2',
      'pain_point_2',
      'next_step',
      'proposed_timeline',
    ],
    is_default: true,
  },
  {
    name: 'Follow-Up Call Script',
    description: 'Check in after previous conversation',
    message_type: 'call_script',
    body_template: `**Opening:**
"Hi {{lead_name}}, {{user_name}} here. I wanted to follow up on our conversation about {{previous_topic}}. Do you have 5 minutes?"

[PAUSE - If yes]

**Check-In:**
"Last time we talked, you mentioned {{pain_point}}. Have you had a chance to think more about that?"

[PAUSE - Listen]

**Move Forward:**
"Based on what you're saying, I think {{value_proposition}} could really help. What would you need to see to move forward?"

[PAUSE - Address concerns]

**Close:**
"Let's do this: {{next_step}}. I'll send over {{deliverable}} by {{deadline}}. Sound good?"`,
    tone: 'casual',
    use_case: 'follow_up',
    variables: [
      'lead_name',
      'user_name',
      'previous_topic',
      'pain_point',
      'value_proposition',
      'next_step',
      'deliverable',
      'deadline',
    ],
    is_default: true,
  },
];

/**
 * Get all templates for a specific message type
 */
export function getTemplates(params?: {
  messageType?: MessageType;
  tone?: ToneOption;
  useCase?: string;
}): MessageTemplate[] {
  let allTemplates = [
    ...EMAIL_TEMPLATES,
    ...LINKEDIN_TEMPLATES,
    ...CALL_SCRIPT_TEMPLATES,
  ].map((template, index) => ({
    ...template,
    id: `default-${template.message_type}-${index}`,
  })) as MessageTemplate[];

  // Filter by message type
  if (params?.messageType) {
    allTemplates = allTemplates.filter((t) => t.message_type === params.messageType);
  }

  // Filter by tone
  if (params?.tone) {
    allTemplates = allTemplates.filter((t) => t.tone === params.tone);
  }

  // Filter by use case
  if (params?.useCase) {
    allTemplates = allTemplates.filter((t) => t.use_case === params.useCase);
  }

  return allTemplates;
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): MessageTemplate | null {
  const allTemplates = getTemplates();
  return allTemplates.find((t) => t.id === templateId) || null;
}

/**
 * Apply template with variable replacement
 */
export function applyTemplate(params: {
  template: MessageTemplate;
  variables: Record<string, string>;
}): {
  subject: string | null;
  body: string;
} {
  const { template, variables } = params;

  let subject = template.subject_template || null;
  let body = template.body_template;

  // Replace all variables in subject
  if (subject) {
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject!.replace(new RegExp(placeholder, 'g'), value);
    });
  }

  // Replace all variables in body
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });

  // Clean up any remaining unreplaced variables
  subject = subject?.replace(/\{\{[^}]+\}\}/g, '[missing]') || null;
  body = body.replace(/\{\{[^}]+\}\}/g, '[missing]');

  return { subject, body };
}

/**
 * Extract variables from template
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((match) => match.replace(/\{\{|\}\}/g, ''));
}

/**
 * Build variable values from lead context
 */
export function buildVariableValues(params: {
  lead: {
    lead_name: string | null;
    title: string | null;
    company_name: string | null;
    industry: string | null;
    buying_signals?: Array<{ title: string; description: string }>;
    ai_persona?: {
      pain_points: string[];
      talk_tracks: string[];
    };
  };
  user: {
    name: string | null;
    company_name: string | null;
  };
}): Record<string, string> {
  const { lead, user } = params;

  const variables: Record<string, string> = {
    lead_name: lead.lead_name || '[Lead Name]',
    title: lead.title || '[Title]',
    company_name: lead.company_name || '[Company]',
    industry: lead.industry || '[Industry]',
    user_name: user.name || '[Your Name]',
    user_company: user.company_name || '[Your Company]',
  };

  // Add buying signal info
  if (lead.buying_signals && lead.buying_signals.length > 0) {
    variables.buying_signal = lead.buying_signals[0].title;
    variables.signal_context = lead.buying_signals[0].description;
  } else {
    variables.buying_signal = 'recent growth';
    variables.signal_context = 'I noticed your company has been expanding.';
  }

  // Add persona info
  if (lead.ai_persona) {
    if (lead.ai_persona.pain_points.length > 0) {
      variables.pain_point = lead.ai_persona.pain_points[0];
      variables.pain_point_1 = lead.ai_persona.pain_points[0];
      if (lead.ai_persona.pain_points.length > 1) {
        variables.pain_point_2 = lead.ai_persona.pain_points[1];
      }
    }

    if (lead.ai_persona.talk_tracks.length > 0) {
      variables.talk_track = lead.ai_persona.talk_tracks[0];
      variables.value_proposition = lead.ai_persona.talk_tracks[0];
    }
  }

  // Default fallbacks
  if (!variables.pain_point) {
    variables.pain_point = 'operational efficiency';
    variables.pain_point_1 = 'scaling operations';
    variables.pain_point_2 = 'improving productivity';
  }

  if (!variables.value_proposition) {
    variables.value_proposition = 'achieve better results faster';
  }

  if (!variables.talk_track) {
    variables.talk_track = 'improving outcomes';
  }

  return variables;
}
