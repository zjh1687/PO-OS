create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text not null default '',
  status text not null default 'yellow' check (status in ('green', 'yellow', 'red')),
  due_date date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  risk text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  project_name text not null default '',
  title text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'inbox' check (status in ('inbox', 'backlog', 'doing', 'waiting', 'done')),
  due_date date,
  source text not null default '',
  memo text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  project_name text not null default '',
  date date not null,
  topic text not null,
  decision text not null,
  reason text not null default '',
  requested_by text not null default '',
  next_action text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  title text not null,
  attendees text not null default '',
  summary text not null default '',
  actions text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger decisions_set_updated_at
before update on public.decisions
for each row execute function public.set_updated_at();

create trigger meetings_set_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.decisions enable row level security;
alter table public.meetings enable row level security;

create policy "profiles select own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles insert own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles update own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles delete own" on public.profiles
for delete using (auth.uid() = id);

create policy "projects select own" on public.projects
for select using (auth.uid() = user_id);

create policy "projects insert own" on public.projects
for insert with check (auth.uid() = user_id);

create policy "projects update own" on public.projects
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects delete own" on public.projects
for delete using (auth.uid() = user_id);

create policy "tasks select own" on public.tasks
for select using (auth.uid() = user_id);

create policy "tasks insert own" on public.tasks
for insert with check (auth.uid() = user_id);

create policy "tasks update own" on public.tasks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks delete own" on public.tasks
for delete using (auth.uid() = user_id);

create policy "decisions select own" on public.decisions
for select using (auth.uid() = user_id);

create policy "decisions insert own" on public.decisions
for insert with check (auth.uid() = user_id);

create policy "decisions update own" on public.decisions
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "decisions delete own" on public.decisions
for delete using (auth.uid() = user_id);

create policy "meetings select own" on public.meetings
for select using (auth.uid() = user_id);

create policy "meetings insert own" on public.meetings
for insert with check (auth.uid() = user_id);

create policy "meetings update own" on public.meetings
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meetings delete own" on public.meetings
for delete using (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists tasks_user_id_status_idx on public.tasks(user_id, status);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists decisions_user_id_date_idx on public.decisions(user_id, date desc);
create index if not exists meetings_user_id_date_idx on public.meetings(user_id, date desc);
