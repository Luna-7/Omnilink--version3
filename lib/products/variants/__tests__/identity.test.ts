import { describe, it, expect } from 'vitest'
import {
  normalizeOptionCode,
  normalizeOptionValue,
  normalizeVariantOptions,
  generateVariantKey,
} from '../identity'

describe('Variant Identity', () => {
  describe('normalizeOptionCode', () => {
    it('should convert simple names to lowercase codes', () => {
      expect(normalizeOptionCode('Color')).toBe('color')
      expect(normalizeOptionCode('SIZE')).toBe('size')
    })

    it('should trim whitespace', () => {
      expect(normalizeOptionCode(' Color ')).toBe('color')
      expect(normalizeOptionCode('  Product Color  ')).toBe('product_color')
    })

    it('should replace spaces with underscores', () => {
      expect(normalizeOptionCode('Product Color')).toBe('product_color')
      expect(normalizeOptionCode('Size Option')).toBe('size_option')
    })

    it('should preserve non-Latin characters', () => {
      expect(normalizeOptionCode('颜色')).toBe('颜色')
      expect(normalizeOptionCode('尺码')).toBe('尺码')
    })

    it('should remove special characters', () => {
      expect(normalizeOptionCode('Color!')).toBe('color')
      expect(normalizeOptionCode('Size@#')).toBe('size')
    })

    it('should throw on empty string', () => {
      expect(() => normalizeOptionCode('')).toThrow('Variant option name cannot be empty')
      expect(() => normalizeOptionCode('   ')).toThrow('Variant option name cannot be empty')
    })

    it('should throw on non-string input', () => {
      expect(() => normalizeOptionCode(null as any)).toThrow('Variant option name must be a string')
      expect(() => normalizeOptionCode(undefined as any)).toThrow('Variant option name must be a string')
    })
  })

  describe('normalizeOptionValue', () => {
    it('should convert values to lowercase for identity', () => {
      expect(normalizeOptionValue('Red')).toBe('red')
      expect(normalizeOptionValue('M')).toBe('m')
    })

    it('should trim whitespace', () => {
      expect(normalizeOptionValue(' Red ')).toBe('red')
    })

    it('should replace spaces with underscores', () => {
      expect(normalizeOptionValue('Dark Blue')).toBe('dark_blue')
    })

    it('should preserve non-Latin characters', () => {
      expect(normalizeOptionValue('黑色')).toBe('黑色')
    })

    it('should throw on empty string', () => {
      expect(() => normalizeOptionValue('')).toThrow('Variant option value cannot be empty')
    })

    it('should throw on non-string input', () => {
      expect(() => normalizeOptionValue(null as any)).toThrow('Variant option value must be a string')
    })
  })

  describe('normalizeVariantOptions', () => {
    it('should normalize valid options', () => {
      const result = normalizeVariantOptions([
        { name: 'Color', values: ['Red', 'Blue'] },
        { name: 'Size', values: ['S', 'M'] },
      ])

      expect(result).toEqual([
        { code: 'color', name: 'Color', values: ['Red', 'Blue'] },
        { code: 'size', name: 'Size', values: ['S', 'M'] },
      ])
    })

    it('should throw on duplicate option codes', () => {
      expect(() =>
        normalizeVariantOptions([
          { name: 'Color', values: ['Red'] },
          { name: 'color', values: ['Blue'] },
        ])
      ).toThrow('Duplicate variant option')
    })

    it('should throw on duplicate normalized values', () => {
      expect(() =>
        normalizeVariantOptions([
          { name: 'Color', values: ['Red', 'red', ' RED '] },
        ])
      ).toThrow('Duplicate value')
    })

    it('should throw on empty option name', () => {
      expect(() =>
        normalizeVariantOptions([
          { name: '', values: ['Red'] },
        ])
      ).toThrow('Variant option name cannot be empty')
    })

    it('should throw on empty values array', () => {
      expect(() =>
        normalizeVariantOptions([
          { name: 'Color', values: [] },
        ])
      ).toThrow('must contain at least one value')
    })

    it('should throw on empty value in array', () => {
      expect(() =>
        normalizeVariantOptions([
          { name: 'Color', values: ['Red', ''] },
        ])
      ).toThrow('contains an empty value')
    })

    it('should preserve display values while normalizing for identity', () => {
      const result = normalizeVariantOptions([
        { name: 'Color', values: ['Red', 'Dark Blue'] },
      ])

      expect(result[0].values).toEqual(['Red', 'Dark Blue'])
    })

    it('should throw on non-array input', () => {
      expect(() => normalizeVariantOptions(null as any)).toThrow('Variant options must be an array')
    })
  })

  describe('generateVariantKey', () => {
    it('should generate stable keys regardless of option order', () => {
      const key1 = generateVariantKey({ color: 'Red', size: 'M' })
      const key2 = generateVariantKey({ size: 'M', color: 'Red' })

      expect(key1).toBe(key2)
      expect(key1).toBe('color:red_size:m')
    })

    it('should normalize option codes and values', () => {
      const key = generateVariantKey({ Color: 'Red', Size: 'M' })
      expect(key).toBe('color:red_size:m')
    })

    it('should handle single option', () => {
      const key = generateVariantKey({ color: 'Red' })
      expect(key).toBe('color:red')
    })

    it('should handle multiple options', () => {
      const key = generateVariantKey({ color: 'Red', size: 'M', material: 'Cotton' })
      expect(key).toBe('color:red_material:cotton_size:m')
    })

    it('should throw on empty object', () => {
      expect(() => generateVariantKey({})).toThrow('Variant must contain at least one option value')
    })

    it('should handle whitespace in values', () => {
      const key = generateVariantKey({ color: ' Red ', size: ' M ' })
      expect(key).toBe('color:red_size:m')
    })
  })
})
