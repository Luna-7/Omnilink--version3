'use client'

import React, { useState } from 'react'
import { Sliders, Plus, Trash2, Check, X, Sparkles, Layers, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithRetry } from '@/lib/network/retry-client'

export interface CustomAttribute {
  id: string
  name: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
}

export interface AcceptedAttribute {
  id: string
  key: string
  label: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  unit?: string | null
  confidence: number
  source: 'ai' | 'manual'
}

interface SuggestedModule {
  id: string
  titleZh: string
  titleEn: string
  fields: Array<{ key: string; nameZh: string; nameEn: string; defaultValue: string; type?: 'text' | 'number' | 'boolean' | 'select'; confidence?: number }>
  accepted?: boolean
  dismissed?: boolean
}

interface ProductAttributesSectionProps {
  productId?: string
  coreMaterial: string
  setCoreMaterial: (val: string) => void
  coreDimensions: string
  setCoreDimensions: (val: string) => void
  coreWeight: string
  setCoreWeight: (val: string) => void
  coreOrigin: string
  setCoreOrigin: (val: string) => void
  customAttributes: CustomAttribute[]
  setCustomAttributes: React.Dispatch<React.SetStateAction<CustomAttribute[]>>
  disabled?: boolean
}

export function ProductAttributesSection({
  productId,
  coreMaterial,
  setCoreMaterial,
  coreDimensions,
  setCoreDimensions,
  coreWeight,
  setCoreWeight,
  coreOrigin,
  setCoreOrigin,
  customAttributes,
  setCustomAttributes,
  disabled = false,
}: ProductAttributesSectionProps) {
  const { isZh } = useLanguage()

  // Accepted Attributes state
  const [acceptedAttributes, setAcceptedAttributes] = useState<AcceptedAttribute[]>([])

  // AI Suggested modules state
  const [suggestedModules, setSuggestedModules] = useState<SuggestedModule[]>([
    {
      id: 'optical-specs',
      titleZh: '光学/眼镜参数规格 (Optical Specs)',
      titleEn: 'Optical & Eyewear Specs',
      fields: [
        { key: 'frame_material', nameZh: '镜框材质', nameEn: 'Frame Material', defaultValue: 'TR90', type: 'select', confidence: 0.94 },
        { key: 'lens_material', nameZh: '镜片材质', nameEn: 'Lens Material', defaultValue: 'TAC Polarized', type: 'select', confidence: 0.88 },
        { key: 'uv_protection', nameZh: '防紫外线级别', nameEn: 'UV Protection', defaultValue: 'UV400', type: 'text', confidence: 0.95 },
        { key: 'temple_length', nameZh: '镜腿长度', nameEn: 'Temple Length', defaultValue: '145', type: 'number', confidence: 0.72 },
      ],
      accepted: false,
      dismissed: false,
    },
    {
      id: 'audio-specs',
      titleZh: '声学/耳机参数规格 (Audio Specs)',
      titleEn: 'Acoustic & Audio Specs',
      fields: [
        { key: 'driver_unit', nameZh: '发声单元', nameEn: 'Driver Unit', defaultValue: '40mm Dynamic Driver', type: 'text', confidence: 0.91 },
        { key: 'freq_response', nameZh: '频响范围', nameEn: 'Frequency Response', defaultValue: '20Hz - 40kHz', type: 'text', confidence: 0.85 },
        { key: 'anc_level', nameZh: '降噪深度', nameEn: 'ANC Level', defaultValue: '-45 dB Adaptive', type: 'text', confidence: 0.65 },
        { key: 'battery_life', nameZh: '续航时间', nameEn: 'Battery Life', defaultValue: '50 Hours', type: 'text', confidence: 0.55 },
      ],
      accepted: false,
      dismissed: false,
    },
  ])

  // Custom attribute form state
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newType, setNewType] = useState<'text' | 'number' | 'boolean' | 'select'>('text')
  const [customError, setCustomError] = useState('')

  // Apply API status state
  const [isApplying, setIsApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<{
    success: boolean
    message: string
    acceptedCount?: number
    unknownCount?: number
    rejectedCount?: number
  } | null>(null)

  const handleAcceptSuggested = (moduleId: string) => {
    setSuggestedModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, accepted: true, dismissed: false } : mod))
    )
    const mod = suggestedModules.find((m) => m.id === moduleId)
    if (mod) {
      const newItems: AcceptedAttribute[] = mod.fields.map((f, i) => ({
        id: `attr-acc-${Date.now()}-${i}`,
        key: f.key,
        label: isZh ? f.nameZh : f.nameEn,
        value: f.defaultValue,
        type: f.type || 'text',
        confidence: f.confidence ?? 0.85,
        source: 'ai',
      }))
      
      setAcceptedAttributes((prev) => {
        // filter duplicates by key
        const existingKeys = new Set(prev.map(p => p.key))
        const filtered = newItems.filter(item => !existingKeys.has(item.key))
        return [...prev, ...filtered]
      })
    }
  }

  const handleDismissSuggested = (moduleId: string) => {
    setSuggestedModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, dismissed: true, accepted: false } : mod))
    )
  }

  const handleAddCustomAttribute = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setCustomError('')

    const keyClean = newKey.trim()
    const valClean = newValue.trim()

    if (!keyClean || keyClean.length < 1 || keyClean.length > 80) {
      setCustomError(isZh ? '属性名称须为 1~80 个字符' : 'Attribute name must be 1-80 characters')
      return
    }

    if (!valClean || valClean.length < 1 || valClean.length > 500) {
      setCustomError(isZh ? '属性值须为 1~500 个字符' : 'Attribute value must be 1-500 characters')
      return
    }

    const newAttr: AcceptedAttribute = {
      id: `attr-cust-${Date.now()}`,
      key: keyClean.toLowerCase().replace(/\s+/g, '_'),
      label: keyClean,
      value: valClean,
      type: newType,
      confidence: 1.0,
      source: 'manual',
    }

    setAcceptedAttributes((prev) => [...prev, newAttr])
    setNewKey('')
    setNewValue('')
    setNewType('text')
  }

  const handleUpdateAcceptedValue = (id: string, val: string) => {
    setAcceptedAttributes((prev) =>
      prev.map((attr) =>
        attr.id === id ? { ...attr, value: val, source: 'manual' } : attr
      )
    )
  }

  const handleRemoveAccepted = (id: string) => {
    setAcceptedAttributes((prev) => prev.filter((attr) => attr.id !== id))
  }

  // Save to Product Semantic Data handler
  const handleApplyToSemanticData = async () => {
    if (!productId) {
      setApplyResult({
        success: false,
        message: isZh ? '请先保存商品，获得 Product ID 后再提交语义数据' : 'Please save the product first to acquire a Product ID',
      })
      return
    }

    if (acceptedAttributes.length === 0) {
      setApplyResult({
        success: false,
        message: isZh ? '请先确认或添加至少一条属性' : 'Please confirm or add at least one attribute first',
      })
      return
    }

    setIsApplying(true)
    setApplyResult(null)

    try {
      const payload = {
        attributes: acceptedAttributes.map((attr) => ({
          key: attr.key,
          label: attr.label,
          value: attr.value,
          type: attr.type,
          unit: attr.unit || null,
          confidence: attr.confidence,
        })),
      }

      const response = await fetchWithRetry(
        `/api/merchant/products/${productId}/ai-draft/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        {
          timeoutMs: 30_000,
          maxAttempts: 3,
        }
      )

      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(body?.error || (isZh ? '保存语义数据失败' : 'Failed to save semantic data'))
      }

      const mapping = body.mapping
      setApplyResult({
        success: true,
        message: isZh ? '成功写入商品语义数据 (Product Semantics)' : 'Successfully saved to Product Semantics',
        acceptedCount: mapping?.accepted?.length ?? 0,
        unknownCount: mapping?.unknownFields?.length ?? 0,
        rejectedCount: mapping?.rejected?.length ?? 0,
      })
    } catch (err) {
      setApplyResult({
        success: false,
        message: err instanceof Error ? err.message : (isZh ? '请求失败，请稍后重试' : 'Request failed'),
      })
    } finally {
      setIsApplying(false)
    }
  }

  const renderConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {isZh ? '高' : 'High'} ({(confidence * 100).toFixed(0)}%)
        </span>
      )
    }
    if (confidence >= 0.6) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {isZh ? '待确认' : 'Review'} ({(confidence * 100).toFixed(0)}%)
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        {isZh ? '低' : 'Low'} ({(confidence * 100).toFixed(0)}%)
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '动态语义属性 (Dynamic Semantic Attributes)' : 'Dynamic Semantic Attributes'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '通用核心属性 + AI 识别推荐 + 规范校准与语义层 (Semantic Schema Authority)'
                : 'Core attributes, AI recognition, normalization, and authority semantic schema mapping'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Core Universal Attributes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-violet-600" />
          <h3 className="text-xs font-bold text-slate-900">
            {isZh ? '通用核心属性 (Universal Core Attributes)' : 'Universal Core Attributes'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isZh ? '主材质 (Material)' : 'Material'}
            </label>
            <input
              type="text"
              value={coreMaterial}
              onChange={(e) => setCoreMaterial(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '例: 钛合金 / TR90' : 'e.g. Titanium'}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isZh ? '尺寸 (Dimensions)' : 'Dimensions'}
            </label>
            <input
              type="text"
              value={coreDimensions}
              onChange={(e) => setCoreDimensions(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '例: 145 x 48 x 140 mm' : 'e.g. 145 x 48 x 140 mm'}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isZh ? '重量 (Weight)' : 'Weight'}
            </label>
            <input
              type="text"
              value={coreWeight}
              onChange={(e) => setCoreWeight(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '例: 28g' : 'e.g. 28g'}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              {isZh ? '原产地 (Origin)' : 'Country of Origin'}
            </label>
            <input
              type="text"
              value={coreOrigin}
              onChange={(e) => setCoreOrigin(e.target.value)}
              disabled={disabled}
              placeholder={isZh ? '例: 中国 (China)' : 'e.g. China'}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* 2. AI Suggested Modules */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-600" />
          <h3 className="text-xs font-bold text-slate-900">
            {isZh ? 'AI 识别推荐模块 (AI Suggested Modules)' : 'AI Suggested Attribute Modules'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedModules.map((mod) => {
            if (mod.dismissed) return null
            return (
              <div
                key={mod.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  mod.accepted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-violet-50/40 border-violet-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    {isZh ? mod.titleZh : mod.titleEn}
                  </span>
                  {!mod.accepted ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAcceptSuggested(mod.id)}
                        className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>{isZh ? '接受建议' : 'Accept'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissSuggested(mod.id)}
                        className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={isZh ? '忽略' : 'Dismiss'}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <Check size={12} />
                      <span>{isZh ? '已加入待提交列表' : 'Accepted'}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {mod.fields.map((f) => (
                    <div key={f.key} className="bg-white/80 p-1.5 rounded-md border border-slate-200/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-slate-500 font-medium truncate">{isZh ? f.nameZh : f.nameEn}</span>
                        {f.confidence && renderConfidenceBadge(f.confidence)}
                      </div>
                      <span className="font-semibold text-slate-800 truncate">{f.defaultValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Accepted Attributes Review Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              {isZh ? '已确认属性 (Accepted Attributes)' : 'Accepted Attributes Review'}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
              {acceptedAttributes.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleApplyToSemanticData}
            disabled={disabled || isApplying || acceptedAttributes.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
          >
            <Send size={13} />
            <span>
              {isApplying
                ? (isZh ? '正在映射与校准...' : 'Mapping & Normalizing...')
                : (isZh ? '保存到商品语义数据' : 'Apply to Product Semantics')}
            </span>
          </button>
        </div>

        {applyResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              applyResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {applyResult.success ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">{applyResult.message}</p>
              {applyResult.success && (
                <p className="text-[11px] opacity-90">
                  {isZh
                    ? `匹配核心规范 field: ${applyResult.acceptedCount ?? 0} 项 | 未知属性存入 unknown: ${applyResult.unknownCount ?? 0} 项 | 校验不通过: ${applyResult.rejectedCount ?? 0} 项`
                    : `Mapped: ${applyResult.acceptedCount ?? 0} | Unknown: ${applyResult.unknownCount ?? 0} | Rejected: ${applyResult.rejectedCount ?? 0}`}
                </p>
              )}
            </div>
          </div>
        )}

        {acceptedAttributes.length > 0 ? (
          <div className="space-y-2">
            {acceptedAttributes.map((attr) => (
              <div key={attr.id} className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="col-span-3">
                  <span className="text-[11px] font-bold text-slate-700 block truncate">{attr.label}</span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">{attr.key}</span>
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleUpdateAcceptedValue(attr.id, e.target.value)}
                    placeholder={isZh ? '属性值' : 'Value'}
                    className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  {renderConfidenceBadge(attr.confidence)}
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      attr.source === 'manual'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {attr.source === 'manual' ? (isZh ? '手动修改' : 'Manual') : (isZh ? 'AI 提取' : 'AI Draft')}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveAccepted(attr.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title={isZh ? '移除' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            {isZh ? '暂无已确认属性。可在下方手动添加或由上方 AI 建议接受。' : 'No accepted attributes yet. Accept AI suggestions or add custom attributes below.'}
          </div>
        )}
      </div>

      {/* 4. Add Custom Attribute */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">
            {isZh ? '添加自定义属性 (Add Custom Attribute)' : 'Add Custom Attribute'}
          </h3>
        </div>

        {customError && (
          <p className="text-xs text-rose-600 font-medium">{customError}</p>
        )}

        <form onSubmit={handleAddCustomAttribute} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="col-span-4">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder={isZh ? '属性名 (1~80 字符, 如: frame_finish)' : 'Key / Name (e.g. frame_finish)'}
              className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="col-span-4">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={isZh ? '属性值 (1~500 字符, 如: Matte Black)' : 'Value (e.g. Matte Black)'}
              className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="col-span-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full h-8 px-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="select">Select</option>
            </select>
          </div>

          <div className="col-span-2 text-right">
            <button
              type="submit"
              disabled={disabled}
              className="w-full h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus size={13} />
              <span>{isZh ? '添加' : 'Add'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
