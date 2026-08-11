import { supabase } from '@/lib/supabase/client'
import { recordSemanticMemory } from './memory'

interface SemanticCandidate {
  id: string
  candidate_name: string
  candidate_type: 'ontology_candidate' | 'schema_field_candidate' | 'rule_candidate'
  confidence: number
  reason: string | null
  source: string
  status: string
  created_at: string
  updated_at: string
}

export async function applySemanticCandidate(candidate: SemanticCandidate) {
  const changeType = candidate.candidate_type

  const { data: log, error } = await supabase
    .from('semantic_change_logs')
    .insert({
      candidate_id: candidate.id,
      change_type: changeType,
      before_state: {},
      after_state: candidate,
      operator: 'system',
      status: 'processing',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  try {
    let result

    if (changeType === 'ontology_candidate') {
      result = await createOntology(candidate)
    }

    if (changeType === 'schema_field_candidate') {
      result = await createSchemaField(candidate)
    }

    if (changeType === 'rule_candidate') {
      result = await createRule(candidate)
    }

    await supabase
      .from('semantic_candidates')
      .update({
        status: 'approved',
      })
      .eq('id', candidate.id)

    await supabase
      .from('semantic_change_logs')
      .update({
        status: 'completed',
        after_state: result,
      })
      .eq('id', log.id)

    // Record semantic memory after successful mutation
    await recordSemanticMemory({
      entity_type: candidate.candidate_type,
      entity_id: candidate.id,
      memory_type: 'knowledge_created',
      content: {
        candidate_name: candidate.candidate_name,
        candidate_type: candidate.candidate_type,
        confidence: candidate.confidence,
        reason: candidate.reason,
      },
      source: candidate.source ?? 'deepseek',
    })

    return result
  } catch (error) {
    await supabase
      .from('semantic_change_logs')
      .update({
        status: 'failed',
      })
      .eq('id', log.id)

    throw error
  }
}

async function createOntology(candidate: SemanticCandidate) {
  return await supabase
    .from('semantic_ontology')
    .insert({
      canonical_name: candidate.candidate_name,
      description: candidate.reason,
      aliases: [],
    })
    .select()
    .single()
}

async function createSchemaField(candidate: SemanticCandidate) {
  // TODO: Implement schema field mutation
  // This would require schema_id and field details
  return {
    todo: 'implement schema mutation',
    candidate_name: candidate.candidate_name,
  }
}

async function createRule(candidate: SemanticCandidate) {
  // TODO: Implement rule mutation
  // This would require condition and conclusion parsing
  return {
    todo: 'implement rule mutation',
    candidate_name: candidate.candidate_name,
  }
}
