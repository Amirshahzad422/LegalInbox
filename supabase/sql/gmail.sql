-- ============================================
-- LegalInbox Gmail Integration Migration
-- Apply AFTER schema.sql, seed.sql, and policies.sql.
-- Does not modify existing tables beyond adding one optional column to emails.
-- ============================================

-- Track OAuth tokens per connected Gmail inbox (linked to staff when available)
create table if not exists gmail_connections (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff(id) on delete set null,
  gmail_address text not null unique,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate imports from the same Gmail message
alter table emails
  add column if not exists gmail_message_id text;

create unique index if not exists idx_emails_gmail_message_id
  on emails (gmail_message_id)
  where gmail_message_id is not null;

create index if not exists idx_gmail_connections_staff_id
  on gmail_connections (staff_id);

-- Dev RLS (tighten when Supabase Auth is wired up)
alter table gmail_connections enable row level security;

create policy "Allow all access to gmail_connections for now"
on gmail_connections for all using (true) with check (true);

grant select, insert, update, delete on gmail_connections to anon, authenticated;
