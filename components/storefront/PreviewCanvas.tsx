'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import type { StorefrontProduct } from '@/lib/storefront/types'
import { storefrontThemeOverrides } from '@/lib/storefront/theme-overrides'
import ThemeRoot from '@/components/theme/ThemeRoot'
import DynamicSectionRenderer from '@/components/storefront/DynamicSectionRenderer'
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

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

interface PreviewCanvasProps {
  schema: StorefrontSchema
  storeSlug?: string
  products?: StorefrontProduct[]
  deviceMode?: DeviceMode
  onDeviceModeChange?: (mode: DeviceMode) => void
  showControlBar?: boolean
  className?: string
}

export default function PreviewCanvas({
  schema,
  storeSlug,
  products = [],
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

    // 以适配 Viewport 整体形态为准，至少包含 Viewport 框架
    const fitScale = Math.min(scaleX, scaleY)
    const rawPercent = Math.round((fitScale * 100) / 5) * 5
    // 钳制在 25% 到 150% 之间
    return Math.min(150, Math.max(25, rawPercent))
  }, [currentPreset.viewportWidth, currentPreset.viewportHeight])

  // 当设备模式或 Stage 尺寸改变时，若处于 AutoFit 状态，自动重新计算 Fit Scale
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
  }, [schema, currentPreset.viewportHeight])

  // 监听视口大小变动 (Window resize)
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

  const orderedSections = useMemo(() => {
    return [...schema.sections]
      .filter((s) => s.visible !== false)
      .sort((a, b) => a.order - b.order)
  }, [schema.sections])

  const scale = zoomPercent / 100
  const scaledWidth = currentPreset.viewportWidth * scale
  const scaledHeight = contentHeight * scale

  return (
    <div className={`flex flex-col h-full w-full bg-slate-100 overflow-hidden ${className}`}>
      {/* 预览控制栏 (Preview Toolbar) */}
      {showControlBar && (
        <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 z-10 text-xs text-gray-700 shadow-xs">
          {/* 左侧：设备切换 */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg border border-gray-200/60">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-white text-purple-700 shadow-xs'
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
                  ? 'bg-white text-purple-700 shadow-xs'
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
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={isZh ? '手机 (390x844)' : 'Mobile (390x844)'}
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* 右侧：Zoom 缩放控制 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-200/60">
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
                className="w-20 sm:w-28 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
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

              <span className="font-mono text-[11px] font-extrabold text-purple-700 w-10 text-right select-none">
                {zoomPercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleFit}
              className={`p-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                isAutoFit
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title={isZh ? '自适应当前屏幕' : 'Fit to screen'}
            >
              <Maximize2 size={13} />
            </button>
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
              <ThemeRoot themeId={schema.theme.themeId}>
                <div style={storefrontThemeOverrides(schema.theme) as CSSProperties}>
                  {orderedSections.map((section) => (
                    <DynamicSectionRenderer
                      key={section.id}
                      section={section}
                      storeSlug={storeSlug}
                      products={products}
                      globalInfo={schema.globalInfo}
                      contact={schema.contact}
                      social={schema.social}
                    />
                  ))}
                </div>
              </ThemeRoot>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
