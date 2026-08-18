import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { getStoreByOwnerId } from '@/lib/stores/service'
import { loadTemplateSchemaAction } from '@/app/actions/template'
import TemplatePreviewClient from './TemplatePreviewClient'

interface PageProps {
  params: Promise<{ templateId: string }>
}

export default async function TemplatePreviewPage({ params }: PageProps) {
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

  // 加载 Template 专属 Schema（绝不读取/修改 Store 架构）
  const schema = await loadTemplateSchemaAction(templateId)

  return (
    <TemplatePreviewClient
      templateId={templateId}
      store={store}
      initialSchema={schema}
    />
  )
}
