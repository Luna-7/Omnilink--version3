import { DeepSeekProvider } from '@/lib/ai/deepseek'
import { SemanticCandidate } from './types'
import { supabase } from '@/lib/supabase/client'

export async function analyzeUnknownFields(
  unknownFields: Array<{ raw_field: string; raw_value: unknown }>,
  ontology: Array<{ canonical_name: string; description: string | null; aliases: string[] }>,
): Promise<SemanticCandidate[]> {
  const ai = new DeepSeekProvider()

  const prompt = `You are a semantic commerce analyst.

Unknown fields:
${JSON.stringify(unknownFields, null, 2)}

Existing ontology:
${JSON.stringify(ontology, null, 2)}

Find possible:
1. new ontology concepts
2. new schema fields
3. reasoning rules

Return JSON array only.

Format:
[
{
  "name": "",
  "type": "ontology_candidate" | "rule_candidate" | "schema_field_candidate",
  "confidence": 0.0,
  "reason": ""
}
]`

  const result = await ai.generateText(prompt, {
    temperature: 0.1,
  })

  try {
    return JSON.parse(result)
  } catch {
    return []
  }
}

export async function saveSemanticCandidates(candidates: SemanticCandidate[]): Promise<void> {
  const rows = candidates.map(item => ({
    candidate_name: item.name,
    candidate_type: item.type,
    confidence: item.confidence,
    reason: item.reason,
    source: 'deepseek',
    status: 'pending',
  }))

  const { error } = await supabase.from('semantic_candidates').insert(rows)

  if (error) {
    console.error('save candidates failed', error)
  }
}
