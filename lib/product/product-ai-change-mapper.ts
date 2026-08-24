import type { ProductAiChange } from './ai-intelligence'

export interface AiAttributePatch {
  fieldKey: string
  value: string
  source: 'ai'
  confidence?: number
}

export interface AiAttributePatchResult {
  attributes: AiAttributePatch[]
  deletions: string[]
}

export function mapAcceptedAiChanges(
  changes: ProductAiChange[],
): AiAttributePatchResult {
  const attributes: AiAttributePatch[] = []
  const deletions: string[] = []

  for (const change of changes) {
    if (change.status !== 'accepted') {
      continue
    }

    if (!change.fieldKey) {
      continue
    }

    if (change.type === 'remove') {
      deletions.push(change.fieldKey)
      continue
    }

    if (change.nextValue === undefined || change.nextValue === null) {
      continue
    }

    attributes.push({
      fieldKey: change.fieldKey,
      value: change.nextValue,
      source: 'ai',
      confidence: change.confidence,
    })
  }

  return {
    attributes,
    deletions,
  }
}
