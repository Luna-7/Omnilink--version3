'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createProductAction,
  updateProductAction,
} from '@/app/actions/products'

interface ProductFormProps {
  productId?: string
  initialData?: {
    name: string
    description?: string
    price: number
    currency: string
    inventory: number
    sku?: string
  }
}

/**
 * ProductForm (#59 B1 fix)
 *
 * The previous `<form action={handleSubmit}>` did not actually trigger the
 * server action `createProductAction` from this client form (confirmed by
 * dev server log in #57). Per the #59 spec we route the submission through
 * the already-validated POST /api/merchant/products endpoint instead of
 * duplicating server-action logic.
 *
 * UX:
 *   - clicking "Create Product" shows a "Creating..." state and disables
 *     re-submission while the request is in flight.
 *   - on 201, the form resets to a brief success state and then navigates
 *     to /dashboard/products.
 *   - on 400/401/403/500, the user gets a visible error message and may
 *     retry. No silent failure.
 *
 * Server-side semantic_data fallback is provided by /api/merchant/products
 * (see lib/products/service.ts buildDemoSemanticFallback); we do NOT send
 * semantic_data from the form so the server remains the source of truth.
 */
export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async (formData: FormData) => {
    setError('')
    setSuccess('')
    setIsCreating(true)

    // Edit path: keep the existing server action (it has full edit coverage
    // and we did not reproduce it on the API).
    if (productId) {
      startTransition(async () => {
        try {
          const result = await updateProductAction(productId, formData)
          if (result.success) {
            setSuccess('Product updated')
            router.refresh()
          } else {
            setError(result.error || 'Unable to update product')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to update product')
        } finally {
          setIsCreating(false)
        }
      })
      return
    }

    // Create path: POST to the API endpoint we already verified (#57).
    const payload = {
      name: String(formData.get('name') || '').trim(),
      sku: String(formData.get('sku') || '').trim() || null,
      description: String(formData.get('description') || '').trim() || null,
      price: Number(formData.get('price') || 0),
      currency: String(formData.get('currency') || 'USD'),
      inventory: Number(formData.get('inventory') || 0),
    }

    try {
      const res = await fetch('/api/merchant/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 201) {
        setSuccess('Product created')
        router.refresh()
        // Navigate after a brief moment so the success message is visible.
        setTimeout(() => router.push('/dashboard/products'), 400)
        return
      }

      let message = 'Unable to create product'
      try {
        const body = await res.json()
        if (body?.error) message = `Unable to create product: ${body.error}`
      } catch {
        // ignore JSON parse errors and keep the default message
      }

      if (res.status === 400) {
        message = 'Please check the required fields and try again.'
      } else if (res.status === 401) {
        message = 'Your session has expired. Please sign in again.'
      } else if (res.status === 403) {
        message = 'You do not have permission to add products to this store.'
      } else if (res.status >= 500) {
        message = 'Our server hit an unexpected error. Please try again in a moment.'
      }
      setError(message)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'Network error while creating the product'
      )
    } finally {
      setIsCreating(false)
    }
  }

  const busy = isPending || isCreating

  return (
    <form action={submit} className="space-y-6">
      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
          SKU
        </label>
        <input
          type="text"
          id="sku"
          name="sku"
          defaultValue={initialData?.sku || ''}
          placeholder="e.g., PROD-001"
          disabled={busy}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name || ''}
          required
          placeholder="e.g., Wireless Headphones"
          disabled={busy}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ''}
          rows={4}
          placeholder="Product description..."
          disabled={busy}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            defaultValue={initialData?.price || ''}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={busy}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={initialData?.currency || 'USD'}
            disabled={busy}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CNY">CNY</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
          Inventory
        </label>
        <input
          type="number"
          id="inventory"
          name="inventory"
          defaultValue={initialData?.inventory ?? 0}
          min="0"
          step="1"
          placeholder="0"
          disabled={busy}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-iris focus:border-iris disabled:bg-gray-100"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </div>
      )}

      {success && !error && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-iris text-white py-3 px-4 rounded-lg hover:bg-iris disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isCreating
          ? 'Creating…'
          : productId
          ? isPending
            ? 'Saving…'
            : 'Update Product'
          : 'Create Product'}
      </button>
    </form>
  )
}