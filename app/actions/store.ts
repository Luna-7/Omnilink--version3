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
  if (storeId === 'demo-store') {
    return { success: true }
  }

  try {
    const supabase = await createClientServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return { success: false, error: 'Store not found or forbidden' }
    }

    // Validate schema
    if (!validateSchema(schema)) {
      return { success: false, error: 'Invalid storefront schema' }
    }

    // Save to store_settings.theme_config
    const { error: settingsError } = await supabase
      .from('store_settings')
      .upsert(
        {
          store_id: storeId,
          theme_config: schema,
          seo_config: {},
        } as any,
        { onConflict: 'store_id' }
      )

    if (settingsError) {
      return { success: false, error: settingsError.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save schema',
    }
  }
}

/**
 * Load Storefront Schema from store_settings.theme_config
 */
export async function loadStorefrontSchemaAction(storeId: string): Promise<StorefrontSchema | null> {
  if (storeId === 'demo-store') {
    return normalizeStorefrontSchema({ theme_id: 'electric-violet' })
  }

  try {
    const supabase = await createClientServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return null
    }

    // Load from store_settings.theme_config
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('theme_config')
      .eq('store_id', storeId)
      .maybeSingle()

    if (settingsError || !settings || !settings.theme_config) {
      return null
    }

    return normalizeStorefrontSchema(settings.theme_config)
  } catch (error) {
    console.error('loadStorefrontSchemaAction error:', error)
    return null
  }
}

/**
 * Publish Storefront - mark schema as published
 */
export async function publishStorefrontAction(storeId: string) {
  if (storeId === 'demo-store') {
    return { success: true, published: true }
  }

  try {
    const supabase = await createClientServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id, store_name, description')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return { success: false, error: 'Store not found or forbidden' }
    }

    // Load current schema
    let schema = await loadStorefrontSchemaAction(storeId)
    if (!schema) {
      const base = normalizeStorefrontSchema({ theme_id: 'electric-violet' })
      if (!base) {
        return { success: false, error: 'Failed to initialize storefront schema' }
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

    // Upsert store_settings with published schema
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
      return { success: false, error: settingsError.message }
    }

    // Also update store_pages for compatibility
    await supabase
      .from('store_pages')
      .upsert(
        {
          store_id: storeId,
          template_id: publishedSchema.theme.themeId,
          sections: publishedSchema.sections,
          published: true,
        } as any,
        { onConflict: 'store_id' }
      )

    return { success: true, published: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Publish action failed',
    }
  }
}

/**
 * Unpublish Storefront - mark schema as draft
 */
export async function unpublishStorefrontAction(storeId: string) {
  if (storeId === 'demo-store') {
    return { success: true, published: false }
  }

  try {
    const supabase = await createClientServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Verify store ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return { success: false, error: 'Store not found or forbidden' }
    }

    // Load current schema
    const schema = await loadStorefrontSchemaAction(storeId)
    if (!schema) {
      return { success: false, error: 'No storefront schema found' }
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
      return { success: false, error: settingsError.message }
    }

    // Update store_pages
    await supabase
      .from('store_pages')
      .update({
        published: false,
      })
      .eq('store_id', storeId)

    return { success: true, published: false }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unpublish action failed',
    }
  }
}
