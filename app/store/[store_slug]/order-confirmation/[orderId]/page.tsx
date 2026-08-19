import { notFound } from 'next/navigation'
import ThemeRoot from '@/components/theme/ThemeRoot'
import Navbar from '@/components/theme/core/Navbar'
import Footer from '@/components/theme/core/Footer'
import OrderConfirmationPageView from '@/components/checkout/OrderConfirmationPageView'
import { getPublishedStore } from '@/lib/storefront/service'
import { getOrderConfirmationAction } from '@/app/actions/order'

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ store_slug: string; orderId: string }>
}) {
  const { store_slug, orderId } = await params

  const store = await getPublishedStore(store_slug)
  if (!store) {
    notFound()
  }

  const order = await getOrderConfirmationAction(store_slug, orderId)
  if (!order) {
    notFound()
  }

  return (
    <ThemeRoot themeId={store.themeId}>
      <Navbar store={store} />
      <OrderConfirmationPageView order={order} store={store} />
      <Footer store={store} />
    </ThemeRoot>
  )
}
