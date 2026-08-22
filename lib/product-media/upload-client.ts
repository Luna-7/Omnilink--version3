import { fetchWithRetry } from '@/lib/network/retry-client'

export type UploadProductMediaInput = {
  productId: string
  assetId: string
  file: File
}

export type UploadProductMediaResult = {
  success: boolean
  asset?: {
    id: string
    url?: string
  }
  error?: string
}

export type UploadOptions = {
  onRetry?: (info: { attempt: number; maxAttempts: number; reason: string }) => void
}

/**
 * Shared client for uploading product media assets.
 * Encapsulates fetchWithRetry (timeout 45s, 3 maxAttempts, exponential backoff)
 * and standardized error classification and structured logging.
 */
export async function uploadProductMedia(
  input: UploadProductMediaInput,
  options?: UploadOptions
): Promise<UploadProductMediaResult> {
  const { productId, assetId, file } = input

  console.log('[product.media.client] upload start', {
    productId,
    assetId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  })

  try {
    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('asset_id', assetId)
    formData.append('file', file)

    const response = await fetchWithRetry(
      '/api/merchant/media/upload',
      {
        method: 'POST',
        body: formData,
      },
      {
        timeoutMs: 45_000,
        maxAttempts: 3,
        baseDelayMs: 800,
        onRetry: ({ attempt, maxAttempts, reason }) => {
          console.warn('[product.media.client] upload retry', {
            productId,
            assetId,
            attempt,
            maxAttempts,
            reason,
          })
          options?.onRetry?.({ attempt, maxAttempts, reason })
        },
      }
    )

    let body: Record<string, unknown> = {}
    try {
      body = await response.json()
    } catch {
      // JSON parse fallback
    }

    if (!response.ok) {
      let message = ''
      if (typeof body.error === 'string') {
        message = body.error
      } else if (response.status === 400) {
        message = '请求参数错误或文件无效'
      } else if (response.status === 401) {
        message = '登录会话已失效，请重新登录'
      } else if (response.status === 403) {
        message = '无权为此商品上传素材'
      } else if (response.status === 404) {
        message = '未找到对应商品'
      } else if (response.status === 409) {
        message = '素材 ID 已存在于其他商品'
      } else if (response.status === 413) {
        message = '文件超过 10MB 限制'
      } else {
        message = `上传失败 (${response.status})`
      }

      console.error('[product.media.client] upload failed', {
        productId,
        assetId,
        status: response.status,
        message,
      })

      return {
        success: false,
        error: message,
      }
    }

    console.log('[product.media.client] upload success', {
      productId,
      assetId,
    })

    const assetObj = body.asset as { id?: string; url?: string } | undefined
    return {
      success: true,
      asset: {
        id: assetObj?.id || assetId,
        url: assetObj?.url,
      },
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : '网络请求失败，请检查网络后重试'

    console.error('[product.media.client] upload exception', {
      productId,
      assetId,
      error: errorMsg,
    })

    return {
      success: false,
      error: errorMsg,
    }
  }
}
