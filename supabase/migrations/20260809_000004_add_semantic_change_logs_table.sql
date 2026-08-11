-- Migration: Add semantic_change_logs table
-- Description: Create semantic_change_logs table for tracking knowledge mutations
-- Created: 2026-08-09

create table semantic_change_logs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references semantic_candidates(id) on delete cascade,
  change_type text not null,
  before_state jsonb default '{}',
  after_state jsonb default '{}',
  operator text default 'system',
  status text default 'processing',
  created_at timestamptz default now()
);

create index semantic_change_logs_candidate_idx
on semantic_change_logs(candidate_id);

create index semantic_change_logs_status_idx
on semantic_change_logs(status);

-- Add to drop list for future reference
-- Note: This table should be added to the DROP TABLE IF EXISTS list in supabase-schema.sql
