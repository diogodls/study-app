// ============================================================
// DevQuest — Shared Type Definitions
// ============================================================
// All re-exports from config files + Gemini response shapes +
// game state types used across the whole application.
// ============================================================

// ─── Re-exports from config ────────────────────────────────
export type { SkillNode, LearningPath } from '@/config/paths';
export type {
  AvatarId,
  AvatarTier,
  AvatarDef,
  GearSlot,
  GearRarity,
  GearItem,
  CosmeticType,
  CosmeticItem,
  BadgeDef,
  CompanionMood,
  CompanionStage,
  CompanionSpecies,
} from '@/config/character';

// ─── Gemini API Response Shapes ───────────────────────────

export type Quiz = {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type CheatSheetSession = {
  title: string;
  cheatSheet: string; // Markdown content
  quizzes: Quiz[];
};

export type CodingLabLanguage = 'javascript' | 'typescript' | 'python';

export type CodingLab = {
  instructions: string;    // Markdown README
  boilerplateCode: string; // Skeleton code
  testCode: string;        // Node.js assert-based tests
  fileName: string;        // e.g. "circularQueue.js"
  language: CodingLabLanguage;
};

// ─── Shop / Reward Types ──────────────────────────────────

export type RewardType = 'time' | 'once';

export type Reward = {
  id: string;
  name: string;
  costSP: number;
  type: RewardType;
  durationMinutes?: number; // required if type === 'time'
};

// ─── Character Types ──────────────────────────────────────

export type EquippedItems = {
  weapon?: string; // gear item id
  shield?: string;
  relic?: string;
};

export type Companion = {
  name: string;
  species: import('@/config/character').CompanionSpecies;
  evolutionStage: 0 | 1 | 2 | 3; // 0=egg, 1=hatchling, 2=young, 3=legendary
};

// ─── Settings ─────────────────────────────────────────────

export type GeminiModel = 'gemini-3-flash-preview' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

// ─── Full Game State ──────────────────────────────────────

export type GameState = {
  // Core progression
  xp: number;
  studyPoints: number;
  lives: number;               // 0–5
  streak: number;              // current consecutive study days
  longestStreak: number;       // all-time record for badges
  lastStudyDate: string | null;// YYYY-MM-DD ISO date
  completedNodes: string[];    // skill node IDs
  completedLabs: string[];     // coding lab node IDs
  perfectLessons: number;      // lessons completed with zero errors
  lifeRecoveries: number;      // times recovered from 0 lives

  // Shop
  rewards: Reward[];
  timerEndsAt: number | null;  // ms timestamp for Dopamine Timer

  // Settings
  geminiApiKey: string;
  selectedModel: GeminiModel;
  soundEnabled: boolean;

  // Character
  characterName: string;
  avatarId: import('@/config/character').AvatarId;
  avatarTier: 1 | 2 | 3;
  equippedItems: EquippedItems;
  unlockedGear: string[];      // gear item IDs earned via badges
  companion: Companion;
  ownedCosmetics: string[];    // cosmetic item IDs purchased
  equippedCosmetic: string | null;
  onboardingComplete: boolean;
  selectedPathId: string;
};

// ─── Action Return Types ──────────────────────────────────

export type AddXpResult = {
  leveledUp: boolean;
  prevLevel: number;
  newLevel: number;
  tierChanged: boolean;
  newTier: 1 | 2 | 3;
  companionEvolved: boolean;
  newCompanionStage: 0 | 1 | 2 | 3;
};

export type CompleteNodeResult = {
  newlyUnlockedBadges: string[];
  newlyUnlockedGear: string[];
};

// ─── Context Value ────────────────────────────────────────

export type OnboardingData = {
  avatarId: import('@/config/character').AvatarId;
  characterName: string;
  startingPathId: string;
  companionSpecies?: import('@/config/character').CompanionSpecies;
  geminiApiKey?: string;
};
