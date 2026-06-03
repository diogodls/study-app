// ============================================================
// DevQuest — XP Level Progression System
// ============================================================

/**
 * XP required to REACH each level (index = level - 1).
 * Level 1 starts at 0 XP.
 * Beyond the array length, each additional level costs 5000 XP more than the last.
 *
 * Earning rate reference:
 *   - 1 correct quiz answer = 10 XP
 *   - Completing a lesson (5 quizzes, no errors) = 80 XP bonus
 *   - Life recovery session = 30 XP
 *   - Coding Lab completed = 500 XP
 *
 * Level 2 ≈ 30 correct quiz answers
 * Level 5 ≈ finishing ~2 full learning paths
 * Level 10 = serious dedication
 */
export const LEVEL_THRESHOLDS: readonly number[] = [
  0,      // Level 1
  300,    // Level 2  — ~30 correct answers
  700,    // Level 3  — ~70 correct answers
  1300,   // Level 4  — avatar tier 2 unlocks here
  2100,   // Level 5
  3200,   // Level 6
  4800,   // Level 7
  7000,   // Level 8  — avatar tier 3 unlocks here
  10000,  // Level 9
  14000,  // Level 10
] as const;

/** The level at which avatar tier 2 (Intermediate) is unlocked */
export const AVATAR_TIER2_LEVEL = 4;

/** The level at which avatar tier 3 (Legendary) is unlocked */
export const AVATAR_TIER3_LEVEL = 8;

/** The level at which the companion hatches (and gets named) */
export const COMPANION_HATCH_LEVEL = 3;

/** The level at which the companion evolves for the first time */
export const COMPANION_EVOLVE1_LEVEL = 6;

/** The level at which the companion reaches its final form */
export const COMPANION_EVOLVE2_LEVEL = 10;

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Returns the current level for a given XP value.
 * Level 1 minimum, no maximum cap.
 */
export function getLevel(xp: number): number {
  if (xp < 0) return 1;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Returns the XP threshold required to reach a given level.
 * Extrapolates beyond the defined array using +5000 per level.
 */
export function getThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  const idx = level - 1;
  if (idx < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[idx];
  }
  // Extrapolate: beyond level 10, each level costs 5000 more than the last defined gap
  const lastDefined = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const extraLevels = idx - (LEVEL_THRESHOLDS.length - 1);
  return lastDefined + extraLevels * 5000;
}

/**
 * Returns progress information toward the next level.
 */
export function getProgressToNextLevel(xp: number): {
  currentLevelXp: number;   // XP at start of current level
  nextLevelXp: number;      // XP needed to reach next level
  xpIntoLevel: number;      // XP earned within current level
  xpNeededForNext: number;  // XP still needed to level up
  percent: number;          // 0-100 progress percentage
} {
  const level = getLevel(xp);
  const currentLevelXp = getThresholdForLevel(level);
  const nextLevelXp = getThresholdForLevel(level + 1);
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const percent = Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100));

  return {
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNext,
    percent,
  };
}

/**
 * Returns the avatar tier (1, 2, or 3) for a given level.
 */
export function getAvatarTier(level: number): 1 | 2 | 3 {
  if (level >= AVATAR_TIER3_LEVEL) return 3;
  if (level >= AVATAR_TIER2_LEVEL) return 2;
  return 1;
}

/**
 * Returns the companion evolution stage (0–3) for a given level.
 * 0 = egg, 1 = hatched, 2 = first evolution, 3 = final form
 */
export function getCompanionStage(level: number): 0 | 1 | 2 | 3 {
  if (level >= COMPANION_EVOLVE2_LEVEL) return 3;
  if (level >= COMPANION_EVOLVE1_LEVEL) return 2;
  if (level >= COMPANION_HATCH_LEVEL) return 1;
  return 0;
}

/**
 * Returns a player title string based on level.
 * Used in ProfilePage and victory screens.
 */
export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1:  'Code Initiate',
    2:  'Junior Dev',
    3:  'Algorithm Apprentice',
    4:  'Logic Warrior',
    5:  'Stack Sorcerer',
    6:  'Cloud Ranger',
    7:  'Systems Architect',
    8:  'Data Alchemist',
    9:  'Code Grandmaster',
    10: 'Legendary Engineer',
  };
  return titles[Math.min(level, 10)] ?? 'Legendary Engineer';
}

/**
 * Returns XP rewards for various game actions.
 * Centralized here so balancing changes are made in one place.
 */
export const XP_REWARDS = {
  CORRECT_QUIZ: 10,
  PERFECT_LESSON: 80,      // bonus for completing all 5 quizzes with no errors
  LESSON_COMPLETE: 50,      // base XP for completing any lesson
  LIFE_RECOVERY_SESSION: 30,
  CODING_LAB_COMPLETE: 500,
  PRACTICE_SESSION: 25,
} as const;

/**
 * Returns Study Point rewards for various game actions.
 */
export const SP_REWARDS = {
  CORRECT_QUIZ: 5,
  LESSON_COMPLETE: 30,
  PERFECT_LESSON: 50,
  CODING_LAB_COMPLETE: 100,
  PRACTICE_SESSION: 15,
} as const;
