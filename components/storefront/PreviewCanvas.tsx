'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct, StorefrontStore, OrderConfirmationDTO } from '@/lib/storefront/types'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'
import { resolveStorefrontLanguage } from '@/lib/storefront/locale'
import { PREVIEW_MARKETS, getMarketByCode, type PreviewMarket } from '@/lib/storefront/markets'
import { convertPrice } from '@/lib/store/currency'
import ThemeRoot from '@/components/theme/ThemeRoot'
import DynamicSectionRenderer from '@/components/storefront/DynamicSectionRenderer'
import Navbar from '@/components/theme/core/Navbar'
import Footer from '@/components/theme/core/Footer'
import ProductHero from '@/components/theme/core/ProductHero'
import ProductGrid from '@/components/theme/core/ProductGrid'
import CartPageView from '@/components/cart/CartPageView'
import CheckoutPageView from '@/components/checkout/CheckoutPageView'
import OrderConfirmationPageView from '@/components/checkout/OrderConfirmationPageView'
import { CartProvider } from '@/components/cart/CartContext'
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export type StorefrontEditorPage =
  | 'homepage'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'confirmation'

export interface DevicePreset {
  id: DeviceMode
  name: string
  nameEn: string
  viewportWidth: number
  viewportHeight: number
  aspectRatioLabel: string
  frameRadius: string
}

export const DEVICE_PRESETS: Record<DeviceMode, DevicePreset> = {
  desktop: {
    id: 'desktop',
    name: '桌面端',
    nameEn: 'Desktop',
    viewportWidth: 1440,
    viewportHeight: 900,
    aspectRatioLabel: '16:9',
    frameRadius: '12px',
  },
  tablet: {
    id: 'tablet',
    name: '平板',
    nameEn: 'Tablet',
    viewportWidth: 768,
    viewportHeight: 1024,
    aspectRatioLabel: '3:4',
    frameRadius: '24px',
  },
  mobile: {
    id: 'mobile',
    name: '手机',
    nameEn: 'Mobile',
    viewportWidth: 390,
    viewportHeight: 844,
    aspectRatioLabel: '9:19.5',
    frameRadius: '36px',
  },
}

import {
  STOREFRONT_DEMO_PRODUCTS_ZH,
  STOREFRONT_DEMO_PRODUCTS_EN,
  getStorefrontDemoProducts,
} from '@/lib/storefront/demo-products'

/** 默认预览商品列表（与商品管理核心品类实时对齐） */
export const DEFAULT_PREVIEW_PRODUCTS: StorefrontProduct[] = STOREFRONT_DEMO_PRODUCTS_EN
export const DEFAULT_PREVIEW_PRODUCTS_ZH: StorefrontProduct[] = STOREFRONT_DEMO_PRODUCTS_ZH

export function getPreviewProductsForLanguage(lang: 'en' | 'zh'): StorefrontProduct[] {
  return getStorefrontDemoProducts(lang)
}

/** 默认预览订单详情 */
const DEFAULT_PREVIEW_ORDER: OrderConfirmationDTO = {
  id: 'ord-preview-1',
  orderNumber: 'ORD-2026-8892',
  storeId: 'demo-store',
  storeSlug: 'demo',
  storeName: 'KURA OBJECTS',
  status: 'inquiry_pending',
  customer: {
    name: 'Eleanor Vance',
    email: 'eleanor.vance@studio-vance.design',
    phone: '+1 (415) 555-0198',
    whatsapp: '+1 (415) 555-0198',
    company: 'Studio Vance Architecture',
    country: 'United States',
    state: 'CA 94103',
    city: 'San Francisco',
    address: '450 Townsend St, Suite 300',
    notes: 'Please coordinate white-glove pallet delivery for our studio reception gallery.',
    contactPreference: 'whatsapp',
  },
  items: [
    {
      id: 'item-preview-1',
      productId: 'prod-preview-1',
      productName: 'KURA Akari Acoustic Ceramic Luminaire',
      sku: 'KURA-AKR-OBS-STD',
      quantity: 2,
      unitPrice: 480,
      subtotal: 960,
      currency: 'USD',
      selectedOptions: {
        Finish: 'Matte Obsidian',
        Dimension: 'Standard 280mm',
      },
    },
    {
      id: 'item-preview-2',
      productId: 'prod-preview-2',
      productName: 'Borosilicate Glacier Vessel No. 04',
      sku: 'KURA-VES-GLC-04',
      quantity: 1,
      unitPrice: 195,
      subtotal: 195,
      currency: 'USD',
    },
  ],
  subtotal: 1155,
  currency: 'USD',
  createdAt: new Date().toISOString(),
}

