'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/dashboard/kit'
import {
  Database, Sparkles, Image as ImageIcon, Search, BarChart3, Megaphone, Truck,
  ScanFace, type LucideIcon,
} from 'lucide-react'

type Plugin = {
  name: string
  desc: string
  category: string
  icon: LucideIcon
}

const CATEGORIES = ['全部', '数据导入', 'AI', '图片', 'SEO', '分析', '营销', '物流'] as const

/* 预览态插件：仅展示生态愿景，不构成真实功能承诺 */
const PLUGINS: Plugin[] = [
  { name: '表格智能导入', desc: '上传 Excel / CSV，AI 自动识别字段并结构化。', category: '数据导入', icon: Database },
  { name: 'AI 描述优化', desc: '一键把商品描述改写为 AI 友好的语义文本。', category: 'AI', icon: Sparkles },
  { name: '虚拟试戴', desc: '让顾客在线预览商品佩戴效果。', category: '图片', icon: ScanFace },
  { name: '图片水印', desc: '为商品图片批量添加品牌水印，保护图片资产。', category: '图片', icon: ImageIcon },
  { name: 'SEO 检查', desc: '扫描商品标题与描述，给出搜索优化建议。', category: 'SEO', icon: Search },
  { name: '数据看板', desc: '商品与访问数据的可视化概览。', category: '分析', icon: BarChart3 },
  { name: '营销文案', desc: '基于商品语义数据生成多平台营销文案。', category: '营销', icon: Megaphone },
  { name: '物流跟踪', desc: '订单发货后的物流状态同步与查询。', category: '物流', icon: Truck },
]

export default function PluginsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('全部')
  /* 本地预览态「启用」开关：仅演示交互，不产生任何后端调用 */
  const [enabled, setEnabled] = useState<Set<string>>(new Set())

  const list = category === '全部' ? PLUGINS : PLUGINS.filter((p) => p.category === category)

  const toggle = (name: string) =>
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <div>
      <PageHeader
        title="插件中心"
        description="为店铺安装能力扩展。当前展示的为生态预览，安装能力将逐步开放。"
      />

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              'px-3.5 h-8 rounded-md text-xs font-medium transition-colors duration-200 border',
              category === c
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 插件市场网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => {
          const Icon = p.icon
          const on = enabled.has(p.name)
          return (
            <div
              key={p.name}
              className={cn(
                'glass-panel rounded-lg p-4 flex flex-col gap-3 hover-lift',
                on && 'border-[#10b981]/40'
              )}
              style={on ? { boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)' } : undefined}
            >
              <div className="flex items-start justify-between">
                <span className="w-9 h-9 rounded-md flex items-center justify-center bg-gray-900 text-white">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                  预览
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{p.desc}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">{p.category}</span>
                <button
                  onClick={() => toggle(p.name)}
                  aria-pressed={on}
                  title="预览交互，不产生真实安装"
                  className={cn(
                    'text-xs font-medium px-3 h-7 rounded-md transition-colors duration-200 border',
                    on
                      ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/[0.06]'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#8b5cf6]/30 hover:text-[#8b5cf6]'
                  )}
                >
                  {on ? '已启用' : '启用'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
        「启用」为界面预览交互，不会安装真实插件；安装能力开放后将在此管理。
      </p>
    </div>
  )
}
