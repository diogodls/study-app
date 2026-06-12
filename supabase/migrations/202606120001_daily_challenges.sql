create table if not exists public.user_daily_challenges (
  user_id uuid references auth.users on delete cascade,
  challenge_date date not null,
  node_id text not null,
  depth int not null default 1 check (depth between 1 and 3),
  attempts int not null default 0,
  score int,
  total_questions int,
  xp_awarded int not null default 0,
  sp_awarded int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_date)
);

create table if not exists public.user_daily_challenge_stats (
  user_id uuid primary key references auth.users on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date,
  total_completed int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_daily_challenges enable row level security;
alter table public.user_daily_challenge_stats enable row level security;

drop policy if exists "users manage own daily challenges" on public.user_daily_challenges;
drop policy if exists "users read own daily challenge stats" on public.user_daily_challenge_stats;

create policy "users manage own daily challenges"
  on public.user_daily_challenges
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users read own daily challenge stats"
  on public.user_daily_challenge_stats
  for select
  using (auth.uid() = user_id);

create or replace function public.start_daily_challenge(p_challenge_date date)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempts int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.user_daily_challenges
    set attempts = attempts + 1,
        updated_at = now()
    where user_id = auth.uid()
      and challenge_date = p_challenge_date
      and completed_at is null
    returning attempts into v_attempts;

  return coalesce(v_attempts, 0);
end;
$$;

alter table public.user_generated_content
  drop constraint if exists user_generated_content_content_type_check;

alter table public.user_generated_content
  add constraint user_generated_content_content_type_check
  check (content_type in ('lesson', 'lab', 'master', 'flashcards', 'review', 'daily-challenge'));

create or replace function public.complete_daily_challenge(
  p_challenge_date date,
  p_score int,
  p_total_questions int
)
returns table (
  newly_completed boolean,
  xp_awarded int,
  sp_awarded int,
  total_xp int,
  total_sp int,
  current_streak int,
  longest_streak int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.user_daily_challenges%rowtype;
  v_stats public.user_daily_challenge_stats%rowtype;
  v_xp_awarded int;
  v_sp_awarded int := 25;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_challenge_date <> (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Only today''s challenge can be completed';
  end if;

  if p_total_questions <= 0 or p_score < 0 or p_score > p_total_questions then
    raise exception 'Invalid challenge score';
  end if;

  if p_score < ceil(p_total_questions * 0.6) then
    raise exception 'Challenge score is below the passing threshold';
  end if;

  select *
    into v_challenge
    from public.user_daily_challenges
    where user_id = v_user_id
      and challenge_date = p_challenge_date
    for update;

  if not found then
    raise exception 'Daily challenge not found';
  end if;

  if v_challenge.completed_at is not null then
    select xp, study_points
      into total_xp, total_sp
      from public.user_progress
      where user_id = v_user_id;

    select stats.current_streak, stats.longest_streak
      into current_streak, longest_streak
      from public.user_daily_challenge_stats stats
      where stats.user_id = v_user_id;

    newly_completed := false;
    xp_awarded := 0;
    sp_awarded := 0;
    return next;
    return;
  end if;

  v_xp_awarded := 75 + case when p_score = p_total_questions then 25 else 0 end;

  update public.user_daily_challenges
    set score = p_score,
        total_questions = p_total_questions,
        xp_awarded = v_xp_awarded,
        sp_awarded = v_sp_awarded,
        completed_at = now(),
        updated_at = now()
    where user_id = v_user_id
      and challenge_date = p_challenge_date;

  select *
    into v_stats
    from public.user_daily_challenge_stats
    where user_id = v_user_id
    for update;

  if not found then
    insert into public.user_daily_challenge_stats (
      user_id,
      current_streak,
      longest_streak,
      last_completed_date,
      total_completed
    ) values (
      v_user_id,
      1,
      1,
      p_challenge_date,
      1
    )
    returning * into v_stats;
  else
    v_stats.current_streak :=
      case
        when v_stats.last_completed_date = p_challenge_date - 1 then v_stats.current_streak + 1
        when v_stats.last_completed_date = p_challenge_date then v_stats.current_streak
        else 1
      end;
    v_stats.longest_streak := greatest(v_stats.longest_streak, v_stats.current_streak);
    v_stats.last_completed_date := p_challenge_date;
    v_stats.total_completed := v_stats.total_completed + 1;

    update public.user_daily_challenge_stats
      set current_streak = v_stats.current_streak,
          longest_streak = v_stats.longest_streak,
          last_completed_date = v_stats.last_completed_date,
          total_completed = v_stats.total_completed,
          updated_at = now()
      where user_id = v_user_id;
  end if;

  insert into public.user_progress (user_id, xp, study_points, updated_at)
    values (v_user_id, v_xp_awarded, v_sp_awarded, now())
    on conflict (user_id) do update
      set xp = coalesce(public.user_progress.xp, 0) + excluded.xp,
          study_points = coalesce(public.user_progress.study_points, 0) + excluded.study_points,
          updated_at = now()
    returning xp, study_points into total_xp, total_sp;

  newly_completed := true;
  xp_awarded := v_xp_awarded;
  sp_awarded := v_sp_awarded;
  current_streak := v_stats.current_streak;
  longest_streak := v_stats.longest_streak;
  return next;
end;
$$;

revoke all on function public.complete_daily_challenge(date, int, int) from public;
grant execute on function public.complete_daily_challenge(date, int, int) to authenticated;
revoke all on function public.start_daily_challenge(date) from public;
grant execute on function public.start_daily_challenge(date) to authenticated;
