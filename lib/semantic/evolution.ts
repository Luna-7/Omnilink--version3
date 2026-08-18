import {
  UnknownFieldStatistic,
  SemanticFieldCandidate,
  SchemaEvolutionSuggestion,
} from './types'
import { matchOntologyField } from './ontology'

export function analyzeUnknownFields(
  records: Array<{ raw_field: string; product_id: string }>,
  totalProducts: number,
  ontology: Array<{ canonical_name: string; aliases: string[] }> = [],
): UnknownFieldStatistic[] {
  const map = new Map<string, { count: number; products: Set<string> }>()

  records.forEach(record => {
    const ontologyMatch = matchOntologyField(record.raw_field, ontology)
    const normalizedField = ontologyMatch
      ? ontologyMatch.canonical_name
      : record.raw_field

    if (!map.has(normalizedField)) {
      map.set(normalizedField, {
        count: 0,
        products: new Set(),
      })
    }

    const item = map.get(normalizedField)!
    item.count++
    item.products.add(record.product_id)
  })

  return Array.from(map.entries()).map(([field, data]) => ({
    field_name: field,
    occurrence_count: data.count,
    product_count: data.products.size,
    percentage: totalProducts ? data.products.size / totalProducts : 0,
  }))
}

export function calculateFieldImportance(
  stat: UnknownFieldStatistic,
): SemanticFieldCandidate {
  const score = Math.min(
    1,
    stat.percentage * 0.7 + Math.min(stat.occurrence_count / 100, 1) * 0.3,
  )

  return {
    field_name: stat.field_name,
    frequency: stat.occurrence_count,
    importance_score: score,
    recommendation:
      score > 0.5 ? 'add_field' : score < 0.1 ? 'ignore' : 'merge',
  }
}

export function generateSchemaEvolutionSuggestion(
  schemaId: string,
  schemaVersion: string,
  statistics: UnknownFieldStatistic[],
): SchemaEvolutionSuggestion {
  const candidates = statistics.map(stat => calculateFieldImportance(stat))

  return {
    schema_id: schemaId,
    schema_version: schemaVersion,
    candidates,
    generated_by: 'evolution-engine-v1',
    version: '1.0',
  }
}
