export interface ProductSaveIssue {
  section:
    | 'identity'
    | 'media'
    | 'commercial'
    | 'description'
    | 'attributes'
    | 'variants'
    | 'packaging'
    | 'knowledge'
    | 'seo'

  code: string
  message: string
  fieldKey?: string
}

export class ProductSaveError extends Error {
  constructor(
    message: string,
    public readonly issues: ProductSaveIssue[] = [],
  ) {
    super(message)

    this.name = 'ProductSaveError'
  }
}

export function getProductSaveMessage(
  error: unknown,
): string {
  if (error instanceof ProductSaveError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '商品保存失败，请稍后重试'
}
