-- Storage UPDATE policies for the media buckets.
--
-- 20260821_000002_product_asset_foundation.sql created INSERT / SELECT /
-- DELETE policies on storage.objects, but no UPDATE policy. The upload route
-- (app/api/merchant/media/upload/route.ts) uploads both the private original
-- and the public webp with `upsert: true`:
--
--     supabase.storage.from(ORIGINAL_BUCKET).upload(key, buf, { upsert: true })
--     supabase.storage.from(PUBLIC_BUCKET).upload(key, buf, { upsert: true })
--
-- The first attempt takes the INSERT branch and succeeds, but any re-upload of
-- the same object name — which happens whenever the client retries with the
-- same asset_id — takes the UPDATE branch and is rejected with 403 by RLS.
-- withRetry then burns all three attempts and the upload fails with a 500.

drop policy if exists "omnilink original update owner" on storage.objects;
create policy "omnilink original update owner"
on storage.objects
for update
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
)
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

drop policy if exists "omnilink public update owner" on storage.objects;
create policy "omnilink public update owner"
on storage.objects
for update
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
)
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
