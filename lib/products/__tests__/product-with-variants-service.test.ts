/**
 * P0 Stabilization Tests for createProductWithVariants
 *
 * See PRODUCT_VARIANT_FLOW_REPORT.md (2026-08-26) and the P0 task brief.
 * These tests verify:
 *   1. Single-SKU product creation succeeds.
 *   2. Product insert does NOT include the (non-existent) `category` /
 *      `category_id` top-level columns.
 *   3. One option with N values generates exactly N variants.
 *   4. Two options generate the full Cartesian product without duplicates.
 *   5. Duplicate SKU surfaces as a clear failure (no silent success).
 *   6. Partial variant failure triggers compensation rollback and is reported.
 *   7. `raw_data.options` is ignored; only `input.options` drive creation.
 *   8. Origin is stored on `raw_data.origin`; no fake `compositions` table is touched.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Hoisted mocks (run before module imports)
// ---------------------------------------------------------------------------

const stub = vi.hoisted(() => {
  type Call = { table: string; method: string; payload?: unknown }
  const calls: Call[] = []
  let nextResult: { data: unknown; error: unknown } = { data: null, error: null }

  // A reusable thenable chainable builder. Each `from()` returns a fresh builder
  // whose current table is tracked on `_table`. Inserts capture the payload and
  // produce a fake row containing the payload + a generated id.
  const builder: any = {
    _table: '' as string,
    then(resolve: (v: unknown) => void, _reject?: (e: unknown) => void) {
      resolve(nextResult)
    },
    insert(payload: unknown) {
      calls.push({ table: builder._table, method: 'insert', payload })
      const id = `mock-${builder._table}-${calls.length}`
      nextResult = { data: { id, ...((payload as object) || {}) }, error: null }
      return builder
    },
    select() { return builder },
    single() { return builder },
    maybeSingle() { return builder },
    delete() {
      calls.push({ table: builder._table, method: 'delete' })
      nextResult = { data: null, error: null }
      return builder
    },
    eq(key: string, val: unknown) {
      calls.push({ table: builder._table, method: 'eq', payload: { [key]: val } })
      return builder
    },
    in(_key: string, _vals: unknown[]) { return builder },
    order() { return builder },
    limit() { return builder },
  }

  const supabase = {
    from(table: string) {
      builder._table = table
      return builder
    },
  }

  return { supabase, calls, getNextResult: () => nextResult }
})

vi.mock('@/lib/supabase/server', () => ({
  createClientServer: async () => stub.supabase,
}))

const variantServiceMock = vi.hoisted(() => {
  const optionCalls: Array<{ productId: string; input: unknown }> = []
  const variantCalls: Array<{ productId: string; input: unknown }> = []
  let allVariantsError: Error | null = null
  let failOnVariantCallIndex: number | null = null
  return {
    optionCalls,
    variantCalls,
    setAllVariantsError(e: Error | null) { allVariantsError = e },
    setFailOnVariantCallIndex(i: number | null) { failOnVariantCallIndex = i },
    createProductOption: async (productId: string, input: unknown) => {
      optionCalls.push({ productId, input })
      return {
        id: `mock-option-${optionCalls.length}`,
        product_id: productId,
        name: (input as { name: string }).name,
        code: (input as { code: string }).code,
        position: 0,
        values: (input as { values: string[] }).values,
        created_at: '2026-08-26T00:00:00Z',
      }
    },
    createProductVariant: async (productId: string, input: unknown) => {
      variantCalls.push({ productId, input })
      if (allVariantsError) throw allVariantsError
      if (failOnVariantCallIndex !== null && variantCalls.length === failOnVariantCallIndex) {
        throw new Error(`Variant creation failed on call #${failOnVariantCallIndex}`)
      }
      return {
        id: `mock-variant-${variantCalls.length}`,
        product_id: productId,
        sku: (input as { sku?: string }).sku ?? null,
        price: (input as { price?: number }).price ?? null,
        currency: (input as { currency?: string }).currency ?? 'USD',
        inventory: (input as { inventory?: number }).inventory ?? null,
        status: (input as { status?: string }).status ?? 'draft',
        option_values: (input as { option_values: Record<string, string> }).option_values,
        raw_data: null,
        semantic_data: null,
        created_at: '2026-08-26T00:00:00Z',
        updated_at: '2026-08-26T00:00:00Z',
      }
    },
  }
})

vi.mock('@/lib/products/variants/service', () => variantServiceMock)

// Now safe to import the service under test (after mocks are registered)
import { createProductWithVariants } from '../product-with-variants-service'

describe('createProductWithVariants (P0 stabilization)', () => {
  beforeEach(() => {
    stub.calls.length = 0
    variantServiceMock.optionCalls.length = 0
    variantServiceMock.variantCalls.length = 0
    variantServiceMock.setAllVariantsError(null)
    variantServiceMock.setFailOnVariantCallIndex(null)
  })

  // -------------------------------------------------------------------------
  // Test 1
  // -------------------------------------------------------------------------
  it('Test 1: single-SKU product creation succeeds without options', async () => {
    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'Single SKU T-Shirt',
      sku: 'TS-S1',
      price: 19.99,
      currency: 'USD',
      inventory: 50,
    })

    expect(result.success).toBe(true)
    expect(result.productId).toMatch(/^mock-products-/)
    expect(result.optionsCreated).toBe(0)
    expect(result.variantsCreated).toBe(0)

    // Only one insert (products) and zero createProductOption/createProductVariant calls
    const productInserts = stub.calls.filter(c => c.table === 'products' && c.method === 'insert')
    expect(productInserts).toHaveLength(1)
    expect(variantServiceMock.optionCalls).toHaveLength(0)
    expect(variantServiceMock.variantCalls).toHaveLength(0)
  })

  // -------------------------------------------------------------------------
  // Test 2 — the actual P0 runtime bug fix verification
  // -------------------------------------------------------------------------
  it('Test 2: product insert does NOT include category / category_id top-level columns', async () => {
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
    const insertCall = stub.calls.find(c => c.table === 'products' && c.method === 'insert')
    expect(insertCall).toBeDefined()
    const payload = insertCall!.payload as Record<string, unknown>

    // The forbidden columns must NOT appear as top-level keys
    expect(payload).not.toHaveProperty('category')
    expect(payload).not.toHaveProperty('category_id')

    // Category compatibility must still live under raw_data
    expect(payload.raw_data).toMatchObject({
      category: 'eyewear',
      category_id: 'cat-eyewear-1',
    })
  })

  // -------------------------------------------------------------------------
  // Test 3
  // -------------------------------------------------------------------------
  it('Test 3: one option with N values generates exactly N variants', async () => {
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
    expect(variantServiceMock.optionCalls).toHaveLength(1)
    expect(variantServiceMock.variantCalls).toHaveLength(2)

    // Deterministic SKU generation: CAP-1 + lowercase key prefix + uppercase value prefix
    const skus = variantServiceMock.variantCalls.map(c => (c.input as { sku: string }).sku).sort()
    expect(skus).toEqual(['CAP-1-col-BLA', 'CAP-1-col-WHI'])
  })

  // -------------------------------------------------------------------------
  // Test 4
  // -------------------------------------------------------------------------
  it('Test 4: two options generate the Cartesian product (no duplicates)', async () => {
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

    const combos = variantServiceMock.variantCalls.map(c =>
      JSON.stringify((c.input as { option_values: Record<string, string> }).option_values),
    )
    const unique = new Set(combos)
    expect(unique.size).toBe(4)

    expect(combos).toContain(JSON.stringify({ color: 'Black', size: 'S' }))
    expect(combos).toContain(JSON.stringify({ color: 'Black', size: 'M' }))
    expect(combos).toContain(JSON.stringify({ color: 'White', size: 'S' }))
    expect(combos).toContain(JSON.stringify({ color: 'White', size: 'M' }))
  })

  // -------------------------------------------------------------------------
  // Test 5
  // -------------------------------------------------------------------------
  it('Test 5: duplicate SKU surfaces as a clear failure (no silent success)', async () => {
    variantServiceMock.setAllVariantsError(new Error('SKU already exists in this store'))

    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-DUP',
      price: 20,
      options: [{ name: 'Color', code: 'color', values: ['Red'] }],
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/SKU already exists/)
    // Product should NOT have a productId on failure
    expect(result.productId).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Test 6 — partial failure must surface, not be swallowed
  // -------------------------------------------------------------------------
  it('Test 6: partial variant failure triggers compensation and reports failure (never silent success)', async () => {
    // First variant succeeds, second throws — classic mid-flow failure.
    variantServiceMock.setFailOnVariantCallIndex(2)

    const result = await createProductWithVariants({
      store_id: 'store-1',
      name: 'T-Shirt',
      sku: 'TS-PF',
      price: 20,
      options: [{ name: 'Color', code: 'color', values: ['A', 'B'] }],
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Variant creation failed on call #2/)

    // Compensation must have been attempted for at least: 1 variant + 1 option + 1 product.
    const deleteCalls = stub.calls.filter(c => c.method === 'delete')
    const deletedTables = new Set(deleteCalls.map(c => c.table))
    expect(deletedTables.has('product_variants')).toBe(true)
    expect(deletedTables.has('product_options')).toBe(true)
    expect(deletedTables.has('products')).toBe(true)
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
    expect(variantServiceMock.optionCalls).toHaveLength(1)
    expect(variantServiceMock.variantCalls).toHaveLength(1)

    // Only the real option was created
    const createdOption = variantServiceMock.optionCalls[0].input as { name: string; code: string; values: string[] }
    expect(createdOption.name).toBe('Color')
    expect(createdOption.code).toBe('color')
    expect(createdOption.values).toEqual(['Black'])

    // No 'FakeColor' option ever reached createProductOption
    const allOptionNames = variantServiceMock.optionCalls.map(c => (c.input as { name: string }).name)
    expect(allOptionNames).not.toContain('FakeColor')
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
    const tablesTouched = new Set(stub.calls.map(c => c.table))
    // The orchestration service must NEVER write to a fake composition table.
    expect(tablesTouched.has('compositions')).toBe(false)
    expect(tablesTouched.has('product_composition')).toBe(false)
    expect(tablesTouched.has('product_compositions')).toBe(false)
    // Only the products table is touched for a single-SKU product.
    expect([...tablesTouched]).toEqual(['products'])

    const insertCall = stub.calls.find(c => c.table === 'products' && c.method === 'insert')
    const payload = insertCall!.payload as { raw_data?: Record<string, unknown> }
    expect(payload.raw_data?.origin).toBe('China')
  })
})