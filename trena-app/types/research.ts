// PRD #0003: Buyer Research Agent - TypeScript Type Definitions

/**
 * Research method enum
 */
export type ResearchMethod = 'manual' | 'csv' | 'crm';

/**
 * Data source enum
 */
export type ResearchSource = 'lusha';

/**
 * Buying signal types
 */
export interface BuyingSignal {
  type: 'funding' | 'hiring' | 'expansion' | 'leadership_change' | 'product_launch' | 'news';
  title: string;
  description: string;
  date?: string;
  amount?: string; // For funding rounds
  url?: string; // Link to news article or source
}

/**
 * Work history entry
 */
export interface WorkHistory {
  company_name: string;
  job_title: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  is_current: boolean;
}

/**
 * Tech stack item
 */
export interface TechStackItem {
  name: string;
  category?: string; // e.g., "CRM", "Marketing", "Analytics"
}

/**
 * AI-generated buyer persona structure
 */
export interface AIPersona {
  role_summary: string; // 2-3 sentence overview
  pain_points: string[]; // 3-5 challenges they likely face
  goals: string[]; // 2-3 goals and motivations
  talk_tracks: string[]; // 2-3 conversation angles
  conversation_starters: string[]; // 3-4 opening lines or questions
  buying_signal_context?: string; // Context about buying signals if present
  generated_at: string; // ISO timestamp
}

/**
 * Complete researched lead data structure
 */
export interface ResearchedLead {
  id: string;
  user_id: string;
  research_method: ResearchMethod;
  source: ResearchSource;

  // Person data
  person_name: string | null;
  person_email: string | null;
  person_phone: string | null;
  person_linkedin: string | null;
  person_title: string | null;
  person_seniority: string | null;
  person_location: string | null;

  // Company data
  company_name: string | null;
  company_domain: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_revenue: string | null;
  company_location: string | null;
  company_description: string | null;

  // Rich data
  tech_stack: TechStackItem[];
  work_history: WorkHistory[];
  buying_signals: BuyingSignal[];
  ai_persona: AIPersona | null;

  // Priority fields (PRD #0004)
  priority_score: number; // 0-14 total score
  priority_level: 'high' | 'medium' | 'low' | null;
  buying_signal_score: number; // 0-10 points from buying signals
  fit_score: number; // 0-4 points from target buyer fit
  signal_breakdown: Array<{
    signal_type: string;
    signal_name: string;
    points: number;
    category: 'buying_signal' | 'fit';
  }>;
  last_scored_at: string | null; // ISO timestamp when first scored
  last_rescored_at: string | null; // ISO timestamp when last re-scored

  // Metadata
  researched_at: string; // ISO timestamp
  last_viewed_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Manual search form data
 */
export interface ManualSearchInput {
  person_name?: string;
  company_name?: string;
  email?: string;
  linkedin_url?: string;
}

/**
 * CSV upload row data
 */
export interface CSVLeadInput {
  first_name?: string;
  last_name?: string;
  person_name?: string; // Alternative to first_name + last_name
  company_name?: string;
  email?: string;
  job_title?: string;
  linkedin_url?: string;
  [key: string]: string | undefined; // Allow custom fields
}

/**
 * CSV upload result
 */
export interface CSVUploadResult {
  total: number;
  succeeded: number;
  failed: number;
  leads: ResearchedLead[];
  errors: Array<{
    row: number;
    error: string;
  }>;
}

/**
 * Research API response
 */
export interface ResearchResponse {
  success: boolean;
  lead?: ResearchedLead;
  error?: string;
  cached?: boolean; // If lead was returned from cache
}

/**
 * List view filters
 */
export interface ResearchFilters {
  industry?: string;
  company_size?: string;
  has_email?: boolean;
  has_buying_signals?: boolean;
  search_query?: string; // Search by name or company
  priority_level?: 'high' | 'medium' | 'low'; // Filter by priority (PRD #0004)
}

/**
 * Sort options for list view
 */
export type ResearchSortOption =
  | 'priority_desc' // PRD #0004: Sort by priority score (high to low)
  | 'priority_asc' // PRD #0004: Sort by priority score (low to high)
  | 'researched_at_desc'
  | 'researched_at_asc'
  | 'company_name_asc'
  | 'company_name_desc';

/**
 * Paginated list response
 */
export interface ResearchLeadsListResponse {
  success: boolean;
  leads: ResearchedLead[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * CRM contact data structure (from Salesforce/HubSpot)
 */
export interface CRMContact {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  source: 'salesforce' | 'hubspot';
}

/**
 * Lusha company enrichment data
 */
export interface LushaCompanyData {
  name: string;
  domain?: string;
  industry?: string;
  size?: string; // Employee count range
  revenue?: string; // Revenue range
  location?: string;
  description?: string;
  founded_year?: number;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  technologies?: string[]; // Tech stack
}

/**
 * Lusha person enrichment data
 */
export interface LushaPersonData {
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  title?: string;
  seniority?: string;
  location?: string;
  company?: {
    name: string;
    domain?: string;
    industry?: string;
  };
  work_history?: Array<{
    company: string;
    title: string;
    start_date?: string;
    end_date?: string;
  }>;
  education?: Array<{
    institution: string;
    degree?: string;
    field_of_study?: string;
  }>;
}

/**
 * Research request payload for API
 */
export interface ResearchRequest {
  method: ResearchMethod;
  input: ManualSearchInput | CSVLeadInput;
  regenerate_persona?: boolean; // Force regenerate even if cached
}
