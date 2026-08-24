import { redirect } from 'next/navigation'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/products/${id}/edit`)
}
