create table if not exists public.knowledge_areas (
  id uuid primary key default gen_random_uuid(),

  store_id uuid
    references public.stores(id)
    on delete cascade
    not null,

  slug text not null,

  name text not null,

  description text,

  is_system boolean not null default false,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint knowledge_areas_store_slug_unique
    unique (store_id, slug)
);

create index if not exists idx_knowledge_areas_store_id
on public.knowledge_areas(store_id);

create index if not exists idx_knowledge_areas_slug
on public.knowledge_areas(slug);

insert into public.knowledge_areas (
  store_id,
  slug,
  name,
  description,
  is_system
)
select
  s.id,
  area.slug,
  area.name,
  area.description,
  true
from public.stores s
cross join (
  values
    (
      'brand-business',
      '品牌与店铺信息',
      '品牌、店铺、官方信息与业务资料'
    ),
    (
      'product-knowledge',
      '产品知识',
      '产品说明书、认证、检测报告与产品上下文'
    ),
    (
      'support-policy',
      '服务与政策',
      '售后、退换货、物流与服务政策'
    ),
    (
      'product-rd',
      '产品研发',
      '产品研发与技术资料'
    ),
    (
      'competitor-intel',
      '竞品分析',
      '竞品与竞争环境资料'
    ),
    (
      'market-research',
      '市场研究',
      '市场研究与行业资料'
    )
) as area(
  slug,
  name,
  description
)
on conflict (store_id, slug)
do nothing;

alter table public.knowledge_areas
enable row level security;

create policy "knowledge_areas_select_own_store"
on public.knowledge_areas
for select
using (
  exists (
    select 1
    from public.stores s
    where s.id = knowledge_areas.store_id
      and s.owner_id = auth.uid()
  )
);

create policy "knowledge_areas_insert_own_store"
on public.knowledge_areas
for insert
with check (
  exists (
    select 1
    from public.stores s
    where s.id = knowledge_areas.store_id
      and s.owner_id = auth.uid()
  )
);

create policy "knowledge_areas_update_own_store"
on public.knowledge_areas
for update
using (
  exists (
    select 1
    from public.stores s
    where s.id = knowledge_areas.store_id
      and s.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.stores s
    where s.id = knowledge_areas.store_id
      and s.owner_id = auth.uid()
  )
);

create policy "knowledge_areas_delete_own_store"
on public.knowledge_areas
for delete
using (
  knowledge_areas.is_system = false
  and exists (
    select 1
    from public.stores s
    where s.id = knowledge_areas.store_id
      and s.owner_id = auth.uid()
  )
);
