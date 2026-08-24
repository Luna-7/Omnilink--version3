import { NextRequest, NextResponse } from 'next/server'
import { 
  updateProductOption, 
  deleteProductOption 
} from '@/lib/products/variants/service'
import type { UpdateProductOptionInput } from '@/lib/products/variants/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  try {
    const { id, optionId } = await params
    const body = await request.json() as UpdateProductOptionInput
    
    const option = await updateProductOption(id, optionId, body)
    return NextResponse.json({ option })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update option' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  try {
    const { id, optionId } = await params
    await deleteProductOption(id, optionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete option' },
      { status: 404 }
    )
  }
}
