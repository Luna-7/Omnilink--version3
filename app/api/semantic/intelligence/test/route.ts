import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { analyzeUnknownFields } from '@/lib/semantic/intelligence'

// GET /api/semantic/intelligence/test - Test semantic intelligence analysis
export async function GET() {
  try {
    // Get unknown fields
    const { data: unknownFields } = await supabase
      .from('semantic_unknown_fields')
      .select('raw_field, raw_value')
      .limit(10)

    // Get ontology concepts
    const { data: ontology } = await supabase
      .from('semantic_ontology')
      .select('canonical_name, description, aliases')

    if (!unknownFields || unknownFields.length === 0) {
      return NextResponse.json({
        candidates: [],
        message: 'No unknown fields found for analysis',
      })
    }

    if (!ontology || ontology.length === 0) {
      return NextResponse.json({
        candidates: [],
        message: 'No ontology concepts found for context',
      })
    }

    // Analyze unknown fields with AI
    const candidates = await analyzeUnknownFields(unknownFields, ontology)

    return NextResponse.json({
      candidates,
      unknown_fields_count: unknownFields.length,
      ontology_count: ontology.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
