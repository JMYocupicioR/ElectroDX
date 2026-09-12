-- Role-Based Access Control (RBAC) System

-- 1. Create user_roles table
create table public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Users can only view their own role
create policy "Users can view own role" on public.user_roles
  for select using (auth.uid() = user_id);

-- Only admins can modify roles (using email check as bootstrap)
create policy "Admins can manage roles" on public.user_roles
  for all using (
    auth.uid() in (
      select id from auth.users where email = 'jmyocupicior@gmail.com'
    )
  );

-- 2. Assign admin role to primary admin user
-- Note: This will fail silently if the user doesn't exist yet, which is okay
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'jmyocupicior@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- 3. Helper function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_roles.user_id = is_admin.user_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 4. Update RLS policies for admin-only write access

-- Drop existing admin policies that use email check directly
drop policy if exists "Admins can insert/update questions" on public.questions;

-- Questions: Only admins can write
create policy "Only admins can insert questions" on public.questions
  for insert with check (public.is_admin(auth.uid()));

create policy "Only admins can update questions" on public.questions
  for update using (public.is_admin(auth.uid()));

create policy "Only admins can delete questions" on public.questions
  for delete using (public.is_admin(auth.uid()));

-- Islands: Only admins can write
create policy "Only admins can modify islands" on public.islands
  for all using (public.is_admin(auth.uid()));

-- Topics: Only admins can write
create policy "Only admins can modify topics" on public.topics
  for all using (public.is_admin(auth.uid()));

-- 5. Create function to auto-assign 'user' role on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users (if possible, otherwise this will be handled at app level)
-- Note: This trigger creation might fail if we don't have access to auth schema
-- In that case, we'll handle role assignment in the application code
do $$
begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception
  when others then
    raise notice 'Could not create trigger on auth.users, will handle role assignment in app code';
end $$;
