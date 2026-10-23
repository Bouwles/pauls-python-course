-- Phase 4: teacher and class mode (Section 8.10).
-- The tables and the read policies for teachers are in 0001. This adds the
-- rules the routes rely on, so they hold in the database and not only in code.

-- One assignment per Job per class; assigning it again changes the due date.
create unique index if not exists assignments_class_job on public.assignments (class_id, job_id);

-- Join codes: six characters from the consonants (no Y) and the digits 2 to 9, so no
-- character reads as another (no O and 0, no I and 1) and codes don't spell words.
alter table public.classes drop constraint if exists classes_join_code_format;
alter table public.classes add constraint classes_join_code_format
  check (join_code ~ '^[BCDFGHJKLMNPQRSTVWXZ2-9]{6}$') not valid;

-- Only accounts that have switched on "I teach a class" can make a class.
-- Restrictive, so it narrows the existing "teacher manages" policy instead of widening it.
drop policy if exists "teachers make classes" on public.classes;
create policy "teachers make classes" on public.classes as restrictive for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'));

