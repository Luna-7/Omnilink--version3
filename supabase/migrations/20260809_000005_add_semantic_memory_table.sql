-- Migration: Add semantic_memory table
-- Description: Create semantic_memory table for persistent semantic evolution memory
-- Created: 2026-08-09

create table semantic_memory (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  memory_type text not null,
  content jsonb not null,
  source text default 'system',
  created_at timestamptz default now()
);

create index semantic_memory_entity_type_idx
on semantic_memory(entity_type);

create index semantic_memory_entity_id_idx
on semantic_memory(entity_id);

create index semantic_memory_memory_type_idx
on semantic_memory(memory_type);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
