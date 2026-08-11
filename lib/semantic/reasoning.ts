export interface SemanticRule {
  id: string
  name: string
  description: string | null
  industry: string | null
  condition: Record<string, unknown>
  conclusion: Record<string, unknown>
  confidence: number
  created_at: string
}

export interface RuleCondition {
  field?: string
  operator?: '=' | '<' | '>'
  value?: unknown
  and?: RuleCondition[]
}

export function evaluateCondition(
  condition: RuleCondition,
  data: Record<string, unknown>,
): boolean {
  if (condition.and) {
    return condition.and.every(item => evaluateCondition(item, data))
  }

  const value = data[condition.field || '']

  switch (condition.operator) {
    case '<':
      return typeof value === 'number' && typeof condition.value === 'number'
        ? value < condition.value
        : false
    case '>':
      return typeof value === 'number' && typeof condition.value === 'number'
        ? value > condition.value
        : false
    default:
      return value === condition.value
  }
}

export function applyRules(
  rules: SemanticRule[],
  semanticData: Record<string, unknown>,
): Record<string, unknown> {
  const derived: Record<string, unknown> = {}

  rules.forEach(rule => {
    if (evaluateCondition(rule.condition as RuleCondition, semanticData)) {
      Object.assign(derived, rule.conclusion)
    }
  })

  return derived
}
