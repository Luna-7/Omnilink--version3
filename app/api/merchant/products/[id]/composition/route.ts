import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import {
  getProductCompositions,
  createProductComposition,
  updateProductComposition,
  deleteProductComposition,
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

    const compositions = await getProductCompositions(productId, variantId)
    return NextResponse.json({ compositions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch compositions' },
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
    const composition = await createProductComposition({
      product_id: productId,
      ...body,
    })
    return NextResponse.json({ composition })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create composition' },
      { status: 500 }
    )
  }
}
