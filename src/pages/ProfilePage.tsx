import { useGameState } from '@/context/GameStateContext';
import {
  BADGE_DEFINITIONS,
  COMPANIONS,
  COSMETIC_ITEMS,
  getGearItem,
  getCompanionSpeciesStageLabel,
} from '@/config/character';
import { getLevel, getLevelTitle, getProgressToNextLevel, getCompanionStage } from '@/config/levels';
import { LEARNING_PATHS } from '@/config/paths';
import { AvatarSprite, CompanionDisplay } from '@/components/PixelSprites';

const SLOT_LABELS: Record<string, string> = {
  weapon: '⚔️ Weapon',
  shield: '🛡️ Shield',
  relic:  '💎 Relic',
};

const RARITY_CLASS: Record<string, string> = {
  common:    'badge-common',
  rare:      'badge-rare',
  legendary: 'badge-legendary animate-glow',
};

export default function ProfilePage() {
  const {
    xp,
    streak,
    longestStreak,
    completedNodes,
    completedLabs,
    avatarId,
    avatarTier,
    characterName,
    equippedItems,
    unlockedGear,
    companion,
    equippedCosmetic,
    unlockedBadgeIds,
    setCompanionSpecies,
  } = useGameState();

  document.title = 'Profile — DevQuest';

  const level   = getLevel(xp);
  const title   = getLevelTitle(level);
  const progress = getProgressToNextLevel(xp);
  const companionStage = getCompanionStage(level);
  const cosmeticClass = equippedCosmetic ? (COSMETIC_ITEMS.find((c) => c.id === equippedCosmetic)?.cssClass ?? '') : '';

  // Stats calculations
  const totalLessons = completedNodes.length;
  const totalPaths   = LEARNING_PATHS.filter((p) =>
    p.nodes.some((n) => completedNodes.includes(n.id))
  ).length;

  return (
    <div className="page stagger-children">
      {/* ── Character Card ─────────────────────────────── */}
      <div
        className={`card ${cosmeticClass}`}
        style={{
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-secondary)',
              border: `3px solid ${avatarTier === 3 ? 'var(--rarity-legendary)' : avatarTier === 2 ? 'var(--rarity-rare)' : 'var(--accent)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              flexShrink: 0,
              boxShadow: avatarTier === 3 ? 'var(--shadow-glow-accent)' : 'none',
              animation: avatarTier === 3 ? 'glowPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            <AvatarSprite avatarId={avatarId} tier={avatarTier} equippedItems={equippedItems} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>
              {characterName || 'Hero'}
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="level-badge">Lv {level}</span>
              <span className="badge badge-muted">{title}</span>
              {avatarTier > 1 && (
                <span className={`badge ${RARITY_CLASS[avatarTier === 3 ? 'legendary' : 'rare']}`}>
                  Tier {avatarTier}
                </span>
              )}
            </div>

            {/* XP Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {progress.xpIntoLevel}/{progress.xpNeededForNext}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        {[
          { label: 'Total XP',      value: xp.toLocaleString(),      icon: '⚡' },
          { label: 'Streak',        value: `${streak} days`,         icon: '🔥' },
          { label: 'Best Streak',   value: `${longestStreak} days`,  icon: '🏆' },
          { label: 'Lessons Done',  value: totalLessons.toString(),  icon: '📚' },
          { label: 'Labs Done',     value: completedLabs.length.toString(), icon: '🔧' },
          { label: 'Paths Active',  value: `${totalPaths}/${LEARNING_PATHS.length}`, icon: '🗺️' },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="card card-sm"
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: '1.375rem', marginBottom: '0.3rem' }} aria-hidden="true">{icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--accent)' }}>
              {value}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Equipment ──────────────────────────────────── */}
      <section style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Equipment
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(['weapon', 'shield', 'relic'] as const).map((slot) => {
            const equippedId = equippedItems[slot];
            const item = equippedId ? getGearItem(equippedId) : null;
            const isLocked = !item && !unlockedGear.some((id) => {
              const g = getGearItem(id);
              return g?.slot === slot;
            });

            return (
              <div
                key={slot}
                className={`card card-sm ${item ? 'card-hover' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  opacity: isLocked && !item ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }} aria-hidden="true">
                  {item ? item.emoji : '⬜'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.15rem' }}>
                    {SLOT_LABELS[slot]}
                  </div>
                  {item ? (
                    <>
                      <div style={{ color: 'var(--text)', fontSize: '0.875rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.15rem' }}>
                        {item.flavorText}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
                      {isLocked ? 'Locked — earn more badges' : 'Empty slot'}
                    </div>
                  )}
                </div>
                {item && (
                  <span className={`badge ${RARITY_CLASS[item.rarity]}`} style={{ flexShrink: 0 }}>
                    {item.rarity}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Companion ──────────────────────────────────── */}
      <section style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Companion
        </h2>
        <div
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <CompanionDisplay
            stage={companionStage}
            species={companion.species}
            name={companion.name}
            streak={streak}
            allowNaming
          />
          <div>
            {companionStage === 0 ? (
              <>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Your companion is waiting</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Reach <strong style={{ color: 'var(--accent)' }}>Level 3</strong> to hatch your companion egg!
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {companion.name || 'Unnamed'}{' '}
                  <span className="badge badge-muted">
                    {getCompanionSpeciesStageLabel(companion.species, companionStage)}
                  </span>
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {streak >= 3 ? '😄 Happy — keep your streak going!' : streak >= 1 ? '😐 Idle — study today!' : '😴 Sleepy — break your streak!'}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="companion-picker" aria-label="Choose companion">
          {COMPANIONS.map((pet) => (
            <button
              key={pet.id}
              id={`companion-pick-${pet.id}`}
              className={`companion-picker__option${companion.species === pet.id ? ' companion-picker__option--active' : ''}`}
              onClick={() => setCompanionSpecies(pet.id)}
              title={pet.description}
            >
              <CompanionDisplay stage={companionStage} species={pet.id} streak={streak} compact />
              <span>{pet.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Badges ─────────────────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Badges ({unlockedBadgeIds.length}/{BADGE_DEFINITIONS.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className="card card-sm"
                title={earned ? badge.description : `Locked: ${badge.requirement}`}
                style={{
                  textAlign: 'center',
                  opacity: earned ? 1 : 0.35,
                  filter: earned ? 'none' : 'grayscale(1)',
                  transition: 'opacity var(--transition-fast)',
                  cursor: 'default',
                }}
                aria-label={`${badge.title}: ${earned ? 'earned' : 'locked'}`}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }} aria-hidden="true">
                  {badge.emoji}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'var(--font-heading)', color: earned ? 'var(--text)' : 'var(--text-faint)', lineHeight: 1.3 }}>
                  {badge.title}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
