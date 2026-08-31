import { createClientServer } from '@/lib/supabase/server'
import {
  RawData,
  SemanticField,
  SemanticProcessingResult,
  SemanticDataResult,
  SemanticFieldResult,
  LegacySemanticProcessingResult,
} from './types'
import {
  getSchemaIdByIndustrySlug,
  resolveSchemaByIndustrySlug,
} from './schema-service'
import { matchSemanticFields } from './matcher'
import { normalizeValue, validateValue } from './normalizer'
import { analyzeSemanticResult } from './analyzer'

export async function getSemanticFieldsBySchemaId(
  schemaId: string,
): Promise<SemanticField[]> {
  const supabase = await createClientServer()

  const { data, error } = await supabase
    .from('semantic_fields')
    .select('*')
    .eq('schema_id', schemaId)

  if (error) {
    throw new Error(`Failed to fetch semantic fields: ${error.message}`)
  }

  return (data || []).map((field) => ({
    id: field.id,
    schema_id: field.schema_id,
    field_name: field.field_name,
    field_type: field.field_type,
    display_name: field.display_name,
    aliases: Array.isArray(field.aliases) ? field.aliases : [],
    normalization_rules: field.normalization_rules || {},
    required: field.required,
    validation_rules: field.validation_rules || {},
  }))
}

/**
 * Resolve a semantic schema id by industry slug + version.
 *
 * Delegates to the trusted server-side schema reader (service-role client),
 * which is the only sanctioned way to read the SERVICE_ROLE_ONLY
 * `semantic_schemas` table. Throws a precise error
 * (SchemaNotFoundError / SchemaAccessDeniedError / SchemaQueryFailedError)
 * instead of returning null, so callers can map the failure correctly.
 */
export async function getSchemaByIndustrySlug(
  industrySlug: string,
  version: string = '1.0',
): Promise<string> {
  return getSchemaIdByIndustrySlug(industrySlug, version)
}

function calculateOverallConfidence(semanticData: SemanticDataResult): number {
  const fieldResults = Object.values(semanticData)
  if (fieldResults.length === 0) return 0

  const totalConfidence = fieldResults.reduce(
    (sum, result) => sum + result.evidence.confidence,
    0,
  )
  return totalConfidence / fieldResults.length
}

export async function processSemanticData(
  rawData: RawData,
  schemaId: string,
): Promise<SemanticProcessingResult> {
  const fields = await getSemanticFieldsBySchemaId(schemaId)
  const errors: string[] = []

  const matchedFields = matchSemanticFields(rawData, fields)
  const semanticData: SemanticDataResult = {}

  for (const [fieldName, fieldResult] of Object.entries(matchedFields)) {
    const field = fields.find((f) => f.field_name === fieldName)
    if (!field) continue

    const normalizedResult = normalizeValue(fieldResult.value, field)

    if (!validateValue(normalizedResult.value, field)) {
      errors.push(
        `Validation failed for field '${field.field_name}': ${JSON.stringify(normalizedResult.value)}`,
      )
      continue
    }

    semanticData[fieldName] = normalizedResult
  }

  for (const field of fields) {
    if (field.required && !semanticData[field.field_name]) {
      errors.push(`Required field '${field.field_name}' is missing`)
    }
  }

  const overallConfidence = calculateOverallConfidence(semanticData)

  return {
    schema_id: schemaId,
    schema_version: '1.0',
    semantic_data: semanticData,
    overall_confidence: overallConfidence,
    generated_by: 'rule-based-processor-v2',
    processor_version: 'semantic-engine-v2',
  }
}

// Legacy function for backward compatibility
export async function processSemanticDataLegacy(
  rawData: RawData,
  schemaId: string,
): Promise<LegacySemanticProcessingResult> {
  const fields = await getSemanticFieldsBySchemaId(schemaId)
  const errors: string[] = []

  const matchedFields = matchSemanticFields(rawData, fields)
  const semanticData: Record<string, unknown> = {}

  for (const [fieldName, fieldResult] of Object.entries(matchedFields)) {
    const field = fields.find((f) => f.field_name === fieldName)
    if (!field) continue

    const normalizedResult = normalizeValue(fieldResult.value, field)

    if (!validateValue(normalizedResult.value, field)) {
      errors.push(
        `Validation failed for field '${field.field_name}': ${JSON.stringify(normalizedResult.value)}`,
      )
      continue
    }

    semanticData[fieldName] = normalizedResult.value
  }

  for (const field of fields) {
    if (field.required && !semanticData[field.field_name]) {
      errors.push(`Required field '${field.field_name}' is missing`)
    }
  }

  return {
    semantic_data: semanticData,
    matches: [],
    normalized: [],
    errors,
  }
}

