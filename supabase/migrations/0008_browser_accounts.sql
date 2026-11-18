-- Accounts from the browser. The site is plain files on GitHub Pages and talks to Supabase
-- directly (lib/supabase), with no server of its own in between, so everything a signed-in
-- learner may do is decided here: by row level security, and by the functions below.
--   - usernames, reserved the moment an account is made;
--   - friends, asked for by username, and what a friend can see (their Shelf);
--   - saving from two devices: an older copy of a row never overwrites a newer one;
--   - the class pages' reads, as functions that run as the caller, so RLS still applies.
-- Runs on Supabase and on the local PGlite database (lib/server/local-bootstrap.sql).
--
-- Functions that must see past RLS (security definer) check auth.uid() themselves and only
-- ever touch the caller's own rows or rows the caller is entitled to. Every function's EXECUTE
-- is revoked from public and anon and granted only to who needs it.

-- ---------------------------------------------------------------------------
-- Usernames
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists username text;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$');
create unique index if not exists profiles_username on public.profiles (username);

-- The profile row, with its username, is made with the account (the username comes from
-- signUp's options.data). A clash fails the sign-up, so nobody can take a name between the
-- availability check and confirming their email. user_metadata is only read here, once, to
-- name the account: it is never used to decide what anyone may do.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  wanted text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
begin
  if wanted = '' then
    return new;
  end if;
  insert into public.profiles (id, username, display_name, updated_at)
  values (new.id, wanted, wanted, 0)
  on conflict (id) do update set username = excluded.username;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Asked on the sign-up form, before there is an account: says only whether a name is free.
create or replace function public.username_available(wanted text) returns boolean
language sql stable security definer set search_path = '' as $$
  select lower(trim(coalesce(wanted, ''))) ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles p where p.username = lower(trim(wanted)))
$$;
revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Saving from two devices: the newest copy of a row wins
-- ---------------------------------------------------------------------------
-- The browser saves rows with plain upserts. A device that was offline may send a row older
-- than the one already saved from another device; this keeps the newer one.
create or replace function public.keep_newest() returns trigger
language plpgsql as $$
begin
  if new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end;
$$;
revoke execute on function public.keep_newest() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['profiles', 'job_progress', 'step_progress', 'code_files', 'review_cards', 'misconceptions', 'drill_bests']
  loop
    execute format('create trigger keep_newest before update on public.%I for each row execute function public.keep_newest()', t);
  end loop;
end $$;

-- Everything a learner has, in one call, as the learner (RLS applies). The newest 30 history
-- entries per file and the newest 2000 reviews, as the server version sends.
create or replace function public.sync_pull() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'profiles', coalesce((select jsonb_agg(to_jsonb(p)) from public.profiles p where p.id = auth.uid()), '[]'::jsonb),
    'job_progress', coalesce((select jsonb_agg(to_jsonb(r)) from public.job_progress r where r.user_id = auth.uid()), '[]'::jsonb),
    'step_progress', coalesce((select jsonb_agg(to_jsonb(r)) from public.step_progress r where r.user_id = auth.uid()), '[]'::jsonb),
    'code_files', coalesce((select jsonb_agg(to_jsonb(r)) from public.code_files r where r.user_id = auth.uid()), '[]'::jsonb),
    'code_snapshots', coalesce((
      select jsonb_agg(to_jsonb(s) - 'rn') from (
        select r.*, row_number() over (partition by r.job_id, r.step_id, r.filename order by r.created_at desc) as rn
        from public.code_snapshots r where r.user_id = auth.uid()
      ) s where s.rn <= 30), '[]'::jsonb),
    'review_cards', coalesce((select jsonb_agg(to_jsonb(r)) from public.review_cards r where r.user_id = auth.uid()), '[]'::jsonb),
    'review_logs', coalesce((
      select jsonb_agg(to_jsonb(r)) from (
        select * from public.review_logs l where l.user_id = auth.uid() order by l.reviewed_at desc limit 2000
      ) r), '[]'::jsonb),
    'misconceptions', coalesce((select jsonb_agg(to_jsonb(r)) from public.misconceptions r where r.user_id = auth.uid()), '[]'::jsonb),
    'drill_bests', coalesce((select jsonb_agg(to_jsonb(r)) from public.drill_bests r where r.user_id = auth.uid()), '[]'::jsonb),
    'collectibles', coalesce((select jsonb_agg(to_jsonb(r)) from public.collectibles r where r.user_id = auth.uid()), '[]'::jsonb),
    'story_flags', coalesce((select jsonb_agg(to_jsonb(r)) from public.story_flags r where r.user_id = auth.uid()), '[]'::jsonb),
    'server_time', (extract(epoch from now()) * 1000)::bigint
  )
