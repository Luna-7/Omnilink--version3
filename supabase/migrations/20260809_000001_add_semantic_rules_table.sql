-- Migration: Add semantic_rules table
-- Description: Create semantic_rules table for reasoning engine
-- Created: 2026-08-09

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

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