export async function saveProductSemantics(
  productId: string,
  schemaId: string,
  semanticData: Record<string, unknown>,
  confidence = 1,
  generatedBy = 'merchant-confirmed',
): Promise<void> {
  const supabase = await createClientServer()

  const { error } = await supabase
    .from('product_semantics')
    .upsert(
      {
        product_id: productId,
        schema_id: schemaId,
        semantic_data: semanticData,
        confidence,
        generated_by: generatedBy,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'product_id,schema_id',
      },
    )

  if (error) {
    throw new Error(
      `Failed to save product semantics: ${error.message}`,
    )
  }
}

export async function logSemanticProcessing(
  productId: string,
  schemaId: string,
  processorVersion: string,
  status: 'success' | 'error',
  confidence: number | null,
  errorMessage: string | null = null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const supabase = await createClientServer()

  const { error } = await supabase
    .from('semantic_processing_logs')
    .insert({
      product_id: productId,
      schema_id: schemaId,
      processor_version: processorVersion,
      status,
      confidence,
      error_message: errorMessage,
      metadata,
    })

  if (error) {
    console.error(`Failed to log semantic processing: ${error.message}`)
  }
}

export async function saveUnknownFields(
  productId: string,
  schemaId: string,
  unknownFields: Array<{ raw_field: string; raw_value: unknown; reason: string }>,
): Promise<void> {
  const supabase = await createClientServer()

  if (unknownFields.length === 0) return

  const { error } = await supabase
    .from('semantic_unknown_fields')
    .insert(
      unknownFields.map(field => ({
        product_id: productId,
        schema_id: schemaId,
        raw_field: field.raw_field,
        raw_value: field.raw_value as Record<string, unknown>,
        reason: field.reason,
        status: 'pending',
      })),
    )

  if (error) {
    console.error(`Failed to save unknown fields: ${error.message}`)
  }
}

export async function processProductSemantic(productId: string): Promise<void> {
  const supabase = await createClientServer()

  try {
    const { data: product } = await supabase
      .from('products')
      .select('raw_data, stores(industries(slug))')
      .eq('id', productId)
      .single()

    if (!product) {
      throw new Error('Product not found')
    }

    const rawData = product.raw_data as Record<string, unknown> | null
    if (!rawData) {
      throw new Error('No raw data found for this product')
    }

    const store = product.stores as { industries?: { slug?: string } } | null
    const industrySlug = store?.industries?.slug || 'eyewear'

    const schemaId = await getSchemaByIndustrySlug(industrySlug, '1.0')

    const result = await processSemanticData(rawData, schemaId)

    const flatSemanticData: Record<string, unknown> = {}
    for (const [key, fieldResult] of Object.entries(result.semantic_data)) {
      flatSemanticData[key] = fieldResult.value
    }

    const schemaFields = await getSemanticFieldsBySchemaId(schemaId)
    const analysis = analyzeSemanticResult(
      productId,
      { id: schemaId, fields: schemaFields },
      rawData,
      flatSemanticData,
    )

    await saveProductSemantics(productId, schemaId, flatSemanticData)

    await saveUnknownFields(productId, schemaId, analysis.unknown_fields)

    await logSemanticProcessing(
      productId,
      schemaId,
      result.processor_version,
      'success',
      result.overall_confidence,
      null,
      { semantic_data: result.semantic_data, analysis },
    )
  } catch (error) {
    const eyewearResolution = await resolveSchemaByIndustrySlug('eyewear', '1.0')
    const schemaId = eyewearResolution.found ? eyewearResolution.schemaId : ''
    await logSemanticProcessing(
      productId,
      schemaId || '',
      'semantic-engine-v2',
      'error',
      null,
      error instanceof Error ? error.message : 'Unknown error',
    )
    throw error
  }
}
