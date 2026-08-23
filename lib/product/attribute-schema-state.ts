import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeRuleDefinition } from './attribute-rules'
import {
  calculateAttributeCompleteness,
  type AttributeCompletenessResult,
} from './attribute-completeness'

export interface AttributeSchemaState {
  standardAttributes: CanonicalProductAttribute[]
  otherAttributes: CanonicalProductAttribute[]

  completeness: AttributeCompletenessResult
}

export function buildAttributeSchemaState(
  attributes: CanonicalProductAttribute[],
  rules: Map<string, AttributeRuleDefinition>,
): AttributeSchemaState {
  const standardKeys = new Set(
    [...rules.keys()].map((key) => key.toLowerCase()),
  )

  const standardAttributes = attributes.filter((attribute) =>
    standardKeys.has(attribute.fieldKey.toLowerCase()),
  )

  const otherAttributes = attributes.filter(
    (attribute) => !standardKeys.has(attribute.fieldKey.toLowerCase()),
  )

  const completeness = calculateAttributeCompleteness(attributes, rules)

  return {
    standardAttributes,
    otherAttributes,
    completeness,
  }
}
