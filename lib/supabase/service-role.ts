/**
 * Server-only trusted Supabase client (service role).
 *
 * SECURITY BOUNDARY — read before using:
 *   - This client uses SUPABASE_SERVICE_ROLE_KEY and BYPASSES Row Level Security.
 *   - It MUST only be used for internal, system-trusted reads of SERVICE_ROLE_ONLY
 *     reference data (e.g. `semantic_schemas`). It must NEVER be used to:
 *       * resolve user identity (requireUser / auth)
 *       * authorize merchant requests (ownsStore / ownsProduct)
 *       * perform merchant-data CRUD (products / product_semantics writes)
 *   - It must not be imported by any client component or browser bundle.
 *   - Authorization (requireUser + ownership checks) must ALWAYS complete
 *     BEFORE any privileged read is invoked.
 *
 * `server-only` is not installed in this project, so we additionally guard at
 * runtime: calling this in a browser/client context throws immediately.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'createServiceRoleClient() was invoked in a browser/client context. ' +
        'The service-role client must never be bundled or executed on the client.',
    )
  }
}

let cachedClient: SupabaseClient | null = null

export function createServiceRoleClient(): SupabaseClient {
  assertServerOnly()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Service-role client is not configured: missing ' +
        'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return cachedClient
}
