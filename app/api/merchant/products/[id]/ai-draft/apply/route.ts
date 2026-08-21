import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { getSchemaByIndustrySlug, saveProductSemantics, saveUnknownFields } from '@/lib/semantic/processor'
import { mapDraftAttributes, InputAttribute } from '@/lib/product-ai/attribute-mapper'

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
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, store_id, stores(industry_id, industries(slug))')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.log('[product.attributes.apply] failed', { reason: 'Product lookup failed' })
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

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

    const validAttributes: InputAttribute[] = []
    for (const attr of rawAttributes) {
      if (!attr || typeof attr !== 'object') continue

      const key = String(attr.key || '').trim()
      const label = attr.label ? String(attr.label).trim() : undefined
      const value = String(attr.value ?? '').trim()
      const type = attr.type
      const confidence = typeof attr.confidence === 'number' ? attr.confidence : 1.0

      if (!key || key.length < 1 || key.length > 80) {
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
        key,
        label,
        value,
        type: type as InputAttribute['type'],
        unit: attr.unit ? String(attr.unit) : null,
        confidence,
      })
    }

    const storeObj = product.stores as { industries?: { slug?: string } | null } | null
    const industrySlug = storeObj?.industries?.slug || 'eyewear'

    let schemaId = await getSchemaByIndustrySlug(industrySlug, '1.0')
    if (!schemaId) {
      schemaId = await getSchemaByIndustrySlug('eyewear', '1.0')
    }

    if (!schemaId) {
      console.log('[product.attributes.apply] failed', { reason: 'No schema found' })
      return NextResponse.json({ error: 'Semantic schema not found' }, { status: 500 })
    }

    console.log('[product.attributes.apply] schema-resolved', { schemaId, industrySlug })

    const mapping = await mapDraftAttributes(schemaId, validAttributes)
    console.log('[product.attributes.apply] mapping-complete', {
      acceptedCount: mapping.accepted.length,
      unknownCount: mapping.unknownFields.length,
      rejectedCount: mapping.rejected.length,
    })

    const overallConfidence = mapping.accepted.length > 0
      ? mapping.accepted.reduce((sum, a) => sum + a.confidence, 0) / mapping.accepted.length
      : 1.0

    if (Object.keys(mapping.semanticData).length > 0) {
      await saveProductSemantics(
        productId,
        schemaId,
        mapping.semanticData,
        overallConfidence,
        'merchant-confirmed-ai-draft',
      )

      await supabase
        .from('products')
        .update({
          semantic_data: mapping.semanticData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
    }

    if (mapping.unknownFields.length > 0) {
      await saveUnknownFields(
        productId,
        schemaId,
        mapping.unknownFields,
      )
    }

    console.log('[product.attributes.apply] persisted', {
      productId,
      schemaId,
      accepted: mapping.accepted.length,
      unknown: mapping.unknownFields.length,
      rejected: mapping.rejected.length,
    })

    return NextResponse.json({
      success: true,
      mapping,
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
