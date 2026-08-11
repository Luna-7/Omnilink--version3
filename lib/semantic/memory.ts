import { supabase } from '@/lib/supabase/client'

export interface SemanticMemoryInput {
  entity_type: string
  entity_id?: string
  memory_type: string
  content: Record<string, unknown>
  source?: string
}

export async function recordSemanticMemory(input: SemanticMemoryInput) {
  const { data, error } = await supabase
    .from('semantic_memory')
    .insert({
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      memory_type: input.memory_type,
      content: input.content,
      source: input.source ?? 'system',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getSemanticMemory({
  entity_type,
  entity_id,
  memory_type,
}: {
  entity_type: string
  entity_id?: string
  memory_type?: string
}) {
  let query = supabase
    .from('semantic_memory')
    .select('*')
    .eq('entity_type', entity_type)

  if (entity_id) {
    query = query.eq('entity_id', entity_id)
  }

  if (memory_type) {
    query = query.eq('memory_type', memory_type)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}
