// PRD #0003: AI Persona Generation Service
// Generates AI-powered buyer personas using GPT-4 or Claude

import type {
  AIPersona,
  BuyingSignal,
  LushaCompanyData,
  LushaPersonData,
} from '@/types/research';

/**
 * Generate AI buyer persona using OpenAI GPT-4 or Anthropic Claude
 * @param personData - Enriched person data from Lusha
 * @param companyData - Enriched company data from Lusha
 * @param buyingSignals - Extracted buying signals
 * @param userProfile - User's selling context (from onboarding)
 * @returns AI-generated persona with pain points, talk tracks, etc.
 */
export async function generatePersona(params: {
  personData: LushaPersonData;
  companyData?: LushaCompanyData;
  buyingSignals?: BuyingSignal[];
  userProfile?: {
    selling_style?: string | null;
    motivators?: string[];
    target_industries?: string[];
  };
}): Promise<AIPersona | null> {
  const {
    personData,
    companyData,
    buyingSignals = [],
    userProfile,
  } = params;

  const apiKey =
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('AI API key not configured, returning mock persona');
    return getMockPersona(personData, companyData, buyingSignals);
  }

  // Determine which AI service to use
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  try {
    const prompt = buildPersonaPrompt({
      personData,
      companyData,
      buyingSignals,
      userProfile,
    });

    let persona: AIPersona;

    if (useOpenAI) {
      persona = await generateWithOpenAI(prompt, apiKey);
    } else {
      persona = await generateWithAnthropic(prompt, apiKey);
    }

    return persona;
  } catch (error) {
    console.error('AI persona generation error:', error);
    // Return mock persona as fallback
    return getMockPersona(personData, companyData, buyingSignals);
  }
}

/**
 * Build the AI prompt for persona generation
 */
function buildPersonaPrompt(params: {
  personData: LushaPersonData;
  companyData?: LushaCompanyData;
  buyingSignals?: BuyingSignal[];
  userProfile?: {
    selling_style?: string | null;
    motivators?: string[];
    target_industries?: string[];
  };
}): string {
  const { personData, companyData, buyingSignals = [], userProfile } = params;

  let prompt = `You are a sales intelligence assistant. Generate a comprehensive buyer persona for this prospect:

PROSPECT INFORMATION:
- Name: ${personData.full_name}
- Title: ${personData.title || 'Unknown'}
- Company: ${companyData?.name || personData.company?.name || 'Unknown'}
- Industry: ${companyData?.industry || personData.company?.industry || 'Unknown'}
- Company Size: ${companyData?.size || 'Unknown'}
- Location: ${personData.location || 'Unknown'}`;

  if (companyData?.description) {
    prompt += `\n- Company Description: ${companyData.description}`;
  }

  if (personData.work_history && personData.work_history.length > 0) {
    prompt += `\n- Previous Experience: ${personData.work_history
      .slice(0, 2)
      .map((job) => `${job.title} at ${job.company}`)
      .join(', ')}`;
  }

  if (buyingSignals.length > 0) {
    prompt += `\n\nBUYING SIGNALS:`;
    buyingSignals.forEach((signal) => {
      prompt += `\n- ${signal.title}: ${signal.description}`;
    });
  }

  if (userProfile) {
    prompt += `\n\nYOUR SELLING CONTEXT:`;
    if (userProfile.selling_style) {
      prompt += `\n- Communication Style: ${userProfile.selling_style}`;
    }
    if (userProfile.motivators && userProfile.motivators.length > 0) {
      prompt += `\n- What drives you: ${userProfile.motivators.join(', ')}`;
    }
  }

  prompt += `\n\nGenerate a detailed buyer persona that includes:

1. **role_summary**: A 2-3 sentence overview of their role and key responsibilities

2. **pain_points**: An array of 3-5 specific challenges they likely face based on their role, industry, and company size. Be specific and actionable.

3. **goals**: An array of 2-3 professional goals and motivations they likely have

4. **talk_tracks**: An array of 2-3 conversation angles or value propositions that would resonate with them

5. **conversation_starters**: An array of 3-4 specific opening lines, questions, or conversation starters for outreach

6. **buying_signal_context** (optional): If buying signals are present, provide context on how these signals create urgency or opportunity

Return the response as a valid JSON object with these exact field names. Be specific, insightful, and actionable. Tailor the persona to help a sales rep have a meaningful, personalized conversation.`;

  return prompt;
}

