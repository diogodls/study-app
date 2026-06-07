insert into public.user_rewards (id, user_id, name, cost_sp, type, duration_minutes)
select reward_id, user_id, name, cost_sp, type, duration_minutes
from (
  select up.user_id, defaults.*
  from public.user_progress up
  cross join (
    values
      ('default-1', '15 min TikTok', 150, 'time', 15),
      ('default-2', '1 Hour Gaming', 400, 'time', 60),
      ('default-3', 'Movie Night', 800, 'once', null),
      ('default-4', 'Favorite Snack', 200, 'once', null)
  ) as defaults(reward_id, name, cost_sp, type, duration_minutes)
) seeded
on conflict (id) do nothing;
