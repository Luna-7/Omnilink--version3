/**
 * P0 Stabilization Tests for createProductWithVariants (Phase 2 — atomic create)
 *
 * See PRODUCT_VARIANT_FLOW_REPORT.md (2026-08-26) and the P0 task brief.
 *
 * Phase 2 replaced the multi-step, compensation-rollback orchestration with a
 * single DB transaction via the `create_product_atomic` SECURITY INVOKER RPC.
 * The option/variant *combination* logic stays in the application layer (and is
 * still unit-tested here); ALL inserts happen in one `supabase.rpc` call, so the
 * database guarantees atomicity (no orphan rows).
 *
 * These tests verify:
 *   1. Single-SKU product creation succeeds (one rpc call, 0 options/variants).
 *   2. The rpc `p_product` payload does NOT include (non-existent) `category` /
 *      `category_id` top-level columns; they live under raw_data.
 *   3. One option with N values produces exactly N variants in p_variants.
 *   4. Two options produce the full Cartesian product (no duplicates) in p_variants.
 *   5. An rpc error (e.g. duplicate SKU) surfaces as a clear failure (no silent success).
 *   6. The whole create is a SINGLE atomic rpc call — a failure leaves no committed
 *      product and reports failure (no partial state possible).
 *   7. `raw_data.options` is ignored; only `input.options` drive creation.
 *   8. Origin is stored on `raw_data.origin`; no fake `compositions` table is touched.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mocks (run before module imports)
// ---------------------------------------------------------------------------

const stub = vi.hoisted(() => {
  type RpcCall = { name: string; params: Record<string, unknown> }
  const rpcCalls: RpcCall[] = []
  let nextRpcResult: { data: unknown; error: unknown } = {
    data: { success: true, product_id: 'mock-prod-1', options_created: 0, variants_created: 0 },
    error: null,
  }

  const supabase = {
    rpc(name: string, params: Record<string, unknown>) {
      rpcCalls.push({ name, params })
      return Promise.resolve(nextRpcResult)
    },
  }

  return {
    supabase,
    rpcCalls,
    setNextRpcResult(r: { data: unknown; error: unknown }) {
      nextRpcResult = r
    },
    reset() {
      rpcCalls.length = 0
      nextRpcResult = {
        data: { success: true, product_id: 'mock-prod-1', options_created: 0, variants_created: 0 },
        error: null,
      }
    },
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClientServer: async () => stub.supabase,
}))

// Now safe to import the service under test (after mocks are registered)
import { createProductWithVariants } from '../product-with-variants-service'

describe('createProductWithVariants (Phase 2 — atomic create)', () => {
  beforeEach(() => {
    stub.reset()
  })

  // -------------------------------------------------------------------------
  // Test 1
  // -------------------------------------------------------------------------
  it('Test 1: single-SKU product creation succeeds with exactly one atomic rpc call', async () => {
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'Single SKU T-Shirt',
      sku: 'TS-S1',
      price: 19.99,
      currency: 'USD',
      inventory: 50,
    })

    expect(result.success).toBe(true)
    expect(result.productId).toBe('mock-prod-1')
    expect(result.optionsCreated).toBe(0)
    expect(result.variantsCreated).toBe(0)

    // The entire create is ONE rpc call (atomic transaction).
    expect(stub.rpcCalls).toHaveLength(1)
    expect(stub.rpcCalls[0].name).toBe('create_product_atomic')
    const params = stub.rpcCalls[0].params as { p_store_id: string; p_options: unknown[]; p_variants: unknown[] }
    expect(params.p_store_id).toBe('store-1')
    expect(params.p_options).toHaveLength(0)
    expect(params.p_variants).toHaveLength(0)
  })

  // -------------------------------------------------------------------------
  // Test 2 — the actual P0 runtime bug fix verification
  // -------------------------------------------------------------------------
  it('Test 2: rpc p_product payload does NOT include category / category_id top-level columns', async () => {
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'Eyewear',
      sku: 'EW-1',
      price: 99,
      category: 'eyewear',
      category_id: 'cat-eyewear-1',
      raw_data: { category: 'eyewear', category_id: 'cat-eyewear-1' },
    })

    expect(result.success).toBe(true)
    const params = stub.rpcCalls[0].params as { p_product: Record<string, unknown> }

    // The forbidden columns must NOT appear as top-level keys on p_product.
    expect(params.p_product).not.toHaveProperty('category')
    expect(params.p_product).not.toHaveProperty('category_id')

    // Category compatibility must still live under raw_data.
    expect(params.p_product.raw_data).toMatchObject({
      category: 'eyewear',
      category_id: 'cat-eyewear-1',
    })
  })

  // -------------------------------------------------------------------------
  // Test 3
  // -------------------------------------------------------------------------
  it('Test 3: one option with N values generates exactly N variants', async () => {
    stub.setNextRpcResult({
      data: { success: true, product_id: 'mock-prod-1', options_created: 1, variants_created: 2 },
      error: null,
    })
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'Cap',
      sku: 'CAP-1',
      price: 25,
      options: [
        { name: 'Color', code: 'color', values: ['Black', 'White'] },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.optionsCreated).toBe(1)
    expect(result.variantsCreated).toBe(2)

    const params = stub.rpcCalls[0].params as { p_options: unknown[]; p_variants: unknown[] }
    expect(params.p_options).toHaveLength(1)
    expect(params.p_variants).toHaveLength(2)

    // Deterministic SKU generation: CAP-1 + lowercase key prefix + uppercase value prefix
    const skus = (params.p_variants as Array<{ sku: string }>).map(v => v.sku).sort()
    expect(skus).toEqual(['CAP-1-col-BLA', 'CAP-1-col-WHI'])
  })

  // -------------------------------------------------------------------------
  // Test 4
  // -------------------------------------------------------------------------
  it('Test 4: two options generate the Cartesian product (no duplicates)', async () => {
    stub.setNextRpcResult({
      data: { success: true, product_id: 'mock-prod-1', options_created: 2, variants_created: 4 },
      error: null,
    })
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-2',
      price: 20,
      options: [
        { name: 'Color', code: 'color', values: ['Black', 'White'] },
        { name: 'Size', code: 'size', values: ['S', 'M'] },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.optionsCreated).toBe(2)
    expect(result.variantsCreated).toBe(4)

    const params = stub.rpcCalls[0].params as { p_variants: Array<{ option_values: Record<string, string> }> }
    const combos = params.p_variants.map(v => JSON.stringify(v.option_values))
    const unique = new Set(combos)
    expect(unique.size).toBe(4)

    expect(combos).toContain(JSON.stringify({ color: 'Black', size: 'S' }))
    expect(combos).toContain(JSON.stringify({ color: 'Black', size: 'M' }))
    expect(combos).toContain(JSON.stringify({ color: 'White', size: 'S' }))
    expect(combos).toContain(JSON.stringify({ color: 'White', size: 'M' }))
  })

  // -------------------------------------------------------------------------
  // Test 5 — duplicate SKU surfaces as a clear failure (no silent success)
  // -------------------------------------------------------------------------
  it('Test 5: rpc error (duplicate SKU) surfaces as a clear failure', async () => {
    stub.setNextRpcResult({
      data: null,
      error: { message: 'SKU already exists in this store' },
    })

    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-DUP',
      price: 20,
      options: [{ name: 'Color', code: 'color', values: ['Red'] }],
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/SKU already exists/)
    // No product id is returned on failure.
    expect(result.productId).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Test 6 — atomic guarantee: a single rpc attempt, failure leaves nothing.
  // -------------------------------------------------------------------------
  it('Test 6: a mid-flow failure is a single atomic attempt — no partial state, reported as failure', async () => {
    stub.setNextRpcResult({
      data: null,
      error: { message: 'Variant creation failed inside the transaction' },
    })

    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-PF',
      price: 20,
      options: [{ name: 'Color', code: 'color', values: ['A', 'B'] }],
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Variant creation failed/)

    // Exactly one atomic rpc call — there is no sequential insert/compensation
    // dance, so a failure cannot leave orphan rows committed.
    expect(stub.rpcCalls).toHaveLength(1)
    expect(stub.rpcCalls[0].params).toHaveProperty('p_variants')
    expect(result.productId).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Test 7
  // -------------------------------------------------------------------------
  it('Test 7: raw_data.options is NOT used as source of truth (only input.options drives creation)', async () => {
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-RD',
      price: 20,
      // Legacy / decoy blob. The new flow must NOT consult raw_data.options.
      raw_data: {
        options: [
          { name: 'FakeColor', code: 'fake', values: ['Red', 'Green', 'Blue'] },
        ],
      },
      options: [{ name: 'Color', code: 'color', values: ['Black'] }],
    })

    expect(result.success).toBe(true)
    const params = stub.rpcCalls[0].params as { p_options: Array<{ name: string; code: string; values: string[] }> }
    expect(params.p_options).toHaveLength(1)

    // Only the real option was passed to the rpc.
    const createdOption = params.p_options[0]
    expect(createdOption.name).toBe('Color')
    expect(createdOption.code).toBe('color')
    expect(createdOption.values).toEqual(['Black'])
    expect(createdOption.name).not.toBe('FakeColor')
  })

  // -------------------------------------------------------------------------
  // Test 8
  // -------------------------------------------------------------------------
  it('Test 8: origin is stored in raw_data; no fake "compositions" table is touched', async () => {
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'Coffee',
      sku: 'CF-1',
      price: 5,
      origin: 'China',
      raw_data: { origin: 'China' },
    })

    expect(result.success).toBe(true)
    // Only the atomic rpc is used — no direct table writes at all.
    expect(stub.rpcCalls).toHaveLength(1)

    const params = stub.rpcCalls[0].params as { p_product: { raw_data?: Record<string, unknown> } }
    expect(params.p_product.raw_data?.origin).toBe('China')
  })
})
