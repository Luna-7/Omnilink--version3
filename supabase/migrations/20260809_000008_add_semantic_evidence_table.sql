-- Migration: Add semantic_evidence table
-- Description: Create semantic_evidence table for tracking semantic attribute evidence
-- Created: 2026-08-09

create table semantic_evidence (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  semantic_field text not null,
  field_value jsonb not null,
  evidence_type text not null,
  evidence_source text not null,
  confidence numeric default 0,
  created_at timestamptz default now()
);

create index semantic_evidence_product_id_idx
on semantic_evidence(product_id);

create index semantic_evidence_field_idx
on semantic_evidence(semantic_field);

create index semantic_evidence_type_idx
on semantic_evidence(evidence_type);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
