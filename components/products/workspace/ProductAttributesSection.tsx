'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithRetry } from '@/lib/network/retry-client'
import {
  getCategoryTemplate,
  AttributeTemplateField,
} from '@/lib/product/category-templates'
import {
  buildAttributeSchemaState,
  AttributeSchemaState,
} from '@/lib/product/attribute-schema-state'
import {
  resolveCategoryAttributeRules,
  AttributeRuleDefinition,
} from '@/lib/product/attribute-rules'
import { resolveCategorySemanticMappings } from '@/lib/product/category-semantic-mapping'
import { getCategoryConditionalRules } from '@/lib/product/category-conditional-rules'
import { resolveEffectiveAttributeRules } from '@/lib/product/effective-attribute-rules'
import type { CanonicalProductAttribute } from '@/lib/products/canonical-attributes'
import type { AttributeCompletenessItem } from '@/lib/product/attribute-completeness'

/**
 * Canonical Product Attribute View Model (Frontend UI Contract)
 * Directly consumes unified attribute rule definitions.
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

// Backward-compatible type aliases for existing references
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
  source: 'ai' | 'manual' | 'system'
}

export interface ProductAttributesSectionProps {
  productId?: string
  category?: string
  attributeValues: ProductAttributeValue[]
  onChangeAttributeValues: (values: ProductAttributeValue[]) => void
  isLoading?: boolean
  isLegacyFallback?: boolean
  error?: string | null
  onRetry?: () => void
  disabled?: boolean
  // Optional legacy props maintained for signature backward compatibility
  coreMaterial?: string
  setCoreMaterial?: (val: string) => void
  coreDimensions?: string
  setCoreDimensions?: (val: string) => void
  coreWeight?: string
  setCoreWeight?: (val: string) => void
  coreOrigin?: string
  setCoreOrigin?: (val: string) => void
  customAttributes?: CustomAttribute[]
  setCustomAttributes?: React.Dispatch<React.SetStateAction<CustomAttribute[]>>
  initialAiAttributes?: AcceptedAttribute[]
}

export function ProductAttributesSection({
  productId,
  category = '',
  attributeValues = [],
  onChangeAttributeValues,
  isLoading = false,
  isLegacyFallback = false,
  error = null,
  onRetry,
  disabled = false,
}: ProductAttributesSectionProps) {
  const { isZh } = useLanguage()

  // 1. Current category template (Field Definitions Source)
  const template = useMemo(() => getCategoryTemplate(category), [category])
  const prevCategoryRef = useRef(category)
  const [categoryChangeNotice, setCategoryChangeNotice] = useState<string | null>(null)

  // 2. Dirty State Tracking (Unsaved modifications in UI session)
  const [isDirty, setIsDirty] = useState(false)

  // 3. Validation Errors State (per-field and section-level)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalValidationError, setGlobalValidationError] = useState<string | null>(null)
  const [ruleConflictNotice, setRuleConflictNotice] = useState<string | null>(null)

  // 4. Resolve Category Attribute Rules Map
  const rules = useMemo(() => {
    if (!template || !template.fields || template.fields.length === 0) {
      return new Map<string, AttributeRuleDefinition>()
    }

    const semanticFields = template.fields.map((f, idx) => ({
      id: `sf-${category}-${idx}`,
      field_name: f.key,
      field_type: f.type,
      display_name: isZh ? f.nameZh : f.nameEn,
      required: false,
      allowed_values: f.options,
      validation_rules: f.options ? { enum: f.options } : {},
    }))

    const { mappings } = resolveCategorySemanticMappings(
      category,
      template.fields,
      semanticFields,
    )

    const { rules: resolvedRules } = resolveCategoryAttributeRules(
      template.fields,
      semanticFields,
      mappings,
    )

    return resolvedRules
  }, [category, template, isZh])

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

  // 6. Consume AttributeSchemaState
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

  // Handle Category Changes without silently deleting data
  useEffect(() => {
    if (prevCategoryRef.current !== category && prevCategoryRef.current !== '') {
      const prevTemplate = getCategoryTemplate(prevCategoryRef.current)
      const currentTemplate = getCategoryTemplate(category)

      if (prevTemplate?.id !== currentTemplate?.id) {
        setCategoryChangeNotice(
          isZh
            ? `分类已更新为「${category || '通用'}」，属性规范模板已实时切换。原有属性数据已完整保留。`
            : `Category updated to "${category || 'General'}". Template refreshed and previous attribute data safely retained.`
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

  // Apply API status state
  const [isApplying, setIsApplying] = useState(false)
  const deletedKeysRef = useRef<Set<string>>(new Set())
  const [applyResult, setApplyResult] = useState<{
    success: boolean
    message: string
    acceptedCount?: number
    unknownCount?: number
    rejectedCount?: number
  } | null>(null)

  // Helper to scroll and focus the first invalid field
  const focusFirstInvalidField = (fieldKey: string) => {
    setTimeout(() => {
      const fieldContainer = document.getElementById(`attr-field-${fieldKey}`)
      const inputElement = document.getElementById(`attr-input-${fieldKey}`)
      if (fieldContainer) {
        fieldContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      if (inputElement) {
        inputElement.focus()
      }
    }, 100)
  }

  // Handle standard rule field modification
  const handleStandardFieldChange = (
    fieldKey: string,
    value: string,
    rule: AttributeRuleDefinition,
    labelName?: string,
  ) => {
    setIsDirty(true)

    // Clear specific field error upon user correction
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }
    if (globalValidationError) {
      setGlobalValidationError(null)
    }

    if (!value || !value.trim()) {
      deletedKeysRef.current.add(fieldKey)
    } else {
      deletedKeysRef.current.delete(fieldKey)
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

    // Prevent duplicate key collision
    const exists = attributeValues.some((a) => a.fieldKey.toLowerCase() === standardKey)
    if (exists) {
      setCustomError(isZh ? '已存在同名属性，请在已有属性项中直接修改' : 'Attribute already exists')
      return
    }

    setIsDirty(true)
    deletedKeysRef.current.delete(standardKey)
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
    setIsDirty(true)
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldKey]
        return next
      })
    }
    if (!val || !val.trim()) {
      deletedKeysRef.current.add(fieldKey)
    } else {
      deletedKeysRef.current.delete(fieldKey)
    }
    const next = attributeValues.map((attr) =>
      attr.fieldKey === fieldKey ? { ...attr, value: val, source: 'manual' as const } : attr
    )
    onChangeAttributeValues(next)
  }

  const handleRemoveOther = (fieldKey: string) => {
    setIsDirty(true)
    deletedKeysRef.current.add(fieldKey)
    const next = attributeValues.filter((attr) => attr.fieldKey !== fieldKey)
    onChangeAttributeValues(next)
  }

  // Combine non-empty attributes for semantic submission
  const validAttributesForSubmission = useMemo(() => {
    return attributeValues.filter((attr) => attr.value && attr.value.trim().length > 0)
  }, [attributeValues])

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

    const deletions = Array.from(deletedKeysRef.current)

    if (validAttributesForSubmission.length === 0 && deletions.length === 0) {
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
    setFieldErrors({})
    setGlobalValidationError(null)

    try {
      const payload = {
        category,
        attributes: validAttributesForSubmission.map((attr) => ({
          fieldKey: attr.fieldKey,
          label: attr.label || attr.fieldKey,
          value: attr.value,
          type: attr.type,
          unit: attr.unit || null,
          required: attr.required,
          allowedValues: attr.allowedValues,
          min: attr.min,
          max: attr.max,
          source: attr.source || 'manual',
          confidence: attr.confidence ?? 1.0,
        })),
        deletions: deletions.length > 0 ? deletions : undefined,
      }

      const response = await fetchWithRetry(
        `/api/merchant/products/${productId}/canonical-attributes`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        {
          timeoutMs: 30_000,
          maxAttempts: 2,
        }
      )

      const body = await response.json().catch(() => ({}))

      // Handle 422 Validation Error gracefully
      if (response.status === 422 && body?.issues) {
        const errorsMap: Record<string, string> = {}
        for (const issue of body.issues) {
          errorsMap[issue.fieldKey] = issue.message
        }
        setFieldErrors(errorsMap)
        setGlobalValidationError(
          isZh
            ? '商品属性有未通过校验的字段，请检查修正后重试'
            : 'Some product attributes failed validation. Please review and fix the highlighted fields.'
        )
        setApplyResult({
          success: false,
          message: isZh
            ? '属性规则校验未通过'
            : 'Product attribute validation failed',
        })
        setIsDirty(true)
        if (body.issues.length > 0) {
          focusFirstInvalidField(body.issues[0].fieldKey)
        }
        return
      }

      if (!response.ok) {
        const errorMsg =
          body?.error || (isZh ? '保存语义数据失败' : 'Failed to save canonical attribute data')
        throw new Error(errorMsg)
      }

      const mapping = body.mapping
      deletedKeysRef.current.clear()
      setIsDirty(false)
      setFieldErrors({})
      setGlobalValidationError(null)

      if (body.canonical?.attributes) {
        onChangeAttributeValues(body.canonical.attributes)
      }

      setApplyResult({
        success: true,
        message: isZh
          ? '成功写入商品规范语义数据 (Product Semantics)'
          : 'Successfully saved to Product Canonical Semantics',
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
      setIsDirty(true)
    } finally {
      setIsApplying(false)
    }
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
          <span>✨ AI ({(confidence * 100).toFixed(0)}%)</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Sparkles size={10} className="text-amber-600" />
        <span>✨ AI 待确认 ({(confidence * 100).toFixed(0)}%)</span>
      </span>
    )
  }

  const completeness = schemaState.completeness

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-[#024AD8] flex items-center justify-center font-mono font-bold text-xs">
            05
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {isZh ? '标准商品属性与规格 (Canonical Product Attributes)' : 'Canonical Product Attributes'}
              </h2>
              {isDirty && (
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {isZh ? '● 未保存修改' : '● Unsaved Changes'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {template
                ? isZh
                  ? `已与分类「${category}」联动加载标准属性模板定义`
                  : `Linked with "${category}" category standard specification template`
                : isZh
                ? '当前分类采用通用自由属性体系，支持自定义添加'
                : 'General custom attributes for unconstrained categories'}
            </p>
          </div>
        </div>

        {/* Action button (HP Standard Primary Button) */}
        <button
          type="button"
          onClick={handleApplyToSemanticData}
          disabled={disabled || isApplying || isLoading || validAttributesForSubmission.length === 0}
          className="px-3.5 py-1.5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed transition-all focus-visible:outline-2 focus-visible:outline-[#024AD8] focus-visible:outline-offset-2"
        >
          {isApplying ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} />
          )}
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

      {/* Schema Summary UI */}
      {rules.size > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {category || (isZh ? '通用分类' : 'General Category')}
              </span>
              {template && (
                <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 text-[#024AD8] text-[10px] font-bold border border-blue-200">
                  {isZh ? template.titleZh : template.titleEn}
                </span>
              )}
            </div>

            {/* Status Badge */}
            <div>
              {completeness.invalidFields > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-rose-50 text-[#D32F2F] font-bold text-xs border border-rose-200">
                  <AlertCircle size={13} />
                  <span>{isZh ? '属性存在错误' : 'Attribute Errors'}</span>
                </span>
              ) : completeness.requiredFields > completeness.completedRequiredFields ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                  <AlertTriangle size={13} />
                  <span>{isZh ? '待完善' : 'Incomplete'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  <CheckCircle2 size={13} />
                  <span>{isZh ? '已满足要求' : 'Requirements Met'}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Attribute Completeness (属性完整度) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>{isZh ? '属性完整度' : 'Attribute Completeness'}</span>
                <span className="font-mono font-bold text-slate-900">
                  {completeness.completedFields} / {completeness.totalFields}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    completeness.invalidFields > 0
                      ? 'bg-[#D32F2F]'
                      : completeness.isComplete
                      ? 'bg-emerald-500'
                      : 'bg-[#024AD8]'
                  }`}
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>

            {/* Required Attributes (必填属性) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>{isZh ? '必填属性' : 'Required Attributes'}</span>
                <span className="font-mono font-bold text-slate-900">
                  {completeness.completedRequiredFields} / {completeness.requiredFields}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    completeness.completedRequiredFields === completeness.requiredFields
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${completeness.requiredPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invalid State Banner (Non-blocking) */}
      {completeness.invalidFields > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[#D32F2F] text-xs flex items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-[#D32F2F] shrink-0" />
            <span className="font-semibold">
              {isZh
                ? `属性存在错误：当前有 ${completeness.invalidFields} 个属性未通过规则校验，请检查下方高亮字段`
                : `Attribute errors detected: ${completeness.invalidFields} field(s) failed rule validation. Please review highlighted inputs below.`}
            </span>
          </div>
        </div>
      )}

      {/* Global Validation Error Banner */}
      {globalValidationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-[#D32F2F] shrink-0" />
            <span className="font-semibold">{globalValidationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalValidationError(null)}
            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            {isZh ? '我知道了' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Rule Conflict Notice Banner (Non-blocking) */}
      {ruleConflictNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              {isZh
                ? '属性规则存在配置冲突，请联系管理员'
                : 'Attribute rule configuration conflict detected, please contact administrator'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRuleConflictNotice(null)}
            className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            {isZh ? '忽略' : 'Dismiss'}
          </button>
        </div>
      )}

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
              ? '当前使用兼容数据（Legacy Fallback）。保存后将自动归一化并写入正式标准规范语义层。'
              : 'Currently using legacy compatibility data. Saving will normalize and write to the canonical semantic store.'}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <Loader2 size={24} className="mx-auto text-[#024AD8] animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-800">
              {isZh ? '正在加载商品属性…' : 'Loading product attributes...'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isZh
                ? '正在获取并校验属性规范模型，请稍候'
                : 'Hydrating and validating canonical attribute view model...'}
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
      {!isLoading && !error && attributeValues.length === 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600 flex items-center gap-2.5">
          <Info size={15} className="text-slate-400 shrink-0" />
          <span>
            {isZh
              ? '当前商品暂无已保存属性。您可以直接在下方分类标准模板中填写，或在底部添加自定义属性。'
              : 'No saved attributes yet for this product. You can fill in the category template fields below or add custom attributes.'}
          </span>
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

      {/* Main Content Area (Rendered when not in loading state) */}
      {!isLoading && (
        <>
          {/* 1. Standard Specifications (标准规格) */}
          {rules.size > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    {isZh ? '标准规格' : 'Standard Specifications'}
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

                  // Conditional Visibility: Hide field in UI without clearing value
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
                  const isTriggered = Boolean(
                    condState?.triggeredRuleIds && condState.triggeredRuleIds.length > 0,
                  )

                  return (
                    <div
                      key={fieldKey}
                      id={`attr-field-${fieldKey}`}
                      className={`space-y-1.5 bg-white p-3 rounded-xl border transition-all ${
                        isInvalid
                          ? 'border-[#D32F2F] bg-rose-50/30 ring-1 ring-[#D32F2F]'
                          : 'border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <label
                          htmlFor={`attr-input-${fieldKey}`}
                          className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 truncate"
                        >
                          <span className="truncate">{label}</span>
                          {isConditionalRequired ? (
                            <span
                              className="px-1.5 py-0.2 rounded-[4px] bg-blue-50 text-[#024AD8] text-[10px] font-bold border border-blue-200 shrink-0"
                              title={
                                isZh
                                  ? '根据当前选择，此属性为必填'
                                  : 'Required based on current selection'
                              }
                            >
                              {isZh
                                ? '根据当前选择，此属性为必填'
                                : 'Required (Conditional)'}
                            </span>
                          ) : isRequired ? (
                            <span className="px-1.5 py-0.2 rounded-[4px] bg-rose-50 text-[#D32F2F] text-[10px] font-bold border border-rose-200 shrink-0">
                              {isZh ? '必填' : 'Required'}
                            </span>
                          ) : null}
                          {isTriggered && !isConditionalRequired && (
                            <span className="px-1.5 py-0.2 rounded-[4px] bg-[#EFF4FF] text-[#024AD8] text-[10px] font-medium border border-blue-200 shrink-0">
                              {isZh ? '条件生效' : 'Condition Active'}
                            </span>
                          )}
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
                              <span>{isZh ? '缺失必填' : 'Missing'}</span>
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
                          aria-required={isRequired}
                          aria-invalid={isInvalid}
                          aria-describedby={
                            isInvalid ? `attr-error-${fieldKey}` : undefined
                          }
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
                          className={`w-full h-8 px-2.5 rounded-[4px] text-xs text-slate-900 focus:outline-none transition-all ${
                            isInvalid
                              ? 'bg-rose-50/40 border border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]'
                              : 'bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-[#024AD8]'
                          }`}
                        >
                          <option value="">{isZh ? '-- 请选择 --' : '-- Select --'}</option>
                          {(effRule.allowedValues || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : effRule.type === 'boolean' ? (
                        <div
                          id={`attr-input-${fieldKey}`}
                          tabIndex={0}
                          aria-label={label}
                          aria-required={isRequired}
                          aria-invalid={isInvalid}
                          aria-describedby={
                            isInvalid ? `attr-error-${fieldKey}` : undefined
                          }
                          className="flex items-center justify-between pt-1"
                        >
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
                            className={`h-7 px-3 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                              value === 'true'
                                ? 'bg-[#024AD8] text-white hover:bg-[#003198]'
                                : 'bg-white border border-[#D1D1D1] text-[#1C1C1C] hover:bg-[#F7F7F7]'
                            }`}
                          >
                            {value === 'true'
                              ? isZh
                                ? '已启用 / 支持'
                                : 'Supported / Yes'
                              : isZh
                              ? '未启用 / 否'
                              : 'No'}
                          </button>
                          {value && renderConfidenceBadge(confidence, source)}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id={`attr-input-${fieldKey}`}
                            aria-label={label}
                            aria-required={isRequired}
                            aria-invalid={isInvalid}
                            aria-describedby={
                              isInvalid ? `attr-error-${fieldKey}` : undefined
                            }
                            type={effRule.type === 'number' ? 'number' : 'text'}
                            min={effRule.min}
                            max={effRule.max}
                            step={effRule.type === 'number' ? 'any' : undefined}
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
                            placeholder={
                              placeholder ||
                              (effRule.min !== undefined && effRule.max !== undefined
                                ? `${effRule.min} ~ ${effRule.max}`
                                : isZh
                                ? '输入参数值...'
                                : 'Enter value...')
                            }
                            className={`w-full h-8 px-2.5 rounded-[4px] text-xs text-slate-900 focus:outline-none transition-all ${
                              isInvalid
                                ? 'bg-rose-50/40 border border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]'
                                : 'bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-[#024AD8]'
                            }`}
                          />
                        </div>
                      )}

                      {/* Confidence Badge for non-boolean populated fields */}
                      {effRule.type !== 'boolean' && value && (
                        <div className="pt-0.5 flex justify-end">
                          {renderConfidenceBadge(confidence, source)}
                        </div>
                      )}

                      {/* Inline Error Message */}
                      {isInvalid && (
                        <p
                          id={`attr-error-${fieldKey}`}
                          className="text-[11px] text-[#D32F2F] font-medium mt-1 flex items-center gap-1"
                        >
                          <AlertCircle size={12} className="shrink-0" />
                          <span>
                            {fieldError ||
                              (effRule.type === 'number'
                                ? isZh
                                  ? `数值不符合要求${
                                      effRule.min !== undefined && effRule.max !== undefined
                                        ? ` (范围: ${effRule.min} ~ ${effRule.max})`
                                        : ''
                                    }`
                                  : 'Invalid number value'
                                : effRule.type === 'select'
                                ? isZh
                                  ? '选项不在允许的值范围内'
                                  : 'Selected option is not in allowed values'
                                : isZh
                                ? '输入值无效'
                                : 'Invalid value')}
                          </span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Empty Category Template Banner */
            <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-1.5">
              <Sliders size={20} className="mx-auto text-slate-400 mb-1" />
              <h4 className="text-xs font-bold text-slate-700">
                {isZh ? '当前分类暂无标准属性模板' : 'No Standard Attribute Template For Category'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                {isZh
                  ? '当前品类暂无预定义的标准规范模板，可在下方自由添加扩展属性。'
                  : 'There is no standard predefined template for this category. You may freely add custom attributes below.'}
              </p>
            </div>
          )}

          {/* 2. Other Attributes (其他属性) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  {isZh ? '其他属性' : 'Other Attributes'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-[4px] bg-slate-100 text-slate-600">
                  {schemaState.otherAttributes.length}
                </span>
              </div>
            </div>

            {schemaState.otherAttributes.length > 0 ? (
              <div className="space-y-2">
                {schemaState.otherAttributes.map((attr) => {
                  const otherError = fieldErrors[attr.fieldKey]
                  return (
                    <div
                      key={attr.fieldKey}
                      id={`attr-field-${attr.fieldKey}`}
                      className={`p-2.5 rounded-xl border transition-all ${
                        otherError
                          ? 'bg-rose-50/40 border-[#D32F2F] ring-1 ring-[#D32F2F]'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <span className="text-[11px] font-bold text-slate-800 block truncate">
                            {attr.label || attr.fieldKey}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            {attr.fieldKey}
                          </span>
                        </div>

                        <div className="col-span-4">
                          <input
                            id={`attr-input-${attr.fieldKey}`}
                            aria-label={attr.label || attr.fieldKey}
                            aria-invalid={Boolean(otherError)}
                            aria-describedby={
                              otherError ? `attr-error-${attr.fieldKey}` : undefined
                            }
                            type={attr.type === 'number' ? 'number' : 'text'}
                            value={attr.value}
                            onChange={(e) => handleUpdateOtherValue(attr.fieldKey, e.target.value)}
                            placeholder={isZh ? '属性值' : 'Value'}
                            className={`w-full h-8 px-2.5 rounded-[4px] text-xs text-slate-900 focus:outline-none transition-all ${
                              otherError
                                ? 'bg-white border border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]'
                                : 'bg-white border border-slate-200 focus:ring-1 focus:ring-[#024AD8]'
                            }`}
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
                            aria-label={`Remove ${attr.label || attr.fieldKey}`}
                            onClick={() => handleRemoveOther(attr.fieldKey)}
                            className="p-1 text-slate-400 hover:text-[#D32F2F] rounded-[4px] cursor-pointer transition-colors"
                            title={isZh ? '移除' : 'Remove'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {otherError && (
                        <p
                          id={`attr-error-${attr.fieldKey}`}
                          className="text-[11px] text-[#D32F2F] font-medium mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle size={12} className="shrink-0" />
                          <span>{otherError}</span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center py-2 text-[11px] text-slate-400">
                {isZh ? '暂无其他属性。可在下方自由添加。' : 'No additional attributes. Add below if needed.'}
              </p>
            )}

            {/* Add Custom Attribute Form */}
            <div className="pt-2">
              {customError && (
                <p className="text-xs text-[#D32F2F] font-medium mb-1.5">{customError}</p>
              )}

              <form
                onSubmit={handleAddCustomAttribute}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200"
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    aria-label={isZh ? '新属性名' : 'New attribute key'}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder={
                      isZh
                        ? '属性名 (如: water_resistance)'
                        : 'Key / Name (e.g. water_resistance)'
                    }
                    className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                  />
                </div>

                <div className="col-span-4">
                  <input
                    type="text"
                    aria-label={isZh ? '新属性值' : 'New attribute value'}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={isZh ? '属性值 (如: IP68)' : 'Value (e.g. IP68)'}
                    className="w-full h-8 px-2.5 rounded-[4px] bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#024AD8]"
                  />
                </div>

                <div className="col-span-2">
                  <select
                    value={newType}
                    aria-label={isZh ? '新属性类型' : 'New attribute type'}
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
                    type="submit"
                    disabled={disabled}
                    className="w-full h-8 px-3 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer disabled:bg-[#E2E2E2] disabled:text-[#9E9E9E] disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={13} />
                    <span>{isZh ? '添加' : 'Add'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
