import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { saveCanonicalProductAttributes, CanonicalProductAttribute } from '@/lib/products/canonical-attributes'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params
  console.log('[product.attributes.apply] start', { productId })

  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, productId)
  if (!owned) {
    console.log('[product.attributes.apply] failed', { reason: 'Product not found or not owned' })
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const rawAttributes = body?.attributes

    if (!Array.isArray(rawAttributes)) {
      return NextResponse.json(
        { error: 'attributes must be an array' },
        { status: 400 }
      )
    }

    if (rawAttributes.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 attributes allowed' },
        { status: 400 }
      )
    }

    const validAttributes: CanonicalProductAttribute[] = []
    for (const attr of rawAttributes) {
      if (!attr || typeof attr !== 'object') continue

      const fieldKey = String(attr.key || attr.fieldKey || attr.field_key || '').trim()
      const label = attr.label ? String(attr.label).trim() : undefined
      const value = String(attr.value ?? '').trim()
      const type = attr.type
      const confidence = typeof attr.confidence === 'number' ? attr.confidence : 1.0

      if (!fieldKey || fieldKey.length < 1 || fieldKey.length > 80) {
        return NextResponse.json({ error: 'Attribute key must be 1-80 characters' }, { status: 400 })
      }
      if (label && label.length > 100) {
        return NextResponse.json({ error: 'Attribute label cannot exceed 100 characters' }, { status: 400 })
      }
      if (!value || value.length < 1 || value.length > 500) {
        return NextResponse.json({ error: 'Attribute value must be 1-500 characters' }, { status: 400 })
      }
      if (confidence < 0 || confidence > 1) {
        return NextResponse.json({ error: 'Confidence must be between 0 and 1' }, { status: 400 })
      }
      if (type && !['text', 'number', 'boolean', 'select'].includes(type)) {
        return NextResponse.json({ error: 'Invalid attribute type' }, { status: 400 })
      }

      validAttributes.push({
        fieldKey,
        label,
        value,
        type: (type as CanonicalProductAttribute['type']) || 'text',
        unit: attr.unit ? String(attr.unit) : null,
        source: attr.source === 'manual' || attr.source === 'system' ? attr.source : 'ai',
        confidence,
        isStandard: true,
      })
    }

    const result = await saveCanonicalProductAttributes(productId, {
      category: typeof body?.category === 'string' ? body.category : undefined,
      attributes: validAttributes,
    })

    console.log('[product.attributes.apply] persisted-canonical', {
      productId,
      accepted: result.mapping.accepted.length,
      unknown: result.mapping.unknownFields.length,
      rejected: result.mapping.rejected.length,
      canonicalCount: result.canonical.attributes.length,
    })

    return NextResponse.json({
      success: true,
      mapping: result.mapping,
      canonical: result.canonical,
    })
  } catch (error) {
    console.log('[product.attributes.apply] failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

