alter table public.user_progress
  add column if not exists study_reminder_enabled boolean not null default false,
  add column if not exists study_reminder_time text not null default '19:00',
  add column if not exists study_reminder_timezone text not null default 'America/Sao_Paulo';

