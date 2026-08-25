import {
  ProductSaveError,
} from './product-save-errors'

export interface ProductManagementSaveInput {
  productId: string

  basic?: {
    name?: string
    sku?: string | null
    description?: string | null
    price?: number
    currency?: string
    inventory?: number
    status?: 'active' | 'draft' | 'archived'
    category_id?: string | null
  }

  categoryId?: string | null
  category?: string | null

  attributes?: {
    fieldKey: string
    label?: string
    value: string
    type:
      | 'text'
      | 'number'
      | 'boolean'
      | 'select'
    unit?: string | null
    source?: 'ai' | 'manual' | 'system'
    confidence?: number
    isStandard: boolean
  }[]

  deletions?: string[]

  packaging?: Record<string, unknown> | null

  seo?: {
    title?: string
    description?: string
  } | null
}

export interface ProductManagementSaveResult {
  success: true
  productId: string
  canonical?: {
    attributes?: any[]
    is_legacy?: boolean
    [key: string]: any
  }
}

export async function saveProductManagement(
  input: ProductManagementSaveInput,
): Promise<ProductManagementSaveResult> {
  const errors: Array<{
    section:
      | 'identity'
      | 'commercial'
      | 'description'
      | 'attributes'
      | 'packaging'
      | 'seo'

    message: string
  }> = []

  // --------------------------------------------------
  // 1. Basic Product
  // --------------------------------------------------

  if (input.basic) {
    let response = await fetch(
      `/api/merchant/products/${input.productId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input.basic),
      },
    )

    if (!response.ok) {
      response = await fetch(
        `/api/products/${input.productId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input.basic),
        },
      )
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))

      errors.push({
        section: 'identity',
        message: body?.error || '基础商品信息保存失败',
      })
    }
  }

  // --------------------------------------------------
  // 2. Canonical Attributes
  // --------------------------------------------------

  let canonicalData: any = undefined

  if (
    (input.attributes && input.attributes.length > 0) ||
    (input.deletions && input.deletions.length > 0) ||
    input.category
  ) {
    try {
      const canonicalRes = await fetch(
        `/api/merchant/products/${input.productId}/canonical-attributes`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category_id: input.categoryId,
            category: input.category,
            attributes: input.attributes || [],
            deletions: input.deletions,
          }),
        },
      )

      if (!canonicalRes.ok) {
        const body = await canonicalRes.json().catch(() => ({}))
        if (canonicalRes.status === 422 && body?.issues) {
          const firstIssue = body.issues[0]
          throw new Error(`商品属性校验失败: ${firstIssue?.message || '请检查标红属性'}`)
        }
        throw new Error(body?.error || '商品属性保存失败，请重试')
      }

      const body = await canonicalRes.json()
      canonicalData = body?.canonical
    } catch (error) {
      errors.push({
        section: 'attributes',
        message:
          error instanceof Error
            ? error.message
            : '商品属性保存失败',
      })
    }
  }

  // --------------------------------------------------
  // 3. If any core section failed, do not report success.
  // --------------------------------------------------

  if (errors.length > 0) {
    throw new ProductSaveError(
      errors[0].message,
      errors.map((error) => ({
        section: error.section,
        code: 'SAVE_FAILED',
        message: error.message,
      })),
    )
  }

  return {
    success: true,
    productId: input.productId,
    canonical: canonicalData,
  }
}
