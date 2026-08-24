export type ProductAiFindingType =
  | 'missing'
  | 'invalid'
  | 'conflict'
  | 'normalization'
  | 'semantic'
  | 'knowledge'

export type ProductAiChangeType =
  | 'add'
  | 'update'
  | 'remove'

export interface ProductAiFinding {
  id: string
  type: ProductAiFindingType

  fieldKey?: string
  label?: string

  message: string

  currentValue?: string | null
  suggestedValue?: string | null

  severity: 'info' | 'warning' | 'error'

  source:
    | 'description'
    | 'image'
    | 'document'
    | 'existing_attribute'
    | 'ai_inference'

  confidence?: number
}

export interface ProductAiChange {
  id: string

  type: ProductAiChangeType

  fieldKey?: string
  label?: string

  previousValue?: string | null
  nextValue?: string | null

  reason?: string

  source:
    | 'description'
    | 'image'
    | 'document'
    | 'ai_inference'
    | 'normalization'

  confidence?: number

  status:
    | 'pending'
    | 'accepted'
    | 'rejected'
}

export interface ProductAiReport {
  productId: string

  status:
    | 'idle'
    | 'analyzing'
    | 'ready'
    | 'failed'

  summary: {
    findingCount: number
    changeCount: number

    addCount: number
    updateCount: number
    removeCount: number

    errorCount: number
    warningCount: number
  }

  findings: ProductAiFinding[]

  changes: ProductAiChange[]

  readinessChecks?: Array<{
    title: string
    status: 'pass' | 'warn' | 'fail'
  }>

  agentSimulations?: Array<{
    question: string
    answer: string
    reason?: string
  }>

  generatedAt: string | null
}
