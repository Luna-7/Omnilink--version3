import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsStore } from '@/lib/api/auth'
import { Database } from '@/lib/database.types'

type StorePluginInsert = Database['public']['Tables']['store_plugins']['Insert']
type StorePluginUpdate = Database['public']['Tables']['store_plugins']['Update']

const PLUGIN_INSERT_KEYS: (keyof StorePluginInsert)[] = [
  'store_id',
  'plugin_name',
  'config',
  'enabled',
]

function pickInsert(body: unknown): StorePluginInsert {
  if (!body || typeof body !== 'object') return {} as StorePluginInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PLUGIN_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as StorePluginInsert
}

const PLUGIN_UPDATE_KEYS: (keyof StorePluginUpdate)[] = [
  'config',
  'enabled',
]

function pickUpdate(body: unknown): StorePluginUpdate {
  if (!body || typeof body !== 'object') return {} as StorePluginUpdate
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PLUGIN_UPDATE_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as StorePluginUpdate
}

const PLUGIN_SELECT =
  'id, store_id, plugin_name, enabled, config, created_at'

/**
 * GET /api/plugins?store_id=…
 *
 * Authority chain:
 *   1. requireUser()                → 401 if not signed in
 *   2. store_id is REQUIRED
 *   3. ownsStore(supabase, user, store_id) → 404 on cross-tenant access
 *
 * The previous implementation accepted any store_id and read the
 * store_plugins table via the anon/browser Supabase client, which let
 * any anonymous caller enumerate another merchant's plugins.
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const storeId = new URL(request.url).searchParams.get('store_id')
  if (!storeId) {
    return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
  }
  if (!(await ownsStore(supabase, user, storeId))) {
    // 404 (not 403) to avoid leaking the existence of the store.
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: plugins, error } = await supabase
    .from('store_plugins')
    .select(PLUGIN_SELECT)
    .eq('store_id', storeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ plugins: plugins ?? [] })
}

/**
 * POST /api/plugins — create a plugin on a store the caller owns.
 *
 * Authority chain:
 *   1. requireUser()
 *   2. whitelist of insert keys
 *   3. ownsStore check on the resolved store_id
 *
 * `store_id` is required and must point to a store the caller owns.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const insert = pickInsert(body)
  const storeId = insert.store_id
  if (!storeId) {
    return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
  }
  if (!insert.plugin_name) {
    return NextResponse.json({ error: 'plugin_name is required' }, { status: 400 })
  }
  if (!(await ownsStore(supabase, user, storeId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: plugin, error } = await supabase
    .from('store_plugins')
    .insert(insert)
    .select(PLUGIN_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ plugin }, { status: 201 })
}

/**
 * PATCH /api/plugins — update config/enabled on a plugin the caller owns.
 *
 * Body must include plugin id (or ?id=) and store_id (for ownership lookup).
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const pluginId =
    (body.id as string | undefined) ??
    new URL(request.url).searchParams.get('id')
  const storeId = body.store_id as string | undefined

  if (!pluginId || !storeId) {
    return NextResponse.json(
      { error: 'id and store_id are required' },
      { status: 400 },
    )
  }
  if (!(await ownsStore(supabase, user, storeId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const update = pickUpdate(body)

  const { data: plugin, error } = await supabase
    .from('store_plugins')
    .update(update)
    .eq('id', pluginId)
    .eq('store_id', storeId)
    .select(PLUGIN_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ plugin })
}

/**
 * DELETE /api/plugins — remove a plugin the caller owns.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const url = new URL(request.url)
  const pluginId = url.searchParams.get('id')
  const storeId = url.searchParams.get('store_id')
  if (!pluginId || !storeId) {
    return NextResponse.json(
      { error: 'id and store_id are required' },
      { status: 400 },
    )
  }
  if (!(await ownsStore(supabase, user, storeId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('store_plugins')
    .delete()
    .eq('id', pluginId)
    .eq('store_id', storeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}