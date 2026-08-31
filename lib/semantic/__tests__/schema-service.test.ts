/**
 * Phase 1 — trusted semantic schema reader tests.
 *
 * Verifies that the server-only reader (lib/semantic/schema-service) resolves
 * schemas via the service-role client and distinguishes the three failure
 * modes (not_found / access_denied / query_failed) instead of collapsing
 * everything to null.
 */
import { describe, it, expect, vi } from 'vitest'

const harness = vi.hoisted(() => {
  type Resp = { data: unknown; error: { code?: string; message?: string } | null }
  let responses: Record<string, Resp> = {}

  const makeBuilder = (resp: Resp) => ({
    select: () => makeBuilder(resp),
    eq: () => makeBuilder(resp),
    maybeSingle: async () => resp,
    single: async () => resp,
  })

  const client = {
    from(table: string) {
      const resp = responses[table] ?? { data: null, error: null }
      return makeBuilder(resp)
    },
  }

  return {
    setResponses(r: Record<string, Resp>) {
      responses = r
    },
    getClient: () => client,
  }
})

vi.mock('@/lib/supabase/service-role', () => ({
  createServiceRoleClient: () => harness.getClient(),
}))

import {
  resolveSchemaByIndustrySlug,
  getSchemaIdByIndustrySlug,
  SchemaNotFoundError,
  SchemaAccessDeniedError,
  SchemaQueryFailedError,
} from '../schema-service'

const OK = { data: { id: 'ind-0' }, error: null }

describe('resolveSchemaByIndustrySlug (trusted reader)', () => {
  it('returns found when industry + schema exist', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-1' }, error: null },
      semantic_schemas: { data: { id: 'sch-1', version: '1.0' }, error: null },
    })
    const res = await resolveSchemaByIndustrySlug('eyewear', '1.0')
    expect(res).toEqual({ found: true, schemaId: 'sch-1', version: '1.0' })
  })

  it('returns not_found when industry is missing', async () => {
    harness.setResponses({ industries: { data: null, error: null } })
    const res = await resolveSchemaByIndustrySlug('nope', '1.0')
    expect(res).toEqual({ found: false, reason: 'not_found' })
  })

  it('returns not_found when industry exists but schema does not', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-2' }, error: null },
      semantic_schemas: { data: null, error: null },
    })
    const res = await resolveSchemaByIndustrySlug('eyewear', '1.0')
    expect(res).toEqual({ found: false, reason: 'not_found' })
  })

  it('returns access_denied on permission error (42501)', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-3' }, error: null },
      semantic_schemas: { data: null, error: { code: '42501', message: 'permission denied' } },
    })
    const res = await resolveSchemaByIndustrySlug('eyewear', '1.0')
    expect(res.found).toBe(false)
    if (!res.found) expect(res.reason).toBe('access_denied')
  })

  it('returns query_failed on a generic error', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-4' }, error: null },
      semantic_schemas: { data: null, error: { code: 'XX000', message: 'connection lost' } },
    })
    const res = await resolveSchemaByIndustrySlug('eyewear', '1.0')
    expect(res.found).toBe(false)
    if (!res.found) expect(res.reason).toBe('query_failed')
  })

  it('short-circuits to not_found for an empty slug without a db call', async () => {
    harness.setResponses({})
    const res = await resolveSchemaByIndustrySlug('', '1.0')
    expect(res).toEqual({ found: false, reason: 'not_found' })
  })
})

describe('getSchemaIdByIndustrySlug (throwing variant)', () => {
  it('returns the schema id when found', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-5' }, error: null },
      semantic_schemas: { data: { id: 'sch-5', version: '2.0' }, error: null },
    })
    const id = await getSchemaIdByIndustrySlug('eyewear', '2.0')
    expect(id).toBe('sch-5')
  })

  it('throws SchemaNotFoundError when missing', async () => {
    harness.setResponses({ industries: { data: null, error: null } })
    await expect(getSchemaIdByIndustrySlug('missing', '1.0')).rejects.toBeInstanceOf(
      SchemaNotFoundError,
    )
  })

  it('throws SchemaAccessDeniedError on permission error', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-6' }, error: null },
      semantic_schemas: { data: null, error: { code: '42501', message: 'denied' } },
    })
    await expect(getSchemaIdByIndustrySlug('eyewear', '1.0')).rejects.toBeInstanceOf(
      SchemaAccessDeniedError,
    )
  })

  it('throws SchemaQueryFailedError on a generic error', async () => {
    harness.setResponses({
      industries: { data: { id: 'ind-7' }, error: null },
      semantic_schemas: { data: null, error: { code: 'XX000', message: 'boom' } },
    })
    await expect(getSchemaIdByIndustrySlug('eyewear', '1.0')).rejects.toBeInstanceOf(
      SchemaQueryFailedError,
    )
  })
})
