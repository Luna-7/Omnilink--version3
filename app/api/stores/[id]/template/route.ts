import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { normalizeStorefrontSchema } from "@/lib/storefront/schema";

/**
 * PATCH /api/stores/[id]/template —— 商家主题选择写入口。
 *
 * 契约（Phase 14 #52 接通）：
 *   TemplateSelector → PATCH { template_id }
 *     → 校验：登录态 + 店铺归属 + template 合法（active 白名单）
 *     → 持久化：store_settings.theme_config.theme_id（merge，不覆盖其他键）
 *     → 公开链路消费：getPublishedStore 读取 theme_config.theme_id
 *        → StorefrontStore.themeId → ThemeRoot → registry → --th-* tokens
 *
 * 安全约束：
 *   - 只允许 authenticated merchant 修改自己的 store（显式 getUser + owner 过滤，
 *     RLS 作为第二道防线）。
 *   - theme_id 只能来自 templates 表中 active 行（不允许任意字符串污染）。
 *   - 客户端提交的其它字段（theme_config/token 等）一律忽略，不做 token 注入。
 *   - 不修改 templates 表中的主题定义；不创建第二套 theme config。
 *
 * Legacy 兼容：
 *   - store_pages.template_id/sections 旧写入保留为 best-effort（无该行时不阻塞
 *     主题写入；公开路由自 #48 起不再读取 store_pages.sections）。
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClientServer();
  const { id: storeId } = await params;

  // 1. 登录态
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. 请求体：只取 template_id，忽略其余字段（防 token 注入）
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const templateId =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).template_id
      : undefined;

  if (typeof templateId !== "string" || templateId.length === 0) {
    return NextResponse.json(
      { error: "template_id is required" },
      { status: 400 }
    );
  }

  // 3. 店铺归属：显式 owner 过滤（跨店修改 → 404）
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (storeError || !store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  // 4. 主题白名单：templates 表 active 行（不允许任意 theme_id）
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id,layout_config,status")
    .eq("id", templateId)
    .eq("status", "active")
    .maybeSingle();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

  // 5. theme_id 推导：theme 注册行取 layout_config.theme_id，否则回退 template.id
  //    （registry 对未知 id 安全回退默认主题）。
  const layoutConfig =
    template.layout_config && typeof template.layout_config === "object"
      ? (template.layout_config as Record<string, unknown>)
      : {};
  const themeId =
    typeof layoutConfig.theme_id === "string" && layoutConfig.theme_id.length > 0
      ? layoutConfig.theme_id
      : template.id;

  // 6. 持久化：统一为 canonical StorefrontSchema。
  //    既有 theme_config（canonical 或 legacy）经归一化后仅替换 theme.themeId，
  //    sections / meta.published 等既有内容一律保留；无既有配置时以默认骨架起步。
  const { data: settings, error: settingsError } = await supabase
    .from("store_settings")
    .select("id,theme_config")
    .eq("store_id", storeId)
    .maybeSingle();

  if (settingsError) {
    console.error("Failed to read store settings:", settingsError);
    return NextResponse.json(
      { error: "Failed to update store theme" },
      { status: 500 }
    );
  }

  const existing =
    normalizeStorefrontSchema(settings?.theme_config) ??
    normalizeStorefrontSchema({ theme_id: themeId });

  if (!existing) {
    return NextResponse.json(
      { error: "Failed to update store theme" },
      { status: 500 }
    );
  }

  const nextThemeConfig = {
    ...existing,
    theme: { ...existing.theme, themeId },
    meta: { ...existing.meta, lastModified: new Date().toISOString() },
  };
  const now = new Date().toISOString();

  if (settings) {
    const { error: updateError } = await supabase
      .from("store_settings")
      .update({ theme_config: nextThemeConfig, updated_at: now })
      .eq("store_id", storeId);

    if (updateError) {
      console.error("Failed to update store theme:", updateError);
      return NextResponse.json(
        { error: "Failed to update store theme" },
        { status: 500 }
      );
    }
  } else {
    const { error: insertError } = await supabase
      .from("store_settings")
      .insert({
        store_id: storeId,
        theme_config: nextThemeConfig,
        seo_config: {},
      });

    if (insertError) {
      console.error("Failed to create store settings:", insertError);
      return NextResponse.json(
        { error: "Failed to update store theme" },
        { status: 500 }
      );
    }
  }

  // 7. Legacy 兼容：store_pages.template_id best-effort（无该行不阻塞主题写入）
  const sections = Array.isArray(layoutConfig.sections)
    ? layoutConfig.sections
    : [];

  const { data: page } = await supabase
    .from("store_pages")
    .update({
      template_id: template.id,
      sections,
      updated_at: now,
    })
    .eq("store_id", storeId)
    .select("id,template_id,published")
    .maybeSingle();

  return NextResponse.json({
    theme_id: themeId,
    page: page ?? null,
  });
}
