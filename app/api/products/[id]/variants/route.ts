import { NextRequest, NextResponse } from 'next/server'
import { getProductVariants, createProductVariant } from '@/lib/products/variants/service'
import type { CreateProductVariantInput } from '@/lib/products/variants/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const variants = await getProductVariants(id)
    return NextResponse.json({ variants })
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch variants' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
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
    console.error('Error creating product variant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create variant' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400 }
    )
  }
}
