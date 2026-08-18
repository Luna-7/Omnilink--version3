import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { AccountView } from '@/components/account/AccountView'

/**
 * /dashboard/account — real merchant only.
 *
 * No fake user / store fallback. If the session is missing the dashboard
 * layout already redirected; we still re-check here and force /login. If
 * the merchant has no store we send them to /onboarding rather than
 * silently rendering a mock identity.
 */
export default async function AccountPage() {
  const supabase = await createClientServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)
  if (!store) {
    redirect('/onboarding')
  }

  return (
    <AccountView
      currentStore={{
        store_name: store.store_name,
        id: store.id,
      }}
      currentUser={{
        email: user.email ?? '',
        id: user.id,
        created_at: user.created_at,
      }}
    />
  )
}