import { PageHeader, FloatCard, GlassCard, SectionTitle, StatusDot } from '@/components/dashboard/kit'
import { Bot, Cable, Braces } from 'lucide-react'

export default function AgentApiPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Agent API"
        description="让 AI Agent 连接你的商品数据——这是 Omnilink 与外部智能体之间的桥梁。"
      />

      <FloatCard className="mb-4 circuit-purple">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[#8b5cf6] text-white">
              <Bot size={19} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Agent 连接</h2>
              <div className="mt-1"><StatusDot tone="idle" label="未开放连接" /></div>
            </div>
          </div>
          <button
            disabled
            className="btn-primary-omni px-4 h-9 text-sm opacity-50 cursor-not-allowed"
            title="连接功能即将开放"
          >
            创建连接（即将开放）
          </button>
        </div>
      </FloatCard>

      <GlassCard className="mb-4">
        <SectionTitle
          title="数据端点"
          description="当前系统内部使用的商品数据接口，对外开放能力建设中"
        />
        <div className="flex items-center gap-3 bg-gray-900 rounded-md px-4 py-3 font-mono text-xs">
          <span className="px-1.5 py-0.5 rounded text-white font-sans font-semibold text-[10px] bg-[#8b5cf6]">
            GET
          </span>
          <span className="text-gray-200">/api/merchant/products</span>
          <span className="ml-auto text-gray-500 font-sans">内部</span>
        </div>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          面向 AI Agent 的只读数据端点、鉴权与限流策略正在设计中，开放后会在这里展示可调用的 API 列表与接入说明。
        </p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-2">
            <Cable size={15} className="text-[#8b5cf6]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-gray-900">它能做什么</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            AI Agent 可以通过标准化接口查询你的商品、价格与库存语义数据，用于智能导购、自动问答与跨平台分发。
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-2">
            <Braces size={15} className="text-[#8b5cf6]" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-gray-900">接入方式</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            正式开放后将提供 API 密钥鉴权与结构化 JSON 响应。接入文档会随连接功能一同上线。
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
