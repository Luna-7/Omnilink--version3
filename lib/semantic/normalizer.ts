import { SemanticField, SemanticFieldResult, SemanticSourceType } from './types'

export function normalizeValue(
  value: unknown,
  field: SemanticField,
): SemanticFieldResult {
  if (value === null || value === undefined) {
    return {
      value: null,
      evidence: {
        source_type: 'rule_validation' as SemanticSourceType,
        processor_version: 'normalizer-v1',
        confidence: 0.5,
        explanation: 'Null value provided',
      },
    }
  }

  const stringValue = String(value).trim()
  const mappings = field.normalization_rules.mappings || {}

  if (field.field_type === 'select' && mappings[stringValue]) {
    return {
      value: mappings[stringValue],
      evidence: {
        source_type: 'normalization' as SemanticSourceType,
        processor_version: 'normalizer-v1',
        confidence: 0.99,
        explanation: `Matched normalization rule: "${stringValue}" → "${mappings[stringValue]}"`,
      },
    }
  }

  if (field.field_type === 'number') {
    const numValue = Number(stringValue)
    if (!isNaN(numValue)) {
      return {
        value: numValue,
        evidence: {
          source_type: 'rule_validation' as SemanticSourceType,
          processor_version: 'normalizer-v1',
          confidence: 0.95,
          explanation: 'Successfully parsed as number',
        },
      }
    }
  }

  if (field.field_type === 'boolean') {
    const lowerValue = stringValue.toLowerCase()
    if (['true', 'yes', '1', '是', '对'].includes(lowerValue)) {
      return {
        value: true,
        evidence: {
          source_type: 'rule_validation' as SemanticSourceType,
          processor_version: 'normalizer-v1',
          confidence: 0.95,
          explanation: 'Matched boolean true pattern',
        },
      }
    }
    if (['false', 'no', '0', '否', '错'].includes(lowerValue)) {
      return {
        value: false,
        evidence: {
          source_type: 'rule_validation' as SemanticSourceType,
          processor_version: 'normalizer-v1',
          confidence: 0.95,
          explanation: 'Matched boolean false pattern',
        },
      }
    }
  }

  return {
    value: stringValue,
    evidence: {
      source_type: 'rule_validation' as SemanticSourceType,
      processor_version: 'normalizer-v1',
      confidence: 0.7,
      explanation: 'Fallback to original string value',
    },
  }
}

export function validateValue(
  value: unknown,
  field: SemanticField,
): boolean {
  if (field.required && (value === null || value === undefined || value === '')) {
    return false
  }

  if (field.field_type === 'number' && typeof value === 'number') {
    const { min, max } = field.validation_rules
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
  }

  if (field.field_type === 'select' && typeof value === 'string') {
    const { allowedValues } = field.validation_rules
    if (allowedValues && !allowedValues.includes(value)) return false
  }

  return true
}
