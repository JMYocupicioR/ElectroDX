-- LMS kit: RLS. Requiere 01_schema.sql.
-- Helper mental: is_admin = exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.video_watch_progress enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.app_settings enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.certificate_config enable row level security;
alter table public.certificates enable row level security;
alter table public.certificate_issue_events enable row level security;
alter table public.live_sessions enable row level security;
alter table public.session_recipients enable row level security;
alter table public.notifications enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.custom_surveys enable row level security;
alter table public.custom_survey_questions enable row level security;
alter table public.custom_survey_responses enable row level security;
alter table public.custom_survey_answers enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_thread_likes enable row level security;
alter table public.micro_lessons enable row level security;
alter table public.lesson_comments enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_attendance enable row level security;
alter table public.push_subscriptions enable row level security;

-- profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins can update any profile." on public.profiles;
create policy "Admins can update any profile."
  on public.profiles for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- modules / lessons / courses
drop policy if exists "Modules are viewable by authenticated users." on public.modules;
create policy "Modules are viewable by authenticated users."
  on public.modules for select to authenticated using (true);
drop policy if exists "Admins can insert modules." on public.modules;
create policy "Admins can insert modules."
  on public.modules for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can update modules." on public.modules;
create policy "Admins can update modules."
  on public.modules for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can delete modules." on public.modules;
create policy "Admins can delete modules."
  on public.modules for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Lessons are viewable by authenticated users." on public.lessons;
create policy "Lessons are viewable by authenticated users."
  on public.lessons for select to authenticated using (true);
drop policy if exists "Admins can manage lessons." on public.lessons;
create policy "Admins can manage lessons."
  on public.lessons for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Published courses are viewable by authenticated users" on public.courses;
create policy "Published courses are viewable by authenticated users"
  on public.courses for select to authenticated using (is_published = true);
drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- enrollments
drop policy if exists "Users can view their own enrollments." on public.enrollments;
create policy "Users can view their own enrollments."
  on public.enrollments for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins can view all enrollments." on public.enrollments;
create policy "Admins can view all enrollments."
  on public.enrollments for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can manage enrollments." on public.enrollments;
create policy "Admins can manage enrollments."
  on public.enrollments for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can view own course enrollments" on public.course_enrollments;
create policy "Users can view own course enrollments"
  on public.course_enrollments for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins can view all course enrollments" on public.course_enrollments;
create policy "Admins can view all course enrollments"
  on public.course_enrollments for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can manage course enrollments" on public.course_enrollments;
create policy "Admins can manage course enrollments"
  on public.course_enrollments for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- quizzes
drop policy if exists "Quizzes son visibles para usuarios autenticados." on public.quizzes;
create policy "Quizzes son visibles para usuarios autenticados."
  on public.quizzes for select to authenticated using (true);
drop policy if exists "Admins pueden gestionar quizzes." on public.quizzes;
create policy "Admins pueden gestionar quizzes."
  on public.quizzes for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Preguntas son visibles para usuarios autenticados." on public.questions;
create policy "Preguntas son visibles para usuarios autenticados."
  on public.questions for select to authenticated using (true);
drop policy if exists "Admins pueden gestionar preguntas." on public.questions;
create policy "Admins pueden gestionar preguntas."
  on public.questions for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Students can view their own attempts" on public.quiz_attempts;
create policy "Students can view their own attempts"
  on public.quiz_attempts for select using (auth.uid() = user_id);
drop policy if exists "Staff can view all attempts" on public.quiz_attempts;
create policy "Staff can view all attempts"
  on public.quiz_attempts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'creator')));
drop policy if exists "Users can insert their own attempts" on public.quiz_attempts;
create policy "Users can insert their own attempts"
  on public.quiz_attempts for insert with check (auth.uid() = user_id);

drop policy if exists "Students can view their own quiz attempt answers" on public.quiz_attempt_answers;
create policy "Students can view their own quiz attempt answers"
  on public.quiz_attempt_answers for select to authenticated
  using (exists (select 1 from public.quiz_attempts qa where qa.id = attempt_id and qa.user_id = auth.uid()));
drop policy if exists "Staff can view all quiz attempt answers" on public.quiz_attempt_answers;
create policy "Staff can view all quiz attempt answers"
  on public.quiz_attempt_answers for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'creator')));
drop policy if exists "Users can insert their own quiz attempt answers" on public.quiz_attempt_answers;
create policy "Users can insert their own quiz attempt answers"
  on public.quiz_attempt_answers for insert to authenticated
  with check (exists (select 1 from public.quiz_attempts qa where qa.id = attempt_id and qa.user_id = auth.uid()));

-- progress
drop policy if exists "Usuarios pueden ver su propio progreso." on public.lesson_progress;
create policy "Usuarios pueden ver su propio progreso."
  on public.lesson_progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Usuarios pueden insertar/actualizar su propio progreso." on public.lesson_progress;
create policy "Usuarios pueden insertar/actualizar su propio progreso."
  on public.lesson_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Usuarios pueden actualizar su propio progreso." on public.lesson_progress;
create policy "Usuarios pueden actualizar su propio progreso."
  on public.lesson_progress for update to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins pueden ver todo el progreso." on public.lesson_progress;
