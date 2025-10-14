'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadData } from '@/types/onboarding';
import { Building2, Mail, Phone, Linkedin, Briefcase } from 'lucide-react';

interface LeadCardProps {
  lead: LeadData;
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-xl">{lead.lead_name}</CardTitle>
          {lead.job_title && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">{lead.job_title}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Info */}
        {lead.company_name && (
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{lead.company_name}</p>
              <div className="flex gap-2">
                {lead.industry && (
                  <Badge variant="secondary" className="text-xs">
                    {lead.industry}
                  </Badge>
                )}
                {lead.company_size && (
                  <Badge variant="outline" className="text-xs">
                    {lead.company_size} employees
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </div>
          )}

          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </div>
          )}

          {lead.linkedin_url && (
            <div className="flex items-center gap-2 text-sm">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <a
                href={lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
