create table if not exists public.user_weekly_mission_claims (
  user_id uuid not null references auth.users on delete cascade,
  week_start date not null,
  mission_type text not null check (mission_type in ('quiz_answers', 'node_progress', 'daily_challenges')),
  xp_awarded int not null,
  sp_awarded int not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, week_start, mission_type)
);

alter table public.user_weekly_mission_claims enable row level security;

drop policy if exists "users read own weekly mission claims" on public.user_weekly_mission_claims;
create policy "users read own weekly mission claims"
  on public.user_weekly_mission_claims
  for select
  using (auth.uid() = user_id);

create or replace function public.get_weekly_missions()
returns table (
  mission_type text,
  current_progress int,
  target int,
  claimed boolean,
  xp_reward int,
  sp_reward int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_week_start timestamptz := date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
  v_week_date date := (v_week_start at time zone 'America/Sao_Paulo')::date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  with missions as (
    select 'quiz_answers'::text as type, 25 as goal, 100 as xp, 30 as sp,
      (select count(*)::int from public.user_quiz_results
        where user_id = v_user_id and answered_at >= v_week_start) as progress
    union all
    select 'node_progress', 3, 150, 40,
      (select count(*)::int from public.user_node_depths
        where user_id = v_user_id and updated_at >= v_week_start)
    union all
    select 'daily_challenges', 3, 125, 35,
      (select count(*)::int from public.user_daily_challenges
        where user_id = v_user_id and completed_at >= v_week_start)
  )
  select
    missions.type,
    least(missions.progress, missions.goal),
    missions.goal,
    exists (
      select 1
      from public.user_weekly_mission_claims claims
      where claims.user_id = v_user_id
        and claims.week_start = v_week_date
        and claims.mission_type = missions.type
    ),
    missions.xp,
    missions.sp
  from missions;
end;
$$;

create or replace function public.claim_weekly_mission(p_mission_type text)
returns table (
  newly_claimed boolean,
  xp_awarded int,
  sp_awarded int,
  total_xp int,
  total_sp int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_week_start timestamptz := date_trunc('week', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo';
  v_week_date date := (v_week_start at time zone 'America/Sao_Paulo')::date;
  v_progress int;
  v_target int;
  v_xp int;
  v_sp int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select missions.current_progress, missions.target, missions.xp_reward, missions.sp_reward
    into v_progress, v_target, v_xp, v_sp
    from public.get_weekly_missions() missions
    where missions.mission_type = p_mission_type;

  if not found then
    raise exception 'Invalid weekly mission';
  end if;

  if v_progress < v_target then
    raise exception 'Weekly mission is not complete';
  end if;

  insert into public.user_weekly_mission_claims (
    user_id,
    week_start,
    mission_type,
    xp_awarded,
    sp_awarded
  ) values (
    v_user_id,
    v_week_date,
    p_mission_type,
    v_xp,
    v_sp
  )
  on conflict (user_id, week_start, mission_type) do nothing;

  if not found then
    select progress.xp, progress.study_points
      into total_xp, total_sp
      from public.user_progress progress
      where progress.user_id = v_user_id;
    newly_claimed := false;
    xp_awarded := 0;
    sp_awarded := 0;
    return next;
    return;
  end if;

  insert into public.user_progress (user_id, xp, study_points, updated_at)
    values (v_user_id, v_xp, v_sp, now())
    on conflict (user_id) do update
      set xp = coalesce(public.user_progress.xp, 0) + excluded.xp,
          study_points = coalesce(public.user_progress.study_points, 0) + excluded.study_points,
          updated_at = now()
    returning xp, study_points into total_xp, total_sp;

  newly_claimed := true;
  xp_awarded := v_xp;
  sp_awarded := v_sp;
  return next;
end;
$$;

revoke all on function public.get_weekly_missions() from public;
grant execute on function public.get_weekly_missions() to authenticated;
revoke all on function public.claim_weekly_mission(text) from public;
grant execute on function public.claim_weekly_mission(text) to authenticated;

