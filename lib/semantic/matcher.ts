import { RawData, SemanticField, SemanticFieldResult, SemanticSourceType } from './types'

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

export function matchField(
  rawKey: string,
  rawValue: unknown,
  fields: SemanticField[],
): { field: string; result: SemanticFieldResult } | null {
  const normalizedRawKey = normalizeKey(rawKey)

  for (const field of fields) {
    const fieldAliases = [
      field.field_name,
      ...field.aliases,
    ]

    for (const alias of fieldAliases) {
      const normalizedAlias = normalizeKey(alias)

      if (normalizedRawKey === normalizedAlias) {
        return {
          field: field.field_name,
          result: {
            value: rawValue,
            evidence: {
              source_type: 'alias_match' as SemanticSourceType,
              processor_version: 'matcher-v1',
              confidence: 0.98,
              explanation: `"${rawKey}" matched "${field.field_name}" via alias "${alias}"`,
            },
          },
        }
      }
    }
  }

  return null
}

export function matchSemanticFields(
  rawData: RawData,
  fields: SemanticField[],
): Record<string, SemanticFieldResult> {
  const results: Record<string, SemanticFieldResult> = {}
  const rawKeys = Object.keys(rawData)

  for (const rawKey of rawKeys) {
    const match = matchField(rawKey, rawData[rawKey], fields)
    if (match) {
      results[match.field] = match.result
    }
  }

  return results
}
