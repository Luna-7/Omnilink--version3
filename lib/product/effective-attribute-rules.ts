import type { AttributeRuleDefinition } from './attribute-rules'
import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { ConditionalRule } from './conditional-rules'
import { resolveConditionalAttributeState } from './conditional-rules'

export function resolveEffectiveAttributeRules(
  attributes: CanonicalProductAttribute[],
  baseRules: Map<string, AttributeRuleDefinition>,
  conditionalRules: ConditionalRule[],
): {
  rules: Map<string, AttributeRuleDefinition>
  conditionalState: ReturnType<typeof resolveConditionalAttributeState>
} {
  const conditionalState = resolveConditionalAttributeState(
    attributes,
    baseRules,
    conditionalRules,
  )

  const rules = new Map<string, AttributeRuleDefinition>()

  for (const [fieldKey, baseRule] of baseRules) {
    const state = conditionalState.states.get(fieldKey)

    if (!state) {
      rules.set(fieldKey, baseRule)
      continue
    }

    rules.set(fieldKey, {
      ...baseRule,
      required: state.required,
      // Hide/show is NOT encoded here.
      // This remains UI state.
    })
  }

  return {
    rules,
    conditionalState,
  }
}
