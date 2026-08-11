export interface OntologyMatch {
  canonical_name: string
  confidence: number
}

export function matchOntologyField(
  field: string,
  ontology: Array<{ canonical_name: string; aliases: string[] }>,
): OntologyMatch | null {
  const normalized = field.trim().toLowerCase()

  for (const item of ontology) {
    const aliases: string[] = item.aliases || []

    if (aliases.map(a => a.toLowerCase()).includes(normalized)) {
      return {
        canonical_name: item.canonical_name,
        confidence: 0.95,
      }
    }
  }

  return null
}
