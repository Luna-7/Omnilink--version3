import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import OmnilinkLiquidLayout from '@/components/dashboard/OmnilinkLayout'

/**
 * /dashboard/* — first line of defense.
 *
 * Middleware only refreshes the session cookie; the real authorization gate
 * lives here. Every dashboard route is rendered through this layout, so a
 * missing or invalid session at this layer guarantees a redirect to /login
 * before any page code (including client components) can read store/user
 * data.
 *
 * RLS + page-level `requireUser()` remain defense-in-depth; this layer
 * guarantees the *layout* itself never renders for anonymous visitors.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Best-effort profile info for the layout chrome. The real authoritative
  // data is loaded by each page server component; this is only for the
  // user chip + avatar.
  const profile = {
    id: user.id,
    email: user.email ?? '',
    name:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      '',
    avatarUrl:
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined) ||
      null,
  }

  return (
    <OmnilinkLiquidLayout profile={profile}>
      {children}
    </OmnilinkLiquidLayout>
  )
}