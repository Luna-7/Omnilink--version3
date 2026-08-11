import { NextRequest, NextResponse } from 'next/server'
import { getProductEvidence } from '@/lib/evidence/service'

// GET /api/products/[id]/evidence - Get product evidence
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const evidence = await getProductEvidence(id)

    return NextResponse.json({ evidence })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
