import type {
  VariantOptionInput,
  VariantCombination,
  VariantDraft,
} from '@/lib/products/domain-types'

import {
  generateVariantCombinations,
} from './combinations'

export type ReconcileVariantOptions = {
  defaultPrice?: number
  defaultInventory?: number

  generateSku?: (
    combination: VariantCombination,
  ) => string | undefined
}

/**
 * Reconcile newly generated Variant combinations
 * against the previous editable VariantDraft state.
 *
 * Identity:
 *   Variant.key
 *
 * Preserve:
 *   price
 *   inventory
 *   manual SKU
 *   custom editable fields
 *
 * Recalculate:
 *   key
 *   optionValues
 *   generated SKU
 */
export function reconcileVariantItems(
  currentOptions: VariantOptionInput[],
  previousItems: VariantDraft[] = [],
  options: ReconcileVariantOptions = {},
): VariantDraft[] {
  const combinations =
    generateVariantCombinations(
      currentOptions,
    )

  const previousMap =
    new Map<string, VariantDraft>()

  for (const item of previousItems) {
    previousMap.set(item.key, item)
  }

  return combinations.map(
    (combination) => {
      const existing =
        previousMap.get(combination.key)

      if (existing) {
        let sku = existing.sku

        if (
          existing.skuSource !== 'manual' &&
          options.generateSku
        ) {
          sku =
            options.generateSku(combination)
        }

        return {
          ...existing,

          key: combination.key,

          optionValues: {
            ...combination.optionValues,
          },

          price: existing.price,
          inventory: existing.inventory,

          sku,

          skuSource: existing.skuSource,
        }
      }

      const generatedSku =
        options.generateSku?.(
          combination,
        )

      return {
        key: combination.key,

        optionValues: {
          ...combination.optionValues,
        },

        sku: generatedSku,

        price: options.defaultPrice,

        inventory:
          options.defaultInventory,

        skuSource:
          generatedSku
            ? 'generated'
            : undefined,
      }
    },
  )
}
