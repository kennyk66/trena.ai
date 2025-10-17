/**
 * Industry Mapping and Fallback Utilities
 * Provides intelligent fallback strategies for lead recommendations
 * when specific user preferences don't return results
 */

export interface IndustryMapping {
  primary: string;
  synonyms: string[];
  related: string[];
  lushaKeywords: string[];
}

export interface RoleMapping {
  primary: string;
  synonyms: string[];
  seniorityLevels: number[];
  lushaKeywords: string[];
}

/**
 * Comprehensive industry mappings with synonyms and related fields
 */
export const INDUSTRY_MAPPINGS: Record<string, IndustryMapping> = {
  'technology/saas': {
    primary: 'Technology/SaaS',
    synonyms: ['Software', 'Tech', 'SaaS', 'Information Technology', 'IT Services'],
    related: ['Software Development', 'Cloud Computing', 'Enterprise Software'],
    lushaKeywords: ['technology', 'software', 'computer software', 'internet', 'saas', 'cloud']
  },
  'healthcare': {
    primary: 'Healthcare',
    synonyms: ['Health Care', 'Medical', 'Health Tech', 'Medical Devices'],
    related: ['Pharmaceuticals', 'Biotechnology', 'Medical Technology'],
    lushaKeywords: ['healthcare', 'medical', 'health', 'hospital', 'pharmaceutical', 'biotechnology']
  },
  'financial services': {
    primary: 'Financial Services',
    synonyms: ['Finance', 'FinTech', 'Banking', 'Insurance', 'Investment'],
    related: ['Banking', 'Insurance', 'Investment Management', 'Financial Technology'],
    lushaKeywords: ['finance', 'financial', 'banking', 'investment', 'insurance', 'fintech']
  },
  'manufacturing': {
    primary: 'Manufacturing',
    synonyms: ['Production', 'Industrial', 'Manufacturing', 'Factory'],
    related: ['Industrial Manufacturing', 'Production', 'Supply Chain'],
    lushaKeywords: ['manufacturing', 'industrial', 'production', 'factory', 'supply chain']
  },
  'retail/e-commerce': {
    primary: 'Retail/E-commerce',
    synonyms: ['Retail', 'Ecommerce', 'E-commerce', 'Consumer Goods'],
    related: ['Consumer Products', 'E-commerce', 'Retail Trade'],
    lushaKeywords: ['retail', 'ecommerce', 'consumer', 'wholesale', 'trade']
  },
  'consulting': {
    primary: 'Consulting',
    synonyms: ['Advisory', 'Consultancy', 'Professional Services'],
    related: ['Management Consulting', 'Strategy Consulting', 'IT Consulting'],
    lushaKeywords: ['consulting', 'advisory', 'professional services', 'management consulting']
  },
  'education': {
    primary: 'Education',
    synonyms: ['EdTech', 'Educational Technology', 'Learning', 'Training'],
    related: ['Educational Services', 'Training & Development', 'E-learning'],
    lushaKeywords: ['education', 'educational', 'learning', 'training', 'edtech']
  },
  'real estate': {
    primary: 'Real Estate',
    synonyms: ['Property', 'Property Management', 'Real Estate'],
    related: ['Property Development', 'Real Estate Investment', 'Construction'],
    lushaKeywords: ['real estate', 'property', 'construction', 'facility']
  },
  'energy/utilities': {
    primary: 'Energy/Utilities',
    synonyms: ['Energy', 'Utilities', 'Power', 'Renewable Energy'],
    related: ['Energy', 'Utilities', 'Renewable Energy', 'Oil & Gas'],
    lushaKeywords: ['energy', 'utilities', 'power', 'renewable', 'electricity']
  },
  'media/entertainment': {
    primary: 'Media/Entertainment',
    synonyms: ['Media', 'Entertainment', 'Publishing', 'Broadcasting'],
    related: ['Digital Media', 'Entertainment', 'Publishing', 'Advertising'],
    lushaKeywords: ['media', 'entertainment', 'publishing', 'advertising', 'broadcasting']
  }
};

/**
 * Role mappings with seniority levels and keywords
 */
