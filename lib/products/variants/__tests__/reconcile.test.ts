import { describe, it, expect } from 'vitest'
import { reconcileVariantItems } from '../reconcile'
import type { VariantDraft } from '../../domain-types'

describe('Variant Reconciliation', () => {
  const defaultOptions = {
    defaultPrice: 100,
    defaultInventory: 10,
  }

  describe('preserve existing variant data', () => {
    it('should preserve price and inventory for matching keys', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
        {
          key: 'color:red_size:m',
          optionValues: { color: 'Red', size: 'M' },
          sku: 'SKU-002',
          price: 110,
          inventory: 20,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red'] },
          { name: 'Size', values: ['S', 'M'] },
        ],
        previous,
        defaultOptions
      )

      expect(result).toHaveLength(2)
      expect(result[0].price).toBe(100)
      expect(result[0].inventory).toBe(10)
      expect(result[1].price).toBe(110)
      expect(result[1].inventory).toBe(20)
    })

    it('should preserve manual SKU', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'CUSTOM-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red'] },
          { name: 'Size', values: ['S'] },
        ],
        previous,
        defaultOptions
      )

      expect(result[0].sku).toBe('CUSTOM-001')
      expect(result[0].skuSource).toBe('manual')
    })

    it('should regenerate generated SKU', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'OLD-GENERATED',
          price: 100,
          inventory: 10,
          skuSource: 'generated',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red'] },
          { name: 'Size', values: ['S'] },
        ],
        previous,
        {
          ...defaultOptions,
          generateSku: () => 'NEW-GENERATED',
        }
      )

      expect(result[0].sku).toBe('NEW-GENERATED')
      expect(result[0].skuSource).toBe('generated')
    })
  })

  describe('delete removed variants', () => {
    it('should remove variants when option is deleted', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
        {
          key: 'color:blue_size:s',
          optionValues: { color: 'Blue', size: 'S' },
          sku: 'SKU-002',
          price: 120,
          inventory: 30,
          skuSource: 'manual',
        },
        {
          key: 'color:blue_size:m',
          optionValues: { color: 'Blue', size: 'M' },
          sku: 'SKU-003',
          price: 130,
          inventory: 40,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red'] },
          { name: 'Size', values: ['S', 'M'] },
        ],
        previous,
        defaultOptions
      )

      expect(result).toHaveLength(2)
      expect(result.every((v) => v.optionValues.color === 'Red')).toBe(true)
    })
  })

  describe('add new variants', () => {
    it('should create new variants with default values', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red', 'Blue'] },
          { name: 'Size', values: ['S'] },
        ],
        previous,
        defaultOptions
      )

      expect(result).toHaveLength(2)
      expect(result[0].price).toBe(100)
      expect(result[0].inventory).toBe(10)
      expect(result[1].price).toBe(100)
      expect(result[1].inventory).toBe(10)
    })

    it('should generate SKU for new variants when provided', () => {
      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red'] },
          { name: 'Size', values: ['S'] },
        ],
        [],
        {
          ...defaultOptions,
          generateSku: () => 'GENERATED-SKU',
        }
      )

      expect(result[0].sku).toBe('GENERATED-SKU')
      expect(result[0].skuSource).toBe('generated')
    })
  })

  describe('reorder values', () => {
    it('should preserve data when values are reordered', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
        {
          key: 'color:blue_size:s',
          optionValues: { color: 'Blue', size: 'S' },
          sku: 'SKU-002',
          price: 120,
          inventory: 30,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Blue', 'Red'] },
          { name: 'Size', values: ['S'] },
        ],
        previous,
        defaultOptions
      )

      expect(result).toHaveLength(2)
      const redVariant = result.find((v) => v.optionValues.color === 'Red')
      const blueVariant = result.find((v) => v.optionValues.color === 'Blue')

      expect(redVariant?.price).toBe(100)
      expect(redVariant?.inventory).toBe(10)
      expect(blueVariant?.price).toBe(120)
      expect(blueVariant?.inventory).toBe(30)
    })
  })

  describe('reorder options', () => {
    it('should preserve data when options are reordered', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Size', values: ['S'] },
          { name: 'Color', values: ['Red'] },
        ],
        previous,
        defaultOptions
      )

      expect(result[0].price).toBe(100)
      expect(result[0].inventory).toBe(10)
    })
  })

  describe('rename values', () => {
    it('should treat renamed values as new variants', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:blue_size:s',
          optionValues: { color: 'Blue', size: 'S' },
          sku: 'SKU-002',
          price: 120,
          inventory: 30,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Green'] },
          { name: 'Size', values: ['S'] },
        ],
        previous,
        defaultOptions
      )

      expect(result).toHaveLength(1)
      expect(result[0].optionValues.color).toBe('Green')
      expect(result[0].price).toBe(100)
      expect(result[0].inventory).toBe(10)
    })
  })

  describe('whitespace normalization', () => {
    it('should match variants with whitespace differences', () => {
      const previous: VariantDraft[] = [
        {
          key: 'color:red_size:s',
          optionValues: { color: 'Red', size: 'S' },
          sku: 'SKU-001',
          price: 100,
          inventory: 10,
          skuSource: 'manual',
        },
      ]

      const result = reconcileVariantItems(
        [
          { name: 'Color', values: [' Red '] },
          { name: 'Size', values: [' S '] },
        ],
        previous,
        defaultOptions
      )

      expect(result[0].price).toBe(100)
      expect(result[0].inventory).toBe(10)
    })
  })

  describe('empty previous state', () => {
    it('should create all variants from scratch', () => {
      const result = reconcileVariantItems(
        [
          { name: 'Color', values: ['Red', 'Blue'] },
          { name: 'Size', values: ['S', 'M'] },
        ],
        [],
        defaultOptions
      )

      expect(result).toHaveLength(4)
      expect(result.every((v) => v.price === 100)).toBe(true)
      expect(result.every((v) => v.inventory === 10)).toBe(true)
    })
  })
})
