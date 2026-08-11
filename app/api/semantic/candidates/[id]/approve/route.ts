import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { applySemanticCandidate } from '@/lib/semantic/mutation'

// POST /api/semantic/candidates/[id]/approve - Approve candidate and trigger mutation
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

    // Apply mutation
    const result = await applySemanticCandidate(candidate)

    return NextResponse.json({
      candidate_id: id,
      status: 'approved',
      change_log: result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
