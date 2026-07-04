-- ============================================================================
-- GTA6.LLC — Supabase setup (free tier). Run in Supabase → SQL Editor.
-- Only the `subscribers` table is required for the email-capture feature.
-- ============================================================================

-- Email list: the site's #1 long-term asset. Captures launch-alert signups.
create table if not exists subscribers (
  id bigserial primary key,
  email text unique not null,
  source text default 'gta6.llc',
  created_at timestamptz default now()
);

-- Allow anonymous visitors to INSERT their own email (and nothing else).
alter table subscribers enable row level security;

drop policy if exists "anon can subscribe" on subscribers;
create policy "anon can subscribe"
  on subscribers for insert
  to anon
  with check (true);

-- Belt-and-suspenders grants (usually already covered by Supabase defaults, but
-- run these if inserts ever fail with a permission error once the API is up):
grant insert on subscribers to anon;
grant usage, select on sequence subscribers_id_seq to anon;

-- NOTE: no SELECT policy for anon => the public key cannot read the list.
-- You read subscribers from the Supabase dashboard (Table Editor) or with the
-- service_role key server-side. Export them to your email tool anytime.

-- Optional index
create index if not exists idx_subscribers_created on subscribers(created_at desc);
