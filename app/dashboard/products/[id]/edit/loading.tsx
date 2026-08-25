import { ProductWorkspaceSkeleton } from '@/components/products/workspace/ProductWorkspaceSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <ProductWorkspaceSkeleton />
    </div>
  )
}
