/**
 * Trusted server-only writer for `semantic_unknown_fields`.
 *
 * Trust boundary (P0 fix, 2026-08-31):
 *   `semantic_unknown_fields` lives in the SERVICE_ROLE_ONLY RLS group, so the
 *   merchant session client cannot write it. Previously `saveCanonicalProductAttributes`
 *   called `saveUnknownFields` with the session client and the write was silently
 *   dropped by RLS (no error surfaced, unknown fields simply never persisted).
 *
 *   This module is the ONLY sanctioned writer. It reuses the single canonical
 *   service-role client (`createServiceRoleClient`) and MUST be invoked ONLY from
 *   server-side code that has ALREADY verified product ownership
 *   (requireUser() + ownsProduct / an RLS-scoped product read).
 *
 * It does NOT:
 *   - perform authentication,
 *   - perform merchant authorization,
 *   - discover ownership.
 *
 * The caller is responsible for all of the above. This module receives an
 * already-authorized product identity and performs only the necessary INSERT.
 * The service-role client is never exposed to the business layer.
 */

import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type UnknownFieldInput = {
  raw_field: string
  raw_value: unknown
  reason: string
}

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'saveUnknownFieldsTrusted() was invoked in a browser/client context. ' +
        'It must only be called from trusted server-side code after product ' +
        'ownership has been verified.',
    )
  }
}

export async function saveUnknownFieldsTrusted(
  productId: string,
  schemaId: string,
  unknownFields: Array<UnknownFieldInput>,
): Promise<void> {
  assertServerOnly()

  if (unknownFields.length === 0) return

  const supabase = createServiceRoleClient()

  const { error } = await supabase
    .from('semantic_unknown_fields')
    .insert(
      unknownFields.map((field) => ({
        product_id: productId,
        schema_id: schemaId,
        raw_field: field.raw_field,
        raw_value: field.raw_value as Record<string, unknown>,
        reason: field.reason,
        status: 'pending',
      })),
    )

  if (error) {
    // Unknown fields are non-critical metadata. Mirror the prior behaviour of
    // logging without throwing so the parent product creation still succeeds.
    console.error(
      `[saveUnknownFieldsTrusted] Failed to persist unknown fields for product ${productId}: ${error.message}`,
    )
  }
}
