import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { getStorefrontProducts } from '@/lib/storefront/service'
import StorePage from '@/components/dashboard/StorePage'
import { loadStorefrontSchemaAction } from '@/app/actions/store'

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

  // Load storefront schema from store_settings
  let storefrontSchema = null
  try {
    storefrontSchema = await loadStorefrontSchemaAction(store.id)
  } catch (error) {
    console.error('Failed to load storefront schema:', error)
  }

  // Load real products for editor preview (featured_products section)
  let storefrontProducts: Awaited<ReturnType<typeof getStorefrontProducts>> = []
  try {
    storefrontProducts = await getStorefrontProducts({
      id: store.id,
      slug: store.store_slug,
      currency: store.currency,
    })
  } catch (error) {
    console.error('Failed to load storefront products:', error)
  }

  return (
    <StorePage
      store={{
        id: store.id,
        store_name: store.store_name,
        store_slug: store.store_slug,
      }}
      storePage={page}
      storefrontSchema={storefrontSchema}
      storefrontProducts={storefrontProducts}
    />
  )
}
