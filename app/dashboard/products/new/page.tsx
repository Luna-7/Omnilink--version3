import { ProductForm } from '@/components/products/ProductForm'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/products"
            className="text-iris hover:text-iris text-sm"
          >
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product for your store</p>
        </div>

        <div className="bg-white rounded-md shadow-lg p-8">
          <ProductForm />
        </div>
      </div>
    </div>
  )
}
