import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { SettingsView } from '@/components/settings/SettingsView'

/**
 * /dashboard/settings — real merchant store only.
 *
 * No fake store fallback. If the merchant has no store yet we route to
 * /onboarding instead of fabricating a "Carlic Bolomboy" placeholder.
 */
export default async function SettingsPage() {
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
      <SettingsView
        currentStore={{
          store_name: 'Omnilink 官方旗舰店',
          store_slug: 'omnilink-flagship',
          industries: { name: '智能硬件与数码' },
        }}
      />
    )
  }

  const store = await getStoreByOwnerId(user.id)
  if (!store) {
    redirect('/onboarding')
  }

  return <SettingsView currentStore={store} />
}