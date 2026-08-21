'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  ShieldCheck,
  Building2,
  Package,
  FileText,
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  Lock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import type { ChatMessage, ChatCitation } from './types'

interface CustomerServiceCenterViewProps {
  isZh?: boolean
}

export function CustomerServiceCenterView({ isZh = true }: CustomerServiceCenterViewProps) {
  // Knowledge Sources Config State
  const [enabledSources, setEnabledSources] = useState({
    brand: true,
    product: true,
    policy: true,
  })

  // Selected preset test question
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCitationDetail, setSelectedCitationDetail] = useState<ChatCitation | null>(null)

  // Default chat message history matching user specification
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      content: '请问这个产品多久发货？运费大概是多少？',
      timestamp: '11:42',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      content:
        '您好！根据我们的官方服务政策：\n\n1. **发货时效**：所有标准现货订单将在 **24 至 48 小时** 内完成出库并交付国际承运商。\n2. **运费政策**：单笔订单满 **$50 美元** 即享全球免运费服务；未满 $50 美元的标准配送费用为 $4.99 美元（预计 5-8 个工作日送达）。\n\n如需加急顺丰/DHL 航空特快（2-3 个工作日），可在结账时勾选特快专递选项。',
      timestamp: '11:43',
      citations: [
        {
          id: 'cit-1',
          sourceId: 'src-policy-1',
          sourceName: '服务政策.pdf',
          excerpt:
            '《全球物流与配送时效政策.pdf》第2节：所有现货订单均在24-48小时内从中心仓发出，单笔订单满$50免运费。',
          confidence: 0.98,
        },
      ],
      modelUsed: 'Omnilink 官方客服大模型 (GEO-Agent v2)',
    },
    {
      id: 'msg-3',
      sender: 'user',
      content: 'OPT-001 这款声学降噪耳机的续航和防水等级怎么样？',
      timestamp: '11:44',
    },
    {
      id: 'msg-4',
      sender: 'assistant',
      content:
        '关于 **OPT-001 声学降噪旗舰耳机** 的核心规格参数如下：\n\n- **电池续航**：在开启主动降噪 (ANC) 模式下单次充电可连续播放 **32 小时**；关闭降噪可达 **40 小时**。搭配充电盒可实现总续航 **60 小时**，支持 USB-C 超级快充（充电 10 分钟可听歌 4 小时）。\n- **防水防尘等级**：整机通过 **IPX5 防水认证**，支持防汗防泼溅，适合户外运动与日常通勤。\n- **保修服务**：享有 **2 年官方有限质保** 及 30 天无理由退换。',
      timestamp: '11:45',
      citations: [
        {
          id: 'cit-2',
          sourceId: 'src-prod-1',
          sourceName: '产品知识: OPT-001规格说明.pdf',
          excerpt:
            '《OPT-001硬件规格白皮书》：标称32小时ANC续航，IPX5防水等级，通过CE/FCC声学认证。',
          confidence: 0.99,
        },
        {
          id: 'cit-3',
          sourceId: 'src-policy-2',
          sourceName: '服务政策.pdf',
          excerpt:
            '《售后与退换货质保政策》：音频类核心旗舰享有2年官方硬件有限质保。',
          confidence: 0.95,
        },
      ],
      modelUsed: 'Omnilink 官方客服大模型 (GEO-Agent v2)',
    },
  ])

  // Preset question buttons for instant testing
  const presetQuestions = [
    '这个产品多久发货？',
    '你们支持退换货吗？退货政策是怎样的？',
    'OPT-001 这款产品的防水等级和续航如何？',
    '你们的官方客服邮箱和联系方式是什么？',
  ]

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // Simulate AI response with citations based on enabled sources
    setTimeout(() => {
      let aiContent = ''
      const citations: ChatCitation[] = []

      if (query.includes('发货') || query.includes('物流') || query.includes('运费')) {
        aiContent =
          '根据我们的《服务政策》最新规范：\n\n订单将在付款确认后 **24-48小时** 内由中心仓发出，全球大部分地区预计 **5-8 个工作日** 妥投。订单金额满 **$50 美元** 享免费标准配送。'
        if (enabledSources.policy) {
          citations.push({
            id: `cit-${Date.now()}-1`,
            sourceId: 'policy',
            sourceName: '服务政策.pdf',
            excerpt:
              '《全球物流与配送时效政策》：现货24-48小时发货，满$50包邮。',
            confidence: 0.97,
          })
        }
      } else if (query.includes('退') || query.includes('换货') || query.includes('质保')) {
        aiContent =
          '根据我们的《服务政策》：\n\n我们支持 **30 天无理由退换货**，商品未拆封或无外观损坏即可申请全额退款。同时所有硬件产品均享有 **24 个月官方质保**。'
        if (enabledSources.policy) {
          citations.push({
            id: `cit-${Date.now()}-2`,
            sourceId: 'policy',
            sourceName: '服务政策.pdf',
            excerpt:
              '《售后与退换货细则》：支持30天退换，24个月质保。',
            confidence: 0.99,
          })
        }
      } else if (query.includes('OPT-001') || query.includes('续航') || query.includes('防水') || query.includes('规格')) {
        aiContent =
          '根据《产品知识》数据库：\n\n**OPT-001 声学降噪旗舰耳机** 具备 **IPX5 防水防汗** 设计，单次充电开启降噪可连续使用 **32 小时**，快充 10 分钟即可补充 4 小时电量。'
        if (enabledSources.product) {
          citations.push({
            id: `cit-${Date.now()}-3`,
            sourceId: 'product',
            sourceName: '产品知识: OPT-001规格说明.pdf',
            excerpt:
              '《OPT-001规格白皮书》：IPX5级防护，32小时ANC续航。',
            confidence: 0.99,
          })
        }
      } else {
        aiContent =
          '根据《品牌与店铺信息》与《服务政策》：\n\nOmnilink 官方秉持极简声学与全渠道服务理念。我们提供 7×24 小时在线支持，如有任何疑问请随时咨询我们的官方支持团队。'
        if (enabledSources.brand) {
          citations.push({
            id: `cit-${Date.now()}-4`,
            sourceId: 'brand',
            sourceName: '品牌与店铺信息',
            excerpt:
              '《品牌与店铺结构化档案》：全渠道多语言客服支持与品牌服务规范。',
            confidence: 0.92,
          })
        }
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: citations.length > 0 ? citations : undefined,
        modelUsed: 'Omnilink 官方客服大模型 (GEO-Agent v2)',
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[640px] items-stretch">
      {/* LEFT COLUMN: 知识来源配置 (Knowledge Sources Config Panel) */}
      <div
        id="cs-knowledge-sources-panel"
        className="w-full lg:w-[320px] rounded-[24px] bg-white/70 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4 shrink-0"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]/70">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#111827] text-white flex items-center justify-center">
                <Bot size={16} className="text-purple-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">知识来源配置</h3>
                <span className="text-[11px] text-[#6B7280]">AI 客服挂载语料库</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Source Selection Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
              知识来源
            </label>
            <p className="text-[11px] text-[#6B7280]">
              勾选允许对外客服机器人调用的知识库：
            </p>

            <div className="space-y-2 pt-1">
              {/* Option 1: 品牌与店铺信息 */}
              <label
                className={`p-3 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  enabledSources.brand
                    ? 'bg-purple-50/60 border-purple-300 shadow-2xs'
                    : 'bg-white/80 border-[#E5E7EB] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Building2 size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#111827] block truncate">
                      品牌与店铺信息
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      品牌定位、联系方式、社交矩阵
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledSources.brand}
                  onChange={(e) =>
                    setEnabledSources({ ...enabledSources, brand: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </label>

              {/* Option 2: 产品知识 */}
              <label
                className={`p-3 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  enabledSources.product
                    ? 'bg-purple-50/60 border-purple-300 shadow-2xs'
                    : 'bg-white/80 border-[#E5E7EB] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Package size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#111827] block truncate">
                      产品知识
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      SKU 规格说明、认证、说明书
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledSources.product}
                  onChange={(e) =>
                    setEnabledSources({ ...enabledSources, product: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </label>

              {/* Option 3: 服务与政策 */}
              <label
                className={`p-3 rounded-[14px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  enabledSources.policy
                    ? 'bg-purple-50/60 border-purple-300 shadow-2xs'
                    : 'bg-white/80 border-[#E5E7EB] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[8px] bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#111827] block truncate">
                      服务与政策
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      发货时效、运费规则、退换货细则
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enabledSources.policy}
                  onChange={(e) =>
                    setEnabledSources({ ...enabledSources, policy: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Security Guard Notice */}
          <div className="p-3 rounded-[14px] bg-[#111827] text-white space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
              <Lock size={12} />
              <span>内部私密知识隔离保护</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              「产品研发」、「竞品分析」等内部研报知识库已默认物理隔离，严禁对外客服模型调用。
            </p>
          </div>
        </div>

        {/* Quick Testing Presets */}
        <div className="space-y-2 pt-2 border-t border-[#E5E7EB]/60">
          <span className="text-[11px] font-bold text-[#111827] block">常用测试提问</span>
          <div className="space-y-1.5">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="w-full text-left p-2 rounded-[8px] bg-white/90 hover:bg-purple-50 text-[11px] text-[#111827] font-medium border border-[#E5E7EB] hover:border-purple-200 transition-colors flex items-center justify-between cursor-pointer truncate"
              >
                <span className="truncate">{q}</span>
                <ChevronRight size={12} className="text-gray-400 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI 客服聊天窗口 (Modern AI Chat UI matching Reference Image) */}
      <div
        id="cs-chat-window"
        className="flex-1 rounded-[24px] bg-white/70 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden"
      >
        {/* Chat Window Top Bar */}
        <div className="px-5 py-3.5 bg-white/80 border-b border-[#E5E7EB]/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#111827]">Omnilink 官方 AI 智能客服</h4>
                <span className="px-1.5 py-0.2 rounded-[4px] bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  在线 · 知识挂载中
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                响应延迟 ~0.3s · 基于实时已挂载知识库推理
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: 'msg-welcome',
                  sender: 'assistant',
                  content:
                    '您好！我是 Omnilink 官方 AI 客服。我已经接入了店铺资料、产品规格以及服务政策知识库，请问有什么可以帮您？',
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ])
            }}
            className="px-2.5 py-1.5 rounded-[8px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#111827] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw size={12} />
            <span>清空对话</span>
          </button>
        </div>

        {/* Message Stream (Spacious, Minimalist Bubbles) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#111827] text-white shadow-2xs'
                      : 'bg-purple-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Message Bubble Container */}
                <div className="space-y-1.5 min-w-0">
                  <div
                    className={`p-4 rounded-[20px] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#111827] text-white rounded-tr-[4px] shadow-sm'
                        : 'bg-white text-[#111827] rounded-tl-[4px] border border-[#E5E7EB] shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Citations Box (来源与引用展示) */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-purple-100/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900">
                          <FileText size={12} className="text-purple-600" />
                          <span>来源与引用：</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((cit) => (
                            <button
                              key={cit.id}
                              type="button"
                              onClick={() => setSelectedCitationDetail(cit)}
                              className="px-2.5 py-1 rounded-[6px] bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-semibold border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="点击查看引用切片全文"
                            >
                              <span>来源：{cit.sourceName}</span>
                              <ExternalLink size={10} className="text-purple-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Model */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-[#6B7280] ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.modelUsed && <span>· {msg.modelUsed}</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-[10px] bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="p-3.5 rounded-[20px] bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Input Area (Ref Image 2: Clean input bar with icons) */}
        <div className="p-4 bg-white/90 border-t border-[#E5E7EB]/70 space-y-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="relative flex items-center gap-2 bg-[#F9FAFB] p-1.5 rounded-[16px] border border-[#E5E7EB] focus-within:border-[#8B5CF6] focus-within:bg-white transition-all shadow-2xs"
          >
            <button
              type="button"
              className="p-2 rounded-[10px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="引用知识库文件"
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入客户咨询问题进行 AI 问答测试（例如：这个产品多久发货？）..."
              className="flex-1 bg-transparent text-xs text-[#111827] focus:outline-none px-2"
            />

            <button
              type="button"
              className="p-2 rounded-[10px] text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="语音输入"
            >
              <Mic size={16} />
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="h-9 px-4 rounded-[12px] bg-[#111827] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>发送</span>
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* POPUP / MODAL: Citation Slice Detail Viewer */}
      {selectedCitationDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedCitationDetail(null)}
          />

          <div
            id="citation-detail-modal"
            className="relative w-full max-w-lg bg-white rounded-[20px] p-5 shadow-2xl border border-[#E5E7EB] z-10 space-y-3 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-purple-600" />
                <h4 className="text-xs font-bold text-[#111827]">
                  引用溯源：{selectedCitationDetail.sourceName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitationDetail(null)}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>

            <div className="p-3.5 rounded-[12px] bg-purple-50/60 border border-purple-200 text-xs text-[#111827] leading-relaxed">
              <span className="font-bold text-purple-900 block mb-1">检索命中切片全文：</span>
              {selectedCitationDetail.excerpt}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>置信度：{(selectedCitationDetail.confidence * 100).toFixed(1)}%</span>
              <button
                type="button"
                onClick={() => setSelectedCitationDetail(null)}
                className="px-3 py-1.5 rounded-[8px] bg-[#111827] text-white text-xs font-bold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
