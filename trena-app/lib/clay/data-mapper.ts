import { 
  ClayPersonData, 
  MappedLeadData, 
  ClayMappingConfig, 
  UserPreferences,
  ClaySearchStrategy 
} from './types';

/**
 * Clay.com Data Mapper
 * Transforms Clay.com API responses to internal Trena lead format
 */
export class ClayDataMapper {
  /**
   * Convert Clay.com person data to internal lead format
   */
  static toLeadData(
    person: ClayPersonData,
    config: ClayMappingConfig = {}
  ): MappedLeadData {
    const lead: MappedLeadData = {
      lead_name: `${person.first_name} ${person.last_name}`,
      job_title: person.job_title,
      company_name: person.company?.name,
      email: person.email,
      phone: person.phone,
      linkedin_url: person.linkedin_url,
      company_size: person.company?.size,
      industry: person.company?.industry,
      source: 'clay'
    };

    // Include raw data if requested
    if (config.include_raw_data) {
      lead.raw_clay_data = person;
    }

    return lead;
  }

  /**
   * Convert multiple Clay.com people to lead format
   */
  static toLeadDataArray(
    people: ClayPersonData[],
    config: ClayMappingConfig = {}
  ): MappedLeadData[] {
    return people.map(person => this.toLeadData(person, config));
  }

  /**
   * Calculate match score based on user preferences
   */
  static calculateMatchScore(
    person: ClayPersonData,
    preferences: UserPreferences,
    config: ClayMappingConfig = {}
  ): number {
    const weights = {
      industry_weight: 3,
      role_weight: 3,
      seniority_weight: 2,
      location_weight: 1,
      ...config.match_scoring
    };

    let score = 0;

    // Industry matching
    if (person.company?.industry && preferences.industries.length > 0) {
      const industryMatch = preferences.industries.some(industry =>
        this.matchText(person.company!.industry!, industry)
      );
      if (industryMatch) score += weights.industry_weight;
    }

    // Role matching
    if (person.job_title && preferences.roles.length > 0) {
      const roleMatch = preferences.roles.some(role =>
        this.matchText(person.job_title!, role)
      );
      if (roleMatch) score += weights.role_weight;
    }

    // Seniority bonus
    if (person.seniority) {
      const seniorityLevels = ['executive', 'director', 'manager', 'senior', 'junior'];
      const levelIndex = seniorityLevels.findIndex(level => 
        person.seniority!.toLowerCase().includes(level)
      );
      if (levelIndex !== -1) {
        score += weights.seniority_weight * (seniorityLevels.length - levelIndex);
      }
    }

    // Location matching
    if (preferences.region && person.location) {
      const locationMatch = this.matchText(
        `${person.location.country} ${person.location.state} ${person.location.city}`,
        preferences.region
      );
      if (locationMatch) score += weights.location_weight;
    }

    return Math.max(score, 1); // Minimum score of 1
  }

  /**
   * Generate match reasoning text
   */
  static generateMatchReasoning(
    person: ClayPersonData,
    preferences: UserPreferences,
    strategy: ClaySearchStrategy
  ): string {
    const reasons = [];

    // Industry match
    if (person.company?.industry && preferences.industries.includes(person.company.industry)) {
      reasons.push(`Industry: ${person.company.industry}`);
    }

    // Role match
    if (person.job_title && preferences.roles.some(role => 
      this.matchText(person.job_title!, role)
    )) {
      reasons.push(`Role: ${person.job_title}`);
    }

    // Seniority
    if (person.seniority) {
      reasons.push(`Seniority: ${this.formatSeniority(person.seniority)}`);
    }

    // Company size
    if (person.company?.size) {
      reasons.push(`Company size: ${person.company.size}`);
    }

    // Location
    if (person.location?.country) {
      const location = [person.location.city, person.location.state, person.location.country]
        .filter(Boolean)
        .join(', ');
      reasons.push(`Location: ${location}`);
    }

    const baseReasoning = reasons.length > 0 
      ? reasons.join(' • ')
      : 'General match';

    return `${baseReasoning} (${strategy.description})`;
  }

  /**
   * Enhanced lead data with match scoring and reasoning
   */
  static toEnrichedLeadData(
    person: ClayPersonData,
    preferences: UserPreferences,
    strategy: ClaySearchStrategy,
    config: ClayMappingConfig = {}
  ): MappedLeadData {
    const lead = this.toLeadData(person, config);
    
    // Add match scoring
    lead.match_score = this.calculateMatchScore(person, preferences, config);
    
    // Add match reasoning
    lead.match_reasoning = this.generateMatchReasoning(person, preferences, strategy);
    
    // Add strategy used
    lead.strategy_used = strategy.name;

    return lead;
  }

