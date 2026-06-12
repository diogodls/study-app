alter table public.user_srs_schedule
  add column if not exists depth int not null default 1 check (depth between 1 and 3);

alter table public.user_srs_schedule
  add column if not exists last_reviewed_at timestamptz;

create index if not exists user_srs_schedule_due_idx
  on public.user_srs_schedule (user_id, next_review_date);

create index if not exists user_quiz_results_node_answered_idx
  on public.user_quiz_results (user_id, node_id, answered_at desc);

alter table public.user_generated_content
  drop constraint if exists user_generated_content_content_type_check;

alter table public.user_generated_content
  add constraint user_generated_content_content_type_check
  check (content_type in ('lesson', 'lab', 'master', 'flashcards', 'review'));
