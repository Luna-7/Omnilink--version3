import { getSemanticFieldsBySchemaId } from '@/lib/semantic/processor'
import { normalizeValue, validateValue } from '@/lib/semantic/normalizer'

export interface InputAttribute {
  key: string
  label?: string
  value: string
  type?: 'text' | 'number' | 'boolean' | 'select'
  unit?: string | null
  confidence?: number
}

export interface MapAttributesResult {
  semanticData: Record<string, unknown>
  unknownFields: Array<{
    raw_field: string
    raw_value: unknown
    reason: string
  }>
  accepted: Array<{
    sourceKey: string
    semanticField: string
    value: unknown
    confidence: number
  }>
  rejected: Array<{
    sourceKey: string
    reason: string
  }>
}

export async function mapDraftAttributes(
  schemaId: string,
  attributes: InputAttribute[]
): Promise<MapAttributesResult> {
  const fields = await getSemanticFieldsBySchemaId(schemaId)

  const semanticData: Record<string, unknown> = {}
  const unknownFields: Array<{
    raw_field: string
    raw_value: unknown
    reason: string
  }> = []
  const accepted: Array<{
    sourceKey: string
    semanticField: string
    value: unknown
    confidence: number
  }> = []
  const rejected: Array<{
    sourceKey: string
    reason: string
  }> = []

  for (const attribute of attributes) {
    if (!attribute.key || attribute.value == null || attribute.value === '') {
      continue
    }

    const keyLower = attribute.key.toLowerCase().trim()
    const labelLower = (attribute.label || '').toLowerCase().trim()

    // Find matching field by field_name, display_name, or aliases
    const field = fields.find((f) => {
      if (f.field_name.toLowerCase() === keyLower) return true
      if (f.display_name && f.display_name.toLowerCase() === keyLower) return true
      if (f.display_name && labelLower && f.display_name.toLowerCase() === labelLower) return true
      if (Array.isArray(f.aliases)) {
        return f.aliases.some((alias) => {
          const aLower = String(alias).toLowerCase()
          return aLower === keyLower || (labelLower && aLower === labelLower)
        })
      }
      return false
    })

    if (!field) {
      unknownFields.push({
        raw_field: attribute.key,
        raw_value: {
          value: attribute.value,
          confidence: attribute.confidence ?? 1.0,
          label: attribute.label,
          type: attribute.type,
          unit: attribute.unit,
        },
        reason: 'No matching semantic field exists',
      })
      continue
    }

    const normalized = normalizeValue(attribute.value, field)

    if (!validateValue(normalized.value, field)) {
      rejected.push({
        sourceKey: attribute.key,
        reason: `Validation failed for semantic field ${field.field_name}`,
      })
      continue
    }

    semanticData[field.field_name] = normalized.value

    accepted.push({
      sourceKey: attribute.key,
      semanticField: field.field_name,
      value: normalized.value,
      confidence: attribute.confidence ?? 1.0,
    })
  }

  return {
    semanticData,
    unknownFields,
    accepted,
    rejected,
  }
}
