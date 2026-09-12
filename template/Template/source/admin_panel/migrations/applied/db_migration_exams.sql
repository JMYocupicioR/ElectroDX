-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Table: exam_sessions
-- Tracks a user's attempt at an exam (either full simulation or island specific)
create table if not exists public.exam_sessions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    mode text check (mode in ('FULL_SIMULATION', 'ISLAND_SPECIFIC', 'CUSTOM')) not null,
    island_id uuid references public.islands(id), -- Null if FULL_SIMULATION
    total_questions int not null default 0,
    correct_answers int not null default 0,
    score_percentage numeric(5,2) not null default 0,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone, -- Null if in progress (though for MVP we might insert only on completion)
    status text check (status in ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')) default 'IN_PROGRESS'
);

-- Enable RLS for exam_sessions
alter table public.exam_sessions enable row level security;

-- Policy: Users can view and insert their own sessions
create policy "Users can view own exam sessions"
  on public.exam_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own exam sessions"
  on public.exam_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exam sessions"
  on public.exam_sessions for update
  using (auth.uid() = user_id);


-- Table: exam_answers
-- detailed record of every answer given in an exam
create table if not exists public.exam_answers (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.exam_sessions(id) on delete cascade not null,
    question_id uuid references public.questions(id) not null,
    topic_id uuid references public.topics(id), -- Denormalized for easier analytics later
    island_id uuid references public.islands(id), -- Denormalized for easier analytics later
    selected_option_index int not null,
    is_correct boolean not null,
    time_spent_seconds int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for exam_answers
alter table public.exam_answers enable row level security;

-- Policy: Users can view and insert their own answers (via session ownership)
create policy "Users can view own exam answers"
  on public.exam_answers for select
  using (
    exists (
      select 1 from public.exam_sessions
      where public.exam_sessions.id = public.exam_answers.session_id
      and public.exam_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own exam answers"
  on public.exam_answers for insert
  with check (
    exists (
      select 1 from public.exam_sessions
      where public.exam_sessions.id = session_id
      and public.exam_sessions.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_exam_sessions_user_id on public.exam_sessions(user_id);
create index if not exists idx_exam_answers_session_id on public.exam_answers(session_id);
