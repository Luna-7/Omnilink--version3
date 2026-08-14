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
    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel rounded-lg h-40 ai-shimmer" aria-label="加载中" />
      </div>
    )
  }

  if (!store) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">模板与发布控制台</h1>

      <div className="glass-panel rounded-lg p-6 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">选择模板</h2>
        <TemplateSelector
          storeId={store.id}
          onTemplateSelect={(templateId) => {
            console.log('Template selected:', templateId)
          }}
        />
      </div>

      <div className="glass-panel rounded-lg p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">发布门店</h2>

        {published ? (
          <div className="mb-4">
            <p className="text-emerald-600 font-semibold text-sm">已发布</p>
            <a
              href={`/store/${store.store_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-700 text-sm font-medium"
            >
              查看公开门店 →
            </a>
          </div>
        ) : (
          <button
            onClick={publishStore}
            className="btn-primary-omni px-6 py-2.5 rounded-lg text-sm"
          >
            发布门店
          </button>
        )}
      </div>
    </div>
  )
}
