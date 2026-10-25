-- Fixwick: learner data.
-- Runs unchanged on Supabase and on the local PGlite development database.
-- Times are milliseconds since the epoch (bigint), matching the client's local store,
-- so sync compares like with like.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  character jsonb,
  settings jsonb not null default '{}'::jsonb,
  experience text check (experience in ('none', 'some', 'lots')),
  last_location jsonb,
  onboarded boolean not null default false,
  role text not null default 'learner' check (role in ('learner', 'teacher')),
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at bigint not null default 0
);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------
create table public.job_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  status text not null check (status in ('not-started', 'in-progress', 'shipped', 'shipped-stretch')),
  started_at bigint,
  shipped_at bigint,
  stretch_done text[] not null default '{}',
  time_spent_seconds integer not null default 0,
  updated_at bigint not null,
  primary key (user_id, job_id)
);

create table public.step_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  step_id text not null,
  status text not null check (status in ('not-started', 'in-progress', 'passed', 'seen-solution')),
  attempts integer not null default 0,
  hints_used integer not null default 0,
  seen_solution boolean not null default false,
  predict_choice text,
  self_explanation text check (char_length(self_explanation) <= 4000),
  self_rating text check (self_rating in ('had', 'partly', 'missed')),
  time_spent_seconds integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  updated_at bigint not null,
  primary key (user_id, job_id, step_id)
);

create table public.code_files (
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  step_id text not null,
  filename text not null,
  content text not null check (char_length(content) <= 200000),
  cursor integer,
  updated_at bigint not null,
  primary key (user_id, job_id, step_id, filename)
);

create table public.code_snapshots (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  job_id text not null,
  step_id text not null,
  filename text not null,
  content text not null check (char_length(content) <= 200000),
  reason text not null check (reason in ('run', 'check', 'manual', 'conflict', 'restore')),
  created_at bigint not null,
  primary key (user_id, id)
);
create index code_snapshots_by_file on public.code_snapshots (user_id, job_id, step_id, filename, created_at desc);

-- ---------------------------------------------------------------------------
-- Review deck (FSRS)
-- ---------------------------------------------------------------------------
create table public.review_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null,
  concept_id text not null,
  due bigint not null,
  stability double precision not null,
  difficulty double precision not null,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state integer not null default 0,
  last_review bigint,
  updated_at bigint not null,
  primary key (user_id, card_id)
);
create index review_cards_due on public.review_cards (user_id, due);

create table public.review_logs (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  card_id text not null,
  rating integer not null check (rating between 1 and 4),
  reviewed_at bigint not null,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  primary key (user_id, id)
);

create table public.misconceptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  misconception_id text not null,
  count integer not null default 0,
  last_seen_at bigint not null,
  last_addressed_at bigint,
  updated_at bigint not null,
  primary key (user_id, misconception_id)
);

-- ---------------------------------------------------------------------------
-- Drills, collectibles, story
-- ---------------------------------------------------------------------------
create table public.drill_bests (
  user_id uuid not null references auth.users (id) on delete cascade,
  drill_id text not null,
  best_ms integer not null,
  achieved_at bigint not null,
  updated_at bigint not null,
  primary key (user_id, drill_id)
);

create table public.collectibles (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  found_at bigint not null,
  primary key (user_id, item_id)
);

create table public.story_flags (
  user_id uuid not null references auth.users (id) on delete cascade,
  flag_id text not null,
  set_at bigint not null,
  primary key (user_id, flag_id)
);

-- ---------------------------------------------------------------------------
-- Submissions (Take It Home uploads, server-verified checks) and analytics
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id text not null,
  step_id text,
  kind text not null check (kind in ('browser', 'local', 'upload')),
  results jsonb not null default '{}'::jsonb,
  storage_path text,
  created_at timestamptz not null default now()
);

create table public.events (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at bigint not null,
  primary key (user_id, id)
);
create index events_by_type on public.events (type, created_at);

-- Paid tier, when there is one. Written only by the service role.
create table public.entitlements (
  user_id uuid not null references auth.users (id) on delete cascade,
  entitlement text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, entitlement)
);

-- ---------------------------------------------------------------------------
-- Teacher and class mode (Phase 4; the shape is fixed now)
-- ---------------------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  job_id text not null,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- True when the signed-in user teaches a class this learner has joined.
create function public.teaches(learner uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m
    join public.classes c on c.id = m.class_id
    where m.user_id = learner and c.teacher_id = auth.uid()
  );
$$;

create function public.in_class(cls uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members m where m.class_id = cls and m.user_id = auth.uid());
$$;

create function public.owns_class(cls uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes c where c.id = cls and c.teacher_id = auth.uid());
$$;

alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "teacher reads profile" on public.profiles for select using (public.teaches(id));

do $$
declare t text;
begin
  foreach t in array array['job_progress', 'step_progress', 'code_files', 'code_snapshots', 'review_cards',
                           'review_logs', 'misconceptions', 'drill_bests', 'collectibles', 'story_flags', 'events']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- Teachers see progress, results and code for learners in their classes, read-only.
create policy "teacher reads" on public.job_progress for select using (public.teaches(user_id));
create policy "teacher reads" on public.step_progress for select using (public.teaches(user_id));
create policy "teacher reads" on public.code_files for select using (public.teaches(user_id));

alter table public.submissions enable row level security;
create policy "own submissions" on public.submissions for select using (user_id = auth.uid());
create policy "add own submissions" on public.submissions for insert with check (user_id = auth.uid());
create policy "teacher reads" on public.submissions for select using (public.teaches(user_id));

alter table public.entitlements enable row level security;
create policy "read own entitlements" on public.entitlements for select using (user_id = auth.uid());

alter table public.classes enable row level security;
create policy "teacher manages" on public.classes for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "members read" on public.classes for select using (public.in_class(id));

alter table public.class_members enable row level security;
create policy "member reads own" on public.class_members for select using (user_id = auth.uid());
create policy "member leaves" on public.class_members for delete using (user_id = auth.uid());
create policy "teacher reads members" on public.class_members for select using (public.owns_class(class_id));
create policy "teacher removes members" on public.class_members for delete using (public.owns_class(class_id));

alter table public.assignments enable row level security;
create policy "teacher manages" on public.assignments for all using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy "members read" on public.assignments for select using (public.in_class(class_id));

-- Joining needs the code, not a list of classes, so it goes through a function.
create function public.join_class(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cls uuid;
begin
  select id into cls from public.classes where join_code = upper(trim(code));
  if cls is null then
    raise exception 'No class with that code';
  end if;
  insert into public.class_members (class_id, user_id) values (cls, auth.uid()) on conflict do nothing;
  return cls;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.entitlements from authenticated;
grant execute on function public.join_class(text) to authenticated;