  /**
   * Convert multiple people to enriched lead data
   */
  static toEnrichedLeadDataArray(
    people: ClayPersonData[],
    preferences: UserPreferences,
    strategy: ClaySearchStrategy,
    config: ClayMappingConfig = {}
  ): MappedLeadData[] {
    return people.map(person => 
      this.toEnrichedLeadData(person, preferences, strategy, config)
    );
  }

  /**
   * Sort leads by match score (highest first)
   */
  static sortByMatchScore(leads: MappedLeadData[]): MappedLeadData[] {
    return leads.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  }

  /**
   * Filter leads by minimum match score
   */
  static filterByMinScore(
    leads: MappedLeadData[], 
    minScore: number = 3
  ): MappedLeadData[] {
    return leads.filter(lead => (lead.match_score || 0) >= minScore);
  }

  /**
   * Get top N leads by match score
   */
  static getTopLeads(leads: MappedLeadData[], count: number): MappedLeadData[] {
    return this.sortByMatchScore(leads).slice(0, count);
  }

  /**
   * Text matching utility with fuzzy matching
   */
  private static matchText(text1: string, text2: string): boolean {
    const t1 = text1.toLowerCase().trim();
    const t2 = text2.toLowerCase().trim();
    
    // Exact match
    if (t1 === t2) return true;
    
    // Contains match
    if (t1.includes(t2) || t2.includes(t1)) return true;
    
    // Word-based matching
    const words1 = t1.split(/\s+/);
    const words2 = t2.split(/\s+/);
    
    // Check if any words match
    return words1.some(word1 => 
      words2.some(word2 => 
        word1.includes(word2) || word2.includes(word1)
      )
    );
  }

  /**
   * Format seniority for display
   */
  private static formatSeniority(seniority: string): string {
    const formatted = seniority.toLowerCase();
    
    // Map common seniority terms to standard format
    const seniorityMap: Record<string, string> = {
      'executive': 'Executive',
      'c-level': 'Executive',
      'c_suite': 'Executive',
      'director': 'Director',
      'manager': 'Manager',
      'senior': 'Senior',
      'junior': 'Junior',
      'lead': 'Lead',
      'head': 'Head',
      'vp': 'VP',
      'vice president': 'VP'
    };
    
    for (const [key, value] of Object.entries(seniorityMap)) {
      if (formatted.includes(key)) {
        return value;
      }
    }
    
    // Capitalize first letter if no mapping found
    return seniority.charAt(0).toUpperCase() + seniority.slice(1);
  }

  /**
   * Extract key insights from person data
   */
  static extractInsights(person: ClayPersonData): string[] {
    const insights = [];

    // Company insights
    if (person.company) {
      if (person.company.technologies && person.company.technologies.length > 0) {
        insights.push(`Uses ${person.company.technologies.slice(0, 3).join(', ')}`);
      }
      
      if (person.company.founded_year) {
        const age = new Date().getFullYear() - person.company.founded_year;
        if (age < 5) {
          insights.push('Early-stage company');
        } else if (age > 20) {
          insights.push('Established company');
        }
      }
    }

    // Seniority insights
    if (person.seniority) {
      if (person.seniority.toLowerCase().includes('executive')) {
        insights.push('C-level decision maker');
      } else if (person.seniority.toLowerCase().includes('director')) {
        insights.push('Director-level influencer');
      }
    }

    // Location insights
    if (person.location) {
      if (person.location.country === 'US') {
        insights.push('US-based');
      }
    }

    return insights;
  }

  /**
   * Create a summary of the lead for quick preview
   */
  static createLeadSummary(person: ClayPersonData): string {
    const parts = [
      `${person.first_name} ${person.last_name}`,
      person.job_title,
      person.company?.name
    ].filter(Boolean);

    return parts.join(' • ');
  }

  /**
   * Validate lead data completeness
   */
  static validateLeadData(lead: MappedLeadData): {
    isValid: boolean;
    completeness: number;
    missingFields: string[];
  } {
    const requiredFields = ['lead_name', 'source'];
    const importantFields = ['job_title', 'company_name', 'email'];
    const optionalFields = ['phone', 'linkedin_url', 'company_size', 'industry'];

    const allFields = [...requiredFields, ...importantFields, ...optionalFields];
    const presentFields = allFields.filter(field => 
      lead[field as keyof MappedLeadData] && 
      lead[field as keyof MappedLeadData] !== ''
    );

    const missingFields = allFields.filter(field => 
      !lead[field as keyof MappedLeadData] || 
      lead[field as keyof MappedLeadData] === ''
    );

    const hasRequiredFields = requiredFields.every(field => 
      lead[field as keyof MappedLeadData] && 
      lead[field as keyof MappedLeadData] !== ''
    );

    const completeness = (presentFields.length / allFields.length) * 100;

    return {
      isValid: hasRequiredFields,
      completeness,
      missingFields
    };
  }
}