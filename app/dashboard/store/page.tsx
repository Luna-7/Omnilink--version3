'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { TemplateSelector } from '@/components/store/TemplateSelector'

export default function StorePage() {
  const router = useRouter()
  const [store, setStore] = useState<any>(null)
  const [storePage, setStorePage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    async function loadStore() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/onboarding')
          return
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*, industries (*)')
          .eq('owner_id', user.id)
          .single()

        if (storeError || !storeData) {
          router.push('/onboarding')
          return
        }

        setStore(storeData)

        // Fetch store page
        const { data: pageData } = await supabase
          .from('store_pages')
          .select('*')
          .eq('store_id', storeData.id)
          .single()

        setStorePage(pageData)
        setPublished(pageData?.published || false)
      } catch (error) {
        console.error('Failed to load store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [router])

  const publishStore = async () => {
    if (!storePage) return

    try {
      const response = await fetch(
        `/api/store-pages/${storePage.id}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            published: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to publish store");
      }

      const result = await response.json();
      setPublished(result.page.published);
    } catch (error) {
      console.error('Failed to publish store:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!store) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Store Website</h1>
        
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Template</h2>
          <TemplateSelector 
            storeId={store.id} 
            onTemplateSelect={(templateId) => {
              console.log('Template selected:', templateId)
            }}
          />
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Publish Store</h2>
          
          {published ? (
            <div className="mb-4">
              <p className="text-green-600 font-semibold">✓ Published</p>
              <a
                href={`/store/${store.store_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                View Public Store →
              </a>
            </div>
          ) : (
            <button
              onClick={publishStore}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Publish Store
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
