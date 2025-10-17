// PRD #0005: AI Outreach Generation Service
// Generates personalized outreach messages using GPT-4 or Claude

import { createClient } from '@/lib/supabase/server';
import type {
  GenerateOutreachInput,
  MessageType,
  ToneOption,
  OutreachMessage,
  GenerationContext,
} from '@/types/outreach';
import type { ResearchedLead } from '@/types/research';

/**
 * Generate personalized outreach message using AI
 */
export async function generateOutreach(params: {
  userId: string;
  input: GenerateOutreachInput;
}): Promise<{
  success: boolean;
  message?: OutreachMessage;
  error?: string;
}> {
  const { userId, input } = params;

  try {
    // Step 1: Fetch lead data with persona
    const lead = await fetchLeadWithContext(userId, input.lead_id);
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // Step 2: Fetch user profile for selling context
    const userProfile = await fetchUserProfile(userId);

    // Step 3: Build generation context
    const context = buildGenerationContext(lead, userProfile);

    // Step 4: Generate content using AI
    const generatedContent = await generateWithAI({
      context,
      messageType: input.message_type,
      tone: input.tone,
      customInstructions: input.custom_instructions,
    });

    if (!generatedContent) {
      return { success: false, error: 'Failed to generate content' };
    }

    // Step 5: Save to database
    const savedMessage = await saveOutreachMessage({
      userId,
      leadId: input.lead_id,
      messageType: input.message_type,
      tone: input.tone,
      subject: generatedContent.subject,
      content: generatedContent.body,
    });

    if (!savedMessage) {
      return { success: false, error: 'Failed to save message' };
    }

    return { success: true, message: savedMessage };
  } catch (error) {
    console.error('Generate outreach error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch lead data with persona and signals
 */
async function fetchLeadWithContext(
  userId: string,
  leadId: string
): Promise<ResearchedLead | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('researched_leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Fetch lead error:', error);
    return null;
  }

  return data as ResearchedLead;
}

/**
 * Fetch user profile for selling context
 */
async function fetchUserProfile(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_profiles')
    .select('name, selling_style, company_name')
    .eq('id', userId)
    .single();

  return data || { name: null, selling_style: null, company_name: null };
}

/**
 * Build generation context from lead and user data
 */
function buildGenerationContext(
  lead: ResearchedLead,
  userProfile: { name: string | null; selling_style: string | null; company_name: string | null }
): GenerationContext {
  const context: GenerationContext = {
    lead: {
      name: lead.person_name,
      title: lead.person_title,
      company_name: lead.company_name,
      company_industry: lead.company_industry,
      priority_level: lead.priority_level,
      priority_score: lead.priority_score || 0,
    },
    user: {
      name: userProfile.name,
      selling_style: userProfile.selling_style,
      company_name: userProfile.company_name,
    },
  };

  // Add persona if available
  if (lead.ai_persona) {
    context.persona = {
      role_summary: lead.ai_persona.role_summary,
      pain_points: lead.ai_persona.pain_points,
      goals: lead.ai_persona.goals,
      talk_tracks: lead.ai_persona.talk_tracks,
    };
  }

  // Add buying signals if available
  if (lead.buying_signals && lead.buying_signals.length > 0) {
    context.signals = lead.buying_signals.map((signal) => ({
      type: signal.type,
      title: signal.title,
      description: signal.description,
    }));
  }

  return context;
}

/**
 * Generate content using AI (OpenAI or Anthropic)
 */
async function generateWithAI(params: {
  context: GenerationContext;
  messageType: MessageType;
  tone: ToneOption;
  customInstructions?: string;
}): Promise<{ subject: string | null; body: string } | null> {
  const { context, messageType, tone, customInstructions } = params;

  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('AI API key not configured, using mock content');
    return getMockContent(context, messageType, tone);
  }

  const useOpenAI = !!process.env.OPENAI_API_KEY;

  try {
    const prompt = buildPrompt({ context, messageType, tone, customInstructions });

    if (useOpenAI) {
      return await generateWithOpenAI(prompt, apiKey);
    } else {
      return await generateWithAnthropic(prompt, apiKey);
    }
  } catch (error) {
    console.error('AI generation error:', error);
    return getMockContent(context, messageType, tone);
  }
}

