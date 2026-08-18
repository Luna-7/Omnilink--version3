'use server'

import { createClientServer } from '@/lib/supabase/server'
import type { StorefrontSchema } from '@/lib/storefront/schema'
import {
  createDefaultSchema,
  normalizeStorefrontSchema,
  validateSchema,
} from '@/lib/storefront/schema'

/**
 * Phase 1 — Template Data Service Actions
 *
 * 严格遵照架构边界：
 * 1. Style: 全局视觉系统 (colors, typography, radius, etc.)
 * 2. Template: Style + 固定 KURA OBJECTS 10-Module Composition
 * 3. Store: Template 被商家应用后的实际实例
 */

/**
 * 读取 Template Schema
 */
export async function loadTemplateSchemaAction(
  templateId: string
): Promise<StorefrontSchema | null> {
  try {
    const supabase = await createClientServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      // 允许非登录用户（如未登录时预览 Demo）或继续逻辑
    }

    // 1. 查询 templates 表
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('id, layout_config, status')
      .eq('id', templateId)
      .eq('status', 'active')
      .maybeSingle()

    if (templateError) {
      console.error('loadTemplateSchemaAction query error:', templateError)
    }

    // 2. 读取或初始化 Schema
    const layoutConfig = template?.layout_config
    let normalized = normalizeStorefrontSchema(layoutConfig)

    if (!normalized) {
      // 若 layout_config 为空，以 KURA OBJECTS 10-Module 基础模板起步，并绑定指定 themeId
      normalized = createDefaultSchema()
      normalized.theme.themeId = templateId
    } else {
      // 确保 themeId 与当前 templateId 强对齐（若 layout_config 中未设置或不符合）
      if (!normalized.theme.themeId || normalized.theme.themeId === 'minimal') {
        normalized.theme.themeId = templateId
      }
    }

    return normalized
  } catch (err) {
    console.error('loadTemplateSchemaAction error:', err)
    // Fallback 到默认的 KURA OBJECTS 10-Module 基线
    const fallback = createDefaultSchema()
    fallback.theme.themeId = templateId
    return fallback
  }
}

/**
 * 保存 Template Schema 到 templates.layout_config
 * 绝对不影响任何 Store 资产。
 */
export async function saveTemplateSchemaAction(
  templateId: string,
  schema: StorefrontSchema
) {
  try {
    const supabase = await createClientServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // 校验 Schema
    if (!validateSchema(schema)) {
      return { success: false, error: 'Invalid storefront schema' }
    }

    // 更新 templates 表的 layout_config JSONB 字段
    const { error: updateError } = await supabase
      .from('templates')
      .update({
        layout_config: schema,
      } as any)
      .eq('id', templateId)

    if (updateError) {
      console.error('saveTemplateSchemaAction update error:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (err) {
    console.error('saveTemplateSchemaAction exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save template',
    }
  }
}

/**
 * 将指定 Template 应用到商家的 Store 实例
 * 这是唯一允许 Template 覆盖 Store sections 的场景。
 */
export async function applyTemplateToStoreAction(
  storeId: string,
  templateId: string
) {
  if (storeId === 'demo-store') {
    return { success: true }
  }

  try {
    const supabase = await createClientServer()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    // 1. 验证店铺所有权
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .single()

    if (storeError || !store || store.owner_id !== user.id) {
      return { success: false, error: 'Store not found or forbidden' }
    }

    // 2. 读取完整的 Template Schema
    const templateSchema = await loadTemplateSchemaAction(templateId)
    if (!templateSchema) {
      return { success: false, error: 'Template schema not found' }
    }

    // 3. 读取 Store 现有的 theme_config，避免覆盖商家已填写的真实联系方式与品牌 Identity
    const { data: currentSettings } = await supabase
      .from('store_settings')
      .select('theme_config')
      .eq('store_id', storeId)
      .maybeSingle()

    const existingStoreSchema = normalizeStorefrontSchema(currentSettings?.theme_config)

    // 严格隔离规则：模板提供 sections + theme，但绝不覆盖商家的真实店铺联系方式与品牌 Identity
    const targetGlobalInfo = existingStoreSchema?.globalInfo || templateSchema.globalInfo
    const targetContact = existingStoreSchema?.contact || templateSchema.contact
    const targetSocial = existingStoreSchema?.social || templateSchema.social

    // 4. 构建将写入 Store 的 Schema
    const targetSchema: StorefrontSchema = {
      ...templateSchema,
      theme: {
        ...templateSchema.theme,
        themeId: templateId,
      },
      globalInfo: targetGlobalInfo,
      contact: targetContact,
      social: targetSocial,
      meta: {
        lastModified: new Date().toISOString(),
        published: true, // 保持发布可用性
      },
    }

    // 4. 持久化写入 store_settings.theme_config
    const { error: settingsError } = await supabase.from('store_settings').upsert(
      {
        store_id: storeId,
        theme_config: targetSchema,
        seo_config: {},
      } as any,
      { onConflict: 'store_id' }
    )

    if (settingsError) {
      console.error('applyTemplateToStoreAction settings error:', settingsError)
      return { success: false, error: settingsError.message }
    }

    // 5. 同步写入 store_pages 以保持兼容性
    await supabase.from('store_pages').upsert(
      {
        store_id: storeId,
        template_id: templateId,
        sections: targetSchema.sections,
        published: true,
      } as any,
      { onConflict: 'store_id' }
    )

    return { success: true }
  } catch (err) {
    console.error('applyTemplateToStoreAction exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to apply template to store',
    }
  }
}
