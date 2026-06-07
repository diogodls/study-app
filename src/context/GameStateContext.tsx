// ============================================================
// DevQuest — Game State Context
// ============================================================
// Single source of truth for all persistent game data.
// Automatically syncs to localStorage on every state change.
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import {
  getLevel,
  getProgressToNextLevel,
  getAvatarTier,
  getCompanionStage,
  XP_REWARDS,
  SP_REWARDS,
} from '@/config/levels';

import {
  GEAR_ITEMS,
  type AvatarId,
  type CompanionSpecies,
  type GearSlot,
} from '@/config/character';

import { LEARNING_PATHS } from '@/config/paths';
import { setSoundEnabled } from '@/services/soundService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';

import type {
  GameState,
  Reward,
  AddXpResult,
  CompleteNodeResult,
  GeminiModel,
  OnboardingData,
  EquippedItems,
} from '@/types';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'devquest_state_v1';
const MAX_LIVES = 5;

const DEFAULT_REWARDS: Reward[] = [
  { id: 'default-1', name: '15 min TikTok', costSP: 150, type: 'time', durationMinutes: 15 },
  { id: 'default-2', name: '1 Hour Gaming', costSP: 400, type: 'time', durationMinutes: 60 },
  { id: 'default-3', name: 'Movie Night', costSP: 800, type: 'once' },
  { id: 'default-4', name: 'Favorite Snack', costSP: 200, type: 'once' },
];

const DEFAULT_STATE: GameState = {
  xp: 0,
  studyPoints: 0,
  lives: MAX_LIVES,
  streak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  completedNodes: [],
  completedLabs: [],
  perfectLessons: 0,
  lifeRecoveries: 0,
  rewards: DEFAULT_REWARDS,
  timerEndsAt: null,
  geminiApiKey: '',
  selectedModel: 'gemini-3-flash-preview',
  soundEnabled: true,
  characterName: '',
  avatarId: 'hooded-coder',
  avatarTier: 1,
  equippedItems: {},
  unlockedGear: [],
  companion: { name: '', species: 'spark', evolutionStage: 0 },
  ownedCosmetics: [],
  equippedCosmetic: null,
  onboardingComplete: false,
  selectedPathId: LEARNING_PATHS[0].id,
};

// ─────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────
// Badge Computation (pure function — no side effects)
// ─────────────────────────────────────────────────────────────

function computeUnlockedBadgeIds(state: GameState): string[] {
  const unlocked: string[] = [];

  // Path completion badges
  const pathBadgeMap: Record<string, string> = {
    'data-structures': 'badge-dsa-complete',
    'aws':             'badge-aws-complete',
    'backend':         'badge-backend-complete',
    'system-design':   'badge-system-complete',
    'testing':         'badge-testing-complete',
    'performance':     'badge-perf-complete',
  };

  for (const path of LEARNING_PATHS) {
    const badgeId = pathBadgeMap[path.id];
    if (!badgeId) continue;
    const allDone = path.nodes.every((n) => state.completedNodes.includes(n.id));
    if (allDone) unlocked.push(badgeId);
  }

  // Streak badges
  if (state.streak >= 3)  unlocked.push('badge-3-streak');
  if (state.streak >= 7)  unlocked.push('badge-7-streak');
  if (state.streak >= 30) unlocked.push('badge-30-streak');

  // Coding lab badges
  if (state.completedLabs.length >= 1) unlocked.push('badge-lab-1');
  if (state.completedLabs.length >= 5) unlocked.push('badge-lab-5');

  // Performance badges
  if (state.perfectLessons >= 5)  unlocked.push('badge-perfect-5');
  if (state.lifeRecoveries >= 3)  unlocked.push('badge-comeback');

  // Exploration badges
  const hasAllPaths = LEARNING_PATHS.every((path) =>
    path.nodes.some((n) => state.completedNodes.includes(n.id))
  );
  if (hasAllPaths) unlocked.push('badge-all-paths');

  const isPolymath = LEARNING_PATHS.every((path) => {
    const count = path.nodes.filter((n) => state.completedNodes.includes(n.id)).length;
    return count >= 3;
  });
  if (isPolymath) unlocked.push('badge-polymath');

  return unlocked;
}

