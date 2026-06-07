// ============================================================
// DevQuest — Shop Page (Milestone 6.1)
// ============================================================
// Tab 1 — Rewards: SP economy, custom reward CRUD, timer launch.
// Tab 2 — Character: cosmetics buy/equip with live preview.
// ============================================================

import { useState, useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import {
  COSMETIC_ITEMS,
  getCosmeticsByType,
} from '@/config/character';
import type { Reward, CosmeticType } from '@/types';
import { playCoins } from '@/services/soundService';
import DopamineTimer from '@/components/DopamineTimer';
import { AvatarSprite, CompanionDisplay } from '@/components/PixelSprites';

document.title = 'Reward Shop — DevQuest';

const DEFAULT_REWARD_IDS = new Set(['default-1', 'default-2', 'default-3', 'default-4']);

// ─────────────────────────────────────────────────────────────
// Character Card (live preview for cosmetics tab)
// ─────────────────────────────────────────────────────────────

function CharacterCard() {
  const { characterName, avatarId, avatarTier, equippedItems, equippedCosmetic, companion, level } = useGameState();
  const cosmeticClass = equippedCosmetic ? (COSMETIC_ITEMS.find(c => c.id === equippedCosmetic)?.cssClass ?? '') : '';

  return (
    <div className={`character-card-preview ${cosmeticClass}`}>
      <div className="char-avatar-wrap">
        <div className="char-avatar">
          <AvatarSprite avatarId={avatarId} tier={avatarTier} equippedItems={equippedItems} />
        </div>
        <div className="char-tier-badge">Tier {avatarTier}</div>
      </div>
      <div className="char-info">
        <span className="char-name">{characterName || 'Hero'}</span>
        <span className="char-level">Level {level}</span>
        {companion.name && (
          <span className="char-companion">
            <CompanionDisplay stage={companion.evolutionStage} name={companion.name} compact /> {companion.name}
          </span>
        )}
      </div>
      <div className="char-gear">
        {equippedItems.weapon && <span title="Weapon" className="gear-badge">⚔️</span>}
        {equippedItems.shield && <span title="Shield" className="gear-badge">🛡️</span>}
        {equippedItems.relic  && <span title="Relic"  className="gear-badge">💎</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Reward Modal
// ─────────────────────────────────────────────────────────────

interface AddRewardModalProps { onClose: () => void; }

function AddRewardModal({ onClose }: AddRewardModalProps) {
  const { addReward } = useGameState();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState<'once' | 'time'>('once');
  const [duration, setDuration] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const e: Record<string, string> = {};
    if (!name.trim())       e.name = 'Name is required';
    if (!cost || Number(cost) < 1) e.cost = 'Cost must be ≥ 1 SP';
    if (type === 'time' && (!duration || Number(duration) < 1)) e.duration = 'Duration must be ≥ 1 minute';
    if (Object.keys(e).length) { setErrors(e); return; }

    addReward({
      name: name.trim(),
      costSP: Number(cost),
      type,
      durationMinutes: type === 'time' ? Number(duration) : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ borderRadius: 'var(--radius)' }}>
        <div className="modal-header">
          <div className="modal-header__left">
            <h2 className="modal-title">New Reward</h2>
          </div>
          <button id="add-reward-close-btn" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-content" style={{ gap: '0.875rem' }}>

            <div className="form-group">
              <label className="form-label" htmlFor="reward-name-input">Reward name</label>
              <input
                id="reward-name-input"
                className={`form-input${errors.name ? ' form-input--error' : ''}`}
                placeholder="e.g. 15 min YouTube"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                maxLength={50}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reward-cost-input">Cost (SP)</label>
              <input
                id="reward-cost-input"
                className={`form-input${errors.cost ? ' form-input--error' : ''}`}
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={cost}
                onChange={(e) => { setCost(e.target.value); setErrors(p => ({ ...p, cost: '' })); }}
              />
              {errors.cost && <span className="form-error">{errors.cost}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="type-toggle">
                <button
                  id="type-once-btn"
                  className={`type-toggle__btn${type === 'once' ? ' type-toggle__btn--active' : ''}`}
                  onClick={() => setType('once')}
                >
                  🎁 One-time
                </button>
                <button
                  id="type-time-btn"
                  className={`type-toggle__btn${type === 'time' ? ' type-toggle__btn--active' : ''}`}
                  onClick={() => setType('time')}
                >
                  ⏱️ Timed break
                </button>
              </div>
            </div>

            {type === 'time' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reward-duration-input">Duration (minutes)</label>
                <input
                  id="reward-duration-input"
                  className={`form-input${errors.duration ? ' form-input--error' : ''}`}
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={duration}
                  onChange={(e) => { setDuration(e.target.value); setErrors(p => ({ ...p, duration: '' })); }}
                />
                {errors.duration && <span className="form-error">{errors.duration}</span>}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button id="confirm-add-reward-btn" className="btn btn-primary btn-3d" onClick={handleAdd}>
                Add Reward
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Rewards Tab
// ─────────────────────────────────────────────────────────────

function RewardsTab() {
  const { studyPoints, rewards, spendCoins, removeReward } = useGameState();
  const [showAddModal, setShowAddModal] = useState(false);
  const [timer, setTimer] = useState<{ durationMinutes: number; rewardName: string } | null>(null);

  const handleRedeem = useCallback((reward: Reward) => {
    if (studyPoints < reward.costSP) return;
    spendCoins(reward.costSP);
    playCoins();
    if (reward.type === 'time' && reward.durationMinutes) {
      setTimer({ durationMinutes: reward.durationMinutes, rewardName: reward.name });
    }
  }, [studyPoints, spendCoins]);

  return (
    <div className="tab-content">
      {/* SP balance */}
      <div className="sp-balance-card">
        <span className="sp-balance-icon">💰</span>
        <div>
          <span className="sp-balance-amount">{studyPoints.toLocaleString()} SP</span>
          <span className="sp-balance-label">Study Points</span>
        </div>
        <button
          id="add-reward-btn"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto' }}
        >
          + Add Reward
        </button>
      </div>

      {/* Reward grid */}
      {rewards.length === 0 ? (
        <div className="shop-empty">
          <span>🎁</span>
          <p>No rewards yet. Add one to start the SP economy!</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add your first reward
          </button>
        </div>
      ) : (
        <div className="reward-grid">
          {rewards.map((r) => {
            const canAfford = studyPoints >= r.costSP;
            return (
              <div key={r.id} className={`reward-card${!canAfford ? ' reward-card--locked' : ''}`}>
                <div className="reward-card__header">
                  <span className="reward-card__name">{r.name}</span>
                  <button
                    id={`delete-reward-${r.id}`}
                    className="reward-card__delete"
                    onClick={() => removeReward(r.id)}
                    aria-label="Delete reward"
                    hidden={DEFAULT_REWARD_IDS.has(r.id)}
                  >
                    🗑
                  </button>
                </div>
                <div className="reward-card__meta">
                  <span className={`type-badge type-badge--${r.type}`}>
                    {r.type === 'time' ? `⏱️ ${r.durationMinutes} min` : '🎁 One-time'}
                  </span>
                  <span className="reward-card__cost">💰 {r.costSP} SP</span>
                </div>
                <button
                  id={`redeem-${r.id}`}
                  className="btn btn-primary btn-3d btn-sm"
                  disabled={!canAfford}
                  onClick={() => handleRedeem(r)}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {canAfford ? 'Redeem →' : `Need ${r.costSP - studyPoints} more SP`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && <AddRewardModal onClose={() => setShowAddModal(false)} />}
      {timer && (
        <DopamineTimer
          durationMinutes={timer.durationMinutes}
          rewardName={timer.rewardName}
          onClose={() => setTimer(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Character / Cosmetics Tab
// ─────────────────────────────────────────────────────────────

const COSMETIC_SECTIONS: { type: CosmeticType; label: string; emoji: string }[] = [
  { type: 'theme',               label: 'Card Themes',          emoji: '🎨' },
  { type: 'frame',               label: 'Animated Frames',      emoji: '✨' },
  { type: 'companion-accessory', label: 'Companion Accessories', emoji: '🐣' },
];

function CosmeticsTab() {
  const { studyPoints, ownedCosmetics, equippedCosmetic, buyCosmetic, equipCosmetic } = useGameState();

  const handleBuy = useCallback((id: string, cost: number) => {
    if (studyPoints < cost) return;
    if (!buyCosmetic(id, cost)) return;
    playCoins();
    equipCosmetic(id);
  }, [studyPoints, buyCosmetic, equipCosmetic]);

  return (
    <div className="tab-content">
      {/* Live preview */}
      <div className="cosmetics-preview-wrap">
        <p className="cosmetics-preview-label">Live preview</p>
        <CharacterCard />
      </div>

      {/* SP balance */}
      <div className="sp-inline-balance">
        💰 <strong>{studyPoints.toLocaleString()} SP</strong> available
      </div>

      {/* Sections */}
      {COSMETIC_SECTIONS.map(({ type, label, emoji }) => {
        const items = getCosmeticsByType(type);
        return (
          <div key={type} className="cosmetic-section">
            <h3 className="cosmetic-section-title">{emoji} {label}</h3>
            <div className="cosmetic-grid">
              {items.map((item) => {
                const owned    = ownedCosmetics.includes(item.id);
                const equipped = equippedCosmetic === item.id;
                const canAfford = studyPoints >= item.costSP;

                return (
                  <div
                    key={item.id}
                    className={`cosmetic-card${equipped ? ' cosmetic-card--equipped' : ''}`}
                  >
                    <div className="cosmetic-card__preview">{item.emoji}</div>
                    <div className="cosmetic-card__info">
                      <span className="cosmetic-card__name">{item.name}</span>
                      <span className="cosmetic-card__desc">{item.description}</span>
                    </div>
                    {owned ? (
                      <button
                        id={`equip-${item.id}`}
                        className={`btn btn-sm ${equipped ? 'btn-success' : 'btn-ghost'}`}
                        onClick={() => equipCosmetic(equipped ? null : item.id)}
                      >
                        {equipped ? '✓ Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        id={`buy-${item.id}`}
                        className="btn btn-primary btn-sm"
                        disabled={!canAfford}
                        onClick={() => handleBuy(item.id, item.costSP)}
                        title={!canAfford ? `Need ${item.costSP - studyPoints} more SP` : undefined}
                      >
                        {canAfford ? `💰 ${item.costSP} SP` : `🔒 ${item.costSP} SP`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ShopPage
// ─────────────────────────────────────────────────────────────

type ShopTab = 'rewards' | 'cosmetics';

export default function ShopPage() {
  document.title = 'Reward Shop — DevQuest';
  const [activeTab, setActiveTab] = useState<ShopTab>('rewards');

  return (
    <div className="page shop-page">
      {/* Tab bar */}
      <div className="shop-tabs">
        <button
          id="shop-tab-rewards"
          className={`shop-tab${activeTab === 'rewards' ? ' shop-tab--active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          🎁 Rewards
        </button>
        <button
          id="shop-tab-cosmetics"
          className={`shop-tab${activeTab === 'cosmetics' ? ' shop-tab--active' : ''}`}
          onClick={() => setActiveTab('cosmetics')}
        >
          ✨ Character
        </button>
      </div>

      {activeTab === 'rewards'   && <RewardsTab />}
      {activeTab === 'cosmetics' && <CosmeticsTab />}
    </div>
  );
}