create policy "Admins pueden ver todo el progreso."
  on public.lesson_progress for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Usuarios pueden ver su propio progreso de video." on public.video_watch_progress;
create policy "Usuarios pueden ver su propio progreso de video."
  on public.video_watch_progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Usuarios pueden insertar su propio progreso de video." on public.video_watch_progress;
create policy "Usuarios pueden insertar su propio progreso de video."
  on public.video_watch_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Usuarios pueden actualizar su propio progreso de video." on public.video_watch_progress;
create policy "Usuarios pueden actualizar su propio progreso de video."
  on public.video_watch_progress for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admins pueden ver todo el progreso de video." on public.video_watch_progress;
create policy "Admins pueden ver todo el progreso de video."
  on public.video_watch_progress for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "lesson_notes_select_own" on public.lesson_notes;
create policy "lesson_notes_select_own" on public.lesson_notes for select using (auth.uid() = user_id);
drop policy if exists "lesson_notes_insert_own" on public.lesson_notes;
create policy "lesson_notes_insert_own" on public.lesson_notes for insert with check (auth.uid() = user_id);
drop policy if exists "lesson_notes_update_own" on public.lesson_notes;
create policy "lesson_notes_update_own" on public.lesson_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "lesson_notes_delete_own" on public.lesson_notes;
create policy "lesson_notes_delete_own" on public.lesson_notes for delete using (auth.uid() = user_id);

-- settings / payments / logs
drop policy if exists "Permitir lectura a todos" on public.app_settings;
create policy "Permitir lectura a todos"
  on public.app_settings for select to authenticated using (true);
drop policy if exists "Permitir actualización a admins" on public.app_settings;
create policy "Permitir actualización a admins"
  on public.app_settings for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Permitir inserción a admins" on public.app_settings;
create policy "Permitir inserción a admins"
  on public.app_settings for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments"
  on public.payments for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Admins can manage payments" on public.payments;
create policy "Admins can manage payments"
  on public.payments for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can view own activity logs" on public.activity_logs;
create policy "Users can view own activity logs"
  on public.activity_logs for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own activity logs" on public.activity_logs;
create policy "Users can insert own activity logs"
  on public.activity_logs for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Admins can view activity logs" on public.activity_logs;
create policy "Admins can view activity logs"
  on public.activity_logs for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "admin_audit_no_select_student" on public.admin_audit_log;
create policy "admin_audit_no_select_student"
  on public.admin_audit_log for select using (false);

-- certificates
drop policy if exists "Admins manage config" on public.certificate_config;
create policy "Admins manage config"
  on public.certificate_config for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Public can read config" on public.certificate_config;
create policy "Public can read config"
  on public.certificate_config for select using (true);

drop policy if exists "Public can read certificates" on public.certificates;
create policy "Public can read certificates"
  on public.certificates for select using (true);
drop policy if exists "Admins manage certificates" on public.certificates;
create policy "Admins manage certificates"
  on public.certificates for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Users can view own certificates" on public.certificates;
create policy "Users can view own certificates"
  on public.certificates for select to authenticated using (user_id = auth.uid());

drop policy if exists certificate_issue_events_admin_select on public.certificate_issue_events;
create policy certificate_issue_events_admin_select
  on public.certificate_issue_events for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- live sessions (en CursoUSG el historial no tenía policies; sin esto el JWT no lee filas)
