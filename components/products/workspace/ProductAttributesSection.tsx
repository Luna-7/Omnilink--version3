'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Send,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithRetry } from '@/lib/network/retry-client'
import {
  getCategoryTemplate,
  ProductCategoryTemplate,
  AttributeTemplateField,
} from '@/lib/product/category-templates'

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

interface ProductAttributesSectionProps {
  productId?: string
  category?: string
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
  initialAiAttributes?: AcceptedAttribute[]
  disabled?: boolean
}

export function ProductAttributesSection({
  productId,
  category = '',
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
  initialAiAttributes = [],
  disabled = false,
}: ProductAttributesSectionProps) {
  const { isZh } = useLanguage()

  // 1. Current category template (if available)
  const template = useMemo(() => getCategoryTemplate(category), [category])
  const prevCategoryRef = useRef(category)
  const [categoryChangeNotice, setCategoryChangeNotice] = useState<string | null>(null)

  // 2. Structured field values for current template
  // Keyed by template field key -> { value, source: 'ai' | 'manual', confidence, unit }
  const [templateFieldValues, setTemplateFieldValues] = useState<
    Record<
      string,
      {
        value: string
        source: 'ai' | 'manual'
        confidence: number
        unit?: string
      }
    >
  >({})

  // 3. Custom / Other Attributes list (for attributes not matching active template)
  const [otherAttributes, setOtherAttributes] = useState<AcceptedAttribute[]>([])

  // Track initial hydration from initialAiAttributes
  const initialHydratedRef = useRef(false)

  // Hydrate from initialAiAttributes when they arrive
  useEffect(() => {
    if (initialAiAttributes.length === 0 || initialHydratedRef.current) return

    const newFieldVals: typeof templateFieldValues = {}
    const unmatched: AcceptedAttribute[] = []

    initialAiAttributes.forEach((attr) => {
      // Check if matches a template field
      const matchedField = template?.fields.find(
        (f) =>
          f.key.toLowerCase() === attr.key.toLowerCase() ||
          f.nameZh.toLowerCase() === attr.label.toLowerCase() ||
          f.nameEn.toLowerCase() === attr.label.toLowerCase()
      )

      if (matchedField) {
        newFieldVals[matchedField.key] = {
          value: attr.value,
          source: attr.source || 'ai',
          confidence: attr.confidence || 0.9,
          unit: attr.unit || matchedField.unit,
        }
      } else {
        unmatched.push(attr)
      }
    })

    setTemplateFieldValues((prev) => ({ ...prev, ...newFieldVals }))
    if (unmatched.length > 0) {
      setOtherAttributes((prev) => [...prev, ...unmatched])
    }
    initialHydratedRef.current = true
  }, [initialAiAttributes, template])

  // Handle Category Changes without silently deleting data
  useEffect(() => {
    if (prevCategoryRef.current !== category && prevCategoryRef.current !== '') {
      const prevTemplate = getCategoryTemplate(prevCategoryRef.current)
      const currentTemplate = getCategoryTemplate(category)

      if (prevTemplate?.id !== currentTemplate?.id) {
        // Collect old template values that do not belong to the new template
        const unmatchedFromOldTemplate: AcceptedAttribute[] = []
        if (prevTemplate) {
          Object.entries(templateFieldValues).forEach(([key, valData]) => {
            if (valData.value && (!currentTemplate || !currentTemplate.fields.some((f) => f.key === key))) {
              const oldFieldDef = prevTemplate.fields.find((f) => f.key === key)
              unmatchedFromOldTemplate.push({
                id: `migrated-${key}-${Date.now()}`,
                key,
                label: oldFieldDef ? (isZh ? oldFieldDef.nameZh : oldFieldDef.nameEn) : key,
                value: valData.value,
                type: oldFieldDef?.type || 'text',
                unit: valData.unit || null,
                confidence: valData.confidence || 1.0,
                source: valData.source || 'manual',
              })
            }
          })
        }

        if (unmatchedFromOldTemplate.length > 0) {
          setOtherAttributes((prev) => [...prev, ...unmatchedFromOldTemplate])
        }

        setCategoryChangeNotice(
          isZh
            ? `分类已更新为「${category || '通用'}」，属性模板已实时切换。原有数据已安全保留。`
            : `Category updated to "${category || 'General'}". Template refreshed and previous data retained.`
        )
      }
    }
    prevCategoryRef.current = category
  }, [category, isZh, templateFieldValues])

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

  // Handle template field change
  const handleTemplateFieldChange = (
    fieldKey: string,
    value: string,
    unit?: string
  ) => {
    setTemplateFieldValues((prev) => ({
      ...prev,
      [fieldKey]: {
        value,
        source: 'manual',
        confidence: 1.0,
        unit,
      },
    }))
  }

  // Handle adding custom attribute
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

    setOtherAttributes((prev) => [...prev, newAttr])
    setNewKey('')
    setNewValue('')
    setNewType('text')
  }

  const handleUpdateOtherValue = (id: string, val: string) => {
    setOtherAttributes((prev) =>
      prev.map((attr) =>
        attr.id === id ? { ...attr, value: val, source: 'manual' } : attr
      )
    )
  }

  const handleRemoveOther = (id: string) => {
    setOtherAttributes((prev) => prev.filter((attr) => attr.id !== id))
  }

  // Combine all active attributes for Semantic Data API payload
  const combinedAttributesForSubmission = useMemo(() => {
    const list: AcceptedAttribute[] = []

    // 1. Template fields
    if (template) {
      template.fields.forEach((field) => {
        const valData = templateFieldValues[field.key]
        if (valData && valData.value.trim().length > 0) {
          list.push({
            id: `tpl-${field.key}`,
            key: field.key,
            label: isZh ? field.nameZh : field.nameEn,
            value: valData.value.trim(),
            type: field.type,
            unit: valData.unit || field.unit || null,
            confidence: valData.confidence ?? 1.0,
            source: valData.source ?? 'manual',
          })
        }
      })
    }

    // 2. Other / custom attributes
    otherAttributes.forEach((attr) => {
      if (attr.value.trim().length > 0) {
        list.push(attr)
      }
    })

    return list
  }, [template, templateFieldValues, otherAttributes, isZh])

  // Save to Product Semantic Data handler
  const handleApplyToSemanticData = async () => {
    if (!productId) {
      setApplyResult({
        success: false,
        message: isZh
          ? '请先保存商品，获得 Product ID 后再提交语义数据'
          : 'Please save the product first to acquire a Product ID',
      })
      return
    }

    if (combinedAttributesForSubmission.length === 0) {
      setApplyResult({
        success: false,
        message: isZh
          ? '请在属性模板中填写或添加至少一条属性'
          : 'Please fill in template fields or add at least one attribute first',
      })
      return
    }

    setIsApplying(true)
    setApplyResult(null)

    try {
      const payload = {
        attributes: combinedAttributesForSubmission.map((attr) => ({
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
        const errorMsg =
          body?.error || (isZh ? '保存语义数据失败' : 'Failed to save semantic data')
        throw new Error(errorMsg)
      }

      const mapping = body.mapping

      setApplyResult({
        success: true,
        message: isZh
          ? '成功写入商品语义数据 (Product Semantics)'
          : 'Successfully saved to Product Semantics',
        acceptedCount: mapping?.accepted?.length ?? 0,
        unknownCount: mapping?.unknownFields?.length ?? 0,
        rejectedCount: mapping?.rejected?.length ?? 0,
      })
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : isZh
          ? '请求失败，请稍后重试'
          : 'Request failed'
      setApplyResult({
        success: false,
        message: msg,
      })
    } finally {
      setIsApplying(false)
    }
  }

  const renderConfidenceBadge = (confidence: number, source: 'ai' | 'manual') => {
    if (source === 'manual') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {isZh ? '手动设定' : 'Manual'}
        </span>
      )
    }
    if (confidence >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
          <Sparkles size={10} className="text-violet-600" />
          <span>✨ AI ({(confidence * 100).toFixed(0)}%)</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Sparkles size={10} className="text-amber-600" />
        <span>✨ AI 待确认 ({(confidence * 100).toFixed(0)}%)</span>
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {isZh ? '扩展属性与规格模板 (Product Attributes & Specs)' : 'Product Attributes & Specs'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {template
                ? isZh
                  ? `已与分类「${category}」联动加载标准属性模板`
                  : `Linked with "${category}" category specification template`
                : isZh
                ? '当前分类采用通用自由属性体系，支持自定义添加'
                : 'General custom attributes for unconstrained categories'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleApplyToSemanticData}
          disabled={disabled || isApplying || combinedAttributesForSubmission.length === 0}
          className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
        >
          <Send size={13} />
          <span>
            {isApplying
              ? isZh
                ? '正在映射与校准...'
                : 'Mapping & Normalizing...'
              : isZh
              ? '保存到商品语义数据'
              : 'Apply to Product Semantics'}
          </span>
        </button>
      </div>

      {/* Category Change Banner */}
      {categoryChangeNotice && (
        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2">
            <Info size={15} className="text-blue-600 shrink-0" />
            <span>{categoryChangeNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setCategoryChangeNotice(null)}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
          >
            {isZh ? '我知道了' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Apply Result Message */}
      {applyResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
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
                  ? `匹配核心规范 field: ${applyResult.acceptedCount ?? 0} 项 | 未知属性存入 unknown: ${applyResult.unknownCount ?? 0} 项`
                  : `Mapped fields: ${applyResult.acceptedCount ?? 0} | Unknown: ${applyResult.unknownCount ?? 0}`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 1. Universal Core Attributes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-violet-600" />
          <h3 className="text-xs font-bold text-slate-900">
            {isZh ? '通用物理属性 (Universal Physical Attributes)' : 'Universal Physical Attributes'}
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

      {/* 2. Structured Category Template Specs OR Fallback Notice */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        {template ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-md bg-violet-100/70 text-violet-800 text-[11px] font-bold border border-violet-200">
                  {isZh ? template.titleZh : template.titleEn}
                </div>
                <span className="text-xs text-slate-500">
                  {isZh ? template.descriptionZh : template.descriptionEn}
                </span>
              </div>
            </div>

            {/* Template Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              {template.fields.map((field) => {
                const valData = templateFieldValues[field.key] || {
                  value: '',
                  source: 'manual',
                  confidence: 1.0,
                }
                const label = isZh ? field.nameZh : field.nameEn
                const placeholder = isZh ? field.placeholderZh : field.placeholderEn

                return (
                  <div key={field.key} className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>{label}</span>
                        {field.unit && (
                          <span className="text-[10px] text-slate-400 font-normal">({field.unit})</span>
                        )}
                      </label>
                      {valData.value ? (
                        renderConfidenceBadge(valData.confidence, valData.source)
                      ) : (
                        <span className="text-[10px] text-slate-400">{isZh ? '待填写' : 'Empty'}</span>
                      )}
                    </div>

                    {field.type === 'select' ? (
                      <select
                        value={valData.value}
                        onChange={(e) => handleTemplateFieldChange(field.key, e.target.value, field.unit)}
                        disabled={disabled}
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      >
                        <option value="">{isZh ? '-- 请选择 --' : '-- Select --'}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleTemplateFieldChange(
                              field.key,
                              valData.value === 'true' ? 'false' : 'true'
                            )
                          }
                          disabled={disabled}
                          className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            valData.value === 'true'
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {valData.value === 'true' ? (isZh ? '已启用 / 支持' : 'Supported / Yes') : (isZh ? '未启用 / 否' : 'No')}
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={valData.value}
                          onChange={(e) => handleTemplateFieldChange(field.key, e.target.value, field.unit)}
                          disabled={disabled}
                          placeholder={placeholder || (isZh ? '输入参数值...' : 'Enter value...')}
                          className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-1.5">
            <Sliders size={20} className="mx-auto text-slate-400 mb-1" />
            <h4 className="text-xs font-bold text-slate-700">
              {isZh ? '通用属性 (Custom Attributes)' : 'Custom Attributes'}
            </h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              {isZh
                ? '当前品类暂无专用属性模板，可自行添加商品规格。'
                : 'No dedicated attribute template for this category yet. You may add custom product specifications.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Other & Custom Attributes (Preserves unmatched attributes on category change) */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">
              {template
                ? isZh
                  ? '其他与自定义规格 (Other & Custom Attributes)'
                  : 'Other & Custom Attributes'
                : isZh
                ? '已添加自定义属性 (Custom Attributes List)'
                : 'Custom Attributes List'}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
              {otherAttributes.length}
            </span>
          </div>
        </div>

        {otherAttributes.length > 0 ? (
          <div className="space-y-2">
            {otherAttributes.map((attr) => (
              <div
                key={attr.id}
                className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="col-span-3">
                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                    {attr.label || attr.key}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    {attr.key}
                  </span>
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleUpdateOtherValue(attr.id, e.target.value)}
                    placeholder={isZh ? '属性值' : 'Value'}
                    className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  {renderConfidenceBadge(attr.confidence, attr.source)}
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {attr.type}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveOther(attr.id)}
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
          <p className="text-center py-2 text-[11px] text-slate-400">
            {isZh ? '暂无额外属性。可在下方自由添加。' : 'No additional attributes. Add below if needed.'}
          </p>
        )}

        {/* Add Custom Attribute Form */}
        <div className="pt-2">
          {customError && (
            <p className="text-xs text-rose-600 font-medium mb-1.5">{customError}</p>
          )}

          <form
            onSubmit={handleAddCustomAttribute}
            className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200"
          >
            <div className="col-span-4">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={
                  isZh
                    ? '属性名 (如: water_resistance)'
                    : 'Key / Name (e.g. water_resistance)'
                }
                className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="col-span-4">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={isZh ? '属性值 (如: IP68)' : 'Value (e.g. IP68)'}
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
    </div>
  )
}
