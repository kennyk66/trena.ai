// PRD #0005: Personalized Outreach Generation - Type Definitions

/**
 * Message type enum
 */
export type MessageType = 'email' | 'linkedin' | 'call_script';

/**
 * Tone options for message generation
 */
export type ToneOption = 'warm' | 'direct' | 'formal' | 'casual';

/**
 * Message status
 */
export type MessageStatus = 'draft' | 'sent' | 'opened' | 'clicked' | 'replied';

/**
 * Event types for message tracking
 */
export type EventType = 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';

/**
 * Outreach message
 */
export interface OutreachMessage {
  id: string;
  user_id: string;
  lead_id: string;
  message_type: MessageType;
  subject: string | null; // For emails
  generated_content: string;
  edited_content: string | null;
  final_content: string | null;
  tone: ToneOption;
  coaching_applied: boolean;
  coaching_score: number; // 0-100
  status: MessageStatus;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Message event (tracking)
 */
export interface MessageEvent {
  id: string;
  message_id: string;
  event_type: EventType;
  timestamp: string;
  metadata: Record<string, unknown>;
}

/**
 * Coaching tip
 */
export interface CoachingTip {
  type: 'weak_phrase' | 'improvement' | 'best_practice';
  title: string;
  description: string;
  example?: string;
  position?: {
    start: number;
    end: number;
  };
  suggestion?: string; // Alternative text to use
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Coaching analysis result
 */
export interface CoachingAnalysis {
  score: number; // 0-100
  tips: CoachingTip[];
  weakPhrases: Array<{
    phrase: string;
    position: { start: number; end: number };
    suggestion: string;
    reason: string;
  }>;
  strengths: string[]; // Things done well
  improvements: string[]; // Areas to improve
}

/**
 * Message template
 */
export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  message_type: MessageType;
  subject_template?: string; // For emails
  body_template: string;
  tone: ToneOption;
  use_case: string; // e.g., "cold outreach", "follow-up", "meeting request"
  variables: string[]; // Available variables like {{lead_name}}, {{company_name}}
  is_default: boolean; // System template vs custom
  created_by?: string; // user_id for custom templates
}

/**
 * Generation request input
 */
export interface GenerateOutreachInput {
  lead_id: string;
  message_type: MessageType;
  tone: ToneOption;
  template_id?: string; // Optional template to use
  custom_instructions?: string; // Additional instructions for AI
}

/**
 * Generation request response
 */
export interface GenerateOutreachResponse {
  success: boolean;
  message?: OutreachMessage;
  coaching?: CoachingAnalysis;
  error?: string;
}

/**
 * Message list filters
 */
export interface MessageFilters {
  lead_id?: string;
  message_type?: MessageType;
  status?: MessageStatus;
  tone?: ToneOption;
  search_query?: string; // Search in subject or content
}

/**
 * Message list sort options
 */
export type MessageSortOption =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'sent_at_desc'
  | 'sent_at_asc'
  | 'subject_asc'
  | 'subject_desc';

/**
 * Message list response
 */
export interface MessageListResponse {
  success: boolean;
  messages: OutreachMessage[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * Message with events
 */
export interface MessageWithEvents extends OutreachMessage {
  events: MessageEvent[];
}

/**
 * Update message input
 */
export interface UpdateMessageInput {
  edited_content?: string;
  final_content?: string;
  status?: MessageStatus;
  coaching_applied?: boolean;
  sent_at?: string;
}

/**
 * Tone description
 */
export interface ToneDescription {
  value: ToneOption;
  label: string;
  description: string;
  example: string;
  icon?: string;
}

/**
 * Message type description
 */
export interface MessageTypeDescription {
  value: MessageType;
  label: string;
  description: string;
  maxLength?: number; // Character limit
  icon?: string;
}

/**
 * Template variable
 */
export interface TemplateVariable {
  key: string; // e.g., "lead_name"
  label: string; // e.g., "Lead Name"
  example: string; // e.g., "John Smith"
  required: boolean;
}

/**
 * AI generation context (internal use)
 */
export interface GenerationContext {
  lead: {
    name: string | null;
    title: string | null;
    company_name: string | null;
    company_industry: string | null;
    priority_level: string | null;
    priority_score: number;
  };
  persona?: {
    role_summary: string;
    pain_points: string[];
    goals: string[];
    talk_tracks: string[];
  };
  signals?: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  user: {
    name: string | null;
    selling_style: string | null;
    company_name: string | null;
  };
}
