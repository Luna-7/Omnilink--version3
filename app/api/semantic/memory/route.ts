import { NextRequest, NextResponse } from 'next/server'
import { getSemanticMemory } from '@/lib/semantic/memory'

// GET /api/semantic/memory - Query semantic memory records
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entity_type = searchParams.get('entity_type')
    const entity_id = searchParams.get('entity_id')
    const memory_type = searchParams.get('memory_type')

    if (!entity_type) {
      return NextResponse.json(
        { error: 'entity_type parameter is required' },
        { status: 400 },
      )
    }

    const data = await getSemanticMemory({
      entity_type,
      entity_id: entity_id || undefined,
      memory_type: memory_type || undefined,
    })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
