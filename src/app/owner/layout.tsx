import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { getCachedOwnerProfile, getUnreadNotificationCount } from '@/lib/owner-context';
import { redirect } from 'next/navigation';
import OwnerNavbar from '@/components/layout/OwnerNavbar';

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerFromCookies();
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

  if (error || !supabaseUser) {
    redirect('/sign-in');
  }

  const user = await getCachedOwnerProfile(supabaseUser.id);

  if (!user || user.role !== 'OWNER') {
    redirect('/dashboard');
  }

  const unreadNotifications = await getUnreadNotificationCount(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <OwnerNavbar 
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          imageUrl: user.imageUrl,
          role: user.role,
        }} 
        unreadNotifications={unreadNotifications}
      />
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
