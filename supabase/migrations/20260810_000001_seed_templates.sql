-- Seed templates for MVP demo
INSERT INTO templates (id, name, author_id, industry_id, layout_config, preview_url, status, created_at) VALUES
('template-modern', 'Modern', NULL, NULL, '{"sections": [{"type": "hero", "data": {"title": "Your Brand", "description": "Discover our products."}}, {"type": "product_grid", "data": {}}, {"type": "contact", "data": {}}]}', NULL, 'active', NOW()),
('template-classic', 'Classic', NULL, NULL, '{"sections": [{"type": "hero", "data": {"title": "Your Brand", "description": "Discover our products."}}, {"type": "product_grid", "data": {}}, {"type": "contact", "data": {}}]}', NULL, 'active', NOW()),
('template-minimal', 'Minimal', NULL, NULL, '{"sections": [{"type": "hero", "data": {"title": "Your Brand", "description": "Discover our products."}}, {"type": "product_grid", "data": {}}, {"type": "contact", "data": {}}]}', NULL, 'active', NOW())
ON CONFLICT (id) DO NOTHING;
