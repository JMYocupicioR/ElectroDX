-- LMS kit: funciones, triggers y RPCs. Requiere 01_schema + 02_rls.

-- ---------------------------------------------------------------------------
-- Signup → profile (inactivo hasta que un admin lo apruebe)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, role,
    license_id, specialty, state, experience_level, interest_area, phone,
    is_active
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'user',
    new.raw_user_meta_data->>'license_id',
    new.raw_user_meta_data->>'specialty',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'interest_area',
    new.raw_user_meta_data->>'phone',
    false
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Progreso y certificados
-- ---------------------------------------------------------------------------
create or replace function public.calculate_course_progress(
  p_user_id uuid,
  p_course_id uuid
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total_modules integer;
  v_completed_modules integer;
begin
  select count(*) into v_total_modules
  from public.modules
  where course_id = p_course_id and is_published = true;

  if v_total_modules = 0 then
    return 0;
  end if;

  select count(*) into v_completed_modules
  from public.modules m
  join public.enrollments e on e.module_id = m.id
  where m.course_id = p_course_id
    and m.is_published = true
    and e.user_id = p_user_id
    and e.progress = 100;

  return ((v_completed_modules * 100) / v_total_modules);
end;
$$;

create or replace function public.get_app_setting_bool(
  p_key text,
  p_default boolean default false
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_value jsonb;
begin
  select value into v_value from public.app_settings where key = p_key limit 1;
  if v_value is null then
    return p_default;
  end if;
  if jsonb_typeof(v_value) = 'boolean' then
    return (v_value #>> '{}')::boolean;
  end if;
  if jsonb_typeof(v_value) = 'string' then
    return lower(v_value #>> '{}') in ('true', '1', 'yes', 'on');
  end if;
  return p_default;
end;
$$;

create or replace function public.get_next_certificate_folio(p_prefix text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_max_num integer;
begin
  select coalesce(max(nullif(substring(folio from char_length(p_prefix) + 1), '')::integer), 0)
  into v_max_num
  from public.certificates
  where folio is not null
    and left(folio, char_length(p_prefix)) = p_prefix
    and substring(folio from char_length(p_prefix) + 1) ~ '^[0-9]+$';

  return p_prefix || lpad((v_max_num + 1)::text, 4, '0');
end;
$$;

create or replace function public.module_evaluations_passed(
  p_user_id uuid,
  p_module_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return not exists (
    select 1
    from public.lessons l
    join public.quizzes q on q.lesson_id = l.id
    where l.module_id = p_module_id
      and l.is_published = true
      and coalesce(l.lesson_type, '') = 'quiz'
      and not exists (
        select 1
        from public.quiz_attempts qa
        where qa.user_id = p_user_id
          and qa.quiz_id = q.id
          and qa.passed = true
      )
  );
end;
$$;

create or replace function public.issue_automatic_certificate(
  p_user_id uuid,
  p_module_id uuid,
  p_course_id uuid default null
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_existing_id uuid;
  v_config record;
  v_profile record;
  v_module record;
  v_course record;
  v_folio text;
  v_course_name text;
  v_qr_url text;
  v_effective_course_id uuid;
begin
  if p_course_id is not null then
    v_effective_course_id := p_course_id;
  elsif p_module_id is not null then
    select course_id into v_effective_course_id from public.modules where id = p_module_id;
  end if;

  select id into v_existing_id
  from public.certificates
  where user_id = p_user_id
    and (
      (p_module_id is null and module_id is null and (
        (v_effective_course_id is null and course_id is null)
        or course_id = v_effective_course_id
      ))
      or module_id = p_module_id
    )
  limit 1;

  if v_existing_id is not null then
    return;
  end if;

  select * into v_config
  from public.certificate_config
  where (v_effective_course_id is not null and course_id = v_effective_course_id)
     or (v_effective_course_id is null)
     or course_id is null
  order by
    case
      when course_id = v_effective_course_id then 0
      when course_id is null then 1
      else 2
    end,
    updated_at desc nulls last
  limit 1;

  select id, email, full_name into v_profile
  from public.profiles where id = p_user_id;

  if p_module_id is not null then
    select id, title, course_id into v_module from public.modules where id = p_module_id;
    v_effective_course_id := coalesce(v_effective_course_id, v_module.course_id);
  end if;

  if v_effective_course_id is not null then
    select id, title into v_course from public.courses where id = v_effective_course_id;
  end if;

  v_folio := public.get_next_certificate_folio(coalesce(v_config.folio_prefix, 'CERT-'));
  v_course_name := case
    when p_module_id is null then coalesce(v_course.title, v_config.course_name, 'Curso completo')
    else coalesce(v_module.title, v_config.course_name, 'Modulo completado')
  end;
  v_qr_url := '/verify/' || v_folio;

  insert into public.certificates (
    user_id, module_id, course_id, issue_date, folio,
    recipient_name, recipient_email, course_name, course_hours,
    issued_by, qr_url, is_manual, notes
  )
  values (
    p_user_id,
    p_module_id,
    v_effective_course_id,
    now(),
    v_folio,
    coalesce(nullif(v_profile.full_name, ''), v_profile.email, 'Estudiante'),
    v_profile.email,
    v_course_name,
    v_config.course_hours,
    'Sistema automatico',
    v_qr_url,
    false,
    case
      when p_module_id is null then 'Emitido automaticamente al completar todos los modulos del curso'
      else 'Emitido automaticamente al completar el modulo'
    end
  )
  on conflict do nothing;
end;
$$;

create or replace function public.update_enrollment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_module_id uuid;
  v_course_id uuid;
  v_total_lessons integer;
  v_completed_lessons integer;
  v_progress_percent integer;
  v_all_modules_completed boolean;
  v_auto_certificates boolean;
  v_require_evaluations boolean;
begin
  select module_id into v_module_id from public.lessons where id = new.lesson_id;
  if v_module_id is null then
    return new;
  end if;

  select course_id into v_course_id from public.modules where id = v_module_id;

  insert into public.enrollments (user_id, module_id, status, progress)
  values (new.user_id, v_module_id, 'active', 0)
  on conflict (user_id, module_id) do nothing;

  if v_course_id is not null then
    insert into public.course_enrollments (user_id, course_id, status, progress)
    values (new.user_id, v_course_id, 'active', 0)
    on conflict (user_id, course_id) do nothing;
  end if;

  select count(*) into v_total_lessons
  from public.lessons
  where module_id = v_module_id and is_published = true;

  select count(*) into v_completed_lessons
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  where lp.user_id = new.user_id
    and l.module_id = v_module_id
    and lp.is_completed = true
    and l.is_published = true;

  if v_total_lessons > 0 then
    v_progress_percent := (v_completed_lessons * 100) / v_total_lessons;
  else
    v_progress_percent := 0;
  end if;

  update public.enrollments
  set progress = v_progress_percent,
      status = case when v_progress_percent = 100 then 'completed' else status end
  where user_id = new.user_id and module_id = v_module_id;

  if v_course_id is not null then
    update public.course_enrollments
    set progress = public.calculate_course_progress(new.user_id, v_course_id),
        status = case
          when public.calculate_course_progress(new.user_id, v_course_id) = 100 then 'completed'
          when status = 'blocked' then 'blocked'
          else 'active'
        end,
        completed_at = case
          when public.calculate_course_progress(new.user_id, v_course_id) = 100 then coalesce(completed_at, now())
          else completed_at
        end
    where user_id = new.user_id and course_id = v_course_id;
  end if;

  v_auto_certificates := public.get_app_setting_bool('auto_certificates', true);
  v_require_evaluations := public.get_app_setting_bool('require_evaluations_for_cert', true);

  if v_auto_certificates
     and v_progress_percent = 100
     and (not v_require_evaluations or public.module_evaluations_passed(new.user_id, v_module_id)) then
    perform public.issue_automatic_certificate(new.user_id, v_module_id, v_course_id);
  end if;

  if v_course_id is not null then
    select coalesce(bool_and(e.progress = 100), false)
    into v_all_modules_completed
    from public.modules m
    left join public.enrollments e
      on e.module_id = m.id and e.user_id = new.user_id
    where m.course_id = v_course_id and m.is_published = true;

    if v_auto_certificates
       and v_all_modules_completed
       and (not v_require_evaluations or not exists (
         select 1 from public.modules m
         where m.course_id = v_course_id
           and m.is_published = true
           and not public.module_evaluations_passed(new.user_id, m.id)
       )) then
      perform public.issue_automatic_certificate(new.user_id, null, v_course_id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_update_enrollment_progress on public.lesson_progress;
create trigger trigger_update_enrollment_progress
  after insert or update of is_completed on public.lesson_progress
  for each row
  when (new.is_completed = true)
  execute function public.update_enrollment_progress();

create or replace function public.queue_certificate_issue_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.certificate_issue_events (
    user_id, course_id, module_id, certificate_id, source
  )
  values (
    new.user_id,
    new.course_id,
    new.module_id,
    new.id,
    case when coalesce(new.is_manual, false) then 'manual' else 'auto' end
  )
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_certificate_issue_event on public.certificates;
create trigger trg_certificate_issue_event
  after insert on public.certificates
  for each row
  when (new.user_id is not null)
  execute function public.queue_certificate_issue_event();

-- ---------------------------------------------------------------------------
-- Foro
-- ---------------------------------------------------------------------------
create or replace function public.update_thread_reply_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.forum_threads
    set reply_count = reply_count + 1, updated_at = now()
    where id = new.thread_id;
  elsif tg_op = 'DELETE' then
    update public.forum_threads
    set reply_count = greatest(reply_count - 1, 0)
    where id = old.thread_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_thread_reply_count on public.forum_posts;
create trigger trg_thread_reply_count
  after insert or delete on public.forum_posts
  for each row execute function public.update_thread_reply_count();

create or replace function public.toggle_thread_like(p_thread_id uuid)
returns table(liked boolean, new_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  select exists (
    select 1 from public.forum_thread_likes
    where user_id = auth.uid() and thread_id = p_thread_id
  ) into v_exists;

  if v_exists then
    delete from public.forum_thread_likes
    where user_id = auth.uid() and thread_id = p_thread_id;
    update public.forum_threads
    set like_count = greatest(like_count - 1, 0)
    where id = p_thread_id;
    return query select false, (select like_count from public.forum_threads where id = p_thread_id);
  else
    insert into public.forum_thread_likes (user_id, thread_id)
    values (auth.uid(), p_thread_id);
    update public.forum_threads set like_count = like_count + 1 where id = p_thread_id;
    return query select true, (select like_count from public.forum_threads where id = p_thread_id);
  end if;
end;
$$;

-- RPCs que llama la app. El resto son triggers (SECURITY DEFINER, sin EXECUTE público).
revoke all on function public.handle_new_user() from public;
revoke all on function public.update_enrollment_progress() from public;
revoke all on function public.queue_certificate_issue_event() from public;
revoke all on function public.update_thread_reply_count() from public;

grant execute on function public.toggle_thread_like(uuid) to authenticated;
grant execute on function public.calculate_course_progress(uuid, uuid) to authenticated;
grant execute on function public.get_app_setting_bool(text, boolean) to authenticated;

notify pgrst, 'reload schema';
