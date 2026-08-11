export interface SemanticRelation {
  id: string
  source_concept_id: string
  relation_type: string
  target_concept_id: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface GraphNode {
  id: string
  canonical_name: string
  description: string | null
  aliases: string[]
}

export interface GraphResult {
  concept: GraphNode
  relations: SemanticRelation[]
  connected_nodes: GraphNode[]
}

export function resolveSemanticGraph(
  conceptId: string,
  relations: Array<{ source_concept_id: string; target_concept_id: string }>,
  depth: number = 1,
): string[] {
  const visited = new Set<string>()

  function traverse(id: string, level: number): string[] {
    if (level > depth) return []
    if (visited.has(id)) return []

    visited.add(id)

    const next = relations
      .filter(r => r.source_concept_id === id)
      .map(r => r.target_concept_id)

    return [...next, ...next.flatMap(n => traverse(n, level + 1))]
  }

  return traverse(conceptId, 0)
}
