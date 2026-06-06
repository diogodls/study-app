alter table public.user_progress
  add column if not exists selected_path_id text default 'data-structures';