$$;
revoke execute on function public.sync_pull() from public, anon;
grant execute on function public.sync_pull() to authenticated;

-- ---------------------------------------------------------------------------
-- Friends
-- ---------------------------------------------------------------------------
-- One row per pair, whoever asked. Nobody reads or writes it directly: the functions below
-- are the only way in, and each one only touches rows the caller is part of.
create table if not exists public.friendships (
  requester uuid not null references auth.users (id) on delete cascade,
  addressee uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (requester, addressee),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_addressee on public.friendships (addressee);
alter table public.friendships enable row level security;
revoke all on public.friendships from public, anon, authenticated;

create or replace function public.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and least(f.requester, f.addressee) = least(a, b)
      and greatest(f.requester, f.addressee) = greatest(a, b)
  )
$$;
revoke execute on function public.is_friend(uuid, uuid) from public, anon, authenticated;

-- Ask someone by username. If they had already asked you, you're friends now.
-- Says 'sent', 'accepted', 'already', 'pending', 'not-found', 'self' or 'signed-out'.
create or replace function public.request_friend(wanted text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  them uuid;
  row_found public.friendships;
begin
  if me is null then
    return 'signed-out';
  end if;
  select p.id into them from public.profiles p where p.username = lower(trim(coalesce(wanted, '')));
  if them is null then
    return 'not-found';
  end if;
  if them = me then
    return 'self';
  end if;
  select * into row_found from public.friendships f
  where least(f.requester, f.addressee) = least(me, them) and greatest(f.requester, f.addressee) = greatest(me, them);
  if found then
    if row_found.status = 'accepted' then
      return 'already';
    end if;
    if row_found.requester = them then
      update public.friendships set status = 'accepted', accepted_at = now()
      where requester = them and addressee = me;
      return 'accepted';
    end if;
    return 'pending';
  end if;
  insert into public.friendships (requester, addressee) values (me, them);
  return 'sent';
end;
$$;
revoke execute on function public.request_friend(text) from public, anon;
grant execute on function public.request_friend(text) to authenticated;

-- Accept or turn down a request someone sent you.
create or replace function public.answer_friend(other uuid, accept boolean) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null then
    return 'signed-out';
  end if;
  if accept then
    update public.friendships set status = 'accepted', accepted_at = now()
    where requester = other and addressee = me and status = 'pending';
  else
    delete from public.friendships where requester = other and addressee = me and status = 'pending';
  end if;
  return case when found then (case when accept then 'accepted' else 'declined' end) else 'not-found' end;
end;
$$;
revoke execute on function public.answer_friend(uuid, boolean) from public, anon;
grant execute on function public.answer_friend(uuid, boolean) to authenticated;

-- Unfriend, or take back a request you sent.
create or replace function public.remove_friend(other uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null then
    return false;
  end if;
  delete from public.friendships
  where (requester = me and addressee = other) or (requester = other and addressee = me);
  return found;
end;
$$;
revoke execute on function public.remove_friend(uuid) from public, anon;
grant execute on function public.remove_friend(uuid) to authenticated;

-- Your friends and requests, each with the other person's name and look.
create or replace function public.my_friends()
returns table (id uuid, username text, display_name text, "character" jsonb, play_as text, status text, incoming boolean, since timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username, p.display_name, p.character, p.settings ->> 'playAs',
         f.status, f.addressee = auth.uid(), coalesce(f.accepted_at, f.created_at)
  from public.friendships f
  join public.profiles p on p.id = case when f.requester = auth.uid() then f.addressee else f.requester end
  where auth.uid() is not null and (f.requester = auth.uid() or f.addressee = auth.uid())
  order by f.status desc, lower(p.display_name), p.username
$$;
revoke execute on function public.my_friends() from public, anon;
grant execute on function public.my_friends() to authenticated;

-- A friend's profile and Shelf: their name, look, and the projects they've shipped. Nothing
-- else of theirs (no settings, no unfinished work). Null unless you're friends (or it's you).
create or replace function public.friend_profile(wanted text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'displayName', p.display_name,
    'character', p.character,
    'playAs', p.settings ->> 'playAs',
    'joinedAt', (extract(epoch from p.created_at) * 1000)::bigint,
    'shipped', coalesce((
      select jsonb_agg(jsonb_build_object('jobId', j.job_id, 'status', j.status, 'shippedAt', j.shipped_at) order by j.shipped_at)
      from public.job_progress j
      where j.user_id = p.id and j.status in ('shipped', 'shipped-stretch')
    ), '[]'::jsonb)
  )
  from public.profiles p
  where auth.uid() is not null
    and p.username = lower(trim(coalesce(wanted, '')))
    and (p.id = auth.uid() or public.is_friend(p.id, auth.uid()))
$$;
revoke execute on function public.friend_profile(text) from public, anon;
grant execute on function public.friend_profile(text) to authenticated;

-- A friend's code for one shipped project (the browser picks the step the Shelf shows).
create or replace function public.friend_code(wanted text, job text)
returns table (step_id text, filename text, content text, updated_at bigint)
language sql stable security definer set search_path = '' as $$
  select c.step_id, c.filename, c.content, c.updated_at
  from public.profiles p
  join public.job_progress j on j.user_id = p.id and j.job_id = job and j.status in ('shipped', 'shipped-stretch')
  join public.code_files c on c.user_id = p.id and c.job_id = job
  where auth.uid() is not null
    and p.username = lower(trim(coalesce(wanted, '')))
    and (p.id = auth.uid() or public.is_friend(p.id, auth.uid()))
  order by c.step_id, c.filename
$$;
revoke execute on function public.friend_code(text, text) from public, anon;
grant execute on function public.friend_code(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Classes, from the browser
-- ---------------------------------------------------------------------------
-- Students can't read their teacher's profile, so a class carries the name it was made under.
alter table public.classes add column if not exists teacher_name text not null default '';

-- The helpers the policies call answer only about the caller; nobody signed out needs them.
revoke execute on function public.teaches(uuid) from public, anon;
revoke execute on function public.in_class(uuid) from public, anon;
revoke execute on function public.owns_class(uuid) from public, anon;
grant execute on function public.teaches(uuid) to authenticated;
grant execute on function public.in_class(uuid) to authenticated;
grant execute on function public.owns_class(uuid) to authenticated;

-- Joining needs the code, not a list of classes. Signed in only.
create or replace function public.join_class(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cls uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  select id into cls from public.classes where join_code = upper(regexp_replace(coalesce(code, ''), '[\s-]', '', 'g'));
  if cls is null then
    raise exception 'No class with that code';
  end if;
  insert into public.class_members (class_id, user_id) values (cls, auth.uid()) on conflict do nothing;
  return cls;
end;
$$;
revoke execute on function public.join_class(text) from public, anon;
grant execute on function public.join_class(text) to authenticated;

-- Make a class: making one is what makes you a teacher. Runs as the caller, so the "teacher
-- manages" and "teachers make classes" policies still decide.
create or replace function public.create_class(class_name text) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  me uuid := auth.uid();
  alphabet constant text := 'BCDFGHJKLMNPQRSTVWXZ23456789';
  code text;
  shown text;
  made uuid;
begin
  if me is null then
    raise exception 'Sign in first';
  end if;
  if char_length(trim(coalesce(class_name, ''))) = 0 then
    raise exception 'The class needs a name';
  end if;
  update public.profiles set role = 'teacher' where id = me and role <> 'teacher';
  select coalesce(nullif(p.display_name, ''), p.username, '') into shown from public.profiles p where p.id = me;
  for attempt in 1..8 loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    begin
      insert into public.classes (teacher_id, name, join_code, teacher_name)
      values (me, left(trim(class_name), 80), code, left(coalesce(shown, ''), 40))
      returning id into made;
      return made;
    exception when unique_violation then
      -- Another class has this code: pick again.
    end;
  end loop;
  raise exception 'Could not find a free join code';
end;
$$;
revoke execute on function public.create_class(text) from public, anon;
grant execute on function public.create_class(text) to authenticated;

-- The classes you teach, with how many students and set projects each has.
create or replace function public.teacher_classes()
returns table (id uuid, name text, join_code text, created_at timestamptz, students integer, assignments integer)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.name, c.join_code, c.created_at,
         (select count(*)::int from public.class_members m where m.class_id = c.id),
         (select count(*)::int from public.assignments a where a.class_id = c.id)
  from public.classes c
  where c.teacher_id = auth.uid()
  order by c.created_at
$$;
revoke execute on function public.teacher_classes() from public, anon;
grant execute on function public.teacher_classes() to authenticated;

-- One class's students: the sums lib/classes/remote.ts turns into the register (as
-- lib/server/classes.ts roster() does). `since` is the start of the week, in ms.
create or replace function public.class_roster(cls uuid, since bigint)
returns table (id uuid, username text, name text, "character" jsonb, play_as text, last_location jsonb, joined_at timestamptz,
               shipped integer, job_time double precision, last_job double precision, step_time double precision,
               week_time double precision, last_step double precision, last_code double precision, jobs jsonb)
language sql stable security invoker set search_path = '' as $$
  select m.user_id, p.username, p.display_name, p.character, p.settings ->> 'playAs', p.last_location, m.joined_at,
         coalesce(j.shipped, 0), coalesce(j.job_time, 0), j.last_job,
         coalesce(s.step_time, 0), coalesce(s.week_time, 0), s.last_step, c.last_code,
         coalesce(j.jobs, '[]'::jsonb)
  from public.class_members m
  join public.classes cl on cl.id = m.class_id and cl.teacher_id = auth.uid()
  left join public.profiles p on p.id = m.user_id
  left join lateral (
    select count(*) filter (where status in ('shipped', 'shipped-stretch'))::int as shipped,
           coalesce(sum(time_spent_seconds), 0)::float8 as job_time, max(updated_at)::float8 as last_job,
           jsonb_agg(jsonb_build_object('jobId', job_id, 'status', status, 'updatedAt', updated_at)) as jobs
    from public.job_progress where user_id = m.user_id) j on true
  left join lateral (
    select coalesce(sum(time_spent_seconds), 0)::float8 as step_time,
           coalesce(sum(time_spent_seconds) filter (where updated_at >= since), 0)::float8 as week_time,
           max(updated_at)::float8 as last_step
    from public.step_progress where user_id = m.user_id) s on true
  left join lateral (select max(updated_at)::float8 as last_code from public.code_files where user_id = m.user_id) c on true
  where m.class_id = cls
  order by lower(coalesce(p.display_name, '')), m.joined_at
$$;
revoke execute on function public.class_roster(uuid, bigint) from public, anon;
grant execute on function public.class_roster(uuid, bigint) to authenticated;

-- A class's set projects, with how many of its students have shipped each.
create or replace function public.class_assignments(cls uuid)
returns table (id uuid, job_id text, due_at timestamptz, created_at timestamptz, shipped integer)
language sql stable security invoker set search_path = '' as $$
  select a.id, a.job_id, a.due_at, a.created_at,
         (select count(*)::int from public.job_progress j
          join public.class_members m on m.user_id = j.user_id and m.class_id = a.class_id
          where j.job_id = a.job_id and j.status in ('shipped', 'shipped-stretch'))
  from public.assignments a
  join public.classes c on c.id = a.class_id and c.teacher_id = auth.uid()
  where a.class_id = cls
  order by a.due_at asc nulls last, a.created_at
$$;
revoke execute on function public.class_assignments(uuid) from public, anon;
grant execute on function public.class_assignments(uuid) to authenticated;

-- Set a project, or change its due date if it's already set.
create or replace function public.set_assignment(cls uuid, job text, due timestamptz) returns boolean
language plpgsql security invoker set search_path = '' as $$
begin
  update public.assignments set due_at = due where class_id = cls and job_id = job;
  if found then
    return true;
  end if;
  insert into public.assignments (class_id, job_id, due_at)
  select cls, job, due where public.owns_class(cls);
  return found;
end;
$$;
revoke execute on function public.set_assignment(uuid, text, timestamptz) from public, anon;
grant execute on function public.set_assignment(uuid, text, timestamptz) to authenticated;

-- One student, for their teacher: each project's sums, and one project's code and latest hand-in.
create or replace function public.student_detail(cls uuid, student uuid, job text) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  member record;
  chosen text := job;
  result jsonb;
begin
  select m.joined_at, p.username, p.display_name, p.character, p.settings ->> 'playAs' as play_as into member
  from public.class_members m
  join public.classes c on c.id = m.class_id and c.teacher_id = auth.uid()
  left join public.profiles p on p.id = m.user_id
  where m.class_id = cls and m.user_id = student;
  if not found then
    return null;
  end if;
  if chosen is null or chosen !~ '^[a-z0-9-]+$' then
    select x.job_id into chosen from (
      select job_id, updated_at from public.job_progress where user_id = student
      union all select job_id, updated_at from public.step_progress where user_id = student
    ) x order by x.updated_at desc limit 1;
  end if;
  result := jsonb_build_object(
    'id', student,
    'username', member.username,
    'name', member.display_name,
    'character', member.character,
    'playAs', member.play_as,
    'joinedAt', (extract(epoch from member.joined_at) * 1000)::bigint,
    'jobId', chosen,
    'jobs', coalesce((select jsonb_agg(to_jsonb(r)) from public.job_progress r where r.user_id = student), '[]'::jsonb),
    'steps', coalesce((
      select jsonb_agg(jsonb_build_object('jobId', job_id, 'passed', passed, 'seen', seen, 'attempts', attempts, 'hints', hints, 'secs', secs, 'updated', updated))
      from (
        select job_id, count(*) filter (where status = 'passed')::int as passed,
               count(*) filter (where seen_solution or status = 'seen-solution')::int as seen,
               coalesce(sum(attempts), 0)::int as attempts, coalesce(sum(hints_used), 0)::int as hints,
               coalesce(sum(time_spent_seconds), 0)::float8 as secs, max(updated_at)::float8 as updated
        from public.step_progress where user_id = student group by job_id
      ) s), '[]'::jsonb),
    'files', coalesce((
      select jsonb_agg(jsonb_build_object('stepId', f.step_id, 'filename', f.filename, 'content', f.content, 'updatedAt', f.updated_at) order by f.step_id, f.filename)
      from public.code_files f where f.user_id = student and f.job_id = chosen), '[]'::jsonb),
    'submission', (
      select jsonb_build_object('stepId', s.step_id, 'kind', s.kind, 'results', s.results, 'createdAt', (extract(epoch from s.created_at) * 1000)::bigint)
      from public.submissions s where s.user_id = student and s.job_id = chosen order by s.created_at desc limit 1)
  );
  return result;
end;
$$;
revoke execute on function public.student_detail(uuid, uuid, text) from public, anon;
grant execute on function public.student_detail(uuid, uuid, text) to authenticated;

-- The classes you're in, and what's set in them.
create or replace function public.my_classes()
returns table (class_id uuid, name text, teacher_name text, joined_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.name, c.teacher_name, m.joined_at
  from public.class_members m join public.classes c on c.id = m.class_id
  where m.user_id = auth.uid()
  order by m.joined_at
$$;
revoke execute on function public.my_classes() from public, anon;
grant execute on function public.my_classes() to authenticated;

create or replace function public.my_assignments()
returns table (id uuid, class_id uuid, class_name text, job_id text, due_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select a.id, c.id, c.name, a.job_id, a.due_at
  from public.assignments a
  join public.classes c on c.id = a.class_id
  join public.class_members m on m.class_id = a.class_id and m.user_id = auth.uid()
  order by a.due_at asc nulls last, a.created_at
$$;
revoke execute on function public.my_assignments() from public, anon;
grant execute on function public.my_assignments() to authenticated;
