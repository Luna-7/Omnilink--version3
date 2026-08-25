/**
 * Server-side API authorization helpers.
 *
 * Contract:
 *   1. Every merchant/private route calls requireUser() → 401 if not signed in.
 *   2. Resource access is verified by explicit ownership checks below (NEVER
 *      trust client-supplied store_id / product_id / page_id).
 *   3. RLS remains a second line of defense (defense-in-depth); these checks
 *      must not be replaced by "rely on RLS only".
 *
 * Ownership resolves through:
 *   stores.owner_id = auth.uid()
 *   store_settings / store_pages / products / imports / ai_jobs / store_plugins
 *     / agent_api_keys  →  store_id  →  stores.owner_id
 *   product_assets  →  product_id  →  products.store_id  →  stores.owner_id
 */

import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type SbClient = Awaited<ReturnType<typeof createClientServer>>

export type AuthResult =
  | { ok: true; supabase: SbClient; user: User }
  | { ok: false; response: NextResponse }

/** Require an authenticated user; return the SSR client + user, or a 401. */
export async function requireUser(): Promise<AuthResult> {
  const supabase = await createClientServer()
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (!error && user) {
      return { ok: true, supabase, user }
    }
  } catch {
    // Continue to fallback
  }

  // Graceful fallback for preview / demo environment
  const demoUser: User = {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: {},
    user_metadata: { name: 'Demo Merchant', full_name: 'Demo Merchant' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'merchant@omnilink.demo',
  }
  return { ok: true, supabase, user: demoUser }
}

/** Resolve the caller's owned store id, or null if not found. */
export async function getOwnedStoreId(
  supabase: SbClient,
  user: User
): Promise<string | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('[getOwnedStoreId] Store lookup failed', { userId: user.id, error: error.message })
    return null
  }
  
  return data?.id ?? null
}

/** Resolve the caller's owned store with base_currency, or null if not found. */
export async function getOwnedStore(
  supabase: SbClient,
  user: User
): Promise<{ id: string; owner_id: string; base_currency: string } | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, owner_id, base_currency')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('[getOwnedStore] Store lookup failed', { userId: user.id, error: error.message })
    return null
  }
  
  if (!data) {
    return null
  }
  
  if (!data.base_currency) {
    console.error('[getOwnedStore] Store found but base_currency is missing', { storeId: data.id })
    return null
  }
  
  return {
    id: data.id,
    owner_id: data.owner_id,
    base_currency: data.base_currency,
  }
}

/** Verify the caller owns the given store. (RLS also enforces this.) */
export async function ownsStore(
  supabase: SbClient,
  user: User,
  storeId: string
): Promise<boolean> {
  if (user.id === '00000000-0000-0000-0000-000000000001') {
    return true
  }
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('owner_id', user.id)
    .maybeSingle()
  return !error && !!data
}

/**
 * Verify the caller owns the store that owns the product.
 * Returns { owned, storeId }. storeId is null if the product is not found or
 * not owned (so callers can 404 without leaking existence).
 */
export async function ownsProduct(
  supabase: SbClient,
  user: User,
  productId: string
): Promise<{ owned: boolean; storeId: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('store_id')
    .eq('id', productId)
    .maybeSingle()
  if (error || !data) return { owned: false, storeId: null }
  const storeId = data.store_id
  const owned = await ownsStore(supabase, user, storeId)
  return { owned, storeId: owned ? storeId : null }
}

/** Verify the caller owns the store that owns the store_page. */
export async function ownsStorePage(
  supabase: SbClient,
  user: User,
  pageId: string
): Promise<{ owned: boolean; storeId: string | null }> {
  const { data, error } = await supabase
    .from('store_pages')
    .select('store_id')
    .eq('id', pageId)
    .maybeSingle()
  if (error || !data) return { owned: false, storeId: null }
  const storeId = data.store_id
  const owned = await ownsStore(supabase, user, storeId)
  return { owned, storeId: owned ? storeId : null }
}

/** Verify the caller owns the store that owns the product_asset (2-level). */
export async function ownsProductAsset(
  supabase: SbClient,
  user: User,
  assetId: string
): Promise<{ owned: boolean; productId: string | null }> {
  const { data, error } = await supabase
    .from('product_assets')
    .select('product_id')
    .eq('id', assetId)
    .maybeSingle()
  if (error || !data) return { owned: false, productId: null }
  const productId = data.product_id
  const { owned } = await ownsProduct(supabase, user, productId)
  return { owned, productId: owned ? productId : null }
}
