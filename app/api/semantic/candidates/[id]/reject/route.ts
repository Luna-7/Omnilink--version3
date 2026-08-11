import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// POST /api/semantic/candidates/[id]/reject - Reject candidate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get candidate
    const { data: candidate, error: candidateError } = await supabase
      .from('semantic_candidates')
      .select('*')
      .eq('id', id)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    if (candidate.status !== 'pending') {
      return NextResponse.json(
        { error: 'Candidate is not in pending status' },
        { status: 400 },
      )
    }

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('semantic_candidates')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      candidate_id: id,
      status: 'rejected',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
