import { supabase } from '@/lib/supabase/client'
import type { EvidenceRecord, SimpleEvidenceRecord } from './types'

export async function createEvidence(record: EvidenceRecord | SimpleEvidenceRecord) {
  // Handle simplified interface from semantic pipeline
  const evidenceRecord = 'field_name' in record 
    ? {
        product_id: record.product_id,
        semantic_field: record.field_name,
        field_value: record.field_value,
        evidence_type: 'system_inference' as const,
        evidence_source: record.source,
        confidence: record.confidence
      }
    : record

  const { error } = await supabase.from('semantic_evidence').insert(evidenceRecord)

  if (error) {
    console.error('create evidence failed', error)
  }
}

export async function getProductEvidence(product_id: string): Promise<EvidenceRecord[]> {
  const { data, error } = await supabase
    .from('semantic_evidence')
    .select('*')
    .eq('product_id', product_id)

  if (error) {
    throw error
  }

  return data ?? []
}
