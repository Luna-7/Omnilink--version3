import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { loadTemplateSchemaAction } from '@/app/actions/template'
import StorefrontEditor from '@/components/storefront/StorefrontEditor'

interface PageProps {
  params: Promise<{ templateId: string }>
}

export default async function TemplateEditPage({ params }: PageProps) {
  const { templateId } = await params
  const supabase = await createClientServer()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  let store = {
    id: 'demo-store',
    store_name: 'Omnilink 旗舰店',
    store_slug: 'omnilink-flagship',
  }

  if (user) {
    const userStore = await getStoreByOwnerId(user.id)
    if (userStore) {
      store = {
        id: userStore.id,
        store_name: userStore.store_name,
        store_slug: userStore.store_slug,
      }
    }
  }

  // 加载指定的 Template Draft Schema
  const schema = await loadTemplateSchemaAction(templateId)

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <StorefrontEditor
        store={store}
        initialSchema={schema || undefined}
        mode="template"
        templateId={templateId}
      />
    </div>
  )
}
