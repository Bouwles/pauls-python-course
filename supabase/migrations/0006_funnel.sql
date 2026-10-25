-- Funnel analytics (REDESIGN.md 9.3): self-hosted, no third-party trackers. A visitor is a
-- random id kept in the browser; once someone signs in, their user id is kept too. Only the
-- server writes here, and only the owner's metrics page reads it.
create table public.funnel_events (
  id bigserial primary key,
  event text not null check (event in (
    'visit-landing', 'guest-start', 'sign-up', 'ship-1', 'ship-5', 'ship-capstone',
    'view-paywall', 'start-checkout', 'subscribe', 'cancel'
  )),
  visitor text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index funnel_events_by_event on public.funnel_events (event, created_at);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from authenticated;
