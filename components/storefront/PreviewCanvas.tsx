'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct, StorefrontStore, OrderConfirmationDTO } from '@/lib/storefront/types'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'
import { resolveStorefrontLanguage } from '@/lib/storefront/locale'
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
    id: 'prod-kinfolk-01',
    name: 'The Kinfolk Round 01',
    slug: 'kinfolk-round-01',
    price: 185,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: 'Handcrafted Japanese beta-titanium core with organic tortoiseshell acetate rims.',
    attributes: {
      Material: 'Japanese Titanium',
      Shape: 'Round Classic',
      Optics: 'Anti-Reflective UV400',
    },
    options: [
      {
        id: 'opt-color',
        name: 'Color',
        code: 'color',
        values: ['Classic Tortoise', 'Midnight Obsidian', 'Champagne Gold'],
      },
      {
        id: 'opt-size',
        name: 'Size',
        code: 'size',
        values: ['Standard 48mm', 'Large 52mm'],
      },
    ],
    variants: [
      {
        id: 'var-kf-1',
        price: 185,
        currency: 'USD',
        sku: 'KF-RND-TRT-48',
        optionValues: {
          Color: 'Classic Tortoise',
          Size: 'Standard 48mm',
        },
      },
      {
        id: 'var-kf-2',
        price: 195,
        currency: 'USD',
        sku: 'KF-RND-OBS-48',
        optionValues: {
          Color: 'Midnight Obsidian',
          Size: 'Standard 48mm',
        },
      },
      {
        id: 'var-kf-3',
        price: 210,
        currency: 'USD',
        sku: 'KF-RND-GLD-52',
        optionValues: {
          Color: 'Champagne Gold',
          Size: 'Large 52mm',
        },
      },
    ],
    badges: ['Best Seller', 'Artisan Edition'],
  },
  {
    id: 'prod-velvet-02',
    name: 'The Velvet Horizon 02',
    slug: 'velvet-horizon-02',
    price: 210,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: 'Deep midnight obsidian & burgundy sculpted bio-acetate frame with rose gold accents.',
    attributes: {
      Material: 'Mazzucchelli Bio-Acetate',
      Shape: 'Square Architectural',
      Optics: 'High-Index Clarity',
    },
    badges: ['Limited Batch'],
  },
  {
    id: 'prod-prism-03',
    name: 'The Prism Mood 03',
    slug: 'prism-mood-03',
    price: 195,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: 'Ultra-lightweight champagne gold wireframe with spectrum-tint optical lenses.',
    attributes: {
      Material: 'Beta-Titanium Alloy',
      Shape: 'Panto Minimal',
      Optics: 'Blue-Light Guard',
    },
    badges: ['New Arrival'],
  },
  {
    id: 'prod-paper-04',
    name: 'The Paper Geometric 04',
    slug: 'paper-geometric-04',
    price: 220,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: 'Dual-tone enamel rimmed geometric wireframe engineered for weightless ergonomics.',
    attributes: {
      Material: 'Cold-Formed Alloy',
      Shape: 'Hexagonal',
      Optics: 'Gradient Polarized',
    },
    badges: ["Editor's Pick"],
  },
]

export const DEFAULT_PREVIEW_PRODUCTS_ZH: StorefrontProduct[] = [
  {
    id: 'prod-kinfolk-01',
    name: 'The Kinfolk 经典圆框 01',
    slug: 'kinfolk-round-01',
    price: 899,
    currency: 'CNY',
    imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: '手工日本 β 钛金属镜芯结合有机玳瑁板材镜圈。',
    attributes: {
      材质: '日本钛金属',
      框型: '经典复古圆框',
      光学: '抗反射 UV400 防蓝光',
    },
    badges: ['畅销推荐', '匠心高定'],
  },
  {
    id: 'prod-velvet-02',
    name: 'The Velvet 深邃地平线 02',
    slug: 'velvet-horizon-02',
    price: 1290,
    currency: 'CNY',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: '深邃夜黑与勃艮第红雕琢生物板材镜框，配玫瑰金点缀。',
    attributes: {
      材质: 'Mazzucchelli 生物板材',
      框型: '建筑几何方框',
      光学: '高折射率高清镜片',
    },
    badges: ['限量版'],
  },
  {
    id: 'prod-prism-03',
    name: 'The Prism 极光风尚 03',
    slug: 'prism-mood-03',
    price: 980,
    currency: 'CNY',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: '超轻香槟金细金属框，配备渐变光谱光学防蓝光镜片。',
    attributes: {
      材质: 'β-钛合金',
      框型: '轻盈极简',
      光学: '防蓝光护眼',
    },
    badges: ['新品上市'],
  },
  {
    id: 'prod-paper-04',
    name: 'The Paper 几何切角 04',
    slug: 'paper-geometric-04',
    price: 1150,
    currency: 'CNY',
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800&auto=format&fit=crop',
    ],
    href: '#products',
    description: '双色珐琅包边几何金属细框，人体工学无感佩戴设计。',
    attributes: {
      材质: '冷锻合金',
      框型: '六边形',
      光学: '渐变偏光',
    },
    badges: ['编辑推荐'],
  },
]

export function getPreviewProductsForLanguage(lang: 'en' | 'zh'): StorefrontProduct[] {
  return lang === 'zh' ? DEFAULT_PREVIEW_PRODUCTS_ZH : DEFAULT_PREVIEW_PRODUCTS
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
  products?: StorefrontProduct[]
  activePage?: StorefrontEditorPage
  onPageChange?: (page: StorefrontEditorPage) => void
  selectedProductId?: string | null
  onProductChange?: (id: string) => void
  cartPreviewMode?: 'filled' | 'empty'
  deviceMode?: DeviceMode
  onDeviceModeChange?: (mode: DeviceMode) => void
  showControlBar?: boolean
  className?: string
  rightPanelOpen?: boolean
}

export default function PreviewCanvas({
  schema,
  storeSlug,
  products = [],
  activePage: externalActivePage,
  onPageChange,
  selectedProductId: externalSelectedProductId,
  onProductChange,
  cartPreviewMode = 'filled',
  deviceMode: externalDeviceMode,
  onDeviceModeChange,
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

  // 当右侧边栏开启或关闭状态变化时，强制触发一次自适应 (Fit) 缩放，确保内容完美适配
  useEffect(() => {
    handleFit()
  }, [rightPanelOpen, handleFit])

  const effectiveLanguage = resolveStorefrontLanguage(schema.theme?.language, isZh ? 'zh' : 'en')

  const displayProducts = useMemo(() => {
    if (products.length > 0) {
      return products.map((p) => ({
        ...p,
        currency: effectiveLanguage === 'zh' ? 'CNY' : 'USD',
      }))
    }
    return getPreviewProductsForLanguage(effectiveLanguage)
  }, [products, effectiveLanguage])

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
      currency: effectiveLanguage === 'zh' ? 'CNY' : 'USD',
      contact: schema.contact || schema.globalInfo?.contact,
      social: schema.social || schema.globalInfo?.social,
    }
  }, [schema, storeSlug, effectiveLanguage])

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

          {/* 右侧：设备切换与极简滑块缩放控制 (Device Toggle & Elegant Slider) */}
          <div className="flex items-center gap-3">
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