/**
 * Build AI prompt based on message type and context
 */
function buildPrompt(params: {
  context: GenerationContext;
  messageType: MessageType;
  tone: ToneOption;
  customInstructions?: string;
}): string {
  const { context, messageType, tone, customInstructions } = params;

  // Tone descriptions
  const toneGuide = {
    warm: 'friendly, approachable, and personable. Use conversational language.',
    direct: 'professional, concise, and to-the-point. No fluff.',
    formal: 'polished, executive-level, and respectful. Use proper business language.',
    casual: 'relaxed, informal, and conversational. Like talking to a peer.',
  };

  let prompt = `You are an expert sales copywriter. Generate a personalized ${messageType.replace('_', ' ')} for this prospect.

TONE: ${tone.toUpperCase()} - Be ${toneGuide[tone]}

PROSPECT INFORMATION:
- Name: ${context.lead.name || 'Unknown'}
- Title: ${context.lead.title || 'Unknown'}
- Company: ${context.lead.company_name || 'Unknown'}
- Industry: ${context.lead.company_industry || 'Unknown'}
- Priority Score: ${context.lead.priority_score}/14 (${context.lead.priority_level} priority)`;

  if (context.persona) {
    prompt += `\n\nPERSONA INSIGHTS:
- Role: ${context.persona.role_summary}`;

    if (context.persona.pain_points.length > 0) {
      prompt += `\n- Key Pain Points: ${context.persona.pain_points.slice(0, 3).join(', ')}`;
    }

    if (context.persona.goals.length > 0) {
      prompt += `\n- Goals: ${context.persona.goals.join(', ')}`;
    }

    if (context.persona.talk_tracks.length > 0) {
      prompt += `\n- Talk Tracks: ${context.persona.talk_tracks.join('; ')}`;
    }
  }

  if (context.signals && context.signals.length > 0) {
    prompt += `\n\nBUYING SIGNALS (use these for relevance):`;
    context.signals.slice(0, 3).forEach((signal) => {
      prompt += `\n- ${signal.title}: ${signal.description}`;
    });
  }

  if (context.user.name) {
    prompt += `\n\nYOUR INFORMATION:
- Your Name: ${context.user.name}`;
    if (context.user.company_name) {
      prompt += `\n- Your Company: ${context.user.company_name}`;
    }
    if (context.user.selling_style) {
      prompt += `\n- Your Style: ${context.user.selling_style}`;
    }
  }

  if (customInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS: ${customInstructions}`;
  }

  // Message-type specific instructions
  if (messageType === 'email') {
    prompt += `\n\nGENERATE AN EMAIL:
- Write a compelling subject line (under 60 characters)
- Keep body to 150-200 words max
- Include personalization based on buying signals and persona
- Have ONE clear call-to-action
- Avoid weak phrases like "just checking in", "touching base", "circle back"
- Make it valuable - offer insight, not just a pitch
- Sign with "${context.user.name || '[Your Name]'}"

Return JSON: { "subject": "...", "body": "..." }`;
  } else if (messageType === 'linkedin') {
    prompt += `\n\nGENERATE A LINKEDIN MESSAGE:
- Keep it SHORT: 100-150 words max (LinkedIn limit: 300 chars for connection, 8000 for InMail)
- Start with a personalized hook based on their role or signals
- Make it conversational and authentic
- Include ONE soft call-to-action (e.g., "Would you be open to a quick chat?")
- NO SUBJECT LINE (LinkedIn messages don't have subjects)

Return JSON: { "subject": null, "body": "..." }`;
  } else if (messageType === 'call_script') {
    prompt += `\n\nGENERATE A CALL SCRIPT:
- Structure with clear sections:
  1. Opening (permission-based, reference signal or persona insight)
  2. Discovery Questions (2-3 open-ended questions)
  3. Value Proposition (tailored to their pain points)
  4. Next Steps (clear ask)
- Keep it conversational - this is a SCRIPT, not an essay
- Include [PAUSE] markers for listening moments
- Total length: 250-300 words

Return JSON: { "subject": null, "body": "..." }`;
  }

  prompt += `\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanations. Use proper escaping for quotes in JSON strings.`;

  return prompt;
}

/**
 * Generate with OpenAI GPT-4
 */
async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<{ subject: string | null; body: string }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales copywriter who creates personalized, high-converting outreach messages.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8, // Higher temperature for more creative writing
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);

  return {
    subject: parsed.subject || null,
    body: parsed.body || '',
  };
}

/**
 * Generate with Anthropic Claude
 */
async function generateWithAnthropic(
  prompt: string,
  apiKey: string
): Promise<{ subject: string | null; body: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from potential markdown wrapper
  let jsonContent = content;
  if (content.includes('```json')) {
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) jsonContent = match[1];
  } else if (content.includes('```')) {
    const match = content.match(/```\s*([\s\S]*?)\s*```/);
    if (match) jsonContent = match[1];
  }

  const parsed = JSON.parse(jsonContent);

  return {
    subject: parsed.subject || null,
    body: parsed.body || '',
  };
}

