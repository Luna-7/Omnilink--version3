export interface ImageFileItem {
  file: File
  previewUrl: string
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
