'use client'

import { useState } from 'react'
import { deleteProductAction } from '@/app/actions/products'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  inventory: number
  sku: string | null
  status: string
  created_at: string
  updated_at: string
}

interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(productId: string) {
    setDeletingId(productId)
    
    const result = await deleteProductAction(productId)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
      setDeletingId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-start"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {product.sku && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {product.sku}
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            </div>
            {product.description && (
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-900 font-medium">
                {product.currency} {product.price.toFixed(2)}
              </span>
              <span className="text-gray-500">
                Inventory: {product.inventory}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {product.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`/dashboard/products/${product.id}`}
              className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Edit
            </a>
            <button
              onClick={() => handleDelete(product.id)}
              disabled={deletingId === product.id}
              className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === product.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
