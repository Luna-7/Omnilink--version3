'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from './CartContext'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    currency,
    storeSlug,
    isHydrated,
  } = useCart()

  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[var(--th-color-border)] bg-[var(--th-color-surface)] shadow-[var(--th-shadow-card)] transition-transform duration-300"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--th-color-border)] px-6">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[var(--th-color-primary)]" />
            <h2
              id="cart-drawer-title"
              className="[font-family:var(--th-font-heading)] text-base [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)]"
            >
              Your Shopping Bag
            </h2>
            {isHydrated && items.length > 0 && (
              <span className="rounded-full bg-[var(--th-color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--th-color-primary)]">
                {items.reduce((sum, it) => sum + it.quantity, 0)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--th-radius-button)] text-[var(--th-color-muted)] hover:bg-[var(--th-color-border)]/50 hover:text-[var(--th-color-text)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!isHydrated || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--th-color-border)]/30 text-[var(--th-color-muted)] mb-4">
              <ShoppingBag className="h-8 w-8 opacity-40" />
            </div>
            <p className="[font-family:var(--th-font-heading)] text-base [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)]">
              Your bag is empty
            </p>
            <p className="mt-1 max-w-xs text-xs text-[var(--th-color-muted)]">
              Explore our collection and add your desired items to begin.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-6 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--th-color-accent)]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[var(--th-color-border)]">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--th-color-muted)] text-[10px]">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="[font-family:var(--th-font-heading)] text-sm [font-weight:var(--th-font-heading-weight)] text-[var(--th-color-text)] line-clamp-1">
                          {item.productName}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.productName}`}
                          className="text-[var(--th-color-muted)] hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Selected Options */}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.selectedOptions).map(([key, val]) => (
                            <span
                              key={key}
                              className="rounded-[var(--th-radius-input)] bg-[var(--th-color-border)]/40 px-1.5 py-0.5 text-[10px] text-[var(--th-color-muted)]"
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="[font-family:var(--th-font-heading)] text-xs font-semibold text-[var(--th-color-primary)]">
                        {currency} {item.price.toFixed(2)}
                      </span>

                      <div className="flex items-center rounded-[var(--th-radius-input)] border border-[var(--th-color-border)] bg-[var(--th-color-background)]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-[var(--th-color-text)]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-[var(--th-color-muted)] hover:text-[var(--th-color-text)] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Summary */}
            <div className="border-t border-[var(--th-color-border)] bg-[var(--th-color-surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-[var(--th-color-muted)]">Subtotal</span>
                <span className="[font-family:var(--th-font-heading)] text-base font-bold text-[var(--th-color-text)]">
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <p className="mb-4 text-[10px] text-[var(--th-color-muted)] text-center">
                Taxes and shipping calculated separately upon merchant confirmation.
              </p>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/store/${storeSlug}/checkout`}
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 rounded-[var(--th-radius-button)] bg-[var(--th-color-primary)] py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--th-color-accent)]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/store/${storeSlug}/cart`}
                  onClick={closeCart}
                  className="flex items-center justify-center rounded-[var(--th-radius-button)] border border-[var(--th-color-border)] py-2.5 text-xs font-medium text-[var(--th-color-text)] transition-colors hover:bg-[var(--th-color-border)]/40"
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
