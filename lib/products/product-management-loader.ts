import {
  createClientServer,
} from '@/lib/supabase/server'

import {
  getCanonicalProductAttributes,
} from '@/lib/products/canonical-attributes'

import type {
  ProductManagementModel,
  ProductStatus,
} from './product-management-model'

type JsonRecord = Record<string, unknown>

function isRecord(
  value: unknown,
): value is JsonRecord {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  )
}

function readStatus(
  value: unknown,
): ProductStatus {
  if (
    value === 'active' ||
    value === 'archived'
  ) {
    return value
  }

  return 'draft'
}

export async function loadProductManagementModel(
  productId: string,
): Promise<ProductManagementModel> {
  const supabase =
    await createClientServer()

  const { data, error } =
    await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        description,
        price,
        currency,
        inventory,
        status,
        raw_data,
        updated_at
      `)
      .eq('id', productId)
      .single()

  if (error || !data) {
    throw new Error(
      'Product not found',
    )
  }

  const rawData = isRecord(
    data.raw_data,
  )
    ? data.raw_data
    : {}

  const canonical =
    await getCanonicalProductAttributes(
      productId,
    )

  const packaging =
    isRecord(rawData.packaging)
      ? rawData.packaging
      : null

  const seo =
    isRecord(rawData.seo)
      ? {
          title:
            typeof rawData.seo.title === 'string'
              ? rawData.seo.title
              : undefined,

          description:
            typeof rawData.seo.description === 'string'
              ? rawData.seo.description
              : undefined,
        }
      : null

  return {
    id: data.id,
    name: data.name ?? '',
    sku: data.sku ?? null,
    description:
      data.description ?? null,

    price:
      typeof data.price === 'number'
        ? data.price
        : Number(data.price ?? 0),

    currency:
      data.currency ?? 'CNY',

    inventory:
      typeof data.inventory === 'number'
        ? data.inventory
        : Number(data.inventory ?? 0),

    status: readStatus(
      data.status,
    ),

    category:
      canonical.category ??
      (typeof rawData.category === 'string'
        ? rawData.category
        : null),

    attributes:
      canonical.attributes,

    packaging,
    seo,

    metadata: {
      schemaId:
        canonical.schema_id,
      schemaVersion:
        canonical.schema_version,
      isComplete:
        canonical.is_complete,
      isLegacy:
        canonical.is_legacy,
    },

    updatedAt:
      data.updated_at ?? null,
  }
}
