import { extractProductSemantic } from "@/lib/semantic/extractor"
import { createEvidence } from "@/lib/evidence/service"
import {
  saveCanonicalProductAttributes,
  CanonicalProductAttribute,
} from "@/lib/products/canonical-attributes"

interface SemanticPipelineInput {
  productId: string
  title: string
  description?: string
  category?: string
}

export async function runSemanticPipeline(
  input: SemanticPipelineInput
) {
  const {
    productId,
    title,
    description,
    category
  } = input

  // 1. AI extraction
  const result = await extractProductSemantic({
    title,
    description,
    category
  })
  const semanticData = (result as Record<string, unknown>).semantic_data || result

  // 2. Delegate persistence exclusively to saveCanonicalProductAttributes
  const attributes: CanonicalProductAttribute[] = []
  if (semanticData && typeof semanticData === 'object') {
    const rawAttrs = (semanticData as Record<string, unknown>).attributes || semanticData
    if (typeof rawAttrs === 'object' && rawAttrs !== null) {
      for (const [key, value] of Object.entries(rawAttrs as Record<string, unknown>)) {
        if (key === 'attributes' || key === 'confidence' || key === 'category') continue
        if (value !== undefined && value !== null && typeof value !== 'object') {
          attributes.push({
            fieldKey: key,
            value: String(value),
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'text',
            source: 'ai',
            confidence: 0.85,
            isStandard: true,
          })
        }
      }
    }
  }

  if (attributes.length > 0) {
    try {
      await saveCanonicalProductAttributes(productId, {
        category: category || (result as Record<string, unknown>).category as string | undefined,
        attributes,
      })
    } catch (saveError) {
      console.warn('[semantic-pipeline] canonical save failed:', saveError)
    }
  }

  // 3. Generate evidence
  if (typeof semanticData === 'object' && semanticData !== null) {
    const evidenceTasks = Object.entries(semanticData as Record<string, unknown>).map(
      async ([field, value]) => {
        return createEvidence({
          product_id: productId,
          field_name: field,
          field_value: String(value),
          source: "AI extraction",
          confidence: 0.85
        })
      }
    )

    await Promise.all(evidenceTasks)
  }

  return {
    productId,
    semanticData,
    evidenceCount: typeof semanticData === 'object' && semanticData !== null ? Object.keys(semanticData).length : 0
  }
}
