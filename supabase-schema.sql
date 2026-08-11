-- 强制删除所有旧表及关联关系
DROP TABLE IF EXISTS imports CASCADE;
DROP TABLE IF EXISTS product_assets CASCADE;
DROP TABLE IF EXISTS product_semantics CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS semantic_schemas CASCADE;
DROP TABLE IF EXISTS semantic_fields CASCADE;
DROP TABLE IF EXISTS semantic_processing_logs CASCADE;
DROP TABLE IF EXISTS semantic_unknown_fields CASCADE;
DROP TABLE IF EXISTS semantic_ontology CASCADE;
DROP TABLE IF EXISTS semantic_relations CASCADE;
DROP TABLE IF EXISTS semantic_rules CASCADE;
DROP TABLE IF EXISTS semantic_parse_jobs CASCADE;
DROP TABLE IF EXISTS product_missing_attributes CASCADE;
DROP TABLE IF EXISTS attribute_questions CASCADE;
DROP TABLE IF EXISTS semantic_sources CASCADE;
DROP TABLE IF EXISTS product_embeddings CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS store_pages CASCADE;
DROP TABLE IF EXISTS ai_jobs CASCADE;
DROP TABLE IF EXISTS store_plugins CASCADE;
DROP TABLE IF EXISTS agent_api_keys CASCADE;


-- Enable UUID
create extension if not exists "pgcrypto";


------------------------------------------------
-- 1. Industry
------------------------------------------------

create table industries (

 id uuid primary key default gen_random_uuid(),

 name text not null,

 slug text unique not null,

 description text,

 created_at timestamptz default now()

);



------------------------------------------------
-- 2. Stores
------------------------------------------------

create table stores (

 id uuid primary key default gen_random_uuid(),

 owner_id uuid references auth.users(id)
 on delete cascade not null,


 store_name text not null,

 store_slug text unique not null,


 industry_id uuid references industries(id),


 logo_url text,

 description text,


 currency text default 'USD',


 status text default 'active',


 created_at timestamptz default now(),

 updated_at timestamptz default now()

);



------------------------------------------------
-- 3. Store Settings
------------------------------------------------

create table store_settings (

 id uuid primary key default gen_random_uuid(),

 store_id uuid references stores(id)
 on delete cascade not null,


 theme_config jsonb default '{}',


 seo_config jsonb default '{}',


 created_at timestamptz default now(),

 updated_at timestamptz default now()

);



------------------------------------------------
-- 4. Templates
------------------------------------------------

create table templates (

 id text primary key,


 name text not null,


 author_id uuid references auth.users(id),


 industry_id uuid references industries(id),


 layout_config jsonb not null,


 preview_url text,


 status text default 'active',


 created_at timestamptz default now()

);



------------------------------------------------
-- 5. Store Page Configuration
------------------------------------------------

create table store_pages (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id)
 on delete cascade not null,


 template_id text references templates(id),


 sections jsonb default '{}',


 published boolean default false,


 created_at timestamptz default now(),

 updated_at timestamptz default now()

);



------------------------------------------------
-- 6. Products Stable Core
------------------------------------------------

create table products (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id)
 on delete cascade not null,


 sku text,


 name text not null,


 description text,


 price numeric not null,


 currency text default 'USD',


 inventory integer default 0,


 status text default 'active',


 raw_data jsonb,


 created_at timestamptz default now(),

 updated_at timestamptz default now()

);



------------------------------------------------
-- 7. Semantic Schema
------------------------------------------------

create table semantic_schemas (

 id uuid primary key default gen_random_uuid(),


 industry_id uuid references industries(id),


 version text default '1.0',


 schema jsonb not null,


 created_at timestamptz default now()

);



------------------------------------------------
-- 8. Semantic Fields
------------------------------------------------

create table semantic_fields (

 id uuid primary key default gen_random_uuid(),


 schema_id uuid references semantic_schemas(id)
 on delete cascade not null,


 field_name text not null,


 field_type text not null,
 -- text, number, boolean, select


 display_name text not null,


 aliases jsonb default '[]',
 -- List of alternative names for matching


 normalization_rules jsonb default '{}',
 -- Rules for normalizing values


 required boolean default false,


 validation_rules jsonb default '{}',


 created_at timestamptz default now()

);



------------------------------------------------
-- 9. Semantic Processing Logs
------------------------------------------------

create table semantic_processing_logs (

 id uuid primary key default gen_random_uuid(),


 product_id uuid references products(id)
 on delete cascade,


 schema_id uuid references semantic_schemas(id),


 processor_version text not null,


 status text not null,


 confidence numeric,


 error_message text,


 metadata jsonb default '{}'::jsonb,


 created_at timestamptz default now()

);



------------------------------------------------
-- 11. Semantic Ontology
------------------------------------------------

create table semantic_ontology (

 id uuid primary key default gen_random_uuid(),


 canonical_name text not null,


 description text,


 industry text,


 aliases jsonb default '[]'::jsonb,


 created_at timestamptz default now(),


 updated_at timestamptz default now()

);



