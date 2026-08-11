import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import {
  analyzeUnknownFields,
  generateSchemaEvolutionSuggestion,
} from '@/lib/semantic/evolution'

// GET /api/semantic/schemas/[id]/evolution - Get schema evolution suggestions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get schema information
    const { data: schema } = await supabase
      .from('semantic_schemas')
      .select('id, version')
      .eq('id', id)
      .single()

    if (!schema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 })
    }

    // Get total product count for this schema
    const { count: totalProducts } = await supabase
      .from('product_semantics')
      .select('*', { count: 'exact', head: true })
      .eq('schema_id', id)

    // Get unknown fields for this schema
    const { data: unknownFields } = await supabase
      .from('semantic_unknown_fields')
      .select('raw_field, product_id')
      .eq('schema_id', id)

    // Get ontology for field normalization
    const { data: ontology } = await supabase
      .from('semantic_ontology')
      .select('canonical_name, aliases')

    const ontologyRecords = (ontology || []).map(item => ({
      canonical_name: item.canonical_name,
      aliases: Array.isArray(item.aliases) ? item.aliases : [],
    }))

    if (!unknownFields || unknownFields.length === 0) {
      return NextResponse.json({
        schema_id: id,
        schema_version: schema.version,
        candidates: [],
        generated_by: 'evolution-engine-v1',
        version: '1.0',
      })
    }

    // Analyze unknown fields with ontology normalization
    const statistics = analyzeUnknownFields(
      unknownFields,
      totalProducts || 0,
      ontologyRecords,
    )

    // Generate evolution suggestions
    const suggestions = generateSchemaEvolutionSuggestion(
      id,
      schema.version,
      statistics,
    )

    return NextResponse.json(suggestions)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
