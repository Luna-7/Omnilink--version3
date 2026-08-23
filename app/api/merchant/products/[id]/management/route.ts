import { NextRequest, NextResponse } from 'next/server'
import { requireUser, ownsProduct } from '@/lib/api/auth'
import { loadProductManagementModel } from '@/lib/products/product-management-loader'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  const { owned } = await ownsProduct(supabase, user, id)
  if (!owned) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  try {
    const model = await loadProductManagementModel(id)
    return NextResponse.json({ model })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load product management model' },
      { status: 500 }
    )
  }
}
