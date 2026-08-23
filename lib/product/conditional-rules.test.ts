import { describe, it, expect } from 'vitest'
import type { ConditionalRule } from './conditional-rules'
import { resolveEffectiveAttributeRules } from './effective-attribute-rules'
import { getCategoryConditionalRules } from './category-conditional-rules'
import { buildAttributeSchemaState } from './attribute-schema-state'
import type { AttributeRuleDefinition } from './attribute-rules'
import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'

describe('Phase 3D-2 Conditional Attribute Rules Engine', () => {
  const baseRules = new Map<string, AttributeRuleDefinition>([
    [
      'lens_type',
      {
        fieldKey: 'lens_type',
        type: 'select',
        required: false,
        allowedValues: ['Polarized', 'Normal'],
      },
    ],
    [
      'uv_protection',
      {
        fieldKey: 'uv_protection',
        type: 'text',
        required: false,
      },
    ],
    [
      'frame_color',
      {
        fieldKey: 'frame_color',
        type: 'text',
        required: false,
      },
    ],
  ])

  const conditionalRules: ConditionalRule[] = [
    {
      id: 'sunglasses-polarized-uv-required',
      when: {
        fieldKey: 'lens_type',
        operator: 'equals',
        value: 'Polarized',
      },
      then: {
        fieldKey: 'uv_protection',
        effect: 'required',
      },
    },
    {
      id: 'hide-frame-when-normal',
      when: {
        fieldKey: 'lens_type',
        operator: 'equals',
        value: 'Normal',
      },
      then: {
        fieldKey: 'frame_color',
        effect: 'hide',
      },
    },
  ]

  it('Case 1: Polarized -> UV required', () => {
    const attributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Polarized',
        type: 'select',
        isStandard: true,
      },
      {
        fieldKey: 'uv_protection',
        value: '',
        type: 'text',
        isStandard: true,
      },
    ]

    const { rules, conditionalState } = resolveEffectiveAttributeRules(
      attributes,
      baseRules,
      conditionalRules,
    )

    const uvState = conditionalState.states.get('uv_protection')
    expect(uvState).toBeDefined()
    expect(uvState?.required).toBe(true)
    expect(uvState?.triggeredRuleIds).toContain('sunglasses-polarized-uv-required')

    const uvRule = rules.get('uv_protection')
    expect(uvRule?.required).toBe(true)
  })

  it('Case 2: Non-polarized -> UV optional', () => {
    const attributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Normal',
        type: 'select',
        isStandard: true,
      },
      {
        fieldKey: 'uv_protection',
        value: '',
        type: 'text',
        isStandard: true,
      },
    ]

    const { rules, conditionalState } = resolveEffectiveAttributeRules(
      attributes,
      baseRules,
      conditionalRules,
    )

    const uvState = conditionalState.states.get('uv_protection')
    expect(uvState?.required).toBe(false)
    expect(uvState?.triggeredRuleIds).not.toContain('sunglasses-polarized-uv-required')

    const uvRule = rules.get('uv_protection')
    expect(uvRule?.required).toBe(false)
  })

  it('Case 3: Hidden field value preservation', () => {
    const attributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Normal',
        type: 'select',
        isStandard: true,
      },
      {
        fieldKey: 'frame_color',
        value: 'Matte Black',
        type: 'text',
        isStandard: true,
      },
    ]

    const { conditionalState } = resolveEffectiveAttributeRules(
      attributes,
      baseRules,
      conditionalRules,
    )

    const frameState = conditionalState.states.get('frame_color')
    expect(frameState?.visible).toBe(false)

    // Ensure frame_color is NOT removed from attribute list
    expect(attributes.find((a) => a.fieldKey === 'frame_color')?.value).toBe('Matte Black')
  })

  it('Case 4: Completeness required count updates dynamically', () => {
    // When Normal (uv_protection optional)
    const normalAttrs: CanonicalProductAttribute[] = [
      { fieldKey: 'lens_type', value: 'Normal', type: 'select', isStandard: true },
    ]
    const { rules: normalRules } = resolveEffectiveAttributeRules(
      normalAttrs,
      baseRules,
      conditionalRules,
    )
    const normalSchemaState = buildAttributeSchemaState(normalAttrs, normalRules)
    expect(normalSchemaState.completeness.requiredFields).toBe(0)

    // When Polarized (uv_protection required)
    const polarizedAttrs: CanonicalProductAttribute[] = [
      { fieldKey: 'lens_type', value: 'Polarized', type: 'select', isStandard: true },
    ]
    const { rules: polarizedRules } = resolveEffectiveAttributeRules(
      polarizedAttrs,
      baseRules,
      conditionalRules,
    )
    const polarizedSchemaState = buildAttributeSchemaState(polarizedAttrs, polarizedRules)
    expect(polarizedSchemaState.completeness.requiredFields).toBe(1)
    expect(polarizedSchemaState.completeness.completedRequiredFields).toBe(0)
    expect(polarizedSchemaState.completeness.isComplete).toBe(false)
  })

  it('Case 5: Hidden field remains in Standard Attributes and does NOT enter Other Attributes', () => {
    const attributes: CanonicalProductAttribute[] = [
      { fieldKey: 'lens_type', value: 'Normal', type: 'select', isStandard: true },
      { fieldKey: 'frame_color', value: 'Silver', type: 'text', isStandard: true },
      { fieldKey: 'unknown_custom_key', value: 'CustomVal', type: 'text', isStandard: false },
    ]

    const { rules } = resolveEffectiveAttributeRules(
      attributes,
      baseRules,
      conditionalRules,
    )

    const schemaState = buildAttributeSchemaState(attributes, rules)

    expect(
      schemaState.standardAttributes.some((a) => a.fieldKey === 'frame_color'),
    ).toBe(true)
    expect(
      schemaState.otherAttributes.some((a) => a.fieldKey === 'frame_color'),
    ).toBe(false)
    expect(
      schemaState.otherAttributes.some((a) => a.fieldKey === 'unknown_custom_key'),
    ).toBe(true)
  })

  it('Case 6: getCategoryConditionalRules for real categories', () => {
    const sunglassesRules = getCategoryConditionalRules('太阳镜')
    expect(sunglassesRules.length).toBeGreaterThan(0)
    expect(sunglassesRules[0].id).toBe('sunglasses-polarized-uv-required')

    const emptyCategoryRules = getCategoryConditionalRules('Unknown Category')
    expect(emptyCategoryRules).toEqual([])
  })
})
