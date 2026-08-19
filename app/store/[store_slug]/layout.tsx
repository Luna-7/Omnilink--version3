import { notFound } from 'next/navigation'
import { getPublishedStore } from '@/lib/storefront/service'
import { CartProvider } from '@/components/cart/CartContext'
import CartDrawer from '@/components/cart/CartDrawer'
import ThemeRoot from '@/components/theme/ThemeRoot'

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ store_slug: string }>
}) {
  const { store_slug } = await params
  const store = await getPublishedStore(store_slug)

  if (!store) {
    notFound()
  }

  return (
    <CartProvider storeSlug={store.slug} currency={store.currency}>
      <ThemeRoot themeId={store.themeId}>
        {children}
        <CartDrawer />
      </ThemeRoot>
    </CartProvider>
  )
}
