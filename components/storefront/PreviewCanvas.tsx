'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct, StorefrontStore, OrderConfirmationDTO } from '@/lib/storefront/types'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'
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

/** 默认预览商品列表（当店铺尚未录入商品时使用） */
export const DEFAULT_PREVIEW_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'prod-preview-1',
    name: 'KURA Akari Acoustic Ceramic Luminaire',
    slug: 'kura-akari-luminaire',
    description:
      'Hand-thrown textured stoneware housing a dimmable warm-spectrum OLED light engine and precision acoustic dampening chamber.',
    price: 480,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Limited Edition', 'Artisan Drop'],
    attributes: {
      Material: 'High-fire Stoneware & Brass',
      Dimensions: '280 × 160 × 340 mm',
      Finish: 'Matte Obsidian Glaze',
      Origin: 'Kyoto Atelier, Japan',
    },
    options: [
      {
        id: 'opt-finish',
        name: 'Finish',
        code: 'finish',
        values: ['Matte Obsidian', 'Glacier White', 'Raw Terracotta'],
      },
      {
        id: 'opt-size',
        name: 'Dimension',
        code: 'size',
        values: ['Standard 280mm', 'Grand 380mm'],
      },
    ],
    variants: [
      {
        id: 'var-1',
        price: 480,
        currency: 'USD',
        sku: 'KURA-AKR-OBS-STD',
        optionValues: {
          Finish: 'Matte Obsidian',
          Dimension: 'Standard 280mm',
        },
      },
      {
        id: 'var-2',
        price: 640,
        currency: 'USD',
        sku: 'KURA-AKR-OBS-GRD',
        optionValues: {
          Finish: 'Matte Obsidian',
          Dimension: 'Grand 380mm',
        },
      },
      {
        id: 'var-3',
        price: 495,
        currency: 'USD',
        sku: 'KURA-AKR-WHT-STD',
        optionValues: {
          Finish: 'Glacier White',
          Dimension: 'Standard 280mm',
        },
      },
    ],
    href: '#',
  },
  {
    id: 'prod-preview-2',
    name: 'Borosilicate Glacier Vessel No. 04',
    slug: 'glacier-vessel-04',
    description:
      'Double-walled hand-blown borosilicate vessel engineered with subtle internal refraction optics.',
    price: 195,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    badges: ['Bespoke Run'],
    attributes: {
      Material: 'German Schott Glass',
      Capacity: '750 ml',
      Weight: '420 g',
    },
    href: '#',
  },
  {
    id: 'prod-preview-3',
    name: 'Architectural Cast Iron Tea Kettle',
    slug: 'cast-iron-kettle',
    description:
      'Traditional Nanbu ironware reimagined through clean geometric silhouettes and ergonomic solid walnut handle.',
    price: 320,
    currency: 'USD',
    imageUrl:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    badges: ['Heritage'],
    attributes: {
      Material: 'Cast Iron & Walnut',
      Capacity: '1.2 L',
    },
    href: '#',
  },
]

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
  products?: StorefrontProduct[]
  activePage?: StorefrontEditorPage
  onPageChange?: (page: StorefrontEditorPage) => void
  selectedProductId?: string | null
  cartPreviewMode?: 'filled' | 'empty'
  deviceMode?: DeviceMode
  onDeviceModeChange?: (mode: DeviceMode) => void
  showControlBar?: boolean
  className?: string
}

