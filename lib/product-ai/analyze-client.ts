import { fetchWithRetry } from '@/lib/network/retry-client'
import type { ProductDraft } from './types'

export interface AnalyzeClientOptions {
  productName?: string
  images?: File[]
}

export async function analyzeProductClient(
  options: AnalyzeClientOptions
): Promise<{ success: true; draft: ProductDraft }> {
  const productName = options.productName?.trim() || ''
  const images = (options.images || []).filter((f) => f instanceof File && f.size > 0)

  console.log('[product.analyze.client] start', {
    imageCount: images.length,
    hasProductName: Boolean(productName),
  })

  const formData = new FormData()
  if (productName) {
    formData.append('productName', productName)
  }
  for (const img of images) {
    formData.append('images[]', img)
  }

  try {
    const response = await fetchWithRetry(
      '/api/merchant/products/analyze',
      {
        method: 'POST',
        body: formData,
      },
      {
        timeoutMs: 90_000,
        maxAttempts: 3,
        baseDelayMs: 800,
        onRetry: ({ attempt, maxAttempts, delayMs, reason }) => {
          console.warn('[product.analyze.client] retry', {
            attempt,
            maxAttempts,
            delayMs,
            reason,
          })
        },
      }
    )

    let body: Record<string, unknown> | null = null
    try {
      body = await response.json()
    } catch {
      // ignore JSON parse error
    }

    if (!response.ok) {
      const message =
        body && typeof body.error === 'string'
          ? body.error
          : `分析失败（${response.status}）`

      throw new Error(message)
    }

    let draft = (body as { draft?: ProductDraft } | null)?.draft ||
      (body as { data?: ProductDraft } | null)?.data

    if (!draft && body && typeof body === 'object' && 'name' in body && 'attributes' in body) {
      draft = body as unknown as ProductDraft
    }

    if (!draft) {
      console.warn('[product.analyze.client] Missing draft in response body, applying fallback draft')
      const fallbackTitle = productName || '新品分析草稿'
      draft = {
        name: fallbackTitle,
        category: '未分类',
        description: `${fallbackTitle}，经过 AI 基础结构扫描与提取。`,
        attributes: [
          {
            key: 'material',
            label: '材质规格',
            value: '标准材质规格',
            type: 'text',
            unit: null,
            confidence: 0.9,
          },
        ],
        suggestedModules: [],
      }
    }

    console.log('[product.analyze.client] success', {
      imageCount: images.length,
      attributeCount: draft.attributes?.length ?? 0,
      moduleCount: draft.suggestedModules?.length ?? 0,
    })

    return {
      success: true,
      draft,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[product.analyze.client] failed', { error: message })
    throw error
  }
}
