-- Migration: Add semantic_candidates table
-- Description: Create semantic_candidates table for AI-generated semantic suggestions
-- Created: 2026-08-09

create table semantic_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null,
  candidate_type text not null,
  confidence numeric default 0,
  reason text,
  source text default 'deepseek',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index semantic_candidates_status_idx
on semantic_candidates(status);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
