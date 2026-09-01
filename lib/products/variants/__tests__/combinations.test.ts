import { describe, it, expect } from 'vitest'
import { generateVariantCombinations } from '../combinations'

describe('Cartesian Product', () => {
  it('should generate 2x2 = 4 combinations', () => {
    const result = generateVariantCombinations([
      { name: 'Color', values: ['Red', 'Blue'] },
      { name: 'Size', values: ['S', 'M'] },
    ])

    expect(result).toHaveLength(4)
    expect(result.map((r) => r.key)).toEqual([
      'color:red_size:s',
      'color:red_size:m',
      'color:blue_size:s',
      'color:blue_size:m',
    ])
  })

  it('should generate 2x3 = 6 combinations', () => {
    const result = generateVariantCombinations([
      { name: 'Color', values: ['Red', 'Blue'] },
      { name: 'Size', values: ['S', 'M', 'L'] },
    ])

    expect(result).toHaveLength(6)
  })

  it('should generate 1x1 = 1 combination', () => {
    const result = generateVariantCombinations([
      { name: 'Color', values: ['Red'] },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('color:red')
  })

  it('should return empty array for no options', () => {
    const result = generateVariantCombinations([])
    expect(result).toEqual([])
  })

  it('should throw on combination > 100', () => {
    expect(() =>
      generateVariantCombinations([
        { name: 'Color', values: Array.from({ length: 11 }, (_, i) => `Color${i}`) },
        { name: 'Size', values: Array.from({ length: 10 }, (_, i) => `Size${i}`) },
      ])
    ).toThrow('Too many variants: 110')
  })

  it('should respect custom maxVariants', () => {
    const result = generateVariantCombinations(
      [
        { name: 'Color', values: ['Red', 'Blue'] },
        { name: 'Size', values: ['S', 'M', 'L'] },
      ],
      10
    )

    expect(result).toHaveLength(6)
  })

  it('should throw on custom maxVariants exceeded', () => {
    expect(() =>
      generateVariantCombinations(
        [
          { name: 'Color', values: ['Red', 'Blue'] },
          { name: 'Size', values: ['S', 'M', 'L'] },
        ],
        5
      )
    ).toThrow('Too many variants: 6')
  })

  it('should throw on invalid maxVariants', () => {
    expect(() => generateVariantCombinations([], 0)).toThrow('maxVariants must be a positive integer')
    expect(() => generateVariantCombinations([], -1)).toThrow('maxVariants must be a positive integer')
    expect(() => generateVariantCombinations([], 1.5)).toThrow('maxVariants must be a positive integer')
  })

  it('should throw on non-array input', () => {
    expect(() => generateVariantCombinations(null as any)).toThrow('Variant options must be an array')
  })

  it('should preserve display values in optionValues', () => {
    const result = generateVariantCombinations([
      { name: 'Color', values: ['Red', 'Dark Blue'] },
      { name: 'Size', values: ['S', 'M'] },
    ])

    expect(result[0].optionValues).toEqual({ color: 'Red', size: 'S' })
  })

  it('should generate stable keys regardless of option order', () => {
    const result1 = generateVariantCombinations([
      { name: 'Color', values: ['Red'] },
      { name: 'Size', values: ['M'] },
    ])

    const result2 = generateVariantCombinations([
      { name: 'Size', values: ['M'] },
      { name: 'Color', values: ['Red'] },
    ])

    expect(result1[0].key).toBe(result2[0].key)
  })
})
