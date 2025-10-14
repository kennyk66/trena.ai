import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Define onboarding routes
  const onboardingRoutes = ['/welcome', '/personal', '/motivators', '/target-buyer', '/connect-tools', '/summary', '/quick-win'];
  const isOnboardingRoute = onboardingRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Define dashboard routes (protected routes that require completed onboarding)
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/home') ||
                           request.nextUrl.pathname.startsWith('/research') ||
                           request.nextUrl.pathname.startsWith('/outreach') ||
                           request.nextUrl.pathname.startsWith('/focus') ||
                           request.nextUrl.pathname.startsWith('/gamification') ||
                           request.nextUrl.pathname.startsWith('/profile') ||
                           request.nextUrl.pathname.startsWith('/settings');

  // If user is authenticated and trying to access dashboard routes
  if (user && isDashboardRoute && !isOnboardingRoute) {
    // Check if onboarding is completed
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    // Redirect to onboarding if not completed
    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
