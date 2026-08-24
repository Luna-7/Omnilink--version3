import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import type { ProductRelationInput } from '@/lib/products/product-relations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (!auth.ok) return auth.response

    const { owned } = await ownsProduct(auth.supabase, auth.user, id)
    if (!owned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    /*
     * BACKEND CONTRACT REQUEST:
     *
     * Existing product relationship persistence is not yet established.
     * Do not invent a table here.
     *
     * Expected service:
     * getProductRelations(productId)
     */

    return NextResponse.json({
      success: true,
      relations: [],
      backendContractRequired: true,
    })
  } catch (error) {
    console.error('[product-relations/GET]', error)
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireUser()
    if (!auth.ok) return auth.response

    const { owned } = await ownsProduct(auth.supabase, auth.user, id)
    if (!owned) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const relations = Array.isArray(body?.relations)
      ? (body.relations as ProductRelationInput[])
      : []

    /*
     * BACKEND CONTRACT REQUEST:
     *
     * Expected service:
     * saveProductRelations(productId, relations)
     */

    return NextResponse.json({
      success: true,
      productId: id,
      relations,
      backendContractRequired: true,
    })
  } catch (error) {
    console.error('[product-relations/PUT]', error)
    return NextResponse.json({ error: 'Failed to save relations' }, { status: 500 })
  }
}
