'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import {
  getCategoryTemplate,
  AttributeTemplateField,
} from '@/lib/product/category-templates'
import {
  buildAttributeSchemaState,
  AttributeSchemaState,
} from '@/lib/product/attribute-schema-state'
import type { AttributeRuleDefinition } from '@/lib/product/attribute-rules'
import { getCategoryConditionalRules } from '@/lib/product/category-conditional-rules'
import { resolveEffectiveAttributeRules } from '@/lib/product/effective-attribute-rules'
import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeCompletenessItem } from '@/lib/product/attribute-completeness'
import type { ProductAiReport, ProductAiChange } from '@/lib/product/ai-intelligence'
import { analyzeProductWithAi } from '@/lib/product/product-ai-intelligence'
import { ProductAiIntelligenceDrawer } from './ProductAiIntelligenceDrawer'

/**
 * Canonical Product Attribute View Model (Frontend UI Contract)
 */
export interface ProductAttributeValue {
  fieldKey: string
  label?: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
  unit?: string | null
  required?: boolean
  allowedValues?: string[]
  min?: number
  max?: number
  source?: 'ai' | 'manual' | 'system'
  confidence?: number
  isStandard?: boolean
}

export interface ProductAttributesSectionProps {
  productId?: string
  category?: string
  categoryId?: string | null
  attributeValues: ProductAttributeValue[]
  onChangeAttributeValues: (values: ProductAttributeValue[]) => void
  isLoading?: boolean
  isLegacyFallback?: boolean
  error?: string | null
  onRetry?: () => void
  disabled?: boolean
  onOpenPreview?: (title: string) => void
}

