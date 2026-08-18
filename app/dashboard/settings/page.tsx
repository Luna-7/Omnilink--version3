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

  return <SettingsView currentStore={store} />
}