-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Islands (The Learning Path)
create table public.islands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  "order" int not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Topics (Sub-sections of Islands)
create table public.topics (
  id uuid primary key default uuid_generate_v4(),
  island_id uuid references public.islands(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Questions (The Core Content)
create type question_type as enum ('CASE', 'CONCEPT');

create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references public.topics(id) on delete cascade not null,
  type question_type not null default 'CASE',
  content jsonb not null, -- Stores stem, findings, options
  difficulty int check (difficulty >= 1 and difficulty <= 5) not null default 1,
  is_critical boolean default false,
  pearl text, -- "Council Pearl"
  source_reference text,
  reviewer_id uuid references auth.users(id), -- Nullable until reviewed
  status text default 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. User Progress (Tracking individual questions)
create table public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  attempts int default 0,
  successes int default 0,
  last_attempt timestamp with time zone,
  next_review_date timestamp with time zone default timezone('utc'::text, now()), -- For SRM
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

-- 5. Mastery Scores (Gap Analysis Aggregation)
create table public.mastery_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  island_id uuid references public.islands(id) on delete cascade not null,
  score numeric default 0, -- 0 to 100
  last_updated timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, island_id)
);

-- RLS (Row Level Security)
alter table public.islands enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.user_progress enable row level security;
alter table public.mastery_scores enable row level security;

-- Policies

-- Islands/Topics/Questions: Visible to everyone (Read-only for public)
create policy "Islands are viewable by everyone" on public.islands for select using (true);
create policy "Topics are viewable by everyone" on public.topics for select using (true);
create policy "Questions are viewable by everyone" on public.questions for select using (status = 'PUBLISHED');

-- Secure Write Access for Admin (You)
-- NOTE: Replace 'YOUR_USER_ID_HERE' with your actual Supabase User ID or use a role-based approach
-- For now, we allow authenticated users to read. Writing is restricted.
-- Ideally, you'd create a custom claim or table for admins.
-- For this MVP, we will assume manual SQL execution or a specific admin user check in application logic.
-- A simple policy for now:
create policy "Admins can insert/update questions" on public.questions
  for all using (auth.uid() in (select id from auth.users where email = 'jmyocupicior@gmail.com'));


-- User Progress & Mastery: Users can only see/edit their own data
create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can update own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);
  
create policy "Users can update own progress update" on public.user_progress
  for update using (auth.uid() = user_id);

create policy "Users can view own mastery" on public.mastery_scores
  for select using (auth.uid() = user_id);

-- Indexes for performance
create index idx_questions_island on public.questions(topic_id);
create index idx_user_progress_review on public.user_progress(user_id, next_review_date);
