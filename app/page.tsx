import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Get user from Supabase session
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // User not authenticated - redirect to login or show login page
    // For now, redirect to onboarding (you may want to add auth page)
    redirect('/onboarding')
  }

  const owner_id = user.id
  const store = await getStoreByOwnerId(owner_id)

  if (store) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}
