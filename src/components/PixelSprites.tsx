import { useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import {
  getAvatar,
  getCompanionMood,
  getCompanionSpeciesStageLabel,
  type AvatarId,
  type AvatarTier,
  type CompanionStage,
  type CompanionSpecies,
} from '@/config/character';
import type { EquippedItems } from '@/types';

const avatarSheet = new URL('../assets/avatars/avatar-sprites.svg', import.meta.url).href;

type AvatarSpriteProps = {
  avatarId: AvatarId;
  tier: AvatarTier;
  equippedItems?: EquippedItems;
  className?: string;
};

export function AvatarSprite({ avatarId, tier, equippedItems, className = '' }: AvatarSpriteProps) {
  const avatar = getAvatar(avatarId);

  return (
    <span className={`pixel-avatar pixel-avatar--tier-${tier} ${className}`} aria-label={`${avatar.name} avatar, tier ${tier}`}>
      <svg viewBox="0 0 32 32" className="pixel-avatar__sprite" role="img">
        <use href={`${avatarSheet}#${avatarId}-tier${tier}`} />
      </svg>
      {equippedItems?.weapon && <span className="pixel-gear pixel-gear--weapon" title="Weapon">⚔</span>}
      {equippedItems?.shield && <span className="pixel-gear pixel-gear--shield" title="Shield">◆</span>}
      {equippedItems?.relic && <span className="pixel-gear pixel-gear--relic" title="Relic">✦</span>}
    </span>
  );
}

type CompanionDisplayProps = {
  stage: CompanionStage;
  species?: CompanionSpecies;
  name?: string;
  streak?: number;
  compact?: boolean;
  allowNaming?: boolean;
  className?: string;
};

export function CompanionDisplay({
  stage,
  species,
  name,
  streak = 0,
  compact = false,
  allowNaming = false,
  className = '',
}: CompanionDisplayProps) {
  const { companion, nameCompanion } = useGameState();
  const selectedSpecies = species ?? companion.species;
  const [modalOpen, setModalOpen] = useState(allowNaming && stage >= 1 && !name);
  const [draftName, setDraftName] = useState('');
  const mood = getCompanionMood(streak);
  const label = getCompanionSpeciesStageLabel(selectedSpecies, stage);

  const submitName = () => {
    const nextName = draftName.trim();
    if (!nextName) return;
    nameCompanion(nextName.slice(0, 20));
    setModalOpen(false);
  };

  return (
    <>
      <span
        className={`companion-display companion-display--${mood}${compact ? ' companion-display--compact' : ''} ${className}`}
        aria-label={`Companion: ${label}`}
      >
        <CompanionSprite species={selectedSpecies} stage={stage} mood={mood} />
        {!compact && <span className="companion-display__shadow" aria-hidden="true" />}
      </span>

      {modalOpen && (
        <div className="naming-modal-backdrop" role="dialog" aria-modal="true" aria-label="Name your companion">
          <div className="naming-modal">
            <CompanionDisplay species={selectedSpecies} stage={stage} streak={streak} compact />
            <h2>Your companion hatched!</h2>
            <label htmlFor="companion-name-input" className="form-label">Companion name</label>
            <input
              id="companion-name-input"
              className="form-input"
              value={draftName}
              maxLength={20}
              autoFocus
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitName()}
            />
            <button id="save-companion-name-btn" className="btn btn-primary btn-3d" disabled={!draftName.trim()} onClick={submitName}>
              Save name
            </button>
          </div>
        </div>
      )}
    </>
  );
}

type CompanionSpriteProps = {
  species: CompanionSpecies;
  stage: CompanionStage;
  mood: ReturnType<typeof getCompanionMood>;
};

function CompanionSprite({ species, stage, mood }: CompanionSpriteProps) {
  const sleepy = mood === 'sleepy';
  const happy = mood === 'happy';

  if (stage === 0 && species !== 'cat') {
    const spots = {
      spark: '#f0a85e',
      owl: '#8a6a42',
      iguana: '#67b86d',
    } as const;
    return (
      <svg viewBox="0 0 32 32" className="companion-display__sprite" role="img">
        <rect x="9" y="7" width="14" height="19" rx="7" fill={sleepy ? '#c9c4df' : '#fff1cf'} />
        <rect x="12" y="12" width="3" height="3" fill={spots[species]} />
        <rect x="18" y="17" width="3" height="3" fill={spots[species]} />
        {happy && <rect x="14" y="5" width="4" height="2" fill="#ffc247" />}
      </svg>
    );
  }

  if (species === 'owl') return <OwlSprite stage={stage} sleepy={sleepy} happy={happy} />;
  if (species === 'cat') return <CatSprite stage={stage} sleepy={sleepy} happy={happy} />;
  if (species === 'iguana') return <IguanaSprite stage={stage} sleepy={sleepy} happy={happy} />;
  return <SparkSprite stage={stage} sleepy={sleepy} happy={happy} />;
}

function EyePair({ sleepy }: { sleepy: boolean }) {
  return sleepy ? (
    <>
      <rect x="11" y="14" width="4" height="1" fill="#1e1b29" />
      <rect x="18" y="14" width="4" height="1" fill="#1e1b29" />
    </>
  ) : (
    <>
      <rect x="12" y="13" width="3" height="3" fill="#1e1b29" />
      <rect x="19" y="13" width="3" height="3" fill="#1e1b29" />
    </>
  );
}

