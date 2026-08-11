import { extractProductSemantic } from "@/lib/semantic/extractor"
import { createEvidence } from "@/lib/evidence/service"
import { createClientServer } from "@/lib/supabase/server"

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

  const supabase = await createClientServer()

  // 1. AI extraction
  const result = await extractProductSemantic({
    title,
    description,
    category
  })
  const semanticData = result.semantic_data || result

  // 2. Save semantic_data
  const { error: updateError } = await supabase
    .from("products")
    .update({
      semantic_data: semanticData
    })
    .eq("id", productId)

  if (updateError) {
    throw updateError
  }

  // 3. Generate evidence
  const evidenceTasks = Object.entries(semanticData).map(
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

  return {
    productId,
    semanticData,
    evidenceCount: Object.keys(semanticData).length
  }
}
