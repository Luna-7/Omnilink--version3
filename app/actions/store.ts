'use server'

import { createClientServer } from '@/lib/supabase/server'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import { normalizeStorefrontSchema, validateSchema } from '@/lib/storefront/schema'

/**
 * Save Storefront Schema to store_settings.theme_config
 * 
 * Security: Server-side auth + ownership verification
 */
export async function saveStorefrontSchemaAction(storeId: string, schema: StorefrontSchema) {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify store ownership
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .single()

  if (storeError || !store) {
    throw new Error('Store not found')
  }

  if (store.owner_id !== user.id) {
    throw new Error('Forbidden: You do not own this store')
  }

  // Validate schema
  if (!validateSchema(schema)) {
    throw new Error('Invalid storefront schema')
  }

  // Save to store_settings.theme_config
  const { error: settingsError } = await supabase
    .from('store_settings')
    .upsert({
      store_id: storeId,
      theme_config: schema,
      seo_config: {},
    } as any, // Supabase types don't support our custom schema

    { onConflict: 'store_id' }
  )

  if (settingsError) {
    throw new Error(`Failed to save storefront schema: ${settingsError.message}`)
  }

  return { success: true }
}

/**
 * Load Storefront Schema from store_settings.theme_config
 */
export async function loadStorefrontSchemaAction(storeId: string): Promise<StorefrontSchema | null> {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify store ownership
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .single()

  if (storeError || !store) {
    throw new Error('Store not found')
  }

  if (store.owner_id !== user.id) {
    throw new Error('Forbidden: You do not own this store')
  }

  // Load from store_settings.theme_config
  const { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('theme_config')
    .eq('store_id', storeId)
    .maybeSingle()

  if (settingsError) {
    throw new Error(`Failed to load storefront schema: ${settingsError.message}`)
  }

  if (!settings || !settings.theme_config) {
    return null
  }

  // 归一化：canonical / legacy(theme_id) 统一为 canonical schema；
  // 无法识别的脏数据返回 null（编辑器落回默认骨架，不崩溃）。
  return normalizeStorefrontSchema(settings.theme_config)
}

/**
 * Publish Storefront - mark schema as published
 */
export async function publishStorefrontAction(storeId: string) {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify store ownership
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id, store_name, description')
    .eq('id', storeId)
    .single()

  if (storeError || !store) {
    throw new Error('Store not found')
  }

  if (store.owner_id !== user.id) {
    throw new Error('Forbidden: You do not own this store')
  }

  // Load current schema；商家尚未保存过时，用默认骨架起步（hero 回填店名/简介），
  // 保证「开店 → 一键发布 → 公开页可见」闭环对新店同样成立。
  let schema = await loadStorefrontSchemaAction(storeId)
  if (!schema) {
    const base = normalizeStorefrontSchema({ theme_id: 'electric-violet' })
    if (!base) {
      throw new Error('Failed to initialize storefront schema')
    }
    schema = {
      ...base,
      sections: base.sections.map((s) =>
        s.type === 'hero'
          ? {
              ...s,
              content: {
                ...s.content,
                title: store.store_name,
                description: store.description ?? s.content.description,
              },
            }
          : s.type === 'header' || s.type === 'footer'
          ? { ...s, content: { ...s.content, title: store.store_name } }
          : s
      ),
    }
  }

  // Mark as published
  const publishedSchema: StorefrontSchema = {
    ...schema,
    meta: {
      ...schema.meta,
      published: true,
      lastModified: new Date().toISOString(),
    },
  }

  // Upsert store_settings with published schema（新店可能尚无该行）
  const { error: settingsError } = await supabase
    .from('store_settings')
    .upsert(
      {
        store_id: storeId,
        theme_config: publishedSchema,
        seo_config: {},
      } as any,
      { onConflict: 'store_id' }
    )

  if (settingsError) {
    throw new Error(`Failed to publish storefront: ${settingsError.message}`)
  }

  // Also update store_pages for compatibility
  const { error: pageError } = await supabase
    .from('store_pages')
    .upsert({
      store_id: storeId,
      template_id: publishedSchema.theme.themeId,
      sections: publishedSchema.sections,
      published: true,
    } as any,
    { onConflict: 'store_id' }
  )

  if (pageError) {
    // Non-critical error, log but don't fail
    console.error('Failed to update store_pages:', pageError)
  }

  return { success: true, published: true }
}

/**
 * Unpublish Storefront - mark schema as draft
 */
export async function unpublishStorefrontAction(storeId: string) {
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Verify store ownership
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, owner_id')
    .eq('id', storeId)
    .single()

  if (storeError || !store) {
    throw new Error('Store not found')
  }

  if (store.owner_id !== user.id) {
    throw new Error('Forbidden: You do not own this store')
  }

  // Load current schema
  const schema = await loadStorefrontSchemaAction(storeId)
  if (!schema) {
    throw new Error('No storefront schema found')
  }

  // Mark as unpublished
  const unpublishedSchema: StorefrontSchema = {
    ...schema,
    meta: {
      ...schema.meta,
      published: false,
      lastModified: new Date().toISOString(),
    },
  }

  // Update store_settings
  const { error: settingsError } = await supabase
    .from('store_settings')
    .update({
      theme_config: unpublishedSchema,
    } as any)
    .eq('store_id', storeId)

  if (settingsError) {
    throw new Error(`Failed to unpublish storefront: ${settingsError.message}`)
  }

  // Update store_pages
  const { error: pageError } = await supabase
    .from('store_pages')
    .update({
      published: false,
    })
    .eq('store_id', storeId)

  if (pageError) {
    console.error('Failed to update store_pages:', pageError)
  }

  return { success: true, published: false }
}
