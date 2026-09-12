-- LMS kit: tablas e índices (estado final).
-- Requiere 00_extensions.sql.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  license_id text,
  specialty text,
  state text,
  experience_level text,
  interest_area text,
  phone text,
  is_active boolean default false,
  access_requested boolean default false,
  access_requested_at timestamptz,
  has_seen_welcome boolean default false,
  last_login_at timestamptz,
  previous_login_at timestamptz,
  public_photo_url text,
  primary key (id)
);

-- ---------------------------------------------------------------------------
-- courses / modules / lessons
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  is_published boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_published_order
  on public.courses (is_published, order_index);

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete restrict,
  title text not null,
  description text,
  order_index integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  thumbnail_url text,
  prerequisite_module_id uuid references public.modules(id)
);

create index if not exists idx_modules_course_order
  on public.modules (course_id, order_index);
create index if not exists idx_modules_course_published
  on public.modules (course_id, is_published, order_index);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url_camera text,
  video_url_ultrasound text,
  materials jsonb,
  order_index integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  lesson_type varchar(50) default 'video',
  is_master_camera boolean default true,
  thumbnail_url text,
  duration_minutes integer,
  difficulty text,
  prerequisite_lesson_id uuid references public.lessons(id),
  mux_asset_id text,
  mux_playback_id text,
  mux_upload_id text,
  publish_at timestamptz
);

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  status text default 'active' check (status in ('active', 'completed', 'blocked')),
  progress integer default 0,
  created_at timestamptz default now(),
  unique (user_id, module_id)
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'completed', 'blocked', 'cancelled')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists idx_course_enrollments_user_status
  on public.course_enrollments (user_id, status);
create index if not exists idx_course_enrollments_course_status
  on public.course_enrollments (course_id, status);

drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;
create trigger set_course_enrollments_updated_at
  before update on public.course_enrollments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  min_score_to_pass integer default 80,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_option_id text not null,
  score integer default 1,
  order_index integer default 0,
  created_at timestamptz default timezone('utc', now()),
  difficulty integer default 1,
  is_critical boolean default false,
  pearl text,
  source_reference text,
  image_url text,
  findings jsonb default '[]'::jsonb
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  score integer not null,
  passed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,
  selected_option_id text not null,
  selected_option_text text,
  question_text text,
  is_correct boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (attempt_id, question_id)
);

create index if not exists idx_quiz_attempt_answers_attempt
  on public.quiz_attempt_answers (attempt_id);
create index if not exists idx_quiz_attempt_answers_question
  on public.quiz_attempt_answers (question_id, is_correct);

-- ---------------------------------------------------------------------------
-- progress
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  is_completed boolean default false,
  score integer,
  completed_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  unique (user_id, lesson_id)
);

create table if not exists public.video_watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  watched_percentage numeric not null default 0
    check (watched_percentage >= 0 and watched_percentage <= 100),
  last_position_seconds numeric not null default 0,
  total_duration_seconds numeric not null default 0,
  watched_segments jsonb not null default '[]'::jsonb
    check (jsonb_typeof(watched_segments) = 'array'),
  is_fully_watched boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lesson_id)
);

create index if not exists idx_video_watch_progress_user_lesson
  on public.video_watch_progress (user_id, lesson_id);

create table if not exists public.lesson_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_notes_lesson_id_idx on public.lesson_notes (lesson_id);

-- ---------------------------------------------------------------------------
-- operations
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  key varchar(255) primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default timezone('utc', now()),
  updated_by uuid references public.profiles(id)
);

grant select, insert, update on public.app_settings to authenticated;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric not null,
  currency varchar(3) default 'MXN',
  status varchar(50) default 'pending',
  payment_method varchar(100),
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  duration_minutes integer not null default 0,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.certificate_config (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete restrict,
  course_name text not null default 'Curso',
  folio_prefix text not null default 'CERT-',
  course_hours text not null default '40',
  institutional_text text default 'Se otorga el presente certificado por haber completado satisfactoriamente el programa.',
  primary_color text default '#0ea5e9',
  border_style text default 'double',
  orientation text default 'landscape',
  signers jsonb default '[{"name":"Director del Curso","role":"Director","signature_url":null}]'::jsonb,
  auto_issue boolean default true,
  min_progress integer default 100,
  require_evaluations boolean default true,
  updated_at timestamptz default now(),
  element_layout jsonb,
  background_url text
);

create index if not exists idx_certificate_config_course
  on public.certificate_config (course_id);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  issue_date timestamptz default now(),
  certificate_url text,
  folio text unique,
  recipient_name text,
  recipient_email text,
  course_name text,
  course_hours text,
  issued_by text default 'Sistema',
  pdf_url text,
  storage_path text,
  qr_url text,
  is_manual boolean default false,
  notes text,
  created_at timestamptz default now()
);

create unique index if not exists certificates_module_idx
  on public.certificates (user_id, module_id)
  where module_id is not null;
create unique index if not exists certificates_course_global_idx
  on public.certificates (user_id, course_id)
  where module_id is null and course_id is not null;
create index if not exists idx_certificates_course_user
  on public.certificates (course_id, user_id);

create table if not exists public.certificate_issue_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  certificate_id uuid references public.certificates(id) on delete set null,
  source text not null default 'auto',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_certificate_issue_events_unprocessed
  on public.certificate_issue_events (created_at)
  where processed_at is null;

