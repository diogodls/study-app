create table if not exists public.user_content_notes (
  user_id uuid references auth.users on delete cascade,
  context_id text not null,
  content_type text check (content_type in ('lesson', 'lab')) not null,
  note text not null default '',
  updated_at timestamptz default now(),
  primary key (user_id, context_id, content_type)
);

alter table public.user_content_notes enable row level security;

drop policy if exists "users manage own content notes" on public.user_content_notes;

create policy "users manage own content notes"
  on public.user_content_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
