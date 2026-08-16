'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TemplateSelector } from '@/components/store/TemplateSelector'
import { SectionTitle } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { Store, Globe, ArrowUpRight, CheckCircle2, Sparkles, Send } from 'lucide-react'

interface StorePageProps {
  store: { id: string; store_name: string; store_slug: string }
  storePage: {
    id: string
    published?: boolean | null
    template_id?: string | null
    sections?: unknown
  } | null
}

export default function StorePage({ store, storePage }: StorePageProps) {
  const router = useRouter()
  const { t, isZh } = useLanguage()
  const [published, setPublished] = useState(Boolean(storePage?.published))
  const [isPublishing, setIsPublishing] = useState(false)

  const publishStore = async () => {
    setIsPublishing(true)

    try {
      // Demo (#57 P6): a brand-new merchant has no store_page row yet, so the
      // publish endpoint (which toggles an existing page) would no-op. Create a
      // draft page first — zero developer intervention — then publish it.
      let page = storePage
      if (!page) {
        const createRes = await fetch('/api/store-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: store.id,
            template_id: 'electric-violet',
            sections: [],
            published: false,
          }),
        })
        if (!createRes.ok) {
          throw new Error('Failed to create store page')
        }
        const created = await createRes.json()
        page = created.page
      }

      if (!page) {
        throw new Error('No store page available')
      }

      const response = await fetch(`/api/store-pages/${page.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish store')
      }

      const result = await response.json()
      setPublished(result.page.published)
    } catch (error) {
      console.error('Failed to publish store:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  if (!store) {
    return null
  }

  return (
    <div className="space-y-5">
      {/* 顶部指标卡行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="crextio-card p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF4EE] text-[#3D5A4C] flex items-center justify-center shrink-0">
              <Store size={18} />
            </div>
            <div>
              <span className="text-xs text-[#7E8288] block">{t.store.storeConsole}</span>
              <div className="text-base font-bold text-[#1C1E21] mt-0.5 truncate max-w-[160px]">
                {store.store_name}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-card p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8E6F4] text-[#3b3686] flex items-center justify-center shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-xs text-[#7E8288] block">{t.store.publicationState}</span>
              <div className="text-base font-bold text-[#1C1E21] mt-0.5">
                {published ? (
                  <span className="text-[#edbc40] inline-flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 size={13} /> {t.store.livePublished}
                  </span>
                ) : (
                  <span className="text-[#F59E0B] text-xs font-semibold">{t.store.draftUnreleased}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="crextio-dark-card p-4 sm:p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-white/80 block">{t.store.publicUrl}</span>
            <div className="text-sm font-bold text-white truncate max-w-[140px]">
              /{store.store_slug}
            </div>
          </div>
          {published ? (
            <a
              href={`/store/${store.store_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              title={isZh ? '打开已发布的公开商城' : 'Open public storefront'}
            >
              <ArrowUpRight size={15} />
            </a>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 flex items-center justify-center">
              <Globe size={15} />
            </div>
          )}
        </div>
      </div>

      {/* 主体网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：模板选择器 (占 8 栏) */}
        <div className="lg:col-span-8">
          <div className="crextio-card p-6">
            <SectionTitle
              title={t.store.chooseTemplate}
              description={t.store.chooseTemplateDesc}
            />
            <div className="mt-4">
              <TemplateSelector
                storeId={store.id}
                onTemplateSelect={(templateId) => {
                  console.log('Template selected:', templateId)
                }}
              />
            </div>
          </div>
        </div>

        {/* 右侧：发布控制台 (占 4 栏) */}
        <div className="lg:col-span-4">
          <div className="crextio-card p-6 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4EE] text-[#3D5A4C] flex items-center justify-center mb-4">
                <Sparkles size={22} />
              </div>

              <h3 className="font-heading text-lg font-semibold text-[#1C1E21]">
                {t.store.publishingControls}
              </h3>
              <p className="text-xs text-[#7E8288] mt-1 leading-relaxed">
                {t.store.publishingControlsDesc}
              </p>

              {published ? (
                <div className="mt-5 p-4 rounded-2xl bg-[#EBF4EE] border border-[#CDE5D6] space-y-2">
                  <div className="flex items-center gap-2 text-[#3D5A4C] text-xs font-bold">
                    <CheckCircle2 size={16} />
                    <span>{t.store.storeOnline}</span>
                  </div>
                  <a
                    href={`/store/${store.store_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#3D5A4C] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t.store.visitStorefront}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              ) : (
                <div className="mt-5 p-4 rounded-2xl bg-[#F4F3EE] border border-[#E5E2DA] text-xs text-[#7E8288]">
                  {t.store.draftNotice}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E2DA]">
              <button
                onClick={publishStore}
                disabled={isPublishing}
                className="w-full py-2.5 px-4 rounded-full bg-[#3D5A4C] hover:bg-[#2A4237] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                <span>{isPublishing ? t.store.publishing : published ? t.store.updatePublication : t.store.publishStore}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