/** Returns gear item IDs unlocked by a given set of badge IDs */
function gearUnlockedByBadges(badgeIds: string[], currentGear: string[]): string[] {
  return GEAR_ITEMS
    .filter((g) => badgeIds.includes(g.badgeRequirement) && !currentGear.includes(g.id))
    .map((g) => g.id);
}

// ─────────────────────────────────────────────────────────────
// localStorage persistence
// ─────────────────────────────────────────────────────────────

function loadLocalState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      return {
        ...DEFAULT_STATE,
        ...parsed,
        companion: { ...DEFAULT_STATE.companion, ...parsed.companion },
      };
    }
  } catch {
    // Corrupted storage — fall back to defaults
  }
  return DEFAULT_STATE;
}

function legacySaveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full — silently fail
  }
}

void legacySaveState;

type UserProgressRow = {
  xp: number | null;
  study_points: number | null;
  lives: number | null;
  streak: number | null;
  longest_streak: number | null;
  last_study_date: string | null;
  perfect_lessons: number | null;
  life_recoveries: number | null;
  character_name: string | null;
  avatar_id: AvatarId | null;
  avatar_tier: 1 | 2 | 3 | null;
  onboarding_complete: boolean | null;
  equipped_items: EquippedItems | null;
  equipped_cosmetic: string | null;
  companion: GameState['companion'] | null;
  timer_ends_at: number | null;
  selected_model: GeminiModel | null;
  sound_enabled: boolean | null;
  selected_path_id: string | null;
};

async function saveCloudState(userId: string, state: GameState): Promise<void> {
  await supabase.from('user_progress').upsert({
    user_id: userId,
    xp: state.xp,
    study_points: state.studyPoints,
    lives: state.lives,
    streak: state.streak,
    longest_streak: state.longestStreak,
    last_study_date: state.lastStudyDate,
    perfect_lessons: state.perfectLessons,
    life_recoveries: state.lifeRecoveries,
    character_name: state.characterName,
    avatar_id: state.avatarId,
    avatar_tier: state.avatarTier,
    onboarding_complete: state.onboardingComplete,
    equipped_items: state.equippedItems,
    equipped_cosmetic: state.equippedCosmetic,
    companion: state.companion,
    timer_ends_at: state.timerEndsAt,
    selected_model: state.selectedModel,
    sound_enabled: state.soundEnabled,
    selected_path_id: state.selectedPathId,
    updated_at: new Date().toISOString(),
  });

  await supabase.from('user_completions').delete().eq('user_id', userId);
  const completions = [
    ...state.completedNodes.map((nodeId) => ({ user_id: userId, node_id: nodeId, type: 'node' })),
    ...state.completedLabs.map((nodeId) => ({ user_id: userId, node_id: nodeId, type: 'lab' })),
  ];
  if (completions.length) await supabase.from('user_completions').insert(completions);

  await supabase.from('user_cosmetics').delete().eq('user_id', userId);
  if (state.ownedCosmetics.length) {
    await supabase.from('user_cosmetics').insert(
      state.ownedCosmetics.map((cosmeticId) => ({ user_id: userId, cosmetic_id: cosmeticId })),
    );
  }

  await supabase.from('user_gear').delete().eq('user_id', userId);
  if (state.unlockedGear.length) {
    await supabase.from('user_gear').insert(
      state.unlockedGear.map((gearId) => ({ user_id: userId, gear_id: gearId })),
    );
  }

  await supabase.from('user_rewards').delete().eq('user_id', userId);
  if (state.rewards.length) {
    await supabase.from('user_rewards').insert(
      state.rewards.map((reward) => ({
        id: reward.id,
        user_id: userId,
        name: reward.name,
        cost_sp: reward.costSP,
        type: reward.type,
        duration_minutes: reward.durationMinutes ?? null,
      })),
    );
  }
}

