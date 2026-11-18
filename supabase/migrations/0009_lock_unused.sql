-- Hardening from Supabase's security advisor, for the GitHub Pages site with accounts.
-- The League table and public profiles are the local version's server features; the website
-- never calls them. Nobody signed out may call either. Public profiles are read by the server
-- with full access, so no one else needs them at all; the local League page reads its table as
-- the signed-in learner, so signed-in learners keep that one.
revoke execute on function public.league_table(text) from public, anon;
grant execute on function public.league_table(text) to authenticated;
revoke execute on function public.public_profile(text) from public, anon, authenticated;

-- A trigger function with a fixed search path, so nothing on the caller's path can stand in.
alter function public.keep_newest() set search_path = '';
