import { redirect } from 'next/navigation'

/**
 * /dashboard/store — 兼容重定向。
 * 已将「店铺控制台」合并至「店铺装修」(/dashboard/storefront) 统一工作台。
 */
export default function StoreRedirectPage() {
  redirect('/dashboard/storefront')
}
