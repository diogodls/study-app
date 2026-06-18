import { useEffect, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import {
  claimWeeklyMission,
  getWeeklyMissions,
  type WeeklyMission,
  type WeeklyMissionType,
} from '@/services/weeklyMissionService';

const MISSION_COPY: Record<WeeklyMissionType, { icon: string; title: string; description: string }> = {
  quiz_answers: {
    icon: '🧠',
    title: 'Answer 25 quiz questions',
    description: 'Every assessment and review question counts.',
  },
  node_progress: {
    icon: '🗺️',
    title: 'Advance 3 skill nodes',
    description: 'Complete a new depth in three different nodes.',
  },
  daily_challenges: {
    icon: '⚔️',
    title: 'Complete 3 Daily Challenges',
    description: 'Build consistency across the week.',
  },
};

export default function WeeklyMissionsCard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { applyCloudRewardTotals } = useGameState();
  const [missions, setMissions] = useState<WeeklyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<WeeklyMissionType | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setMissions(await getWeeklyMissions());
    } catch {
      setError('Unable to load weekly missions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const handleClaim = async (mission: WeeklyMission) => {
    setClaiming(mission.type);
    setError('');
    try {
      const reward = await claimWeeklyMission(mission.type);
      applyCloudRewardTotals(reward.totalXp, reward.totalSp);
      await load();
    } catch {
      setError('Unable to claim this mission reward.');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <section className="weekly-missions">
      <div className="weekly-missions__header">
        <div>
          <span>Weekly Missions</span>
          <h2>Build momentum this week</h2>
        </div>
        <strong>Resets Monday</strong>
      </div>

      {loading ? (
        <div className="card weekly-missions__state">Loading missions…</div>
      ) : (
        <div className="weekly-missions__list">
          {missions.map((mission) => {
            const copy = MISSION_COPY[mission.type];
            const complete = mission.current >= mission.target;
            const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));
            return (
              <article key={mission.type} className={`card weekly-mission${mission.claimed ? ' weekly-mission--claimed' : ''}`}>
                <span className="weekly-mission__icon">{copy.icon}</span>
                <div className="weekly-mission__content">
                  <div className="weekly-mission__title">
                    <strong>{copy.title}</strong>
                    <span>{mission.current}/{mission.target}</span>
                  </div>
                  <p>{copy.description}</p>
                  <div className="weekly-mission__bar"><span style={{ width: `${percent}%` }} /></div>
                  <div className="weekly-mission__footer">
                    <span>+{mission.xpReward} XP · +{mission.spReward} SP</span>
                    {mission.claimed ? (
                      <strong className="weekly-mission__claimed">Claimed</strong>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!complete || claiming === mission.type}
                        onClick={() => void handleClaim(mission)}
                      >
                        {claiming === mission.type ? 'Claiming…' : 'Claim'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {error && <p className="weekly-missions__error" role="alert">{error}</p>}
    </section>
  );
}

