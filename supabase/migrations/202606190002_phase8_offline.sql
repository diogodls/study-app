alter table public.user_generated_content
  add column if not exists schema_version int not null default 1;

alter table public.user_quiz_results
  add column if not exists event_key text;

create unique index if not exists user_quiz_results_event_key_idx
  on public.user_quiz_results(user_id, event_key)
  where event_key is not null;

create or replace function public.sync_offline_depth(
  p_node_id text,
  p_depth int,
  p_event_key text,
  p_occurred_at timestamptz
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if p_depth < 1 or p_depth > 3 then raise exception 'Invalid depth'; end if;
  perform public.record_study_day(p_event_key, p_occurred_at);
  insert into public.user_node_depths(user_id, node_id, depth, updated_at)
  values (v_user_id, p_node_id, p_depth, now())
  on conflict (user_id, node_id) do update
    set depth = greatest(public.user_node_depths.depth, excluded.depth),
        updated_at = now();
end;
$$;

grant execute on function public.sync_offline_depth(text, int, text, timestamptz) to authenticated;
