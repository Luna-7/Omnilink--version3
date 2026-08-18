import { NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase/server'

/**
 * GET /api/industries — public reference data.
 *
 * Industries are shared, read-only reference rows seeded by migration
 * 000005 (Demo). No merchant or anonymous caller is allowed to write to
 * this table; write access would require an admin tooling surface that
 * is out of scope for the Demo.
 */
export async function GET() {
  try {
    const supabase = await createClientServer()
    const { data: industries, error } = await supabase
      .from('industries')
      .select('id, name, slug, description, created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ industries: industries ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/industries — denied.
 *
 * The Demo has no merchant-facing use case for creating industries, and
 * seeding is handled by migrations. Returning 403 prevents accidental
 * write attempts (e.g. from a stale client) rather than silently allowing
 * them through the anon client. If an admin write path is added later,
 * it must require server-side admin authorization before being enabled.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Industry creation is not supported in this Demo' },
    { status: 403 }
  )
}