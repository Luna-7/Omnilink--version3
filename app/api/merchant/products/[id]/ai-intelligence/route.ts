import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { loadProductManagementModel } from '@/lib/products/product-management-loader'
import { analyzeProductWithAi } from '@/lib/product/product-ai-intelligence'

export async function POST(
  _request: NextRequest,
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

    const model = await loadProductManagementModel(id)

    const report = await analyzeProductWithAi({
      productId: id,
      name: model.name,
      description: model.description,
      category: model.category,
      attributes: model.attributes.map((attribute) => ({
        fieldKey: attribute.fieldKey,
        label: attribute.label,
        value: attribute.value,
        type: attribute.type,
        unit: attribute.unit,
      })),
    })

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('[ai-intelligence]', error)
    return NextResponse.json(
      {
        error: 'AI 商品整理失败，请稍后重试',
      },
      {
        status: 500,
      }
    )
  }
}