async function loadCloudState(userId: string): Promise<GameState | null> {
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<UserProgressRow>();

  if (progressError) throw progressError;
  if (!progress) return null;

  const [completionsResult, cosmeticsResult, gearResult, rewardsResult] = await Promise.all([
    supabase.from('user_completions').select('node_id,type').eq('user_id', userId),
    supabase.from('user_cosmetics').select('cosmetic_id').eq('user_id', userId),
    supabase.from('user_gear').select('gear_id').eq('user_id', userId),
    supabase.from('user_rewards').select('id,name,cost_sp,type,duration_minutes').eq('user_id', userId),
  ]);

  if (completionsResult.error) throw completionsResult.error;
  if (cosmeticsResult.error) throw cosmeticsResult.error;
  if (gearResult.error) throw gearResult.error;
  if (rewardsResult.error) throw rewardsResult.error;

  const completions = completionsResult.data ?? [];

  return {
    ...DEFAULT_STATE,
    xp: progress.xp ?? DEFAULT_STATE.xp,
    studyPoints: progress.study_points ?? DEFAULT_STATE.studyPoints,
    lives: progress.lives ?? DEFAULT_STATE.lives,
    streak: progress.streak ?? DEFAULT_STATE.streak,
    longestStreak: progress.longest_streak ?? DEFAULT_STATE.longestStreak,
    lastStudyDate: progress.last_study_date,
    completedNodes: completions.filter((row) => row.type === 'node').map((row) => row.node_id),
    completedLabs: completions.filter((row) => row.type === 'lab').map((row) => row.node_id),
    perfectLessons: progress.perfect_lessons ?? DEFAULT_STATE.perfectLessons,
    lifeRecoveries: progress.life_recoveries ?? DEFAULT_STATE.lifeRecoveries,
    rewards: (rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      name: reward.name,
      costSP: reward.cost_sp,
      type: reward.type,
      durationMinutes: reward.duration_minutes ?? undefined,
    })),
    timerEndsAt: progress.timer_ends_at,
    geminiApiKey: '',
    selectedModel: progress.selected_model ?? DEFAULT_STATE.selectedModel,
    soundEnabled: progress.sound_enabled ?? DEFAULT_STATE.soundEnabled,
    characterName: progress.character_name ?? DEFAULT_STATE.characterName,
    avatarId: progress.avatar_id ?? DEFAULT_STATE.avatarId,
    avatarTier: progress.avatar_tier ?? DEFAULT_STATE.avatarTier,
    equippedItems: progress.equipped_items ?? DEFAULT_STATE.equippedItems,
    unlockedGear: (gearResult.data ?? []).map((row) => row.gear_id),
    companion: { ...DEFAULT_STATE.companion, ...progress.companion },
    ownedCosmetics: (cosmeticsResult.data ?? []).map((row) => row.cosmetic_id),
    equippedCosmetic: progress.equipped_cosmetic,
    onboardingComplete: progress.onboarding_complete ?? DEFAULT_STATE.onboardingComplete,
    selectedPathId: progress.selected_path_id ?? DEFAULT_STATE.selectedPathId,
  };
}

// ─────────────────────────────────────────────────────────────
// Context Type
// ─────────────────────────────────────────────────────────────

