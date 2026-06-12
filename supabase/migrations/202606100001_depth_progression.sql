alter table public.user_progress
  add column if not exists language text default 'en';

create table if not exists public.user_node_depths (
  user_id uuid references auth.users on delete cascade,
  node_id text not null,
  depth int not null default 0 check (depth between 0 and 3),
  deepen_lab_completed bool not null default false,
  updated_at timestamptz default now(),
  primary key (user_id, node_id)
);

create table if not exists public.user_quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  node_id text not null,
  depth int not null default 0 check (depth between 0 and 3),
  question_hash text not null,
  correct boolean not null,
  time_taken_ms int,
  answered_at timestamptz default now()
);

create table if not exists public.user_srs_schedule (
  user_id uuid references auth.users on delete cascade,
  node_id text not null,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 1,
  next_review_date date not null default current_date,
  repetition_count int not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, node_id)
);

create table if not exists public.user_master_rewards (
  user_id uuid references auth.users on delete cascade,
  milestone int not null,
  cosmetic_id text,
  updated_at timestamptz default now(),
  primary key (user_id, milestone)
);

alter table public.user_generated_content
  add column if not exists depth int not null default 0 check (depth between 0 and 3);

alter table public.user_generated_content
  drop constraint if exists user_generated_content_content_type_check;

alter table public.user_generated_content
  add constraint user_generated_content_content_type_check
  check (content_type in ('lesson', 'lab', 'master', 'flashcards'));

alter table public.user_generated_content
  drop constraint if exists user_generated_content_pkey;

alter table public.user_generated_content
  add primary key (user_id, node_id, depth, content_type, model);

alter table public.user_node_depths enable row level security;
alter table public.user_quiz_results enable row level security;
alter table public.user_srs_schedule enable row level security;
alter table public.user_master_rewards enable row level security;

drop policy if exists "users manage own node depths" on public.user_node_depths;
drop policy if exists "users manage own quiz results" on public.user_quiz_results;
drop policy if exists "users manage own srs schedule" on public.user_srs_schedule;
drop policy if exists "users manage own master rewards" on public.user_master_rewards;

create policy "users manage own node depths"
  on public.user_node_depths
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own quiz results"
  on public.user_quiz_results
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own srs schedule"
  on public.user_srs_schedule
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own master rewards"
  on public.user_master_rewards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
