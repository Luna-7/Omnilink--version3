'use server'

import { initializeMerchantStore } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createStoreAction(formData: FormData) {
  const store_name = formData.get('store_name') as string
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
      industry_id: null,
      industry_category: industry_category || null,
    })

    redirect('/dashboard')
  } catch (error) {
    throw new Error(`Failed to create store: ${error}`)
  }
}
