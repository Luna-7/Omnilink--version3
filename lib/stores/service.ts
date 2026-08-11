import { createClientServer } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreSettingsInsert = Database['public']['Tables']['store_settings']['Insert']

export async function initializeMerchantStore(params: {
  owner_id: string
  store_name: string
  industry_id?: string | null
  industry_category?: string | null
}): Promise<string> {
  const { owner_id, store_name, industry_id, industry_category } = params
  const supabase = await createClientServer()

  // Step 1: Create store
  const store_slug = store_name.toLowerCase().replace(/\s+/g, '-')

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      owner_id,
      store_name,
      store_slug,
      industry_id: industry_id ?? null,
      industry_category: industry_category ?? null,
    } as StoreInsert)
    .select()
    .single()

  if (storeError) {
    throw new Error(`Failed to create store: ${storeError.message}`)
  }

  const store_id = store.id

  // Step 2: Create store settings
  await supabase.from('store_settings').insert({
    store_id,
    theme_config: {},
    seo_config: {},
  } as StoreSettingsInsert)

  return store_id
}

export async function getStoreByOwnerId(owner_id: string) {
  const supabase = await createClientServer()
  const { data: store, error } = await supabase
    .from('stores')
    .select(`
      *,
      industries (*)
    `)
    .eq('owner_id', owner_id)
    .single()

  if (error) {
    return null
  }

  return store
}
