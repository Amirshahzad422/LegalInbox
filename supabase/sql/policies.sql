-- ============================================
-- LegalInbox RLS Policies & Grants
-- Note: These are intentionally permissive for development.
-- Must be tightened once Supabase Auth is wired up (Staff task).
-- ============================================

alter table emails enable row level security;
create policy "Allow all access to emails for now"
on emails for all using (true) with check (true);

alter table staff enable row level security;
create policy "Allow all access to staff for now"
on staff for all using (true) with check (true);

alter table matters enable row level security;
create policy "Allow all access to matters for now"
on matters for all using (true) with check (true);

alter table clients enable row level security;
create policy "Allow all access to clients for now"
on clients for all using (true) with check (true);

alter table templates enable row level security;
create policy "Allow all access to templates for now"
on templates for all using (true) with check (true);

alter table drafts enable row level security;
create policy "Allow all access to drafts for now"
on drafts for all using (true) with check (true);

alter table template_edits enable row level security;
create policy "Allow all access to template_edits for now"
on template_edits for all using (true) with check (true);

-- Table-level grants (needed since tables were created via SQL Editor,
-- which doesn't auto-attach Supabase's default grants)
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;