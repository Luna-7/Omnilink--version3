'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Play, Edit2, ArrowLeft } from 'lucide-react'
import type { ProductDetailModel } from '@/lib/products/product-detail-model'
import { PRODUCT_RELATION_LABELS } from '@/lib/products/product-relations'

interface ProductDetailViewProps {
  model: ProductDetailModel
  onEdit?: () => void
  onBack?: () => void
}

export function ProductDetailView({
  model,
  onEdit,
  onBack,
}: ProductDetailViewProps) {
  const router = useRouter()
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    model.primaryMedia?.id ?? model.media[0]?.id ?? null
  )

  const activeMedia =
    model.media.find((m) => m.id === selectedMediaId) ||
    model.primaryMedia ||
    model.media[0] ||
    null

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/dashboard/products')
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/dashboard/products/${model.id}/edit`)
    }
  }

  const standardAttrs = model.attributes.filter((attr) => attr.isStandard)
  const customAttrs = model.attributes.filter((attr) => !attr.isStandard)

  const groupedRelations = model.relations.reduce(
    (groups, relation) => {
      const key = relation.relationType
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(relation)
      return groups
    },
    {} as Record<string, typeof model.relations>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 px-4 sm:px-6">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pt-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-[4px] border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#024AD8]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-xs text-slate-500 font-medium">商品详情</div>
            <h1 className="mt-0.5 text-xl font-bold text-slate-900 tracking-tight">
              {model.name || '未命名商品'}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>编号: {model.sku || '—'}</span>
              <span>·</span>
              <span className="font-sans">{model.category || '未分类'}</span>
              <span>·</span>
              <span
                className={`px-1.5 py-0.2 rounded-[4px] text-[10px] font-bold ${
                  model.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {model.status === 'active' ? '上架中' : '草稿'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#024AD8] px-4 py-2 text-xs font-bold text-white hover:bg-[#003198] active:bg-[#00226B] transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-[#024AD8]"
        >
          <Edit2 size={14} />
          <span>编辑</span>
        </button>
      </header>

      {/* Product Core: Media + Identity & Price */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Media Gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center">
            {activeMedia?.mediaType === 'video' ? (
              <video
                src={activeMedia.url}
                controls
                className="w-full h-full object-contain"
              />
            ) : activeMedia ? (
              <Image
                src={activeMedia.url}
                alt={activeMedia.alt || model.name || '商品图'}
                width={1200}
                height={1200}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-sm text-slate-400 gap-1">
                <span>暂无商品媒体</span>
              </div>
            )}
          </div>

          {model.media.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {model.media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMediaId(item.id)}
                  className={`relative overflow-hidden rounded-[4px] border aspect-square cursor-pointer transition-all ${
                    selectedMediaId === item.id
                      ? 'border-[#024AD8] ring-2 ring-[#024AD8]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  {item.mediaType === 'video' ? (
                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                      <video
                        src={item.url}
                        muted
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={16} className="text-white fill-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt || model.name || ''}
                      width={240}
                      height={240}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {item.mediaType === 'video' && (
                    <span className="absolute bottom-1 left-1 rounded-[4px] bg-black/80 px-1 py-0.2 text-[9px] font-bold text-white">
                      视频
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Commercial & Info */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">商品售价</span>
              <div className="mt-1 text-3xl font-extrabold text-slate-900 font-mono">
                {model.currency} {Number(model.price).toFixed(2)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center gap-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">当前库存</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {model.inventory} 件
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">商品状态</span>
                <span className="font-bold text-slate-800 text-sm">
                  {model.status === 'active' ? '正常在售' : '草稿状态'}
                </span>
              </div>
            </div>
          </div>

          {model.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                商品描述
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                {model.description}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Specifications (Standard Canonical Attributes) */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">商品规格参数</h2>
          <span className="text-xs font-mono text-slate-500">
            {standardAttrs.length} 项标准属性
          </span>
        </div>

        {standardAttrs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100">
            {standardAttrs.map((attr) => (
              <div
                key={attr.fieldKey}
                className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-xs font-medium text-slate-500">
                  {attr.label || attr.fieldKey}
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {attr.value} {attr.unit ? attr.unit : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">暂无标品规格</div>
        )}
      </section>

      {/* Custom Attributes (Other Info) */}
      {customAttrs.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">其他扩展属性</h2>
            <span className="text-xs font-mono text-slate-500">
              {customAttrs.length} 项自定义信息
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {customAttrs.map((attr) => (
              <div
                key={attr.fieldKey}
                className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-xs font-medium text-slate-500">
                  {attr.label || attr.fieldKey}
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {model.relations && model.relations.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900">关联商品</h2>
          </div>

          {Object.entries(groupedRelations).map(([type, relations]) => (
            <div key={type} className="space-y-3">
              <div className="text-xs font-bold text-[#024AD8] flex items-center gap-1">
                <span>
                  {PRODUCT_RELATION_LABELS[type as keyof typeof PRODUCT_RELATION_LABELS] || type}
                </span>
                <span className="text-slate-400 font-mono">({relations.length})</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {relations.map((rel) => (
                  <article
                    key={rel.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all"
                  >
                    {rel.targetProduct.thumbnailUrl ? (
                      <img
                        src={rel.targetProduct.thumbnailUrl}
                        alt={rel.targetProduct.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-square w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        无图
                      </div>
                    )}

                    <div className="space-y-1 p-3">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {rel.targetProduct.name}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 truncate">
                        编号: {rel.targetProduct.sku || '—'}
                      </div>
                      {rel.targetProduct.price !== undefined &&
                        rel.targetProduct.price !== null && (
                          <div className="text-xs font-bold text-[#024AD8] font-mono pt-1">
                            {rel.targetProduct.currency || 'CNY'}{' '}
                            {Number(rel.targetProduct.price).toFixed(2)}
                          </div>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
