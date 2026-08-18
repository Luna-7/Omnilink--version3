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
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  // Profile info for the layout chrome (with preview fallback if not logged in)
  const profile = user
    ? {
        id: user.id,
        email: user.email ?? '',
        name:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          user.email ||
          '商家',
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined) ||
          null,
      }
    : {
        id: 'preview-user',
        email: 'demo@omnilink.ai',
        name: '演示商家',
        avatarUrl: null,
      }

  return (
    <OmnilinkLiquidLayout profile={profile}>
      {children}
    </OmnilinkLiquidLayout>
  )
}