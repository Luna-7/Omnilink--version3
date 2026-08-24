import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { mapAcceptedAiChanges } from '@/lib/product/product-ai-change-mapper'
import { saveCanonicalProductAttributes } from '@/lib/products/canonical-attributes'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (!auth.ok) return auth.response

    const { owned } = await ownsProduct(auth.supabase, auth.user, id)
    if (!owned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const changes = Array.isArray(body?.changes) ? body.changes : []

    const { attributes, deletions } = mapAcceptedAiChanges(changes)

    if (attributes.length === 0 && deletions.length === 0) {
      return NextResponse.json({
        success: true,
        applied: 0,
      })
    }

    const canonicalAttrs = attributes.map((attr) => ({
      fieldKey: attr.fieldKey,
      value: attr.value,
      type: 'text' as const,
      source: 'ai' as const,
      confidence: attr.confidence || 0.95,
      isStandard: true,
    }))

    const result = await saveCanonicalProductAttributes(id, {
      attributes: canonicalAttrs,
      deletions,
    })

    return NextResponse.json({
      success: true,
      applied: attributes.length + deletions.length,
      canonical: result.canonical,
    })
  } catch (error) {
    console.error('[ai-intelligence/apply]', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'AI 修改应用失败',
      },
      {
        status: 500,
      }
    )
  }
}
