import { NextRequest, NextResponse } from 'next/server'
import { requireUser, getOwnedStoreId } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'
import {
  saveCanonicalProductAttributes,
  CanonicalProductAttribute,
} from '@/lib/products/canonical-attributes'
import { ProductAttributeValidationError } from '@/lib/product/errors'

type ProductInsert = Database['public']['Tables']['products']['Insert']

const PRODUCT_INSERT_KEYS: (keyof ProductInsert)[] = [
  'sku', 'name', 'description', 'price', 'currency', 'inventory', 'status',
  'raw_data',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function pickInsert(body: unknown): Partial<ProductInsert> {
  if (!body || typeof body !== 'object') return {}
  const src = body as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of PRODUCT_INSERT_KEYS) {
    if (k in src) out[k] = src[k]
  }
  return out as Partial<ProductInsert>
}

// GET /api/merchant/products - List the caller's own products.
export async function GET() {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const storeId = await getOwnedStoreId(supabase, user)
    if (!storeId) {
      return NextResponse.json({ products: [] })
    }
    const { data: products, error } = await supabase
      .from('products')
      .select('id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products: products || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/merchant/products - Create a product in the caller's own store.
// (Previously used the anon client + createMerchantProduct which inserted
// non-existent columns; now server-side, ownership-scoped, whitelisted.)
export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  try {
    const storeId = await getOwnedStoreId(supabase, user)
    if (!storeId) {
      return NextResponse.json({ error: 'No store for this merchant' }, { status: 404 })
    }

    // Retrieve store's base_currency as the single source of truth
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, base_currency, currency')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found or store base currency unavailable' },
        { status: 404 },
      )
    }

    const storeBaseCurrency = store.base_currency || store.currency || 'CNY'

    const body = await request.json()
    if (!body?.name || body?.price == null) {
      return NextResponse.json(
        { error: 'name and price are required' },
        { status: 400 },
      )
    }
    const rawData = isRecord(body.raw_data) ? { ...body.raw_data } : {}
    if (typeof body.category_id === 'string' && body.category_id && !rawData.category_id) {
      rawData.category_id = body.category_id
    }
    if (typeof body.category === 'string' && body.category && !rawData.category) {
      rawData.category = body.category
    }

    const insert: ProductInsert = {
      store_id: storeId,
      ...pickInsert(body),
      raw_data: rawData,
      // Enforce store base currency as single source of truth (must be after pickInsert)
      currency: storeBaseCurrency,
    } as ProductInsert

    const { data: product, error } = await supabase
      .from('products')
      .insert(insert)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process attributes if present via Canonical Service
    const targetCategory =
      typeof body.category === 'string'
        ? body.category
        : isRecord(body.raw_data) && typeof body.raw_data.category === 'string'
          ? body.raw_data.category
          : undefined

    const rawAttributes = Array.isArray(body.attributes)
      ? body.attributes
      : isRecord(body.raw_data) && Array.isArray(body.raw_data.attributes)
        ? body.raw_data.attributes
        : []

    if (rawAttributes.length > 0) {
      const validAttributes: CanonicalProductAttribute[] = []

      for (const attr of rawAttributes) {
        if (!attr || typeof attr !== 'object') continue
        const fieldKey = String(
          (attr as Record<string, unknown>).key ??
          (attr as Record<string, unknown>).fieldKey ??
          (attr as Record<string, unknown>).field_key ??
          ''
        ).trim()
        const label = (attr as Record<string, unknown>).label
          ? String((attr as Record<string, unknown>).label).trim()
          : undefined
        const value = String((attr as Record<string, unknown>).value ?? '').trim()
        const type = (attr as Record<string, unknown>).type
        const confidence =
          typeof (attr as Record<string, unknown>).confidence === 'number'
            ? ((attr as Record<string, unknown>).confidence as number)
            : 1.0

        if (fieldKey) {
          validAttributes.push({
            fieldKey,
            label,
            value,
            type:
              type === 'text' || type === 'number' || type === 'boolean' || type === 'select'
                ? type
                : 'text',
            unit: (attr as Record<string, unknown>).unit
              ? String((attr as Record<string, unknown>).unit)
              : null,
            source:
              (attr as Record<string, unknown>).source === 'manual' ||
              (attr as Record<string, unknown>).source === 'system'
                ? ((attr as Record<string, unknown>).source as 'manual' | 'system')
                : 'manual',
            confidence,
            isStandard: true,
          })
        }
      }

      if (validAttributes.length > 0) {
        try {
          const result = await saveCanonicalProductAttributes(product.id, {
            category: targetCategory,
            attributes: validAttributes,
          })

          return NextResponse.json(
            {
              success: true,
              product,
              canonical: result.canonical,
              mapping: result.mapping,
              ai_ready: false,
            },
            { status: 201 },
          )
        } catch (attrError) {
          if (attrError instanceof ProductAttributeValidationError) {
            return NextResponse.json(
              {
                success: false,
                error: 'Product attribute validation failed',
                product_id: product.id,
                attribute_validation_failed: true,
                issues: attrError.issues,
              },
              { status: 422 },
            )
          }
          throw attrError
        }
      }
    }

    return NextResponse.json({ success: true, product, ai_ready: false }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
