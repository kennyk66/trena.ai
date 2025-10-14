// PRD #0005: Outreach Constants and Options

import type {
  MessageType,
  ToneOption,
  MessageStatus,
  MessageTypeDescription,
  ToneDescription,
} from '@/types/outreach';

/**
 * Message type options
 */
export const MESSAGE_TYPE_OPTIONS: MessageTypeDescription[] = [
  {
    value: 'email',
    label: 'Email',
    description: 'Professional email outreach',
    maxLength: undefined, // No strict limit for emails
    icon: '📧',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    description: 'LinkedIn message or InMail',
    maxLength: 300, // LinkedIn connection request limit
    icon: '💼',
  },
  {
    value: 'call_script',
    label: 'Call Script',
    description: 'Structured talking points for calls',
    maxLength: undefined,
    icon: '📞',
  },
];

/**
 * Tone options
 */
export const TONE_OPTIONS: ToneDescription[] = [
  {
    value: 'warm',
    label: 'Warm',
    description: 'Friendly, approachable, and personable',
    example: '"Hi Sarah, I noticed your company just raised funding - congrats! Would love to connect..."',
    icon: '😊',
  },
  {
    value: 'direct',
    label: 'Direct',
    description: 'Professional, concise, and to-the-point',
    example: '"Sarah - saw you\'re hiring. We help companies like yours scale operations. 15 min call?"',
    icon: '🎯',
  },
  {
    value: 'formal',
    label: 'Formal',
    description: 'Polished, executive-level, and respectful',
    example: '"Dear Ms. Johnson, I hope this message finds you well. I wanted to reach out regarding..."',
    icon: '👔',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, informal, like talking to a peer',
    example: '"Hey Sarah! Quick question - how are you handling X at Company? Would love to chat..."',
    icon: '👋',
  },
];

/**
 * Message status options
 */
export const MESSAGE_STATUS_OPTIONS: Array<{
  value: MessageStatus;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Not sent yet',
    color: 'gray',
  },
  {
    value: 'sent',
    label: 'Sent',
    description: 'Successfully sent',
    color: 'blue',
  },
  {
    value: 'opened',
    label: 'Opened',
    description: 'Recipient opened the message',
    color: 'purple',
  },
  {
    value: 'clicked',
    label: 'Clicked',
    description: 'Recipient clicked a link',
    color: 'yellow',
  },
  {
    value: 'replied',
    label: 'Replied',
    description: 'Recipient replied',
    color: 'green',
  },
];

/**
 * Weak phrases to avoid (used by coaching service)
 */
export const WEAK_PHRASES = [
  'just checking in',
  'touching base',
  'circle back',
  'synergy',
  'low-hanging fruit',
  'at your earliest convenience',
  'hope you are well',
  'i hope this email finds you well',
  'per my last email',
  'sorry to bother you',
  'i was wondering if',
  'let me know if you have any questions',
  'feel free to',
  'thought i would reach out',
] as const;

/**
 * Get message type by value
 */
export function getMessageType(value: MessageType): MessageTypeDescription | undefined {
  return MESSAGE_TYPE_OPTIONS.find((option) => option.value === value);
}

/**
 * Get tone by value
 */
export function getTone(value: ToneOption): ToneDescription | undefined {
  return TONE_OPTIONS.find((option) => option.value === value);
}

/**
 * Get status by value
 */
export function getStatus(value: MessageStatus) {
  return MESSAGE_STATUS_OPTIONS.find((option) => option.value === value);
}
