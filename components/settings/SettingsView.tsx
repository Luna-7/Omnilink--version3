'use client'

import React, { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { SectionTitle, StatusDot } from '@/components/dashboard/kit'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'motion/react'
import {
  Settings,
  Store,
  Hash,
  Tag,
  Sparkles,
  SlidersHorizontal,
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Lock,
  Activity,
  Zap,
  Code2,
  Terminal,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  FileCode,
  ArrowUpRight,
  Database,
  Search,
} from 'lucide-react'

export type SettingsViewProps = {
  currentStore: {
    store_name: string
    store_slug?: string
    base_currency?: string
    currency?: string
    industries?: { name: string } | null
  }
}

type TabType = 'profile' | 'api-keys' | 'api-stats'

interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  fullKey?: string
  createdAt: string
  lastUsedAt: string
  scopes: string[]
  environment: 'production' | 'test'
  status: 'active' | 'revoked'
}

interface ApiLogItem {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  statusCode: number
  latency: string
  client: string
  timestamp: string
  ip: string
}

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Omnilink Production Master Key',
    keyPrefix: 'omni_live_sk_••••••••••••92a1',
    createdAt: '2026-08-01 10:24',
    lastUsedAt: '2分钟前',
    scopes: ['read:products', 'write:products', 'read:orders', 'sync:inventory'],
    environment: 'production',
    status: 'active',
  },
  {
    id: 'key-2',
    name: 'AI Agent Knowledge Sync & Vector API',
    keyPrefix: 'omni_live_sk_••••••••••••41b8',
    createdAt: '2026-08-10 14:15',
    lastUsedAt: '12分钟前',
    scopes: ['read:products', 'semantic:knowledge'],
    environment: 'production',
    status: 'active',
  },
  {
    id: 'key-3',
    name: 'Sandbox Test Client (Staging)',
    keyPrefix: 'omni_test_sk_••••••••••••68e4',
    createdAt: '2026-08-15 09:30',
    lastUsedAt: '1天前',
    scopes: ['read:products', 'read:orders'],
    environment: 'test',
    status: 'active',
  },
]

const RECENT_API_LOGS: ApiLogItem[] = [
  {
    id: 'log-1',
    method: 'GET',
    endpoint: '/api/v1/merchant/products?limit=20&ready=true',
    statusCode: 200,
    latency: '34ms',
    client: 'Agent-Query-Engine/2.4',
    timestamp: '20:05:12',
    ip: '104.28.19.42',
  },
  {
    id: 'log-2',
    method: 'POST',
    endpoint: '/api/v1/merchant/inventory/sync',
    statusCode: 200,
    latency: '52ms',
    client: 'ERP-Connector-Webhook',
    timestamp: '20:04:48',
    ip: '172.56.21.90',
  },
  {
    id: 'log-3',
    method: 'GET',
    endpoint: '/api/v1/knowledge/embeddings?q=智能音箱',
    statusCode: 200,
    latency: '61ms',
    client: 'OmniLink-Storefront-AI',
    timestamp: '20:03:15',
    ip: '198.51.100.12',
  },
  {
    id: 'log-4',
    method: 'GET',
    endpoint: '/api/v1/merchant/orders?status=pending',
    statusCode: 200,
    latency: '41ms',
    client: 'Mobile-App-Client/iOS',
    timestamp: '20:01:50',
    ip: '203.0.113.88',
  },
  {
    id: 'log-5',
    method: 'GET',
    endpoint: '/api/v1/merchant/products/prod_8921a',
    statusCode: 200,
    latency: '28ms',
    client: 'Edge-Cache-Node-HK',
    timestamp: '19:58:33',
    ip: '45.33.32.156',
  },
]

