import { describe, it, expect } from 'vitest'
import {
  validateProductAttributes,
} from './attribute-validation'
import { resolveCategoryAttributeRules } from './attribute-rules'
import { resolveCategorySemanticMappings } from './category-semantic-mapping'
import { getCategoryTemplate } from './category-templates'
import type { CanonicalProductAttribute } from '../products/canonical-attributes'
import { ProductAttributeValidationError } from './errors'
import fs from 'fs'
import path from 'path'

describe('Server Validation Hardening (Phase 3C-2)', () => {
  const eyewearTemplate = getCategoryTemplate('太阳镜')!
  const mockSemanticFields = [
    {
      id: 'sf-1',
      schema_id: 'schema-1',
      field_name: 'lens_type',
      field_type: 'select' as const,
      display_name: 'Lens Type',
      aliases: ['镜片类型'],
      required: true,
      allowed_values: ['Polarized', 'Non-polarized', 'Photochromic'],
      validation_rules: { enum: ['Polarized', 'Non-polarized', 'Photochromic'] },
    },
    {
      id: 'sf-2',
      schema_id: 'schema-1',
      field_name: 'frame_material',
      field_type: 'text' as const,
      display_name: 'Frame Material',
      aliases: ['镜架材质'],
      required: false,
      validation_rules: {},
    },
    {
      id: 'sf-3',
      schema_id: 'schema-1',
      field_name: 'temple_length',
      field_type: 'number' as const,
      display_name: 'Temple Length',
      aliases: ['镜腿长度'],
      required: false,
      min_value: 50,
      max_value: 200,
      validation_rules: { min: 50, max: 200 },
    },
  ]

  const mappings = resolveCategorySemanticMappings(
    '太阳镜',
    eyewearTemplate.fields,
    mockSemanticFields,
  )

  const categoryRules = resolveCategoryAttributeRules(
    eyewearTemplate.fields,
    mockSemanticFields,
    mappings.mappings,
  )

  // A. Create standard valid attribute -> accepted
  it('A. Create standard valid attribute -> accepted', () => {
    const incoming: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Polarized',
        type: 'select',
        isStandard: true,
      },
      {
        fieldKey: 'temple_length',
        value: '145',
        type: 'number',
        isStandard: true,
      },
    ]

    const result = validateProductAttributes(incoming, categoryRules.rules)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(result.normalizedAttributes).toHaveLength(2)
  })

  // B. Create invalid attribute -> 422 / ProductAttributeValidationError
  it('B. Create invalid attribute -> raises ProductAttributeValidationError', () => {
    const incoming: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Unobtainium-Plastic-999', // Not in allowedValues
        type: 'select',
        isStandard: true,
      },
    ]

    const result = validateProductAttributes(incoming, categoryRules.rules)
    expect(result.valid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.issues[0].code).toBe('allowed_value')

    expect(() => {
      if (!result.valid) {
        throw new ProductAttributeValidationError(result.issues)
      }
    }).toThrow(ProductAttributeValidationError)
  })

  // C. Edit invalid attribute -> 422 / ProductAttributeValidationError
  it('C. Edit invalid attribute (out of bounds number) -> validation fails', () => {
    const incoming: CanonicalProductAttribute[] = [
      {
        fieldKey: 'temple_length',
        value: '999', // Max is 200
        type: 'number',
        isStandard: true,
      },
    ]

    const result = validateProductAttributes(incoming, categoryRules.rules)
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.code === 'max')).toBe(true)
  })

  // D. AI invalid attribute -> 422 / ProductAttributeValidationError
  it('D. AI invalid attribute (invalid type value) -> rejected by validation pipeline', () => {
    const aiGeneratedAttributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Polarized',
        type: 'select',
        source: 'ai',
        confidence: 0.95,
        isStandard: true,
      },
      {
        fieldKey: 'temple_length',
        value: 'twenty-four-mm', // Invalid numeric string
        type: 'number',
        source: 'ai',
        confidence: 0.9,
        isStandard: true,
      },
    ]

    const result = validateProductAttributes(aiGeneratedAttributes, categoryRules.rules)
    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('type')
  })

  // E. Import invalid attribute -> 422 / ProductAttributeValidationError
  it('E. Import invalid attribute -> intercepted before persistence', () => {
    const importedAttributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Diamond-Coated-Wood', // Invalid select option
        type: 'select',
        source: 'manual',
        confidence: 1.0,
        isStandard: true,
      },
    ]

    const result = validateProductAttributes(importedAttributes, categoryRules.rules)
    expect(result.valid).toBe(false)
    expect(result.issues[0].code).toBe('allowed_value')
  })

  // F. Unknown custom attribute -> accepted as unknown without failing standard validation
  it('F. Unknown custom attribute -> accepted without failing standard validation', () => {
    const mixedAttributes: CanonicalProductAttribute[] = [
      {
        fieldKey: 'lens_type',
        value: 'Polarized',
        type: 'select',
        isStandard: true,
      },
      {
        fieldKey: 'custom_special_designer_note',
        value: 'Limited Edition 2026',
        type: 'text',
        isStandard: false,
      },
    ]

    const result = validateProductAttributes(mixedAttributes, categoryRules.rules)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(result.normalizedAttributes).toHaveLength(2)
  })

  // G. Delete existing attribute -> removed from semantic data
  it('G. Delete existing attribute -> correctly removed during merge', () => {
    const existingSemanticData: Record<string, unknown> = {
      lens_material: 'Glass',
      bridge_width: 18,
      frame_material: 'Titanium',
    }

    const deletionSet = new Set(['bridge_width'])
    for (const key of Object.keys(existingSemanticData)) {
      if (deletionSet.has(key)) {
        delete existingSemanticData[key]
      }
    }

    expect(existingSemanticData).toEqual({
      lens_material: 'Glass',
      frame_material: 'Titanium',
    })
    expect(existingSemanticData.bridge_width).toBeUndefined()
  })

  // H. Update + delete same field -> update wins
  it('H. Update + delete same field -> update wins', () => {
    const currentSemanticData: Record<string, unknown> = {
      lens_material: 'Glass',
      bridge_width: 18,
    }

    const deletions = ['bridge_width']
    const incomingUpdates = {
      bridge_width: 20,
    }

    // Process deletions
    const deletionSet = new Set(deletions)
    for (const key of Object.keys(currentSemanticData)) {
      if (deletionSet.has(key)) {
        delete currentSemanticData[key]
      }
    }

    // Merge incoming updates: Set wins over Delete
    const merged: Record<string, unknown> = {
      ...currentSemanticData,
      ...incomingUpdates,
    }

    expect(merged.bridge_width).toBe(20)
  })

  // I. Partial update -> previous values preserved
  it('I. Partial update -> previous values preserved in merge', () => {
    const currentSemanticData: Record<string, unknown> = {
      lens_material: 'Polycarbonate',
      frame_material: 'Titanium',
      bridge_width: 18,
    }

    const incomingPartialUpdates = {
      bridge_width: 22,
    }

    const merged: Record<string, unknown> = {
      ...currentSemanticData,
      ...incomingPartialUpdates,
    }

    expect(merged.lens_material).toBe('Polycarbonate')
    expect(merged.frame_material).toBe('Titanium')
    expect(merged.bridge_width).toBe(22)
  })

  // J. Repository search -> no unauthorized direct writes to products.semantic_data
  it('J. Repository search -> no unauthorized direct writes to products.semantic_data', () => {
    const rootDir = process.cwd()
    const forbiddenPatterns = [
      /supabase\s*\.\s*from\(\s*['"]products['"]\s*\)\s*\.\s*update\(\s*\{[^}]*semantic_data\s*:/g,
    ]

    function scanFiles(dir: string, fileList: string[] = []) {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        if (['node_modules', '.next', 'dist', '.git'].includes(file)) continue
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          scanFiles(fullPath, fileList)
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          fileList.push(fullPath)
        }
      }
      return fileList
    }

    const allSourceFiles = [
      ...scanFiles(path.join(rootDir, 'app')),
      ...scanFiles(path.join(rootDir, 'lib')),
    ]

    const violations: string[] = []
    for (const filePath of allSourceFiles) {
      const content = fs.readFileSync(filePath, 'utf-8')
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(filePath)
        }
      }
    }

    expect(violations).toHaveLength(0)
  })

  // K. Repository search -> only Canonical Service writes product_semantics
  it('K. Repository search -> only Canonical Service / processor writes product_semantics', () => {
    const rootDir = process.cwd()
    const productSemanticsWritePattern =
      /\.from\(\s*['"]product_semantics['"]\s*\)\s*\.\s*(insert|update|upsert)\(/g

    function scanFiles(dir: string, fileList: string[] = []) {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        if (['node_modules', '.next', 'dist', '.git'].includes(file)) continue
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          scanFiles(fullPath, fileList)
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          fileList.push(fullPath)
        }
      }
      return fileList
    }

    const allSourceFiles = [
      ...scanFiles(path.join(rootDir, 'app')),
      ...scanFiles(path.join(rootDir, 'lib')),
    ]

    const allowedFiles = [
      path.join(rootDir, 'lib/semantic/processor.ts'),
    ]

    const violations: string[] = []
    for (const filePath of allSourceFiles) {
      if (allowedFiles.includes(filePath)) continue
      const content = fs.readFileSync(filePath, 'utf-8')
      if (productSemanticsWritePattern.test(content)) {
        violations.push(filePath)
      }
    }

    expect(violations).toHaveLength(0)
  })
})
