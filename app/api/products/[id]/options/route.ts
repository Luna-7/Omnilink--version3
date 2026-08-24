import { NextRequest, NextResponse } from 'next/server'
import { getProductOptions, createProductOption } from '@/lib/products/variants/service'
import type { CreateProductOptionInput } from '@/lib/products/variants/types'
import { getDemoProductById } from '@/lib/products/demo-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    try {
      const options = await getProductOptions(id)
      return NextResponse.json({ options })
    } catch (innerError) {
      if (innerError instanceof Error && innerError.message === 'Unauthorized') {
        const demo = getDemoProductById(id)
        if (demo) {
          const mappedOptions = (demo.options || []).map((opt, index) => ({
            id: opt.id,
            product_id: id,
            name: opt.name,
            code: opt.code,
            position: index,
            values: opt.values,
          }))
          return NextResponse.json({ options: mappedOptions })
        }
        return NextResponse.json({ error: 'Unauthorized', options: [] }, { status: 401 })
      }
      throw innerError
    }
  } catch (error) {
    console.error('Error fetching product options:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch options' },
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
    const body = await request.json() as CreateProductOptionInput
    
    const option = await createProductOption(id, body)
    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating product option:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create option' },
      { status: 400 }
    )
  }
}
