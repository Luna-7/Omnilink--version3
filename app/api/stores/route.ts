import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/api/auth'
import { createClientServer } from '@/lib/supabase/server'
import { Database } from '@/lib/database.types'

type Store = Database['public']['Tables']['stores']['Row']
type StoreInsert = Database['public']['Tables']['stores']['Insert']

/**
 * GET /api/stores — returns the caller's owned store.
 *
 * Authority chain (no client-trusted ids):
 *   1. requireUser()            → 401 if not authenticated
 *   2. server filters stores.owner_id = auth.uid()
 *
 * The previous implementation accepted ?owner_id= and queried via the
 * anon/browser Supabase client, which let any anonymous caller read any
 * user's store row (IDOR). This rewrite removes both vectors.
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { searchParams } = new URL(request.url)
  // status is a legitimate business filter; owner_id is intentionally NOT
  // accepted — the server derives ownership from the session.
  const status = searchParams.get('status')

  let query = supabase
    .from('stores')
    .select('id, owner_id, store_name, store_slug, industry_id, logo_url, description, currency, status, created_at, updated_at, industry_category')
    .eq('owner_id', user.id)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: stores, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stores: stores ?? [] })
}

/**
 * POST /api/stores — create a store owned by the caller.
 *
 * Authority chain:
 *   1. requireUser()                            → 401 if not signed in
 *   2. server overrides owner_id = auth.uid()   → client cannot impersonate
 *   3. whitelist of insert columns              → no raw_data / id / etc.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { user } = auth

  let body: Partial<StoreInsert> & { owner_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.store_name || !body.store_slug) {
    return NextResponse.json(
      { error: 'store_name and store_slug are required' },
      { status: 400 },
    )
  }

  // Whitelist of columns a client is allowed to set. Crucially, owner_id is
  // NOT in this list — the server writes it from auth.uid() below.
  const insert: StoreInsert = {
    owner_id: user.id,
    store_name: body.store_name,
    store_slug: body.store_slug,
    industry_id: body.industry_id ?? null,
    industry_category: body.industry_category ?? null,
    description: body.description ?? null,
    logo_url: body.logo_url ?? null,
    currency: body.currency ?? 'USD',
    status: body.status ?? 'active',
  }

  // Note: the current merchant onboarding path uses createStoreAction
  // (lib/stores/service.ts → initializeMerchantStore) which inserts
  // store_settings in the same transaction; this endpoint is kept for
  // future admin / migration use and explicitly uses the SSR client
  // (cookie session) rather than the anon browser client.
  const supabase = await createClientServer()
  const { data: store, error } = await supabase
    .from('stores')
    .insert(insert)
    .select('id, owner_id, store_name, store_slug, industry_id, logo_url, description, currency, status, created_at, updated_at, industry_category')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ store }, { status: 201 })
}