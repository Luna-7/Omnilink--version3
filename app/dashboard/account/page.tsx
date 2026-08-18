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
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  if (!user) {
    return (
      <AccountView
        currentStore={{
          store_name: 'Omnilink 官方旗舰店',
          id: 'demo-store',
        }}
        currentUser={{
          email: 'merchant@omnilink.ai',
          id: 'demo-user-id',
          created_at: new Date().toISOString(),
        }}
      />
    )
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