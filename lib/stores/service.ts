import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreSettingsInsert = Database['public']['Tables']['store_settings']['Insert']
type StorePageInsert = Database['public']['Tables']['store_pages']['Insert']
type StorePluginInsert = Database['public']['Tables']['store_plugins']['Insert']

export async function initializeMerchantStore(params: {
  owner_id: string
  store_name: string
  industry_id: string
}): Promise<string> {
  const { owner_id, store_name, industry_id } = params

  // Step 1: Create store
  const store_slug = store_name.toLowerCase().replace(/\s+/g, '-')

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      owner_id,
      store_name,
      store_slug,
      industry_id,
    } as StoreInsert)
    .select()
    .single()

  if (storeError) {
    throw new Error(`Failed to create store: ${storeError.message}`)
  }

  const store_id = store.id

  // Step 2: Find template based on industry
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('industry_id', industry_id)
    .single()

  const template_id = templateError || !template ? 'general' : template.id

  // Step 3: Create store settings
  await supabase.from('store_settings').insert({
    store_id,
    theme_config: { theme: 'light' },
    seo_config: { schema_injection: true },
  } as StoreSettingsInsert)

  // Step 4: Create store pages
  await supabase.from('store_pages').insert({
    store_id,
    template_id,
    sections: {
      sections: ['header', 'product_grid', 'contact'],
    },
    published: false,
  } as StorePageInsert)

  // Step 5: Create store plugins
  await supabase.from('store_plugins').insert({
    store_id,
    plugin_name: 'virtual_tryon',
    enabled: false,
    config: {},
  } as StorePluginInsert)

  return store_id
}

export async function getStoreByOwnerId(owner_id: string) {
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

export async function getIndustries() {
  const { data: industries, error } = await supabase
    .from('industries')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch industries: ${error.message}`)
  }

  return industries
}
