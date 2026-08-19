'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import type { CartItem } from '@/lib/storefront/types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  currency: string
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  storeSlug: string
  isHydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
  storeSlug,
  currency = 'USD',
}: {
  children: React.ReactNode
  storeSlug: string
  currency?: string
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const storageKey = `omnilink_cart_${storeSlug}`

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [storageKey])

  // Save to localStorage whenever items change after hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to persist cart to localStorage:', e)
    }
  }, [items, isHydrated, storageKey])

  const generateItemId = useCallback(
    (productId: string, variantId?: string | null, options?: Record<string, string>) => {
      const optStr = options
        ? Object.entries(options)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join('|')
        : ''
      return `${productId}_${variantId || 'base'}_${optStr}`
    },
    []
  )

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'id'>) => {
      const id = generateItemId(
        newItem.productId,
        newItem.variantId,
        newItem.selectedOptions
      )

      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === id)
        if (existingIdx > -1) {
          const updated = [...prev]
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
          }
          return updated
        }
        return [...prev, { ...newItem, id }]
      })

      // Open drawer on add for immediate visual feedback
      setIsOpen(true)
    },
    [generateItemId]
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(storageKey)
    } catch {}
  }, [storageKey])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), [])

  const itemCount = useMemo(
    () => items.reduce((acc, i) => acc + (i.quantity || 1), 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      currency,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      storeSlug,
      isHydrated,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      currency,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      storeSlug,
      isHydrated,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

const defaultCartValue: CartContextValue = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  currency: 'USD',
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  storeSlug: '',
  isHydrated: true,
}

export function useCart() {
  const ctx = useContext(CartContext)
  return ctx || defaultCartValue
}