type GameContextValue = GameState & {
  // Derived values
  level: number;
  progress: ReturnType<typeof getProgressToNextLevel>;
  unlockedBadgeIds: string[];
  cloudLoading: boolean;

  // Core actions
  addXp: (amount: number) => AddXpResult;
  addStudyPoints: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  loseLife: () => void;
  gainLife: () => void;

  // Node completion
  completeNode: (nodeId: string) => CompleteNodeResult;
  completeLab: (nodeId: string) => CompleteNodeResult;
  incrementPerfectLessons: () => void;
  incrementLifeRecoveries: () => void;

  // Shop
  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (id: string) => void;
  setTimerEndsAt: (ts: number | null) => void;

  // Settings
  setApiKey: (key: string) => void;
  setModel: (model: GeminiModel) => void;
  setSoundEnabledState: (enabled: boolean) => void;

  // Character
  setAvatarId: (id: AvatarId) => void;
  setCharacterName: (name: string) => void;
  equipItem: (slot: GearSlot, itemId: string) => void;
  unequipItem: (slot: GearSlot) => void;
  buyCosmetic: (cosmeticId: string, costSP: number) => boolean;
  equipCosmetic: (cosmeticId: string | null) => void;
  nameCompanion: (name: string) => void;
  setCompanionSpecies: (species: CompanionSpecies) => void;
  completeOnboarding: (data: OnboardingData) => void;

  // System
  resetAll: () => void;
};

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const GameStateContext = createContext<GameContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [cloudLoading, setCloudLoading] = useState(true);
  const cloudLoadedRef = useRef(false);

  // Always-current ref for use inside useCallback without stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load cloud state after login. If this is the user's first cloud login,
  // migrate the pre-cloud localStorage progress once.
  useEffect(() => {
    let cancelled = false;
    cloudLoadedRef.current = false;

    if (!user) {
      setState(DEFAULT_STATE);
      setCloudLoading(false);
      return;
    }

    setCloudLoading(true);
    loadCloudState(user.id)
      .then(async (cloudState) => {
        if (cancelled) return;
        if (cloudState) {
          setState(cloudState);
        } else {
          const localState = { ...loadLocalState(), geminiApiKey: '' };
          setState(localState);
          await saveCloudState(user.id, localState);
          localStorage.removeItem(STORAGE_KEY);
        }
        cloudLoadedRef.current = true;
      })
      .catch((error) => {
        console.error('Failed to load cloud state', error);
        if (!cancelled) setState(DEFAULT_STATE);
      })
      .finally(() => {
        if (!cancelled) setCloudLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Supabase is the source of truth after login.
  useEffect(() => {
    if (!user || !cloudLoadedRef.current || cloudLoading) return;
    saveCloudState(user.id, state).catch((error) => {
      console.error('Failed to save cloud state', error);
    });
  }, [state, user, cloudLoading]);

  // Sync sound service with setting
  useEffect(() => {
    setSoundEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  // Life auto-regen: +1 life every 4 hours while app is open
  useEffect(() => {
    const REGEN_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
    const id = setInterval(() => {
      setState((s) => {
        if (s.lives >= MAX_LIVES) return s;
        return { ...s, lives: Math.min(MAX_LIVES, s.lives + 1) };
      });
    }, REGEN_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // ── Derived values ──────────────────────────────────────

  const level = useMemo(() => getLevel(state.xp), [state.xp]);

  const progress = useMemo(
    () => getProgressToNextLevel(state.xp),
    [state.xp],
  );

  const unlockedBadgeIds = useMemo(
    () => computeUnlockedBadgeIds(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.completedNodes,
      state.completedLabs,
      state.streak,
      state.perfectLessons,
      state.lifeRecoveries,
    ],
  );

  // ── XP & Currency ────────────────────────────────────────

  const addXp = useCallback((amount: number): AddXpResult => {
    const prev = stateRef.current;
    const prevLevel = getLevel(prev.xp);
    const newXp = prev.xp + amount;
    const newLevel = getLevel(newXp);
    const prevTier = getAvatarTier(prevLevel);
    const newTier = getAvatarTier(newLevel);
    const prevStage = getCompanionStage(prevLevel);
    const newStage = getCompanionStage(newLevel);

    setState((s) => ({
      ...s,
      xp: newXp,
      avatarTier: newTier,
      companion: {
        ...s.companion,
        evolutionStage: newStage,
      },
    }));

    return {
      leveledUp: newLevel > prevLevel,
      prevLevel,
      newLevel,
      tierChanged: newTier > prevTier,
      newTier,
      companionEvolved: newStage > prevStage,
      newCompanionStage: newStage,
    };
  }, []);

  const addStudyPoints = useCallback((amount: number) => {
    setState((s) => ({ ...s, studyPoints: s.studyPoints + amount }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    const prev = stateRef.current;
    if (prev.studyPoints < amount) return false;
    setState((s) => ({ ...s, studyPoints: s.studyPoints - amount }));
    return true;
  }, []);

  // ── Lives ────────────────────────────────────────────────

  const loseLife = useCallback(() => {
    setState((s) => ({ ...s, lives: Math.max(0, s.lives - 1) }));
  }, []);

  const gainLife = useCallback(() => {
    setState((s) => ({ ...s, lives: Math.min(MAX_LIVES, s.lives + 1) }));
  }, []);

  // ── Node & Lab completion ─────────────────────────────────

  /** Shared logic for completing a node or lab */
  function buildCompleteResult(
    prevState: GameState,
    nextState: GameState,
  ): CompleteNodeResult {
    const prevBadges = computeUnlockedBadgeIds(prevState);
    const nextBadges = computeUnlockedBadgeIds(nextState);
    const newlyUnlockedBadges = nextBadges.filter((id) => !prevBadges.includes(id));
    const newlyUnlockedGear = gearUnlockedByBadges(newlyUnlockedBadges, prevState.unlockedGear);
    return { newlyUnlockedBadges, newlyUnlockedGear };
  }

  const completeNode = useCallback((nodeId: string): CompleteNodeResult => {
    const prev = stateRef.current;
    if (prev.completedNodes.includes(nodeId)) {
      return { newlyUnlockedBadges: [], newlyUnlockedGear: [] };
    }

    // Update streak
    const today = getTodayString();
    const yesterday = getYesterdayString();
    let newStreak = prev.streak;

    if (prev.lastStudyDate === today) {
      // Already studied today — no streak change
    } else if (prev.lastStudyDate === yesterday) {
      newStreak = prev.streak + 1;
    } else {
      newStreak = 1; // Streak broken
    }

    const newLongestStreak = Math.max(prev.longestStreak, newStreak);
    const newCompletedNodes = [...prev.completedNodes, nodeId];

    const nextState: GameState = {
      ...prev,
      completedNodes: newCompletedNodes,
      streak: newStreak,
      longestStreak: newLongestStreak,
      lastStudyDate: today,
    };

    const result = buildCompleteResult(prev, nextState);

    setState((current) => ({
      ...current,
      completedNodes: nextState.completedNodes,
      streak: nextState.streak,
      longestStreak: nextState.longestStreak,
      lastStudyDate: nextState.lastStudyDate,
      unlockedGear: [...current.unlockedGear, ...result.newlyUnlockedGear.filter((gearId) => !current.unlockedGear.includes(gearId))],
    }));

    return result;
  }, []);

  const completeLab = useCallback((nodeId: string): CompleteNodeResult => {
    const prev = stateRef.current;
    if (prev.completedLabs.includes(nodeId)) {
      return { newlyUnlockedBadges: [], newlyUnlockedGear: [] };
    }

    const newCompletedLabs = [...prev.completedLabs, nodeId];
    const nextState: GameState = { ...prev, completedLabs: newCompletedLabs };
    const result = buildCompleteResult(prev, nextState);

    setState((current) => ({
      ...current,
      completedLabs: nextState.completedLabs,
      unlockedGear: [...current.unlockedGear, ...result.newlyUnlockedGear.filter((gearId) => !current.unlockedGear.includes(gearId))],
    }));

    return result;
  }, []);

  const incrementPerfectLessons = useCallback(() => {
    setState((s) => ({ ...s, perfectLessons: s.perfectLessons + 1 }));
  }, []);

  const incrementLifeRecoveries = useCallback(() => {
    setState((s) => ({ ...s, lifeRecoveries: s.lifeRecoveries + 1 }));
  }, []);

  // ── Shop ──────────────────────────────────────────────────

  const addReward = useCallback((reward: Omit<Reward, 'id'>) => {
    const id = `reward-${Date.now()}`;
    setState((s) => ({
      ...s,
      rewards: [...s.rewards, { ...reward, id }],
    }));
  }, []);

  const removeReward = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      rewards: s.rewards.filter((r) => r.id !== id),
    }));
  }, []);

  const setTimerEndsAt = useCallback((ts: number | null) => {
    setState((s) => ({ ...s, timerEndsAt: ts }));
  }, []);

  // ── Settings ──────────────────────────────────────────────

  const setApiKey = useCallback((key: string) => {
    void key;
    setState((s) => ({ ...s, geminiApiKey: '' }));
  }, []);

  const setModel = useCallback((model: GeminiModel) => {
    setState((s) => ({ ...s, selectedModel: model }));
  }, []);

  const setSoundEnabledState = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    setState((s) => ({ ...s, soundEnabled: enabled }));
  }, []);

  // ── Character ─────────────────────────────────────────────

  const setAvatarId = useCallback((id: AvatarId) => {
    setState((s) => ({ ...s, avatarId: id }));
  }, []);

  const setCharacterName = useCallback((name: string) => {
    setState((s) => ({ ...s, characterName: name }));
  }, []);

  const equipItem = useCallback((slot: GearSlot, itemId: string) => {
    setState((s) => ({
      ...s,
      equippedItems: { ...s.equippedItems, [slot]: itemId } as EquippedItems,
    }));
  }, []);

  const unequipItem = useCallback((slot: GearSlot) => {
    setState((s) => {
      const items = { ...s.equippedItems };
      delete items[slot];
      return { ...s, equippedItems: items };
    });
  }, []);

  const buyCosmetic = useCallback((cosmeticId: string, costSP: number): boolean => {
    const prev = stateRef.current;
    if (prev.ownedCosmetics.includes(cosmeticId)) return true; // already owned
    if (prev.studyPoints < costSP) return false; // insufficient SP
    setState((s) => ({
      ...s,
      studyPoints: s.studyPoints - costSP,
      ownedCosmetics: [...s.ownedCosmetics, cosmeticId],
    }));
    return true;
  }, []);

  const equipCosmetic = useCallback((cosmeticId: string | null) => {
    setState((s) => ({ ...s, equippedCosmetic: cosmeticId }));
  }, []);

  const nameCompanion = useCallback((name: string) => {
    setState((s) => ({
      ...s,
      companion: { ...s.companion, name },
    }));
  }, []);

  const setCompanionSpecies = useCallback((species: CompanionSpecies) => {
    setState((s) => ({
      ...s,
      companion: { ...s.companion, species },
    }));
  }, []);

  const completeOnboarding = useCallback((data: OnboardingData) => {
    const { avatarId, characterName, startingPathId, companionSpecies } = data;

    // Unlock the first node of the chosen starting path
    const startingPath = LEARNING_PATHS.find((p) => p.id === startingPathId);
    const firstNodeId = startingPath?.nodes.find((n) => n.prerequisiteIds.length === 0)?.id;

    setState((s) => ({
      ...s,
      avatarId,
      characterName,
      companion: { ...s.companion, species: companionSpecies ?? s.companion.species },
      geminiApiKey: '',
      onboardingComplete: true,
      selectedPathId: startingPathId,
      // We don't auto-complete the first node, just ensure the path is "selected"
      // The first node is naturally available since it has no prerequisites
      completedNodes: firstNodeId ? [] : s.completedNodes, // remains empty — first node shows as available
    }));

    // Suppress unused variable warning
    void firstNodeId;
  }, []);

  // ── System ────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
    const userId = user?.id;
    if (!userId) return;
    Promise.all([
      supabase.from('user_rewards').delete().eq('user_id', userId),
      supabase.from('user_gear').delete().eq('user_id', userId),
      supabase.from('user_cosmetics').delete().eq('user_id', userId),
      supabase.from('user_completions').delete().eq('user_id', userId),
      supabase.from('user_generated_content').delete().eq('user_id', userId),
      supabase.from('user_content_notes').delete().eq('user_id', userId),
      supabase.from('user_progress').delete().eq('user_id', userId),
    ]).catch((error) => console.error('Failed to reset cloud state', error));
  }, [user]);

  // ── Context value ─────────────────────────────────────────

  const value: GameContextValue = {
    ...state,
    level,
    progress,
    unlockedBadgeIds,
    cloudLoading,
    addXp,
    addStudyPoints,
    spendCoins,
    loseLife,
    gainLife,
    completeNode,
    completeLab,
    incrementPerfectLessons,
    incrementLifeRecoveries,
    addReward,
    removeReward,
    setTimerEndsAt,
    setApiKey,
    setModel,
    setSoundEnabledState,
    setAvatarId,
    setCharacterName,
    equipItem,
    unequipItem,
    buyCosmetic,
    equipCosmetic,
    nameCompanion,
    setCompanionSpecies,
    completeOnboarding,
    resetAll,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useGameState(): GameContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error('useGameState must be used inside <GameStateProvider>');
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────
// XP & SP reward constants (re-exported for convenience)
// ─────────────────────────────────────────────────────────────
export { XP_REWARDS, SP_REWARDS };
