import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import {
  getProductAttributes,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
  batchCreateProductAttributes,
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
    const variantId = searchParams.get('variant_id') || undefined

    const attributes = await getProductAttributes(productId, variantId)
    return NextResponse.json({ attributes })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attributes' },
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

    // Support batch creation
    if (Array.isArray(body.attributes)) {
      const attributes = await batchCreateProductAttributes(
        productId,
        body.attributes
      )
      return NextResponse.json({ attributes })
    }

    // Single attribute creation
    const attribute = await createProductAttribute({
      product_id: productId,
      ...body,
    })
    return NextResponse.json({ attribute })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create attribute' },
      { status: 500 }
    )
  }
}
