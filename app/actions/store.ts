'use server'

import { revalidatePath } from 'next/cache'
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
 * Publish Storefront — mark the editor's current schema as live.
 *
 * Source of truth = the `schema` argument passed in by the caller (typically
 * StorefrontEditor). We deliberately do NOT re-read the schema from the
 * database here: that would mean the editor's latest in-memory edits are
 * overwritten by the previously-persisted version the moment the user clicks
 * 全网发布.
 *
 * The flow:
 *   1. Auth + ownership verification
 *   2. Validate the passed schema (defensive — guards against UI bugs)
 *   3. Normalize it to canonical StorefrontSchema shape
 *   4. Mark meta.published = true and refresh meta.lastModified
 *   5. Upsert store_settings.theme_config (canonical source)
 *   6. Upsert store_pages (legacy compat; error is logged but does not fail
 *      the publish because the canonical write is what public routes read)
 *   7. revalidatePath the public storefront so any cached variants refresh
 */
export async function publishStorefrontAction(
  storeId: string,
  schema: StorefrontSchema
) {
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
      .select('id, owner_id, store_slug')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return { success: false, error: 'Store not found or forbidden' }
    }

    // Validate the passed schema (defensive — the editor already validates,
    // but a bad input from a future caller should not silently corrupt DB).
    if (!validateSchema(schema)) {
      return { success: false, error: 'Invalid storefront schema' }
    }

    // Normalize to canonical shape (defensive — keeps published schema in
    // canonical form even if a caller passed a slightly off-shape object).
    const normalized = normalizeStorefrontSchema(schema)
    if (!normalized) {
      return { success: false, error: 'Failed to normalize storefront schema' }
    }

    // Mark as published, refresh lastModified
    const publishedSchema: StorefrontSchema = {
      ...normalized,
      meta: {
        ...normalized.meta,
        published: true,
        lastModified: new Date().toISOString(),
      },
    }

    // 1) Persist canonical schema to store_settings.theme_config
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
      return {
        success: false,
        error: `Failed to save storefront: ${settingsError.message}`,
      }
    }

    // 2) Legacy compat: also update store_pages so any older code path that
    //    still reads store_pages sees the latest. We log but do not fail the
    //    publish when this fails — the canonical write above is what the
    //    public storefront actually reads.
    const { error: pagesError } = await supabase
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

    if (pagesError) {
      console.error(
        'publishStorefrontAction: store_pages legacy sync failed (non-fatal):',
        pagesError.message
      )
    }

    // 3) Invalidate the public storefront cache. The route is dynamic so
    //    Next.js will re-fetch on the next request anyway, but
    //    revalidatePath ensures any cached variants are explicitly cleared.
    if (store.store_slug) {
      try {
        revalidatePath(`/store/${store.store_slug}`)
      } catch (revalidateErr) {
        console.error(
          'publishStorefrontAction: revalidatePath failed (non-fatal):',
          revalidateErr
        )
      }
    }

    return { success: true, published: true }
  } catch (err) {
    console.error('publishStorefrontAction error:', err)
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
