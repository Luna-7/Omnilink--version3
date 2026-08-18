import { Json } from '@/lib/database.types'

export type RawData = Record<string, unknown>

export type SemanticFieldType = 'text' | 'number' | 'boolean' | 'select'

export type SemanticSourceType =
  | 'alias_match'
  | 'normalization'
  | 'rule_validation'
  | 'llm_inference'
  | 'human_correction'

export interface SemanticField {
  id: string
  schema_id: string
  field_name: string
  field_type: SemanticFieldType
  display_name: string
  aliases: string[]
  normalization_rules: {
    mappings?: Record<string, string>
  }
  required: boolean
  validation_rules: {
    min?: number
    max?: number
    allowedValues?: string[]
  }
}

export interface SemanticSchema {
  id: string
  industry_id: string | null
  version: string
  schema: Json
}

export interface SemanticEvidence {
  source_type: SemanticSourceType
  processor_version: string
  confidence: number
  explanation?: string
}

export interface SemanticFieldResult<T = unknown> {
  value: T
  evidence: SemanticEvidence
}

export interface SemanticDataResult {
  [fieldName: string]: SemanticFieldResult
}

export interface SemanticProcessingResult {
  schema_id: string
  schema_version: string
  semantic_data: SemanticDataResult
  overall_confidence: number
  generated_by: string
  processor_version: string
}

// Legacy types for backward compatibility
export interface SemanticMatch {
  field_name: string
  raw_key: string
  value: unknown
}

export interface NormalizedValue {
  field_name: string
  value: string | number | boolean | null
}

export interface LegacySemanticProcessingResult {
  semantic_data: Record<string, unknown>
  matches: SemanticMatch[]
  normalized: NormalizedValue[]
  errors: string[]
}

// Semantic Analysis Types
export interface UnknownSemanticField {
  raw_field: string
  raw_value: unknown
  reason: 'no_mapping' | 'schema_missing' | 'validation_failed'
}

export interface SemanticCoverage {
  total_fields: number
  matched_fields: number
  coverage_score: number
}

export interface SemanticAnalysisResult {
  product_id: string
  schema_id: string
  coverage: SemanticCoverage
  unknown_fields: UnknownSemanticField[]
  missing_required_fields: string[]
  analyzer_version: string
}

// Semantic Evolution Types
export interface UnknownFieldStatistic {
  field_name: string
  occurrence_count: number
  product_count: number
  percentage: number
}

export interface SemanticFieldCandidate {
  field_name: string
  frequency: number
  importance_score: number
  recommendation: 'add_field' | 'ignore' | 'merge'
}

export interface SchemaEvolutionSuggestion {
  schema_id: string
  schema_version: string
  candidates: SemanticFieldCandidate[]
  generated_by: string
  version: string
}

// Semantic Intelligence Types
export interface SemanticCandidate {
  name: string
  type: 'ontology_candidate' | 'rule_candidate' | 'schema_field_candidate'
  confidence: number
  reason: string
}
