create table if not exists public.user_progress (
  user_id uuid references auth.users on delete cascade primary key,
  xp int default 0,
  study_points int default 0,
  lives int default 5,
  streak int default 0,
  longest_streak int default 0,
  last_study_date text,
  perfect_lessons int default 0,
  life_recoveries int default 0,
  character_name text,
  avatar_id text,
  avatar_tier int default 1,
  onboarding_complete bool default false,
  equipped_items jsonb default '{}',
  equipped_cosmetic text,
  companion jsonb default '{"name":"","species":"spark","evolutionStage":0}',
  timer_ends_at bigint,
  selected_model text default 'gemini-3-flash-preview',
  sound_enabled bool default true,
  updated_at timestamptz default now()
);

create table if not exists public.user_completions (
  user_id uuid references auth.users on delete cascade,
  node_id text,
  type text check (type in ('node','lab')),
  completed_at timestamptz default now(),
  primary key (user_id, node_id, type)
);

create table if not exists public.user_cosmetics (
  user_id uuid references auth.users on delete cascade,
  cosmetic_id text,
  primary key (user_id, cosmetic_id)
);

create table if not exists public.user_gear (
  user_id uuid references auth.users on delete cascade,
  gear_id text,
  primary key (user_id, gear_id)
);

create table if not exists public.user_rewards (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  cost_sp int not null,
  type text check (type in ('time','once')) not null,
  duration_minutes int
);

alter table public.user_progress enable row level security;
alter table public.user_completions enable row level security;
alter table public.user_cosmetics enable row level security;
alter table public.user_gear enable row level security;
alter table public.user_rewards enable row level security;

drop policy if exists "users manage own progress" on public.user_progress;
drop policy if exists "users manage own completions" on public.user_completions;
drop policy if exists "users manage own cosmetics" on public.user_cosmetics;
drop policy if exists "users manage own gear" on public.user_gear;
drop policy if exists "users manage own rewards" on public.user_rewards;

create policy "users manage own progress"
  on public.user_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own completions"
  on public.user_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own cosmetics"
  on public.user_cosmetics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own gear"
  on public.user_gear
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage own rewards"
  on public.user_rewards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
