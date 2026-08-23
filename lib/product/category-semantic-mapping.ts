import type { AttributeTemplateField } from './category-templates'
import type { Database } from '@/lib/database.types'
import type { SemanticField as ProcessorSemanticField } from '@/lib/semantic/types'

type SemanticFieldRow =
  Database['public']['Tables']['semantic_fields']['Row']

export type SemanticFieldLike =
  | SemanticFieldRow
  | ProcessorSemanticField
  | {
      id: string
      field_name: string
      aliases?: string[] | unknown
      [key: string]: unknown
    }

export interface CategorySemanticFieldMapping {
  categoryTemplateId: string
  category: string

  templateKey: string

  semanticFieldId: string
  semanticFieldName: string

  matchType: 'explicit' | 'exact' | 'alias'

  isStandard: true
}

export interface CategorySemanticMappingDiagnostics {
  category: string
  templateFieldCount: number
  mappedCount: number

  unmappedTemplateFieldKeys: string[]
  unmappedSemanticFieldNames: string[]

  explicitMappings: string[]
  exactMappings: string[]
  aliasMappings: string[]
}

export interface CategorySemanticMappingResult {
  mappings: CategorySemanticFieldMapping[]
  unmappedTemplateFields: AttributeTemplateField[]
  unmappedSemanticFields: SemanticFieldLike[]
  diagnostics: CategorySemanticMappingDiagnostics
}

type ExplicitMappingTable = Record<
  string,
  Record<string, string>
>

/**
 * Phase 3A explicit mapping registry.
 *
 * IMPORTANT:
 * This is intentionally code-level for now.
 * Do not create a DB mapping table yet.
 *
 * UI Category Template Field
 *          ↓
 * Semantic Field
 */
export const CATEGORY_SEMANTIC_FIELD_MAP: ExplicitMappingTable = {
  '太阳镜': {
    frame_material: 'frame_material',
    lens_material: 'lens_material',
    lens_type: 'lens_type',
    uv_protection: 'uv_protection',
    temple_length: 'temple_length',
    frame_width: 'frame_width',
  },

  '光学眼镜': {
    frame_material: 'frame_material',
    frame_type: 'frame_type',
    bridge_width: 'bridge_width',
    temple_length: 'temple_length',
  },

  '耳机': {
    driver_size: 'driver_size',
    frequency_response: 'frequency_response',
    noise_cancellation: 'noise_cancellation',
    battery_life: 'battery_life',
    bluetooth_version: 'bluetooth_version',
  },

  '智能手表': {
    display_size: 'display_size',
    battery_life: 'battery_life',
    water_resistance: 'water_resistance',
    sensor_types: 'sensor_types',
  },

  '运动鞋': {
    upper_material: 'upper_material',
    sole_material: 'sole_material',
    closure_type: 'closure_type',
    shoe_type: 'shoe_type',
  },
}

function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function normalizeCategory(value: unknown): string {
  return String(value ?? '').trim()
}

function getSemanticFieldByName(
  semanticFields: SemanticFieldLike[],
  fieldName: string,
): SemanticFieldLike | undefined {
  const target = normalizeKey(fieldName)

  return semanticFields.find(
    (field) =>
      normalizeKey(field.field_name) === target,
  )
}

function getAliasValues(
  aliases: unknown,
): string[] {
  if (!Array.isArray(aliases)) {
    return []
  }

  return aliases
    .map((alias) => String(alias).trim())
    .filter(Boolean)
}

