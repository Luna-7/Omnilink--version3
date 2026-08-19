'use client'

import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from './CartContext'

export default function NavbarCartButton() {
  const { toggleCart, itemCount, isHydrated } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      aria-label={`Shopping cart with ${isHydrated ? itemCount : 0} items`}
      className="relative flex h-9 w-9 items-center justify-center rounded-[var(--th-radius-button)] text-[var(--th-color-text)] transition-colors [transition-duration:var(--th-motion-duration)] [transition-timing-function:var(--th-motion-easing)] hover:bg-[var(--th-color-border)]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--th-color-primary)]"
    >
      <ShoppingBag className="h-4 w-4" />
      {isHydrated && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--th-color-primary)] px-1 [font-family:var(--th-font-body)] text-[10px] font-bold text-white shadow-sm">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
