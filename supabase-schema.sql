-- 强制删除所有旧表及关联关系
DROP TABLE IF EXISTS imports CASCADE;
DROP TABLE IF EXISTS product_assets CASCADE;
DROP TABLE IF EXISTS product_semantics CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS semantic_schemas CASCADE;
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
-- 8. Product Semantic Data
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
-- 9. Product Assets
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
-- 10. Import Records
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
-- 11. AI Processing Jobs
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
-- 12. Plugins
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
-- 13. Agent API Keys
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


-- Insert initial templates
-- First, we need to get the industry IDs, but for simplicity we'll use a general template
insert into templates (id, name, industry_id, layout_config, status) values
('general', 'General Template', null, '{
  "sections": ["header", "hero", "product_grid", "contact"]
}', 'active'),
('minimalist', 'Minimalist Template', null, '{
  "sections": ["header", "product_detail", "contact"]
}', 'active');