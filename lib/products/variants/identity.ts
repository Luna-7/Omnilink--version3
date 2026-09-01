import type {
  VariantOptionInput,
} from '@/lib/products/domain-types'

export type NormalizedVariantOption = {
  code: string
  name: string
  values: string[]
}

/**
 * Converts an option display name into a stable internal code.
 *
 * Examples:
 * "Color"           -> "color"
 * " Product Color " -> "product_color"
 * "颜色"             -> "颜色"
 */
export function normalizeOptionCode(name: string): string {
  if (typeof name !== 'string') {
    throw new Error('Variant option name must be a string')
  }

  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '')

  if (!normalized) {
    throw new Error('Variant option name cannot be empty')
  }

  return normalized
}

/**
 * Normalizes an option value only for identity generation.
 *
 * IMPORTANT:
 * The returned normalized value must NOT replace
 * the merchant-facing display value.
 */
export function normalizeOptionValue(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('Variant option value must be a string')
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '')

  if (!normalized) {
    throw new Error('Variant option value cannot be empty')
  }

  return normalized
}

/**
 * Normalize and validate merchant-provided options.
 *
 * IMPORTANT:
 * - option.code is NEVER accepted from client input
 * - code is always derived from name
 * - original display values are preserved
 * - input is not mutated
 */
export function normalizeVariantOptions(
  input: VariantOptionInput[],
): NormalizedVariantOption[] {
  if (!Array.isArray(input)) {
    throw new Error('Variant options must be an array')
  }

  const seenCodes = new Set<string>()

  return input.map((option) => {
    if (!option || typeof option !== 'object') {
      throw new Error('Invalid variant option')
    }

    const name = option.name.trim()

    if (!name) {
      throw new Error('Variant option name cannot be empty')
    }

    const code = normalizeOptionCode(name)

    if (seenCodes.has(code)) {
      throw new Error(`Duplicate variant option: ${name}`)
    }

    seenCodes.add(code)

    if (!Array.isArray(option.values)) {
      throw new Error(`Values for "${name}" must be an array`)
    }

    const seenValues = new Set<string>()
    const values: string[] = []

    for (const rawValue of option.values) {
      if (typeof rawValue !== 'string') {
        throw new Error(
          `Variant value in "${name}" must be a string`,
        )
      }

      const displayValue = rawValue.trim()

      if (!displayValue) {
        throw new Error(
          `Variant option "${name}" contains an empty value`,
        )
      }

      const normalizedValue =
        normalizeOptionValue(displayValue)

      if (seenValues.has(normalizedValue)) {
        throw new Error(
          `Duplicate value "${displayValue}" in option "${name}"`,
        )
      }

      seenValues.add(normalizedValue)
      values.push(displayValue)
    }

    if (values.length === 0) {
      throw new Error(
        `Variant option "${name}" must contain at least one value`,
      )
    }

    return {
      code,
      name,
      values,
    }
  })
}

/**
 * Stable identity for a single Variant combination.
 *
 * Option ordering does not affect the resulting key.
 *
 * Example:
 *
 * {
 *   color: "Red",
 *   size: "M"
 * }
 *
 * => color:red_size:m
 */
export function generateVariantKey(
  optionValues: Record<string, string>,
): string {
  const entries = Object.entries(optionValues)
    .map(([rawCode, rawValue]) => {
      const code = normalizeOptionCode(rawCode)
      const value = normalizeOptionValue(rawValue)

      return [code, value] as const
    })
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) {
    throw new Error(
      'Variant must contain at least one option value',
    )
  }

  return entries
    .map(([code, value]) => `${code}:${value}`)
    .join('_')
}
