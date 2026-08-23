export class ProductAttributeValidationError extends Error {
  constructor(
    public readonly issues: Array<{
      fieldKey: string
      code: string
      message: string
      value?: unknown
    }>,
  ) {
    super('Product attribute validation failed')
    this.name = 'ProductAttributeValidationError'
  }
}
