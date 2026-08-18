export interface EvidenceRecord {
  id?: string
  product_id: string
  semantic_field: string
  field_value: unknown
  evidence_type: 'merchant_input' | 'image' | 'document' | 'certification' | 'system_inference'
  evidence_source: string
  confidence: number
  created_at?: string
}

// Simplified interface for semantic pipeline
export interface SimpleEvidenceRecord {
  product_id: string
  field_name: string
  field_value: string
  source: string
  confidence: number
}
