'use server'

import { initializeMerchantStore } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createStoreAction(formData: FormData) {
  const store_name = formData.get('store_name') as string
  const industry_id = formData.get('industry_id') as string | null
  const industry_category = formData.get('industry_category') as string | null

  if (!store_name) {
    throw new Error('Store name is required')
  }

  // Get user from Supabase session
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const owner_id = user.id

  try {
    const store_id = await initializeMerchantStore({
      owner_id,
      store_name,
      industry_id: industry_id || null,
      industry_category: industry_category || null,
    })
  } catch (error) {
    throw new Error(`Failed to create store: ${error}`)
  }
  // redirect() throws NEXT_REDIRECT; it must NOT be caught by the business
  // try/catch above. Keep it as the last statement at function scope so
  // Next.js sees and translates it into a 303 navigation.
  redirect('/dashboard')
}
