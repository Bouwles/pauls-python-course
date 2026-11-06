-- Act certificates, a Pro feature. Each has a public verification page at
-- /certificates/<id>; the id is random and unguessable. Only the server writes them.
create table public.certificates (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  act_id text not null,
  act_number integer not null,
  act_title text not null,
  name text not null check (char_length(name) between 1 and 60),
  projects integer not null,
  issued_at timestamptz not null default now(),
  unique (user_id, act_id)
);
alter table public.certificates enable row level security;
revoke all on public.certificates from authenticated;
grant select on public.certificates to authenticated;
create policy "read own certificates" on public.certificates for select using (user_id = auth.uid());