/**
 * Save generated message to database
 */
async function saveOutreachMessage(params: {
  userId: string;
  leadId: string;
  messageType: MessageType;
  tone: ToneOption;
  subject: string | null;
  content: string;
}): Promise<OutreachMessage | null> {
  const { userId, leadId, messageType, tone, subject, content } = params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('outreach_messages')
    .insert({
      user_id: userId,
      lead_id: leadId,
      message_type: messageType,
      tone: tone,
      subject: subject,
      generated_content: content,
      status: 'draft',
      coaching_applied: false,
      coaching_score: 0,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Save message error:', error);
    return null;
  }

  return data as OutreachMessage;
}

/**
 * Mock content for testing/fallback
 */
function getMockContent(
  context: GenerationContext,
  messageType: MessageType,
  _tone: ToneOption
): { subject: string | null; body: string } {
  const leadName = context.lead.name || 'there';
  const companyName = context.lead.company_name || 'your company';
  const userName = context.user.name || 'Your Name';

  if (messageType === 'email') {
    return {
      subject: `Quick question about ${companyName}`,
      body: `Hi ${leadName},

I noticed ${companyName} ${context.signals?.[0]?.description.toLowerCase() || 'is growing'}. Congrats on the momentum!

${context.persona?.pain_points[0] ? `Many ${context.lead.title || 'leaders'} I talk to mention challenges around ${context.persona.pain_points[0].toLowerCase()}.` : 'I work with similar companies in your space.'}

Would you be open to a 15-minute conversation about how we're helping companies like yours?

Best,
${userName}`,
    };
  } else if (messageType === 'linkedin') {
    return {
      subject: null,
      body: `Hi ${leadName}, I saw ${companyName} ${context.signals?.[0]?.title || 'is hiring'}. Impressive growth!

I help ${context.lead.company_industry || 'companies'} like yours ${context.persona?.goals[0]?.toLowerCase() || 'scale operations'}. Would you be open to connecting?`,
    };
  } else {
    return {
      subject: null,
      body: `**Opening:**
"Hi ${leadName}, this is ${userName}. I noticed ${companyName} ${context.signals?.[0]?.description || 'has been growing'}. Do you have 5 minutes?"

[PAUSE - If yes, continue]

**Discovery:**
"What's your biggest priority right now when it comes to ${context.persona?.pain_points[0] || 'operations'}?"

[PAUSE - Listen]

**Value Prop:**
"We work with ${context.lead.company_industry || 'companies'} like ${companyName} to ${context.persona?.talk_tracks[0] || 'improve efficiency'}."

**Next Steps:**
"Would it make sense to set up a 20-minute call next week to explore this?"`,
    };
  }
}
