
/**
 * Canonicalize option code by normalizing to lowercase, trimming, and replacing spaces with underscores
 */
export function normalizeOptionCode(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, '_')
}

/**
 * Canonicalize option values object by:
 * 1. Converting all keys to lowercase
 * 2. Sorting keys alphabetically
 * 3. Creating a stable string representation
 */
export function canonicalizeOptionValues(optionValues: Record<string, string>): string {
  const normalized: Record<string, string> = {}
  
  // Normalize keys to lowercase
  for (const [key, value] of Object.entries(optionValues)) {
    normalized[key.toLowerCase().trim()] = value.trim()
  }
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(normalized).sort()
  
  // Build canonical string
  return sortedKeys.map(key => `${key}:${normalized[key]}`).join('|')
}

/**
 * Validate option code format
 */
export function isValidOptionCode(code: string): boolean {
  const normalized = normalizeOptionCode(code)
  return /^[a-z][a-z0-9_]*$/.test(normalized)
}

/**
 * Validate SKU format (basic validation)
 */
export function isValidSKU(sku: string): boolean {
  return sku.trim().length > 0 && sku.trim().length <= 100
}

/**
 * Validate variant status
 */
export function isValidVariantStatus(status: string): status is 'draft' | 'active' | 'archived' {
  return ['draft', 'active', 'archived'].includes(status)
}

/**
 * Validate variant for publish (must have required fields)
 */
export function validateVariantForPublish(variant: {
  sku: string | null
  price: number | null
  option_values: Record<string, string>
}): { valid: boolean; error?: string } {
  if (!variant.sku) {
    return { valid: false, error: 'SKU is required for publishing' }
  }
  
  if (variant.price === null || variant.price === undefined) {
    return { valid: false, error: 'Price is required for publishing' }
  }
  
  if (variant.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' }
  }
  
  if (Object.keys(variant.option_values).length === 0) {
    return { valid: false, error: 'Option values are required for publishing' }
  }
  
  return { valid: true }
}

/**
 * Validate inventory semantics
 */
export function validateInventory(inventory: number | null): { valid: boolean; error?: string } {
  if (inventory === null) {
    return { valid: true } // NULL = unknown/unprovided is valid
  }
  
  if (!Number.isInteger(inventory)) {
    return { valid: false, error: 'Inventory must be an integer' }
  }
  
  if (inventory < 0) {
    return { valid: false, error: 'Inventory cannot be negative' }
  }
  
  return { valid: true }
}

/**
 * Validate option values array
 */
export function validateOptionValues(values: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(values)) {
    return { valid: false, error: 'Values must be an array' }
  }
  
  if (values.length === 0) {
    return { valid: false, error: 'At least one value is required' }
  }
  
  for (const value of values) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return { valid: false, error: 'All values must be non-empty strings' }
    }
  }
  
  return { valid: true }
}

/**
 * Generate variant combinations from options
 */
export function generateVariantCombinations(options: Array<{ code: string; values: string[] }>): Array<Record<string, string>> {
  if (options.length === 0) {
    return []
  }
  
  const combinations: Array<Record<string, string>> = []
  
  function generate(index: number, current: Record<string, string>) {
    if (index === options.length) {
      combinations.push({ ...current })
      return
    }
    
    const option = options[index]
    for (const value of option.values) {
      current[option.code] = value
      generate(index + 1, current)
      delete current[option.code]
    }
  }
  
  generate(0, {})
  return combinations
}
