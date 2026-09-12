-- Migration: 0001_analytics_triggers.sql
-- Purpose: Automate Mastery Score calculation and refine Admin permissions.

-- 1. Helper Function to calculate score per Island
-- Formula: (Total Successes / Total Critical Questions Attempted) * 100 
-- Or simpler: (Successes / Attempts) * 100 for all questions in that island.
create or replace function public.update_island_mastery()
returns trigger as $$
declare
  q_island_id uuid;
  total_attempts int;
  total_successes int;
  new_score numeric;
begin
  -- Get the island_id for the question that was just answered
  select t.island_id into q_island_id
  from public.questions q
  join public.topics t on q.topic_id = t.id
  where q.id = new.question_id;

  -- Calculate agg stats for this user on this island
  select 
    coalesce(sum(up.attempts), 0),
    coalesce(sum(up.successes), 0)
  into total_attempts, total_successes
  from public.user_progress up
  join public.questions q on up.question_id = q.id
  join public.topics t on q.topic_id = t.id
  where up.user_id = new.user_id
  and t.island_id = q_island_id;

  -- Avoid division by zero
  if total_attempts > 0 then
    new_score := (total_successes::numeric / total_attempts::numeric) * 100;
  else
    new_score := 0;
  end if;

  -- Upsert into mastery_scores
  insert into public.mastery_scores (user_id, island_id, score, last_updated)
  values (new.user_id, q_island_id, new_score, now())
  on conflict (user_id, island_id)
  do update set 
    score = excluded.score,
    last_updated = excluded.last_updated;

  return new;
end;
$$ language plpgsql security definer;

-- 2. Trigger on User Progress
drop trigger if exists on_progress_update on public.user_progress;
create trigger on_progress_update
after insert or update on public.user_progress
for each row execute function public.update_island_mastery();

-- 3. Admin Policies for Analytics
-- Allow Admin (jmyocupicior@gmail.com) to read ALL mastery scores (for class analytics)
create policy "Admins can view all mastery scores" on public.mastery_scores
  for select using (
    auth.uid() in (select id from auth.users where email = 'jmyocupicior@gmail.com')
  );

-- Allow Admin to read ALL user progress (for detailed analytics if needed)
create policy "Admins can view all user progress" on public.user_progress
  for select using (
    auth.uid() in (select id from auth.users where email = 'jmyocupicior@gmail.com')
  );
