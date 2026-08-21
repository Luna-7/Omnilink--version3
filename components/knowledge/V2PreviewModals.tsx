'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  Send,
  Wand2,
  FileQuestion,
  Truck,
  Layers,
  Search,
} from 'lucide-react'

export type V2PreviewModalType =
  | 'generate-faq'
  | 'generate-shipping'
  | 'transform-knowledge'
  | 'review-publish'
  | 'gap-detection'
  | null

interface V2PreviewModalsProps {
  activeModal: V2PreviewModalType
  onClose: () => void
  isZh: boolean
}

export function V2PreviewModals({ activeModal, onClose, isZh }: V2PreviewModalsProps) {
  if (!activeModal) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#E5E7EB] z-10 max-h-[90vh] overflow-y-auto custom-scroll"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[11px] font-bold tracking-wide uppercase">
                V2 Feature Preview
              </span>
              <span className="text-xs text-[#6B7280]">
                {isZh ? 'Phase 2 规划能力 · 交互预览' : 'Roadmap Feature · Interaction Preview'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F4F5F7] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Content depending on type */}
          <div className="py-5">
            {activeModal === 'gap-detection' && <GapDetectionPreview isZh={isZh} />}
            {activeModal === 'generate-faq' && <GenerateFAQPreview isZh={isZh} />}
            {activeModal === 'generate-shipping' && <GenerateShippingPreview isZh={isZh} />}
            {activeModal === 'transform-knowledge' && <TransformKnowledgePreview isZh={isZh} />}
            {activeModal === 'review-publish' && <ReviewPublishPreview isZh={isZh} />}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <div className="text-[11px] text-[#9CA3AF]">
              {isZh
                ? '提示：此功能处于 Phase 2 路线图中，当前仅提供前端 UI 视觉与交互规范预览。'
                : 'Note: This feature is in Phase 2 roadmap. Currently showing UI contract preview.'}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer"
            >
              {isZh ? '了解并关闭' : 'Close Preview'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function GapDetectionPreview({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
          <Search size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {isZh ? 'AI 知识库缺口自动检测 (Gap Detection)' : 'AI Knowledge Gap Detection'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? '通过回放过去 30 天买家咨询与历史问答，自动扫描未命中或存在歧义的政策盲区。'
              : 'Analyzes past customer queries to uncover unanswered questions and policy discrepancies.'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600" />
              <span>{isZh ? '检测到高频咨询缺口：欧盟 VAT 税费承担' : 'High Frequency Gap: EU VAT Handling'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[10px] font-bold">
              38 次未明确应答
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {isZh
              ? '最近 7 天内有 38 位欧洲买家询问英国脱欧后的清关税费是否包含在售价中。当前“物流政策”仅提及 DDP 模式，建议补充英国单独清关条款。'
              : '38 European buyers inquired about post-Brexit UK import tariffs. Recommended to add explicit UK customs clause.'}
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-xs"
            >
              {isZh ? '一键生成建议条款 [Preview]' : 'Draft Suggestion [Preview]'}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#111827] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-600" />
              <span>{isZh ? '退换货时效与条文一致性校验' : 'Return Policy Consistency Check'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
              100% 一致
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? 'Storefront 页脚政策、PDF 质保说明书与 FAQ 条目中的“30 天退货”条款完全同步，未发现冲突。'
              : 'All references across Storefront, PDF warranties, and FAQs consistently state the 30-day window.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function GenerateFAQPreview({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0">
          <FileQuestion size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {isZh ? 'AI 自动生成智能 FAQ 问答库' : 'AI Generate FAQ Knowledge'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? '从上传的产品手册、规格说明书或已有文档中，提炼最符合真实买家提问习惯的标准问答对。'
              : 'Synthesizes high-quality customer Q&A pairs directly from raw PDF manuals and specs.'}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-3">
        <div className="text-xs font-bold text-[#111827] flex items-center justify-between">
          <span>{isZh ? '提炼生成示例 (Preview Extraction)' : 'Extraction Preview'}</span>
          <span className="text-[10px] text-[#8B5CF6] font-semibold">4 对建议问答已就绪</span>
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs space-y-1">
            <span className="font-bold text-[#111827] block">
              Q: {isZh ? '如何开启主动降噪与通透环境音模式？' : 'How do I toggle ANC and Transparency modes?'}
            </span>
            <span className="text-[#6B7280] block">
              A: {isZh ? '轻触右耳罩外侧触控区域 2 秒，即可在“深度降噪”、“通透透传”与“标准模式”间循环切换。' : 'Long press the right earcup for 2 seconds to cycle through ANC, Transparency, and Off.'}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] text-xs space-y-1">
            <span className="font-bold text-[#111827] block">
              Q: {isZh ? '耳机在快充 10 分钟后能使用多久？' : 'How long does a 10-minute quick charge last?'}
            </span>
            <span className="text-[#6B7280] block">
              A: {isZh ? '支持 Type-C 疾速闪充，充电 10 分钟即可获得约 5 小时的连续音乐播放续航。' : '10 minutes of fast charging yields approximately 5 hours of playback.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GenerateShippingPreview({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
          <Truck size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {isZh ? 'AI 履约与物流政策自动生成器' : 'AI Generate Shipping Policy'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? '根据店铺所配置的仓储地点与主营目标市场，自动输出标准合规的跨境物流履约指引。'
              : 'Automatically generates localized shipping and fulfillment policies based on warehouse locations.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB]">
          <span className="text-[11px] text-[#6B7280] block">{isZh ? '主要目标市场' : 'Primary Target Markets'}</span>
          <span className="font-bold text-[#111827] mt-1 block">北美 (US/CA) + 欧盟 (EU)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#F4F5F7] border border-[#E5E7EB]">
          <span className="text-[11px] text-[#6B7280] block">{isZh ? '发货仓库配置' : 'Warehouse Location'}</span>
          <span className="font-bold text-[#111827] mt-1 block">深圳保税仓 + 美西海外仓</span>
        </div>
      </div>
    </div>
  )
}

function TransformKnowledgePreview({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0">
          <Wand2 size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {isZh ? 'AI 知识结构化萃取与清洗' : 'AI Transform Knowledge'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? '将非结构化的长篇 PDF、扫描件与杂乱网页，自动蒸馏为易于 LLM 秒级索引的 JSON-LD 与结构化字段。'
              : 'Converts unstructured PDFs and web pages into structured JSON-LD schemas.'}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 p-3 bg-white rounded-xl border border-[#E5E7EB] text-center">
          <span className="text-[10px] text-[#6B7280] block">{isZh ? '原始非结构化源' : 'Raw Document'}</span>
          <span className="font-bold text-[#111827]">PDF / DOCX 扫描件</span>
        </div>
        <ArrowRight size={16} className="text-[#8B5CF6] shrink-0" />
        <div className="flex-1 p-3 bg-white rounded-xl border border-[#8B5CF6]/40 text-center shadow-xs">
          <span className="text-[10px] text-[#8B5CF6] block">{isZh ? '结构化语义输出' : 'Structured Schema'}</span>
          <span className="font-bold text-[#111827]">Schema.org + MCP Node</span>
        </div>
      </div>
    </div>
  )
}

function ReviewPublishPreview({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
          <GitBranch size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {isZh ? '知识库审核与分发流水线 (Publish Pipeline)' : 'Knowledge Review & Publish Pipeline'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {isZh
              ? '支持草稿版本隔离、团队成员交叉审核与一键向 Storefront、Agent Gateway 和客服机器人原子化发布。'
              : 'Enables version isolation, multi-peer review workflows, and atomic publication.'}
          </p>
        </div>
      </div>

      {/* Workflow Step Indicator */}
      <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
          <span className="w-5 h-5 rounded-full bg-[#111827] text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
            1
          </span>
          <span className="font-bold text-[#111827] block">{isZh ? '草稿编辑' : 'Draft'}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
          <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
            2
          </span>
          <span className="font-bold text-[#111827] block">{isZh ? '合规预检' : 'Check'}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB]">
          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
            3
          </span>
          <span className="font-bold text-[#111827] block">{isZh ? '人工复核' : 'Review'}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-1">
            4
          </span>
          <span className="font-bold text-emerald-800 block">{isZh ? '生产发布' : 'Live'}</span>
        </div>
      </div>
    </div>
  )
}
