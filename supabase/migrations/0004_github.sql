-- One-click push of the Shelf to a new GitHub repository (Section 8.7).
-- Tokens are encrypted by the server and never readable by the learner's browser.
create table public.github_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  token_enc text not null,
  login text not null,
  created_at timestamptz not null default now()
);
alter table public.github_tokens enable row level security;
revoke all on public.github_tokens from authenticated;
