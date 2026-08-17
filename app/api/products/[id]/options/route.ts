import { NextRequest, NextResponse } from 'next/server'
import { getProductOptions, createProductOption } from '@/lib/products/variants/service'
import type { CreateProductOptionInput } from '@/lib/products/variants/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const options = await getProductOptions(params.id)
    return NextResponse.json({ options })
  } catch (error) {
    console.error('Error fetching product options:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch options' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json() as CreateProductOptionInput
    
    const option = await createProductOption(params.id, body)
    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    console.error('Error creating product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create option' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400 }
    )
  }
}
