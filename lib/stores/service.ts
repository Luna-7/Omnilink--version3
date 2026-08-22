import { createClientServer } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'
import { randomUUID } from 'crypto'

type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreSettingsInsert = Database['public']['Tables']['store_settings']['Insert']

export async function initializeMerchantStore(params: {
  owner_id: string
  store_name: string
  industry_id?: string | null
  industry_category?: string | null
  logo_url?: string | null
  description?: string | null
  currency?: string | null
}): Promise<string> {
  const { owner_id, store_name, industry_id, industry_category, logo_url, description, currency } = params
  const supabase = await createClientServer()

  // Idempotency: in this MVP one merchant owns exactly one store.
  // If the owner already has a store, return it instead of creating a
  // duplicate (which would otherwise collide on the store_slug UNIQUE
  // constraint and surface as an uncaught Server Components error #441).
  const { data: existingStore, error: existingStoreError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', owner_id)
    .maybeSingle()

  if (existingStoreError) {
    throw new Error(`Failed to look up existing store: ${existingStoreError.message}`)
  }

  if (existingStore) {
    // Optionally update existing store info with new avatar / category if provided
    if (logo_url || industry_category || store_name) {
      await supabase
        .from('stores')
        .update({
          ...(store_name ? { store_name } : {}),
          ...(logo_url ? { logo_url } : {}),
          ...(industry_category ? { industry_category } : {}),
          ...(description ? { description } : {}),
        })
        .eq('id', existingStore.id)
    }

    // Recover store_settings for an existing store that is missing it.
    const { data: existingSettings, error: settingsLookupError } = await supabase
      .from('store_settings')
      .select('id')
      .eq('store_id', existingStore.id)
      .maybeSingle()

    if (settingsLookupError) {
      throw new Error(`Failed to verify store settings: ${settingsLookupError.message}`)
    }

    if (!existingSettings) {
      const { error: settingsInsertError } = await supabase
        .from('store_settings')
        .insert({
          store_id: existingStore.id,
          theme_config: {},
          seo_config: {},
        } as StoreSettingsInsert)

      if (settingsInsertError) {
        throw new Error(`Failed to create store settings: ${settingsInsertError.message}`)
      }
    }

    return existingStore.id
  }

  // Genuinely new merchant: build a human-readable base slug, then verify it
  // does not collide with an existing slug before inserting. Use a short
  // random suffix only when a real collision is detected (e.g. a different
  // merchant already claimed the same name).
  const baseSlug =
    store_name.trim().toLowerCase().replace(/\s+/g, '-') || 'store'

  const { data: slugConflict, error: slugLookupError } = await supabase
    .from('stores')
    .select('id')
    .eq('store_slug', baseSlug)
    .maybeSingle()

  if (slugLookupError) {
    throw new Error(`Failed to verify store slug: ${slugLookupError.message}`)
  }

  const store_slug = slugConflict
    ? `${baseSlug}-${randomUUID().slice(0, 8)}`
    : baseSlug

    const baseCurrency = (currency === 'USD' ? 'USD' : 'CNY')
    const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      owner_id,
      store_name,
      store_slug,
      industry_id: industry_id ?? null,
      industry_category: industry_category ?? null,
      logo_url: logo_url ?? null,
      description: description ?? null,
      base_currency: baseCurrency,
      currency: baseCurrency,
    } as StoreInsert)
    .select('id')
    .single()

  if (storeError) {
    throw new Error(`Failed to create store: ${storeError.message}`)
  }

  if (!store) {
    throw new Error('Failed to create store: no store returned')
  }

  const store_id = store.id

  const { error: settingsError } = await supabase
    .from('store_settings')
    .insert({
      store_id,
      theme_config: {},
      seo_config: {},
    } as StoreSettingsInsert)

  if (settingsError) {
    throw new Error(`Failed to create store settings: ${settingsError.message}`)
  }

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

export async function updateStoreBaseCurrency(owner_id: string, base_currency: 'CNY' | 'USD') {
  const supabase = await createClientServer()
  const { data, error } = await supabase
    .from('stores')
    .update({
      base_currency,
      currency: base_currency,
    })
    .eq('owner_id', owner_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update store base currency: ${error.message}`)
  }

  return data
}
