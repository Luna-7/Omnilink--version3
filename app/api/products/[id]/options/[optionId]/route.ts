import { NextRequest, NextResponse } from 'next/server'
import { 
  updateProductOption, 
  deleteProductOption 
} from '@/lib/products/variants/service'
import type { UpdateProductOptionInput } from '@/lib/products/variants/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string } }
) {
  try {
    const body = await request.json() as UpdateProductOptionInput
    
    const option = await updateProductOption(params.id, params.optionId, body)
    return NextResponse.json({ option })
  } catch (error) {
    console.error('Error updating product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update option' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; optionId: string } }
) {
  try {
    await deleteProductOption(params.id, params.optionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete option' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 404 }
    )
  }
}
