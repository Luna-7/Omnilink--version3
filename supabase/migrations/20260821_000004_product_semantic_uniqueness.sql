create unique index if not exists
idx_product_semantics_product_schema_unique
on public.product_semantics(product_id, schema_id);

alter table public.product_semantics
  drop constraint if exists product_semantics_product_schema_unique;

alter table public.product_semantics
  add constraint product_semantics_product_schema_unique
  unique using index idx_product_semantics_product_schema_unique;
