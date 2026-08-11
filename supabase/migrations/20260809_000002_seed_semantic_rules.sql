-- Migration: Seed semantic_rules with commerce reasoning rules
-- Description: Add initial reasoning rules for eyewear industry
-- Created: 2026-08-09
-- Depends on: 20260809_000001_add_semantic_rules_table.sql

insert into semantic_rules (name, description, industry, condition, conclusion, confidence)
values
('TR90 lightweight frame', 'TR90 material with low weight', 'eyewear',
 '{"and":[{"field":"material","value":"TR90"},{"field":"weight","operator":"<","value":20}]}'::jsonb,
 '{"concept":"lightweight","value":true}'::jsonb,
 0.9),
('UV protection', 'UV400 lens protection', 'eyewear',
 '{"field":"uv400","value":true}'::jsonb,
 '{"concept":"eye_protection","value":true}'::jsonb,
 0.95),
('High index lens', '1.67 refractive index lens', 'eyewear',
 '{"field":"lens_index","value":"1.67"}'::jsonb,
 '{"concept":"high_index_lens","value":true}'::jsonb,
 0.9);
