alter table public.product_assets
  add column if not exists storage_key text,
  add column if not exists file_hash text,
  add column if not exists size_bytes bigint;

create index if not exists idx_product_assets_file_hash
  on public.product_assets(file_hash);

insert into storage.buckets (id, name, public)
values
  ('omnilink-media-originals', 'omnilink-media-originals', false),
  ('omnilink-media-public', 'omnilink-media-public', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "omnilink original insert owner" on storage.objects;
create policy "omnilink original insert owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'omnilink-media-originals'
  and exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id::text = split_part(name, '/', 1)
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "omnilink original select owner" on storage.objects;
create policy "omnilink original select owner"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'omnilink-media-originals'
  and exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id::text = split_part(name, '/', 1)
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "omnilink original delete owner" on storage.objects;
create policy "omnilink original delete owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'omnilink-media-originals'
  and exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id::text = split_part(name, '/', 1)
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "omnilink public read" on storage.objects;
create policy "omnilink public read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'omnilink-media-public'
);

drop policy if exists "omnilink public insert owner" on storage.objects;
create policy "omnilink public insert owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'omnilink-media-public'
  and exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id::text = split_part(name, '/', 1)
      and s.owner_id = auth.uid()
  )
);

drop policy if exists "omnilink public delete owner" on storage.objects;
create policy "omnilink public delete owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'omnilink-media-public'
  and exists (
    select 1
    from public.products p
    join public.stores s on s.id = p.store_id
    where p.id::text = split_part(name, '/', 1)
      and s.owner_id = auth.uid()
  )
);
