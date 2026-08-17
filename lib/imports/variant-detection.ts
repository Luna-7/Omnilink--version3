/**
 * Variant Detection and Header Normalization
 * 
 * Deterministic detection of variant columns and header normalization
 * without AI or database access
 */

import type { OptionColumnDetection } from './types'

/**
 * Normalize header to canonical form
 * - trim whitespace
 * - convert to lowercase
 * - replace consecutive spaces/hyphens/underscores with single underscore
 */
export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '_')
}

/**
 * Option column aliases for detection
 * Extended to support multi-language and common variations
 */
const OPTION_ALIASES: Record<string, string[]> = {
  color: ['color', 'colour', '颜色', '色调', 'frame color', 'frame colour', 'lens color'],
  size: ['size', '尺码', '尺寸', 'size us', 'size eu', 'size uk'],
  material: ['material', '材质', '材料', 'frame material', 'frame material'],
  finish: ['finish', '表面处理', '处理', 'frame finish', 'lens finish'],
  storage: ['storage', '容量', '内存', 'storage capacity', 'memory'],
  width: ['width', '宽度', '镜片宽度', 'lens width', 'frame width'],
  height: ['height', '高度', '镜片高度', 'lens height', 'frame height'],
  bridge: ['bridge', '鼻梁', 'bridge size'],
  temple: ['temple', '镜腿', 'temple length'],
}

/**
 * Commercial field aliases that should NOT be treated as options
 */
const COMMERCIAL_FIELD_ALIASES: string[] = [
  'sku', 'product sku', '商品sku', '货号', '产品编号', '编号',
  'price', 'sale price', 'selling price', '售价', '价格', '销售价',
  'currency', 'currency code', '货币', '币种',
  'inventory', 'stock', 'quantity', '库存', '库存量', '数量',
  'name', 'product name', 'product_name', 'title', '商品名称', '商品名', '产品名称', '产品名',
  'description', 'product description', '描述', '商品描述', '产品描述',
  'brand', 'brand name', '品牌', '商标',
  'model', 'product model', '型号', '产品型号',
  'product key', 'product_key', 'handle', 'slug',
]

/**
 * Detect if a header is a commercial field (not an option)
 */
export function isCommercialField(header: string): boolean {
  const normalized = normalizeHeader(header)
  return COMMERCIAL_FIELD_ALIASES.some(alias => 
    normalizeHeader(alias) === normalized
  )
}

/**
 * Detect option columns from headers
 * Returns only columns that are definitely options, excluding commercial fields
 */
export function detectOptionColumns(headers: string[]): OptionColumnDetection[] {
  const detectedOptions: OptionColumnDetection[] = []

  for (const header of headers) {
    // Skip commercial fields
    if (isCommercialField(header)) {
      continue
    }

    const normalized = normalizeHeader(header)

    // Check against known option aliases
    for (const [canonicalCode, aliases] of Object.entries(OPTION_ALIASES)) {
      const matched = aliases.some(alias => normalizeHeader(alias) === normalized)
      
      if (matched) {
        // Avoid duplicate detection of same canonical code
        if (!detectedOptions.some(opt => opt.code === canonicalCode)) {
          detectedOptions.push({
            code: canonicalCode,
            originalHeader: header,
            displayName: header.trim()
          })
        }
        break
      }
    }
  }

  return detectedOptions
}

/**
 * Detect variant commercial fields (SKU, Price, Currency, Inventory)
 * These are variant-level but not options
 */
export function detectVariantCommercialFields(headers: string[]): {
  sku?: string
  price?: string
  currency?: string
  inventory?: string
} {
  const commercialFields: {
    sku?: string
    price?: string
    currency?: string
    inventory?: string
  } = {}

  const skuAliases = ['sku', 'variant sku', '商品sku', '货号', '产品编号', '编号']
  const priceAliases = ['price', 'variant price', 'sale price', 'selling price', '售价', '价格', '销售价']
  const currencyAliases = ['currency', 'currency code', '货币', '币种']
  const inventoryAliases = ['inventory', 'stock', 'quantity', '库存', '库存量', '数量']

  for (const header of headers) {
    const normalized = normalizeHeader(header)

    if (skuAliases.some(alias => normalizeHeader(alias) === normalized) && !commercialFields.sku) {
      commercialFields.sku = header
    }
    if (priceAliases.some(alias => normalizeHeader(alias) === normalized) && !commercialFields.price) {
      commercialFields.price = header
    }
    if (currencyAliases.some(alias => normalizeHeader(alias) === normalized) && !commercialFields.currency) {
      commercialFields.currency = header
    }
    if (inventoryAliases.some(alias => normalizeHeader(alias) === normalized) && !commercialFields.inventory) {
      commercialFields.inventory = header
    }
  }

  return commercialFields
}

/**
 * Normalize a single option value
 * Returns canonical form for comparison
 */
export function normalizeOptionValue(value: string): { canonical: string } {
  return {
    canonical: value.trim().toLowerCase()
  }
}

/**
 * Detect product identity fields (Brand, Model, Product Key)
 */
export function detectProductIdentityFields(headers: string[]): {
  brand?: string
  model?: string
  productKey?: string
} {
  const identityFields: {
    brand?: string
    model?: string
    productKey?: string
  } = {}

  const brandAliases = ['brand', 'brand name', '品牌', '商标', 'manufacturer']
  const modelAliases = ['model', 'product model', '型号', '产品型号', 'product number']
  const productKeyAliases = ['product key', 'product_key', 'handle', 'slug', 'product id']

  for (const header of headers) {
    const normalized = normalizeHeader(header)

    if (brandAliases.some(alias => normalizeHeader(alias) === normalized) && !identityFields.brand) {
      identityFields.brand = header
    }
    if (modelAliases.some(alias => normalizeHeader(alias) === normalized) && !identityFields.model) {
      identityFields.model = header
    }
    if (productKeyAliases.some(alias => normalizeHeader(alias) === normalized) && !identityFields.productKey) {
      identityFields.productKey = header
    }
  }

  return identityFields
}
