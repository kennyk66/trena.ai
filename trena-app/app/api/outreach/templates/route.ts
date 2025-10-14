// GET /api/outreach/templates - Get available templates

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTemplates } from '@/lib/outreach/template-service';
import type { MessageType, ToneOption } from '@/types/outreach';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const messageType = searchParams.get('message_type') as MessageType | null;
    const tone = searchParams.get('tone') as ToneOption | null;
    const useCase = searchParams.get('use_case');

    // Get templates
    const templates = getTemplates({
      messageType: messageType || undefined,
      tone: tone || undefined,
      useCase: useCase || undefined,
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
