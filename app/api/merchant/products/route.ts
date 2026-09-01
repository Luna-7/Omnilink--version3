import { NextRequest, NextResponse } from 'next/server'
import { requireUser, getOwnedStore } from '@/lib/api/auth'
import type { Database } from '@/lib/database.types'
import {
  saveCanonicalProductAttributes,
  CanonicalProductAttribute,
} from '@/lib/products/canonical-attributes'
import { ProductAttributeValidationError } from '@/lib/product/errors'
import { createProductWithVariants } from '@/lib/products/product-with-variants-service'
import { resolveSchemaByIndustrySlug } from '@/lib/semantic/schema-service'

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
    const store = await getOwnedStore(supabase, user)
    if (!store) {
      return NextResponse.json({ error: 'Store not found', code: 'STORE_NOT_FOUND' }, { status: 404 })
    }
    const { data: products, error } = await supabase
      .from('products')
      .select('id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at')
      .eq('store_id', store.id)
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
    const store = await getOwnedStore(supabase, user)
    if (!store) {
      console.error('[POST /api/merchant/products] Store lookup failed', { userId: user.id })
      return NextResponse.json(
        { error: 'Store not found', code: 'STORE_NOT_FOUND' },
        { status: 404 },
      )
    }

    const storeBaseCurrency = store.base_currency

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

    // Extract options from body if present
    const options = Array.isArray(body.options) ? body.options : undefined

    // Optional per-SKU overrides from the variant matrix (price/stock/SKU
    // per combination). The service validates and matches them against the
    // generated combinations; anything malformed is ignored there.
    const variants = Array.isArray(body.variants) ? body.variants : undefined

    // Phase 2B: resolve the canonical target category + raw attributes EARLY so
    // the semantic schema is resolved BEFORE the product row is inserted. A
    // missing schema must never create an orphan products row.
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

    // Schema resolution (trusted SERVICE_ROLE_ONLY reader, Phase 1) MUST precede
    // the product INSERT. If attributes are supplied but the industry schema is
    // missing, fail fast with 422 and create nothing.
    if (rawAttributes.length > 0 && targetCategory) {
      const resolution = await resolveSchemaByIndustrySlug(targetCategory, '1.0')
      if (!resolution.found) {
        console.error('[POST /api/merchant/products] Semantic schema not found', {
          storeId: store.id,
          industry: targetCategory,
        })
        return NextResponse.json(
          {
            error: `Semantic schema not found for industry '${targetCategory}'`,
            code: 'SCHEMA_NOT_FOUND',
          },
          { status: 422 },
        )
      }
    }

    // Use orchestration service to create product with options and variants
    const orchestrationResult = await createProductWithVariants({
      name: body.name,
      sku: body.sku,
      price: body.price,
      currency: storeBaseCurrency,
      inventory: body.inventory,
      description: body.description,
      status: body.status,
      category: body.category,
      category_id: body.category_id,
      origin: body.origin,
      attributes: body.attributes,
      raw_data: rawData,
      store_id: store.id,
      options: options,
      variants: variants,
    })

    if (!orchestrationResult.success || !orchestrationResult.productId) {
      console.error('[POST /api/merchant/products] Product with variants creation failed', { 
        storeId: store.id, 
        error: orchestrationResult.error 
      })
      return NextResponse.json({ 
        error: orchestrationResult.error || 'Failed to create product', 
        code: 'PRODUCT_CREATE_FAILED' 
      }, { status: 500 })
    }

    // Fetch the created product for response
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', orchestrationResult.productId)
      .single()
    
    if (fetchError || !product) {
      console.error('[POST /api/merchant/products] Failed to fetch created product', { 
        productId: orchestrationResult.productId, 
        error: fetchError?.message 
      })
      return NextResponse.json({ 
        error: 'Product created but failed to fetch', 
        code: 'PRODUCT_FETCH_FAILED' 
      }, { status: 500 })
    }

    // Process attributes if present via Canonical Service.
    // targetCategory / rawAttributes were resolved earlier (before the product
    // INSERT) as part of Phase 2B ordering — do not re-derive them here.
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

    return NextResponse.json({ 
      success: true, 
      product, 
      ai_ready: false,
      optionsCreated: orchestrationResult.optionsCreated,
      variantsCreated: orchestrationResult.variantsCreated,
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/merchant/products] Unexpected error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
