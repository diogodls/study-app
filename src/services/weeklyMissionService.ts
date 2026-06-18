import { supabase } from '@/services/supabaseClient';

export type WeeklyMissionType = 'quiz_answers' | 'node_progress' | 'daily_challenges';

export type WeeklyMission = {
  type: WeeklyMissionType;
  current: number;
  target: number;
  claimed: boolean;
  xpReward: number;
  spReward: number;
};

export type WeeklyMissionClaim = {
  newlyClaimed: boolean;
  xpAwarded: number;
  spAwarded: number;
  totalXp: number;
  totalSp: number;
};

export async function getWeeklyMissions(): Promise<WeeklyMission[]> {
  const { data, error } = await supabase.rpc('get_weekly_missions');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    type: row.mission_type as WeeklyMissionType,
    current: row.current_progress,
    target: row.target,
    claimed: row.claimed,
    xpReward: row.xp_reward,
    spReward: row.sp_reward,
  }));
}

export async function claimWeeklyMission(type: WeeklyMissionType): Promise<WeeklyMissionClaim> {
  const { data, error } = await supabase.rpc('claim_weekly_mission', {
    p_mission_type: type,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new Error('Weekly mission claim returned no data');
  return {
    newlyClaimed: row.newly_claimed,
    xpAwarded: row.xp_awarded,
    spAwarded: row.sp_awarded,
    totalXp: row.total_xp,
    totalSp: row.total_sp,
  };
}