export default function PreviewCanvas({
  schema,
  storeSlug,
  products = [],
  activePage = 'homepage',
  onPageChange,
  selectedProductId,
  cartPreviewMode = 'filled',
  deviceMode: externalDeviceMode,
  onDeviceModeChange,
  showControlBar = true,
  className = '',
}: PreviewCanvasProps) {
  const { isZh } = useLanguage()

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

  // 监听窗口大小变动
  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) {
        const fit = calculateFitZoom()
        setZoomPercent(fit)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isAutoFit, calculateFitZoom])

  const displayProducts = useMemo(() => {
    return products.length > 0 ? products : DEFAULT_PREVIEW_PRODUCTS
  }, [products])

  const activeProduct = useMemo(() => {
    if (selectedProductId) {
      const found = displayProducts.find((p) => p.id === selectedProductId)
      if (found) return found
    }
    return displayProducts[0] || DEFAULT_PREVIEW_PRODUCTS[0]
  }, [displayProducts, selectedProductId])

  const storeInfo: StorefrontStore = useMemo(() => {
    return {
      id: 'store-preview',
      name: schema.globalInfo?.brandName || 'Omnilink Store',
      slug: storeSlug || 'preview',
      description: 'Curated boutique collection',
      logoUrl: null,
      themeId: schema.theme.themeId,
      currency: 'USD',
      contact: schema.contact || schema.globalInfo?.contact,
      social: schema.social || schema.globalInfo?.social,
    }
  }, [schema, storeSlug])

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
        <div className="h-13 bg-white border-b border-gray-200 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 text-xs text-gray-700 shadow-xs">
          {/* 左侧：页面切换 Tabs (Page Switcher) */}
          <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/70 overflow-x-auto">
            {pagesList.map((p) => {
              const Icon = p.icon
              const isActive = activePage === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPageChange?.(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#FB7185] shadow-xs ring-1 ring-black/5 font-bold'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-[#FB7185]' : 'text-gray-500'} />
                  <span>{isZh ? p.labelZh : p.labelEn}</span>
                </button>
              )
            })}
          </div>

          {/* 中间/右侧：设备切换 + 缩放 */}
          <div className="flex items-center gap-3">
            {/* 设备切换 */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  deviceMode === 'desktop'
                    ? 'bg-white text-[#FB7185] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={isZh ? '桌面端 (1440x900)' : 'Desktop (1440x900)'}
              >
                <Monitor size={14} />
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  deviceMode === 'tablet'
                    ? 'bg-white text-[#FB7185] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={isZh ? '平板 (768x1024)' : 'Tablet (768x1024)'}
              >
                <Tablet size={14} />
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-white text-[#FB7185] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={isZh ? '手机 (390x844)' : 'Mobile (390x844)'}
              >
                <Smartphone size={14} />
              </button>
            </div>

            {/* Zoom 缩放控制 */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setZoomPercent((prev) => Math.max(25, prev - 5))
                    setIsAutoFit(false)
                  }}
                  className="p-0.5 text-gray-500 hover:text-gray-900 rounded cursor-pointer"
                  title={isZh ? '缩小' : 'Zoom Out'}
                >
                  <ZoomOut size={13} />
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
                  className="w-16 sm:w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#FB7185]"
                />

                <button
                  type="button"
                  onClick={() => {
                    setZoomPercent((prev) => Math.min(150, prev + 5))
                    setIsAutoFit(false)
                  }}
                  className="p-0.5 text-gray-500 hover:text-gray-900 rounded cursor-pointer"
                  title={isZh ? '放大' : 'Zoom In'}
                >
                  <ZoomIn size={13} />
                </button>

                <span className="font-mono text-[11px] font-extrabold text-[#FB7185] w-9 text-right select-none">
                  {zoomPercent}%
                </span>
              </div>

              <button
                type="button"
                onClick={handleFit}
                className={`p-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  isAutoFit
                    ? 'bg-[#FFF1F2] text-[#FB7185] border-[#FECDD3] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
                title={isZh ? '自适应当前屏幕' : 'Fit to screen'}
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 预览舞台 (Preview Stage) */}
      <div
        ref={stageRef}
        className="flex-1 overflow-auto p-6 flex justify-center items-start relative select-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148, 163, 184, 0.25) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
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
            className="bg-white shadow-2xl overflow-hidden border border-gray-300/80 transition-all duration-200"
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
                    style={storefrontThemeOverrides(schema.theme) as CSSProperties}
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
