'use server'

import { initializeMerchantStore } from '@/lib/stores/service'
import { createClientServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createStoreAction(formData: FormData) {
  const store_name = formData.get('store_name') as string
  const industry_id = formData.get('industry_id') as string | null
  const industry_category = formData.get('industry_category') as string | null
  const logo_url = formData.get('logo_url') as string | null
  const description = formData.get('description') as string | null
  const currency = (formData.get('currency') as string | null) || 'CNY'

  if (!store_name) {
    return { success: false, error: '店铺名称不能为空' }
  }

  // Get user from Supabase session
  const supabase = await createClientServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: '未检测到有效登录状态，请先登录' }
  }

  const owner_id = user.id

  try {
    await initializeMerchantStore({
      owner_id,
      store_name,
      industry_id: industry_id || null,
      industry_category: industry_category || null,
      logo_url: logo_url || null,
      description: description || null,
      currency: currency || 'CNY',
    })
    return { success: true, redirectUrl: '/dashboard' }
  } catch (error) {
    return {
      success: false,
      error: `创建店铺失败: ${error instanceof Error ? error.message : error}`,
    }
  }
}