interface PreviewCanvasProps {
  schema: StorefrontSchema
  storeSlug?: string
  storeBaseCurrency?: 'CNY' | 'USD'
  products?: StorefrontProduct[]
  activePage?: StorefrontEditorPage
  onPageChange?: (page: StorefrontEditorPage) => void
  selectedProductId?: string | null
  onProductChange?: (id: string) => void
  cartPreviewMode?: 'filled' | 'empty'
  deviceMode?: DeviceMode
  onDeviceModeChange?: (mode: DeviceMode) => void
  previewMarket?: 'CN' | 'US'
  onMarketChange?: (market: 'CN' | 'US') => void
  previewLanguage?: 'zh' | 'en'
  onLanguageChange?: (lang: 'zh' | 'en') => void
  showControlBar?: boolean
  className?: string
  rightPanelOpen?: boolean
}

export default function PreviewCanvas({
  schema,
  storeSlug,
  storeBaseCurrency = 'CNY',
  products = [],
  activePage: externalActivePage,
  onPageChange,
  selectedProductId: externalSelectedProductId,
  onProductChange,
  cartPreviewMode = 'filled',
  deviceMode: externalDeviceMode,
  onDeviceModeChange,
  previewMarket: externalPreviewMarket,
  onMarketChange,
  previewLanguage: externalPreviewLanguage,
  onLanguageChange,
  showControlBar = true,
  className = '',
  rightPanelOpen = false,
}: PreviewCanvasProps) {
  const { isZh } = useLanguage()

  // 内部与外部 activePage 同步
  const [internalActivePage, setInternalActivePage] = useState<StorefrontEditorPage>('homepage')
  const activePage = externalActivePage ?? internalActivePage

  const handlePageChange = (page: StorefrontEditorPage) => {
    if (onPageChange) {
      onPageChange(page)
    } else {
      setInternalActivePage(page)
    }
  }

  // 内部与外部 selectedProductId 同步
  const [internalSelectedProductId, setInternalSelectedProductId] = useState<string | null>(null)
  const selectedProductId = externalSelectedProductId ?? internalSelectedProductId ?? (products[0]?.id || null)

  const handleProductChange = (id: string) => {
    if (onProductChange) {
      onProductChange(id)
    } else {
      setInternalSelectedProductId(id)
    }
  }

  // 内部与外部 DeviceMode 同步
  const [internalDeviceMode, setInternalDeviceMode] = useState<DeviceMode>('desktop')
  const deviceMode = externalDeviceMode ?? internalDeviceMode

  const setDeviceMode = (mode: DeviceMode) => {
    if (onDeviceModeChange) {
      onDeviceModeChange(mode)
    } else {
      setInternalDeviceMode(mode)
    }
  }

  // 独立市场 (Market) 控制：Demo 仅支持 CN / US
  const [internalMarket] = useState<'CN' | 'US'>('CN')
  const currentMarketCode = externalPreviewMarket ?? internalMarket
  const currentMarket = getMarketByCode(currentMarketCode)

  // 独立语言 (Language) 控制：zh / en
  const [internalLang, setInternalLang] = useState<'zh' | 'en'>(
    resolveStorefrontLanguage(schema.theme?.language, isZh ? 'zh' : 'en')
  )
  const effectiveLanguage = externalPreviewLanguage ?? internalLang

  const handleLanguageSelect = (lang: 'zh' | 'en') => {
    if (onLanguageChange) {
      onLanguageChange(lang)
    } else {
      setInternalLang(lang)
    }
  }

  const [zoomPercent, setZoomPercent] = useState<number>(100)
  const [contentHeight, setContentHeight] = useState<number>(900)
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true)

  const stageRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const currentPreset = DEVICE_PRESETS[deviceMode]

  // 计算适合屏幕的 Scale
  const calculateFitZoom = useCallback(() => {
    if (!stageRef.current) return 100

    const stageWidth = stageRef.current.clientWidth - 48 // 左右 24px padding
    const stageHeight = stageRef.current.clientHeight - 64 // 上下 32px padding

    if (stageWidth <= 0 || stageHeight <= 0) return 100

    const scaleX = stageWidth / currentPreset.viewportWidth
    const scaleY = stageHeight / currentPreset.viewportHeight

    const fitScale = Math.min(scaleX, scaleY)
    const rawPercent = Math.round((fitScale * 100) / 5) * 5
    return Math.min(150, Math.max(25, rawPercent))
  }, [currentPreset.viewportWidth, currentPreset.viewportHeight])

  const handleFit = useCallback(() => {
    const fit = calculateFitZoom()
    setZoomPercent(fit)
    setIsAutoFit(true)
  }, [calculateFitZoom])

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      handleFit()
    })
    return () => cancelAnimationFrame(timer)
  }, [deviceMode, handleFit])

  // 监听内部 DOM 元素高度变化
  useEffect(() => {
    if (!innerRef.current) return

    const updateHeight = () => {
      if (innerRef.current) {
        setContentHeight(Math.max(currentPreset.viewportHeight, innerRef.current.offsetHeight))
      }
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(innerRef.current)

    return () => observer.disconnect()
  }, [schema, activePage, currentPreset.viewportHeight])

  // 监听舞台 (stageRef) 的大小变化以进行自适应缩放（包括窗口大小变动和右侧栏滑动导致的大小变化）
  useEffect(() => {
    if (!stageRef.current) return

    const handleResize = () => {
      if (isAutoFit) {
        const fit = calculateFitZoom()
        setZoomPercent(fit)
      }
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(stageRef.current)

    return () => observer.disconnect()
  }, [isAutoFit, calculateFitZoom])

  // 目标市场货币 (Target Market Currency)
  const targetCurrency = currentMarket.currency

  const displayProducts = useMemo(() => {
    const rawList = products.length > 0 ? products : getPreviewProductsForLanguage(effectiveLanguage)
    return rawList.map((p) => {
      const sourceCurrency = p.currency || storeBaseCurrency || 'CNY'
      const targetPrice = convertPrice(p.price ?? 0, sourceCurrency, targetCurrency)
      const convertedVariants = p.variants?.map((v) => ({
        ...v,
        price: convertPrice(v.price ?? 0, v.currency || sourceCurrency, targetCurrency),
        currency: targetCurrency,
      }))
      return {
        ...p,
        price: targetPrice,
        currency: targetCurrency,
        variants: convertedVariants,
      }
    })
  }, [products, effectiveLanguage, storeBaseCurrency, targetCurrency])

  const activeProduct = useMemo(() => {
    if (selectedProductId) {
      const found = displayProducts.find((p) => p.id === selectedProductId)
      if (found) return found
    }
    return displayProducts[0] || getPreviewProductsForLanguage(effectiveLanguage)[0]
  }, [displayProducts, selectedProductId, effectiveLanguage])

  const storeInfo: StorefrontStore = useMemo(() => {
    return {
      id: 'store-preview',
      name: schema.globalInfo?.brandName || (effectiveLanguage === 'zh' ? 'Omnilink 品牌旗舰店' : 'Omnilink Store'),
      slug: storeSlug || 'preview',
      description: effectiveLanguage === 'zh' ? '高定质感选品展厅' : 'Curated boutique collection',
      logoUrl: null,
      themeId: schema.theme.themeId,
      currency: targetCurrency,
      contact: schema.contact || schema.globalInfo?.contact,
      social: schema.social || schema.globalInfo?.social,
    }
  }, [schema, storeSlug, effectiveLanguage, targetCurrency])

  const orderedSections = useMemo(() => {
    return [...schema.sections]
      .filter((s) => s.visible !== false)
      .sort((a, b) => a.order - b.order)
  }, [schema.sections])

  const scale = zoomPercent / 100
  const scaledWidth = currentPreset.viewportWidth * scale
  const scaledHeight = contentHeight * scale

  const pagesList: Array<{ id: StorefrontEditorPage; labelZh: string; labelEn: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'homepage', labelZh: '首页', labelEn: 'Home', icon: Home },
    { id: 'product', labelZh: '商品详情', labelEn: 'Product', icon: ShoppingBag },
    { id: 'cart', labelZh: '购物车', labelEn: 'Cart', icon: ShoppingCart },
    { id: 'checkout', labelZh: '结算咨询', labelEn: 'Checkout', icon: CreditCard },
    { id: 'confirmation', labelZh: '订单确认', labelEn: 'Confirmation', icon: CheckCircle2 },
  ]

  return (
    <div className={`flex flex-col h-full w-full bg-slate-100 overflow-hidden ${className}`}>
      {/* 预览控制栏 (Preview Toolbar) */}
      {showControlBar && (
        <div
          className="h-12 px-4 flex items-center justify-between gap-3 shrink-0 z-10 text-xs text-gray-700 select-none"
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* 左侧：页面切换 Tabs (Page Switcher with Apple Segmented style) */}
          <div className="flex items-center gap-0.5 bg-black/[0.04] p-0.5 rounded-lg border border-black/[0.01] overflow-x-auto">
            {pagesList.map((p) => {
              const Icon = p.icon
              const isActive = activePage === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePageChange(p.id)}
                  title={rightPanelOpen ? (isZh ? p.labelZh : p.labelEn) : undefined}
                  className={`flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                    rightPanelOpen 
                      ? 'p-1.5 rounded-md' 
                      : 'gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold'
                  } ${
                    isActive
                      ? 'bg-white text-black shadow-[0_1.5px_3px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)] font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-black' : 'text-gray-400'} />
                  {!rightPanelOpen && <span>{isZh ? p.labelZh : p.labelEn}</span>}
                </button>
              )
            })}
          </div>

          {/* 中间：Preview Product (仅商品详情页显示) */}
          {activePage === 'product' && (
            <div className="flex-1 flex justify-center max-w-sm px-4 hidden sm:flex">
              <select
                value={selectedProductId || products[0]?.id || ''}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full max-w-[200px] px-2 py-1 text-[11px] font-semibold bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 truncate cursor-pointer hover:bg-gray-50 transition-colors"
                title={isZh ? '选择预览商品' : 'Select Preview Product'}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 右侧：设备切换与极简滑块缩放控制 */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* 设备切换 */}
            <div className="flex items-center gap-0.5 bg-black/[0.04] p-0.5 rounded-lg border border-black/[0.01]">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-black shadow-[0_1.5px_3px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title={isZh ? '桌面端' : 'Desktop'}
              >
                <Monitor size={12} />
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  deviceMode === 'tablet'
                    ? 'bg-white text-black shadow-[0_1.5px_3px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title={isZh ? '平板' : 'Tablet'}
              >
                <Tablet size={12} />
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-black shadow-[0_1.5px_3px_rgba(0,0,0,0.08),0_0.5px_1px_rgba(0,0,0,0.04)]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title={isZh ? '手机' : 'Mobile'}
              >
                <Smartphone size={12} />
              </button>
            </div>

            {/* 极简滑块缩放控制 (Minimalist Elegant Slider) */}
            <div className="hidden sm:flex items-center gap-2 bg-black/[0.02] hover:bg-black/[0.04] px-2.5 py-1 rounded-lg border border-black/[0.03] transition-colors">
              <button
                type="button"
                onClick={() => {
                  setZoomPercent((prev) => Math.max(25, prev - 5))
                  setIsAutoFit(false)
                }}
                className="p-0.5 text-gray-400 hover:text-black rounded transition-colors cursor-pointer"
                title={isZh ? '缩小' : 'Zoom Out'}
              >
                <ZoomOut size={11} />
              </button>

              <input
                type="range"
                min={25}
                max={150}
                step={5}
                value={zoomPercent}
                onChange={(e) => {
                  setZoomPercent(Number(e.target.value))
                  setIsAutoFit(false)
                }}
                style={{ accentColor: '#000' }}
                className="w-16 sm:w-20 h-1 rounded-lg appearance-none cursor-pointer bg-black/10 hover:bg-black/20 transition-colors"
              />

              <button
                type="button"
                onClick={() => {
                  setZoomPercent((prev) => Math.min(150, prev + 5))
                  setIsAutoFit(false)
                }}
                className="p-0.5 text-gray-400 hover:text-black rounded transition-colors cursor-pointer"
                title={isZh ? '放大' : 'Zoom In'}
              >
                <ZoomIn size={11} />
              </button>

              <span className="font-mono text-[10px] font-bold text-gray-600 w-8 text-right select-none">
                {zoomPercent}%
              </span>

              <button
                type="button"
                onClick={handleFit}
                className={`p-0.5 rounded transition-all cursor-pointer ${
                  isAutoFit ? 'text-black font-bold' : 'text-gray-400 hover:text-black'
                }`}
                title={isZh ? '自适应' : 'Auto Fit'}
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 预览舞台 (Preview Stage) */}
      <div
        ref={stageRef}
        className="flex-1 overflow-auto p-8 flex justify-center items-start relative select-none group"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* 悬浮微型缩放浮条 (Hover Zoom Control overlay) */}
        <div
          className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5 px-2 py-1 rounded-full border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setZoomPercent((prev) => Math.max(25, prev - 5))
              setIsAutoFit(false)
            }}
            className="p-1 text-gray-500 hover:text-black rounded-full hover:bg-black/5 transition-all cursor-pointer"
            title={isZh ? '缩小' : 'Zoom Out'}
          >
            <ZoomOut size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomPercent((prev) => Math.min(150, prev + 5))
              setIsAutoFit(false)
            }}
            className="p-1 text-gray-500 hover:text-black rounded-full hover:bg-black/5 transition-all cursor-pointer"
            title={isZh ? '放大' : 'Zoom In'}
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={handleFit}
            className={`p-1 rounded-full transition-all cursor-pointer ${
              isAutoFit ? 'text-black bg-black/5 font-bold' : 'text-gray-500 hover:text-black hover:bg-black/5'
            }`}
            title={isZh ? '自适应' : 'Fit Screen'}
          >
            <Maximize2 size={12} />
          </button>
        </div>
        {/* 缩放控制外框 (Scaled Wrapper Container) */}
        <div
          className="transition-all duration-200 ease-out flex justify-center shrink-0 my-auto"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            position: 'relative',
          }}
        >
          {/* 设备模拟视口 (Device Viewport Frame) */}
          <div
            className="bg-white overflow-hidden transition-all duration-200"
            style={{
              width: `${currentPreset.viewportWidth}px`,
              minHeight: `${currentPreset.viewportHeight}px`,
              borderRadius: currentPreset.frameRadius,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              position: 'absolute',
              top: 0,
              left: '50%',
              marginLeft: `-${currentPreset.viewportWidth / 2}px`,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* 手机/平板 Top Bar 装饰 */}
            {deviceMode === 'mobile' && (
              <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0 z-30 relative">
                <div className="w-20 h-3.5 bg-black rounded-b-xl flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                  <div className="w-8 h-1 rounded-full bg-slate-800" />
                </div>
              </div>
            )}

            {deviceMode === 'tablet' && (
              <div className="h-4 bg-slate-800 flex items-center justify-center shrink-0 z-30 relative">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
            )}

            {/* Storefront 内容层 */}
            <div ref={innerRef} className="w-full bg-[var(--th-color-background)]">
              <CartProvider storeSlug={storeInfo.slug} currency={storeInfo.currency}>
                <ThemeRoot themeId={schema.theme.themeId}>
                  <div
                    style={storefrontThemeOverrides(schema.theme, effectiveLanguage) as CSSProperties}
                    className="min-h-[600px]"
                  >
                    {/* 1. 首页预览 */}
                    {activePage === 'homepage' && (
                      <div>
                        {orderedSections.map((section) => (
                          <DynamicSectionRenderer
                            key={section.id}
                            section={section}
                            storeSlug={storeSlug}
                            products={displayProducts}
                            globalInfo={schema.globalInfo}
                            contact={schema.contact}
                            social={schema.social}
                            language={effectiveLanguage}
                          />
                        ))}
                      </div>
                    )}

                    {/* 2. 商品详情页预览 */}
                    {activePage === 'product' && (
                      <div>
                        <Navbar store={storeInfo} />
                        <ProductHero product={activeProduct} store={storeInfo} />
                        {displayProducts.filter((p) => p.id !== activeProduct.id).length > 0 && (
                          <section className="bg-[var(--th-color-background)] px-4 pb-[calc(var(--th-spacing-section)/2)] pt-6">
                            <div className="mx-auto max-w-[var(--th-spacing-container)]">
                              <h2 className="[font-family:var(--th-font-heading)] text-xl font-bold tracking-tight text-[var(--th-color-text)] sm:text-2xl mb-6">
                                {isZh ? '推荐搭配与精选系列' : 'Curated Companions'}
                              </h2>
                              <ProductGrid
                                products={displayProducts.filter((p) => p.id !== activeProduct.id)}
                              />
                            </div>
                          </section>
                        )}
                        <Footer store={storeInfo} />
                      </div>
                    )}

                    {/* 3. 购物车预览 */}
                    {activePage === 'cart' && (
                      <div>
                        <Navbar store={storeInfo} />
                        <CartPageView store={storeInfo} />
                        <Footer store={storeInfo} />
                      </div>
                    )}

                    {/* 4. 结算与咨询预览 */}
                    {activePage === 'checkout' && (
                      <div>
                        <Navbar store={storeInfo} />
                        <CheckoutPageView store={storeInfo} />
                        <Footer store={storeInfo} />
                      </div>
                    )}

                    {/* 5. 订单确认回执预览 */}
                    {activePage === 'confirmation' && (
                      <div>
                        <Navbar store={storeInfo} />
                        <OrderConfirmationPageView
                          order={DEFAULT_PREVIEW_ORDER}
                          store={storeInfo}
                        />
                        <Footer store={storeInfo} />
                      </div>
                    )}
                  </div>
                </ThemeRoot>
              </CartProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
