// DEFERRED (Demo #56 · P4/P9): legacy semantic / evidence / reasoning layer.
// Depends on semantic_* tables that were NEVER created in the live DB
// (12/14 missing → PGRST205). Not part of the Demo storefront/agent flow.
// Semantic Source of Truth = products.semantic_data. Do not wire into Demo.
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { applySemanticCandidate } from '@/lib/semantic/mutation'
import { requireUser } from '@/lib/api/auth'

// POST /api/semantic/candidates/[id]/approve - Approve candidate and trigger mutation.
// Auth required (open-write vuln closed). The semantic layer is service-role-only
// under the #53/#54 RLS matrix, so this fails closed until the semantic engine is
// reworked behind an authenticated, owner-scoped path.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params

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
