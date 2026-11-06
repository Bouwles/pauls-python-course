-- Pro subscriptions. Webhooks from the payments provider are the source
-- of truth: only the server (the service role) writes these tables. A learner can read
-- their own entitlement, nothing else.

-- 0001 left a placeholder table with this name and nothing in it; this is the real shape.
drop table if exists public.entitlements cascade;
create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('pro-monthly', 'pro-yearly', 'founder')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  provider text not null,
  provider_customer_id text,
  provider_subscription_id text,
  -- When the provider says the change happened: older events arriving late are ignored.
  event_time timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.entitlements enable row level security;
revoke all on public.entitlements from authenticated;
grant select on public.entitlements to authenticated;
create policy "read own entitlement" on public.entitlements for select using (user_id = auth.uid());

-- Every webhook event handled, so a retried delivery is applied once (idempotency).
create table public.payment_events (
  provider text not null,
  event_id text not null,
  type text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);
alter table public.payment_events enable row level security;
revoke all on public.payment_events from authenticated;

-- Classroom seats: a teacher buys a number of seats for a class; learners who join the
-- class with its code take a seat and have Pro until the seats expire.
create table public.seat_pools (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  seats integer not null check (seats > 0),
  expires_at timestamptz not null,
  provider text not null,
  provider_subscription_id text unique,
  created_at timestamptz not null default now()
);
alter table public.seat_pools enable row level security;
revoke all on public.seat_pools from authenticated;
grant select on public.seat_pools to authenticated;
create policy "teacher reads own seats" on public.seat_pools for select using (teacher_id = auth.uid());

create table public.seat_grants (
  pool_id uuid not null references public.seat_pools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (pool_id, user_id)
);
alter table public.seat_grants enable row level security;
revoke all on public.seat_grants from authenticated;
grant select on public.seat_grants to authenticated;
create policy "read own seat" on public.seat_grants for select using (user_id = auth.uid());
create policy "teacher reads seats in own pools" on public.seat_grants for select
  using (exists (select 1 from public.seat_pools p where p.id = pool_id and p.teacher_id = auth.uid()));

-- Purchases by learners under 18 need an adult's say-so: recorded with the checkout.
create table public.checkout_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null,
  confirmed text not null check (confirmed in ('adult', 'guardian')),
  created_at timestamptz not null default now()
);
alter table public.checkout_consents enable row level security;
revoke all on public.checkout_consents from authenticated;
