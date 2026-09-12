-- Migration: Exam Attempts Auto-Save System
-- Purpose: Save exam progress in real-time to allow recovery if student exits accidentally

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Table: exam_attempts
-- Stores active and recent exam attempts with full state for recovery
create table if not exists public.exam_attempts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    
    -- Exam type
    mode text check (mode in ('FULL_SIMULATION', 'ISLAND_SPECIFIC', 'CUSTOM')) not null,
    island_id uuid references public.islands(id),
    
    -- Configuration (serialized from UserIslandConfig)
    -- Example: { topicIds: [...], questionCount: 20, timeLimit: 1800, feedbackMode: 'end' }
    config jsonb not null default '{}',
    
    -- Questions for this attempt (IDs in order, already shuffled)
    question_ids uuid[] not null,
    
    -- Current state
    current_question_index int not null default 0,
    answers jsonb not null default '{}', -- { questionId: selectedOptionIndex }
    flagged jsonb not null default '{}', -- { questionId: boolean }
    time_remaining_seconds int, -- null if no time limit
    
    -- Metadata
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')) default 'IN_PROGRESS'
);

-- Index for performance
create index if not exists idx_exam_attempts_user_status on public.exam_attempts(user_id, status);
create index if not exists idx_exam_attempts_created on public.exam_attempts(created_at);

-- Enable RLS
alter table public.exam_attempts enable row level security;

-- Policies: Users can CRUD their own attempts
create policy "Users can view own exam attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own exam attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exam attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id);

create policy "Users can delete own exam attempts"
  on public.exam_attempts for delete
  using (auth.uid() = user_id);

-- Function: Auto-update updated_at timestamp
create or replace function public.update_exam_attempt_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Trigger: Update timestamp on every update
drop trigger if exists update_exam_attempt_timestamp on public.exam_attempts;
create trigger update_exam_attempt_timestamp
    before update on public.exam_attempts
    for each row
    execute function public.update_exam_attempt_timestamp();

-- Function: Clean up old abandoned attempts (older than 7 days)
create or replace function public.cleanup_old_exam_attempts()
returns int as $$
declare
    deleted_count int;
begin
    delete from public.exam_attempts
    where status = 'ABANDONED'
    and created_at < (now() - interval '7 days');
    
    get diagnostics deleted_count = row_count;
    return deleted_count;
end;
$$ language plpgsql security definer;

-- Grant execute on cleanup function to authenticated users (optional, could be admin-only)
-- grant execute on function public.cleanup_old_exam_attempts() to authenticated;
