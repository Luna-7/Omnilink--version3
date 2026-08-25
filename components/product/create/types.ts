export interface ImageFileItem {
  file: File
  previewUrl: string
}

export interface EnhancementAttributeItem {
  id: string
  key: string
  label: string
  value: string
  unit?: string
  type: 'text' | 'number' | 'boolean' | 'select'
}

export interface BasicProductFormData {
  title: string
  sku: string
  category: string
  categoryId: string | null
  price: string
  currency: string
  origin: string
  inventory: string
  description: string
}
