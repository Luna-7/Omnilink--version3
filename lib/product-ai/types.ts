export type ProductDraft = {
  name: string
  category: string | null
  description: string | null

  attributes: Array<{
    key: string
    label: string
    value: string
    type:
      | 'text'
      | 'number'
      | 'boolean'
      | 'select'
    unit: string | null
    confidence: number
  }>

  suggestedModules: Array<{
    key: string
    label: string
    confidence: number
  }>
}
