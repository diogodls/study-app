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
} from '@/config/levels';

import {
  GEAR_ITEMS,
  COSMETIC_ITEMS,
  type AvatarId,
  type CompanionSpecies,
  type GearSlot,
  type CosmeticType,
} from '@/config/character';

import { LEARNING_PATHS, getCompletedNodesFromDepths } from '@/config/paths';
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
  NodeDepth,
  ContentLanguage,
} from '@/types';

const STORAGE_KEY = 'devquest_state_v2';
const MAX_LIVES = 5;
const MASTER_REWARD_MILESTONES = [3, 6, 10, 15, 20] as const;

const DEFAULT_REWARDS: Reward[] = [
  { id: 'default-1', name: '15 min TikTok', costSP: 150, type: 'time', durationMinutes: 15 },
  { id: 'default-2', name: '1 Hour Gaming', costSP: 400, type: 'time', durationMinutes: 60 },
  { id: 'default-3', name: 'Movie Night', costSP: 800, type: 'once' },
  { id: 'default-4', name: 'Favorite Snack', costSP: 200, type: 'once' },
];
const DEFAULT_REWARD_IDS = new Set(DEFAULT_REWARDS.map((reward) => reward.id));

function mergeRewardsWithDefaults(rewards: Reward[]): Reward[] {
  const merged = new Map<string, Reward>();
  for (const reward of DEFAULT_REWARDS) merged.set(reward.id, reward);
  for (const reward of rewards) merged.set(reward.id, reward);
  return Array.from(merged.values());
}

const DEFAULT_STATE: GameState = {
  xp: 0,
  studyPoints: 0,
  lives: MAX_LIVES,
  streak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  nodeDepths: {},
  completedNodes: [],
  completedLabs: [],
  masteredNodeCount: 0,
  claimedMasterRewardMilestones: [],
  perfectLessons: 0,
  lifeRecoveries: 0,
  rewards: DEFAULT_REWARDS,
  timerEndsAt: null,
  geminiApiKey: '',
  selectedModel: 'gemini-3-flash-preview',
  language: 'en',
  soundEnabled: true,
  studyReminderEnabled: false,
  studyReminderTime: '19:00',
  studyReminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
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

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildCompletedLabs(nodeDepthRows: NodeDepthRow[]): string[] {
  return nodeDepthRows.filter((row) => row.deepen_lab_completed).map((row) => row.node_id);
}

function buildCompletedNodes(nodeDepths: Record<string, NodeDepth>): string[] {
  return getCompletedNodesFromDepths(nodeDepths);
}

function countMastered(nodeDepths: Record<string, NodeDepth>): number {
  return Object.values(nodeDepths).filter((depth) => depth >= 3).length;
}

function withDerivedProgress(state: GameState): GameState {
  const completedNodes = buildCompletedNodes(state.nodeDepths);
  const masteredNodeCount = countMastered(state.nodeDepths);
  return {
    ...state,
    completedNodes,
    masteredNodeCount,
  };
}

function loadLocalState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      return withDerivedProgress({
        ...DEFAULT_STATE,
        ...parsed,
        nodeDepths: parsed.nodeDepths ?? {},
        completedLabs: parsed.completedLabs ?? [],
        companion: { ...DEFAULT_STATE.companion, ...parsed.companion },
      });
    }
  } catch {
    return DEFAULT_STATE;
  }
  return DEFAULT_STATE;
}

function saveLocalState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Local persistence is optional when storage is unavailable.
  }
}

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
  language: ContentLanguage | null;
  sound_enabled: boolean | null;
  study_reminder_enabled: boolean | null;
  study_reminder_time: string | null;
  study_reminder_timezone: string | null;
  selected_path_id: string | null;
};

type NodeDepthRow = {
  node_id: string;
  depth: NodeDepth;
  deepen_lab_completed: boolean;
};

type MasterRewardRow = {
  milestone: number;
  cosmetic_id: string;
};

