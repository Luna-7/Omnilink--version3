export type ProductMediaType =
  | 'image'
  | 'video'

export interface ProductMediaAsset {
  id: string
  url: string

  mediaType: ProductMediaType

  position: number

  alt?: string | null

  mimeType?: string | null

  width?: number | null
  height?: number | null
  duration?: number | null

  createdAt?: string | null

  metadata?: Record<string, unknown>
}

export interface ProductMediaUpload {
  file: File
  mediaType: ProductMediaType
  position?: number
  alt?: string
}

export function detectProductMediaType(
  file: Pick<File, 'type'>,
): ProductMediaType | null {
  if (file.type.startsWith('image/')) {
    return 'image'
  }

  if (file.type.startsWith('video/')) {
    return 'video'
  }

  return null
}

export function isSupportedProductMedia(
  file: Pick<File, 'type' | 'size'>,
): boolean {
  const mediaType = detectProductMediaType(file)

  if (!mediaType) {
    return false
  }

  // Keep limits conservative for product workspace
  const maxImageSize = 20 * 1024 * 1024 // 20MB
  const maxVideoSize = 200 * 1024 * 1024 // 200MB

  return mediaType === 'image'
    ? file.size <= maxImageSize
    : file.size <= maxVideoSize
}
