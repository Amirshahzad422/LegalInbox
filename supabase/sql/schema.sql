-- LegalInbox database schema
-- Apply in the Supabase SQL Editor or via the Supabase CLI.
-- ============================================
-- LegalInbox Schema
-- ============================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  name text not null,
  email text not null unique,
  voice_profile text,
  created_at timestamptz not null default now()
);

create table matters (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  name text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'pending')),
  notes text,
  created_at timestamptz not null default now()
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'new_inquiry', 'document_request', 'scheduling',
    'billing', 'court_deadline', 'opposing_counsel', 'spam'
  )),
  body text not null,
  version int not null default 1,
  auto_send_enabled boolean not null default false,
  confidence_threshold numeric(3,2) not null default 0.85,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table emails (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  subject text,
  body text,
  category text check (category in (
    'new_inquiry', 'document_request', 'scheduling',
    'billing', 'court_deadline', 'opposing_counsel', 'spam'
  )),
  urgency_score numeric(3,2),
  matter_id uuid references matters(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  status text not null default 'needs_reply' check (status in (
    'needs_reply', 'drafted', 'replied', 'snoozed'
  )),
  assigned_staff_id uuid references staff(id) on delete set null,
  created_at timestamptz not null default now()
);

create table drafts (
  id uuid primary key default gen_random_uuid(),
  email_id uuid references emails(id) on delete cascade not null,
  template_id uuid references templates(id) on delete set null,
  generated_text text not null,
  confidence_score numeric(3,2),
  auto_send_eligible boolean not null default false,
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'sent', 'auto_sent', 'discarded'
  )),
  created_at timestamptz not null default now()
);

create table template_edits (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references drafts(id) on delete cascade not null,
  template_id uuid references templates(id) on delete set null,
  original_text text not null,
  edited_text text not null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index idx_emails_status on emails(status);
create index idx_emails_category on emails(category);
create index idx_drafts_status on drafts(status);
create index idx_template_edits_template_id on template_edits(template_id);