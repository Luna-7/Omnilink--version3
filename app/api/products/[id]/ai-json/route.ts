import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { resolveSemanticGraph } from '@/lib/semantic/graph'
import { applyRules } from '@/lib/semantic/reasoning'
import { getProductEvidence } from '@/lib/evidence/service'

// GET /api/products/[id]/ai-json - Get AI-ready unified product data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, stores(*)')
      .eq('id', id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: semantics } = await supabase
      .from('product_semantics')
      .select(`
        *,
        semantic_schemas(*)
      `)
      .eq('product_id', id)
      .maybeSingle()

    // Get ontology concepts and relations for semantic graph
    const { data: ontology } = await supabase
      .from('semantic_ontology')
      .select('id, canonical_name, description, aliases')

    const { data: relations } = await supabase
      .from('semantic_relations')
      .select('id, source_concept_id, relation_type, target_concept_id, metadata, created_at')

    // Get semantic rules for reasoning
    const { data: rules } = await supabase
      .from('semantic_rules')
      .select('*')

    // Resolve semantic graph if semantic data exists
    let semantic_graph = null
    if (semantics && ontology && relations) {
      const semanticData = semantics.semantic_data as Record<string, unknown>
      const conceptIds = Object.keys(semanticData)
        .map(key => ontology?.find(o => o.canonical_name === key)?.id)
        .filter(Boolean) as string[]

      const resolvedConceptIds = conceptIds.flatMap(conceptId =>
        resolveSemanticGraph(conceptId, relations || [], 2),
      )

      const resolvedConcepts = (ontology || []).filter(o =>
        resolvedConceptIds.includes(o.id),
      )

      const resolvedRelations = (relations || []).filter(r =>
        resolvedConceptIds.includes(r.source_concept_id) ||
        resolvedConceptIds.includes(r.target_concept_id),
      )

      semantic_graph = {
        concepts: resolvedConcepts,
        relations: resolvedRelations,
      }
    }

    // Apply reasoning rules to derive semantics
    let derived_semantics = null
    if (semantics && rules) {
      const semanticData = semantics.semantic_data as Record<string, unknown>
      derived_semantics = applyRules(rules, semanticData)
    }

    // Get product evidence
    const evidence = await getProductEvidence(id)

    const metadata = {
      industry: (product.stores as { industries?: { slug?: string } } | null)?.industries?.slug || 'unknown',
      store_id: product.store_id,
      product_id: product.id,
      created_at: product.created_at,
      updated_at: product.updated_at,
      has_semantics: !!semantics,
      semantic_confidence: semantics?.confidence || null,
      semantic_generated_by: semantics?.generated_by || null,
    }

    return NextResponse.json({
      product: {
        id: product.id,
        store_id: product.store_id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        inventory: product.inventory,
        status: product.status,
      },
      semantic: semantics ? {
        schema_id: semantics.schema_id,
        schema: semantics.semantic_schemas,
        semantic_data: semantics.semantic_data,
        confidence: semantics.confidence,
        generated_by: semantics.generated_by,
      } : null,
      derived_semantics,
      semantic_graph,
      metadata,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
