import { createClientServer } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreSettingsInsert = Database['public']['Tables']['store_settings']['Insert']

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || 'store'
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

export async function initializeMerchantStore(params: {
  owner_id: string
  store_name: string
  industry_id?: string | null
  industry_category?: string | null
}): Promise<string> {
  const { owner_id, store_name, industry_id, industry_category } = params
  const supabase = await createClientServer()

  const baseSlug = slugify(store_name)
  let store_slug = baseSlug

  // Retry on a UNIQUE violation (store_slug) by appending a short random
  // suffix. This makes re-submitting the same store name — e.g. after a
  // browser refresh, or a second attempt — create a distinct slug instead of
  // throwing and surfacing as an uncaught Server Components error (#441).
  for (let attempt = 0; attempt < 5; attempt++) {
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

    if (!storeError) {
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

    // 23505 = unique_violation — almost certainly a store_slug collision
    if (storeError.code === '23505') {
      store_slug = `${baseSlug}-${shortSuffix()}`
      continue
    }

    throw new Error(`Failed to create store: ${storeError.message}`)
  }

  throw new Error('Failed to create store: could not generate a unique store slug')
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
