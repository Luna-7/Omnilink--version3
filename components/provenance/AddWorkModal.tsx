'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  X,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { ProvenanceWork, WorkType } from './types'
import { AVAILABLE_CATALOG_PRODUCTS } from './mockData'

interface AddWorkModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWork: (work: ProvenanceWork) => void
}

const WORK_TYPES: WorkType[] = [
  '产品设计',
  '包装设计',
  '摄影',
  '插画',
  '品牌素材',
  '3D 模型',
  '其他',
]

const SAMPLE_PRESETS = [
  {
    name: 'Celestial Glass Lamp',
    type: '产品设计' as WorkType,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
    desc: '高透光学玻璃手工曲面折射照明设计稿',
  },
  {
    name: 'Velvet Horizon Perfume Bottle',
    type: '包装设计' as WorkType,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    desc: '哑光磁吸香氛瓶体与外层压制包装设计',
  },
  {
    name: 'Raw Ceramic Vessels Set',
    type: '产品设计' as WorkType,
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
    desc: '原矿高温柴烧粗陶器物形制视觉档案',
  },
]

export function AddWorkModal({ isOpen, onClose, onAddWork }: AddWorkModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Form State
  const [workName, setWorkName] = useState('Rainforest Diffuser')
  const [workType, setWorkType] = useState<WorkType>('产品设计')
  const [ownerName] = useState('Luna Studio')
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80'
  )
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-rf-001')
  const [dragOver, setDragOver] = useState(false)

  if (!isOpen) return null

  const selectedProduct = AVAILABLE_CATALOG_PRODUCTS.find((p) => p.id === selectedProductId)

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setWorkName(preset.name)
    setWorkType(preset.type)
    setSelectedImage(preset.image)
  }

  const handleComplete = () => {
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase()
    const newCode = `ORG-${randomHex}-${Math.random().toString(16).substring(2, 6).toUpperCase()}`

    const newWork: ProvenanceWork = {
      id: `work-${Date.now()}`,
      name: workName || '新设计作品',
      subtitle: `${workType}原创设计作品`,
      coverImage: selectedImage,
      gallery: [selectedImage],
      type: workType,
      owner: ownerName,
      createdAt: '2026 年 8 月 27 日',
      code: newCode,
      status: 'verified',
      description: `由 ${ownerName} 创作并已完成数字存证与平台保护的${workType}。`,
      fingerprint: {
        algorithm: 'SHA-256',
        hash: `${randomHex.toLowerCase()}a8...${Math.random().toString(16).substring(2, 6)}`,
        fullHash: `${randomHex.toLowerCase()}a81b99c0d2491a82f34bbac19283e10034a71900192e881c`,
        status: '已验证',
        onChainRecorded: '已存在',
      },
      timeline: [
        {
          id: 't-new-1',
          title: '创建作品',
          actorOrDesc: ownerName,
          date: '2026 年 8 月 27 日',
          status: 'completed',
        },
        {
          id: 't-new-2',
          title: '提交审核',
          actorOrDesc: '来源审核',
          date: '2026 年 8 月 27 日',
          status: 'completed',
        },
        {
          id: 't-new-3',
          title: '来源验证',
          actorOrDesc: '原创作品',
          date: '2026 年 8 月 27 日',
          status: 'completed',
        },
        {
          id: 't-new-4',
          title: '数字存证',
          actorOrDesc: '作品指纹已生成',
          date: '2026 年 8 月 27 日',
          status: 'completed',
        },
        {
          id: 't-new-5',
          title: '平台保护',
          actorOrDesc: 'Omnilink 网络保护 · 已开启',
          date: '2026 年 8 月 27 日',
          status: 'completed',
        },
      ],
      associatedProducts: selectedProduct ? [selectedProduct] : [],
      authorizedMerchants: [],
      platformProtection: {
        status: 'protected',
        protectedProductCount: selectedProduct ? 1 : 0,
        matchRecordCount: 1,
        unauthorizedUsageCount: 0,
        recentDetections: [],
      },
    }

    onAddWork(newWork)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[8px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & 4-Step Indicator */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs">
            {[
              { num: '01', title: '上传作品' },
              { num: '02', title: '填写信息' },
              { num: '03', title: '来源验证' },
              { num: '04', title: '开启保护' },
            ].map((step, idx) => {
              const stepIndex = idx + 1
              const isActive = currentStep === stepIndex
              const isPassed = currentStep > stepIndex
              return (
                <div
                  key={step.num}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-[3px] transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : isPassed
                        ? 'bg-blue-50 text-[#024AD8] dark:bg-blue-950/40 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`font-medium ${
                      isActive
                        ? 'text-slate-900 dark:text-white font-semibold'
                        : isPassed
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  {idx < 3 && <span className="text-slate-300 dark:text-slate-700 mx-1">/</span>}
                </div>
              )
            })}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body: Render Current Step */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: 上传作品 */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  上传原创作品
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  上传你的原始设计稿件，用于建立作品的唯一数字指纹。
                </p>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                }}
                className={`relative rounded-[6px] border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  dragOver
                    ? 'border-[#024AD8] bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {selectedImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-40 h-28 rounded-[4px] overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-sm">
                      <Image
                        src={selectedImage}
                        alt="Selected Artwork"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        已载入原创稿件
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (28.4 MB · High Res)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      拖入新文件或点击下方预设直接替换
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-[4px] bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center text-[#024AD8] mb-3">
                      <UploadCloud size={22} />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      拖入作品 或 <span className="text-[#024AD8] underline">选择文件</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      支持 PSD / AI / SVG / PDF / PNG / JPG / WEBP
                    </p>
                  </>
                )}
              </div>

              {/* Fast Preset Selector */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  快速载入演示作品稿件：
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2 rounded-[4px] border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                        selectedImage === preset.image
                          ? 'border-[#024AD8] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#024AD8]'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-full h-14 rounded-[2px] overflow-hidden relative">
                        <Image
                          src={preset.image}
                          alt={preset.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="font-semibold text-[11px] text-slate-900 dark:text-white truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {preset.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                原始文件仅用于作品验证与数字存证。
              </div>
            </div>
          )}

          {/* STEP 2: 填写信息 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  介绍这个作品
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  填写原创作品核心属性，并从店铺已有商品库中关联首个商业化商品。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 作品名称 */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    作品名称
                  </label>
                  <input
                    type="text"
                    value={workName}
                    onChange={(e) => setWorkName(e.target.value)}
                    placeholder="例如：Rainforest Diffuser"
                    className="w-full h-9 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8]/20 transition-all"
                  />
                </div>

                {/* 作品类型 */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    作品类型
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as WorkType)}
                    className="w-full h-9 px-3 rounded-[4px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#024AD8] focus:ring-1 focus:ring-[#024AD8]/20 transition-all cursor-pointer"
                  >
                    {WORK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 创作者 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  创作者 / 版权所有者
                </label>
                <input
                  type="text"
                  value={ownerName}
                  disabled
                  className="w-full h-9 px-3 rounded-[4px] bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* 关联商品 (必须从已有商品库中选择) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    关联商品
                  </label>
                  <span className="text-[10px] text-slate-400">
                    从已有店铺商品库中选择，不在此新建商品
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_CATALOG_PRODUCTS.map((prod) => {
                    const isSelected = selectedProductId === prod.id
                    return (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProductId(prod.id)}
                        className={`p-2.5 rounded-[4px] border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#024AD8] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#024AD8]'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[3px] overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">
                              {prod.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku} · {prod.category}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-[#024AD8]">
                            已选定
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 来源验证 */}
          {currentStep === 3 && (
            <div className="space-y-6 py-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  验证作品来源
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  系统正在为原创设计提取特征矩阵并建立全网唯一存证标识。
                </p>
              </div>

              {/* Restrained Verification Checklist */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      验证文件完整性
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    已完成
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      验证作品信息
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    已完成
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-amber-500 shrink-0 animate-pulse" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      来源审核
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    审核中
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      生成数字指纹
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    SHA-256: 8f3a92...91cd (已完成)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[4px] bg-slate-100/70 dark:bg-slate-800/50 text-[11px] text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>审核期间，作品不会公开展示。</span>
              </div>
            </div>
          )}

          {/* STEP 4: 开启保护 */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  保护已准备完成
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  原创作品与商业商品的可信关系已建立完毕。
                </p>
              </div>

              {/* Three Relationship Matrix Card */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">作品来源</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>已验证</span>
                  </div>
                </div>

                <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] text-slate-400">关联商品</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedProduct?.name || 'Rainforest Crystal Diffuser'}
                  </div>
                </div>

                <div className="p-3 rounded-[4px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">平台保护</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#024AD8] dark:text-blue-400">
                    <ShieldCheck size={13} />
                    <span>准备开启</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-[6px] bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                审核通过后，该作品将作为受保护资产在 Omnilink 商业网络中受到识别。
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((p) => p - 1)}
                className="h-8 px-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>上一步</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-[4px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              取消
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((p) => p + 1)}
                className="h-8 px-4 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>下一步</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="h-8 px-5 rounded-[4px] bg-[#024AD8] hover:bg-[#003198] active:bg-[#00226B] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ShieldCheck size={14} />
                <span>提交审核</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
