-- Local development only. Recreates the parts of Supabase that the migrations
-- rely on (the auth schema, auth.uid() and the standard roles), plus tables for
-- the built-in email/password and magic-link sign-in.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Same definition as Supabase's.
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;

create schema if not exists local_auth;

create table if not exists local_auth.sessions (
  token_hash text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists local_auth.magic_links (
  token_hash text primary key,
  email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

-- Emails the local backend would have sent, readable at /dev/mailbox.
create table if not exists local_auth.mailbox (
  id serial primary key,
  to_email text not null,
  subject text not null,
  body text not null,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists local_auth.migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);
