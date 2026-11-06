-- Phase 3 and 4: placement, Take It Home and the ppc CLI, the Crab League, public profiles.

-- ---------------------------------------------------------------------------
-- Placement: Jobs passed by placement test are 'placed' (open, not shipped).
-- ---------------------------------------------------------------------------
alter table public.job_progress drop constraint if exists job_progress_status_check;
alter table public.job_progress add constraint job_progress_status_check
  check (status in ('not-started', 'in-progress', 'shipped', 'shipped-stretch', 'placed'));

-- ---------------------------------------------------------------------------
-- The ppc CLI signs in with a device code.
-- The CLI holds device_code; the learner types user_code on /device.
-- Only the server (service role) touches these tables.
-- ---------------------------------------------------------------------------
create table public.device_codes (
  device_code_hash text primary key,
  user_code text not null unique,
  user_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  approved_at timestamptz,
  claimed_at timestamptz
);
alter table public.device_codes enable row level security;

create table public.api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_hash text not null unique,
  label text not null default 'ppc',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.api_tokens enable row level security;
create policy "own tokens" on public.api_tokens for select using (user_id = auth.uid());
create policy "revoke own tokens" on public.api_tokens for delete using (user_id = auth.uid());
revoke insert, update on public.api_tokens from authenticated;
revoke all on public.device_codes from authenticated;

-- ---------------------------------------------------------------------------
-- The Crab League: one entry per learner per week, opt-in.
-- The server races each policy on the week's fixed seed and stores the score;
-- other learners see display names and scores only, never the policy.
-- ---------------------------------------------------------------------------
create table public.league_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week text not null check (week ~ '^\d{4}-W\d{2}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  policy jsonb not null,
  score numeric not null,
  finished integer not null default 0,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week)
);
alter table public.league_entries enable row level security;
create policy "own entries" on public.league_entries for select using (user_id = auth.uid());
create policy "withdraw own entry" on public.league_entries for delete using (user_id = auth.uid());
revoke insert, update on public.league_entries from authenticated;

create function public.league_table(for_week text)
returns table (place bigint, display_name text, score numeric, finished integer, entered_at timestamptz, mine boolean)
language sql stable security definer set search_path = public as $$
  select rank() over (order by e.score asc, e.created_at asc) as place,
         e.display_name, e.score, e.finished, e.created_at, coalesce(e.user_id = auth.uid(), false)
  from public.league_entries e
  where e.week = for_week
  order by e.score asc, e.created_at asc
  limit 100
$$;
grant execute on function public.league_table(text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Public profiles: opt-in in settings, at /u/<public_slug>.
-- Shows the display name, character and shipped Jobs. Nothing else.
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_public_slug_format;
alter table public.profiles add constraint profiles_public_slug_format
  check (public_slug is null or public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(public_slug) between 3 and 30);

create function public.public_profile(slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'displayName', p.display_name,
    'character', p.character,
    'slug', p.public_slug,
    'shipped', coalesce((
      select jsonb_agg(jsonb_build_object('jobId', j.job_id, 'status', j.status, 'shippedAt', j.shipped_at) order by j.shipped_at)
      from public.job_progress j
      where j.user_id = p.id and j.status in ('shipped', 'shipped-stretch')
    ), '[]'::jsonb),
    'stories', coalesce((select jsonb_agg(f.flag_id) from public.story_flags f where f.user_id = p.id), '[]'::jsonb)
  )
  from public.profiles p
  where p.public_slug = slug and coalesce((p.settings ->> 'publicProfile')::boolean, false)
$$;
grant execute on function public.public_profile(text) to authenticated, anon;

-- Tables made after 0001's blanket grant need their own; RLS still decides which rows.
grant select, delete on public.api_tokens to authenticated;
grant select, delete on public.league_entries to authenticated;
