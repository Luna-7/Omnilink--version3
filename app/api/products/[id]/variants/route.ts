import { NextRequest, NextResponse } from 'next/server'
import { getProductVariants, createProductVariant } from '@/lib/products/variants/service'
import type { CreateProductVariantInput } from '@/lib/products/variants/types'
import { getDemoProductById } from '@/lib/products/demo-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    try {
      const variants = await getProductVariants(id)
      return NextResponse.json({ variants })
    } catch (innerError) {
      if (innerError instanceof Error && innerError.message === 'Unauthorized') {
        const demo = getDemoProductById(id)
        if (demo) {
          const mappedVariants = (demo.variants || []).map((v) => ({
            id: v.id,
            product_id: id,
            sku: v.sku,
            price: v.price,
            currency: demo.currency || 'CNY',
            inventory: v.inventory,
            status: v.status || 'active',
            option_values: v.option_values,
          }))
          return NextResponse.json({ variants: mappedVariants })
        }
        return NextResponse.json({ error: 'Unauthorized', variants: [] }, { status: 401 })
      }
      throw innerError
    }
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json() as CreateProductVariantInput
    
    const variant = await createProductVariant(id, body)
    return NextResponse.json({ variant }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating product variant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create variant' },
      { status: 400 }
    )
  }
}
