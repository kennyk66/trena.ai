import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PasswordChangeForm } from '@/components/auth/password-change-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your basic account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm font-medium">{user?.email || 'Not available'}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Profile editing will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>

        <Separator />

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your Trena.ai experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notification preferences coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
