import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { getEditorStorefrontProducts } from '@/lib/storefront/editor-products'
import { loadStorefrontSchemaAction } from '@/app/actions/store'
import { StorefrontHub } from '@/components/storefront/StorefrontHub'

/**
 * /dashboard/storefront — 统一店铺装修与控制台主枢纽。
 *
 * 整合「店铺装修」和「店铺控制台」的全部逻辑：
 * 1. 真实店铺与发布态（实时直连 Supabase 与 Cookie Auth 会话）
 * 2. 所见即所得视觉装修工作台 (StorefrontEditor + DynamicSectionRenderer)
 * 3. 视觉风格库 (TemplateSelector)
 * 4. 页面管理、多渠道分发与 AI SEO 策略
 */
export default async function StorefrontDashboardPage() {
  const supabase = await createClientServer()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  // 演示回退与无会话状态保护
  if (!user) {
    const demoSchema = await loadStorefrontSchemaAction('demo-store')
    return (
      <StorefrontHub
        store={{
          id: 'demo-store',
          store_name: 'Omnilink 旗舰店',
          store_slug: 'omnilink-flagship',
        }}
        storePage={null}
        storefrontSchema={demoSchema}
        storefrontProducts={[]}
      />
    )
  }

  const store = await getStoreByOwnerId(user.id)
  if (!store) {
    redirect('/onboarding')
  }

  let page = null
  try {
    const { data } = await supabase
      .from('store_pages')
      .select('id, published, template_id, sections')
      .eq('store_id', store.id)
      .maybeSingle()
    page = data
  } catch (error) {
    console.error('Failed to fetch store page:', error)
  }

  let storefrontSchema = null
  try {
    storefrontSchema = await loadStorefrontSchemaAction(store.id)
  } catch (error) {
    console.error('Failed to load storefront schema:', error)
  }

  let storefrontProducts: any[] = []
  try {
    storefrontProducts = await getEditorStorefrontProducts({
      id: store.id,
      slug: store.store_slug,
      currency: store.currency,
    })
  } catch (error) {
    console.error('Failed to load storefront products:', error)
  }

  return (
    <StorefrontHub
      store={store}
      storePage={page}
      storefrontSchema={storefrontSchema}
      storefrontProducts={storefrontProducts}
    />
  )
}
