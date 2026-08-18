// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { applyRules } from '@/lib/semantic/reasoning'

// GET /api/products/[id]/reasoning - Get semantic reasoning results for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get product semantics
    const { data: semantics } = await supabase
      .from('product_semantics')
      .select('*')
      .eq('product_id', id)
      .maybeSingle()

    if (!semantics) {
      return NextResponse.json({ error: 'No semantic data found for this product' }, { status: 404 })
    }

    // Get semantic rules
    const { data: rules } = await supabase
      .from('semantic_rules')
      .select('*')

    // Apply reasoning rules
    const semanticData = semantics.semantic_data as Record<string, unknown>
    const derived_semantics = applyRules(rules || [], semanticData)

    // Track which rules were applied
    const rules_applied = (rules || []).filter(rule => {
      const condition = rule.condition as { field?: string; operator?: string; value?: unknown; and?: Array<{ field?: string; operator?: string; value?: unknown }> }
      if (condition.and) {
        return condition.and.every((item: { field?: string; operator?: string; value?: unknown }) => {
          const value = semanticData[item.field || '']
          switch (item.operator) {
            case '<':
              return typeof value === 'number' && typeof item.value === 'number' && value < item.value
            case '>':
              return typeof value === 'number' && typeof item.value === 'number' && value > item.value
            default:
              return value === item.value
          }
        })
      }
      const value = semanticData[condition.field || '']
      switch (condition.operator) {
        case '<':
          return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value
        case '>':
          return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value
        default:
          return value === condition.value
      }
    })

    return NextResponse.json({
      product_id: id,
      semantic_data: semanticData,
      derived_semantics,
      rules_applied: rules_applied.map(r => ({
        id: r.id,
        name: r.name,
        confidence: r.confidence,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
