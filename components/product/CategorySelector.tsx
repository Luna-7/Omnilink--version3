'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search,
  Check,
  ChevronRight,
  Sparkles,
  X,
  RotateCcw,
  Layers,
  Shirt,
  Smartphone,
  Compass,
  Glasses,
  Home,
  Coffee,
  Baby,
  Dog,
  Car,
  Tag,
  HelpCircle,
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import {
  Category,
  CategoryTreeItem,
  getCategoryTree,
  getPopularCategories,
  searchCategories,
  getCategoryBreadcrumb,
  getCategoryById,
  findCategoryByName,
} from '@/lib/product/categories'

export interface SelectedCategoryResult {
  categoryId: string
  categoryName: string
  parentName?: string
  fullPath: string
  templateKey?: string | null
}

export interface CategorySelectorProps {
  value?: string // categoryId or categoryName
  onChange: (result: SelectedCategoryResult) => void
  onClear?: () => void
  disabled?: boolean
  className?: string
  placeholder?: string
  variant?: 'inline' | 'modal' | 'dropdown'
  id?: string
}

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  Shirt,
  Smartphone,
  Sparkles,
  Compass,
  Glasses,
  Home,
  Coffee,
  Baby,
  Dog,
  Car,
  Layers,
}

export function CategorySelector({
  value,
  onChange,
  onClear,
  disabled = false,
  className = '',
  placeholder,
  variant = 'dropdown',
  id = 'category-selector',
}: CategorySelectorProps) {
  const { isZh } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedL1Id, setSelectedL1Id] = useState<string>('cat-apparel')
  const [recentCategories, setRecentCategories] = useState<Category[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. Category Tree
  const categoryTree = useMemo(() => getCategoryTree(), [])
  const popularCategories = useMemo(() => getPopularCategories(), [])

  // 2. Load recent categories from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('omnilink_recent_categories')
      if (saved) {
        const ids: string[] = JSON.parse(saved)
        const matched = ids
          .map((id) => getCategoryById(id))
          .filter((c): c is Category => Boolean(c))
        setRecentCategories(matched.slice(0, 5))
      }
    } catch {
      // Ignore local storage error
    }
  }, [])

  const saveRecentCategory = (cat: Category) => {
    try {
      const current = recentCategories.filter((c) => c.id !== cat.id)
      const next = [cat, ...current].slice(0, 5)
      setRecentCategories(next)
      localStorage.setItem('omnilink_recent_categories', JSON.stringify(next.map((c) => c.id)))
    } catch {
      // Ignore
    }
  }

  // 3. Current selection resolution
  const currentBreadcrumb = useMemo(() => {
    return getCategoryBreadcrumb(value)
  }, [value])

  // Sync selected L1 when value or currentBreadcrumb changes
  useEffect(() => {
    if (currentBreadcrumb?.primary?.id) {
      setSelectedL1Id(currentBreadcrumb.primary.id)
    }
  }, [currentBreadcrumb])

  // 4. Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchCategories(searchQuery)
  }, [searchQuery])

  // 5. Active L1's children (L2)
  const activeL1 = useMemo(() => {
    return categoryTree.find((c) => c.id === selectedL1Id) || categoryTree[0]
  }, [categoryTree, selectedL1Id])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSelectCategory = (child: Category, parent?: Category) => {
    const parentCat = parent || (child.parentId ? getCategoryById(child.parentId) : null) || activeL1
    const fullPath = parentCat && parentCat.id !== child.id ? `${parentCat.name} > ${child.name}` : child.name

    saveRecentCategory(child)
    onChange({
      categoryId: child.id,
      categoryName: child.name,
      parentName: parentCat?.name,
      fullPath,
      templateKey: child.templateKey || null,
    })

    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClear) {
      onClear()
    } else {
      onChange({
        categoryId: '',
        categoryName: '',
        fullPath: '',
        templateKey: null,
      })
    }
  }

  // Display text in trigger
  const displayValue = useMemo(() => {
    if (!currentBreadcrumb) {
      return value ? String(value) : ''
    }
    if (currentBreadcrumb.secondary) {
      return `${currentBreadcrumb.primary.name} > ${currentBreadcrumb.secondary.name}`
    }
    return currentBreadcrumb.primary.name
  }, [currentBreadcrumb, value])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div
        id={id}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        className={`w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-50 border transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
            : isOpen
            ? 'bg-white border-[#024AD8] ring-2 ring-[#024AD8]/15 shadow-xs'
            : 'border-slate-200 hover:border-slate-300 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tag size={15} className={displayValue ? 'text-[#024AD8] shrink-0' : 'text-slate-400 shrink-0'} />
          {displayValue ? (
            <div className="flex items-center gap-1.5 min-w-0">
              {currentBreadcrumb?.primary && currentBreadcrumb.secondary ? (
                <>
                  <span className="text-xs text-slate-500 truncate">{currentBreadcrumb.primary.name}</span>
                  <span className="text-xs text-slate-300">/</span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentBreadcrumb.secondary.name}
                  </span>
                  {currentBreadcrumb.secondary.templateKey && (
                    <span className="shrink-0 text-[10px] font-medium bg-blue-50 text-[#024AD8] px-1.5 py-0.5 rounded-[4px] border border-blue-200/60 ml-1">
                      {isZh ? '规格模版' : 'Template'}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-bold text-slate-900 truncate">{displayValue}</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              {placeholder || (isZh ? '点击选择商品分类（两级体系 + 快速检索）' : 'Select product category...')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title={isZh ? '清除分类' : 'Clear'}
            >
              <X size={13} />
            </button>
          )}
          <ChevronRight
            size={15}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90 text-[#024AD8]' : ''}`}
          />
        </div>
      </div>

      {/* Popover / Panel: Red-Style (小红书风格) Classification Picker - 宽幅沉浸式大气布局 */}
      {isOpen && (
        <div className="absolute z-50 left-0 w-[min(700px,calc(100vw-32px))] mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索分类关键词（如：连衣裙、耳机、太阳镜、猫粮、面部护肤）...' : 'Search category keywords...'}
                className="w-full h-9.5 pl-9.5 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#024AD8] focus:ring-2 focus:ring-[#024AD8]/15 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Pills: Recent / Popular Categories */}
            {!searchQuery && (
              <div className="space-y-2">
                {recentCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      {isZh ? '最近常用:' : 'Recent:'}
                    </span>
                    {recentCategories.map((rc) => {
                      const isSelected = currentBreadcrumb?.secondary?.id === rc.id || value === rc.name
                      return (
                        <button
                          key={`recent-${rc.id}`}
                          type="button"
                          onClick={() => handleSelectCategory(rc)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#EFF4FF] text-[#024AD8] border-[#024AD8]/50 font-bold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>{rc.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {isZh ? '热门推荐:' : 'Popular:'}
                  </span>
                  {popularCategories.slice(0, 6).map((pop) => {
                    const isSelected = currentBreadcrumb?.secondary?.id === pop.id || value === pop.name
                    return (
                      <button
                        key={`pop-${pop.id}`}
                        type="button"
                        onClick={() => handleSelectCategory(pop)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF4FF] text-[#024AD8] border-[#024AD8]/50 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles size={11} className="text-amber-500" />
                        <span>{pop.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Result View vs 2-Level Cascade View */}
          {searchQuery ? (
            <div className="max-h-[340px] overflow-y-auto p-2.5 divide-y divide-slate-100">
              {searchResults.length > 0 ? (
                searchResults.map((res) => {
                  const isSelected = currentBreadcrumb?.secondary?.id === res.category.id || value === res.category.name
                  return (
                    <div
                      key={`search-${res.category.id}`}
                      onClick={() => handleSelectCategory(res.category, res.parent || undefined)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 text-[#024AD8]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{res.displayPath}</span>
                          {res.category.templateKey && (
                            <span className="text-[10px] font-medium bg-blue-100/80 text-[#024AD8] px-1.5 py-0.5 rounded-[4px]">
                              {isZh ? '属性模板' : 'Template'}
                            </span>
                          )}
                        </div>
                        {res.matchedKeyword && (
                          <div className="text-[11px] text-slate-400">
                            {isZh ? '匹配标签: ' : 'Matched: '}
                            <span className="text-[#024AD8] font-medium">{res.matchedKeyword}</span>
                          </div>
                        )}
                      </div>

                      {isSelected && <Check size={16} className="text-[#024AD8] shrink-0" />}
                    </div>
                  )
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-600">{isZh ? '未找到相关分类' : 'No matching categories'}</p>
                  <p className="text-[11px] text-slate-400">
                    {isZh ? '可尝试搜索其他词汇或浏览下方两级类目' : 'Try other keywords or browse 2-level taxonomy'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* 2-Level Column Cascade (小红书/电商标准双列联动 - 宽幅沉浸排布) */
            <div className="grid grid-cols-12 h-[340px] divide-x divide-slate-100">
              {/* Left Column: Level 1 Categories (一级分类) */}
              <div className="col-span-5 sm:col-span-4 bg-slate-50/90 overflow-y-auto p-2 space-y-1">
                {categoryTree.map((l1) => {
                  const isCurrent = l1.id === selectedL1Id
                  const IconComp = (l1.icon && ICON_MAP[l1.icon]) || Layers

                  return (
                    <button
                      key={l1.id}
                      type="button"
                      onClick={() => setSelectedL1Id(l1.id)}
                      className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-[#024AD8] shadow-xs font-bold border-l-3 border-l-[#024AD8]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconComp size={15} className={isCurrent ? 'text-[#024AD8]' : 'text-slate-400'} />
                        <span className="truncate">{l1.name}</span>
                      </div>
                      <ChevronRight
                        size={13}
                        className={`transition-colors shrink-0 ${isCurrent ? 'text-[#024AD8]' : 'text-slate-300'}`}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Right Column: Level 2 Categories (二级分类) */}
              <div className="col-span-7 sm:col-span-8 bg-white overflow-y-auto p-3.5 space-y-2">
                <div className="pb-2 px-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {activeL1?.name} <span className="text-slate-400 font-normal">&gt;</span> {isZh ? '选择二级细分' : 'Select subcategory'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeL1?.children.length} {isZh ? '个子品类' : 'categories'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {activeL1?.children.map((child) => {
                    const isSelected = currentBreadcrumb?.secondary?.id === child.id || value === child.name
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelectCategory(child, activeL1)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF4FF] border-[#024AD8] text-[#024AD8] shadow-xs font-bold'
                            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 text-slate-800'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-semibold truncate">{child.name}</div>
                          {child.templateKey ? (
                            <span className="inline-block text-[9px] font-medium bg-blue-50 text-[#024AD8] px-1.5 py-0.5 rounded-[3px] border border-blue-200/60">
                              {isZh ? '专属规格' : 'Specs'}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-normal">
                              {isZh ? '通用规格' : 'General'}
                            </span>
                          )}
                        </div>

                        {isSelected && <Check size={15} className="text-[#024AD8] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {currentBreadcrumb ? (
                <>
                  {isZh ? '已选择：' : 'Selected: '}
                  <strong className="text-slate-900 font-bold">
                    {currentBreadcrumb.primary.name}
                    {currentBreadcrumb.secondary ? ` > ${currentBreadcrumb.secondary.name}` : ''}
                  </strong>
                </>
              ) : (
                isZh ? '请点击选择二级分类' : 'Please select subcategory'
              )}
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-[4px] cursor-pointer text-xs transition-colors shadow-2xs"
            >
              {isZh ? '完成' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
