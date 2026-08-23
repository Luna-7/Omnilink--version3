import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeRuleDefinition } from './attribute-rules'

export interface AttributeCompletenessItem {
  fieldKey: string
  label: string
  value: string

  required: boolean
  completed: boolean
  valid: boolean

  issue?: 'required' | 'invalid' | 'empty'
}

export interface AttributeCompletenessResult {
  totalFields: number
  completedFields: number

  requiredFields: number
  completedRequiredFields: number

  invalidFields: number

  percentage: number
  requiredPercentage: number

  isComplete: boolean

  items: AttributeCompletenessItem[]
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  )
}

function validateLocalValue(
  attribute: CanonicalProductAttribute,
  rule: AttributeRuleDefinition,
): boolean {
  if (isEmpty(attribute.value)) {
    return !rule.required
  }

  switch (rule.type) {
    case 'number': {
      const value = Number(attribute.value)

      if (!Number.isFinite(value)) {
        return false
      }

      if (rule.min !== undefined && value < rule.min) {
        return false
      }

      if (rule.max !== undefined && value > rule.max) {
        return false
      }

      return true
    }

    case 'boolean': {
      return (
        attribute.value === 'true' ||
        attribute.value === 'false'
      )
    }

    case 'select': {
      if (!rule.allowedValues || rule.allowedValues.length === 0) {
        return true
      }

      return rule.allowedValues.some(
        (option) =>
          option.toLowerCase() ===
          attribute.value.trim().toLowerCase(),
      )
    }

    case 'text':
    default:
      return true
  }
}

export function calculateAttributeCompleteness(
  attributes: CanonicalProductAttribute[],
  rules: Map<string, AttributeRuleDefinition>,
): AttributeCompletenessResult {
  const attributeMap = new Map(
    attributes.map((attribute) => [
      attribute.fieldKey.toLowerCase(),
      attribute,
    ]),
  )

  const items: AttributeCompletenessItem[] = []

  let completedFields = 0
  let requiredFields = 0
  let completedRequiredFields = 0
  let invalidFields = 0

  for (const [fieldKey, rule] of rules) {
    const attribute = attributeMap.get(fieldKey.toLowerCase())

    const value = attribute?.value ?? ''

    const empty = isEmpty(value)
    const valid = attribute
      ? validateLocalValue(attribute, rule)
      : !rule.required

    if (rule.required) {
      requiredFields++
    }

    let completed = false
    let issue: AttributeCompletenessItem['issue'] | undefined

    if (empty) {
      if (rule.required) {
        issue = 'required'
      } else {
        completed = false
        issue = 'empty'
      }
    } else if (!valid) {
      issue = 'invalid'
      invalidFields++
    } else {
      completed = true
      completedFields++

      if (rule.required) {
        completedRequiredFields++
      }
    }

    items.push({
      fieldKey,
      label: rule.fieldKey,
      value,
      required: rule.required,
      completed,
      valid,
      issue,
    })
  }

  const totalFields = rules.size

  const percentage =
    totalFields === 0
      ? 100
      : Math.round((completedFields / totalFields) * 100)

  const requiredPercentage =
    requiredFields === 0
      ? 100
      : Math.round((completedRequiredFields / requiredFields) * 100)

  return {
    totalFields,
    completedFields,
    requiredFields,
    completedRequiredFields,
    invalidFields,
    percentage,
    requiredPercentage,
    isComplete:
      requiredFields === completedRequiredFields &&
      invalidFields === 0,
    items,
  }
}
