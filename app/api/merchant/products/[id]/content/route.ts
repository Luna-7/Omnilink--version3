import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import {
  getProductContents,
  createProductContent,
  updateProductContent,
  deleteProductContent,
} from '@/lib/products/attribute-domains-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, productId)
  if (!owned) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('content_type') || undefined

    const contents = await getProductContents(productId, contentType)
    return NextResponse.json({ contents })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, productId)
  if (!owned) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const content = await createProductContent({
      product_id: productId,
      ...body,
    })
    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create content' },
      { status: 500 }
    )
  }
}
