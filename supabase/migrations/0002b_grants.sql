-- For databases that ran 0002 before it had its grants (repeating them is harmless).
grant select, delete on public.api_tokens to authenticated;
grant select, delete on public.league_entries to authenticated;

-- Tables added by later migrations get the usual grants; RLS decides which rows.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