export function resolveCategorySemanticField(
  category: string,
  templateField: AttributeTemplateField,
  semanticFields: SemanticFieldLike[],
): CategorySemanticFieldMapping | null {
  const normalizedCategory = normalizeCategory(category)
  const templateKey = normalizeKey(templateField.key)

  if (!normalizedCategory || !templateKey) {
    return null
  }

  const categoryMap =
    CATEGORY_SEMANTIC_FIELD_MAP[
      normalizedCategory
    ]

  /**
   * 1. Explicit Mapping
   *
   * If an explicit mapping exists, it MUST resolve
   * to the configured Semantic Field.
   *
   * Do not silently fallback to another field.
   */
  const explicitSemanticName =
    categoryMap?.[templateField.key]

  if (explicitSemanticName) {
    const semanticField =
      getSemanticFieldByName(
        semanticFields,
        explicitSemanticName,
      )

    if (!semanticField) {
      return null
    }

    return {
      categoryTemplateId: normalizedCategory,
      category: normalizedCategory,
      templateKey: templateField.key,
      semanticFieldId: semanticField.id,
      semanticFieldName: semanticField.field_name,
      matchType: 'explicit',
      isStandard: true,
    }
  }

  /**
   * 2. Exact field key
   */
  const exactField = getSemanticFieldByName(
    semanticFields,
    templateKey,
  )

  if (exactField) {
    return {
      categoryTemplateId: normalizedCategory,
      category: normalizedCategory,
      templateKey: templateField.key,
      semanticFieldId: exactField.id,
      semanticFieldName: exactField.field_name,
      matchType: 'exact',
      isStandard: true,
    }
  }

  /**
   * 3. Alias matching
   *
   * Alias is compatibility only.
   * It does NOT replace explicit mapping.
   */
  const aliasField = semanticFields.find(
    (field) => {
      const aliases = getAliasValues(
        field.aliases,
      )

      return aliases.some(
        (alias) =>
          normalizeKey(alias) === templateKey,
      )
    },
  )

  if (aliasField) {
    return {
      categoryTemplateId: normalizedCategory,
      category: normalizedCategory,
      templateKey: templateField.key,
      semanticFieldId: aliasField.id,
      semanticFieldName: aliasField.field_name,
      matchType: 'alias',
      isStandard: true,
    }
  }

  return null
}

export function resolveCategorySemanticMappings(
  category: string,
  templateFields: AttributeTemplateField[],
  semanticFields: SemanticFieldLike[],
): CategorySemanticMappingResult {
  const normalizedCategory =
    normalizeCategory(category)

  const mappings: CategorySemanticFieldMapping[] = []

  const unmappedTemplateFields: AttributeTemplateField[] = []

  const mappedSemanticFieldIds = new Set<string>()

  const explicitMappings: string[] = []
  const exactMappings: string[] = []
  const aliasMappings: string[] = []

  for (const templateField of templateFields) {
    const mapping =
      resolveCategorySemanticField(
        normalizedCategory,
        templateField,
        semanticFields,
      )

    if (!mapping) {
      unmappedTemplateFields.push(
        templateField,
      )
      continue
    }

    mappings.push(mapping)

    mappedSemanticFieldIds.add(
      mapping.semanticFieldId,
    )

    const mappingLabel =
      `${templateField.key} → ${mapping.semanticFieldName}`

    if (mapping.matchType === 'explicit') {
      explicitMappings.push(
        mappingLabel,
      )
    } else if (mapping.matchType === 'exact') {
      exactMappings.push(
        mappingLabel,
      )
    } else {
      aliasMappings.push(
        mappingLabel,
      )
    }
  }

  const unmappedSemanticFields =
    semanticFields.filter(
      (field) =>
        !mappedSemanticFieldIds.has(
          field.id,
        ),
    )

  const diagnostics: CategorySemanticMappingDiagnostics = {
    category: normalizedCategory,
    templateFieldCount:
      templateFields.length,
    mappedCount: mappings.length,
    unmappedTemplateFieldKeys:
      unmappedTemplateFields.map(
        (field) => field.key,
      ),
    unmappedSemanticFieldNames:
      unmappedSemanticFields.map(
        (field) => field.field_name,
      ),
    explicitMappings,
    exactMappings,
    aliasMappings,
  }

  return {
    mappings,
    unmappedTemplateFields,
    unmappedSemanticFields,
    diagnostics,
  }
}

export function getCategorySemanticMappingDiagnostics(
  category: string,
  templateFields: AttributeTemplateField[],
  semanticFields: SemanticFieldLike[],
): CategorySemanticMappingDiagnostics {
  return resolveCategorySemanticMappings(
    category,
    templateFields,
    semanticFields,
  ).diagnostics
}
