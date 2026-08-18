import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { DashboardView } from '@/components/dashboard/DashboardView'

/**
 * /dashboard — server component (#60 P2 fix).
 *
 * Reads the real authenticated user so the dashboard greeting reflects the
 * actual merchant instead of the previously-hardcoded "Carlic / Sajibur".
 * Session is enforced by the dashboard layout; this page re-checks for
 * defense-in-depth.
 */
export default async function DashboardPage() {
  const supabase = await createClientServer()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  const displayName = user
    ? (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      '商家'
    : '商家'

  return <DashboardView displayName={displayName} />
}
