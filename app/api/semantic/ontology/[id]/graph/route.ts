import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { resolveSemanticGraph, GraphResult } from '@/lib/semantic/graph'

// GET /api/semantic/ontology/[id]/graph - Get semantic graph for a concept
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the concept
    const { data: concept } = await supabase
      .from('semantic_ontology')
      .select('*')
      .eq('id', id)
      .single()

    if (!concept) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 })
    }

    // Get all relations
    const { data: relations } = await supabase
      .from('semantic_relations')
      .select('*')

    // Resolve connected nodes with depth 2
    const connectedNodeIds = resolveSemanticGraph(id, relations || [], 2)

    // Get connected concepts
    const { data: connectedConcepts } = await supabase
      .from('semantic_ontology')
      .select('*')
      .in('id', connectedNodeIds)

    const result: GraphResult = {
      concept: {
        id: concept.id,
        canonical_name: concept.canonical_name,
        description: concept.description,
        aliases: Array.isArray(concept.aliases) ? concept.aliases : [],
      },
      relations: relations || [],
      connected_nodes: (connectedConcepts || []).map(c => ({
        id: c.id,
        canonical_name: c.canonical_name,
        description: c.description,
        aliases: Array.isArray(c.aliases) ? c.aliases : [],
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
