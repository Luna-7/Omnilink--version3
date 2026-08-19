'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ImageOff,
  ShoppingBag,
  MessageCircle,
  Mail,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react'
import type {
  StorefrontProduct,
  StorefrontStore,
  StorefrontProductVariant,
} from '@/lib/storefront/types'
import { useCart } from '@/components/cart/CartContext'

/** 格式化价格 */
function formatPrice(price: number, currency: string): string {
  const amount = Number.isFinite(price)
    ? price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0.00'
  return `${currency} ${amount}`
}

export type ProductHeroAction = {
  label: string
  href: string
}

type ProductHeroProps = {
  product: StorefrontProduct
  store?: StorefrontStore
  action?: ProductHeroAction
}

export default function ProductHero({
  product,
  store,
  action,
}: ProductHeroProps) {
  const { addItem } = useCart()

  // Gallery State
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }
    if (product.imageUrl) {
      return [product.imageUrl]
    }
    return []
  }, [product.images, product.imageUrl])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const currentImage = images[activeImageIndex] ?? null

  // Option / Variant Selection State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (product.options && product.options.length > 0) {
      for (const opt of product.options) {
        if (opt.values && opt.values.length > 0) {
          const firstVal = opt.values[0]
          initial[opt.name] = typeof firstVal === 'string' ? firstVal : firstVal.name
        }
      }
    }
    return initial
  })

  // Quantity State
  const [quantity, setQuantity] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)

  // Find matching variant if exists
  const activeVariant: StorefrontProductVariant | null = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    return (
      product.variants.find((v) => {
        for (const [key, val] of Object.entries(selectedOptions)) {
          if (v.optionValues[key] !== val) return false
        }
        return true
      }) ?? null
    )
  }, [product.variants, selectedOptions])

  // Current Price & SKU
  const currentPrice =
    activeVariant?.price !== null && activeVariant?.price !== undefined
      ? activeVariant.price
      : product.price
  const currentCurrency = activeVariant?.currency || product.currency
  const currentSku = activeVariant?.sku || product.attributes['SKU'] || product.attributes['sku'] || null
  const isOutOfStock = activeVariant?.inventory === 0

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      variantId: activeVariant?.id || null,
      quantity,
      productName: product.name,
      image: currentImage || product.imageUrl,
      price: currentPrice,
      currency: currentCurrency,
      selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      sku: currentSku,
    })

    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  // Inquiry Links
  const whatsappUrl = useMemo(() => {
    const phone = store?.contact?.whatsapp || store?.contact?.phone
    if (!phone) return null
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(
      `Hi, I would like to inquire about "${product.name}" (${formatPrice(
        currentPrice,
        currentCurrency
      )}${currentSku ? ` · SKU: ${currentSku}` : ''}). Is it currently available?`
    )
    return `https://wa.me/${cleanPhone}?text=${msg}`
  }, [store?.contact?.whatsapp, store?.contact?.phone, product.name, currentPrice, currentCurrency, currentSku])

  const emailInquiryUrl = useMemo(() => {
    const email = store?.contact?.email
    if (!email) return null
    const subject = encodeURIComponent(`Product Inquiry: ${product.name}`)
    const body = encodeURIComponent(
      `Hello,\n\nI am interested in "${product.name}" (${formatPrice(
        currentPrice,
        currentCurrency
      )}${currentSku ? ` · SKU: ${currentSku}` : ''}).\n\nPlease let me know about availability and order process.\n\nThank you.`
    )
    return `mailto:${email}?subject=${subject}&body=${body}`
  }, [store?.contact?.email, product.name, currentPrice, currentCurrency, currentSku])

  const attributes = Object.entries(product.attributes)
  const badges = product.badges ?? []

  return (
    <section className="bg-[var(--th-color-background)] px-4 py-[calc(var(--th-spacing-section)/2)]">
      <div className="mx-auto grid max-w-[var(--th-spacing-container)] items-start gap-10 lg:grid-cols-2 lg:gap-16">
        {/* 左侧：画廊展示区 */}
        <div className="flex flex-col gap-4">
          {/* 主图容器 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[var(--th-radius-card)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] shadow-[var(--th-shadow-floating)] transition-all duration-300">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                unoptimized
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-opacity duration-300"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--th-color-muted)]">
                <ImageOff size={36} strokeWidth={1.5} aria-hidden />
                <span className="sr-only">No image available</span>
              </div>
            )}

            {/* 徽章 */}
            {badges.length > 0 && (
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-2 py-0.5 text-[11px] font-semibold text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 缩略图行（多图时渲染） */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {images.map((imgUrl, idx) => (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 overflow-hidden rounded-[var(--th-radius-input)] border-2 bg-[var(--th-color-surface)] transition-all ${
                    activeImageIndex === idx
                      ? 'border-[var(--th-color-primary)] ring-2 ring-[var(--th-color-primary)]/20 shadow-sm'
                      : 'border-[var(--th-color-border)] opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：商品信息与交易交互区 */}
        <div className="flex flex-col">
          {/* 面包屑 / 类别提示 */}
          {currentSku && (
            <span className="text-xs uppercase tracking-widest text-[var(--th-color-muted)] mb-1">
              SKU: {currentSku}
            </span>
          )}

          {/* 标题 */}
          <h1 className="[font-family:var(--th-font-heading)] text-3xl [font-weight:var(--th-font-heading-weight)] leading-tight tracking-tight text-[var(--th-color-text)] sm:text-4xl">
            {product.name}
          </h1>

          {/* 价格 */}
          <div className="mt-3 flex items-baseline gap-3">
            <p className="[font-family:var(--th-font-heading)] text-2xl font-bold text-[var(--th-color-primary)]">
              {formatPrice(currentPrice, currentCurrency)}
            </p>
            {isOutOfStock && (
              <span className="rounded-full bg-red-100 dark:bg-red-950/50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                Out of Stock
              </span>
            )}
          </div>

          {/* 描述 */}
          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--th-color-muted)]">
              {product.description}
            </p>
          )}

          {/* 规格 / 变体选择器 */}
          {product.options && product.options.length > 0 && (
            <div className="mt-6 flex flex-col gap-4 border-t border-[var(--th-color-border)] pt-5">
              {product.options.map((opt) => (
                <div key={opt.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[var(--th-color-text)]">
                      {opt.name}
                    </span>
                    <span className="text-[var(--th-color-muted)]">
                      {selectedOptions[opt.name] || 'Select'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((rawVal) => {
                      const valName = typeof rawVal === 'string' ? rawVal : rawVal.name
                      const isSelected = selectedOptions[opt.name] === valName
                      return (
                        <button
                          key={valName}
                          type="button"
                          onClick={() => handleOptionSelect(opt.name, valName)}
                          className={`rounded-[var(--th-radius-button)] px-4 py-2 text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[var(--th-color-primary)] text-white shadow-xs ring-2 ring-[var(--th-color-primary)]/30'
                              : 'border border-[var(--th-color-border)] bg-[var(--th-color-surface)] text-[var(--th-color-text)] hover:border-[var(--th-color-primary)]/50'
                          }`}
                        >
                          {valName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 数量与购买动作 */}
          <div className="mt-6 flex flex-col gap-4 border-t border-[var(--th-color-border)] pt-6">
            <div className="flex items-center gap-4">
              {/* 数量选择器 */}
              <div className="flex items-center rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] disabled:opacity-40 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isOutOfStock}
                  className="h-11 w-12 text-center text-sm font-semibold text-[var(--th-color-text)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Product quantity"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={isOutOfStock}
                  className="flex h-11 w-11 items-center justify-center text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* 加入购物车主按钮 */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2.5 h-11 rounded-[var(--th-radius-button)] px-6 text-sm font-semibold text-white shadow-sm transition-all [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] ${
                  addedAnimation
                    ? 'bg-emerald-600 scale-[0.99]'
                    : isOutOfStock
                    ? 'bg-neutral-400 cursor-not-allowed opacity-60'
                    : 'bg-[var(--th-color-primary)] hover:bg-[var(--th-color-accent)] active:scale-[0.99]'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 咨询快捷入口 (WhatsApp / Email) */}
            <div className="flex flex-wrap gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-[var(--th-radius-button)] border border-emerald-600/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp Inquiry</span>
                </a>
              )}

              {emailInquiryUrl && (
                <a
                  href={emailInquiryUrl}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[var(--th-radius-button)] border border-[var(--th-color-border)] bg-[var(--th-color-surface)] px-4 py-2.5 text-xs font-medium text-[var(--th-color-text)] hover:bg-[var(--th-color-border)]/40 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-[var(--th-color-muted)]" />
                  <span>Email Concierge</span>
                </a>
              )}
            </div>

            {/* 外部动作点回退 (if passed by template) */}
            {action && (
              <Link
                href={action.href}
                className="mt-2 text-center text-xs font-medium text-[var(--th-color-primary)] underline hover:text-[var(--th-color-accent)]"
              >
                {action.label}
              </Link>
            )}
          </div>

          {/* 信任徽标 / 服务承诺 */}
          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[var(--th-color-border)] pt-5 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-[var(--th-radius-input)] bg-[var(--th-color-surface)]/50">
              <ShieldCheck className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span className="text-[10px] font-medium text-[var(--th-color-text)]">
                Authenticity Guaranteed
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-[var(--th-radius-input)] bg-[var(--th-color-surface)]/50">
              <Truck className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span className="text-[10px] font-medium text-[var(--th-color-text)]">
                Insured Shipping
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-[var(--th-radius-input)] bg-[var(--th-color-surface)]/50">
              <RotateCcw className="h-4 w-4 text-[var(--th-color-primary)]" />
              <span className="text-[10px] font-medium text-[var(--th-color-text)]">
                Bespoke Support
              </span>
            </div>
          </div>

          {/* 规格属性明细表 */}
          {attributes.length > 0 && (
            <div className="mt-8 border-t border-[var(--th-color-border)] pt-5">
              <h2 className="[font-family:var(--th-font-heading)] text-sm font-semibold text-[var(--th-color-text)] mb-3">
                Specifications
              </h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {attributes.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-[var(--th-color-border)]/50 pb-1.5 text-xs"
                  >
                    <dt className="capitalize text-[var(--th-color-muted)]">{key}</dt>
                    <dd className="font-medium text-[var(--th-color-text)]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
