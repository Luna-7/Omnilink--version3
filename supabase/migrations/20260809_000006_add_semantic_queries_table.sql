-- Migration: Add semantic_queries table
-- Description: Create semantic_queries table for storing parsed semantic queries
-- Created: 2026-08-09

create table semantic_queries (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  parsed_result jsonb not null,
  confidence numeric default 0,
  created_at timestamptz default now()
);

create index semantic_queries_confidence_idx
on semantic_queries(confidence);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
