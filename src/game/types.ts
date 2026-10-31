// Star Courier — game type definitions

export type Branch = "alchemy" | "biotics" | "psyche";

export type Screen =
  | "menu"
  | "intro"
  | "bridge"
  | "dialogue"
  | "combat"
  | "characters"
  | "chapter_card"
  | "ending"
  | "about"
  | "codex"
  | "achievements"
  | "settings"
  | "chat"
  | "log";

export interface Character {
  id: string;
  name: string;
  role: string;
  gender: "male" | "female" | "nonbinary";
  portraitColor: string;
  accent: string;
  short: string;
  bio: string;
  tags: string[];
  quote: string;
  quirks: string[];
  fears: string;
  hopes: string;
  speech: string;
  ritual?: string;
  // Chat / AI personality
  /** Short personality traits used to build the AI system prompt for chat */
  personalityTraits: string[];
  /** Tone of speech used in chat: formal, casual, cold, warm, etc. */
  speechTone: string;
  /** Initial greeting the character says when chat opens (from the character's POV) */
  chatGreeting: string;
  /** Quick suggestion chips — example questions the player can tap to ask */
  chatSuggestions: string[];
  /** Optional id of another character this one is romantically interested in */
  romanceInterest?: string;
  /** Relationship milestone (rel value) at which romance arc is triggered */
  romanceThreshold?: number;
  // === Emotional depth fields (optional — populated per character) ===
  childhoodMemory?: string;
  definingMoment?: string;
  secretJoy?: string;
  vulnerability?: string;
  adviceToYoungerSelf?: string;
  bonds?: { characterId: string; type: string; description: string }[];
}

export interface Ability {
  id: string;
  branch: Branch | "free";
  name: string;
  description: string;
  energyCost: number;
  tier: number;
  damage?: number;
  heal?: number;
  shield?: number;
  energyRestore?: number;
  cooldown?: number;
  icon: string;
  // Combat modifiers
  /** If true, damage bypasses enemy shield completely (e.g. acid, mind-shatter) */
  ignoreShield?: boolean;
  /** Fixed amount of enemy shield to ignore when applying damage (e.g. bio_lance: 15) */
  shieldPenetrate?: number;
  /** Immediately reduce enemy shield by this percentage (0-100). e.g. toxin: 50 means -50% shield */
  shieldReducePct?: number;
  /** Apply a weaken debuff to the enemy for N turns — enemy deals 30% less damage while active */
  weakenTurns?: number;
}

export interface DialogueChoice {
  id: string;
  text: string;
  goto: string;
  effects?: {
    relationships?: Record<string, number>;
    branchXp?: Partial<Record<Branch, number>>;
    flags?: string[];
    hp?: number;
    energy?: number;
  };
  requires?: {
    flags?: string[];
    branchXp?: Partial<Record<Branch, number>>;
    relationships?: Record<string, number>;
  };
  branchHint?: Branch;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  endAction?: "combat" | "next_chapter" | "ending";
  endActionTarget?: string;
}

export interface DialogueScene {
  id: string;
  title: string;
  startNode: string;
  nodes: Record<string, DialogueNode>;
}

export interface Enemy {
  id: string;
  name: string;
  description: string;
  maxHp: number;
  hp: number;
  shield: number;
  damage: [number, number];
  abilities: string[];
  weakness?: Branch;
  portraitColor: string;
  ai: "standard" | "defensive" | "heavy";
  reward?: {
    branchXp?: Partial<Record<Branch, number>>;
    items?: { id: string; count: number }[];
    flags?: string[];
  };
}

export type EnemyIntent =
  | { kind: "attack"; min: number; max: number }
  | { kind: "defend"; shieldGain: number }
  | { kind: "special"; label: string };

export interface InventoryItem {
  id: string;
  name: string;
  branch: Branch | "common";
  description: string;
  count: number;
  heal?: number;
  energy?: number;
  shield?: number;
  icon: string;
}

export interface GameSave {
  version: number;
  createdAt: number;
  updatedAt: number;
  chapter: number;
  scene: string;
  contextId?: string;
  currentNodeId?: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  branchXp: { alchemy: number; biotics: number; psyche: number };
  unlockedAbilities: string[];
  flags: string[];
  inventory: InventoryItem[];
  relationships: Record<string, number>;
  romanceInterest?: string;
  log: string[];
  defeatedEnemies: string[];
  seenAchievements: string[];
  tutorialFlags: string[];
  /** Per-character chat history: { [characterId]: ChatMessage[] } */
  chatHistory: Record<string, ChatMessage[]>;
}

export interface Settings {
  audioEnabled: boolean;
  audioVolume: number;
  ambientEnabled: boolean;
  textSpeed: "slow" | "normal" | "fast" | "instant";
  animationsEnabled: boolean;
  difficulty: "easy" | "normal" | "hard";
  autoAdvanceDialogue: boolean;
  combatSpeed: "slow" | "normal" | "fast";
  reducedMotion: boolean;
  theme: "amber" | "emerald" | "indigo" | "crimson";
}

export interface ChapterCard {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  brief: string;
  nextScreen: Screen;
  nextContext?: string;
}

export interface EndingState {
  id: string;
  title: string;
  epilogue: string;
  tone: "good" | "neutral" | "bad";
}

export interface Toast {
  id: string;
  text: string;
  tone: "good" | "bad" | "info";
  /** ms timestamp when toast was created (for progress bar) */
  createdAt: number;
  /** ms — how long the toast lives before auto-dismiss */
  duration: number;
}

export interface ChatMessage {
  /** "user" = player message, "assistant" = character reply */
  role: "user" | "assistant";
  content: string;
  /** Timestamp of the message */
  ts: number;
  /** Optional image attached to a user message (base64 data URL, e.g. "data:image/jpeg;base64,...") */
  image?: string;
  /** Optional caption/description shown when image is present */
  imageCaption?: string;
}

export interface CodexEntry {
  id: string;
  category: "ship" | "characters" | "world" | "abilities" | "artifacts" | "philosophy";
  title: string;
  body: string;
  unlockFromStart?: boolean;
  unlockChapter?: number;
  unlockFlags?: string[];
  unlockRelationships?: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (save: GameSave) => boolean;
}
