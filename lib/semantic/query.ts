export interface SemanticConstraint {
  field: string
  operator: string
  value: unknown
}

export interface SemanticQuery {
  intent: string
  concepts: string[]
  constraints: SemanticConstraint[]
  confidence: number
}
