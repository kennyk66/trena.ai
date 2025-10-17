// Onboarding flow types for PRD #0002

export type OnboardingStep =
  | 'welcome'
  | 'personal'
  | 'motivators'
  | 'target-buyer'
  | 'connect-tools'
  | 'summary'
  | 'quick-win';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'personal',
  'motivators',
  'target-buyer',
  'connect-tools',
  'summary',
  'quick-win',
];

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  stepNumber: number; // 1-7
  totalSteps: number; // 7
}

// Step 2: Personal & Role Setup
export interface PersonalFormData {
  name: string;
  job_title: string;
  company_name: string;
  linkedin_url?: string;
  email?: string;
  timezone?: string;
  sales_quota: string;
  experience_level: string;
}

// Step 3: Motivators & Selling Style
export interface MotivatorsFormData {
  motivators: string[];
  motivators_other?: string;
  selling_style: string;
  email_opener_style?: string;
  use_name_in_outreach?: boolean;
  current_target?: string;
  biggest_blocker?: string;
  support_needs?: string;
}

// Step 4: Target Buyer
export interface TargetBuyerFormData {
  target_industries: string[];
  industries_other?: string;
  target_roles: string[];
  roles_other?: string;
  company_size?: string[];
  target_region: string;
  sales_motion: string;
}

// Combined onboarding data
export interface OnboardingData
  extends PersonalFormData,
    MotivatorsFormData,
    TargetBuyerFormData {
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
}

// Lead data from Quick Win
export interface LeadData {
  id?: string;
  lead_name: string;
  job_title?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_size?: string;
  industry?: string;
  source?: string;
}

// Lusha API types
export interface LushaSearchParams {
  industries?: string[];
  jobTitles?: string[];
  regions?: string[];
  limit?: number;
}

export interface LushaPersonData {
  name: string;
  jobTitle?: string;
  company?: {
    name: string;
    industry?: string;
    size?: string;
  };
  email?: string;
  phone?: string;
  linkedinUrl?: string;
}

export interface LushaApiResponse {
  success: boolean;
  data?: LushaPersonData[];
  error?: string;
}

// Lusha API internal types (for API request/response)
export interface LushaFilters {
  industry?: string[];
  job_title?: string[];
  country?: string[];
}

export interface LushaRawPerson {
  first_name?: string;
  last_name?: string;
  job_title?: string;
  company?: {
    name?: string;
    industry?: string;
    size?: string;
  };
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

export interface LushaRawResponse {
  data?: LushaRawPerson[];
}

// Integration placeholders
export type IntegrationProvider = 'email' | 'crm' | 'linkedin';

export interface IntegrationStatus {
  provider: IntegrationProvider;
  connected: boolean;
  comingSoon: boolean;
}
