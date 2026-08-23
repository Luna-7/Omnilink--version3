import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeRuleDefinition } from './attribute-rules'

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'gte'
  | 'lte'
  | 'exists'
  | 'not_exists'

export type ConditionalEffect =
  | 'show'
  | 'hide'
  | 'required'
  | 'optional'

export interface ConditionalRule {
  id: string

  when: {
    fieldKey: string
    operator: ConditionalOperator
    value?: string | number | boolean | string[]
  }

  then: {
    fieldKey: string
    effect: ConditionalEffect
  }
}

export interface ConditionalAttributeState {
  visible: boolean
  required: boolean
  optional: boolean
  triggeredRuleIds: string[]
}

export interface ConditionalRuleDiagnostic {
  ruleId: string
  type:
    | 'missing_source_field'
    | 'missing_target_field'
    | 'invalid_operator'
    | 'type_mismatch'
    | 'cycle'
}

export interface ConditionalResolutionResult {
  states: Map<string, ConditionalAttributeState>
  diagnostics: ConditionalRuleDiagnostic[]
}

type AttributeValueMap = Map<
  string,
  CanonicalProductAttribute
>

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

function getValue(
  attributes: AttributeValueMap,
  fieldKey: string,
): unknown {
  return attributes.get(
    normalizeKey(fieldKey),
  )?.value
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  )
}

function toNumber(
  value: unknown,
): number | null {
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

    return Number.isFinite(parsed)
      ? parsed
      : null
  }

  return null
}

function normalizeBoolean(
  value: unknown,
): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized =
    value.trim().toLowerCase()

  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  return null
}

function normalizeString(
  value: unknown,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function valuesEqual(
  actual: unknown,
  expected: unknown,
): boolean {
  if (
    typeof actual === 'boolean' ||
    typeof expected === 'boolean'
  ) {
    const a = normalizeBoolean(actual)
    const b = normalizeBoolean(expected)

    return (
      a !== null &&
      b !== null &&
      a === b
    )
  }

  const actualNumber = toNumber(actual)
  const expectedNumber = toNumber(expected)

  if (
    actualNumber !== null &&
    expectedNumber !== null
  ) {
    return actualNumber === expectedNumber
  }

  return (
    normalizeString(actual) ===
    normalizeString(expected)
  )
}

function evaluateCondition(
  actual: unknown,
  rule: ConditionalRule['when'],
): boolean {
  switch (rule.operator) {
    case 'exists':
      return !isEmpty(actual)

    case 'not_exists':
      return isEmpty(actual)

    case 'equals':
      return valuesEqual(
        actual,
        rule.value,
      )

    case 'not_equals':
      return !valuesEqual(
        actual,
        rule.value,
      )

    case 'in':
      if (!Array.isArray(rule.value)) {
        return false
      }

      return rule.value.some(
        (candidate) =>
          valuesEqual(
            actual,
            candidate,
          ),
      )

    case 'not_in':
      if (!Array.isArray(rule.value)) {
        return false
      }

      return !rule.value.some(
        (candidate) =>
          valuesEqual(
            actual,
            candidate,
          ),
      )

    case 'gte': {
      const actualNumber =
        toNumber(actual)

      const expectedNumber =
        toNumber(rule.value)

      if (
        actualNumber === null ||
        expectedNumber === null
      ) {
        return false
      }

      return actualNumber >= expectedNumber
    }

    case 'lte': {
      const actualNumber =
        toNumber(actual)

      const expectedNumber =
        toNumber(rule.value)

      if (
        actualNumber === null ||
        expectedNumber === null
      ) {
        return false
      }

      return actualNumber <= expectedNumber
    }

    default:
      return false
  }
}

export function evaluateConditionalRule(
  rule: ConditionalRule,
  attributes: CanonicalProductAttribute[],
): boolean {
  const attributeMap =
    new Map(
      attributes.map((attribute) => [
        normalizeKey(
          attribute.fieldKey,
        ),
        attribute,
      ]),
    )

  const actual =
    getValue(
      attributeMap,
      rule.when.fieldKey,
    )

  return evaluateCondition(
    actual,
    rule.when,
  )
}

function buildDependencyGraph(
  rules: ConditionalRule[],
): Map<string, Set<string>> {
  const graph =
    new Map<string, Set<string>>()

  for (const rule of rules) {
    const source =
      normalizeKey(
        rule.when.fieldKey,
      )

    const target =
      normalizeKey(
        rule.then.fieldKey,
      )

    if (!graph.has(source)) {
      graph.set(
        source,
        new Set(),
      )
    }

    graph
      .get(source)!
      .add(target)
  }

  return graph
}

function detectCycles(
  rules: ConditionalRule[],
): Set<string> {
  const graph =
    buildDependencyGraph(rules)

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const cycleNodes = new Set<string>()

  function visit(node: string): void {
    if (visiting.has(node)) {
      cycleNodes.add(node)
      return
    }

    if (visited.has(node)) {
      return
    }

    visiting.add(node)

    for (
      const next
      of graph.get(node) ?? []
    ) {
      visit(next)

      if (cycleNodes.has(next)) {
        cycleNodes.add(node)
      }
    }

    visiting.delete(node)
    visited.add(node)
  }

  for (const node of graph.keys()) {
    visit(node)
  }

  return cycleNodes
}

export function resolveConditionalAttributeState(
  attributes: CanonicalProductAttribute[],
  baseRules: Map<
    string,
    AttributeRuleDefinition
  >,
  conditionalRules: ConditionalRule[],
): ConditionalResolutionResult {
  const attributeKeys = new Set(
    attributes.map((attribute) =>
      normalizeKey(
        attribute.fieldKey,
      ),
    ),
  )

  const baseRuleKeys = new Set(
    [...baseRules.keys()].map(
      normalizeKey,
    ),
  )

  const states =
    new Map<
      string,
      ConditionalAttributeState
    >()

  for (const [
    fieldKey,
    rule,
  ] of baseRules) {
    states.set(fieldKey, {
      visible: true,
      required: rule.required,
      optional: !rule.required,
      triggeredRuleIds: [],
    })
  }

  const diagnostics: ConditionalRuleDiagnostic[] =
    []

  const cycleNodes =
    detectCycles(conditionalRules)

  for (const rule of conditionalRules) {
    const sourceKey =
      normalizeKey(
        rule.when.fieldKey,
      )

    const targetKey =
      normalizeKey(
        rule.then.fieldKey,
      )

    if (
      !attributeKeys.has(sourceKey) &&
      !baseRuleKeys.has(sourceKey)
    ) {
      diagnostics.push({
        ruleId: rule.id,
        type: 'missing_source_field',
      })

      continue
    }

    if (
      !baseRuleKeys.has(targetKey)
    ) {
      diagnostics.push({
        ruleId: rule.id,
        type: 'missing_target_field',
      })

      continue
    }

    if (
      cycleNodes.has(sourceKey) &&
      cycleNodes.has(targetKey)
    ) {
      diagnostics.push({
        ruleId: rule.id,
        type: 'cycle',
      })

      continue
    }

    const triggered =
      evaluateConditionalRule(
        rule,
        attributes,
      )

    if (!triggered) {
      continue
    }

    const current =
      states.get(targetKey)

    if (!current) {
      continue
    }

    current.triggeredRuleIds.push(
      rule.id,
    )

    switch (rule.then.effect) {
      case 'show':
        current.visible = true
        break

      case 'hide':
        current.visible = false
        break

      case 'required':
        current.required = true
        current.optional = false
        break

      case 'optional':
        current.required = false
        current.optional = true
        break
    }
  }

  return {
    states,
    diagnostics,
  }
}
