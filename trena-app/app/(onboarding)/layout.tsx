import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/ui/logo';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo variant="full" size="xl" />
          <p className="text-muted-foreground text-center">Your AI Sales Assistant</p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Building your personalized sales experience...</p>
        </div>
      </div>
    </div>
  );
}
