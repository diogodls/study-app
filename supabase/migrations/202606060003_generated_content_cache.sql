create table if not exists public.user_generated_content (
  user_id uuid references auth.users on delete cascade,
  node_id text not null,
  content_type text check (content_type in ('lesson', 'lab')) not null,
  model text not null,
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, node_id, content_type, model)
);

alter table public.user_generated_content enable row level security;

drop policy if exists "users manage own generated content" on public.user_generated_content;

create policy "users manage own generated content"
  on public.user_generated_content
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