create index semantic_ontology_canonical_idx
on semantic_ontology(canonical_name);


-- Seed basic ontology concepts
insert into semantic_ontology (canonical_name, description, aliases)
values
('brand', 'Product brand identifier', '["品牌", "牌子", "brand_name", "manufacturer"]'::jsonb),
('material', 'Product material', '["材质", "材料", "material_type"]'::jsonb),
('color', 'Product color', '["颜色", "色彩", "colour"]'::jsonb),
('size', 'Product size', '["尺寸", "规格", "size"]'::jsonb),
('weight', 'Product weight', '["重量", "weight"]'::jsonb),
('origin', 'Product origin', '["产地", "origin", "country_of_origin"]'::jsonb),
('product_attribute', 'Product attribute category', '["产品属性", "属性"]'::jsonb),
('lens_attribute', 'Lens-specific attribute category', '["镜片属性", "lens_props"]'::jsonb),
('lens_feature', 'Lens feature type', '["镜片特性", "lens_characteristic"]'::jsonb),
('eye_protection_feature', 'Eye protection feature type', '["眼部保护特性", "eye_protection"]'::jsonb),
('lens_index', 'Lens refractive index', '["镜片指数", "折射率", "refractive_index"]'::jsonb),
('polarized', 'Polarized lens feature', '["偏光", "polarization"]'::jsonb),
('uv400', 'UV400 protection feature', '["防紫外线", "uv_protection"]'::jsonb);



------------------------------------------------
-- 12. Semantic Relations
------------------------------------------------

create table semantic_relations (

 id uuid primary key default gen_random_uuid(),


 source_concept_id uuid references semantic_ontology(id)
 on delete cascade,


 relation_type text not null,


 target_concept_id uuid references semantic_ontology(id)
 on delete cascade,


 metadata jsonb default '{}'::jsonb,


 created_at timestamptz default now()

);



create index semantic_relation_source_idx
on semantic_relations(source_concept_id);



create index semantic_relation_target_idx
on semantic_relations(target_concept_id);


-- Seed commerce ontology graph relations
insert into semantic_relations (source_concept_id, relation_type, target_concept_id)
select
  a.id,
  'belongs_to',
  b.id
from semantic_ontology a, semantic_ontology b
where a.canonical_name = 'material' and b.canonical_name = 'product_attribute';

insert into semantic_relations (source_concept_id, relation_type, target_concept_id)
select
  a.id,
  'belongs_to',
  b.id
from semantic_ontology a, semantic_ontology b
where a.canonical_name = 'color' and b.canonical_name = 'product_attribute';

insert into semantic_relations (source_concept_id, relation_type, target_concept_id)
select
  a.id,
  'belongs_to',
  b.id
from semantic_ontology a, semantic_ontology b
where a.canonical_name = 'lens_index' and b.canonical_name = 'lens_attribute';

insert into semantic_relations (source_concept_id, relation_type, target_concept_id)
select
  a.id,
  'is_a',
  b.id
from semantic_ontology a, semantic_ontology b
where a.canonical_name = 'polarized' and b.canonical_name = 'lens_feature';

insert into semantic_relations (source_concept_id, relation_type, target_concept_id)
select
  a.id,
  'is_a',
  b.id
from semantic_ontology a, semantic_ontology b
where a.canonical_name = 'uv400' and b.canonical_name = 'eye_protection_feature';



------------------------------------------------
-- 13. Semantic Rules
------------------------------------------------

create table semantic_rules (

 id uuid primary key default gen_random_uuid(),


 name text not null,


 description text,


 industry text,


 condition jsonb not null,


 conclusion jsonb not null,


 confidence numeric default 0.8,


 created_at timestamptz default now()

);



create index semantic_rules_industry_idx
on semantic_rules(industry);


-- Seed commerce reasoning rules
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



------------------------------------------------
-- 14. Unknown Semantic Fields
------------------------------------------------

create table semantic_unknown_fields (

 id uuid primary key default gen_random_uuid(),


 schema_id uuid references semantic_schemas(id),


 product_id uuid references products(id)
 on delete cascade,


 raw_field text not null,


 raw_value jsonb,


 reason text,


 status text default 'pending',


 normalized_field_name text,


 occurrence_count integer default 1,


 last_seen_at timestamptz default now(),


 created_at timestamptz default now()

);



------------------------------------------------
-- 15. Product Semantic Data
------------------------------------------------

create table product_semantics (

 id uuid primary key default gen_random_uuid(),


 product_id uuid references products(id)
 on delete cascade not null,


 schema_id uuid references semantic_schemas(id),


 semantic_data jsonb not null,


 confidence numeric,


 generated_by text,


 created_at timestamptz default now(),


 updated_at timestamptz default now()

);



------------------------------------------------
-- 16. Product Assets
------------------------------------------------

