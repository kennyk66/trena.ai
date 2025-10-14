'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Linkedin, Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/clipboard';

interface ContactInfoProps {
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
}

export function ContactInfo({ email, phone, linkedin }: ContactInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {email && (
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm font-mono truncate">{email}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(email, 'email')}
              className="flex-shrink-0"
            >
              {copiedField === 'email' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {phone && (
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm font-mono truncate">{phone}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(phone, 'phone')}
              className="flex-shrink-0"
            >
              {copiedField === 'phone' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {linkedin && (
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Linkedin className="h-5 w-5 text-blue-700 dark:text-blue-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate block"
                >
                  View Profile
                </a>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(linkedin, '_blank')}
              className="flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!email && !phone && !linkedin && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No contact information available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