export const ROLE_MAPPINGS: Record<string, RoleMapping> = {
  'ceo': {
    primary: 'CEO',
    synonyms: ['Chief Executive Officer', 'President', 'Founder', 'Owner'],
    seniorityLevels: [6, 7],
    lushaKeywords: ['ceo', 'chief executive', 'president', 'founder', 'owner']
  },
  'vp sales': {
    primary: 'VP Sales',
    synonyms: ['Vice President of Sales', 'Sales VP', 'Head of Sales', 'Chief Sales Officer'],
    seniorityLevels: [5, 6],
    lushaKeywords: ['vp sales', 'vice president sales', 'head of sales', 'chief sales officer']
  },
  'vp marketing': {
    primary: 'VP Marketing',
    synonyms: ['Vice President of Marketing', 'Marketing VP', 'Head of Marketing', 'CMO'],
    seniorityLevels: [5, 6],
    lushaKeywords: ['vp marketing', 'vice president marketing', 'head of marketing', 'cmo']
  },
  'cto': {
    primary: 'CTO',
    synonyms: ['Chief Technology Officer', 'VP Engineering', 'Head of Technology'],
    seniorityLevels: [5, 6],
    lushaKeywords: ['cto', 'chief technology officer', 'vp engineering', 'head of technology']
  },
  'director': {
    primary: 'Director',
    synonyms: ['Director of', 'Head of', 'Senior Manager'],
    seniorityLevels: [4, 5],
    lushaKeywords: ['director', 'head of', 'senior director']
  },
  'manager': {
    primary: 'Manager',
    synonyms: ['Senior Manager', 'Team Lead', 'Group Manager', 'Department Head'],
    seniorityLevels: [3, 4],
    lushaKeywords: ['manager', 'senior manager', 'team lead', 'group manager']
  }
};

/**
 * Popular fallback industries for broad searches
 */
export const POPULAR_INDUSTRIES = [
  'Technology/SaaS',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Consulting'
];

/**
 * Popular fallback roles for broad searches
 */
export const POPULAR_ROLES = [
  'CEO',
  'VP Sales',
  'VP Marketing',
  'Director',
  'CTO'
];

/**
 * Expands industry names using mappings to find more leads
 */
export function expandIndustries(industries: string[]): string[] {
  const expanded = new Set<string>();

  industries.forEach(industry => {
    const normalizedIndustry = industry.toLowerCase().trim();

    // Find matching industry mapping
    const mapping = Object.values(INDUSTRY_MAPPINGS).find(
      m => m.primary.toLowerCase() === normalizedIndustry ||
           m.synonyms.some(s => s.toLowerCase() === normalizedIndustry)
    );

    if (mapping) {
      expanded.add(mapping.primary);
      mapping.synonyms.forEach(s => expanded.add(s));
      mapping.related.forEach(r => expanded.add(r));
      mapping.lushaKeywords.forEach(k => expanded.add(k));
    } else {
      // Add original industry if no mapping found
      expanded.add(industry);
    }
  });

  return Array.from(expanded);
}

/**
 * Expands role names using mappings to find more leads
 */
export function expandRoles(roles: string[]): string[] {
  const expanded = new Set<string>();

  roles.forEach(role => {
    const normalizedRole = role.toLowerCase().trim();

    // Find matching role mapping
    const mapping = Object.values(ROLE_MAPPINGS).find(
      m => m.primary.toLowerCase() === normalizedRole ||
           m.synonyms.some(s => s.toLowerCase() === normalizedRole)
    );

    if (mapping) {
      expanded.add(mapping.primary);
      mapping.synonyms.forEach(s => expanded.add(s));
      mapping.lushaKeywords.forEach(k => expanded.add(k));
    } else {
      // Add original role if no mapping found
      expanded.add(role);
    }
  });

  return Array.from(expanded);
}

/**
 * Gets seniority levels for roles
 */
