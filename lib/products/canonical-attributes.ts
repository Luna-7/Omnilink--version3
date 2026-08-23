import { createClientServer } from '@/lib/supabase/server'
import {
  getSchemaByIndustrySlug,
  getSemanticFieldsBySchemaId,
  saveProductSemantics,
  saveUnknownFields,
} from '@/lib/semantic/processor'
import { mapDraftAttributes, type InputAttribute } from '@/lib/product-ai/attribute-mapper'
import { getCategoryTemplate } from '@/lib/product/category-templates'

export interface CanonicalProductAttribute {
  fieldKey: string
  label?: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  unit?: string | null
  source?: 'ai' | 'manual' | 'system'
  confidence?: number
  isStandard: boolean
}

export interface CanonicalProductAttributesResponse {
  product_id: string
  category: string | null
  schema_id: string | null
  schema_version: string | null
  attributes: CanonicalProductAttribute[]
  is_complete: boolean
  is_legacy?: boolean
  missing_required_fields: string[]
}

export interface SaveCanonicalProductAttributesInput {
  category?: string | null
  attributes: CanonicalProductAttribute[]
  deletions?: string[]
}

export interface SaveCanonicalProductAttributesResult {
  mapping: Awaited<ReturnType<typeof mapDraftAttributes>>
  canonical: CanonicalProductAttributesResponse
}

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function unwrapSemanticValue(value: unknown): unknown {
  if (isRecord(value) && 'value' in value) {
    return value.value
  }
  return value
}

function normalizeSemanticMap(value: unknown): JsonRecord {
  if (!isRecord(value)) return {}

  // Legacy nested form:
  // { attributes: { field: value } }
  if (isRecord(value.attributes)) {
    return normalizeSemanticMap(value.attributes)
  }

  const output: JsonRecord = {}

  for (const [key, raw] of Object.entries(value)) {
    output[key] = unwrapSemanticValue(raw)
  }

  return output
}

function inferSource(
  generatedBy?: string | null,
): 'ai' | 'manual' | 'system' {
  const source = (generatedBy || '').toLowerCase()

  if (source.includes('ai')) return 'ai'
  if (source.includes('merchant') || source.includes('human') || source.includes('manual')) return 'manual'

  return 'system'
}

function normalizeType(
  value: unknown,
  fallback: CanonicalProductAttribute['type'] = 'text',
): CanonicalProductAttribute['type'] {
  if (
    value === 'text' ||
    value === 'number' ||
    value === 'boolean' ||
    value === 'select'
  ) {
    return value
  }

  return fallback
}

function getRawAttributes(rawData: unknown): CanonicalProductAttribute[] {
  if (!isRecord(rawData)) return []

  const attrs = rawData.attributes ?? rawData.ai_draft

  const source = Array.isArray(attrs)
    ? attrs
    : isRecord(attrs) && Array.isArray(attrs.attributes)
      ? attrs.attributes
      : []

  const results: CanonicalProductAttribute[] = []

  // 1. Array-based attributes (attributes / ai_draft.attributes)
  for (const attr of source) {
    if (!isRecord(attr)) continue
    const fieldKey = String(attr.key ?? attr.fieldKey ?? attr.field_key ?? '').trim()
    const value = String(attr.value ?? '')
    if (fieldKey && value) {
      results.push({
        fieldKey,
        label: attr.label ? String(attr.label) : undefined,
        value,
        type: normalizeType(attr.type),
        unit: attr.unit ? String(attr.unit) : null,
        source:
          attr.source === 'ai' ||
          attr.source === 'manual' ||
          attr.source === 'system'
            ? attr.source
            : 'ai',
        confidence:
          typeof attr.confidence === 'number'
            ? attr.confidence
            : undefined,
        isStandard: false,
      })
    }
  }

  // 2. Fallback: core_attributes in raw_data
  if (isRecord(rawData.core_attributes)) {
    const coreMap: Record<string, string> = {
      material: 'material',
      dimensions: 'dimensions',
      weight: 'weight',
      country_of_origin: 'country_of_origin',
    }
    for (const [prop, canonicalKey] of Object.entries(coreMap)) {
      const val = rawData.core_attributes[prop]
      if (val && !results.some((r) => r.fieldKey.toLowerCase() === canonicalKey.toLowerCase())) {
        results.push({
          fieldKey: canonicalKey,
          label: prop,
          value: String(val),
          type: 'text',
          source: 'manual',
          confidence: 1.0,
          isStandard: false,
        })
      }
    }
  }

  // 3. Fallback: custom_attributes in raw_data
  if (Array.isArray(rawData.custom_attributes)) {
    for (const custom of rawData.custom_attributes) {
      if (!isRecord(custom)) continue
      const name = String(custom.name || custom.id || '').trim()
      const key = name.toLowerCase().replace(/\s+/g, '_')
      const val = String(custom.value ?? '')
      if (key && val && !results.some((r) => r.fieldKey.toLowerCase() === key.toLowerCase())) {
        results.push({
          fieldKey: key,
          label: name,
          value: val,
          type: normalizeType(custom.type),
          source: 'manual',
          confidence: 1.0,
          isStandard: false,
        })
      }
    }
  }

  return results
}

