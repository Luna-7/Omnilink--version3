import { describe, it, expect } from 'vitest'
import { calculateAttributeCompleteness } from './attribute-completeness'
import { buildAttributeSchemaState } from './attribute-schema-state'
import type { AttributeRuleDefinition } from './attribute-rules'
import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import { getCategoryTemplate } from './category-templates'
import { resolveCategoryAttributeRules } from './attribute-rules'
import { resolveCategorySemanticMappings } from './category-semantic-mapping'

describe('Attribute Completeness & Schema State (Phase 3D-1)', () => {
  describe('calculateAttributeCompleteness', () => {
    it('handles empty rules map', () => {
      const rules = new Map<string, AttributeRuleDefinition>()
      const attributes: CanonicalProductAttribute[] = []

      const result = calculateAttributeCompleteness(attributes, rules)
      expect(result.totalFields).toBe(0)
      expect(result.completedFields).toBe(0)
      expect(result.requiredFields).toBe(0)
      expect(result.completedRequiredFields).toBe(0)
      expect(result.invalidFields).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.requiredPercentage).toBe(100)
      expect(result.isComplete).toBe(true)
      expect(result.items).toHaveLength(0)
    })

    it('correctly marks empty required and optional fields', () => {
      const rules = new Map<string, AttributeRuleDefinition>([
        [
          'brand',
          {
            fieldKey: 'brand',
            type: 'text',
            required: true,
          },
        ],
        [
          'description',
          {
            fieldKey: 'description',
            type: 'text',
            required: false,
          },
        ],
      ])

      const attributes: CanonicalProductAttribute[] = []
      const result = calculateAttributeCompleteness(attributes, rules)

      expect(result.totalFields).toBe(2)
      expect(result.completedFields).toBe(0)
      expect(result.requiredFields).toBe(1)
      expect(result.completedRequiredFields).toBe(0)
      expect(result.invalidFields).toBe(0)
      expect(result.percentage).toBe(0)
      expect(result.requiredPercentage).toBe(0)
      expect(result.isComplete).toBe(false)

      const brandItem = result.items.find((i) => i.fieldKey === 'brand')!
      expect(brandItem.required).toBe(true)
      expect(brandItem.completed).toBe(false)
      expect(brandItem.valid).toBe(false)
      expect(brandItem.issue).toBe('required')

      const descItem = result.items.find((i) => i.fieldKey === 'description')!
      expect(descItem.required).toBe(false)
      expect(descItem.completed).toBe(false)
      expect(descItem.valid).toBe(true)
      expect(descItem.issue).toBe('empty')
    })

    it('validates number fields including min and max', () => {
      const rules = new Map<string, AttributeRuleDefinition>([
        [
          'battery_life',
          {
            fieldKey: 'battery_life',
            type: 'number',
            required: true,
            min: 1,
            max: 100,
          },
        ],
      ])

      // 1. Valid number
      let res = calculateAttributeCompleteness(
        [{ fieldKey: 'battery_life', value: '24', type: 'number', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(1)
      expect(res.invalidFields).toBe(0)
      expect(res.isComplete).toBe(true)

      // 2. Below min
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'battery_life', value: '0', type: 'number', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(0)
      expect(res.invalidFields).toBe(1)
      expect(res.items[0].issue).toBe('invalid')
      expect(res.isComplete).toBe(false)

      // 3. Above max
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'battery_life', value: '150', type: 'number', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(0)
      expect(res.invalidFields).toBe(1)
      expect(res.items[0].issue).toBe('invalid')

      // 4. Non-number string
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'battery_life', value: 'three-days', type: 'number', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(0)
      expect(res.invalidFields).toBe(1)
      expect(res.items[0].issue).toBe('invalid')
    })

    it('validates boolean fields', () => {
      const rules = new Map<string, AttributeRuleDefinition>([
        [
          'noise_cancellation',
          {
            fieldKey: 'noise_cancellation',
            type: 'boolean',
            required: true,
          },
        ],
      ])

      // Valid boolean 'true'
      let res = calculateAttributeCompleteness(
        [{ fieldKey: 'noise_cancellation', value: 'true', type: 'boolean', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(1)
      expect(res.invalidFields).toBe(0)

      // Valid boolean 'false'
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'noise_cancellation', value: 'false', type: 'boolean', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(1)
      expect(res.invalidFields).toBe(0)

      // Invalid boolean 'yes'
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'noise_cancellation', value: 'yes', type: 'boolean', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(0)
      expect(res.invalidFields).toBe(1)
    })

    it('validates select fields with allowedValues', () => {
      const rules = new Map<string, AttributeRuleDefinition>([
        [
          'lens_type',
          {
            fieldKey: 'lens_type',
            type: 'select',
            required: true,
            allowedValues: ['Polarized', 'Non-polarized', 'Photochromic'],
          },
        ],
      ])

      // Valid allowed value (case-insensitive & trimmed)
      let res = calculateAttributeCompleteness(
        [{ fieldKey: 'lens_type', value: ' polarized ', type: 'select', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(1)
      expect(res.invalidFields).toBe(0)

      // Invalid option
      res = calculateAttributeCompleteness(
        [{ fieldKey: 'lens_type', value: 'Diamond', type: 'select', isStandard: true }],
        rules,
      )
      expect(res.completedFields).toBe(0)
      expect(res.invalidFields).toBe(1)
      expect(res.items[0].issue).toBe('invalid')
    })
  })

  describe('buildAttributeSchemaState', () => {
    it('segregates standard attributes and other/custom attributes', () => {
      const rules = new Map<string, AttributeRuleDefinition>([
        [
          'frame_material',
          {
            fieldKey: 'frame_material',
            type: 'text',
            required: true,
          },
        ],
        [
          'lens_material',
          {
            fieldKey: 'lens_material',
            type: 'text',
            required: false,
          },
        ],
      ])

      const attributes: CanonicalProductAttribute[] = [
        {
          fieldKey: 'frame_material',
          value: 'Titanium',
          type: 'text',
          isStandard: true,
        },
        {
          fieldKey: 'custom_designer_tag',
          value: 'Paris 2026',
          type: 'text',
          isStandard: false,
        },
        {
          fieldKey: 'special_series_code',
          value: 'X-900',
          type: 'text',
          isStandard: false,
        },
      ]

      const state = buildAttributeSchemaState(attributes, rules)

      expect(state.standardAttributes).toHaveLength(1)
      expect(state.standardAttributes[0].fieldKey).toBe('frame_material')

      expect(state.otherAttributes).toHaveLength(2)
      expect(state.otherAttributes.map((a) => a.fieldKey)).toEqual([
        'custom_designer_tag',
        'special_series_code',
      ])

      expect(state.completeness.totalFields).toBe(2)
      expect(state.completeness.completedFields).toBe(1)
      expect(state.completeness.requiredFields).toBe(1)
      expect(state.completeness.completedRequiredFields).toBe(1)
      expect(state.completeness.percentage).toBe(50)
      expect(state.completeness.requiredPercentage).toBe(100)
      expect(state.completeness.isComplete).toBe(true)
    })
  })

  describe('Calculations Across All 5 Category Templates', () => {
    const categoryNames = [
      '太阳镜',
      '光学眼镜',
      '耳机',
      '智能手表',
      '运动鞋',
    ]

    for (const catName of categoryNames) {
      it(`computes completeness and schema state for category: ${catName}`, () => {
        const template = getCategoryTemplate(catName)!
        expect(template).toBeDefined()

        const semanticFields = template.fields.map((f, idx) => ({
          id: `sf-${catName}-${idx}`,
          field_name: f.key,
          field_type: f.type,
          display_name: f.nameEn,
          required: false,
          allowed_values: f.options,
          validation_rules: f.options ? { enum: f.options } : {},
        }))

        const { mappings } = resolveCategorySemanticMappings(
          catName,
          template.fields,
          semanticFields,
        )

        const { rules } = resolveCategoryAttributeRules(
          template.fields,
          semanticFields,
          mappings,
        )
        expect(rules.size).toBe(template.fields.length)

        // 1. Test empty state
        const emptyState = buildAttributeSchemaState([], rules)
        expect(emptyState.completeness.totalFields).toBe(template.fields.length)
        expect(emptyState.completeness.completedFields).toBe(0)
        expect(emptyState.standardAttributes).toHaveLength(0)
        expect(emptyState.otherAttributes).toHaveLength(0)

        // 2. Test fully populated valid standard attributes + 1 custom attribute
        const validAttributes: CanonicalProductAttribute[] = template.fields.map(
          (field) => {
            let val = 'Sample Text'
            if (field.type === 'number') val = '120'
            else if (field.type === 'boolean') val = 'true'
            else if (field.type === 'select' && field.options && field.options.length > 0) {
              val = field.options[0]
            }
            return {
              fieldKey: field.key,
              value: val,
              type: field.type,
              isStandard: true,
            }
          },
        )

        validAttributes.push({
          fieldKey: 'custom_metadata_tag',
          value: 'Custom 123',
          type: 'text',
          isStandard: false,
        })

        const populatedState = buildAttributeSchemaState(validAttributes, rules)
        expect(populatedState.standardAttributes).toHaveLength(template.fields.length)
        expect(populatedState.otherAttributes).toHaveLength(1)
        expect(populatedState.completeness.completedFields).toBe(template.fields.length)
        expect(populatedState.completeness.invalidFields).toBe(0)
        expect(populatedState.completeness.percentage).toBe(100)
        expect(populatedState.completeness.isComplete).toBe(true)
      })
    }
  })
})
