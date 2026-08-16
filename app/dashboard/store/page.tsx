import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import StorePage from '@/components/dashboard/StorePage'

/**
 * /dashboard/store — server component (#57 P3/P6 fix).
 *
 * The merchant console must reflect the REAL store, not the hardcoded demo
 * fallback. Auth/session is cookie-based (set by the login server action), so
 * we load the store + page here with the server client (createClientServer
 * reads the cookie) and pass them to the client StorePage. Previously this page
 * was a client component using the localStorage browser client, which had no
 * session after cookie login and silently fell back to "demo-store" — making
 * theme selection / publish target a non-existent store.
 */
export default async function StoreDashboardPage() {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const store = await getStoreByOwnerId(user.id)
  if (!store) {
    redirect('/onboarding')
  }

  const { data: page } = await supabase
    .from('store_pages')
    .select('id, published, template_id, sections')
    .eq('store_id', store.id)
    .maybeSingle()

  return (
    <StorePage
      store={{
        id: store.id,
        store_name: store.store_name,
        store_slug: store.store_slug,
      }}
      storePage={page}
    />
  )
}
