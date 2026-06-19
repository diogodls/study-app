alter table public.user_node_depths
  add column if not exists tested_out boolean not null default false;

create table if not exists public.user_study_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  event_key text not null,
  event_type text not null,
  node_id text,
  path_id text,
  depth int check (depth between 0 and 3),
  outcome text not null,
  active_seconds int not null default 0 check (active_seconds >= 0),
  xp_delta int not null default 0,
  sp_delta int not null default 0,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, event_key)
);

create table if not exists public.user_path_assessments (
  user_id uuid not null references auth.users on delete cascade,
  path_id text not null,
  attempts int not null default 0,
  best_score int not null default 0,
  last_score int not null default 0,
  passed boolean not null default false,
  last_attempt_at timestamptz,
  passed_at timestamptz,
  primary key (user_id, path_id)
);

alter table public.user_study_events enable row level security;
alter table public.user_path_assessments enable row level security;

create policy "users manage own study events"
  on public.user_study_events for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read own path assessments"
  on public.user_path_assessments for select
  using (auth.uid() = user_id);

create index if not exists user_study_events_user_date_idx
  on public.user_study_events (user_id, occurred_at desc);
create index if not exists user_study_events_user_path_idx
  on public.user_study_events (user_id, path_id, occurred_at desc);

alter table public.user_generated_content
  drop constraint if exists user_generated_content_content_type_check;
alter table public.user_generated_content
  add constraint user_generated_content_content_type_check
  check (content_type in ('lesson', 'lab', 'master', 'flashcards', 'review', 'daily-challenge', 'assessment'));

create or replace function public.get_analytics_summary()
returns table (
  active_seconds bigint,
  questions_answered bigint,
  correct_answers bigint,
  sessions bigint,
  learned_nodes bigint,
  mastered_nodes bigint
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce((select sum(active_seconds) from public.user_study_events where user_id = auth.uid()), 0),
    coalesce((select count(*) from public.user_quiz_results where user_id = auth.uid()), 0),
    coalesce((select count(*) from public.user_quiz_results where user_id = auth.uid() and correct), 0),
    coalesce((select count(*) from public.user_study_events where user_id = auth.uid()), 0),
    coalesce((select count(*) from public.user_node_depths where user_id = auth.uid() and depth >= 1), 0),
    coalesce((select count(*) from public.user_node_depths where user_id = auth.uid() and depth >= 3), 0);
$$;

create or replace function public.get_activity_heatmap()
returns table (activity_date date, active_seconds bigint, event_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    (occurred_at at time zone 'America/Sao_Paulo')::date,
    sum(active_seconds),
    count(*)
  from public.user_study_events
  where user_id = auth.uid()
    and occurred_at >= now() - interval '365 days'
  group by 1
  order by 1;
$$;

create or replace function public.get_weekly_performance()
returns table (
  week_start date,
  xp_earned bigint,
  active_seconds bigint,
  sessions bigint,
  nodes_advanced bigint,
  questions_answered bigint,
  correct_answers bigint
)
language sql
security definer
set search_path = public
as $$
  with event_weeks as (
    select
      date_trunc('week', occurred_at at time zone 'America/Sao_Paulo')::date as week_start,
      sum(xp_delta)::bigint as xp_earned,
      sum(active_seconds)::bigint as active_seconds,
      count(*)::bigint as sessions,
      count(*) filter (
        where event_type = 'node_assessment'
          and outcome = 'passed'
          and coalesce((metadata ->> 'replay')::boolean, false) = false
      )::bigint as nodes_advanced
    from public.user_study_events
    where user_id = auth.uid()
      and occurred_at >= now() - interval '12 weeks'
    group by 1
  ),
  quiz_weeks as (
    select
      date_trunc('week', answered_at at time zone 'America/Sao_Paulo')::date as week_start,
      count(*)::bigint as questions_answered,
      count(*) filter (where correct)::bigint as correct_answers
    from public.user_quiz_results
    where user_id = auth.uid()
      and answered_at >= now() - interval '12 weeks'
    group by 1
  )
  select
    events.week_start,
    events.xp_earned,
    events.active_seconds,
    events.sessions,
    events.nodes_advanced,
    coalesce(quizzes.questions_answered, 0),
    coalesce(quizzes.correct_answers, 0)
  from event_weeks events
  left join quiz_weeks quizzes using (week_start)
  order by events.week_start desc;
$$;

create or replace function public.complete_path_assessment(
  p_path_id text,
  p_score int,
  p_node_ids text[]
)
returns table (passed boolean, attempts int, best_score int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_passed boolean := p_score >= 4;
  v_row public.user_path_assessments%rowtype;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_score < 0 or p_score > 5 then raise exception 'Invalid score'; end if;
  if array_length(p_node_ids, 1) is null or array_length(p_node_ids, 1) > 3 then
    raise exception 'Invalid assessment nodes';
  end if;

  insert into public.user_path_assessments (
    user_id, path_id, attempts, best_score, last_score, passed, last_attempt_at, passed_at
  ) values (
    v_user_id, p_path_id, 1, p_score, p_score, v_passed, now(), case when v_passed then now() end
  )
  on conflict (user_id, path_id) do update
    set attempts = public.user_path_assessments.attempts + 1,
        best_score = greatest(public.user_path_assessments.best_score, excluded.best_score),
        last_score = excluded.last_score,
        passed = public.user_path_assessments.passed or excluded.passed,
        last_attempt_at = now(),
        passed_at = case
          when public.user_path_assessments.passed_at is not null then public.user_path_assessments.passed_at
          when excluded.passed then now()
          else null
        end
  returning * into v_row;

  if v_passed then
    insert into public.user_node_depths (user_id, node_id, depth, tested_out, updated_at)
    select v_user_id, node_id, 1, true, now()
    from unnest(p_node_ids) node_id
    on conflict (user_id, node_id) do update
      set depth = greatest(public.user_node_depths.depth, 1),
          tested_out = true,
          updated_at = now();
  end if;

  passed := v_row.passed;
  attempts := v_row.attempts;
  best_score := v_row.best_score;
  return next;
end;
$$;

grant execute on function public.get_analytics_summary() to authenticated;
grant execute on function public.get_activity_heatmap() to authenticated;
grant execute on function public.get_weekly_performance() to authenticated;
grant execute on function public.complete_path_assessment(text, int, text[]) to authenticated;
