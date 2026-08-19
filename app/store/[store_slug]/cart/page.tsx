import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import Navbar from '@/components/theme/core/Navbar'
import Footer from '@/components/theme/core/Footer'
import CartPageView from '@/components/cart/CartPageView'
import { getPublishedStore } from '@/lib/storefront/service'

export default async function StoreCartPage({
  params,
}: {
  params: Promise<{ store_slug: string }>
}) {
  const { store_slug } = await params
  const store = await getPublishedStore(store_slug)

  if (!store) {
    notFound()
  }

  return (
    <ThemeRoot themeId={store.themeId}>
      <Navbar store={store} />
      <CartPageView store={store} />
      <Footer store={store} />
    </ThemeRoot>
  )
}