create table product_assets (

 id uuid primary key default gen_random_uuid(),


 product_id uuid references products(id)
 on delete cascade not null,


 asset_type text not null,
 -- original
 -- watermark
 -- transparent


 url text not null,


 metadata jsonb default '{}',


 created_at timestamptz default now()

);



------------------------------------------------
-- 17. Import Records
------------------------------------------------

create table imports (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id)
 on delete cascade,


 file_url text,


 status text,


 total_rows integer,


 created_at timestamptz default now()

);



------------------------------------------------
-- 18. AI Processing Jobs
------------------------------------------------

create table ai_jobs (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id),


 import_id uuid references imports(id),


 job_type text,


 status text,


 model text,


 input jsonb,


 output jsonb,


 created_at timestamptz default now()

);



------------------------------------------------
-- 19. Plugins
------------------------------------------------

create table store_plugins (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id)
 on delete cascade,


 plugin_name text not null,


 enabled boolean default false,


 config jsonb default '{}',


 created_at timestamptz default now()

);



------------------------------------------------
-- 20. Agent API Keys
------------------------------------------------

create table agent_api_keys (

 id uuid primary key default gen_random_uuid(),


 store_id uuid references stores(id)
 on delete cascade,


 api_key_hash text not null,


 name text,


 permission text default 'read_products',


 created_at timestamptz default now()

);



------------------------------------------------
-- Initial Data
------------------------------------------------

-- Insert initial industries
insert into industries (name, slug, description) values
('Eyewear', 'eyewear', 'Glasses, sunglasses, and optical accessories'),
('Fashion', 'fashion', 'Clothing, apparel, and fashion accessories'),
('Jewelry', 'jewelry', 'Fine jewelry, watches, and accessories'),
('Electronics', 'electronics', 'Consumer electronics and gadgets'),
('Home & Garden', 'home-garden', 'Home decor, furniture, and garden supplies'),
('Sports', 'sports', 'Sports equipment and athletic wear'),
('Beauty', 'beauty', 'Cosmetics, skincare, and personal care'),
('Food & Beverage', 'food-beverage', 'Food products and beverages');


-- Insert Eyewear Schema v1
insert into semantic_schemas (industry_id, version, schema) values
(
  (select id from industries where slug = 'eyewear'),
  '1.0',
  '{
    "industry": "eyewear",
    "version": "1.0",
    "fields": ["material", "frame_shape", "color", "lens_index", "gender", "style"]
  }'
)
returning id as eyewear_schema_id;


-- Insert Eyewear Semantic Fields
insert into semantic_fields (schema_id, field_name, field_type, display_name, aliases, normalization_rules, required, validation_rules)
select
  (select id from semantic_schemas where industry_id = (select id from industries where slug = 'eyewear') and version = '1.0'),
  field_name,
  field_type,
  display_name,
  aliases,
  normalization_rules,
  required,
  validation_rules
from (
  values
  ('material', 'select', 'Material', '["材质", "材料", "frame material", "镜架材质"]', '{"mappings": {"TR90": "TR90", "钛合金": "titanium", "不锈钢": "stainless steel", "板材": "acetate", "金属": "metal", "塑料": "plastic"}}', false, '{}'),
  ('frame_shape', 'select', 'Frame Shape', '["镜框形状", "框型", "frame shape", "shape"]', '{"mappings": {"方框": "square", "圆框": "round", "椭圆": "oval", "猫眼": "cat-eye", "飞行员": "aviator", "矩形": "rectangle"}}', false, '{}'),
  ('color', 'text', 'Color', '["颜色", "colour", "frame color", "镜架颜色"]', '{"mappings": {"黑色": "black", "白色": "white", "红色": "red", "蓝色": "blue", "金色": "gold", "银色": "silver", "透明": "transparent"}}', false, '{}'),
  ('lens_index', 'number', 'Lens Index', '["镜片折射率", "折射率", "lens index", "index"]', '{}', false, '{"min": 1.0, "max": 2.0}'),
  ('gender', 'select', 'Gender', '["性别", "适用性别", "gender"]', '{"mappings": {"男": "male", "女": "female", "男女通用": "unisex", "中性": "unisex"}}', false, '{}'),
  ('style', 'select', 'Style', '["风格", "款式", "style", "design"]', '{"mappings": {"商务": "business", "休闲": "casual", "运动": "sport", "时尚": "fashion", "复古": "vintage"}}', false, '{}')
) as t(field_name, field_type, display_name, aliases, normalization_rules, required, validation_rules);


-- Insert initial templates
-- First, we need to get the industry IDs, but for simplicity we'll use a general template
insert into templates (id, name, industry_id, layout_config, status) values
('general', 'General Template', null, '{
  "sections": ["header", "hero", "product_grid", "contact"]
}', 'active'),
('minimalist', 'Minimalist Template', null, '{
  "sections": ["header", "product_detail", "contact"]
}', 'active');