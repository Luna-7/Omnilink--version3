import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/products/[id]/semantic-analysis - Get semantic analysis for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to get the latest analysis from processing logs
    const { data: latestLog } = await supabase
      .from('semantic_processing_logs')
      .select('metadata')
      .eq('product_id', id)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (latestLog?.metadata && typeof latestLog.metadata === 'object') {
      const analysis = (latestLog.metadata as { analysis?: { coverage?: unknown; unknown_fields?: unknown; missing_required_fields?: unknown } }).analysis
      if (analysis) {
        return NextResponse.json({
          product_id: id,
          coverage: analysis.coverage,
          unknown_fields: analysis.unknown_fields,
          missing_required_fields: analysis.missing_required_fields,
        })
      }
    }

    // If no analysis in logs, return empty result
    return NextResponse.json({
      product_id: id,
      coverage: {
        total_fields: 0,
        matched_fields: 0,
        coverage_score: 0,
      },
      unknown_fields: [],
      missing_required_fields: [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
