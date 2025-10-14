import type { ResearchedLead } from './research';
import type { DailyFocusRow, LeadActionRow } from './priority';
import type { OutreachMessage, MessageEvent } from './outreach';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  // Onboarding fields
  job_title: string | null;
  company_name: string | null;
  sales_quota: string | null;
  experience_level: string | null;
  motivators: string[]; // JSONB array
  selling_style: string | null;
  target_industries: string[]; // JSONB array
  target_roles: string[]; // JSONB array
  target_region: string | null;
  sales_motion: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuickWinLead {
  id: string;
  user_id: string;
  lead_name: string;
  job_title: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  company_size: string | null;
  industry: string | null;
  source: string;
  created_at: string;
}

export interface ApiCredential {
  id: string;
  user_id: string;
  provider: string;
  credentials_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAccount {
  id: string;
  user_id: string;
  email_provider: string;
  email_address: string;
  connected_at: string;
  is_active: boolean;
}

export interface CrmAccount {
  id: string;
  user_id: string;
  crm_provider: string;
  account_id: string | null;
  connected_at: string;
  is_active: boolean;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at' | 'onboarding_completed'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      quick_win_leads: {
        Row: QuickWinLead;
        Insert: Omit<QuickWinLead, 'id' | 'created_at'>;
        Update: Partial<Omit<QuickWinLead, 'id' | 'user_id' | 'created_at'>>;
      };
      researched_leads: {
        Row: ResearchedLead;
        Insert: Omit<ResearchedLead, 'id' | 'created_at' | 'updated_at' | 'researched_at'>;
        Update: Partial<Omit<ResearchedLead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'researched_at'>>;
      };
      api_credentials: {
        Row: ApiCredential;
        Insert: Omit<ApiCredential, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ApiCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      email_accounts: {
        Row: EmailAccount;
        Insert: Omit<EmailAccount, 'id' | 'connected_at'>;
        Update: Partial<Omit<EmailAccount, 'id' | 'user_id' | 'connected_at'>>;
      };
      crm_accounts: {
        Row: CrmAccount;
        Insert: Omit<CrmAccount, 'id' | 'connected_at'>;
        Update: Partial<Omit<CrmAccount, 'id' | 'user_id' | 'connected_at'>>;
      };
      daily_focus: {
        Row: DailyFocusRow;
        Insert: Omit<DailyFocusRow, 'id' | 'generated_at'>;
        Update: Partial<Omit<DailyFocusRow, 'id' | 'user_id' | 'generated_at'>>;
      };
      lead_actions: {
        Row: LeadActionRow;
        Insert: Omit<LeadActionRow, 'id' | 'action_date'>;
        Update: Partial<Omit<LeadActionRow, 'id' | 'user_id' | 'lead_id' | 'action_date'>>;
      };
      outreach_messages: {
        Row: OutreachMessage;
        Insert: Omit<OutreachMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<OutreachMessage, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      message_events: {
        Row: MessageEvent;
        Insert: Omit<MessageEvent, 'id' | 'timestamp'>;
        Update: never; // Events are immutable
      };
    };
  };
}
