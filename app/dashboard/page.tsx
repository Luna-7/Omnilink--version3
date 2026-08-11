import { getStoreByOwnerId } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  // Get user from Supabase session
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/onboarding')
  }

  const owner_id = user.id
  const store = await getStoreByOwnerId(owner_id)

  if (!store) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to Omnilink
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Store Name
              </h2>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {store.store_name}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Industry
              </h2>
              <p className="text-xl text-gray-700 mt-1">
                {store.industries?.name || 'Not specified'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Store Slug
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {store.store_slug}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
