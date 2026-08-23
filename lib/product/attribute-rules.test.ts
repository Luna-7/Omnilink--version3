import {
  resolveAttributeRule,
  resolveCategoryAttributeRules,
} from './attribute-rules'
import { PRODUCT_CATEGORY_TEMPLATES, type AttributeTemplateField } from './category-templates'
import { resolveCategorySemanticMappings } from './category-semantic-mapping'
import type { SemanticField } from '../semantic/types'

function makeSemanticField(
  id: string,
  fieldName: string,
  fieldType: 'text' | 'number' | 'boolean' | 'select' = 'text',
  options: {
    required?: boolean
    aliases?: string[]
    validation_rules?: Record<string, any>
    normalization_rules?: Record<string, any>
  } = {},
): SemanticField {
  return {
    id,
    schema_id: 'test-schema-id',
    field_name: fieldName,
    field_type: fieldType,
    display_name: fieldName,
    aliases: options.aliases || [],
    normalization_rules: options.normalization_rules || {},
    required: options.required ?? false,
    validation_rules: options.validation_rules || {},
  }
}

export function runPhase3BTests() {
  const results: Array<{ test: string; passed: boolean; details?: any }> = []

  // Test 1: select + matching options
  const t1Template: AttributeTemplateField = {
    key: 'lens_type',
    nameZh: '镜片类型',
    nameEn: 'Lens Type',
    type: 'select',
    options: ['偏光', '非偏光', '渐变', '变色'],
  }
  const t1Semantic = makeSemanticField('sf-1', 'lens_type', 'select', {
    validation_rules: { allowedValues: ['偏光', '非偏光', '渐变', '变色'] },
  })
  const t1 = resolveAttributeRule(t1Template, t1Semantic)
  results.push({
    test: '1. select + matching options',
    passed:
      t1.rule.type === 'select' &&
      !t1.diagnostics.optionConflict &&
      t1.rule.allowedValues?.length === 4,
    details: t1,
  })

  // Test 2: select + conflicting options
  const t2Template: AttributeTemplateField = {
    key: 'lens_type',
    nameZh: '镜片类型',
    nameEn: 'Lens Type',
    type: 'select',
    options: ['偏光', '其他'],
  }
  const t2Semantic = makeSemanticField('sf-2', 'lens_type', 'select', {
    validation_rules: { allowedValues: ['偏光', '非偏光', '渐变'] },
  })
  const t2 = resolveAttributeRule(t2Template, t2Semantic)
  results.push({
    test: '2. select + conflicting options -> detects optionConflict',
    passed:
      Boolean(t2.diagnostics.optionConflict) &&
      Boolean(t2.diagnostics.optionConflict?.template.includes('其他')) &&
      Boolean(t2.diagnostics.optionConflict?.semantic.includes('非偏光')),
    details: t2,
  })

  // Test 3: number + unit
  const t3Template: AttributeTemplateField = {
    key: 'temple_length',
    nameZh: '镜腿长度',
    nameEn: 'Temple Length',
    type: 'number',
    unit: 'mm',
  }
  const t3Semantic = makeSemanticField('sf-3', 'temple_length', 'number', {
    validation_rules: { unit: 'mm', min: 50, max: 200 },
  })
  const t3 = resolveAttributeRule(t3Template, t3Semantic)
  results.push({
    test: '3. number + unit',
    passed: t3.rule.type === 'number' && t3.rule.unit === 'mm' && !t3.diagnostics.unitConflict,
    details: t3,
  })

  // Test 4: number + min/max
  const t4Template: AttributeTemplateField = {
    key: 'battery_life',
    nameZh: '续航时间',
    nameEn: 'Battery Life',
    type: 'number',
    unit: 'hours',
  }
  const t4Semantic = makeSemanticField('sf-4', 'battery_life', 'number', {
    validation_rules: { min: 1, max: 100 },
  })
  const t4 = resolveAttributeRule(t4Template, t4Semantic)
  results.push({
    test: '4. number + min/max',
    passed: t4.rule.min === 1 && t4.rule.max === 100,
    details: t4,
  })

  // Test 5: boolean
  const t5Template: AttributeTemplateField = {
    key: 'water_resistance',
    nameZh: '是否防水',
    nameEn: 'Water Resistance',
    type: 'boolean',
  }
  const t5Semantic = makeSemanticField('sf-5', 'water_resistance', 'boolean')
  const t5 = resolveAttributeRule(t5Template, t5Semantic)
  results.push({
    test: '5. boolean',
    passed: t5.rule.type === 'boolean',
    details: t5,
  })

  // Test 6: required field
  const t6Template: AttributeTemplateField = {
    key: 'frame_material',
    nameZh: '镜框材质',
    nameEn: 'Frame Material',
    type: 'text',
  }
  const t6Semantic = makeSemanticField('sf-6', 'frame_material', 'text', {
    required: true,
  })
  const t6 = resolveAttributeRule(t6Template, t6Semantic)
  results.push({
    test: '6. required field inherits semanticField.required',
    passed: t6.rule.required === true,
    details: t6,
  })

  // Test 7: semantic allowedValues inherited when template has no options
  const t7Template: AttributeTemplateField = {
    key: 'closure_type',
    nameZh: '闭合方式',
    nameEn: 'Closure Type',
    type: 'select',
  }
  const t7Semantic = makeSemanticField('sf-7', 'closure_type', 'select', {
    validation_rules: { allowedValues: ['系带', '魔术贴', '套脚', '旋钮扣'] },
  })
  const t7 = resolveAttributeRule(t7Template, t7Semantic)
  results.push({
    test: '7. semantic allowedValues fallback for select',
    passed:
      t7.rule.allowedValues?.length === 4 &&
      t7.rule.allowedValues.includes('系带'),
    details: t7,
  })

  // Test 8: template/semantic type conflict
  const t8Template: AttributeTemplateField = {
    key: 'uv_protection',
    nameZh: 'UV防护',
    nameEn: 'UV Protection',
    type: 'select',
  }
  const t8Semantic = makeSemanticField('sf-8', 'uv_protection', 'text')
  const t8 = resolveAttributeRule(t8Template, t8Semantic)
  results.push({
    test: '8. template/semantic type conflict detected',
    passed:
      Boolean(t8.diagnostics.typeConflict) &&
      t8.diagnostics.typeConflict?.template === 'select' &&
      t8.diagnostics.typeConflict?.semantic === 'text',
    details: t8,
  })

  // Test 9: template/semantic unit conflict
  const t9Template: AttributeTemplateField = {
    key: 'temple_length',
    nameZh: '镜腿长度',
    nameEn: 'Temple Length',
    type: 'number',
    unit: 'cm',
  }
  const t9Semantic = makeSemanticField('sf-9', 'temple_length', 'number', {
    validation_rules: { unit: 'mm' },
  })
  const t9 = resolveAttributeRule(t9Template, t9Semantic)
  results.push({
    test: '9. template/semantic unit conflict detected',
    passed:
      Boolean(t9.diagnostics.unitConflict) &&
      t9.diagnostics.unitConflict?.template === 'cm' &&
      t9.diagnostics.unitConflict?.semantic === 'mm',
    details: t9,
  })

  // Test 10: unknown field -> not in category mappings -> returns empty rule resolution
  const t10Fields: AttributeTemplateField[] = [
    { key: 'unknown_custom_field', nameZh: '未知字段', nameEn: 'Unknown', type: 'text' },
  ]
  const t10SemanticFields: SemanticField[] = []
  const t10Mappings: Array<{ templateKey: string; semanticFieldId: string }> = []
  const t10 = resolveCategoryAttributeRules(t10Fields, t10SemanticFields, t10Mappings)
  results.push({
    test: '10. unknown field is not registered in resolved rules map',
    passed: t10.rules.size === 0,
    details: t10,
  })

  // Test 11: 5 categories all resolved without crashing
  const mockAllFields: SemanticField[] = [
    // 太阳镜 & 光学眼镜
    makeSemanticField('sf-1', 'frame_material', 'text', { required: true }),
    makeSemanticField('sf-2', 'lens_material', 'text'),
    makeSemanticField('sf-3', 'lens_type', 'select', { validation_rules: { allowedValues: ['偏光', '非偏光', '渐变', '变色'] } }),
    makeSemanticField('sf-4', 'uv_protection', 'select', { validation_rules: { allowedValues: ['UV400', 'UV380', '100% UVA/UVB'] } }),
    makeSemanticField('sf-5', 'temple_length', 'number', { validation_rules: { unit: 'mm', min: 50, max: 200 } }),
    makeSemanticField('sf-6', 'frame_width', 'number', { validation_rules: { unit: 'mm', min: 50, max: 200 } }),
    makeSemanticField('sf-7', 'frame_type', 'select', { validation_rules: { allowedValues: ['全框', '半框', '无框'] } }),
    makeSemanticField('sf-8', 'bridge_width', 'number', { validation_rules: { unit: 'mm', min: 10, max: 30 } }),
    // 耳机
    makeSemanticField('sf-9', 'driver_size', 'number', { validation_rules: { unit: 'mm', min: 5, max: 60 } }),
    makeSemanticField('sf-10', 'frequency_response', 'text'),
    makeSemanticField('sf-11', 'noise_cancellation', 'select', { validation_rules: { allowedValues: ['主动降噪 (ANC)', '被动降噪', '环境音透传', '无降噪'] } }),
    makeSemanticField('sf-12', 'battery_life', 'number', { validation_rules: { unit: 'hours', min: 1, max: 100 } }),
    makeSemanticField('sf-13', 'bluetooth_version', 'select', { validation_rules: { allowedValues: ['5.4', '5.3', '5.2', '5.1', '5.0'] } }),
    // 智能手表
    makeSemanticField('sf-14', 'display_size', 'number', { validation_rules: { unit: 'inches', min: 0.5, max: 3.0 } }),
    makeSemanticField('sf-15', 'water_resistance', 'select', { validation_rules: { allowedValues: ['5ATM', '50米防水', 'IP68', 'IP67', '3ATM', '生活防水'] } }),
    makeSemanticField('sf-16', 'sensor_types', 'text'),
    // 运动鞋
    makeSemanticField('sf-17', 'upper_material', 'text'),
    makeSemanticField('sf-18', 'sole_material', 'text'),
    makeSemanticField('sf-19', 'closure_type', 'select', { validation_rules: { allowedValues: ['系带', '魔术贴', '套脚', '旋钮扣'] } }),
    makeSemanticField('sf-20', 'shoe_type', 'select', { validation_rules: { allowedValues: ['慢跑鞋', '竞速鞋', '越野跑鞋', '训练鞋', '休闲跑鞋', '板鞋', '篮球鞋'] } }),
  ]

  const categoryRuleReports: Record<string, { totalRules: number; diagnosticsCount: number }> = {}

  for (const cat of ['太阳镜', '光学眼镜', '耳机', '智能手表', '运动鞋']) {
    const tmpl = PRODUCT_CATEGORY_TEMPLATES[cat]
    if (tmpl) {
      const mappingRes = resolveCategorySemanticMappings(cat, tmpl.fields, mockAllFields)
      const rulesRes = resolveCategoryAttributeRules(tmpl.fields, mockAllFields, mappingRes.mappings)
      categoryRuleReports[cat] = {
        totalRules: rulesRes.rules.size,
        diagnosticsCount: rulesRes.diagnostics.length,
      }
    }
  }

  results.push({
    test: '11. 5 categories rule resolution complete and consistent',
    passed: Object.values(categoryRuleReports).every((rep) => rep.totalRules > 0),
    details: categoryRuleReports,
  })

  return { results, categoryRuleReports }
}

import { describe, it, expect } from 'vitest'

describe('Attribute Rules Resolution (Phase 3B)', () => {
  const { results, categoryRuleReports } = runPhase3BTests()

  results.forEach((res) => {
    it(res.test, () => {
      expect(res.passed).toBe(true)
    })
  })

  it('verifies 5 core categories rules coverage', () => {
    for (const cat of ['太阳镜', '光学眼镜', '耳机', '智能手表', '运动鞋']) {
      expect(categoryRuleReports[cat]?.totalRules).toBeGreaterThan(0)
    }
  })
})
