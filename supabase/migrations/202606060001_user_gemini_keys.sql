create table if not exists public.user_gemini_keys (
  user_id uuid references auth.users on delete cascade primary key,
  encrypted_key text not null,
  iv text not null,
  updated_at timestamptz default now()
);

alter table public.user_gemini_keys enable row level security;

revoke all on public.user_gemini_keys from anon, authenticated;
