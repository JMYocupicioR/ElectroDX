-- Migration: Assigned Exams (Custom Exams)
-- Purpose: Schema for tracking exams assigned directly to students by an administrator

create extension if not exists "uuid-ossp";

create table if not exists public.assigned_exams (
    id uuid primary key default uuid_generate_v4(),
    admin_id uuid references auth.users(id) on delete set null,
    student_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    islands uuid[] not null default '{}',
    topics uuid[] default '{}',
    status text check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED')) default 'PENDING',
    score_percentage numeric(5,2),
    exam_session_id uuid references public.exam_sessions(id) on delete set null,
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- Indices for faster querying
create index if not exists idx_assigned_exams_student on public.assigned_exams(student_id);
create index if not exists idx_assigned_exams_status on public.assigned_exams(status);

-- Enable RLS
alter table public.assigned_exams enable row level security;

-- Policies

-- 1. Students can view and update their own assigned exams (e.g., mark as IN_PROGRESS or COMPLETED)
drop policy if exists "Students can view own assigned exams" on public.assigned_exams;
create policy "Students can view own assigned exams"
    on public.assigned_exams for select
    using (auth.uid() = student_id);

drop policy if exists "Students can update own assigned exams" on public.assigned_exams;
create policy "Students can update own assigned exams"
    on public.assigned_exams for update
    using (auth.uid() = student_id)
    with check (auth.uid() = student_id);

-- 2. Admins can full CRUD on all assigned exams.
-- Note: Replace or complement this with a proper role check if `user_roles` exists and is used reliably.
-- This uses a subquery to see if the user has an 'admin' role, or fallback to the master email.
drop policy if exists "Admins can manage assigned exams" on public.assigned_exams;
create policy "Admins can manage assigned exams"
    on public.assigned_exams for all
    using (public.is_admin(auth.uid()));

-- Optional: Function to auto-update 'completed_at' when status is set to COMPLETED
create or replace function public.handle_assigned_exam_completion()
returns trigger as $$
begin
    if NEW.status = 'COMPLETED' and OLD.status != 'COMPLETED' then
        NEW.completed_at = timezone('utc'::text, now());
    end if;
    return NEW;
end;
$$ language plpgsql;

drop trigger if exists on_assigned_exam_completed on public.assigned_exams;
create trigger on_assigned_exam_completed
    before update on public.assigned_exams
    for each row execute function public.handle_assigned_exam_completion();