function mergeLegacyAttributes(
  existing: CanonicalProductAttribute[],
  legacy: CanonicalProductAttribute[],
): CanonicalProductAttribute[] {
  const map = new Map<string, CanonicalProductAttribute>()

  for (const attr of legacy) {
    map.set(attr.fieldKey.toLowerCase(), attr)
  }

  for (const attr of existing) {
    map.set(attr.fieldKey.toLowerCase(), attr)
  }

  return [...map.values()]
}

async function loadProductContext(productId: string) {
  const supabase = await createClientServer()

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      id,
      raw_data,
      semantic_data,
      store_id,
      stores(
        industries(
          slug
        )
      )
    `,
    )
    .eq('id', productId)
    .single()

  if (error || !product) {
    throw new Error('Product not found')
  }

  const rawData = isRecord(product.raw_data)
    ? product.raw_data
    : {}

  const category =
    typeof rawData.category === 'string'
      ? rawData.category
      : null

  const rawStore = Array.isArray(product.stores) ? product.stores[0] : product.stores
  const storeObj = isRecord(rawStore) ? rawStore : null
  const industriesObj = isRecord(storeObj?.industries) ? storeObj?.industries : null
  const industrySlug = typeof industriesObj?.slug === 'string' ? industriesObj.slug : 'eyewear'

  let schemaId = await getSchemaByIndustrySlug(
    industrySlug,
    '1.0',
  )

  if (!schemaId) {
    schemaId = await getSchemaByIndustrySlug(
      'eyewear',
      '1.0',
    )
  }

  if (!schemaId) {
    throw new Error('Semantic schema not found')
  }

  const fields = await getSemanticFieldsBySchemaId(schemaId)

  const { data: schemaRow } = await supabase
    .from('semantic_schemas')
    .select('id, version')
    .eq('id', schemaId)
    .maybeSingle()

  const { data: productSemantic } = await supabase
    .from('product_semantics')
    .select(
      'semantic_data, confidence, generated_by, updated_at',
    )
    .eq('product_id', productId)
    .eq('schema_id', schemaId)
    .order('updated_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  return {
    supabase,
    product,
    rawData,
    category,
    schemaId,
    schemaVersion: schemaRow?.version ?? '1.0',
    fields,
    productSemantic,
  }
}

export async function getCanonicalProductAttributes(
  productId: string,
): Promise<CanonicalProductAttributesResponse> {
  const {
    category,
    schemaId,
    schemaVersion,
    fields,
    product,
    rawData,
    productSemantic,
  } = await loadProductContext(productId)

  const template = getCategoryTemplate(
    category || '',
  )

  const templateFields = template?.fields ?? []

  const templateMap = new Map(
    templateFields.map((field) => [
      field.key.toLowerCase(),
      field,
    ]),
  )

  let semanticMap: JsonRecord = {}
  let source: 'canonical' | 'legacy' = 'canonical'

  if (productSemantic?.semantic_data) {
    semanticMap = normalizeSemanticMap(
      productSemantic.semantic_data,
    )
  } else if (product.semantic_data) {
    source = 'legacy'
    semanticMap = normalizeSemanticMap(
      product.semantic_data,
    )
  } else {
    source = 'legacy'
  }

  const semanticFieldsByKey = new Map(
    fields.map((field) => [
      field.field_name.toLowerCase(),
      field,
    ]),
  )

  const attributes: CanonicalProductAttribute[] = []

  for (const [key, rawValue] of Object.entries(
    semanticMap,
  )) {
    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ''
    ) {
      continue
    }

    const semanticField =
      semanticFieldsByKey.get(key.toLowerCase())

    const templateField =
      templateMap.get(key.toLowerCase())

    attributes.push({
      fieldKey: key,
      label:
        templateField?.nameZh ||
        templateField?.nameEn ||
        semanticField?.display_name ||
        key,
      value: String(rawValue),
      type: normalizeType(
        semanticField?.field_type ||
          templateField?.type,
      ),
      unit:
        templateField?.unit ??
        null,
      source:
        source === 'canonical'
          ? inferSource(productSemantic?.generated_by)
          : 'system',
      confidence:
        productSemantic?.confidence ?? undefined,
      isStandard: Boolean(templateField),
    })
  }

  // Compatibility fallback for older products.
  if (source === 'legacy') {
    const legacyAttributes = getRawAttributes(rawData)
    const merged = mergeLegacyAttributes(attributes, legacyAttributes)
    attributes.length = 0
    attributes.push(...merged)
  } else {
    // Keep unknown legacy/custom fields visible without overriding canonical fields
    const legacyAttributes = getRawAttributes(rawData)
    const canonicalKeys = new Set(
      attributes.map((attr) => attr.fieldKey.toLowerCase()),
    )

    for (const attr of legacyAttributes) {
      if (!canonicalKeys.has(attr.fieldKey.toLowerCase())) {
        attributes.push(attr)
      }
    }
  }

  // Strict isStandard assignment: ONLY attributes matched in Category Template are standard
  for (const attr of attributes) {
    const templateField = templateMap.get(attr.fieldKey.toLowerCase())
    attr.isStandard = Boolean(templateField)
    if (templateField) {
      attr.label = templateField.nameZh || templateField.nameEn || attr.label || attr.fieldKey
      attr.type = normalizeType(templateField.type, attr.type)
      if (templateField.unit) {
        attr.unit = templateField.unit
      }
    }
  }

  const presentKeys = new Set(
    attributes.map((attr) => attr.fieldKey.toLowerCase()),
  )

  const missingRequiredFields = fields
    .filter((field) => field.required)
    .filter(
      (field) => !presentKeys.has(field.field_name.toLowerCase()),
    )
    .map((field) => field.field_name)

  return {
    product_id: productId,
    category,
    schema_id: schemaId,
    schema_version: schemaVersion,
    attributes,
    is_complete:
      source === 'canonical' && missingRequiredFields.length === 0,
    is_legacy: source === 'legacy',
    missing_required_fields: missingRequiredFields,
  }
}

// Note: This is an application-level merge and not a database-level atomic transaction.
// TODO: Phase 3/DB hardening: transactional JSONB merge or RPC
export async function saveCanonicalProductAttributes(
  productId: string,
  input: SaveCanonicalProductAttributesInput,
): Promise<SaveCanonicalProductAttributesResult> {
  const {
    supabase,
    schemaId,
    schemaVersion,
    category: existingCategory,
    rawData,
  } = await loadProductContext(productId)

  const incomingInputs: InputAttribute[] = input.attributes.map((attr) => ({
    key: attr.fieldKey,
    label: attr.label,
    value: attr.value,
    type: attr.type,
    unit: attr.unit ?? null,
    confidence:
      typeof attr.confidence === 'number' ? attr.confidence : 1,
  }))

  const mapping = await mapDraftAttributes(
    schemaId,
    incomingInputs,
  )

  const { data: currentSemantic } = await supabase
    .from('product_semantics')
    .select('semantic_data')
    .eq('product_id', productId)
    .eq('schema_id', schemaId)
    .order('updated_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  const currentSemanticData = normalizeSemanticMap(
    currentSemantic?.semantic_data,
  )

  // 1. Process explicit deletions on existing semantic data
  const deletionSet = new Set<string>()
  if (Array.isArray(input.deletions)) {
    for (const delKey of input.deletions) {
      if (typeof delKey === 'string' && delKey.trim().length > 0) {
        deletionSet.add(delKey.trim().toLowerCase())
      }
    }
  }

  for (const key of Object.keys(currentSemanticData)) {
    if (deletionSet.has(key.toLowerCase())) {
      delete currentSemanticData[key]
    }
  }

  // 2. Merge incoming updates: Set wins over Delete if same key exists in both
  const mergedSemanticData = {
    ...currentSemanticData,
    ...mapping.semanticData,
  }

  const shouldUpdateSemanticStore =
    Object.keys(mergedSemanticData).length > 0 ||
    deletionSet.size > 0 ||
    mapping.accepted.length > 0

  if (shouldUpdateSemanticStore) {
    const acceptedConfidence =
      mapping.accepted.length > 0
        ? mapping.accepted.reduce(
            (sum, item) => sum + item.confidence,
            0,
          ) / mapping.accepted.length
        : 1

    await saveProductSemantics(
      productId,
      schemaId,
      mergedSemanticData,
      acceptedConfidence,
      'merchant-confirmed-ai-draft',
    )
  }

  // 3. Sync legacy raw_data compatibility layer (for non-standard/unknown attributes and categories)
  const currentAttributes = getRawAttributes(rawData)
  const attributeMap = new Map(
    currentAttributes.map((attr) => [
      attr.fieldKey.toLowerCase(),
      attr,
    ]),
  )

  // Apply deletions to raw_data custom attributes as well
  for (const delKey of deletionSet) {
    attributeMap.delete(delKey)
  }

  // Remove accepted standard attributes from raw_data.attributes to prevent duplicates/pollution
  for (const accepted of mapping.accepted) {
    attributeMap.delete(accepted.semanticField.toLowerCase())
    attributeMap.delete(accepted.sourceKey.toLowerCase())
  }

  // Upsert unknown/custom fields
  for (const unknown of mapping.unknownFields) {
    const rawValue = isRecord(unknown.raw_value)
      ? unknown.raw_value
      : {}

    const existing = attributeMap.get(unknown.raw_field.toLowerCase())

    attributeMap.set(unknown.raw_field.toLowerCase(), {
      fieldKey: unknown.raw_field,
      label:
        typeof rawValue.label === 'string'
          ? rawValue.label
          : unknown.raw_field,
      value:
        typeof rawValue.value === 'string'
          ? rawValue.value
          : String(rawValue.value ?? ''),
      type: normalizeType(rawValue.type),
      unit:
        typeof rawValue.unit === 'string'
          ? rawValue.unit
          : existing?.unit ?? null,
      source: 'manual',
      confidence: 1,
      isStandard: false,
    })
  }

  const nextRawData: JsonRecord = {
    ...rawData,
  }

  if (input.category !== undefined) {
    nextRawData.category = input.category || null
  } else if (existingCategory) {
    nextRawData.category = existingCategory
  }

  nextRawData.attributes = [...attributeMap.values()].map((attr) => ({
    key: attr.fieldKey,
    label: attr.label,
    value: attr.value,
    type: attr.type,
    unit: attr.unit ?? null,
    source: attr.source,
    confidence: attr.confidence ?? 1,
  }))

  const { error } = await supabase
    .from('products')
    .update({
      raw_data: nextRawData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (error) {
    throw new Error(
      `Failed to save legacy attribute compatibility data: ${error.message}`,
    )
  }

  if (mapping.unknownFields.length > 0) {
    await saveUnknownFields(
      productId,
      schemaId,
      mapping.unknownFields,
    )
  }

  const canonical = await getCanonicalProductAttributes(productId)

  return {
    mapping,
    canonical: {
      ...canonical,
      schema_version:
        canonical.schema_version ?? schemaVersion,
    },
  }
}
