import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'

type ProductAssetInsert = Database['public']['Tables']['product_assets']['Insert']

const ASSET_INSERT_KEYS: (keyof ProductAssetInsert)[] = ['product_id', 'asset_type', 'url', 'metadata']

function pickInsert(body: unknown): ProductAssetInsert {
  if (!body || typeof body !== 'object') return {} as ProductAssetInsert
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of ASSET_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as ProductAssetInsert
}

// GET /api/assets - List assets for a product the caller owns.
export async function GET(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const sp = new URL(request.url).searchParams
    const productId = sp.get('product_id')
    const assetType = sp.get('asset_type')
    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }
    const { owned } = await ownsProduct(supabase, user, productId)
    if (!owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let query = supabase.from('product_assets').select('*').eq('product_id', productId)
    if (assetType) {
      query = query.eq('asset_type', assetType)
    }
    const { data: assets, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ assets })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/assets - Create an asset for a product the caller owns.
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const body = await request.json()
    const insert = pickInsert(body)
    const productId = insert.product_id
    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }
    const { owned } = await ownsProduct(supabase, user, productId)
    if (!owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: asset, error } = await supabase
      .from('product_assets')
      .insert(insert)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ asset }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
