import type {
  VariantOptionInput,
  VariantCombination,
} from '@/lib/products/domain-types'

import {
  normalizeVariantOptions,
  generateVariantKey,
} from './identity'

export const DEFAULT_MAX_VARIANTS = 100

function calculateCombinationCount(
  options: ReturnType<typeof normalizeVariantOptions>,
): number {
  return options.reduce(
    (total, option) =>
      total * option.values.length,
    1,
  )
}

/**
 * Pure Cartesian Product generator.
 *
 * No React state.
 * No database.
 * No API.
 * No mutation.
 */
export function generateVariantCombinations(
  inputOptions: VariantOptionInput[],
  maxVariants = DEFAULT_MAX_VARIANTS,
): VariantCombination[] {
  if (!Array.isArray(inputOptions)) {
    throw new Error(
      'Variant options must be an array',
    )
  }

  if (
    !Number.isInteger(maxVariants) ||
    maxVariants <= 0
  ) {
    throw new Error(
      'maxVariants must be a positive integer',
    )
  }

  if (inputOptions.length === 0) {
    return []
  }

  const options =
    normalizeVariantOptions(inputOptions)

  const total =
    calculateCombinationCount(options)

  if (total > maxVariants) {
    throw new Error(
      `Too many variants: ${total}. Maximum allowed is ${maxVariants}.`,
    )
  }

  let combinations: Array<
    Record<string, string>
  > = [{}]

  for (const option of options) {
    const next: Array<
      Record<string, string>
    > = []

    for (const current of combinations) {
      for (const displayValue of option.values) {
        next.push({
          ...current,
          [option.code]: displayValue,
        })
      }
    }

    combinations = next
  }

  return combinations.map(
    (optionValues) => ({
      key: generateVariantKey(optionValues),
      optionValues,
    }),
  )
}