async function saveCloudProgress(userId: string, state: GameState): Promise<void> {
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
    language: state.language,
    sound_enabled: state.soundEnabled,
    study_reminder_enabled: state.studyReminderEnabled,
    study_reminder_time: state.studyReminderTime,
    study_reminder_timezone: state.studyReminderTimezone,
    selected_path_id: state.selectedPathId,
    updated_at: new Date().toISOString(),
  });
}

async function saveCloudSnapshot(userId: string, state: GameState): Promise<void> {
  await saveCloudProgress(userId, state);
  const depthRows = Object.entries(state.nodeDepths).map(([nodeId, depth]) => ({
    user_id: userId,
    node_id: nodeId,
    depth,
    deepen_lab_completed: state.completedLabs.includes(nodeId),
    updated_at: new Date().toISOString(),
  }));
  if (depthRows.length) {
    await supabase.from('user_node_depths').upsert(depthRows, { onConflict: 'user_id,node_id' });
  }

  if (state.ownedCosmetics.length) {
    await supabase.from('user_cosmetics').upsert(
      state.ownedCosmetics.map((cosmeticId) => ({ user_id: userId, cosmetic_id: cosmeticId })),
      { onConflict: 'user_id,cosmetic_id' },
    );
  }

  if (state.unlockedGear.length) {
    await supabase.from('user_gear').upsert(
      state.unlockedGear.map((gearId) => ({ user_id: userId, gear_id: gearId })),
      { onConflict: 'user_id,gear_id' },
    );
  }

  if (state.rewards.length) {
    await supabase.from('user_rewards').upsert(
      state.rewards.map((reward) => ({
        id: reward.id,
        user_id: userId,
        name: reward.name,
        cost_sp: reward.costSP,
        type: reward.type,
        duration_minutes: reward.durationMinutes ?? null,
      })),
      { onConflict: 'id' },
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

  const [nodeDepthsResult, cosmeticsResult, gearResult, rewardsResult, masterRewardsResult, legacyCompletionsResult] = await Promise.all([
    supabase.from('user_node_depths').select('node_id,depth,deepen_lab_completed').eq('user_id', userId),
    supabase.from('user_cosmetics').select('cosmetic_id').eq('user_id', userId),
    supabase.from('user_gear').select('gear_id').eq('user_id', userId),
    supabase.from('user_rewards').select('id,name,cost_sp,type,duration_minutes').eq('user_id', userId),
    supabase.from('user_master_rewards').select('milestone,cosmetic_id').eq('user_id', userId),
    supabase.from('user_completions').select('node_id').eq('user_id', userId),
  ]);

  if (nodeDepthsResult.error) throw nodeDepthsResult.error;
  if (cosmeticsResult.error) throw cosmeticsResult.error;
  if (gearResult.error) throw gearResult.error;
  if (rewardsResult.error) throw rewardsResult.error;
  if (masterRewardsResult.error) throw masterRewardsResult.error;

  const depthRows = (nodeDepthsResult.data ?? []) as NodeDepthRow[];
  const nodeDepths = depthRows.reduce<Record<string, NodeDepth>>((acc, row) => {
    acc[row.node_id] = row.depth;
    return acc;
  }, {});

  if ((legacyCompletionsResult.data?.length ?? 0) > 0) {
    void supabase.from('user_completions').delete().eq('user_id', userId);
  }

  return withDerivedProgress({
    ...DEFAULT_STATE,
    xp: progress.xp ?? DEFAULT_STATE.xp,
    studyPoints: progress.study_points ?? DEFAULT_STATE.studyPoints,
    lives: progress.lives ?? DEFAULT_STATE.lives,
    streak: progress.streak ?? DEFAULT_STATE.streak,
    longestStreak: progress.longest_streak ?? DEFAULT_STATE.longestStreak,
    lastStudyDate: progress.last_study_date,
    nodeDepths,
    completedLabs: buildCompletedLabs(depthRows),
    claimedMasterRewardMilestones: (masterRewardsResult.data ?? []).map((row: MasterRewardRow) => row.milestone),
    perfectLessons: progress.perfect_lessons ?? DEFAULT_STATE.perfectLessons,
    lifeRecoveries: progress.life_recoveries ?? DEFAULT_STATE.lifeRecoveries,
    rewards: mergeRewardsWithDefaults((rewardsResult.data ?? []).map((reward) => ({
      id: reward.id,
      name: reward.name,
      costSP: reward.cost_sp,
      type: reward.type,
      durationMinutes: reward.duration_minutes ?? undefined,
    }))),
    timerEndsAt: progress.timer_ends_at,
    geminiApiKey: '',
    selectedModel: progress.selected_model ?? DEFAULT_STATE.selectedModel,
    language: progress.language ?? DEFAULT_STATE.language,
    soundEnabled: progress.sound_enabled ?? DEFAULT_STATE.soundEnabled,
    studyReminderEnabled: progress.study_reminder_enabled ?? DEFAULT_STATE.studyReminderEnabled,
    studyReminderTime: progress.study_reminder_time ?? DEFAULT_STATE.studyReminderTime,
    studyReminderTimezone: progress.study_reminder_timezone ?? DEFAULT_STATE.studyReminderTimezone,
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
  });
}

function computeUnlockedBadgeIds(state: GameState): string[] {
  const unlocked: string[] = [];
  const pathBadgeMap: Record<string, string> = {
    'data-structures': 'badge-dsa-complete',
    aws: 'badge-aws-complete',
    backend: 'badge-backend-complete',
    'system-design': 'badge-system-complete',
    testing: 'badge-testing-complete',
    performance: 'badge-perf-complete',
    'frontend-rendering': 'badge-frontend-complete',
  };

  for (const path of LEARNING_PATHS) {
    const badgeId = pathBadgeMap[path.id];
    if (!badgeId) continue;
    const allMastered = path.nodes.every((node) => (state.nodeDepths[node.id] ?? 0) >= 3);
    if (allMastered) unlocked.push(badgeId);
  }

  if (state.streak >= 3) unlocked.push('badge-3-streak');
  if (state.streak >= 7) unlocked.push('badge-7-streak');
  if (state.streak >= 30) unlocked.push('badge-30-streak');
  if (state.completedLabs.length >= 1) unlocked.push('badge-lab-1');
  if (state.completedLabs.length >= 5) unlocked.push('badge-lab-5');
  if (state.perfectLessons >= 5) unlocked.push('badge-perfect-5');
  if (state.lifeRecoveries >= 3) unlocked.push('badge-comeback');

  const hasAllPaths = LEARNING_PATHS.every((path) => path.nodes.some((node) => (state.nodeDepths[node.id] ?? 0) >= 1));
  if (hasAllPaths) unlocked.push('badge-all-paths');

  const isPolymath = LEARNING_PATHS.every((path) => path.nodes.filter((node) => (state.nodeDepths[node.id] ?? 0) >= 1).length >= 3);
  if (isPolymath) unlocked.push('badge-polymath');

  return unlocked;
}

function gearUnlockedByBadges(badgeIds: string[], currentGear: string[]): string[] {
  return GEAR_ITEMS
    .filter((item) => badgeIds.includes(item.badgeRequirement) && !currentGear.includes(item.id))
    .map((item) => item.id);
}

function selectMasterReward(state: GameState) {
  const remaining = COSMETIC_ITEMS.filter((item) => !state.ownedCosmetics.includes(item.id));
  if (!remaining.length) return null;

  const types: CosmeticType[] = ['frame', 'theme', 'companion-accessory'];
  const preferredType = types[Math.floor(Math.random() * types.length)];
  const candidates = remaining.filter((item) => item.type === preferredType);
  const pool = candidates.length ? candidates : remaining;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

type GameContextValue = GameState & {
  level: number;
  progress: ReturnType<typeof getProgressToNextLevel>;
  unlockedBadgeIds: string[];
  cloudLoading: boolean;
  addXp: (amount: number) => AddXpResult;
  applyCloudRewardTotals: (totalXp: number, totalStudyPoints: number) => AddXpResult;
  addStudyPoints: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  loseLife: () => void;
  gainLife: () => void;
  completeDepth: (nodeId: string, depth: NodeDepth) => CompleteNodeResult;
  markDeepenLabComplete: (nodeId: string) => void;
  incrementPerfectLessons: () => void;
  incrementLifeRecoveries: () => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  removeReward: (id: string) => void;
  setTimerEndsAt: (ts: number | null) => void;
  setApiKey: (key: string) => void;
  setModel: (model: GeminiModel) => void;
  setLanguage: (language: ContentLanguage) => void;
  setSoundEnabledState: (enabled: boolean) => void;
  setStudyReminder: (enabled: boolean, time?: string) => void;
  setAvatarId: (id: AvatarId) => void;
  setCharacterName: (name: string) => void;
  equipItem: (slot: GearSlot, itemId: string) => void;
  unequipItem: (slot: GearSlot) => void;
  buyCosmetic: (cosmeticId: string, costSP: number) => boolean;
  equipCosmetic: (cosmeticId: string | null) => void;
  nameCompanion: (name: string) => void;
  setCompanionSpecies: (species: CompanionSpecies) => void;
  completeOnboarding: (data: OnboardingData) => void;
  resetAll: () => void;
};

const GameStateContext = createContext<GameContextValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<GameState>(loadLocalState());
  const [cloudLoading, setCloudLoading] = useState(true);
  const cloudLoadedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    cloudLoadedRef.current = false;

    if (!user) {
      const local = loadLocalState();
      setState(local);
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
          const localState = withDerivedProgress({ ...loadLocalState(), geminiApiKey: '' });
          setState(localState);
          await saveCloudSnapshot(user.id, localState);
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

  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  useEffect(() => {
    if (!user || !cloudLoadedRef.current || cloudLoading) return;
    const timeoutId = window.setTimeout(() => {
      saveCloudProgress(user.id, state).catch((error) => {
        console.error('Failed to save cloud progress', error);
      });
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [state, user, cloudLoading]);

  useEffect(() => {
    setSoundEnabled(state.soundEnabled);
  }, [state.soundEnabled]);

  useEffect(() => {
    const id = setInterval(() => {
      setState((current) => {
        if (current.lives >= MAX_LIVES) return current;
        return { ...current, lives: Math.min(MAX_LIVES, current.lives + 1) };
      });
    }, 4 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const level = useMemo(() => getLevel(state.xp), [state.xp]);
  const progress = useMemo(() => getProgressToNextLevel(state.xp), [state.xp]);
  const unlockedBadgeIds = useMemo(() => computeUnlockedBadgeIds(state), [state]);

  const addXp = useCallback((amount: number): AddXpResult => {
    const prev = stateRef.current;
    const prevLevel = getLevel(prev.xp);
    const newXp = prev.xp + amount;
    const newLevel = getLevel(newXp);
    const prevTier = getAvatarTier(prevLevel);
    const newTier = getAvatarTier(newLevel);
    const prevStage = getCompanionStage(prevLevel);
    const newStage = getCompanionStage(newLevel);

    setState((current) => ({
      ...current,
      xp: newXp,
      avatarTier: newTier,
      companion: { ...current.companion, evolutionStage: newStage },
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

  const applyCloudRewardTotals = useCallback((totalXp: number, totalStudyPoints: number): AddXpResult => {
    const prev = stateRef.current;
    const prevLevel = getLevel(prev.xp);
    const newLevel = getLevel(totalXp);
    const prevTier = getAvatarTier(prevLevel);
    const newTier = getAvatarTier(newLevel);
    const prevStage = getCompanionStage(prevLevel);
    const newStage = getCompanionStage(newLevel);

    setState((current) => ({
      ...current,
      xp: totalXp,
      studyPoints: totalStudyPoints,
      avatarTier: newTier,
      companion: { ...current.companion, evolutionStage: newStage },
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
    setState((current) => ({ ...current, studyPoints: current.studyPoints + amount }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    const prev = stateRef.current;
    if (prev.studyPoints < amount) return false;
    setState((current) => ({ ...current, studyPoints: current.studyPoints - amount }));
    return true;
  }, []);

  const loseLife = useCallback(() => {
    setState((current) => ({ ...current, lives: Math.max(0, current.lives - 1) }));
  }, []);

  const gainLife = useCallback(() => {
    setState((current) => ({ ...current, lives: Math.min(MAX_LIVES, current.lives + 1) }));
  }, []);

  function buildCompleteResult(prevState: GameState, nextState: GameState): CompleteNodeResult {
    const prevBadges = computeUnlockedBadgeIds(prevState);
    const nextBadges = computeUnlockedBadgeIds(nextState);
    const newlyUnlockedBadges = nextBadges.filter((id) => !prevBadges.includes(id));
    const newlyUnlockedGear = gearUnlockedByBadges(newlyUnlockedBadges, prevState.unlockedGear);
    return {
      newlyUnlockedBadges,
      newlyUnlockedGear,
      newlyUnlockedCosmetics: [],
      claimedMasterMilestone: null,
    };
  }

  const completeDepth = useCallback((nodeId: string, depth: NodeDepth): CompleteNodeResult => {
    const prev = stateRef.current;
    const currentDepth = prev.nodeDepths[nodeId] ?? 0;
    if (depth <= currentDepth) {
      return { newlyUnlockedBadges: [], newlyUnlockedGear: [], newlyUnlockedCosmetics: [], claimedMasterMilestone: null };
    }
    if (depth !== currentDepth + 1) {
      return { newlyUnlockedBadges: [], newlyUnlockedGear: [], newlyUnlockedCosmetics: [], claimedMasterMilestone: null };
    }

    const today = getTodayString();
    const yesterday = getYesterdayString();
    let newStreak = prev.streak;
    if (prev.lastStudyDate !== today) {
      newStreak = prev.lastStudyDate === yesterday ? prev.streak + 1 : 1;
    }

    const nextNodeDepths = { ...prev.nodeDepths, [nodeId]: depth };
    let nextState = withDerivedProgress({
      ...prev,
      nodeDepths: nextNodeDepths,
      streak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastStudyDate: today,
    });

    const baseResult = buildCompleteResult(prev, nextState);
    let newlyUnlockedCosmetics: string[] = [];
    let claimedMasterMilestone: number | null = null;

    if (depth >= 3) {
      const milestone = MASTER_REWARD_MILESTONES.find(
        (value) => value === nextState.masteredNodeCount && !nextState.claimedMasterRewardMilestones.includes(value),
      ) ?? null;
      if (milestone) {
        const reward = selectMasterReward(nextState);
        claimedMasterMilestone = milestone;
        nextState = {
          ...nextState,
          claimedMasterRewardMilestones: [...nextState.claimedMasterRewardMilestones, milestone],
          ownedCosmetics: reward ? [...nextState.ownedCosmetics, reward.id] : nextState.ownedCosmetics,
        };
        newlyUnlockedCosmetics = reward ? [reward.id] : [];
        if (user) {
          void supabase.from('user_master_rewards').upsert({
            user_id: user.id,
            milestone,
            cosmetic_id: reward?.id ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,milestone' });
        }
      }
    }

    const finalResult = buildCompleteResult(prev, nextState);
    const mergedGear = [...new Set([...nextState.unlockedGear, ...baseResult.newlyUnlockedGear, ...finalResult.newlyUnlockedGear])];
    const mergedState = withDerivedProgress({ ...nextState, unlockedGear: mergedGear });

    setState(mergedState);

    if (user) {
      void supabase.from('user_node_depths').upsert({
        user_id: user.id,
        node_id: nodeId,
        depth,
        deepen_lab_completed: mergedState.completedLabs.includes(nodeId),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,node_id' });

      const newlyUnlockedGear = mergedGear.filter((gearId) => !prev.unlockedGear.includes(gearId));
      if (newlyUnlockedGear.length) {
        void supabase.from('user_gear').upsert(
          newlyUnlockedGear.map((gearId) => ({ user_id: user.id, gear_id: gearId })),
          { onConflict: 'user_id,gear_id' },
        );
      }
      if (newlyUnlockedCosmetics.length) {
        void supabase.from('user_cosmetics').upsert(
          newlyUnlockedCosmetics.map((cosmeticId) => ({ user_id: user.id, cosmetic_id: cosmeticId })),
          { onConflict: 'user_id,cosmetic_id' },
        );
      }
    }

    return {
      newlyUnlockedBadges: [...new Set([...baseResult.newlyUnlockedBadges, ...finalResult.newlyUnlockedBadges])],
      newlyUnlockedGear: mergedGear.filter((gearId) => !prev.unlockedGear.includes(gearId)),
      newlyUnlockedCosmetics,
      claimedMasterMilestone,
    };
  }, [user]);

  const markDeepenLabComplete = useCallback((nodeId: string) => {
    setState((current) => {
      if (current.completedLabs.includes(nodeId)) return current;
      return { ...current, completedLabs: [...current.completedLabs, nodeId] };
    });

    if (user) {
      void supabase.from('user_node_depths').upsert({
        user_id: user.id,
        node_id: nodeId,
        depth: stateRef.current.nodeDepths[nodeId] ?? 0,
        deepen_lab_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,node_id' });
    }
  }, [user]);

  const incrementPerfectLessons = useCallback(() => {
    setState((current) => ({ ...current, perfectLessons: current.perfectLessons + 1 }));
  }, []);

  const incrementLifeRecoveries = useCallback(() => {
    setState((current) => ({ ...current, lifeRecoveries: current.lifeRecoveries + 1 }));
  }, []);

  const addReward = useCallback((reward: Omit<Reward, 'id'>) => {
    const id = `reward-${Date.now()}`;
    setState((current) => ({ ...current, rewards: [...current.rewards, { ...reward, id }] }));
    if (user) {
      void supabase.from('user_rewards').upsert({
        id,
        user_id: user.id,
        name: reward.name,
        cost_sp: reward.costSP,
        type: reward.type,
        duration_minutes: reward.durationMinutes ?? null,
      }, { onConflict: 'id' });
    }
  }, [user]);

  const removeReward = useCallback((id: string) => {
    if (DEFAULT_REWARD_IDS.has(id)) return;
    setState((current) => ({ ...current, rewards: current.rewards.filter((reward) => reward.id !== id) }));
    if (user) {
      void supabase.from('user_rewards').delete().eq('user_id', user.id).eq('id', id);
    }
  }, [user]);

  const setTimerEndsAt = useCallback((ts: number | null) => {
    setState((current) => ({ ...current, timerEndsAt: ts }));
  }, []);

  const setApiKey = useCallback((key: string) => {
    void key;
    setState((current) => ({ ...current, geminiApiKey: '' }));
  }, []);

  const setModel = useCallback((model: GeminiModel) => {
    setState((current) => ({ ...current, selectedModel: model }));
  }, []);

  const setLanguage = useCallback((language: ContentLanguage) => {
    setState((current) => ({ ...current, language }));
  }, []);

  const setSoundEnabledState = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    setState((current) => ({ ...current, soundEnabled: enabled }));
  }, []);

  const setStudyReminder = useCallback((enabled: boolean, time?: string) => {
    setState((current) => ({
      ...current,
      studyReminderEnabled: enabled,
      studyReminderTime: time ?? current.studyReminderTime,
      studyReminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || current.studyReminderTimezone,
    }));
  }, []);

  const setAvatarId = useCallback((id: AvatarId) => {
    setState((current) => ({ ...current, avatarId: id }));
  }, []);

  const setCharacterName = useCallback((name: string) => {
    setState((current) => ({ ...current, characterName: name }));
  }, []);

  const equipItem = useCallback((slot: GearSlot, itemId: string) => {
    setState((current) => ({ ...current, equippedItems: { ...current.equippedItems, [slot]: itemId } as EquippedItems }));
  }, []);

  const unequipItem = useCallback((slot: GearSlot) => {
    setState((current) => {
      const items = { ...current.equippedItems };
      delete items[slot];
      return { ...current, equippedItems: items };
    });
  }, []);

  const buyCosmetic = useCallback((cosmeticId: string, costSP: number): boolean => {
    const prev = stateRef.current;
    if (prev.ownedCosmetics.includes(cosmeticId)) return true;
    if (prev.studyPoints < costSP) return false;
    setState((current) => ({
      ...current,
      studyPoints: current.studyPoints - costSP,
      ownedCosmetics: [...current.ownedCosmetics, cosmeticId],
    }));
    if (user) {
      void supabase.from('user_cosmetics').upsert({ user_id: user.id, cosmetic_id: cosmeticId }, { onConflict: 'user_id,cosmetic_id' });
    }
    return true;
  }, [user]);

  const equipCosmetic = useCallback((cosmeticId: string | null) => {
    setState((current) => ({ ...current, equippedCosmetic: cosmeticId }));
  }, []);

  const nameCompanion = useCallback((name: string) => {
    setState((current) => ({ ...current, companion: { ...current.companion, name } }));
  }, []);

  const setCompanionSpecies = useCallback((species: CompanionSpecies) => {
    setState((current) => ({ ...current, companion: { ...current.companion, species } }));
  }, []);

  const completeOnboarding = useCallback((data: OnboardingData) => {
    const { avatarId, characterName, startingPathId, companionSpecies } = data;
    setState((current) => ({
      ...current,
      avatarId,
      characterName,
      companion: { ...current.companion, species: companionSpecies ?? current.companion.species },
      geminiApiKey: '',
      onboardingComplete: true,
      selectedPathId: startingPathId,
      nodeDepths: {},
      completedNodes: [],
      completedLabs: [],
      masteredNodeCount: 0,
      claimedMasterRewardMilestones: [],
    }));
  }, []);

  const resetAll = useCallback(() => {
    const next = { ...DEFAULT_STATE, rewards: DEFAULT_REWARDS, ownedCosmetics: stateRef.current.ownedCosmetics };
    setState(next);
    localStorage.removeItem(STORAGE_KEY);
    const userId = user?.id;
    if (!userId) return;
    Promise.all([
      supabase.from('user_master_rewards').delete().eq('user_id', userId),
      supabase.from('user_quiz_results').delete().eq('user_id', userId),
      supabase.from('user_srs_schedule').delete().eq('user_id', userId),
      supabase.from('user_daily_challenges').delete().eq('user_id', userId),
      supabase.from('user_daily_challenge_stats').delete().eq('user_id', userId),
      supabase.from('user_weekly_mission_claims').delete().eq('user_id', userId),
      supabase.from('user_node_depths').delete().eq('user_id', userId),
      supabase.from('user_rewards').delete().eq('user_id', userId),
      supabase.from('user_gear').delete().eq('user_id', userId),
      supabase.from('user_cosmetics').delete().eq('user_id', userId),
      supabase.from('user_completions').delete().eq('user_id', userId),
      supabase.from('user_generated_content').delete().eq('user_id', userId),
      supabase.from('user_content_notes').delete().eq('user_id', userId),
      supabase.from('user_progress').delete().eq('user_id', userId),
    ]).catch((error) => console.error('Failed to reset cloud state', error));
  }, [user]);

  const value: GameContextValue = {
    ...state,
    level,
    progress,
    unlockedBadgeIds,
    cloudLoading,
    addXp,
    applyCloudRewardTotals,
    addStudyPoints,
    spendCoins,
    loseLife,
    gainLife,
    completeDepth,
    markDeepenLabComplete,
    incrementPerfectLessons,
    incrementLifeRecoveries,
    addReward,
    removeReward,
    setTimerEndsAt,
    setApiKey,
    setModel,
    setLanguage,
    setSoundEnabledState,
    setStudyReminder,
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

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState(): GameContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used inside <GameStateProvider>');
  return ctx;
}