export function getSeniorityLevels(roles: string[]): number[] {
  const levels = new Set<number>();

  roles.forEach(role => {
    const normalizedRole = role.toLowerCase().trim();

    const mapping = Object.values(ROLE_MAPPINGS).find(
      m => m.primary.toLowerCase() === normalizedRole ||
           m.synonyms.some(s => s.toLowerCase() === normalizedRole)
    );

    if (mapping) {
      mapping.seniorityLevels.forEach(level => levels.add(level));
    } else {
      // Default to mid-to-senior levels for unmapped roles
      [3, 4, 5].forEach(level => levels.add(level));
    }
  });

  return Array.from(levels);
}

/**
 * Progressive search strategies for when exact searches fail
 */
export interface SearchStrategy {
  name: string;
  industries: string[];
  jobTitles: string[];
  seniorityLevels: number[];
  regions: string[];
  description: string;
}

export function getProgressiveSearchStrategies(
  userIndustries: string[],
  userRoles: string[],
  userRegion?: string
): SearchStrategy[] {
  const strategies: SearchStrategy[] = [];

  // Strategy 1: User's exact preferences with minimal geographic filtering
  strategies.push({
    name: 'user-preferences',
    industries: expandIndustries(userIndustries),
    jobTitles: expandRoles(userRoles),
    seniorityLevels: getSeniorityLevels(userRoles),
    regions: userRegion ? [userRegion] : [],
    description: 'Based on your target preferences'
  });

  // Strategy 2: Same roles but broader industry search (no geo restrictions)
  strategies.push({
    name: 'role-focused-broad',
    industries: [], // No industry filter for maximum results
    jobTitles: expandRoles(userRoles),
    seniorityLevels: getSeniorityLevels(userRoles),
    regions: [], // Global search
    description: 'Your target roles across all industries'
  });

  // Strategy 3: User industries with senior roles (broader role range)
  strategies.push({
    name: 'industry-focused-senior',
    industries: expandIndustries(userIndustries),
    jobTitles: POPULAR_ROLES, // Use popular senior roles
    seniorityLevels: [4, 5, 6, 7], // Senior to C-level
    regions: [], // Global search
    description: 'Senior leaders in your target industries'
  });

  // Strategy 4: Popular combination - Tech + senior roles
  strategies.push({
    name: 'popular-combination',
    industries: ['Technology/SaaS', 'Software', 'Information Technology'],
    jobTitles: ['CTO', 'CEO', 'VP Engineering', 'Director of Technology', 'Engineering Manager'],
    seniorityLevels: [4, 5, 6, 7],
    regions: [], // Global search
    description: 'Technology leaders and decision makers'
  });

  // Strategy 5: Fallback - just seniority, no other filters
  strategies.push({
    name: 'seniority-only',
    industries: [],
    jobTitles: [],
    seniorityLevels: [3, 4, 5, 6, 7], // Manager to C-Level
    regions: [],
    description: 'Senior professionals worldwide'
  });

  return strategies;
}

/**
 * Get a description for why a lead was recommended
 */
export function getMatchReasoning(
  lead: { industry?: string; jobTitle?: string; company?: { name?: string } },
  userIndustries: string[],
  userRoles: string[],
  strategy: SearchStrategy
): string {
  const matches: string[] = [];

  // Industry match
  if (lead.industry) {
    const industryMatch = userIndustries.some(userIndustry =>
      lead.industry?.toLowerCase().includes(userIndustry.toLowerCase()) ||
      userIndustry.toLowerCase().includes(lead.industry?.toLowerCase() || '')
    );

    if (industryMatch) {
      matches.push(`${lead.industry} industry`);
    }
  }

  // Role match
  if (lead.jobTitle) {
    const roleMatch = userRoles.some(userRole =>
      lead.jobTitle?.toLowerCase().includes(userRole.toLowerCase()) ||
      userRole.toLowerCase().includes(lead.jobTitle?.toLowerCase() || '')
    );

    if (roleMatch) {
      matches.push(`${lead.jobTitle} role`);
    }
  }

  // Company match (if available)
  if (lead.company?.name) {
    matches.push(`at ${lead.company.name}`);
  }

  if (matches.length > 0) {
    return `Matches your target: ${matches.join(', ')}`;
  }

  return strategy.description;
}