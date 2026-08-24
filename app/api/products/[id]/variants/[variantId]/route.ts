import { NextRequest, NextResponse } from 'next/server'
import { 
  getProductVariant, 
  updateProductVariant, 
  deleteProductVariant 
} from '@/lib/products/variants/service'
import type { UpdateProductVariantInput } from '@/lib/products/variants/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params
    const variant = await getProductVariant(id, variantId)
    return NextResponse.json({ variant })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching product variant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch variant' },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params
    const body = await request.json() as UpdateProductVariantInput
    
    const variant = await updateProductVariant(id, variantId, body)
    return NextResponse.json({ variant })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating product variant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update variant' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { id, variantId } = await params
    await deleteProductVariant(id, variantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting product variant:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete variant' },
      { status: 404 }
    )
  }
}
