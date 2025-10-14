// PRD #0003 & #0004: Research filter and sort options

export const RESEARCH_SORT_OPTIONS = [
  { value: 'priority_desc', label: 'Priority (High to Low)' }, // PRD #0004
  { value: 'priority_asc', label: 'Priority (Low to High)' }, // PRD #0004
  { value: 'researched_at_desc', label: 'Most Recent' },
  { value: 'researched_at_asc', label: 'Oldest First' },
  { value: 'company_name_asc', label: 'Company A-Z' },
  { value: 'company_name_desc', label: 'Company Z-A' },
] as const;

export const INDUSTRY_OPTIONS = [
  'Technology/SaaS',
  'Healthcare',
  'Financial Services',
  'Retail/E-commerce',
  'Manufacturing',
  'Professional Services',
  'Education',
  'Real Estate',
  'Marketing',
  'Other',
] as const;

export const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-100',
  '100-500',
  '500-1000',
  '1000-5000',
  '5000+',
] as const;

// PRD #0004: Priority level options
export const PRIORITY_LEVEL_OPTIONS = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' },
] as const;