-- ---------------------------------------------------------------------------
-- live + notifications
-- ---------------------------------------------------------------------------
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text,
  session_date timestamptz not null,
  zoom_link text,
  status varchar(50) default 'scheduled',
  created_at timestamptz default timezone('utc', now()),
  meeting_url text default '',
  platform text default 'zoom',
  duration_minutes integer default 60,
  is_published boolean default false,
  send_to_all boolean default true,
  created_by uuid,
  mux_live_stream_id text,
  mux_playback_id text,
  mux_stream_key text,
  mux_recording_asset_id text,
  mux_recording_playback_id text,
  recording_lesson_id uuid references public.lessons(id) on delete set null,
  target_module_id uuid references public.modules(id) on delete set null,
  started_at timestamptz,
  ended_at timestamptz,
  session_mode text default 'broadcast',
  rtc_provider text,
  rtc_room_name text,
  rtc_room_id text,
  rtc_ingress_id text,
  rtc_ingress_url text,
  rtc_stream_key text,
  rtc_status text default 'scheduled',
  host_join_token_expires_at timestamptz,
  recording_provider text,
  recording_job_id text,
  setup_started_at timestamptz,
  setup_completed_at timestamptz
);

create index if not exists live_sessions_rtc_room_name_idx on public.live_sessions (rtc_room_name);
create index if not exists live_sessions_mux_live_stream_id_idx on public.live_sessions (mux_live_stream_id);
create index if not exists live_sessions_target_module_id_idx on public.live_sessions (target_module_id);
create index if not exists live_sessions_recording_lesson_id_idx on public.live_sessions (recording_lesson_id);

create table if not exists public.session_recipients (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (session_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'live_session',
  reference_id uuid,
  is_read boolean default false,
  created_at timestamptz default now(),
  url text,
  audience text not null default 'outbound' check (audience in ('inbound', 'outbound')),
  category text,
  action text,
  severity text default 'info' check (severity in ('info', 'warning', 'critical')),
  actor_user_id uuid references public.profiles(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_notifications_user_audience_read
  on public.notifications (user_id, audience, is_read, created_at desc);
create index if not exists idx_notifications_audience_category
  on public.notifications (audience, category, created_at desc);

-- ---------------------------------------------------------------------------
-- assignments / surveys
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  instructions text,
  due_date timestamptz,
  is_published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  file_url text,
  file_name text,
  status text default 'pending' check (status in ('pending', 'submitted', 'graded')),
  grade numeric,
  feedback text,
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz default timezone('utc', now()),
  unique (assignment_id, student_id)
);

create table if not exists public.custom_surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_custom_surveys_updated_at on public.custom_surveys;
create trigger set_custom_surveys_updated_at
  before update on public.custom_surveys
  for each row execute function public.set_updated_at();

create table if not exists public.custom_survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.custom_surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null
    check (question_type in ('text', 'textarea', 'single_choice', 'multiple_choice', 'rating')),
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.custom_surveys(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (survey_id, student_id)
);

create table if not exists public.custom_survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.custom_survey_responses(id) on delete cascade,
  question_id uuid not null references public.custom_survey_questions(id) on delete cascade,
  answer jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now(),
  unique (response_id, question_id)
);

create index if not exists idx_custom_surveys_published_created
  on public.custom_surveys (is_published, created_at desc);
create index if not exists idx_custom_survey_questions_survey_order
  on public.custom_survey_questions (survey_id, order_index);
create index if not exists idx_custom_survey_responses_survey_submitted
  on public.custom_survey_responses (survey_id, submitted_at desc);
create index if not exists idx_custom_survey_responses_student
  on public.custom_survey_responses (student_id);
create index if not exists idx_custom_survey_answers_response
  on public.custom_survey_answers (response_id);

-- ---------------------------------------------------------------------------
-- community
-- ---------------------------------------------------------------------------
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'General',
  is_pinned boolean default false,
  is_official boolean default false,
  reply_count integer default 0,
  like_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.forum_threads drop constraint if exists fk_forum_threads_profiles;
alter table public.forum_threads
  add constraint fk_forum_threads_profiles
  foreign key (author_id) references public.profiles(id) on delete cascade;

create index if not exists idx_forum_threads_created on public.forum_threads (created_at desc);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  like_count integer default 0,
  created_at timestamptz default now()
);

alter table public.forum_posts drop constraint if exists fk_forum_posts_profiles;
alter table public.forum_posts
  add constraint fk_forum_posts_profiles
  foreign key (author_id) references public.profiles(id) on delete cascade;

create index if not exists idx_forum_posts_thread on public.forum_posts (thread_id);

create table if not exists public.forum_thread_likes (
  user_id uuid references auth.users(id) on delete cascade,
  thread_id uuid references public.forum_threads(id) on delete cascade,
  primary key (user_id, thread_id)
);

create table if not exists public.micro_lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration_minutes integer default 5,
  category text default 'General',
  thumbnail_url text,
  video_url text,
  is_published boolean default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lesson_comments_lesson
  on public.lesson_comments (lesson_id, created_at);

-- ---------------------------------------------------------------------------
-- attendance (no existía en migraciones; la app ya lo usa)
-- ---------------------------------------------------------------------------
create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  workshop_date timestamptz,
  location text,
  is_active boolean not null default true,
  linked_lesson_id uuid references public.lessons(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_attendance (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_by uuid references public.profiles(id) on delete set null,
  method text not null default 'manual'
    check (method in ('qr', 'manual', 'video_completion')),
  checked_in_at timestamptz not null default now(),
  unique (workshop_id, student_id)
);

create index if not exists idx_workshop_attendance_student
  on public.workshop_attendance (student_id);

-- ---------------------------------------------------------------------------
-- push
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

notify pgrst, 'reload schema';
