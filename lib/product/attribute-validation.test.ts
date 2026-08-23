import { describe, it, expect } from 'vitest'
import {
  validateSingleAttribute,
  validateProductAttributes,
} from './attribute-validation'
import { AttributeRuleDefinition } from './attribute-rules'
import { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import { ProductAttributeValidationError } from './errors'

describe('Attribute Validation Engine (Phase 3B)', () => {
  // 1. Required field empty -> returns required issue
  it('1. should reject required empty attribute', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'battery_capacity',
      value: '',
      type: 'number',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'battery_capacity',
      type: 'number',
      required: true,
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(1)
    expect(res.issues[0].code).toBe('required')
  })

  // 2. Optional field empty -> normalized without issue
  it('2. should accept optional empty attribute and normalize it', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'noise_cancellation',
      value: '',
      type: 'text',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'noise_cancellation',
      type: 'select',
      required: false,
      allowedValues: ['ANC', 'ENC', 'None'],
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(0)
    expect(res.normalized?.value).toBe('')
    expect(res.normalized?.type).toBe('select')
  })

  // 3. Select valid option -> accepted and normalized
  it('3. should accept valid select option with case normalization', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'dial_shape',
      value: 'round',
      type: 'select',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'dial_shape',
      type: 'select',
      required: true,
      allowedValues: ['Round', 'Square', 'Oval'],
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(0)
    expect(res.normalized?.value).toBe('Round')
  })

  // 4. Select invalid option -> rejected with allowed_value issue
  it('4. should reject select option not in allowedValues', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'dial_shape',
      value: 'Triangle',
      type: 'select',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'dial_shape',
      type: 'select',
      required: true,
      allowedValues: ['Round', 'Square', 'Oval'],
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(1)
    expect(res.issues[0].code).toBe('allowed_value')
  })

  // 5. Number valid within min/max -> accepted
  it('5. should accept valid number within range', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'battery_capacity',
      value: '500',
      type: 'number',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'battery_capacity',
      type: 'number',
      required: false,
      min: 50,
      max: 1000,
      unit: 'mAh',
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(0)
    expect(res.normalized?.value).toBe('500')
    expect(res.normalized?.unit).toBe('mAh')
  })

  // 6. Number below min -> rejected
  it('6. should reject number below minimum', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'battery_capacity',
      value: '20',
      type: 'number',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'battery_capacity',
      type: 'number',
      required: false,
      min: 50,
      max: 1000,
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(1)
    expect(res.issues[0].code).toBe('min')
  })

  // 7. Number above max -> rejected
  it('7. should reject number above maximum', () => {
    const attr: CanonicalProductAttribute = {
      fieldKey: 'battery_capacity',
      value: '2000',
      type: 'number',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'battery_capacity',
      type: 'number',
      required: false,
      min: 50,
      max: 1000,
    }
    const res = validateSingleAttribute(attr, rule)
    expect(res.issues.length).toBe(1)
    expect(res.issues[0].code).toBe('max')
  })

  // 8. Boolean validation -> normalizes boolean strings
  it('8. should normalize boolean true/false and reject non-boolean', () => {
    const validAttr: CanonicalProductAttribute = {
      fieldKey: 'waterproof',
      value: 'true',
      type: 'boolean',
      isStandard: true,
    }
    const rule: AttributeRuleDefinition = {
      fieldKey: 'waterproof',
      type: 'boolean',
      required: false,
    }
    const resValid = validateSingleAttribute(validAttr, rule)
    expect(resValid.issues.length).toBe(0)
    expect(resValid.normalized?.value).toBe('true')

    const invalidAttr: CanonicalProductAttribute = {
      fieldKey: 'waterproof',
      value: 'maybe',
      type: 'boolean',
      isStandard: true,
    }
    const resInvalid = validateSingleAttribute(invalidAttr, rule)
    expect(resInvalid.issues.length).toBe(1)
    expect(resInvalid.issues[0].code).toBe('invalid_boolean')
  })

  // 9. Multi-attribute validation & 422 error structure
  it('9. should validate multiple attributes and produce ProductAttributeValidationError issues', () => {
    const rules = new Map<string, AttributeRuleDefinition>([
      ['battery_capacity', { fieldKey: 'battery_capacity', type: 'number', min: 100, required: true }],
      ['dial_shape', { fieldKey: 'dial_shape', type: 'select', allowedValues: ['Round', 'Square'], required: true }],
    ])

    const attributes: CanonicalProductAttribute[] = [
      { fieldKey: 'battery_capacity', value: '50', type: 'number', isStandard: true },
      { fieldKey: 'dial_shape', value: 'Hexagon', type: 'select', isStandard: true },
    ]

    const result = validateProductAttributes(attributes, rules)
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBe(2)

    const error = new ProductAttributeValidationError(result.issues)
    expect(error.issues).toHaveLength(2)
    expect(error.name).toBe('ProductAttributeValidationError')
  })

  // 10. Category switch / preservation
  it('10. should preserve custom / unmapped attributes untouched', () => {
    const rules = new Map<string, AttributeRuleDefinition>([
      ['dial_shape', { fieldKey: 'dial_shape', type: 'select', allowedValues: ['Round'], required: false }],
    ])

    const attributes: CanonicalProductAttribute[] = [
      { fieldKey: 'dial_shape', value: 'Round', type: 'select', isStandard: true },
      { fieldKey: 'custom_strap_material', value: 'Leather', type: 'text', isStandard: false },
    ]

    const result = validateProductAttributes(attributes, rules)
    expect(result.valid).toBe(true)
    expect(result.normalizedAttributes.length).toBe(2)
    const custom = result.normalizedAttributes.find((a) => a.fieldKey === 'custom_strap_material')
    expect(custom?.value).toBe('Leather')
  })

  // 11. Custom attribute preservation alongside standard rules
  it('11. should handle custom attributes alongside category rules', () => {
    const rules = new Map<string, AttributeRuleDefinition>()
    const attributes: CanonicalProductAttribute[] = [
      { fieldKey: 'special_feature', value: 'NFC', type: 'text', isStandard: false },
    ]
    const result = validateProductAttributes(attributes, rules)
    expect(result.valid).toBe(true)
    expect(result.normalizedAttributes[0].value).toBe('NFC')
  })

  // 12. Missing required attribute when not provided in attributes list
  it('12. should identify missing required attribute as issue', () => {
    const rules = new Map<string, AttributeRuleDefinition>([
      ['mandatory_field', { fieldKey: 'mandatory_field', type: 'text', required: true }],
    ])
    const attributes: CanonicalProductAttribute[] = []
    const result = validateProductAttributes(attributes, rules)
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBe(1)
    expect(result.issues[0].code).toBe('required')
  })
})
