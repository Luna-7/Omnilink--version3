import { NextResponse } from 'next/server'
import { queryAgentProducts } from '@/lib/agent/service'

// POST /api/agent/products/query - Agent-facing product query API
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Empty/missing query => match all active products (Demo #56 robustness).
    const query = typeof body?.query === 'string' ? body.query : ''

    const result = await queryAgentProducts(query)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Agent query failed',
      },
      {
        status: 500,
      },
    )
  }
}
