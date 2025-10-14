import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try to fetch user profile from user_profiles table
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = data;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          View your account information
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your Trena.ai account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm font-medium">{user?.email || 'Not available'}</p>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <p className="text-sm font-medium">
              {userProfile?.name || 'Not set'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="text-sm font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Not available'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <p className="text-sm font-mono text-muted-foreground">
              {user?.id || 'Not available'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
