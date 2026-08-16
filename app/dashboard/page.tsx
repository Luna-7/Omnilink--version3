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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    ''

  return <DashboardView displayName={displayName} />
}
