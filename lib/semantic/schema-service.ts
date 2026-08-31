/**
 * Trusted, server-only semantic schema reader.
 *
 * Reads SERVICE_ROLE_ONLY `semantic_schemas` via the privileged service-role
 * client (lib/supabase/service-role). It is the ONLY sanctioned way for
 * backend code to resolve an industry → schema mapping.
 *
 * This module does NOT:
 *   - perform any merchant authorization (no user / store / product ownership)
 *   - accept an owner_id or any caller-supplied identity
 *   - auto-create schemas or products
 *   - return fake / placeholder schemas
 *
 * Errors are explicit and distinguishable (see exported error classes), so
 * callers can map them to precise client responses instead of guessing.
 */
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type SchemaResolution =
  | { found: true; schemaId: string; version: string }
  | {
      found: false
      reason: 'not_found' | 'access_denied' | 'query_failed'
      detail?: string
    }

export class SchemaNotFoundError extends Error {
  constructor(
    public readonly industrySlug: string,
    public readonly version: string,
  ) {
    super(`Semantic schema not found for industry "${industrySlug}" (version ${version})`)
    this.name = 'SchemaNotFoundError'
  }
}

export class SchemaAccessDeniedError extends Error {
  constructor(public readonly detail?: string) {
    super('Access denied while resolving semantic schema')
    this.name = 'SchemaAccessDeniedError'
  }
}

export class SchemaQueryFailedError extends Error {
  constructor(public readonly detail?: string) {
    super('Semantic schema query failed')
    this.name = 'SchemaQueryFailedError'
  }
}

function isPermissionError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const msg = (error.message ?? '').toLowerCase()
  return (
    error.code === '42501' ||
    msg.includes('permission') ||
    msg.includes('denied') ||
    msg.includes('policy')
  )
}

/**
 * Resolve a semantic schema by industry slug + version using the trusted
 * service-role client. Never throws for "not found"; returns a discriminated
 * result so callers can branch (e.g. fall back to a default industry).
 */
export async function resolveSchemaByIndustrySlug(
  industrySlug: string,
  version = '1.0',
): Promise<SchemaResolution> {
  const slug = String(industrySlug ?? '').trim().toLowerCase()
  const ver = String(version ?? '1.0').trim()

  if (!slug) {
    return { found: false, reason: 'not_found' }
  }

  const supabase = createServiceRoleClient()

  // Resolve the industry id first. `industries` is a reference table; we read
  // it through the trusted client for consistency and to avoid any RLS drift.
  const { data: industryRow, error: industryError } = await supabase
    .from('industries')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (industryError) {
    if (isPermissionError(industryError)) {
      return { found: false, reason: 'access_denied', detail: industryError.message }
    }
    return { found: false, reason: 'query_failed', detail: industryError.message }
  }

  if (!industryRow) {
    return { found: false, reason: 'not_found' }
  }

  const { data, error } = await supabase
    .from('semantic_schemas')
    .select('id, version')
    .eq('industry_id', industryRow.id)
    .eq('version', ver)
    .maybeSingle()

  if (error) {
    if (isPermissionError(error)) {
      return { found: false, reason: 'access_denied', detail: error.message }
    }
    return { found: false, reason: 'query_failed', detail: error.message }
  }

  if (!data) {
    return { found: false, reason: 'not_found' }
  }

  return { found: true, schemaId: data.id, version: data.version }
}

/**
 * Resolve a schema and return its id, throwing a precise error on failure.
 * Use this when a missing schema is a hard error (e.g. merchant product
 * creation). For graceful fallback, use resolveSchemaByIndustrySlug instead.
 */
export async function getSchemaIdByIndustrySlug(
  industrySlug: string,
  version = '1.0',
): Promise<string> {
  const result = await resolveSchemaByIndustrySlug(industrySlug, version)
  if (result.found) return result.schemaId
  if (result.reason === 'access_denied') throw new SchemaAccessDeniedError(result.detail)
  if (result.reason === 'query_failed') throw new SchemaQueryFailedError(result.detail)
  throw new SchemaNotFoundError(industrySlug, version)
}