function SparkSprite({ stage, sleepy, happy }: { stage: CompanionStage; sleepy: boolean; happy: boolean }) {
  const body = stage === 3 ? '#d8a2ff' : stage === 2 ? '#81d672' : '#7adbd0';
  const wing = stage === 3 ? '#9e70cc' : stage === 2 ? '#58a850' : '#58bfb5';
  return (
    <svg viewBox="0 0 32 32" className="companion-display__sprite" role="img">
      <rect x="9" y="9" width="14" height="14" rx="5" fill={sleepy ? '#82b9c9' : body} />
      <rect x="7" y="16" width="4" height="5" fill={wing} />
      <rect x="21" y="16" width="4" height="5" fill={wing} />
      <EyePair sleepy={sleepy} />
      <rect x="14" y="18" width="5" height="2" fill={happy ? '#ff7070' : '#746c91'} />
      <rect x="11" y="24" width="3" height="3" fill="#f2b35f" />
      <rect x="18" y="24" width="3" height="3" fill="#f2b35f" />
      {stage >= 2 && <rect x="13" y="6" width="6" height="4" fill={stage === 3 ? '#ffc247' : '#4ea85d'} />}
      {stage === 3 && <><rect x="5" y="12" width="4" height="3" fill="#ffc247" /><rect x="23" y="12" width="4" height="3" fill="#ffc247" /></>}
    </svg>
  );
}

function OwlSprite({ stage, sleepy, happy }: { stage: CompanionStage; sleepy: boolean; happy: boolean }) {
  const body = stage === 3 ? '#8b6fd1' : stage === 2 ? '#b28a5b' : '#c59b68';
  return (
    <svg viewBox="0 0 32 32" className="companion-display__sprite" role="img">
      <rect x="8" y="8" width="16" height="17" rx="6" fill={sleepy ? '#8d7f92' : body} />
      <rect x="7" y="10" width="5" height="4" fill={body} />
      <rect x="20" y="10" width="5" height="4" fill={body} />
      <rect x="11" y="12" width="5" height="5" rx="2" fill="#f6dd9b" />
      <rect x="17" y="12" width="5" height="5" rx="2" fill="#f6dd9b" />
      <EyePair sleepy={sleepy} />
      <rect x="15" y="17" width="3" height="3" fill="#e79b3f" />
      <rect x="11" y="24" width="4" height="3" fill="#e79b3f" />
      <rect x="18" y="24" width="4" height="3" fill="#e79b3f" />
      {stage >= 2 && <rect x="13" y="5" width="7" height="3" fill={happy ? '#ffc247' : '#6f5133'} />}
      {stage === 3 && <rect x="10" y="4" width="12" height="2" fill="#ffc247" />}
    </svg>
  );
}

function CatSprite({ stage, sleepy, happy }: { stage: CompanionStage; sleepy: boolean; happy: boolean }) {
  const fur = stage === 3 ? '#d7a35f' : stage === 2 ? '#8d8f9c' : '#f0b36b';
  return (
    <svg viewBox="0 0 32 32" className="companion-display__sprite" role="img">
      <rect x="8" y="10" width="16" height="15" rx="5" fill={sleepy ? '#9a8a81' : fur} />
      <rect x="9" y="6" width="5" height="6" fill={fur} />
      <rect x="19" y="6" width="5" height="6" fill={fur} />
      <rect x="11" y="8" width="2" height="3" fill="#f7d0a5" />
      <rect x="20" y="8" width="2" height="3" fill="#f7d0a5" />
      <EyePair sleepy={sleepy} />
      <rect x="16" y="17" width="2" height="2" fill="#2b2138" />
      <rect x="13" y="20" width="7" height="1" fill={happy ? '#d75f6a' : '#6d4d48'} />
      <rect x="23" y="18" width="5" height="3" rx="1" fill={stage >= 2 ? '#d7a35f' : fur} />
      {stage === 3 && <rect x="12" y="4" width="9" height="3" fill="#ffc247" />}
    </svg>
  );
}

function IguanaSprite({ stage, sleepy, happy }: { stage: CompanionStage; sleepy: boolean; happy: boolean }) {
  const body = stage === 3 ? '#41b981' : stage === 2 ? '#67b86d' : '#8fd46f';
  return (
    <svg viewBox="0 0 32 32" className="companion-display__sprite" role="img">
      <rect x="7" y="12" width="18" height="11" rx="4" fill={sleepy ? '#7e9f73' : body} />
      <rect x="19" y="9" width="7" height="8" rx="3" fill={body} />
      <EyePair sleepy={sleepy} />
      <rect x="22" y="16" width="3" height="1" fill={happy ? '#ff7070' : '#315944'} />
      <rect x="4" y="18" width="6" height="3" fill={body} />
      <rect x="10" y="23" width="3" height="3" fill="#486c42" />
      <rect x="20" y="23" width="3" height="3" fill="#486c42" />
      {stage >= 2 && <><rect x="13" y="9" width="2" height="3" fill="#e5d45c" /><rect x="16" y="8" width="2" height="4" fill="#e5d45c" /><rect x="19" y="8" width="2" height="4" fill="#e5d45c" /></>}
      {stage === 3 && <rect x="6" y="10" width="4" height="2" fill="#ffc247" />}
    </svg>
  );
}