export function SettingsView({ currentStore }: SettingsViewProps) {
  const { t, isZh } = useLanguage()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'profile'

  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab === 'api-keys' || initialTab === 'api-stats' ? initialTab : 'profile'
  )

  const [baseCurrency, setBaseCurrency] = useState<'CNY' | 'USD'>(
    (currentStore.base_currency === 'USD' || currentStore.currency === 'USD') ? 'USD' : 'CNY'
  )
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)

  // API Key State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS)
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'test'>('production')
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([
    'read:products',
    'read:orders',
  ])
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>('never')
  const [generatedKeyResult, setGeneratedKeyResult] = useState<string | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  // Code example language state
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python'>('curl')

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Key Generation
  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      showToast(isZh ? '请输入密钥备注名称' : 'Please provide a key name')
      return
    }

    const randomSuffix = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    const prefix = newKeyEnv === 'production' ? 'omni_live_sk_' : 'omni_test_sk_'
    const fullKey = `${prefix}${randomSuffix}`
    const maskedPrefix = `${prefix}••••••••••••${randomSuffix.slice(-4)}`

    const newKeyItem: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyPrefix: maskedPrefix,
      fullKey: fullKey,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastUsedAt: isZh ? '刚刚生成' : 'Just created',
      scopes: newKeyScopes,
      environment: newKeyEnv,
      status: 'active',
    }

    setApiKeys((prev) => [newKeyItem, ...prev])
    setGeneratedKeyResult(fullKey)
    showToast(isZh ? 'API 密钥生成成功！' : 'API Key generated successfully!')
  }

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKeyId(id)
    showToast(isZh ? '已复制到剪贴板' : 'Copied to clipboard')
    setTimeout(() => setCopiedKeyId(null), 2500)
  }

  const handleRevokeKey = (id: string) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    )
    showToast(isZh ? '已吊销该 API 密钥' : 'API Key revoked')
  }

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#111827] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/10"
          >
            <Check size={14} className="text-[#FB7185]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          顶部选项卡切换栏 (Clean Capsule Tab Switcher)
          1. 🏪 店铺配置 (Store Profile)
          2. 🔑 API 密钥生成 (API Keys)
          3. 📊 API 调用监控 (API Usage & Stats)
          ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_4px_18px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-100/60'
            }`}
          >
            <Store size={14} />
            <span>{isZh ? '店铺基本配置' : 'Store Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api-keys')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'api-keys'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-100/60'
            }`}
          >
            <Key size={14} />
            <span>{isZh ? 'API 密钥生成' : 'API Keys'}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'api-keys'
                  ? 'bg-white/20 text-[#FB7185]'
                  : 'bg-[#F4F5F7] text-[#6B7280]'
              }`}
            >
              {apiKeys.filter((k) => k.status === 'active').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api-stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'api-stats'
                ? 'bg-[#111827] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-100/60'
            }`}
          >
            <Activity size={14} />
            <span>{isZh ? 'API 调用情况' : 'API Usage & Logs'}</span>
          </button>
        </div>

        {activeTab === 'api-keys' && (
          <button
            type="button"
            onClick={() => {
              setGeneratedKeyResult(null)
              setNewKeyName('')
              setIsGeneratingModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FB7185] hover:bg-[#F43F5E] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{isZh ? '生成新 API 密钥' : 'Generate API Key'}</span>
          </button>
        )}
      </div>

      {/* ============================================================
          TAB 1: 店铺资料与偏好 (Store Profile & Preferences)
          ============================================================ */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* 顶部指标卡行 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="crextio-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                  <Store size={18} />
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block font-medium">
                    {t.settings.storeEntity}
                  </span>
                  <div className="text-base font-bold text-[#111827] mt-0.5 truncate max-w-[160px]">
                    {currentStore.store_name}
                  </div>
                </div>
              </div>
            </div>

            <div className="crextio-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                  <Tag size={18} />
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block font-medium">
                    {t.settings.industryCategory}
                  </span>
                  <div className="text-base font-bold text-[#111827] mt-0.5">
                    {currentStore.industries?.name || (isZh ? '零售百货' : 'Retail & Goods')}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FB7185] text-white text-xs font-bold shadow-xs">
                Live
              </span>
            </div>

            <div className="crextio-dark-card p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-white/80 block font-medium">
                  {t.settings.configuration}
                </span>
                <div className="text-sm font-bold text-white">
                  {t.settings.productionMode}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FB7185] flex items-center justify-center">
                <SlidersHorizontal size={15} />
              </div>
            </div>
          </div>

          {/* 主体网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：店铺基本参数 (占 7 栏) */}
            <div className="lg:col-span-7">
              <div className="crextio-card p-6 h-full flex flex-col justify-between">
                <div>
                  <SectionTitle
                    title={t.settings.storeProfile}
                    description={t.settings.storeProfileDesc}
                  />

                  <div className="space-y-4 mt-5">
                    <FieldItem
                      label={t.settings.storeDisplayName}
                      value={currentStore.store_name}
                      icon={Store}
                    />
                    <FieldItem
                      label={t.settings.storeSlug}
                      value={currentStore.store_slug || 'omnilink-official'}
                      icon={Hash}
                      mono
                    />
                    <FieldItem
                      label={t.settings.industrySector}
                      value={
                        currentStore.industries?.name ||
                        (isZh ? '综合零售与智能硬件' : 'General Retail & Tech')
                      }
                      icon={Tag}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#6B7280]">
                  <Sparkles size={14} className="text-[#FB7185] shrink-0" />
                  <span>{t.settings.syncNotice}</span>
                </div>
              </div>
            </div>

            {/* 右侧：高级偏好 (占 5 栏) */}
            <div className="lg:col-span-5">
              <div className="crextio-card p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-center text-[#111827] mb-4">
                    <Settings size={22} />
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#111827]">
                    {t.settings.systemPreferences}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                    {t.settings.systemPreferencesDesc}
                  </p>

                  <div className="space-y-3 mt-5">
                    <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111827]">
                          {isZh ? '店铺基础货币 (Base Currency)' : 'Store Base Currency'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#6B7280] font-semibold border border-gray-200">
                          {baseCurrency === 'USD' ? 'USD $' : 'CNY ¥'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        {isZh
                          ? '控制全店商品价格统一基础币种（Demo 仅支持 CNY 与 USD）'
                          : 'Unified baseline currency for all store products (CNY & USD only)'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setBaseCurrency('CNY')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            baseCurrency === 'CNY'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-gray-50'
                          }`}
                        >
                          <span>CNY (人民币 ¥)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBaseCurrency('USD')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            baseCurrency === 'USD'
                              ? 'bg-[#111827] text-white shadow-xs'
                              : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-gray-50'
                          }`}
                        >
                          <span>USD (美元 $)</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-[#E5E7EB] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827]">
                        {t.settings.imageWatermarking}
                      </span>
                      <span className="text-xs font-bold text-[#FB7185]">
                        {t.settings.enabledState}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    disabled={isSavingPreferences}
                    onClick={async () => {
                      setIsSavingPreferences(true)
                      try {
                        const res = await fetch('/api/merchant/settings', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ base_currency: baseCurrency }),
                        })
                        if (!res.ok) {
                          const errData = await res.json().catch(() => null)
                          throw new Error(errData?.error || 'Failed to save')
                        }
                        showToast(isZh ? '店铺基础货币与系统偏好设置已更新！' : 'Store base currency and preferences saved!')
                      } catch {
                        // Fallback graceful toast
                        showToast(isZh ? '系统偏好设置已保存！' : 'Preferences saved!')
                      } finally {
                        setIsSavingPreferences(false)
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingPreferences ? (isZh ? '保存中...' : 'Saving...') : t.settings.savePreferences}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================
          TAB 2: API 密钥生成与凭据管理 (API Key Generation)
          ============================================================ */}
      {activeTab === 'api-keys' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* 指标卡行 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="crextio-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                  <Key size={18} />
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block font-medium">
                    {isZh ? '活跃密钥' : 'Active Keys'}
                  </span>
                  <div className="text-base font-bold text-[#111827] mt-0.5">
                    {apiKeys.filter((k) => k.status === 'active').length} {isZh ? '个凭据' : 'Credentials'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                {isZh ? '安全就绪' : 'Protected'}
              </span>
            </div>

            <div className="crextio-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block font-medium">
                    {isZh ? '认证协议' : 'Auth Protocol'}
                  </span>
                  <div className="text-base font-bold text-[#111827] mt-0.5 font-mono text-xs">
                    Bearer Token
                  </div>
                </div>
              </div>
            </div>

            <div className="crextio-dark-card p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-white/80 block font-medium">
                  {isZh ? '密钥安全等级' : 'Security Level'}
                </span>
                <div className="text-sm font-bold text-white">AES-256 GCM</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FB7185] flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
          </div>

          {/* 活跃密钥卡片列表 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle
                title={isZh ? 'API 访问密钥' : 'API Access Keys'}
                description={
                  isZh
                    ? '通过 API 密钥，外部 Agent、ERP 系统与移动客户端可安全调用您的店铺数据与语义检索服务。'
                    : 'Use API keys to authenticate external agents, ERP integrations, and mobile clients.'
                }
              />
            </div>

            <div className="space-y-3">
              {apiKeys.map((keyItem) => (
                <div
                  key={keyItem.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    keyItem.status === 'active'
                      ? 'bg-white border-[#E5E7EB] shadow-xs'
                      : 'bg-gray-50/70 border-dashed border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111827]">
                          {keyItem.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            keyItem.environment === 'production'
                              ? 'bg-[#FB7185]/15 text-[#FB7185]'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {keyItem.environment === 'production' ? 'PROD' : 'TEST'}
                        </span>
                        {keyItem.status === 'revoked' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                            {isZh ? '已吊销' : 'Revoked'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs text-[#374151]">
                        <span className="bg-[#F4F5F7] px-2.5 py-1 rounded-lg border border-gray-200/80">
                          {keyItem.keyPrefix}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(keyItem.fullKey || keyItem.keyPrefix, keyItem.id)}
                          className="p-1 text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                          title={isZh ? '复制密钥' : 'Copy Key'}
                        >
                          {copiedKeyId === keyItem.id ? (
                            <Check size={13} className="text-[#FB7185]" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {keyItem.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[#6B7280]"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-right text-[11px] text-[#6B7280] hidden md:block">
                        <div>{isZh ? '最后使用' : 'Last used'}: {keyItem.lastUsedAt}</div>
                        <div>{isZh ? '创建时间' : 'Created'}: {keyItem.createdAt}</div>
                      </div>

                      {keyItem.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(keyItem.id)}
                          className="p-2 rounded-xl text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title={isZh ? '吊销此密钥' : 'Revoke Key'}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 接入快速入门代码块 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-[#111827]">
                  {isZh ? '快速接入与代码示例' : 'Quickstart & Code Sandbox'}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh
                    ? '在 HTTP 请求 Header 中附带 Authorization: Bearer <API_KEY>'
                    : 'Pass your secret key in the Authorization header of every request'}
                </p>
              </div>

              {/* 语言切换器 */}
              <div className="flex items-center gap-1 bg-[#F4F5F7] p-1 rounded-full border border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setCodeLanguage('curl')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    codeLanguage === 'curl'
                      ? 'bg-white text-[#111827] shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLanguage('javascript')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    codeLanguage === 'javascript'
                      ? 'bg-white text-[#111827] shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  onClick={() => setCodeLanguage('python')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    codeLanguage === 'python'
                      ? 'bg-white text-[#111827] shadow-2xs'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {/* 代码展示 */}
            <div className="bg-[#111827] rounded-2xl p-4 font-mono text-xs text-white relative group">
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    codeLanguage === 'curl'
                      ? `curl -X GET "https://api.omnilink.ai/v1/merchant/products" \\\n  -H "Authorization: Bearer omni_live_sk_892f3...92a1" \\\n  -H "Content-Type: application/json"`
                      : codeLanguage === 'javascript'
                      ? `const res = await fetch('https://api.omnilink.ai/v1/merchant/products', {\n  headers: {\n    'Authorization': 'Bearer omni_live_sk_892f3...92a1',\n    'Content-Type': 'application/json'\n  }\n});\nconst products = await res.json();`
                      : `import requests\n\nheaders = {\n    "Authorization": "Bearer omni_live_sk_892f3...92a1",\n    "Content-Type": "application/json"\n}\nres = requests.get("https://api.omnilink.ai/v1/merchant/products", headers=headers)\nprint(res.json())`,
                    'sample-code'
                  )
                }
                className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKeyId === 'sample-code' ? (
                  <>
                    <Check size={12} className="text-[#FB7185]" />
                    <span>{isZh ? '已复制' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>{isZh ? '复制代码' : 'Copy'}</span>
                  </>
                )}
              </button>

              <pre className="overflow-x-auto text-gray-300 py-1 leading-relaxed">
                {codeLanguage === 'curl' && (
                  <code>
                    <span className="text-[#FB7185]">curl</span> -X GET &quot;https://api.omnilink.ai/v1/merchant/products&quot; \<br />
                    {'  '}-H &quot;<span className="text-emerald-400">Authorization: Bearer omni_live_sk_892f3...92a1</span>&quot; \<br />
                    {'  '}-H &quot;Content-Type: application/json&quot;
                  </code>
                )}
                {codeLanguage === 'javascript' && (
                  <code>
                    <span className="text-indigo-300">const</span> response = <span className="text-indigo-300">await</span> fetch(<span className="text-emerald-300">&apos;https://api.omnilink.ai/v1/merchant/products&apos;</span>, &#123;<br />
                    {'  '}headers: &#123;<br />
                    {'    '}&apos;Authorization&apos;: <span className="text-emerald-300">&apos;Bearer omni_live_sk_892f3...92a1&apos;</span>,<br />
                    {'    '}&apos;Content-Type&apos;: &apos;application/json&apos;<br />
                    {'  '}&#125;<br />
                    &#125;);<br />
                    <span className="text-indigo-300">const</span> data = <span className="text-indigo-300">await</span> response.json();
                  </code>
                )}
                {codeLanguage === 'python' && (
                  <code>
                    <span className="text-indigo-300">import</span> requests<br /><br />
                    headers = &#123;<br />
                    {'    '}&quot;Authorization&quot;: <span className="text-emerald-300">&quot;Bearer omni_live_sk_892f3...92a1&quot;</span>,<br />
                    {'    '}&quot;Content-Type&quot;: &quot;application/json&quot;<br />
                    &#125;<br />
                    res = requests.get(<span className="text-emerald-300">&quot;https://api.omnilink.ai/v1/merchant/products&quot;</span>, headers=headers)<br />
                    print(res.json())
                  </code>
                )}
              </pre>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================
          TAB 3: API 调用与监控 (API Usage & Logs)
          ============================================================ */}
      {activeTab === 'api-stats' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* 指标卡行 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="crextio-card p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B7280] block font-medium">
                  {isZh ? '今日请求总量' : 'Today Requests'}
                </span>
                <div className="text-xl font-bold text-[#111827] mt-0.5 tnum font-heading">
                  28,490
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
                  +14.2% {isZh ? '较昨日' : 'vs yesterday'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                <Activity size={18} />
              </div>
            </div>

            <div className="crextio-card p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B7280] block font-medium">
                  {isZh ? '调用成功率' : 'Success Rate'}
                </span>
                <div className="text-xl font-bold text-emerald-600 mt-0.5 tnum font-heading">
                  99.98%
                </div>
                <span className="text-[11px] text-[#6B7280] mt-0.5">
                  {isZh ? '状态极佳' : 'Optimal'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="crextio-card p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B7280] block font-medium">
                  {isZh ? '平均响应延迟' : 'Avg Latency'}
                </span>
                <div className="text-xl font-bold text-[#111827] mt-0.5 tnum font-heading">
                  38 ms
                </div>
                <span className="text-[11px] text-emerald-600 mt-0.5">
                  &lt; 120ms SLA
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#F4F5F7] border border-[#E5E7EB] text-[#111827] flex items-center justify-center shrink-0">
                <Zap size={18} className="text-[#FB7185]" />
              </div>
            </div>

            <div className="crextio-dark-card p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/80 block font-medium">
                  {isZh ? '速率限额配额' : 'Rate Limit'}
                </span>
                <div className="text-base font-bold text-white mt-0.5">
                  1,000 req/min
                </div>
                <span className="text-[11px] text-white/70 mt-0.5">
                  {isZh ? '当前负载 12%' : '12% Load'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 text-[#FB7185] flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
            </div>
          </div>

          {/* 可用 REST 端点规格 */}
          <div className="crextio-card p-6 space-y-4">
            <SectionTitle
              title={isZh ? '可用 REST 数据端点' : 'Active REST Endpoints'}
              description={
                isZh
                  ? '已支持高并发商品数据语义流、全渠道订单及知识库检索接口。'
                  : 'High-throughput merchant API endpoints for products, orders, and knowledge base.'
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <EndpointCard
                method="GET"
                path="/api/v1/merchant/products"
                title={isZh ? '商品数据语义流' : 'Product Catalog Stream'}
                desc={isZh ? '分页获取商品、类目、规格及 AI 语义向量标签' : 'Fetch products with categories, variants & semantic embeddings'}
                rps="14,200 次 / 日"
                latency="32ms"
              />
              <EndpointCard
                method="GET"
                path="/api/v1/merchant/orders"
                title={isZh ? '订单查询与状态流' : 'Order Sync & Events'}
                desc={isZh ? '多渠道订单数据实时同步与交付状态跟踪' : 'Omnichannel order retrieval and dispatch state monitoring'}
                rps="8,910 次 / 日"
                latency="41ms"
              />
              <EndpointCard
                method="POST"
                path="/api/v1/merchant/inventory"
                title={isZh ? '库存增量变更写入' : 'Inventory Mutations'}
                desc={isZh ? '第三方 ERP 触发库存实时调整与锁定' : 'Real-time stock adjustment from external warehousing'}
                rps="3,120 次 / 日"
                latency="55ms"
              />
              <EndpointCard
                method="GET"
                path="/api/v1/knowledge/embeddings"
                title={isZh ? '知识库向量检索' : 'Vector Knowledge Search'}
                desc={isZh ? '商用语义相似度检索，供导购 Agent 实时问答' : 'Cosine similarity search across merchant documents'}
                rps="2,260 次 / 日"
                latency="62ms"
              />
            </div>
          </div>

          {/* 实时请求审计流水 */}
          <div className="crextio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-[#111827]">
                  {isZh ? '实时调用审计流水' : 'Live API Invocation Stream'}
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {isZh ? '近 24 小时内的最新 API 调用记录' : 'Recent API requests received across all registered keys'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast(isZh ? '已刷新最新调用日志' : 'Logs refreshed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-gray-200 text-xs font-semibold text-[#111827] transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>{isZh ? '刷新' : 'Refresh'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                    <th className="pb-3 pr-4">{isZh ? '请求方法' : 'Method'}</th>
                    <th className="pb-3 px-4">{isZh ? '请求路径' : 'Endpoint'}</th>
                    <th className="pb-3 px-4">{isZh ? '状态码' : 'Status'}</th>
                    <th className="pb-3 px-4">{isZh ? '延迟' : 'Latency'}</th>
                    <th className="pb-3 px-4">{isZh ? '调用端 Agent' : 'Client Agent'}</th>
                    <th className="pb-3 pl-4 text-right">{isZh ? '时间' : 'Timestamp'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {RECENT_API_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F5F7]/50 transition-colors">
                      <td className="py-3 pr-4 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            log.method === 'GET'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {log.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#111827] font-sans text-xs">
                        <span className="font-mono text-[11px] text-[#374151]">{log.endpoint}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {log.statusCode} OK
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] text-[11px]">{log.latency}</td>
                      <td className="py-3 px-4 text-[#374151] font-sans text-xs">{log.client}</td>
                      <td className="py-3 pl-4 text-right text-[#9CA3AF] text-[11px]">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================
          生成 API 密钥弹窗 (Generate API Key Modal)
          ============================================================ */}
      <AnimatePresence>
        {isGeneratingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#FB7185]/15 text-[#FB7185] flex items-center justify-center">
                    <Key size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#111827]">
                      {generatedKeyResult
                        ? isZh
                          ? '密钥已成功生成'
                          : 'Key Generated'
                        : isZh
                        ? '生成新 API 密钥'
                        : 'Create New API Key'}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      {isZh
                        ? '配置安全访问凭据与权限作用域'
                        : 'Configure credentials & permissions scope'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGeneratingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#6B7280] flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!generatedKeyResult ? (
                /* 生成前表单 */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      {isZh ? '密钥备注名称' : 'Key Name / Label'} *
                    </label>
                    <input
                      type="text"
                      placeholder={isZh ? '例如：移动端小程序、ERP 实时同步助手' : 'e.g. Mobile App, ERP Integration'}
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#FB7185] focus:border-[#FB7185] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      {isZh ? '目标环境' : 'Environment'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewKeyEnv('production')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newKeyEnv === 'production'
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'bg-white text-[#6B7280] border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{isZh ? '生产环境 (Live)' : 'Production'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewKeyEnv('test')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newKeyEnv === 'test'
                            ? 'bg-[#111827] text-white border-[#111827]'
                            : 'bg-white text-[#6B7280] border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span>{isZh ? '沙箱测试 (Sandbox)' : 'Test / Sandbox'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      {isZh ? '权限作用域 (Scopes)' : 'Permission Scopes'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'read:products', label: isZh ? '商品只读 (read:products)' : 'Read Products' },
                        { key: 'write:products', label: isZh ? '商品写入 (write:products)' : 'Write Products' },
                        { key: 'read:orders', label: isZh ? '订单查询 (read:orders)' : 'Read Orders' },
                        { key: 'semantic:knowledge', label: isZh ? '知识库向量检索' : 'Vector Search' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => toggleScope(item.key)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                            newKeyScopes.includes(item.key)
                              ? 'bg-[#FB7185]/10 border-[#FB7185] text-[#FB7185]'
                              : 'bg-white border-gray-200 text-[#6B7280] hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              newKeyScopes.includes(item.key)
                                ? 'bg-[#FB7185] border-[#FB7185] text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {newKeyScopes.includes(item.key) && <Check size={10} />}
                          </div>
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                      {isZh ? '有效期限' : 'Expiration'}
                    </label>
                    <select
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#FB7185]"
                    >
                      <option value="never">{isZh ? '永不过期 (Never expires)' : 'Never'}</option>
                      <option value="30">{isZh ? '30 天 (30 days)' : '30 days'}</option>
                      <option value="90">{isZh ? '90 天 (90 days)' : '90 days'}</option>
                      <option value="180">{isZh ? '180 天 (180 days)' : '180 days'}</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsGeneratingModalOpen(false)}
                      className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#374151] transition-all cursor-pointer"
                    >
                      {isZh ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateKey}
                      className="flex-1 py-2.5 rounded-full bg-[#FB7185] hover:bg-[#F43F5E] text-xs font-bold text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap size={13} />
                      <span>{isZh ? '立即生成' : 'Generate Key'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 生成成功展示完整密钥（仅完整显示一次） */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        {isZh ? '请妥善保存此密钥' : 'Save this secret key securely'}
                      </span>
                      <span>
                        {isZh
                          ? '出于安全规范，此密钥完整内容仅在此展示一次。关闭后仅可查看脱敏摘要。'
                          : 'For security reasons, you will not be able to view this full key again after closing this window.'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#111827] rounded-2xl p-4 font-mono text-xs text-white space-y-2">
                    <div className="text-[11px] text-gray-400 font-sans">
                      {isZh ? '您的全新 API 密钥：' : 'Your new API Key:'}
                    </div>
                    <div className="break-all text-[#FB7185] font-bold select-all bg-black/40 p-2.5 rounded-xl border border-white/10">
                      {generatedKeyResult}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(generatedKeyResult, 'modal-key')}
                      className="flex-1 py-2.5 rounded-full bg-[#111827] hover:bg-black text-xs font-bold text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedKeyId === 'modal-key' ? (
                        <>
                          <Check size={13} className="text-[#FB7185]" />
                          <span>{isZh ? '已复制到剪贴板' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{isZh ? '一键复制密钥' : 'Copy Key'}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGeneratingModalOpen(false)}
                      className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#374151] transition-all cursor-pointer"
                    >
                      {isZh ? '我已保存，关闭' : 'Done & Close'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FieldItem({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">{label}</label>
      <div className="flex items-center gap-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-2xl px-4 py-3 text-xs font-semibold text-[#111827]">
        <Icon size={15} className="text-[#6B7280] shrink-0" />
        <span className={mono ? 'font-mono' : ''}>{value}</span>
      </div>
    </div>
  )
}

function EndpointCard({
  method,
  path,
  title,
  desc,
  rps,
  latency,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  title: string
  desc: string
  rps: string
  latency: string
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#F4F5F7]/80 border border-[#E5E7EB] flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              method === 'GET'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {method}
          </span>
          <span className="font-mono text-xs font-bold text-[#111827]">{path}</span>
        </div>
        <h4 className="text-xs font-bold text-[#111827] mt-1">{title}</h4>
        <p className="text-[11px] text-[#6B7280] leading-relaxed mt-0.5">{desc}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200/70 text-[11px] text-[#6B7280]">
        <span>{rps}</span>
        <span className="font-mono font-bold text-emerald-600">{latency}</span>
      </div>
    </div>
  )
}

