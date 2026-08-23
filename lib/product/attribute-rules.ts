import type { AttributeTemplateField } from './category-templates'
import type { SemanticFieldLike } from './category-semantic-mapping'

export interface AttributeRuleDefinition {
  fieldKey: string

  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'

  unit?: string | null

  required: boolean

  allowedValues?: string[]

  min?: number
  max?: number

  placeholderZh?: string
  placeholderEn?: string
}

export interface AttributeRuleDiagnostics {
  fieldKey: string

  typeConflict?: {
    template: string
    semantic: string
  }

  unitConflict?: {
    template: string
    semantic: string
  }

  optionConflict?: {
    template: string[]
    semantic: string[]
  }
}

type JsonRecord = Record<string, unknown>

function isRecord(
  value: unknown,
): value is JsonRecord {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  )
}

function normalize(
  value: unknown,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function normalizeType(
  value: unknown,
): AttributeRuleDefinition['type'] {
  if (
    value === 'number' ||
    value === 'boolean' ||
    value === 'select'
  ) {
    return value
  }

  return 'text'
}

function getValidationRules(
  field: SemanticFieldLike,
): JsonRecord {
  if (
    isRecord(field.validation_rules)
  ) {
    return field.validation_rules
  }

  return {}
}

function getAllowedValues(
  rules: JsonRecord,
): string[] {
  const values =
    rules.allowedValues ??
    rules.allowed_values

  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map(String)
    .map((value) => value.trim())
    .filter(Boolean)
}

function getNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value
  }

  return undefined
}

export function resolveAttributeRule(
  templateField: AttributeTemplateField,
  semanticField: SemanticFieldLike,
): {
  rule: AttributeRuleDefinition
  diagnostics: AttributeRuleDiagnostics
} {
  const templateType =
    normalizeType(templateField.type)

  const semanticType =
    normalizeType(
      semanticField.field_type,
    )

  const diagnostics: AttributeRuleDiagnostics =
    {
      fieldKey: templateField.key,
    }

  if (
    templateType !== semanticType
  ) {
    diagnostics.typeConflict = {
      template: templateType,
      semantic: semanticType,
    }
  }

  const templateUnit =
    templateField.unit?.trim() || null

  const semanticUnit =
    (() => {
      const rules =
        getValidationRules(
          semanticField,
        )

      const unit =
        rules.unit ??
        rules.unit_name

      return typeof unit === 'string'
        ? unit.trim()
        : null
    })()

  if (
    templateUnit &&
    semanticUnit &&
    normalize(templateUnit) !==
      normalize(semanticUnit)
  ) {
    diagnostics.unitConflict = {
      template: templateUnit,
      semantic: semanticUnit,
    }
  }

  const templateOptions =
    templateField.options ?? []

  const semanticOptions =
    getAllowedValues(
      getValidationRules(
        semanticField,
      ),
    )

  if (
    templateOptions.length > 0 &&
    semanticOptions.length > 0
  ) {
    const templateSet = new Set(
      templateOptions.map(normalize),
    )

    const semanticSet = new Set(
      semanticOptions.map(normalize),
    )

    const same =
      templateSet.size ===
        semanticSet.size &&
      [...templateSet].every(
        (value) =>
          semanticSet.has(value),
      )

    if (!same) {
      diagnostics.optionConflict = {
        template: templateOptions,
        semantic: semanticOptions,
      }
    }
  }

  const validationRules =
    getValidationRules(
      semanticField,
    )

  const min =
    getNumber(
      validationRules.min,
    )

  const max =
    getNumber(
      validationRules.max,
    )

  const rule: AttributeRuleDefinition =
    {
      fieldKey:
        templateField.key,

      type: templateType,

      unit:
        templateUnit ??
        semanticUnit ??
        null,

      required:
        Boolean(
          semanticField.required,
        ),

      allowedValues:
        semanticOptions.length > 0
          ? semanticOptions
          : templateOptions.length > 0
            ? templateOptions
            : undefined,

      min,

      max,

      placeholderZh:
        templateField.placeholderZh,

      placeholderEn:
        templateField.placeholderEn,
    }

  return {
    rule,
    diagnostics,
  }
}

export function resolveCategoryAttributeRules(
  templateFields: AttributeTemplateField[],
  semanticFields: SemanticFieldLike[],
  mappings: Array<{
    templateKey: string
    semanticFieldId: string
  }>,
): {
  rules: Map<string, AttributeRuleDefinition>
  diagnostics: AttributeRuleDiagnostics[]
} {
  const semanticById =
    new Map(
      semanticFields.map(
        (field) => [
          field.id,
          field,
        ],
      ),
    )

  const mappingByKey =
    new Map(
      mappings.map(
        (mapping) => [
          normalize(mapping.templateKey),
          mapping,
        ],
      ),
    )

  const rules =
    new Map<
      string,
      AttributeRuleDefinition
    >()

  const diagnostics: AttributeRuleDiagnostics[] =
    []

  for (const templateField of templateFields) {
    const mapping =
      mappingByKey.get(
        normalize(
          templateField.key,
        ),
      )

    if (!mapping) {
      continue
    }

    const semanticField =
      semanticById.get(
        mapping.semanticFieldId,
      )

    if (!semanticField) {
      continue
    }

    const resolved =
      resolveAttributeRule(
        templateField,
        semanticField,
      )

    rules.set(
      templateField.key,
      resolved.rule,
    )

    diagnostics.push(
      resolved.diagnostics,
    )
  }

  return {
    rules,
    diagnostics,
  }
}
