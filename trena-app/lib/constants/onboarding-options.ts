// Onboarding form options for PRD #0002

export const EXPERIENCE_LEVELS = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5+', label: '5+ years' },
] as const;

export const MOTIVATORS = [
  'Hitting quota/bonus',
  'Getting promoted',
  'Proving myself',
  'Building my career',
  'Financial security (rent, bills)',
  'Recognition/respect',
] as const;

export const SELLING_STYLES = [
  { value: 'formal', label: 'Formal and professional' },
  { value: 'casual', label: 'Casual and friendly' },
  { value: 'direct', label: 'Direct and concise' },
  { value: 'consultative', label: 'Consultative and educational' },
  { value: 'enthusiastic', label: 'Enthusiastic and energetic' },
] as const;

export const INDUSTRIES = [
  'Technology/SaaS',
  'Healthcare',
  'Financial Services',
  'Retail/E-commerce',
  'Manufacturing',
  'Professional Services',
  'Education',
  'Real Estate',
] as const;

export const BUYER_ROLES = [
  'CEO',
  'CTO',
  'VP Sales',
  'VP Marketing',
  'Director of Operations',
  'CFO',
  'Head of HR',
  'COO',
  'CMO',
  'Product Manager',
  'Engineering Manager',
] as const;

export const REGIONS = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia-Pacific' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'global', label: 'Global/Multiple regions' },
] as const;

export const SALES_MOTIONS = [
  { value: 'outbound', label: 'Outbound prospecting' },
  { value: 'inbound', label: 'Inbound lead follow-up' },
  { value: 'abm', label: 'Account-based (ABM)' },
  { value: 'mixed', label: 'Mix of outbound and inbound' },
] as const;

// Helper function to get label from value
export function getRegionLabel(value: string): string {
  const region = REGIONS.find((r) => r.value === value);
  return region?.label || value;
}

export function getSalesMotionLabel(value: string): string {
  const motion = SALES_MOTIONS.find((m) => m.value === value);
  return motion?.label || value;
}

export function getExperienceLevelLabel(value: string): string {
  const level = EXPERIENCE_LEVELS.find((l) => l.value === value);
  return level?.label || value;
}

export function getSellingStyleLabel(value: string): string {
  const style = SELLING_STYLES.find((s) => s.value === value);
  return style?.label || value;
}
