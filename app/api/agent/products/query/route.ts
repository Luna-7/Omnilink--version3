import { NextResponse } from 'next/server'
import { queryAgentProducts } from '@/lib/agent/service'

// POST /api/agent/products/query - Agent-facing product query API
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.query) {
      return NextResponse.json(
        {
          error: 'query required',
        },
        {
          status: 400,
        },
      )
    }

    const result = await queryAgentProducts(body.query)

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
