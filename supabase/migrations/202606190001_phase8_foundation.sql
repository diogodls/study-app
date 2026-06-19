alter table public.user_progress
  add column if not exists theme text not null default 'system'
    check (theme in ('system', 'dark', 'light')),
  add column if not exists roadmap_goal_id text,
  add column if not exists roadmap_path_ids jsonb not null default '[]'::jsonb;

create table if not exists public.user_streak_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  occurred_at timestamptz not null,
  study_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_key)
);

alter table public.user_streak_events enable row level security;
create policy "Users read own streak events" on public.user_streak_events for select using (auth.uid() = user_id);

create or replace function public.record_study_day(p_event_key text, p_occurred_at timestamptz default now())
returns table (streak int, longest_streak int, last_study_date date)
language plpgsql security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_study_date date;
  v_progress public.user_progress%rowtype;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_event_key is null or length(trim(p_event_key)) < 8 then raise exception 'Invalid event key'; end if;
  if p_occurred_at > now() + interval '5 minutes' or p_occurred_at < now() - interval '48 hours' then
    raise exception 'Study event outside accepted window';
  end if;

  v_study_date := (p_occurred_at at time zone 'America/Sao_Paulo')::date;
  insert into public.user_streak_events(user_id, event_key, occurred_at, study_date)
  values (v_user_id, p_event_key, p_occurred_at, v_study_date)
  on conflict do nothing;

  select * into v_progress from public.user_progress where user_id = v_user_id for update;
  if not found then raise exception 'Progress not found'; end if;

  if v_progress.last_study_date is null or v_study_date > v_progress.last_study_date then
    v_progress.streak := case
      when v_progress.last_study_date = v_study_date - 1 then v_progress.streak + 1
      else 1
    end;
    v_progress.longest_streak := greatest(v_progress.longest_streak, v_progress.streak);
    v_progress.last_study_date := v_study_date;
    update public.user_progress
      set streak = v_progress.streak,
          longest_streak = v_progress.longest_streak,
          last_study_date = v_progress.last_study_date,
          updated_at = now()
      where user_id = v_user_id;
  end if;

  streak := v_progress.streak;
  longest_streak := v_progress.longest_streak;
  last_study_date := v_progress.last_study_date;
  return next;
end;
$$;

grant execute on function public.record_study_day(text, timestamptz) to authenticated;