/**
 * Generate persona using OpenAI GPT-4
 */
async function generateWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<AIPersona> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4 for better quality
      messages: [
        {
          role: 'system',
          content:
            'You are a sales intelligence expert who creates detailed buyer personas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsedPersona = JSON.parse(content);

  return {
    role_summary: parsedPersona.role_summary,
    pain_points: parsedPersona.pain_points || [],
    goals: parsedPersona.goals || [],
    talk_tracks: parsedPersona.talk_tracks || [],
    conversation_starters: parsedPersona.conversation_starters || [],
    buying_signal_context: parsedPersona.buying_signal_context,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate persona using Anthropic Claude
 */
async function generateWithAnthropic(
  prompt: string,
  apiKey: string
): Promise<AIPersona> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nReturn valid JSON only, no markdown.',
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Claude may wrap JSON in markdown code blocks, so we need to extract it
  let jsonContent = content;
  if (content.includes('```json')) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
  } else if (content.includes('```')) {
    const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      jsonContent = codeMatch[1];
    }
  }

  const parsedPersona = JSON.parse(jsonContent);

  return {
    role_summary: parsedPersona.role_summary,
    pain_points: parsedPersona.pain_points || [],
    goals: parsedPersona.goals || [],
    talk_tracks: parsedPersona.talk_tracks || [],
    conversation_starters: parsedPersona.conversation_starters || [],
    buying_signal_context: parsedPersona.buying_signal_context,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock persona for testing/fallback
 */
function getMockPersona(
  personData: LushaPersonData,
  companyData?: LushaCompanyData,
  buyingSignals?: BuyingSignal[]
): AIPersona {
  const title = personData.title || 'Executive';
  const companyName =
    companyData?.name || personData.company?.name || 'their company';
  const industry =
    companyData?.industry ||
    personData.company?.industry ||
    'their industry';

  let buyingSignalContext: string | undefined;
  if (buyingSignals && buyingSignals.length > 0) {
    buyingSignalContext = `Key signals: ${buyingSignals.map((s) => s.title).join(', ')}. These indicate ${companyName} is in growth mode and likely investing in new solutions.`;
  }

  return {
    role_summary: `As ${title} at ${companyName}, they are responsible for driving strategic initiatives, managing teams, and achieving key business objectives in the ${industry} space. They likely have significant influence over purchasing decisions and budget allocation.`,
    pain_points: [
      `Managing multiple priorities and ensuring team alignment in a fast-paced ${industry} environment`,
      `Balancing short-term revenue goals with long-term strategic initiatives`,
      `Finding scalable solutions that can grow with ${companyName}`,
      `Demonstrating ROI and value to executive leadership`,
      `Staying ahead of industry trends and competitive pressures`,
    ],
    goals: [
      `Achieve measurable business outcomes and hit key performance metrics`,
      `Build and retain a high-performing team`,
      `Implement innovative solutions that provide competitive advantage`,
    ],
    talk_tracks: [
      `ROI and efficiency: How your solution helps them achieve more with existing resources`,
      `Scalability and growth: How your platform can support their company's expansion`,
      `Best practices: Insights from similar ${industry} leaders who have succeeded`,
    ],
    conversation_starters: [
      `"I noticed ${companyName} ${buyingSignals?.[0]?.description.toLowerCase() || 'is growing'}. How is that impacting your team's priorities?"`,
      `"Many ${title}s in ${industry} tell us their biggest challenge is ${industry === 'Technology/SaaS' ? 'managing data silos across tools' : 'streamlining operations'}. Is that something you're seeing too?"`,
      `"I saw your background includes ${personData.work_history?.[0]?.title || 'previous leadership roles'}. What's different about your approach at ${companyName}?"`,
      `"What's your top priority for the next quarter?"`,
    ],
    buying_signal_context: buyingSignalContext,
    generated_at: new Date().toISOString(),
  };
}
