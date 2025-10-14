import { NextResponse } from 'next/server';
import { getOnboardingData } from '@/lib/onboarding/onboarding-service';

export async function GET() {
  try {
    const data = await getOnboardingData();

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No onboarding data found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
