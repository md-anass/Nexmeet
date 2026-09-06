create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  public_code text not null unique,
  room_name text not null unique,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint meetings_public_code_format check (public_code ~ '^[a-z0-9]{10,16}$'),
  constraint meetings_title_length check (char_length(title) between 1 and 120),
  constraint meetings_status_check check (status in ('active', 'ended'))
);

alter table public.meetings enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on table public.meetings to authenticated;

create policy "Hosts can create their own meetings"
  on public.meetings for insert to authenticated
  with check ((select auth.uid()) = host_user_id);

create policy "Hosts can view their own meetings"
  on public.meetings for select to authenticated
  using ((select auth.uid()) = host_user_id);

create policy "Hosts can update their own meetings"
  on public.meetings for update to authenticated
  using ((select auth.uid()) = host_user_id)
  with check ((select auth.uid()) = host_user_id);

create or replace function public.set_meeting_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.set_meeting_updated_at();

create or replace function public.get_public_meeting_by_code(meeting_code text)
returns table (
  title text,
  public_code text,
  status text,
  host_display_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.title,
    m.public_code,
    m.status,
    p.display_name as host_display_name
  from public.meetings as m
  left join public.profiles as p on p.id = m.host_user_id
  where m.public_code = $1
  limit 1;
$$;

revoke all on function public.get_public_meeting_by_code(text) from public;
grant execute on function public.get_public_meeting_by_code(text) to anon, authenticated;
