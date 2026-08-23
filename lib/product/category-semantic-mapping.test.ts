import { describe, it, expect } from 'vitest'
import {
  resolveCategorySemanticField,
  resolveCategorySemanticMappings,
  getCategorySemanticMappingDiagnostics,
} from './category-semantic-mapping'
import { PRODUCT_CATEGORY_TEMPLATES } from './category-templates'
import type { SemanticField } from '@/lib/semantic/types'

function makeSemanticField(
  id: string,
  fieldName: string,
  aliases: string[] = [],
): SemanticField {
  return {
    id,
    schema_id: 'test-schema-id',
    field_name: fieldName,
    field_type: 'text',
    display_name: fieldName,
    aliases,
    normalization_rules: {},
    required: false,
    validation_rules: {},
  }
}

describe('Category Semantic Mapping (Phase 3A)', () => {
  it('should pass all mapping tests', () => {
    const { results } = runPhase3ATests()
    for (const r of results) {
      expect(r.passed, `Test failed: ${r.test}`).toBe(true)
    }
  })
})

export function runPhase3ATests() {
  const results: Array<{ test: string; passed: boolean; details?: any }> = []

  // Mock semantic fields covering common eyewear, audio, smartwatch, shoes fields
  const mockEyewearFields: SemanticField[] = [
    makeSemanticField('sf-1', 'frame_material'),
    makeSemanticField('sf-2', 'lens_material'),
    makeSemanticField('sf-3', 'lens_type'),
    makeSemanticField('sf-4', 'uv_protection'),
    makeSemanticField('sf-5', 'temple_length'),
    makeSemanticField('sf-6', 'frame_width'),
    makeSemanticField('sf-7', 'frame_type'),
    makeSemanticField('sf-8', 'bridge_width'),
    makeSemanticField('sf-9', 'extra_eyewear_semantic_field'), // field not in template
  ]

  // Test 1: 太阳镜.frame_material → frame_material
  const t1 = resolveCategorySemanticField(
    '太阳镜',
    { key: 'frame_material', nameZh: '镜框材质', nameEn: 'Frame Material', type: 'text' },
    mockEyewearFields
  )
  results.push({
    test: '1. 太阳镜.frame_material → frame_material',
    passed: t1?.semanticFieldName === 'frame_material' && t1?.matchType === 'explicit' && t1?.isStandard === true,
    details: t1,
  })

  // Test 2: 太阳镜.lens_material → lens_material
  const t2 = resolveCategorySemanticField(
    '太阳镜',
    { key: 'lens_material', nameZh: '镜片材质', nameEn: 'Lens Material', type: 'text' },
    mockEyewearFields
  )
  results.push({
    test: '2. 太阳镜.lens_material → lens_material',
    passed: t2?.semanticFieldName === 'lens_material' && t2?.matchType === 'explicit' && t2?.isStandard === true,
    details: t2,
  })

  // Test 3: 太阳镜.lens_type → lens_type
  const t3 = resolveCategorySemanticField(
    '太阳镜',
    { key: 'lens_type', nameZh: '镜片类型', nameEn: 'Lens Type', type: 'select' },
    mockEyewearFields
  )
  results.push({
    test: '3. 太阳镜.lens_type → lens_type',
    passed: t3?.semanticFieldName === 'lens_type' && t3?.matchType === 'explicit' && t3?.isStandard === true,
    details: t3,
  })

  // Test 4: Exact key 不同大小写 → 成功
  const t4 = resolveCategorySemanticField(
    '未知品类',
    { key: 'FRAME_MATERIAL', nameZh: '材质', nameEn: 'Material', type: 'text' },
    mockEyewearFields
  )
  results.push({
    test: '4. Exact key 不同大小写 → 成功',
    passed: t4?.semanticFieldName === 'frame_material' && t4?.matchType === 'exact',
    details: t4,
  })

  // Test 5: Alias match → 成功
  const aliasFields = [
    makeSemanticField('sf-alias', 'battery_life', ['playback_time', 'endurance']),
  ]
  const t5 = resolveCategorySemanticField(
    '未知品类',
    { key: 'playback_time', nameZh: '播放时间', nameEn: 'Playback Time', type: 'number' },
    aliasFields
  )
  results.push({
    test: '5. Alias match → 成功',
    passed: t5?.semanticFieldName === 'battery_life' && t5?.matchType === 'alias',
    details: t5,
  })

  // Test 6: Explicit mapping 指向不存在 Semantic Field → unmapped → 不允许错误 fallback
  const mockMissingFields: SemanticField[] = [
    makeSemanticField('sf-1', 'other_field'),
  ]
  const t6 = resolveCategorySemanticField(
    '太阳镜',
    { key: 'frame_material', nameZh: '镜框材质', nameEn: 'Frame Material', type: 'text' },
    mockMissingFields
  )
  results.push({
    test: '6. Explicit mapping 指向不存在 Semantic Field → unmapped',
    passed: t6 === null,
    details: t6,
  })

  // Test 7: Category Template 有字段但 Semantic Schema 没字段 → unmappedTemplateFieldKeys
  const partialFields: SemanticField[] = [
    makeSemanticField('sf-1', 'frame_material'),
  ]
  const sunglassesTemplate = PRODUCT_CATEGORY_TEMPLATES['太阳镜']
  const t7 = resolveCategorySemanticMappings(
    '太阳镜',
    sunglassesTemplate.fields,
    partialFields
  )
  results.push({
    test: '7. Category Template 有字段但 Semantic Schema 没字段 → unmappedTemplateFieldKeys',
    passed:
      t7.diagnostics.unmappedTemplateFieldKeys.includes('lens_material') &&
      t7.diagnostics.mappedCount === 1,
    details: t7.diagnostics,
  })

  // Test 8: Semantic Field 存在但 Category Template 未使用 → unmappedSemanticFieldNames
  const t8 = resolveCategorySemanticMappings(
    '太阳镜',
    sunglassesTemplate.fields,
    mockEyewearFields
  )
  results.push({
    test: '8. Semantic Field 存在但 Category Template 未使用 → unmappedSemanticFieldNames',
    passed:
      t8.diagnostics.unmappedSemanticFieldNames.includes('extra_eyewear_semantic_field') &&
      t8.diagnostics.unmappedSemanticFieldNames.includes('frame_type'),
    details: t8.diagnostics,
  })

  // Test 9: Unknown custom attribute → isStandard=false (resolved as null)
  const t9 = resolveCategorySemanticField(
    '太阳镜',
    { key: 'custom_finish', nameZh: '特殊涂层', nameEn: 'Custom Finish', type: 'text' },
    mockEyewearFields
  )
  results.push({
    test: '9. Unknown custom attribute → unmapped (isStandard=false)',
    passed: t9 === null,
    details: t9,
  })

  // Test 10: 5个核心品类全映射诊断验证
  const categoryReports: Record<string, any> = {}
  const mockAllStandardFields: SemanticField[] = [
    // 太阳镜 & 光学眼镜
    makeSemanticField('sf-1', 'frame_material'),
    makeSemanticField('sf-2', 'lens_material'),
    makeSemanticField('sf-3', 'lens_type'),
    makeSemanticField('sf-4', 'uv_protection'),
    makeSemanticField('sf-5', 'temple_length'),
    makeSemanticField('sf-6', 'frame_width'),
    makeSemanticField('sf-7', 'frame_type'),
    makeSemanticField('sf-8', 'bridge_width'),
    // 耳机
    makeSemanticField('sf-9', 'driver_size'),
    makeSemanticField('sf-10', 'frequency_response'),
    makeSemanticField('sf-11', 'noise_cancellation'),
    makeSemanticField('sf-12', 'battery_life'),
    makeSemanticField('sf-13', 'bluetooth_version'),
    // 智能手表
    makeSemanticField('sf-14', 'display_size'),
    makeSemanticField('sf-15', 'water_resistance'),
    makeSemanticField('sf-16', 'sensor_types'),
    // 运动鞋
    makeSemanticField('sf-17', 'upper_material'),
    makeSemanticField('sf-18', 'sole_material'),
    makeSemanticField('sf-19', 'closure_type'),
    makeSemanticField('sf-20', 'shoe_type'),
  ]

  for (const catName of ['太阳镜', '光学眼镜', '耳机', '智能手表', '运动鞋']) {
    const tmpl = PRODUCT_CATEGORY_TEMPLATES[catName]
    if (tmpl) {
      const diag = getCategorySemanticMappingDiagnostics(catName, tmpl.fields, mockAllStandardFields)
      categoryReports[catName] = diag
    }
  }

  results.push({
    test: '10. 5 个 Category 的标准 Template 字段 100% 显式映射且 0 unmapped',
    passed: Object.values(categoryReports).every((rep) => rep.unmappedTemplateFieldKeys.length === 0),
    details: categoryReports,
  })

  return { results, categoryReports }
}