export function ProductAttributesSection({
  productId,
  category = '',
  categoryId = null,
  attributeValues = [],
  onChangeAttributeValues,
  isLoading = false,
  isLegacyFallback = false,
  error = null,
  onRetry,
  disabled = false,
  onOpenPreview,
}: ProductAttributesSectionProps) {
  const { isZh } = useLanguage()

  // 1. Current category template (Field Definitions Source)
  const template = useMemo(() => getCategoryTemplate(categoryId || category), [categoryId, category])
  const prevCategoryRef = useRef(category)
  const [categoryChangeNotice, setCategoryChangeNotice] = useState<string | null>(null)

  // 2. Validation Errors State (per-field)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // 3. AI 商品智能 UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiReport, setAiReport] = useState<ProductAiReport | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applyNotice, setApplyNotice] = useState<string | null>(null)

  // 4. Category Attribute Rules Map (Derived directly from category template)
  const rules = useMemo(() => {
    const map = new Map<string, AttributeRuleDefinition>()
    if (!template || !template.fields) return map

    for (const f of template.fields) {
      map.set(f.key, {
        fieldKey: f.key,
        type: f.type,
        unit: f.unit || null,
        required: Boolean((f as any).required),
        allowedValues: f.options,
        placeholderZh: f.placeholderZh,
        placeholderEn: f.placeholderEn,
      })
    }
    return map
  }, [template])

  // 5. Resolve Conditional Rules & Effective Attribute Rules
  const conditionalRules = useMemo(() => {
    return getCategoryConditionalRules(category)
  }, [category])

  const { effectiveRules, conditionalResolution } = useMemo(() => {
    const canonicalAttrs: CanonicalProductAttribute[] = attributeValues.map((attr) => ({
      fieldKey: attr.fieldKey,
      label: attr.label,
      value: attr.value,
      type: attr.type,
      unit: attr.unit,
      required: attr.required,
      allowedValues: attr.allowedValues,
      min: attr.min,
      max: attr.max,
      source: attr.source,
      confidence: attr.confidence,
      isStandard: attr.isStandard ?? rules.has(attr.fieldKey),
    }))

    const { rules: effRules, conditionalState } = resolveEffectiveAttributeRules(
      canonicalAttrs,
      rules,
      conditionalRules,
    )

    return {
      effectiveRules: effRules,
      conditionalResolution: conditionalState,
    }
  }, [attributeValues, rules, conditionalRules])

  // 6. Consume AttributeSchemaState directly from Canonical Product Attributes
  const schemaState: AttributeSchemaState = useMemo(() => {
    const canonicalAttrs: CanonicalProductAttribute[] = attributeValues.map((attr) => ({
      fieldKey: attr.fieldKey,
      label: attr.label,
      value: attr.value,
      type: attr.type,
      unit: attr.unit,
      required: attr.required,
      allowedValues: attr.allowedValues,
      min: attr.min,
      max: attr.max,
      source: attr.source,
      confidence: attr.confidence,
      isStandard: attr.isStandard ?? rules.has(attr.fieldKey),
    }))

    return buildAttributeSchemaState(canonicalAttrs, effectiveRules)
  }, [attributeValues, effectiveRules, rules])

  // Lookups derived directly from schemaState
  const completenessItemMap = useMemo(() => {
    const map = new Map<string, AttributeCompletenessItem>()
    schemaState.completeness.items.forEach((item) => {
      map.set(item.fieldKey.toLowerCase(), item)
    })
    return map
  }, [schemaState.completeness.items])

  const standardAttributeMap = useMemo(() => {
    const map = new Map<string, CanonicalProductAttribute>()
    schemaState.standardAttributes.forEach((attr) => {
      map.set(attr.fieldKey.toLowerCase(), attr)
    })
    return map
  }, [schemaState.standardAttributes])

  const templateFieldMap = useMemo(() => {
    const map = new Map<string, AttributeTemplateField>()
    if (template?.fields) {
      template.fields.forEach((f) => map.set(f.key.toLowerCase(), f))
    }
    return map
  }, [template])

  // Handle Category Changes
  useEffect(() => {
    if (prevCategoryRef.current !== category && prevCategoryRef.current !== '') {
      const prevTemplate = getCategoryTemplate(prevCategoryRef.current)
      const currentTemplate = getCategoryTemplate(category)

      if (prevTemplate?.id !== currentTemplate?.id) {
        setCategoryChangeNotice(
          isZh
            ? `分类已更新为「${category || '通用'}」，Canonical 规格模版已实时联动更新。`
            : `Category updated to "${category || 'General'}". Template refreshed.`
        )
      }
    }
    prevCategoryRef.current = category
  }, [category, isZh])

  // Custom attribute form state
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newType, setNewType] = useState<'text' | 'number' | 'boolean' | 'select'>('text')
  const [customError, setCustomError] = useState('')

  // AI 整理 Trigger
  const handleAiOrganize = async () => {
    setIsAnalyzing(true)
    setApplyNotice(null)
    try {
      if (productId) {
        const res = await fetch(`/api/merchant/products/${productId}/ai-intelligence`, {
          method: 'POST',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.report) {
            setAiReport(data.report)
            setIsAnalyzing(false)
            return
          }
        }
      }

      // Client fallback analysis if new product shell or endpoint fallback
      const report = await analyzeProductWithAi({
        productId: productId || 'temp',
        name: '商品主档',
        category,
        attributes: attributeValues.map((a) => ({
          fieldKey: a.fieldKey,
          label: a.label,
          value: a.value,
          type: a.type,
          unit: a.unit,
        })),
      })
      setAiReport(report)
    } catch (err) {
      console.error('AI Organize error:', err)
      setApplyNotice(isZh ? 'AI 商品整理失败，请重试' : 'AI Analysis failed, please retry')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // AI Apply Handler
  const handleApplyAiChanges = async (changesToApply: ProductAiChange[]) => {
    setIsApplying(true)
    try {
      if (productId) {
        const res = await fetch(`/api/merchant/products/${productId}/ai-intelligence/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes: changesToApply }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.canonical?.attributes) {
            onChangeAttributeValues(data.canonical.attributes)
          }
          const count = data.applied ?? changesToApply.filter((c) => c.status === 'accepted').length
          setApplyNotice(isZh ? `已应用 ${count} 项修改` : `Applied ${count} changes`)
          setIsDrawerOpen(false)
          setAiReport(null)
          setIsApplying(false)
          return
        }
      }

      // Client-side local application fallback
      let updatedAttrs = [...attributeValues]
      let appliedCount = 0

      for (const change of changesToApply) {
        const key = change.fieldKey
        if (change.status !== 'accepted' || !key) continue

        if (change.type === 'remove') {
          updatedAttrs = updatedAttrs.filter((a) => a.fieldKey.toLowerCase() !== key.toLowerCase())
          appliedCount++
        } else if (change.nextValue) {
          const idx = updatedAttrs.findIndex((a) => a.fieldKey.toLowerCase() === key.toLowerCase())
          if (idx >= 0) {
            updatedAttrs[idx] = {
              ...updatedAttrs[idx],
              value: change.nextValue,
              source: 'ai',
              confidence: change.confidence || 0.95,
            }
          } else {
            updatedAttrs.push({
              fieldKey: key,
              label: change.label || key,
              value: change.nextValue,
              type: 'text',
              source: 'ai',
              confidence: change.confidence || 0.95,
              isStandard: true,
            })
          }
          appliedCount++
        }
      }

      onChangeAttributeValues(updatedAttrs)
      setApplyNotice(isZh ? `已应用 ${appliedCount} 项修改` : `Applied ${appliedCount} changes`)
      setIsDrawerOpen(false)
      setAiReport(null)
    } catch (err) {
      console.error('Apply AI changes error:', err)
      setApplyNotice(isZh ? '部分修改未应用，请检查后再试' : 'Failed to apply some changes')
    } finally {
      setIsApplying(false)
    }
  }

  // One click fix handler
  const handleOneClickFix = async () => {
    if (!aiReport?.changes) return
    const allAccepted = aiReport.changes.map((c) => ({ ...c, status: 'accepted' as const }))
    await handleApplyAiChanges(allAccepted)
  }

  // Scroll to field helper
  const scrollToField = (fieldKey: string) => {
    const el = document.getElementById(`attr-field-${fieldKey}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const inputEl = document.getElementById(`attr-input-${fieldKey}`)
      if (inputEl) {
        inputEl.focus()
      }
    }
  }

  // Handle standard rule field modification
  const handleStandardFieldChange = (
    fieldKey: string,
    value: string,
    rule: AttributeRuleDefinition,
    labelName?: string,
  ) => {
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }

    const existingIndex = attributeValues.findIndex(
      (a) => a.fieldKey.toLowerCase() === fieldKey.toLowerCase()
    )

    const updatedAttr: ProductAttributeValue = {
      fieldKey,
      label: labelName || fieldKey,
      value,
      type: rule.type,
      unit: rule.unit || null,
      required: rule.required,
      allowedValues: rule.allowedValues,
      min: rule.min,
      max: rule.max,
      source: 'manual',
      confidence: 1.0,
      isStandard: true,
    }

    if (existingIndex >= 0) {
      const copy = [...attributeValues]
      copy[existingIndex] = {
        ...copy[existingIndex],
        ...updatedAttr,
      }
      onChangeAttributeValues(copy)
    } else {
      onChangeAttributeValues([...attributeValues, updatedAttr])
    }
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

    const standardKey = keyClean.toLowerCase().replace(/\s+/g, '_')

    const exists = attributeValues.some((a) => a.fieldKey.toLowerCase() === standardKey)
    if (exists) {
      setCustomError(isZh ? '已存在同名属性，请在已有属性项中直接修改' : 'Attribute already exists')
      return
    }

    const newAttr: ProductAttributeValue = {
      fieldKey: standardKey,
      label: keyClean,
      value: valClean,
      type: newType,
      source: 'manual',
      confidence: 1.0,
      isStandard: false,
    }

    onChangeAttributeValues([...attributeValues, newAttr])
    setNewKey('')
    setNewValue('')
    setNewType('text')
  }

  const handleUpdateOtherValue = (fieldKey: string, val: string) => {
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }
    const next = attributeValues.map((attr) =>
      attr.fieldKey === fieldKey ? { ...attr, value: val, source: 'manual' as const } : attr
    )
    onChangeAttributeValues(next)
  }

  const handleRemoveOther = (fieldKey: string) => {
    const next = attributeValues.filter((attr) => attr.fieldKey !== fieldKey)
    onChangeAttributeValues(next)
  }

  const renderConfidenceBadge = (confidence = 1.0, source: 'ai' | 'manual' | 'system' = 'manual') => {
    if (source === 'manual') {
      return (
        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {isZh ? '手动设定' : 'Manual'}
        </span>
      )
    }
    if (source === 'system') {
      return (
        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {isZh ? '系统预设' : 'System'}
        </span>
      )
    }
    if (confidence >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-blue-50 text-[#024AD8] border border-blue-200">
          <Sparkles size={10} className="text-[#024AD8]" />
          <span>✨ Canonical ({(confidence * 100).toFixed(0)}%)</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Sparkles size={10} className="text-amber-600" />
        <span>✨ 待确认 ({(confidence * 100).toFixed(0)}%)</span>
      </span>
    )
  }

  const completeness = schemaState.completeness

  return (
    <div className="bg-white rounded-2xl border-2 border-[#024AD8] shadow-md ring-4 ring-[#024AD8]/10 p-6 sm:p-7 space-y-6 transition-all">
      {/* Header - Core Visual Focus in Workspace with AI Organize Entry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[4px] bg-[#024AD8] text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-sm shrink-0">
            05
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isZh ? '商品规格' : 'Product Specifications'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#024AD8] text-white shadow-2xs">
                ⭐ {isZh ? '核心工作区' : 'Core Workspace'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isZh
                ? '描述商品本身的材质、功能与技术参数。已联动标准化规格模版。'
                : 'Describes the material, features, and technical specifications of the product itself.'}
            </p>
          </div>
        </div>

        {/* AI Organize Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAiOrganize}
            disabled={isAnalyzing || disabled}
            className="px-4 py-2 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
          >
            {isAnalyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>{isAnalyzing ? (isZh ? '正在整理商品…' : 'Analyzing...') : (isZh ? '[AI 整理]' : '[AI Organize]')}</span>
          </button>
        </div>
      </div>

      {/* Lightweight Loading State for AI Intelligence */}
      {isAnalyzing && (
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-center gap-3 animate-pulse">
          <Loader2 size={18} className="text-[#024AD8] animate-spin shrink-0" />
          <div>
            <p className="font-bold text-[#024AD8]">{isZh ? '正在整理商品…' : 'Analyzing product specifications...'}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isZh ? '从描述与结构化资料中归一化 Canonical 规范属性' : 'Extracting and normalizing canonical attributes'}
            </p>
          </div>
        </div>
      )}

      {/* AI Intelligence Result Summary Banner */}
      {aiReport && !isAnalyzing && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border border-blue-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#024AD8] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                {isZh ? 'AI 商品智能' : 'AI Product Intelligence'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {isZh
                  ? `发现 ${aiReport.summary.changeCount + aiReport.summary.errorCount} 项需要处理（新增 ${aiReport.summary.addCount} • 修改 ${aiReport.summary.updateCount} • 冲突 ${aiReport.summary.errorCount}）`
                  : `${aiReport.summary.changeCount + aiReport.summary.errorCount} items to review`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-[4px] bg-white border border-[#D1D1D1] text-[#1C1C1C] text-xs font-medium hover:bg-[#F7F7F7] hover:border-[#B0B0B0] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8]"
            >
              {isZh ? '[查看修改]' : '[View Changes]'}
            </button>
            <button
              type="button"
              onClick={handleOneClickFix}
              disabled={isApplying}
              className="px-4 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed shadow-2xs flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#024AD8]"
            >
              {isApplying ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{isZh ? '[一键修复]' : '[One-Click Fix]'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {applyNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-bold">{applyNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setApplyNotice(null)}
            className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            {isZh ? '关闭' : 'Close'}
          </button>
        </div>
      )}

      {/* 属性完整度状态指示器 (Attribute Completeness Status Indicator) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#024AD8] text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {isZh ? '属性完整度' : 'Attribute Completeness'}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Canonical Audit</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isZh
                  ? '实时监控当前商品 Canonical 规格模版的填写合规度与字段约束'
                  : 'Real-time audit for canonical schema completeness and field constraints'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {completeness.invalidFields > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-rose-50 text-[#D32F2F] border border-rose-200 shadow-2xs">
                <AlertCircle size={16} />
                <div className="text-left">
                  <span className="text-xs font-bold block">{isZh ? '格式需修正' : 'Invalid Attributes'}</span>
                  <span className="text-[10px] font-mono block">{completeness.invalidFields} {isZh ? '项格式异常' : 'errors'}</span>
                </div>
              </div>
            ) : completeness.requiredFields > completeness.completedRequiredFields ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <AlertTriangle size={16} className="text-amber-600" />
                <div className="text-left">
                  <span className="text-xs font-bold block">{isZh ? '必填项待完善' : 'Incomplete Required'}</span>
                  <span className="text-[10px] font-mono block">
                    {isZh
                      ? `还差 ${completeness.requiredFields - completeness.completedRequiredFields} 项必填`
                      : `${completeness.requiredFields - completeness.completedRequiredFields} missing`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <div className="text-left">
                  <span className="text-xs font-bold block">{isZh ? '规格就绪 (100%)' : 'Schema Ready (100%)'}</span>
                  <span className="text-[10px] font-mono block">{isZh ? '满足所有校验条件' : 'All requirements met'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span>{isZh ? '总体规格完成率' : 'Overall Completion Rate'}</span>
              <span className="text-[11px] font-mono text-[#024AD8]">
                ({completeness.completedFields} / {completeness.totalFields})
              </span>
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {completeness.percentage}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                completeness.invalidFields > 0
                  ? 'bg-[#D32F2F]'
                  : completeness.requiredPercentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-[#024AD8]'
              }`}
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>

        {/* Stat Cards Breakdown (4 Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-medium block">
              {isZh ? '必填规格符合度' : 'Required Fields'}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {completeness.completedRequiredFields} / {completeness.requiredFields}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  completeness.completedRequiredFields === completeness.requiredFields
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {completeness.requiredPercentage}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-medium block">
              {isZh ? '标准模版属性' : 'Standard Fields'}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {rules.size} {isZh ? '项' : 'fields'}
              </span>
              <span className="text-[10px] text-[#024AD8] font-bold">Canonical</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-medium block">
              {isZh ? '扩展属性项' : 'Custom Fields'}
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {schemaState.otherAttributes.length} {isZh ? '项' : 'fields'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">Custom</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-500 font-medium block">
              {isZh ? '数据校验状态' : 'Validation Status'}
            </span>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-xs font-bold font-mono ${
                  completeness.invalidFields > 0 ? 'text-[#D32F2F]' : 'text-emerald-600'
                }`}
              >
                {completeness.invalidFields > 0
                  ? isZh
                    ? '格式异常'
                    : 'Error'
                  : isZh
                  ? '校验通过'
                  : 'Passed'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">API Sync</span>
            </div>
          </div>
        </div>

        {/* Interactive Field Status Chips */}
        {schemaState.completeness.items.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
              <span>{isZh ? '标准属性状态明细 (点击可快速定位跳转)' : 'Standard Attributes Checklist'}</span>
              <span className="text-[10px] font-normal text-slate-400">{isZh ? '根据 Canonical Rules 校验' : 'Validated by Canonical Rules'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {schemaState.completeness.items.map((item) => {
                const tmplField = templateFieldMap.get(item.fieldKey.toLowerCase())
                const labelName = tmplField
                  ? isZh
                    ? tmplField.nameZh
                    : tmplField.nameEn
                  : item.label || item.fieldKey

                const isMissingReq = item.issue === 'required'
                const isInvalid = !item.valid && Boolean(item.value)
                const isOk = item.completed && item.valid

                return (
                  <button
                    key={item.fieldKey}
                    type="button"
                    onClick={() => scrollToField(item.fieldKey)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                      isInvalid
                        ? 'bg-rose-50 text-[#D32F2F] border-rose-200 hover:bg-rose-100'
                        : isMissingReq
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : isOk
                        ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isInvalid ? (
                      <AlertCircle size={11} className="text-[#D32F2F]" />
                    ) : isMissingReq ? (
                      <AlertTriangle size={11} className="text-amber-600" />
                    ) : isOk ? (
                      <Check size={11} className="text-emerald-600" />
                    ) : null}
                    <span>{labelName}</span>
                    {item.required && !isOk && (
                      <span className="text-[9px] font-bold text-[#D32F2F] ml-0.5">*</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Change Notice */}
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

      {/* Legacy Fallback Warning Banner */}
      {!isLoading && isLegacyFallback && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 transition-all">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            {isZh
              ? '当前使用兼容数据（Legacy Fallback）。保存后将自动归一化并写入规范层。'
              : 'Currently using legacy compatibility data.'}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <Loader2 size={24} className="mx-auto text-[#024AD8] animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-800">
              {isZh ? '正在加载商品 Canonical 属性…' : 'Loading canonical attributes...'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{isZh ? '商品属性加载失败' : 'Failed to load product attributes'}</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2.5 py-1 rounded-[4px] bg-white border border-rose-300 text-rose-800 text-[11px] font-medium hover:bg-rose-100/60 transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span>{isZh ? '重试' : 'Retry'}</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State Banner */}
      {!isLoading && !error && attributeValues.length === 0 && rules.size === 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 flex items-center gap-2.5">
          <Info size={15} className="text-slate-400 shrink-0" />
          <span>
            {isZh
              ? '当前商品暂无已保存属性。您可以在下方添加自定义扩展属性。'
              : 'No saved attributes yet for this product. You can add custom attributes below.'}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && (
        <>
          {/* 1. Standard Specifications (标准规格) */}
          {rules.size > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    {isZh ? '标准规格属性字段' : 'Standard Specification Fields'}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-[4px] bg-blue-50 text-[#024AD8] border border-blue-200">
                    {rules.size} {isZh ? '项' : 'fields'}
                  </span>
                </div>
              </div>

              {/* Standard Specification Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                {Array.from(rules.entries()).map(([fieldKey, baseRule]) => {
                  const effRule = effectiveRules.get(fieldKey) || baseRule
                  const condState =
                    conditionalResolution.states.get(fieldKey) ||
                    conditionalResolution.states.get(fieldKey.toLowerCase())

                  if (condState && condState.visible === false) {
                    return null
                  }

                  const tmplField = templateFieldMap.get(fieldKey.toLowerCase())
                  const valData = standardAttributeMap.get(fieldKey.toLowerCase())
                  const item = completenessItemMap.get(fieldKey.toLowerCase())

                  const value = valData?.value ?? ''
                  const confidence = valData?.confidence ?? 1.0
                  const source = valData?.source ?? 'manual'

                  const label = tmplField
                    ? isZh
                      ? tmplField.nameZh
                      : tmplField.nameEn
                    : effRule.fieldKey
                  const placeholder = isZh
                    ? effRule.placeholderZh || tmplField?.placeholderZh
                    : effRule.placeholderEn || tmplField?.placeholderEn

                  const fieldError = fieldErrors[fieldKey]
                  const isInvalid = Boolean(fieldError) || (item ? !item.valid && Boolean(value) : false)

                  const isRequired = effRule.required
                  const isConditionalRequired = Boolean(
                    condState?.required &&
                      condState?.triggeredRuleIds &&
                      condState.triggeredRuleIds.length > 0,
                  )

                  return (
                    <div
                      key={fieldKey}
                      id={`attr-field-${fieldKey}`}
                      className={`space-y-1.5 bg-white p-3.5 rounded-xl border transition-all ${
                        isInvalid
                          ? 'border-[#D32F2F] bg-rose-50/30 ring-2 ring-[#D32F2F]/20'
                          : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <label
                          htmlFor={`attr-input-${fieldKey}`}
                          className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 truncate"
                        >
                          <span className="truncate">{label}</span>
                          {isConditionalRequired ? (
                            <span className="px-1.5 py-0.2 rounded-[4px] bg-blue-50 text-[#024AD8] text-[10px] font-bold border border-blue-200 shrink-0">
                              {isZh ? '条件必填' : 'Required'}
                            </span>
                          ) : isRequired ? (
                            <span className="px-1.5 py-0.2 rounded-[4px] bg-rose-50 text-[#D32F2F] text-[10px] font-bold border border-rose-200 shrink-0">
                              {isZh ? '必填' : 'Required'}
                            </span>
                          ) : null}
                          {effRule.unit && (
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">
                              ({effRule.unit})
                            </span>
                          )}
                        </label>

                        {/* Field State Indicator */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isInvalid ? (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-50 text-[#D32F2F] text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                              <AlertCircle size={10} />
                              <span>{isZh ? '格式错误' : 'Invalid'}</span>
                            </span>
                          ) : item?.issue === 'required' ? (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              <span>{isZh ? '缺失' : 'Missing'}</span>
                            </span>
                          ) : item?.completed ? (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              <span>✓</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">
                              {isZh ? '选填' : 'Optional'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Input Control by Rule Type */}
                      {effRule.type === 'select' ? (
                        <select
                          id={`attr-input-${fieldKey}`}
                          aria-label={label}
                          value={value}
                          onChange={(e) =>
                            handleStandardFieldChange(
                              fieldKey,
                              e.target.value,
                              effRule,
                              label,
                            )
                          }
                          disabled={disabled}
                          className="w-full h-8 px-2.5 rounded-[4px] text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#024AD8] focus:bg-white transition-all"
                        >
                          <option value="">{isZh ? '-- 请选择 --' : '-- Select --'}</option>
                          {(effRule.allowedValues || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : effRule.type === 'boolean' ? (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleStandardFieldChange(
                                fieldKey,
                                value === 'true' ? 'false' : 'true',
                                effRule,
                                label,
                              )
                            }
                            disabled={disabled}
                            className={`h-7 px-3 rounded-[4px] text-xs font-medium transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#024AD8] ${
                              value === 'true'
                                ? 'bg-[#024AD8] text-white hover:bg-[#003198]'
                                : 'bg-white border border-[#D1D1D1] text-[#1C1C1C] hover:bg-[#F7F7F7]'
                            }`}
                          >
                            {value === 'true'
                              ? isZh
                                ? '已启用 / 支持'
                                : 'Supported'
                              : isZh
                              ? '未启用 / 否'
                              : 'No'}
                          </button>
                          {value && renderConfidenceBadge(confidence, source)}
                        </div>
                      ) : (
                        <div>
                          <input
                            id={`attr-input-${fieldKey}`}
                            aria-label={label}
                            type={effRule.type === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) =>
                              handleStandardFieldChange(
                                fieldKey,
                                e.target.value,
                                effRule,
                                label,
                              )
                            }
                            disabled={disabled}
                            placeholder={placeholder || (isZh ? '输入属性值...' : 'Enter value...')}
                            className="w-full h-8 px-2.5 rounded-[4px] text-xs text-slate-900 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#024AD8] focus:bg-white transition-all"
                          />
                        </div>
                      )}

                      {effRule.type !== 'boolean' && value && (
                        <div className="pt-0.5 flex justify-end">
                          {renderConfidenceBadge(confidence, source)}
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
                {isZh ? '当前分类暂无预定义标准规格' : 'No Standard Specification Predefined'}
              </h4>
            </div>
          )}

          {/* 2. Other Attributes (扩展自定义属性) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  {isZh ? '扩展自定义属性' : 'Custom Attributes'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-[4px] bg-slate-100 text-slate-600">
                  {schemaState.otherAttributes.length}
                </span>
              </div>
            </div>

            {schemaState.otherAttributes.length > 0 ? (
              <div className="space-y-2">
                {schemaState.otherAttributes.map((attr) => (
                  <div
                    key={attr.fieldKey}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-3">
                      <span className="text-[11px] font-bold text-slate-800 block truncate">
                        {attr.label || attr.fieldKey}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <input
                        type={attr.type === 'number' ? 'number' : 'text'}
                        value={attr.value}
                        onChange={(e) => handleUpdateOtherValue(attr.fieldKey, e.target.value)}
                        placeholder={isZh ? '属性值' : 'Value'}
                        className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      {renderConfidenceBadge(attr.confidence, attr.source)}
                    </div>

                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-[10px] text-slate-500 font-medium uppercase font-mono">
                        {attr.type}
                      </span>
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveOther(attr.fieldKey)}
                        className="p-1 text-slate-400 hover:text-[#D32F2F] rounded-[4px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#024AD8]"
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
                {isZh ? '暂无扩展自定义属性。可在下方自由添加。' : 'No custom attributes yet. Add below.'}
              </p>
            )}

            {/* Add Custom Attribute Form */}
            <div className="pt-2">
              {customError && (
                <p className="text-xs text-[#D32F2F] font-medium mb-1.5">{customError}</p>
              )}

              <div
                className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomAttribute()
                  }
                }}
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder={
                      isZh
                        ? '属性名 (如: water_resistance)'
                        : 'Key (e.g. water_resistance)'
                    }
                    className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                  />
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={isZh ? '属性值 (如: IP68)' : 'Value (e.g. IP68)'}
                    className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                  />
                </div>

                <div className="col-span-2">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                  </select>
                </div>

                <div className="col-span-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleAddCustomAttribute()}
                    disabled={disabled}
                    className="w-full h-8 px-3 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8]"
                  >
                    <Plus size={13} />
                    <span>{isZh ? '添加' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Intelligence Drawer */}
      <ProductAiIntelligenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        report={aiReport}
        onApplyChanges={handleApplyAiChanges}
        isApplying={isApplying}
      />
    </div>
  )
}
