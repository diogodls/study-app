// ============================================================
// DevQuest â€” Character System Configuration
// ============================================================
// Defines all avatar IDs, earnable gear items, and SP-purchasable
// cosmetics. Visual asset paths are referenced here and resolved
// in M8 when pixel art sprites are added.
// ============================================================

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Avatar
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type AvatarId =
  | 'hooded-coder'
  | 'cyber-warrior'
  | 'data-wizard'
  | 'cloud-architect'
  | 'rogue-hacker';

export type AvatarTier = 1 | 2 | 3;

export type AvatarDef = {
  id: AvatarId;
  name: string;
  description: string;
  /** Emoji placeholder used until M8 pixel art sprites are added */
  emoji: string;
  /** Sprite sheet paths per tier â€” filled in during M8 */
  sprites: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
};

export const AVATARS: AvatarDef[] = [
  {
    id: 'hooded-coder',
    name: 'The Hooded Coder',
    description: 'A mysterious developer who writes code in the shadows.',
    emoji: 'ðŸ§‘â€ðŸ’»',
    sprites: { tier1: 'hooded-coder-tier1', tier2: 'hooded-coder-tier2', tier3: 'hooded-coder-tier3' },
  },
  {
    id: 'cyber-warrior',
    name: 'Cyber Warrior',
    description: 'Battle-hardened through thousands of pull requests.',
    emoji: 'âš”ï¸',
    sprites: { tier1: 'cyber-warrior-tier1', tier2: 'cyber-warrior-tier2', tier3: 'cyber-warrior-tier3' },
  },
  {
    id: 'data-wizard',
    name: 'Data Wizard',
    description: 'Transforms raw data into pure gold with a single query.',
    emoji: 'ðŸ§™',
    sprites: { tier1: 'data-wizard-tier1', tier2: 'data-wizard-tier2', tier3: 'data-wizard-tier3' },
  },
  {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    description: 'Builds castles in the cloud, one microservice at a time.',
    emoji: 'â˜ï¸',
    sprites: { tier1: 'cloud-architect-tier1', tier2: 'cloud-architect-tier2', tier3: 'cloud-architect-tier3' },
  },
  {
    id: 'rogue-hacker',
    name: 'Rogue Hacker',
    description: 'Finds the elegant solution in the most unexpected places.',
    emoji: 'ðŸ•µï¸',
    sprites: { tier1: 'rogue-hacker-tier1', tier2: 'rogue-hacker-tier2', tier3: 'rogue-hacker-tier3' },
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Gear / Equipment
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type GearSlot = 'weapon' | 'shield' | 'relic';
export type GearRarity = 'common' | 'rare' | 'legendary';

export type GearItem = {
  id: string;
  name: string;
  flavorText: string;
  slot: GearSlot;
  rarity: GearRarity;
  /** The badge ID that must be earned to unlock this item */
  badgeRequirement: string;
  /** Emoji placeholder â€” replaced with sprite in M8 */
  emoji: string;
};

export const GEAR_ITEMS: GearItem[] = [
  // â”€â”€ WEAPONS â”€â”€
  {
    id: 'weapon-array-sword',
    name: 'Array Sword',
    flavorText: 'Forged from a thousand sorted elements. Slices through complexity in O(n).',
    slot: 'weapon',
    rarity: 'common',
    badgeRequirement: 'badge-dsa-complete',
    emoji: 'âš”ï¸',
  },
  {
    id: 'weapon-recursive-blade',
    name: 'Recursive Blade',
    flavorText: 'A weapon that contains a smaller version of itself.',
    slot: 'weapon',
    rarity: 'rare',
    badgeRequirement: 'badge-lab-5',
    emoji: 'ðŸ—¡ï¸',
  },
  {
    id: 'weapon-lambda-lance',
    name: 'Lambda Lance',
    flavorText: 'Serverless power, on-demand destruction.',
    slot: 'weapon',
    rarity: 'legendary',
    badgeRequirement: 'badge-aws-complete',
    emoji: 'âš¡',
  },

  // â”€â”€ SHIELDS â”€â”€
  {
    id: 'shield-hashmap',
    name: 'Hashmap Shield',
    flavorText: 'O(1) defense, guaranteed. Keys to protection at constant time.',
    slot: 'shield',
    rarity: 'common',
    badgeRequirement: 'badge-perfect-5',
    emoji: 'ðŸ›¡ï¸',
  },
  {
    id: 'shield-firewall',
    name: 'IAM Firewall',
    flavorText: 'Least privilege principle applied physically.',
    slot: 'shield',
    rarity: 'rare',
    badgeRequirement: 'badge-7-streak',
    emoji: 'ðŸ”',
  },
  {
    id: 'shield-cap-aegis',
    name: 'CAP Aegis',
    flavorText: 'Pick any two: Consistency, Availability, or Partition Tolerance.',
    slot: 'shield',
    rarity: 'legendary',
    badgeRequirement: 'badge-system-complete',
    emoji: 'âš–ï¸',
  },

  // â”€â”€ RELICS â”€â”€
  {
    id: 'relic-recursion-gem',
    name: 'Gem of Recursion',
    flavorText: 'Contains a smaller version of itself. And that one contains another.',
    slot: 'relic',
    rarity: 'common',
    badgeRequirement: 'badge-lab-1',
    emoji: 'ðŸ’Ž',
  },
  {
    id: 'relic-docker-orb',
    name: 'Docker Orb',
    flavorText: 'It works on my machine... and every other machine too.',
    slot: 'relic',
    rarity: 'rare',
    badgeRequirement: 'badge-backend-complete',
    emoji: 'ðŸŒ',
  },
  {
    id: 'relic-test-pyramid',
    name: 'Pyramid of Tests',
    flavorText: 'The ancient artifact of software confidence. Many unit, few E2E.',
    slot: 'relic',
    rarity: 'legendary',
    badgeRequirement: 'badge-testing-complete',
    emoji: 'ðŸ”º',
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Badges (Achievement Definitions)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Describes how this badge is evaluated â€” checked in GameStateContext */
  requirement: string;
};

export const BADGE_DEFINITIONS: BadgeDef[] = [
  // â”€â”€ Path completion badges â”€â”€
  {
    id: 'badge-dsa-complete',
    title: 'Tree Whisperer',
    description: 'Complete all Data Structures & Algorithms nodes.',
    emoji: 'ðŸŒ²',
    requirement: 'Complete all nodes in the data-structures path',
  },
  {
    id: 'badge-aws-complete',
    title: 'Lambda Warrior',
    description: 'Complete all Amazon Web Services nodes.',
    emoji: 'â˜ï¸',
    requirement: 'Complete all nodes in the aws path',
  },
  {
    id: 'badge-backend-complete',
    title: 'Server Sage',
    description: 'Complete all Backend Development nodes.',
    emoji: 'âš™ï¸',
    requirement: 'Complete all nodes in the backend path',
  },
  {
    id: 'badge-system-complete',
    title: 'System Architect',
    description: 'Complete all System Design nodes.',
    emoji: 'ðŸ—ï¸',
    requirement: 'Complete all nodes in the system-design path',
  },
  {
    id: 'badge-testing-complete',
    title: 'Bug Slayer',
    description: 'Complete all Software Testing nodes.',
    emoji: 'ðŸ§ª',
    requirement: 'Complete all nodes in the testing path',
  },
  {
    id: 'badge-perf-complete',
    title: 'Speed Demon',
    description: 'Complete all Performance & Optimization nodes.',
    emoji: 'ðŸš€',
    requirement: 'Complete all nodes in the performance path',
  },
  {
    id: 'badge-frontend-complete',
    title: 'Render Ranger',
    description: 'Complete all Frontend Architecture & Rendering nodes.',
    emoji: 'ðŸ–¥ï¸',
    requirement: 'Complete all nodes in the frontend-rendering path',
  },
  {
    id: 'badge-git-master',
    title: 'History Guardian',
    description: 'Master every Git & Version Control node.',
    emoji: '🌿',
    requirement: 'Master all nodes in the git path',
  },
  {
    id: 'badge-linux-master',
    title: 'Kernel Keeper',
    description: 'Master every Linux & Shell node.',
    emoji: '🐧',
    requirement: 'Master all nodes in the linux path',
  },
  {
    id: 'badge-networking-master',
    title: 'Packet Pathfinder',
    description: 'Master every Networking node.',
    emoji: '🌐',
    requirement: 'Master all nodes in the networking path',
  },
  {
    id: 'badge-appsec-master',
    title: 'Threat Hunter',
    description: 'Master every Application Security node.',
    emoji: '🛡️',
    requirement: 'Master all nodes in the appsec path',
  },
  {
    id: 'badge-devops-master',
    title: 'Release Commander',
    description: 'Master every DevOps & CI/CD node.',
    emoji: '🚢',
    requirement: 'Master all nodes in the devops path',
  },
  {
    id: 'badge-typescript-master',
    title: 'Type Architect',
    description: 'Master every Advanced TypeScript node.',
    emoji: '🔷',
    requirement: 'Master all nodes in the typescript-advanced path',
  },
  {
    id: 'badge-ai-master',
    title: 'Model Tamer',
    description: 'Master every Applied AI Engineering node.',
    emoji: '🤖',
    requirement: 'Master all nodes in the applied-ai path',
  },
  {
    id: 'badge-patterns-master',
    title: 'Pattern Smith',
    description: 'Master every Applied Design Patterns node.',
    emoji: '🧩',
    requirement: 'Master all nodes in the design-patterns path',
  },

  // â”€â”€ Streak badges â”€â”€
  {
    id: 'badge-3-streak',
    title: 'Consistent',
    description: 'Study 3 days in a row.',
    emoji: 'ðŸ”¥',
    requirement: 'streak >= 3',
  },
  {
    id: 'badge-7-streak',
    title: 'Ironheart',
    description: 'Study 7 days in a row.',
    emoji: 'ðŸ’ª',
    requirement: 'streak >= 7',
  },
  {
    id: 'badge-30-streak',
    title: 'Unstoppable',
    description: 'Study 30 days in a row.',
    emoji: 'âš¡',
    requirement: 'streak >= 30',
  },

  // â”€â”€ Performance badges â”€â”€
  {
    id: 'badge-perfect-5',
    title: 'Sharpshooter',
    description: 'Complete 5 lessons without any wrong answers.',
    emoji: 'ðŸŽ¯',
    requirement: 'perfectLessons >= 5',
  },
  {
    id: 'badge-comeback',
    title: 'Grinder',
    description: 'Recover from 0 lives 3 separate times.',
    emoji: 'ðŸ’€',
    requirement: 'lifeRecoveries >= 3',
  },

  // â”€â”€ Lab badges â”€â”€
  {
    id: 'badge-lab-1',
    title: 'Hands On',
    description: 'Complete your first Coding Lab.',
    emoji: 'ðŸ”§',
    requirement: 'completedLabs.length >= 1',
  },
  {
    id: 'badge-lab-5',
    title: 'Lab Rat',
    description: 'Complete 5 Coding Labs.',
    emoji: 'ðŸ€',
    requirement: 'completedLabs.length >= 5',
  },

  // â”€â”€ Exploration badges â”€â”€
  {
    id: 'badge-polymath',
    title: 'Polymath',
    description: 'Have at least 3 completed nodes in every learning path.',
    emoji: 'ðŸ§ ',
    requirement: 'All paths have >= 3 completed nodes',
  },
  {
    id: 'badge-all-paths',
    title: 'The Wanderer',
    description: 'Complete at least one node in every learning path.',
    emoji: 'ðŸ—ºï¸',
    requirement: 'All paths have >= 1 completed node',
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SP-Purchasable Cosmetics
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CosmeticType = 'frame' | 'theme' | 'companion-accessory';

export type CosmeticItem = {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  costSP: number;
  /** CSS class applied to the character card when this cosmetic is equipped */
  cssClass: string;
  /** Emoji preview for the shop listing */
  emoji: string;
};

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // â”€â”€ Card Themes â”€â”€
  {
    id: 'theme-crimson-neon',
    name: 'Crimson Neon',
    description: 'A fiery red-pink neon theme for the bold coder.',
    type: 'theme',
    costSP: 200,
    cssClass: 'cosmetic-theme-crimson',
    emoji: 'ðŸ”´',
  },
  {
    id: 'theme-forest-cozy',
    name: 'Forest Cozy',
    description: 'Earthy greens and moss for the calm developer.',
    type: 'theme',
    costSP: 200,
    cssClass: 'cosmetic-theme-forest',
    emoji: 'ðŸŒ¿',
  },
  {
    id: 'theme-deep-ocean',
    name: 'Deep Ocean',
    description: 'Deep blues and teals from the bottom of the stack.',
    type: 'theme',
    costSP: 200,
    cssClass: 'cosmetic-theme-ocean',
    emoji: 'ðŸŒŠ',
  },
  {
    id: 'theme-golden-hour',
    name: 'Golden Hour',
    description: 'Warm amber and gold for the legendary engineer.',
    type: 'theme',
    costSP: 350,
    cssClass: 'cosmetic-theme-golden',
    emoji: 'âœ¨',
  },

  // â”€â”€ Animated Frames â”€â”€
  {
    id: 'frame-pulse',
    name: 'Pulsing Glow',
    description: 'Your character card softly glows and pulses.',
    type: 'frame',
    costSP: 500,
    cssClass: 'cosmetic-frame-pulse',
    emoji: 'ðŸ’«',
  },
  {
    id: 'frame-legendary',
    name: 'Legendary Frame',
    description: 'Golden animated border fit for a 10x developer.',
    type: 'frame',
    costSP: 800,
    cssClass: 'cosmetic-frame-legendary',
    emoji: 'ðŸ‘‘',
  },

  // â”€â”€ Companion Accessories â”€â”€
  {
    id: 'acc-tiny-hat',
    name: 'Tiny Top Hat',
    description: 'Your companion is now 43% more distinguished.',
    type: 'companion-accessory',
    costSP: 300,
    cssClass: 'cosmetic-acc-hat',
    emoji: 'ðŸŽ©',
  },
  {
    id: 'acc-floating-book',
    name: 'Floating Book',
    description: 'A magical book of algorithms orbits your companion.',
    type: 'companion-accessory',
    costSP: 300,
    cssClass: 'cosmetic-acc-book',
    emoji: 'ðŸ“š',
  },
  {
    id: 'acc-scarf',
    name: 'Debug Scarf',
    description: 'Cozy protection against null pointer exceptions.',
    type: 'companion-accessory',
    costSP: 250,
    cssClass: 'cosmetic-acc-scarf',
    emoji: 'ðŸ§£',
  },
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Companion Definition
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CompanionMood = 'happy' | 'idle' | 'sleepy';
export type CompanionStage = 0 | 1 | 2 | 3;
export type CompanionSpecies = 'spark' | 'owl' | 'cat' | 'iguana';

export type CompanionDef = {
  id: CompanionSpecies;
  name: string;
  description: string;
  stageNames: Record<CompanionStage, string>;
};

export const COMPANIONS: CompanionDef[] = [
  {
    id: 'spark',
    name: 'Spark',
    description: 'A tiny energy pet that grows into a bright coding familiar.',
    stageNames: {
      0: 'Egg',
      1: 'Sparkling',
      2: 'Brightling',
      3: 'Luminary',
    },
  },
  {
    id: 'owl',
    name: 'Owl',
    description: 'A wise night learner that evolves into a sage guardian.',
    stageNames: {
      0: 'Speckled Egg',
      1: 'Owlet',
      2: 'Scholar Owl',
      3: 'Sage Owl',
    },
  },
  {
    id: 'cat',
    name: 'Cat',
    description: 'A curious debugging buddy with increasingly elegant chaos.',
    stageNames: {
      0: 'Curled Kitten',
      1: 'Kitten',
      2: 'Code Cat',
      3: 'Arch Cat',
    },
  },
  {
    id: 'iguana',
    name: 'Iguana',
    description: 'A calm reptile friend that becomes a steady scale-armored ally.',
    stageNames: {
      0: 'Warm Egg',
      1: 'Hatchling',
      2: 'Crested Iguana',
      3: 'Emerald Iguana',
    },
  },
];

/** Returns the CSS animation class for a given companion mood */
export function getCompanionMoodClass(mood: CompanionMood): string {
  const classes: Record<CompanionMood, string> = {
    happy: 'animate-bounce',
    idle: 'animate-float',
    sleepy: '', // no animation when sleepy
  };
  return classes[mood];
}

/** Determines companion mood from current streak */
export function getCompanionMood(streak: number): CompanionMood {
  if (streak >= 3) return 'happy';
  if (streak >= 1) return 'idle';
  return 'sleepy';
}

/** Returns the display emoji for companion at a given stage */
export function getCompanionEmoji(stage: CompanionStage): string {
  const emojis: Record<CompanionStage, string> = {
    0: 'ðŸ¥š',
    1: 'ðŸ£',
    2: 'ðŸ¤',
    3: 'ðŸ¦…',
  };
  return emojis[stage];
}

/** Returns a stage label string */
export function getCompanionStageLabel(stage: CompanionStage): string {
  const labels: Record<CompanionStage, string> = {
    0: 'Egg',
    1: 'Hatchling',
    2: 'Young',
    3: 'Legendary',
  };
  return labels[stage];
}

export function getCompanionDef(id: CompanionSpecies): CompanionDef {
  return COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0];
}

export function getCompanionSpeciesStageLabel(species: CompanionSpecies, stage: CompanionStage): string {
  return getCompanionDef(species).stageNames[stage];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getAvatar(id: AvatarId): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function getGearItem(id: string): GearItem | undefined {
  return GEAR_ITEMS.find((g) => g.id === id);
}

export function getCosmeticItem(id: string): CosmeticItem | undefined {
  return COSMETIC_ITEMS.find((c) => c.id === id);
}

export function getBadgeDef(id: string): BadgeDef | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function getGearBySlot(slot: GearSlot): GearItem[] {
  return GEAR_ITEMS.filter((g) => g.slot === slot);
}

export function getCosmeticsByType(type: CosmeticType): CosmeticItem[] {
  return COSMETIC_ITEMS.filter((c) => c.type === type);
}
