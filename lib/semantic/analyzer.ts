import {
  SemanticAnalysisResult,
  UnknownSemanticField,
  SemanticField,
} from './types'

export function analyzeSemanticResult(
  productId: string,
  schema: { id: string; fields?: SemanticField[] },
  rawData: Record<string, unknown>,
  semanticData: Record<string, unknown>,
): SemanticAnalysisResult {
  const schemaFields = schema.fields ?? []
  const matchedFields = Object.keys(semanticData)

  const unknownFields: UnknownSemanticField[] = []

  Object.keys(rawData).forEach(key => {
    const exists = matchedFields.some(field => field === key)

    if (!exists) {
      unknownFields.push({
        raw_field: key,
        raw_value: rawData[key],
        reason: 'no_mapping',
      })
    }
  })

  const missingRequired = schemaFields
    .filter((field: SemanticField) => field.required && !semanticData[field.field_name])
    .map((field: SemanticField) => field.field_name)

  return {
    product_id: productId,
    schema_id: schema.id,
    coverage: {
      total_fields: schemaFields.length,
      matched_fields: matchedFields.length,
      coverage_score: schemaFields.length ? matchedFields.length / schemaFields.length : 0,
    },
    unknown_fields: unknownFields,
    missing_required_fields: missingRequired,
    analyzer_version: 'semantic-analyzer-v1',
  }
}
