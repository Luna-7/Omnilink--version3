import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import {
  saveCanonicalProductAttributes,
  CanonicalProductAttribute,
} from '@/lib/products/canonical-attributes'
import { ProductAttributeValidationError } from '@/lib/product/errors'

// POST /api/semantics - Create/update semantic data for a product via Canonical Gateway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const productId = body?.product_id

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }

    const rawAttributes = Array.isArray(body?.attributes)
      ? body.attributes
      : body?.semantic_data && typeof body.semantic_data === 'object'
        ? Object.entries(body.semantic_data).map(([key, value]) => ({
            key,
            value: typeof value === 'object' && value !== null && 'value' in value ? (value as any).value : value,
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'text',
          }))
        : []

    const validAttributes: CanonicalProductAttribute[] = rawAttributes.map((attr: any) => ({
      fieldKey: String(attr.key || attr.fieldKey || attr.field_name || '').trim(),
      label: attr.label ? String(attr.label).trim() : undefined,
      value: String(attr.value ?? '').trim(),
      type: attr.type || 'text',
      unit: attr.unit ? String(attr.unit) : null,
      source: attr.source === 'ai' ? 'ai' : 'manual',
      confidence: typeof attr.confidence === 'number' ? attr.confidence : 1.0,
      isStandard: true,
    })).filter((a: CanonicalProductAttribute) => Boolean(a.fieldKey))

    const result = await saveCanonicalProductAttributes(productId, {
      category: typeof body?.category === 'string' ? body.category : undefined,
      attributes: validAttributes,
    })

    return NextResponse.json({ success: true, canonical: result.canonical }, { status: 201 })
  } catch (error) {
    if (error instanceof ProductAttributeValidationError) {
      return NextResponse.json(
        {
          error: 'Product attribute validation failed',
          issues: error.issues,
        },
        { status: 422 },
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}

// GET /api/semantics - Get semantic data for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }

    const { data: semantics, error } = await supabase
      .from('product_semantics')
      .select('*')
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ semantics })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
