import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeRuleDefinition } from '@/lib/product/attribute-rules'

export interface AttributeValidationIssue {
  fieldKey: string
  code:
    | 'required'
    | 'type'
    | 'allowed_value'
    | 'min'
    | 'max'
    | 'invalid_boolean'
    | 'invalid_number'
  message: string
  value?: unknown
}

export interface AttributeValidationResult {
  valid: boolean
  issues: AttributeValidationIssue[]
  normalizedAttributes: CanonicalProductAttribute[]
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  )
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === 'true') return true
  if (normalized === 'false') return false

  return null
}

function normalizeNumber(value: unknown): number | null {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim() !== ''
  ) {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim()
}

export function validateSingleAttribute(
  attribute: CanonicalProductAttribute,
  rule: AttributeRuleDefinition,
): {
  normalized?: CanonicalProductAttribute
  issues: AttributeValidationIssue[]
} {
  const issues: AttributeValidationIssue[] = []

  const fieldKey = rule.fieldKey
  const rawValue = attribute.value

  // Required
  if (
    rule.required &&
    isEmpty(rawValue)
  ) {
    issues.push({
      fieldKey,
      code: 'required',
      message: `${fieldKey} is required`,
      value: rawValue,
    })

    return { issues }
  }

  // Empty optional field
  if (isEmpty(rawValue)) {
    return {
      normalized: {
        ...attribute,
        fieldKey,
        value: '',
        type: rule.type,
        unit: rule.unit ?? null,
        required: rule.required,
        allowedValues: rule.allowedValues,
        min: rule.min,
        max: rule.max,
      },
      issues,
    }
  }

  switch (rule.type) {
    case 'boolean': {
      const booleanValue =
        normalizeBoolean(rawValue)

      if (booleanValue === null) {
        issues.push({
          fieldKey,
          code: 'invalid_boolean',
          message: `${fieldKey} must be a boolean`,
          value: rawValue,
        })

        break
      }

      return {
        normalized: {
          ...attribute,
          fieldKey,
          value: String(booleanValue),
          type: 'boolean',
          unit: rule.unit ?? null,
          required: rule.required,
          allowedValues: rule.allowedValues,
          min: rule.min,
          max: rule.max,
        },
        issues,
      }
    }

    case 'number': {
      const numberValue =
        normalizeNumber(rawValue)

      if (numberValue === null) {
        issues.push({
          fieldKey,
          code: 'type',
          message: `${fieldKey} must be a number`,
          value: rawValue,
        })

        break
      }

      if (
        rule.min !== undefined &&
        numberValue < rule.min
      ) {
        issues.push({
          fieldKey,
          code: 'min',
          message: `${fieldKey} must be >= ${rule.min}`,
          value: numberValue,
        })
      }

      if (
        rule.max !== undefined &&
        numberValue > rule.max
      ) {
        issues.push({
          fieldKey,
          code: 'max',
          message: `${fieldKey} must be <= ${rule.max}`,
          value: numberValue,
        })
      }

      return {
        normalized: {
          ...attribute,
          fieldKey,
          value: String(numberValue),
          type: 'number',
          unit: rule.unit ?? null,
          required: rule.required,
          allowedValues: rule.allowedValues,
          min: rule.min,
          max: rule.max,
        },
        issues,
      }
    }

    case 'select': {
      const textValue =
        normalizeText(rawValue)

      if (
        rule.allowedValues &&
        rule.allowedValues.length > 0
      ) {
        const matched =
          rule.allowedValues.find(
            (candidate) =>
              candidate.trim().toLowerCase() ===
              textValue.toLowerCase(),
          )

        if (!matched) {
          issues.push({
            fieldKey,
            code: 'allowed_value',
            message: `${fieldKey} must be one of: ${rule.allowedValues.join(', ')}`,
            value: rawValue,
          })

          break
        }

        return {
          normalized: {
            ...attribute,
            fieldKey,
            value: matched,
            type: 'select',
            unit: rule.unit ?? null,
            required: rule.required,
            allowedValues: rule.allowedValues,
            min: rule.min,
            max: rule.max,
          },
          issues,
        }
      }

      return {
        normalized: {
          ...attribute,
          fieldKey,
          value: textValue,
          type: 'select',
          unit: rule.unit ?? null,
          required: rule.required,
          allowedValues: rule.allowedValues,
          min: rule.min,
          max: rule.max,
        },
        issues,
      }
    }

    case 'text':
    default: {
      const textValue =
        normalizeText(rawValue)

      return {
        normalized: {
          ...attribute,
          fieldKey,
          value: textValue,
          type: 'text',
          unit: rule.unit ?? null,
          required: rule.required,
          allowedValues: rule.allowedValues,
          min: rule.min,
          max: rule.max,
        },
        issues,
      }
    }
  }

  return { issues }
}

export function validateProductAttributes(
  attributes: CanonicalProductAttribute[],
  rules: Map<string, AttributeRuleDefinition>,
): AttributeValidationResult {
  const issues: AttributeValidationIssue[] = []

  const normalizedAttributes: CanonicalProductAttribute[] = []

  const attributesByKey = new Map(
    attributes.map((attribute) => [
      attribute.fieldKey.toLowerCase(),
      attribute,
    ]),
  )

  for (const [fieldKey, rule] of rules) {
    const attribute =
      attributesByKey.get(
        fieldKey.toLowerCase(),
      )

    if (!attribute) {
      if (rule.required) {
        issues.push({
          fieldKey,
          code: 'required',
          message: `${fieldKey} is required`,
        })
      }

      continue
    }

    const result =
      validateSingleAttribute(
        attribute,
        rule,
      )

    issues.push(...result.issues)

    if (result.normalized) {
      normalizedAttributes.push(
        result.normalized,
      )
    }
  }

  // Preserve unknown/custom attributes untouched.
  const standardKeys = new Set(
    Array.from(rules.keys()).map((key) =>
      key.toLowerCase(),
    ),
  )

  for (const attribute of attributes) {
    if (
      !standardKeys.has(
        attribute.fieldKey.toLowerCase(),
      )
    ) {
      normalizedAttributes.push(
        attribute,
      )
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    normalizedAttributes,
  }
}
