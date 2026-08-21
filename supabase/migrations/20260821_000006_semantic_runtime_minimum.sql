-- Migration: Add minimal semantic runtime tables for Phase 3B
-- Description: Create semantic_fields and semantic_unknown_fields for AI Draft semantic processing
-- Created: 2026-08-21

-- Create semantic_fields table
create table if not exists public.semantic_fields (
  id uuid primary key default gen_random_uuid(),
  schema_id uuid references public.semantic_schemas(id) on delete cascade not null,
  field_name text not null,
  field_type text not null,
  display_name text not null,
  aliases jsonb default '[]',
  normalization_rules jsonb default '{}',
  required boolean default false,
  validation_rules jsonb default '{}',
  created_at timestamptz default now(),
  constraint semantic_fields_schema_field_unique unique (schema_id, field_name)
);

-- Create index for schema lookups
create index if not exists idx_semantic_fields_schema_id
on public.semantic_fields(schema_id);

-- Create semantic_unknown_fields table
create table if not exists public.semantic_unknown_fields (
  id uuid primary key default gen_random_uuid(),
  schema_id uuid references public.semantic_schemas(id),
  product_id uuid references public.products(id) on delete cascade,
  raw_field text not null,
  raw_value jsonb,
  reason text,
  status text default 'pending',
  normalized_field_name text,
  occurrence_count integer default 1,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Create indexes for unknown fields lookups
create index if not exists idx_semantic_unknown_fields_schema_id
on public.semantic_unknown_fields(schema_id);

create index if not exists idx_semantic_unknown_fields_product_id
on public.semantic_unknown_fields(product_id);

create index if not exists idx_semantic_unknown_fields_status
on public.semantic_unknown_fields(status);

-- Insert Eyewear semantic schema if it doesn't exist
-- Use a do block to handle the conditional insert safely
do $$
begin
  if not exists (
    select 1 from public.semantic_schemas 
    where industry_id = (select id from public.industries where slug = 'eyewear') 
    and version = '1.0'
  ) then
    insert into public.semantic_schemas (industry_id, version, schema)
    values (
      (select id from public.industries where slug = 'eyewear'),
      '1.0',
      '{
        "industry": "eyewear",
        "version": "1.0",
        "fields": ["material", "frame_shape", "color", "lens_index", "gender", "style"]
      }'::jsonb
    );
  end if;
end $$;

-- Insert Eyewear semantic fields seed data
-- Only insert if the eyewear schema exists
insert into public.semantic_fields (
  schema_id,
  field_name,
  field_type,
  display_name,
  aliases,
  normalization_rules,
  required,
  validation_rules
)
select
  (select id from public.semantic_schemas where industry_id = (select id from public.industries where slug = 'eyewear') and version = '1.0'),
  field_name,
  field_type,
  display_name,
  aliases,
  normalization_rules,
  required,
  validation_rules
from (
  values
  ('material', 'select', 'Material', '["材质", "材料", "frame material", "镜架材质"]'::jsonb, '{"mappings": {"TR90": "TR90", "钛合金": "titanium", "不锈钢": "stainless steel", "板材": "acetate", "金属": "metal", "塑料": "plastic"}}'::jsonb, false, '{}'::jsonb),
  ('frame_shape', 'select', 'Frame Shape', '["镜框形状", "框型", "frame shape", "shape"]'::jsonb, '{"mappings": {"方框": "square", "圆框": "round", "椭圆": "oval", "猫眼": "cat-eye", "飞行员": "aviator", "矩形": "rectangle"}}'::jsonb, false, '{}'::jsonb),
  ('color', 'text', 'Color', '["颜色", "colour", "frame color", "镜架颜色"]'::jsonb, '{"mappings": {"黑色": "black", "白色": "white", "红色": "red", "蓝色": "blue", "金色": "gold", "银色": "silver", "透明": "transparent"}}'::jsonb, false, '{}'::jsonb),
  ('lens_index', 'number', 'Lens Index', '["镜片折射率", "折射率", "lens index", "index"]'::jsonb, '{}'::jsonb, false, '{"min": 1.0, "max": 2.0}'::jsonb),
  ('gender', 'select', 'Gender', '["性别", "适用性别", "gender"]'::jsonb, '{"mappings": {"男": "male", "女": "female", "男女通用": "unisex", "中性": "unisex"}}'::jsonb, false, '{}'::jsonb),
  ('style', 'select', 'Style', '["风格", "款式", "style", "design"]'::jsonb, '{"mappings": {"商务": "business", "休闲": "casual", "运动": "sport", "时尚": "fashion", "复古": "vintage"}}'::jsonb, false, '{}'::jsonb)
) as t(field_name, field_type, display_name, aliases, normalization_rules, required, validation_rules)
on conflict (schema_id, field_name) do nothing;
