-- Seed: register the Electric Violet theme (Phase 13 Theme System)
--
-- 静态 ThemeDefinition（tokens/variants）仍是代码层唯一视觉真相源
-- （lib/themes/electric-violet）。本行只保存主题身份 / 注册关系，
-- 使 store_settings.theme_config.theme_id 能合法引用 'electric-violet'。
-- 不向数据库复制任何视觉 token。
--
-- layout_config 仅为主题身份描述（theme_id / 固定模板集合），
-- 不含 legacy sections；新公开路由（#48）不读取 store_pages.sections。
--
-- 幂等：ON CONFLICT (id) DO NOTHING，可重复执行。

INSERT INTO templates (id, name, author_id, industry_id, layout_config, preview_url, status, created_at) VALUES
('electric-violet', 'Electric Violet', NULL, NULL, '{"theme_id": "electric-violet", "kind": "theme", "templates": ["home", "product", "collection"]}', NULL, 'active', NOW())
ON CONFLICT (id) DO NOTHING;