drop policy if exists "Published live sessions are viewable" on public.live_sessions;
create policy "Published live sessions are viewable"
  on public.live_sessions for select to authenticated
  using (
    is_published = true
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can manage live sessions" on public.live_sessions;
create policy "Admins can manage live sessions"
  on public.live_sessions for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists session_recipients_admin_all on public.session_recipients;
create policy session_recipients_admin_all on public.session_recipients
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists session_recipients_student_select on public.session_recipients;
create policy session_recipients_student_select on public.session_recipients
  for select using (user_id = auth.uid());

drop policy if exists notifications_user_select on public.notifications;
create policy notifications_user_select on public.notifications
  for select using (user_id = auth.uid());
drop policy if exists notifications_user_update on public.notifications;
create policy notifications_user_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notifications_admin_all on public.notifications;
create policy notifications_admin_all on public.notifications
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- assignments
drop policy if exists "Users can view published assignments" on public.assignments;
create policy "Users can view published assignments" on public.assignments
  for select using (
    is_published = true
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can insert assignments" on public.assignments;
create policy "Admins can insert assignments" on public.assignments
  for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can update assignments" on public.assignments;
create policy "Admins can update assignments" on public.assignments
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
drop policy if exists "Admins can delete assignments" on public.assignments;
create policy "Admins can delete assignments" on public.assignments
  for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can view their own submissions" on public.assignment_submissions;
create policy "Users can view their own submissions" on public.assignment_submissions
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Users can insert their own submissions" on public.assignment_submissions;
create policy "Users can insert their own submissions" on public.assignment_submissions
  for insert with check (student_id = auth.uid());
drop policy if exists "Users and admins can update submissions" on public.assignment_submissions;
create policy "Users and admins can update submissions" on public.assignment_submissions
  for update using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can delete submissions" on public.assignment_submissions;
create policy "Admins can delete submissions" on public.assignment_submissions
  for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- surveys
drop policy if exists "Students can view published custom surveys" on public.custom_surveys;
create policy "Students can view published custom surveys"
  on public.custom_surveys for select to authenticated
  using (
    is_published = true
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can manage custom surveys" on public.custom_surveys;
create policy "Admins can manage custom surveys"
  on public.custom_surveys for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Students can view published custom survey questions" on public.custom_survey_questions;
create policy "Students can view published custom survey questions"
  on public.custom_survey_questions for select to authenticated
  using (
    exists (
      select 1 from public.custom_surveys s
      where s.id = survey_id
        and (
          s.is_published = true
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
        )
    )
  );
drop policy if exists "Admins can manage custom survey questions" on public.custom_survey_questions;
create policy "Admins can manage custom survey questions"
  on public.custom_survey_questions for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Students can view own custom survey responses" on public.custom_survey_responses;
create policy "Students can view own custom survey responses"
  on public.custom_survey_responses for select to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Students can submit own custom survey responses" on public.custom_survey_responses;
create policy "Students can submit own custom survey responses"
  on public.custom_survey_responses for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (select 1 from public.custom_surveys s where s.id = survey_id and s.is_published = true)
  );
drop policy if exists "Admins can manage custom survey responses" on public.custom_survey_responses;
create policy "Admins can manage custom survey responses"
  on public.custom_survey_responses for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Students can view own custom survey answers" on public.custom_survey_answers;
create policy "Students can view own custom survey answers"
  on public.custom_survey_answers for select to authenticated
  using (
    exists (
      select 1 from public.custom_survey_responses r
      where r.id = response_id
        and (
          r.student_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
        )
    )
  );
drop policy if exists "Students can insert own custom survey answers" on public.custom_survey_answers;
create policy "Students can insert own custom survey answers"
  on public.custom_survey_answers for insert to authenticated
  with check (
    exists (
      select 1
      from public.custom_survey_responses r
      join public.custom_surveys s on s.id = r.survey_id
      join public.custom_survey_questions q on q.id = question_id
      where r.id = response_id
        and q.survey_id = r.survey_id
        and r.student_id = auth.uid()
        and s.is_published = true
    )
  );
drop policy if exists "Admins can manage custom survey answers" on public.custom_survey_answers;
create policy "Admins can manage custom survey answers"
  on public.custom_survey_answers for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- forum
drop policy if exists "Enrolled users can view threads" on public.forum_threads;
create policy "Enrolled users can view threads" on public.forum_threads
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin'))
  );
drop policy if exists "Enrolled users can create threads" on public.forum_threads;
create policy "Enrolled users can create threads" on public.forum_threads
  for insert with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin'))
  );
drop policy if exists "Authors can delete own threads" on public.forum_threads;
create policy "Authors can delete own threads" on public.forum_threads
  for delete using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Enrolled users can view posts" on public.forum_posts;
create policy "Enrolled users can view posts" on public.forum_posts
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin'))
  );
drop policy if exists "Enrolled users can create posts" on public.forum_posts;
create policy "Enrolled users can create posts" on public.forum_posts
  for insert with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin'))
  );

drop policy if exists "Users can view likes" on public.forum_thread_likes;
create policy "Users can view likes" on public.forum_thread_likes for select using (true);
drop policy if exists "Users can manage own likes" on public.forum_thread_likes;
create policy "Users can manage own likes" on public.forum_thread_likes
  for all using (auth.uid() = user_id);

drop policy if exists "Public micro_lessons are viewable by everyone." on public.micro_lessons;
create policy "Public micro_lessons are viewable by everyone."
  on public.micro_lessons for select to authenticated using (is_published = true);
drop policy if exists "Admins can do everything on micro_lessons." on public.micro_lessons;
create policy "Admins can do everything on micro_lessons."
  on public.micro_lessons to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- comments / workshops / push (no existían en migraciones)
drop policy if exists "Active users can view lesson comments" on public.lesson_comments;
create policy "Active users can view lesson comments"
  on public.lesson_comments for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin')));
drop policy if exists "Active users can create lesson comments" on public.lesson_comments;
create policy "Active users can create lesson comments"
  on public.lesson_comments for insert to authenticated
  with check (
    auth.uid() = author_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and (p.is_active = true or p.role = 'admin'))
  );
drop policy if exists "Authors or admins can delete lesson comments" on public.lesson_comments;
create policy "Authors or admins can delete lesson comments"
  on public.lesson_comments for delete to authenticated
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Authenticated users can view workshops" on public.workshops;
create policy "Authenticated users can view workshops"
  on public.workshops for select to authenticated using (true);
drop policy if exists "Admins can manage workshops" on public.workshops;
create policy "Admins can manage workshops"
  on public.workshops for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users can view own workshop attendance" on public.workshop_attendance;
create policy "Users can view own workshop attendance"
  on public.workshop_attendance for select to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can manage workshop attendance" on public.workshop_attendance;
create policy "Admins can manage workshop attendance"
  on public.workshop_attendance for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
