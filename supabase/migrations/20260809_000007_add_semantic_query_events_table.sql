-- Migration: Add semantic_query_events table
-- Description: Create semantic_query_events table for tracking semantic query analytics
-- Created: 2026-08-09

create table semantic_query_events (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  parsed_intent text,
  matched_product_ids jsonb default '[]',
  matched_concepts jsonb default '[]',
  confidence numeric default 0,
  source text default 'agent_api',
  created_at timestamptz default now()
);

create index semantic_query_events_product_ids_idx
on semantic_query_events using gin(matched_product_ids);

create index semantic_query_events_created_at_idx
on semantic_query_events(created_at desc);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
