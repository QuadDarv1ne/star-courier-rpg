"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Branch,
  ChatMessage,
  Enemy,
  EnemyIntent,
  GameSave,
  Screen,
  Settings,
  Toast,
} from "@/game/types";
import { ABILITIES, STARTING_ABILITIES, getAbility } from "@/game/data/abilities";
import { cloneEnemy } from "@/game/data/enemies";
import { CHAPTERS, DIALOGUES, resolveEnding } from "@/game/data/story";
import { CHARACTERS } from "@/game/data/characters";
import { newlyUnlockedAchievements } from "@/game/data/achievements";
import { playSound } from "@/lib/audio";

const SAVE_VERSION = 2;

const DEFAULT_SETTINGS: Settings = {
  audioEnabled: true,
  audioVolume: 0.6,
  ambientEnabled: false, // Music OFF by default — user enables via MusicPlayer
  textSpeed: "normal",
  animationsEnabled: true,
  difficulty: "normal",
  autoAdvanceDialogue: false,
  combatSpeed: "normal",
  reducedMotion: false,
  theme: "amber",
};

function makeFreshSave(): GameSave {
  // Difficulty-scaled HP: easy = 120, normal = 100, hard = 80
  const maxHp = 100;
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapter: 1,
    scene: "ch1_bridge",
    contextId: "ch1_bridge",
    currentNodeId: "wake",
    hp: maxHp,
    maxHp,
    energy: 50,
    maxEnergy: 50,
    branchXp: { alchemy: 0, biotics: 0, psyche: 0 },
    unlockedAbilities: [...STARTING_ABILITIES],
    flags: [],
    inventory: [
      { id: "stim_pack", name: "Аптечка", branch: "common", description: "Восстанавливает 30 HP.", count: 2, heal: 30, icon: "" },
      { id: "energy_cell", name: "Энергоячейка", branch: "common", description: "Восстанавливает 25 энергии.", count: 2, energy: 25, icon: "" },
      { id: "shield_cell", name: "Щит-ячейка", branch: "common", description: "Ставит 20 щита.", count: 1, shield: 20, icon: "" },
    ],
    relationships: CHARACTERS.reduce((acc, c) => {
      acc[c.id] = 0;
      return acc;
    }, {} as Record<string, number>),
    romanceInterest: undefined,
    log: [],
    defeatedEnemies: [],
    seenAchievements: [],
    tutorialFlags: [],
    chatHistory: {},
  };
}

// Apply current difficulty to a save's max HP — easy = +20%, normal = 0, hard = -20%
function difficultyHpMultiplier(diff: Settings["difficulty"]): number {
  return diff === "easy" ? 1.2 : diff === "hard" ? 0.8 : 1.0;
}

// Combat speed multiplier: slow = 1.5x longer delays, normal = 1.0x, fast = 0.5x
function combatSpeedMultiplier(speed: Settings["combatSpeed"]): number {
  return speed === "slow" ? 1.5 : speed === "fast" ? 0.5 : 1.0;
}

function generateEnemyIntent(enemy: Enemy): EnemyIntent {
  const [lo, hi] = enemy.damage;
  if (enemy.ai === "defensive" && enemy.shield < 15 && Math.random() < 0.45) {
    return { kind: "defend", shieldGain: 10 };
  }
  if (enemy.ai === "heavy" && Math.random() < 0.15) {
    return { kind: "special", label: "Тяжёлый залп (+25% урона)" };
  }
  return { kind: "attack", min: lo, max: hi };
}

export const ITEM_TEMPLATES: Record<
  string,
  {
    id: string;
    name: string;
    branch: "common";
    description: string;
    heal?: number;
    energy?: number;
    shield?: number;
    icon: string;
  }
> = {
  stim_pack: {
    id: "stim_pack",
    name: "Аптечка",
    branch: "common",
    description: "Восстанавливает 30 HP.",
    heal: 30,
    icon: "",
  },
  energy_cell: {
    id: "energy_cell",
    name: "Энергоячейка",
    branch: "common",
    description: "Восстанавливает 25 энергии.",
    energy: 25,
    icon: "",
  },
  shield_cell: {
    id: "shield_cell",
    name: "Щит-ячейка",
    branch: "common",
    description: "Ставит 20 щита.",
    shield: 20,
    icon: "",
  },
  combat_stim: {
    id: "combat_stim",
    name: "Боевой стимулятор",
    branch: "common",
    description: "Восстанавливает 10 HP и 20 энергии.",
    heal: 10,
    energy: 20,
    icon: "",
  },
  heavy_plate: {
    id: "heavy_plate",
    name: "Тяжёлая бронепластина",
    branch: "common",
    description: "Ставит 40 щита.",
    shield: 40,
    icon: "",
  },
  regen_catalyst: {
    id: "regen_catalyst",
    name: "Катализатор регенерации",
    branch: "common",
    description: "Восстанавливает 60 HP.",
    heal: 60,
    icon: "",
  },
};

interface GameState {
  save: GameSave | null;
  settings: Settings;
  screen: Screen;
  currentSceneId: string | null;
  currentNodeId: string | null;
  currentChapterId: string | null;
  enemy: Enemy | null;
  playerShield: number;
  cooldowns: Record<string, number>;
  enemyWeakenTurns: number;
  toasts: Toast[];
  dialogueLog: string[];
  combatTurn: "player" | "enemy" | null;
  enemyIntent: EnemyIntent | null;

  // Save game management
  newGame: () => void;
  loadGame: () => boolean;
  saveGame: () => void;
  deleteSave: () => void;
  hasSave: () => boolean;

  // Navigation
  setScreen: (s: Screen) => void;
  startDialogue: (sceneId: string) => void;
  gotoNode: (nodeId: string) => void;
  applyChoiceEffects: (choiceId: string) => void;

  // Combat
  startCombat: (enemyId: string) => void;
  retryCombat: () => void;
  castAbility: (abilityId: string) => void;
  skipTurn: () => void;
  consumeItem: (itemId: string) => void;
  enemyTurn: () => void;
  endCombat: (victory: boolean) => void;
  playerTurnStart: () => void;

  // Chapter management
  startChapter: (chapterId: string) => void;
  openCharacters: () => void;
  openCodex: () => void;
  openAbout: () => void;
  markTutorialFlag: (flag: string) => void;
  openAchievements: () => void;
  openSettings: () => void;
  openChat: (characterId?: string | null) => void;
  openLog: () => void;
  resolveEpilogue: () => void;

  // Chat
  sendChatMessage: (
    characterId: string,
    message: string,
    options?: { image?: string; imageCaption?: string }
  ) => Promise<void>;
  clearChatHistory: (characterId: string) => void;
  /** Currently selected character for the chat screen */
  chatSelectedId: string | null;
  setChatSelected: (characterId: string | null) => void;
  /** Async indicator for chat requests */
  chatLoading: boolean;

  // Toasts
  pushToast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;

  // Settings setters
  setAudioEnabled: (v: boolean) => void;
  setAudioVolume: (v: number) => void;
  setAmbientEnabled: (v: boolean) => void;
  setTextSpeed: (v: Settings["textSpeed"]) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setDifficulty: (v: Settings["difficulty"]) => void;
  setAutoAdvanceDialogue: (v: boolean) => void;
  setCombatSpeed: (v: Settings["combatSpeed"]) => void;
  setReducedMotion: (v: boolean) => void;
  setTheme: (v: Settings["theme"]) => void;

  // Achievements
  checkAchievements: () => void;
}

// Prune old messages with images from chat history to avoid localStorage overflow.
// Keeps the most recent messages; removes the oldest image-bearing messages first.
// Threshold: ~3MB total chat history size per character.
function pruneChatHistory(messages: ChatMessage[]): ChatMessage[] {
  const MAX_SIZE = 3_000_000; // ~3MB
  const MAX_MESSAGES = 50;

  // First trim by count
  let pruned = messages.slice(-MAX_MESSAGES);

  // Estimate total size
  const estimateSize = (m: ChatMessage): number => {
    const textSize = (m.content?.length ?? 0) * 2; // UTF-16 chars
    const imageSize = m.image ? m.image.length : 0;
    return textSize + imageSize;
  };

  let totalSize = pruned.reduce((acc, m) => acc + estimateSize(m), 0);

  // If over size limit, remove oldest image-bearing messages first
  while (totalSize > MAX_SIZE && pruned.length > 4) {
    const imgIdx = pruned.findIndex((m) => m.image);
    if (imgIdx === -1) {
      // No more images to prune — trim oldest messages
      const removed = pruned[0];
      totalSize -= estimateSize(removed);
      pruned = pruned.slice(1);
    } else {
      const removed = pruned[imgIdx];
      totalSize -= estimateSize(removed);
      // Strip the image data but keep the text (so conversation flow is preserved)
      pruned = pruned.map((m, i) =>
        i === imgIdx
          ? { ...m, image: undefined, imageCaption: undefined, content: m.content || "[фото удалено для экономии места]" }
          : m
      );
    }
  }

  return pruned;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      save: null,
      settings: DEFAULT_SETTINGS,
      screen: "menu",
      currentSceneId: null,
      currentNodeId: null,
      currentChapterId: null,
      enemy: null,
      chatSelectedId: null,
      chatLoading: false,
      playerShield: 0,
      cooldowns: {},
      enemyWeakenTurns: 0,
      toasts: [],
      dialogueLog: [],
      combatTurn: null,
      enemyIntent: null,

      newGame: () => {
        const fresh = makeFreshSave();
        // Apply difficulty scaling to max HP / current HP
        const mult = difficultyHpMultiplier(get().settings.difficulty);
        const maxHp = Math.round(fresh.maxHp * mult);
        fresh.maxHp = maxHp;
        fresh.hp = maxHp;
        set({
          save: fresh,
          screen: "chapter_card",
          currentChapterId: "ch1",
          currentSceneId: "ch1_bridge",
          currentNodeId: "wake",
          enemy: null,
          playerShield: 0,
          cooldowns: {},
          enemyWeakenTurns: 0,
          toasts: [],
          dialogueLog: [],
      combatTurn: null,
      enemyIntent: null,
        });
      },

      loadGame: () => {
        const s = get().save;
        if (!s) return false;
        const sceneId = s.contextId ?? s.scene;
        const scene = DIALOGUES[sceneId];
        const startNode = s.currentNodeId ?? scene?.startNode ?? "wake";
        set({
          save: s,
          screen: "bridge",
          currentSceneId: sceneId,
          currentNodeId: startNode,
          currentChapterId: `ch${s.chapter}`,
          enemy: null,
          playerShield: 0,
          cooldowns: {},
          enemyWeakenTurns: 0,
          toasts: [],
          dialogueLog: [],
      combatTurn: null,
      enemyIntent: null,
        });
        return true;
      },

      saveGame: () => {
        const s = get().save;
        if (!s) return;
        const updated: GameSave = {
          ...s,
          updatedAt: Date.now(),
          scene: get().currentSceneId ?? s.scene,
          contextId: get().currentSceneId ?? s.contextId,
          currentNodeId: get().currentNodeId ?? s.currentNodeId,
        };
        set({ save: updated });
      },

      deleteSave: () => {
        set({ save: null, screen: "menu" });
      },

      hasSave: () => !!get().save,

      setScreen: (s) => set({ screen: s }),

      startDialogue: (sceneId) => {
        const scene = DIALOGUES[sceneId];
        if (!scene) {
          console.warn("Unknown dialogue scene:", sceneId);
          return;
        }
        // Preserve currentNodeId if we're already in this scene (so loading mid-dialogue
        // and clicking "Продолжить" on the bridge continues from where you left off)
        const state = get();
        const resumeNode =
          state.currentSceneId === sceneId && state.currentNodeId && scene.nodes[state.currentNodeId]
            ? state.currentNodeId
            : scene.startNode;
        const node = scene.nodes[resumeNode];
        const log = [...state.dialogueLog];
        if (node?.speaker && node?.text) log.push(`${node.speaker}: ${node.text}`);
        set({
          screen: "dialogue",
          currentSceneId: sceneId,
          currentNodeId: resumeNode,
          dialogueLog: log.slice(-30),
        });
        get().saveGame();
      },

      gotoNode: (nodeId) => {
        const sceneId = get().currentSceneId;
        if (!sceneId) return;
        const scene = DIALOGUES[sceneId];
        if (!scene) return;
        const node = scene.nodes[nodeId];
        if (!node) return;
        const log = [...get().dialogueLog];
        if (node.speaker && node.text) log.push(`${node.speaker}: ${node.text}`);
        set({
          currentNodeId: nodeId,
          dialogueLog: log.slice(-30),
        });
        get().saveGame();
      },

      applyChoiceEffects: (choiceId) => {
        const state = get();
        const sceneId = state.currentSceneId;
        const nodeId = state.currentNodeId;
        if (!sceneId || !nodeId || !state.save) return;
        const scene = DIALOGUES[sceneId];
        const node = scene?.nodes[nodeId];
        if (!node?.choices) return;
        const choice = node.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        // Check requirements
        if (choice.requires) {
          if (choice.requires.flags) {
            for (const f of choice.requires.flags) {
              if (!state.save.flags.includes(f)) {
                get().pushToast("Требование не выполнено", "bad");
                return;
              }
            }
          }
          if (choice.requires.branchXp) {
            for (const [b, v] of Object.entries(choice.requires.branchXp)) {
              const branch = b as Branch;
              if (state.save.branchXp[branch] < (v ?? 0)) {
                get().pushToast("Недостаточно опыта ветки", "bad");
                return;
              }
            }
          }
          if (choice.requires.relationships) {
            for (const [k, v] of Object.entries(choice.requires.relationships)) {
              if ((state.save.relationships[k] ?? 0) < (v ?? 0)) {
                get().pushToast("Недостаточно отношений", "bad");
                return;
              }
            }
          }
        }

        // Apply effects
        if (choice.effects) {
          const newSave: GameSave = { ...state.save };
          newSave.relationships = { ...newSave.relationships };
          if (choice.effects.relationships) {
            for (const [k, v] of Object.entries(choice.effects.relationships)) {
              newSave.relationships[k] = (newSave.relationships[k] ?? 0) + (v ?? 0);
            }
          }
          newSave.branchXp = { ...newSave.branchXp };
          if (choice.effects.branchXp) {
            for (const [b, v] of Object.entries(choice.effects.branchXp)) {
              const branch = b as Branch;
              newSave.branchXp[branch] = newSave.branchXp[branch] + (v ?? 0);
            }
          }
          if (choice.effects.flags) {
            const merged = new Set([...newSave.flags, ...choice.effects.flags]);
            newSave.flags = Array.from(merged);
          }
          if (typeof choice.effects.hp === "number") {
            newSave.hp = Math.max(0, Math.min(newSave.maxHp, newSave.hp + choice.effects.hp));
          }
          if (typeof choice.effects.energy === "number") {
            newSave.energy = Math.max(0, Math.min(newSave.maxEnergy, newSave.energy + choice.effects.energy));
          }
          set({ save: newSave });
        }

        // Check achievements after choice effects (relationships/flags may trigger romance achievements)
        get().checkAchievements();
        get().gotoNode(choice.goto);
      },

      startCombat: (enemyId) => {
        const enemy = cloneEnemy(enemyId);
        set({
          enemy,
          screen: "combat",
          cooldowns: {},
          enemyWeakenTurns: 0,
          playerShield: 0,
          combatTurn: "player",
          enemyIntent: generateEnemyIntent(enemy),
        });
      },

      retryCombat: () => {
        const state = get();
        if (!state.save || !state.enemy) return;
        // Restore HP and energy to max, restart combat with same enemy
        const newSave: GameSave = {
          ...state.save,
          hp: state.save.maxHp,
          energy: state.save.maxEnergy,
        };
        const freshEnemy = cloneEnemy(state.enemy.id);
        set({
          save: newSave,
          enemy: freshEnemy,
          cooldowns: {},
          enemyWeakenTurns: 0,
          playerShield: 0,
          screen: "combat",
          combatTurn: "player",
          enemyIntent: generateEnemyIntent(freshEnemy),
        });
        get().pushToast("Бой начался заново", "info");
      },

      castAbility: (abilityId) => {
        const state = get();
        if (!state.save || !state.enemy) return;
        // Guard: only allow ability cast during player's turn
        if (state.combatTurn !== "player") return;
        const ability = getAbility(abilityId);
        if (!ability) return;

        if (state.cooldowns[abilityId] && state.cooldowns[abilityId] > 0) {
          get().pushToast("Способность перезаряжается", "bad");
          return;
        }
        if (state.save.energy < ability.energyCost) {
          get().pushToast("Недостаточно энергии", "bad");
          return;
        }

        const newSave: GameSave = { ...state.save };
        const newEnemy: Enemy = { ...state.enemy };
        let newShield = state.playerShield;
        let newWeakenTurns = state.enemyWeakenTurns;
        newSave.energy = Math.max(0, newSave.energy - ability.energyCost);

        // Pre-damage: shield reduction effects (toxin's 50% shield reduction)
        if (ability.shieldReducePct && newEnemy.shield > 0) {
          const reduction = Math.round(newEnemy.shield * (ability.shieldReducePct / 100));
          newEnemy.shield = Math.max(0, newEnemy.shield - reduction);
        }

        if (ability.damage) {
          let dmg = ability.damage;
          if (newEnemy.weakness && ability.branch === newEnemy.weakness) {
            dmg = Math.round(dmg * 1.5);
          }
          let remaining = dmg;

          // ignoreShield: bypass shield entirely (acid, mind-shatter)
          // shieldPenetrate: ignore fixed amount of shield (bio_lance)
          if (!ability.ignoreShield && newEnemy.shield > 0) {
            const effectiveShield = ability.shieldPenetrate
              ? Math.max(0, newEnemy.shield - ability.shieldPenetrate)
              : newEnemy.shield;
            // Only absorb up to the effective shield; shield itself only depletes by effective amount too
            const absorbed = Math.min(effectiveShield, remaining);
            newEnemy.shield -= absorbed;
            remaining -= absorbed;
          }
          if (remaining > 0) {
            newEnemy.hp = Math.max(0, newEnemy.hp - remaining);
          }
        }
        if (ability.heal) {
          newSave.hp = Math.min(newSave.maxHp, newSave.hp + ability.heal);
        }
        if (ability.shield) {
          newShield += ability.shield;
        }
        if (ability.energyRestore) {
          newSave.energy = Math.min(newSave.maxEnergy, newSave.energy + ability.energyRestore);
        }
        // Apply weaken debuff (psy_fear) — extends duration if already active
        if (ability.weakenTurns) {
          newWeakenTurns = Math.max(newWeakenTurns, ability.weakenTurns);
          get().pushToast("Враг ослаблен: −30% урона", "info");
          playSound("weaken_apply");
        }

        const newCooldowns: Record<string, number> = { ...state.cooldowns };
        if (ability.cooldown) {
          newCooldowns[abilityId] = ability.cooldown + 1;
        }

        set({
          save: newSave,
          enemy: newEnemy,
          playerShield: newShield,
          enemyWeakenTurns: newWeakenTurns,
          cooldowns: newCooldowns,
          combatTurn: "enemy",
        });

        // Provide feedback toasts for what just happened
        if (ability.damage) {
          const hpDmg = Math.max(0, state.enemy!.hp - newEnemy.hp);
          const shieldDmg = Math.max(0, state.enemy!.shield - newEnemy.shield);
          if (hpDmg > 0 && shieldDmg > 0) {
            get().pushToast(`${ability.name}: −${hpDmg} HP, сломлено ${shieldDmg} щита`, "good");
          } else if (hpDmg > 0) {
            get().pushToast(`${ability.name}: −${hpDmg} HP врага`, "good");
          } else if (shieldDmg > 0) {
            get().pushToast(`${ability.name}: −${shieldDmg} щита врага`, "info");
          }
        }
        if (ability.heal) {
          get().pushToast(`${ability.name}: +${ability.heal} HP`, "good");
        }
        if (ability.shield) {
          get().pushToast(`${ability.name}: +${ability.shield} щита`, "info");
        }
        if (ability.energyRestore) {
          get().pushToast(`${ability.name}: +${ability.energyRestore} энергии`, "info");
        }

        if (newEnemy.hp <= 0) {
          const speedMult = combatSpeedMultiplier(get().settings.combatSpeed);
          setTimeout(() => get().endCombat(true), Math.round(700 * speedMult));
        } else {
          const speedMult = combatSpeedMultiplier(get().settings.combatSpeed);
          setTimeout(() => get().enemyTurn(), Math.round(800 * speedMult));
        }
      },

      skipTurn: () => {
        const state = get();
        if (!state.save || !state.enemy) return;
        // Guard: only allow skip during player's turn
        if (state.combatTurn !== "player") return;
        const newSave: GameSave = { ...state.save };
        newSave.energy = Math.min(newSave.maxEnergy, newSave.energy + 10);
        const newCooldowns: Record<string, number> = {};
        for (const [k, v] of Object.entries(state.cooldowns)) {
          if (v > 1) newCooldowns[k] = v - 1;
        }
        set({ save: newSave, cooldowns: newCooldowns, combatTurn: "enemy" });
        const speedMult = combatSpeedMultiplier(get().settings.combatSpeed);
        setTimeout(() => get().enemyTurn(), Math.round(600 * speedMult));
      },

      consumeItem: (itemId) => {
        const state = get();
        if (!state.save) return;
        const idx = state.save.inventory.findIndex((i) => i.id === itemId);
        if (idx < 0) return;
        const item = state.save.inventory[idx];
        if (item.count <= 0) return;
        const newSave: GameSave = { ...state.save };
        const newInv = [...newSave.inventory];
        newInv[idx] = { ...item, count: item.count - 1 };
        newSave.inventory = newInv;
        let newShield = state.playerShield;
        if (item.heal) {
          newSave.hp = Math.min(newSave.maxHp, newSave.hp + item.heal);
          get().pushToast(`${item.name}: +${item.heal} HP`, "good");
        }
        if (item.energy) {
          newSave.energy = Math.min(newSave.maxEnergy, newSave.energy + item.energy);
          get().pushToast(`${item.name}: +${item.energy} энергии`, "good");
        }
        if (item.shield) {
          newShield += item.shield;
          get().pushToast(`${item.name}: +${item.shield} щита`, "good");
        }
        set({ save: newSave, playerShield: newShield });
      },

      enemyTurn: () => {
        const state = get();
        if (!state.save || !state.enemy) return;
        const e = state.enemy;
        const [lo, hi] = e.damage;
        let dmg = Math.round(lo + Math.random() * (hi - lo));

        // Apply difficulty modifier: easy = 75% dmg, normal = 100%, hard = 125% dmg
        const diff = state.settings.difficulty;
        if (diff === "easy") dmg = Math.round(dmg * 0.75);
        else if (diff === "hard") dmg = Math.round(dmg * 1.25);

        // Apply weaken debuff (from psy_fear): -30% damage while active
        const weakenActive = state.enemyWeakenTurns > 0;
        if (weakenActive) {
          dmg = Math.round(dmg * 0.7);
        }

        if (e.ai === "defensive" && e.shield < 10 && Math.random() < 0.4) {
          const newEnemy: Enemy = { ...e, shield: e.shield + 10 };
          // Decrement weaken turns even when enemy defends
          const newWeaken = Math.max(0, state.enemyWeakenTurns - 1);
          set({ enemy: newEnemy, enemyWeakenTurns: newWeaken });
          get().pushToast(`${e.name} ставит щит +10`, "info");
          get().playerTurnStart();
          return;
        }
        if (e.ai === "heavy") {
          dmg = Math.round(dmg * 1.25);
        }

        const newSave: GameSave = { ...state.save };
        let remaining = dmg;
        let newShield = state.playerShield;
        if (newShield > 0) {
          const absorbed = Math.min(newShield, remaining);
          newShield -= absorbed;
          remaining -= absorbed;
        }
        if (remaining > 0) {
          newSave.hp = Math.max(0, newSave.hp - remaining);
        }
        // Decrement weaken debuff duration after enemy acts
        const newWeaken = Math.max(0, state.enemyWeakenTurns - 1);
        set({ save: newSave, playerShield: newShield, enemyWeakenTurns: newWeaken });
        get().pushToast(
          `${e.name} наносит ${dmg} урона${weakenActive ? " (ослаблен)" : ""}`,
          "bad"
        );

        if (newSave.hp <= 0) {
          const speedMult = combatSpeedMultiplier(get().settings.combatSpeed);
          setTimeout(() => get().endCombat(false), Math.round(700 * speedMult));
          return;
        }
        get().playerTurnStart();
      },

      playerTurnStart: () => {
        const state = get();
        if (!state.save) return;
        const newSave: GameSave = { ...state.save };
        newSave.energy = Math.min(newSave.maxEnergy, newSave.energy + 3);
        const newCooldowns: Record<string, number> = {};
        for (const [k, v] of Object.entries(state.cooldowns)) {
          if (v > 1) newCooldowns[k] = v - 1;
        }
        const nextIntent = state.enemy ? generateEnemyIntent(state.enemy) : null;
        set({ save: newSave, cooldowns: newCooldowns, combatTurn: "player", enemyIntent: nextIntent });
      },

      endCombat: (victory) => {
        const state = get();
        if (!state.save) return;
        // Guard against double-call — if enemy is already null, combat has ended
        if (!state.enemy) return;
        const enemy = state.enemy;
        const newSave: GameSave = { ...state.save };

        if (victory && enemy) {
          if (!newSave.defeatedEnemies.includes(enemy.id)) {
            newSave.defeatedEnemies.push(enemy.id);
          }
          if (enemy.reward) {
            newSave.branchXp = { ...newSave.branchXp };
            if (enemy.reward.branchXp) {
              for (const [b, v] of Object.entries(enemy.reward.branchXp)) {
                const branch = b as Branch;
                newSave.branchXp[branch] = newSave.branchXp[branch] + (v ?? 0);
              }
            }
            if (enemy.reward.flags) {
              const merged = new Set([...newSave.flags, ...enemy.reward.flags]);
              newSave.flags = Array.from(merged);
            }
            if (enemy.reward.items) {
              const newInv = [...newSave.inventory];
              for (const it of enemy.reward.items) {
                const existingIdx = newInv.findIndex((x) => x.id === it.id);
                if (existingIdx >= 0) {
                  newInv[existingIdx] = {
                    ...newInv[existingIdx],
                    count: newInv[existingIdx].count + it.count,
                  };
                } else {
                  const tpl = ITEM_TEMPLATES[it.id];
                  if (tpl) newInv.push({ ...tpl, count: it.count });
                }
              }
              newSave.inventory = newInv;
            }
          }
          for (const ab of ABILITIES) {
            if (ab.branch === "free") continue;
            if (newSave.unlockedAbilities.includes(ab.id)) continue;
            const branchXp = newSave.branchXp[ab.branch as Branch];
            const required = ab.tier === 1 ? 10 : ab.tier === 2 ? 40 : 90;
            if (branchXp >= required) {
              newSave.unlockedAbilities.push(ab.id);
              get().pushToast(`Открыта способность: ${ab.name}`, "good");
            }
          }
          get().pushToast(`Победа: ${enemy.name} повержен!`, "good");

          set({ save: newSave, enemy: null, cooldowns: {}, enemyWeakenTurns: 0, playerShield: 0, combatTurn: null, enemyIntent: null });
          get().checkAchievements();

          const victoryDelay = Math.round(1300 * combatSpeedMultiplier(get().settings.combatSpeed));
          setTimeout(() => {
            const currentChapter = get().currentChapterId ?? `ch${get().save?.chapter ?? 1}`;
            const idx = CHAPTERS.findIndex((c) => c.id === currentChapter);
            if (idx >= 0 && idx < CHAPTERS.length - 1) {
              const next = CHAPTERS[idx + 1];
              const startNode = DIALOGUES[next.nextContext ?? ""]?.startNode ?? null;
              set({
                screen: "chapter_card",
                currentChapterId: next.id,
                currentSceneId: next.nextContext,
                currentNodeId: startNode,
                save: {
                  ...get().save!,
                  chapter: next.number,
                  scene: next.nextContext ?? "",
                  contextId: next.nextContext,
                  currentNodeId: startNode ?? undefined,
                },
              });
            } else {
              get().resolveEpilogue();
            }
          }, victoryDelay);
          return;
        }

        get().pushToast("Поражение…", "bad");
        set({ save: newSave, enemy: null, cooldowns: {}, enemyWeakenTurns: 0, playerShield: 0, screen: "menu", combatTurn: null, enemyIntent: null });
      },

      startChapter: (chapterId) => {
        const ch = CHAPTERS.find((c) => c.id === chapterId);
        if (!ch) return;
        const nextSceneId = ch.nextContext ?? "";
        const startNode = DIALOGUES[nextSceneId]?.startNode ?? null;
        const s = get().save;
        set({
          screen: ch.nextScreen,
          currentChapterId: ch.id,
          currentSceneId: nextSceneId,
          currentNodeId: startNode,
        });
        if (s) {
          set({
            save: {
              ...s,
              chapter: ch.number,
              scene: nextSceneId,
              contextId: nextSceneId,
              currentNodeId: startNode ?? undefined,
            },
          });
        }
      },

      openCharacters: () => set({ screen: "characters" }),
      openCodex: () => set({ screen: "codex" }),
      openAbout: () => set({ screen: "about" }),
      openAchievements: () => set({ screen: "achievements" }),
      openSettings: () => set({ screen: "settings" }),
      openChat: (characterId = null) =>
        set({ screen: "chat", chatSelectedId: characterId }),
      openLog: () => set({ screen: "bridge" }),
      setChatSelected: (characterId) => set({ chatSelectedId: characterId }),

      clearChatHistory: (characterId) => {
        const s = get().save;
        if (!s) return;
        const newHistory = { ...s.chatHistory };
        delete newHistory[characterId];
        set({ save: { ...s, chatHistory: newHistory } });
      },
sendChatMessage: async (characterId, message, options) => {
        const state = get();
        if (!state.save) return;
        // Don't allow concurrent requests for the same character
        if (state.chatLoading) return;

        const trimmedMessage = message.trim().slice(0, 1000);
        // Allow empty text if an image is attached
        if (!trimmedMessage && !options?.image) return;

        const userMsg: ChatMessage = {
          role: "user",
          content: trimmedMessage,
          ts: Date.now(),
          image: options?.image,
          imageCaption: options?.imageCaption,
        };

        // Update save with user message immediately so UI shows it
        const newHistory = pruneChatHistory([
          ...(state.save.chatHistory[characterId] ?? []),
          userMsg,
        ]);
        const saveWithUserMsg: GameSave = {
          ...state.save,
          chatHistory: {
            ...state.save.chatHistory,
            [characterId]: newHistory,
          },
        };
        set({ save: saveWithUserMsg, chatLoading: true });

        try {
          // Build history for the API: only role + content (skip image-bearing messages
          // since the API needs string content, and we can't replay old images cheaply)
          const apiHistory = saveWithUserMsg.chatHistory[characterId]
            ?.slice(0, -1) // exclude the just-added user message (it's sent as `message`)
            .filter((m) => !m.image) // skip image messages — VLM can't re-analyze old images
            .map((m) => ({ role: m.role, content: m.content })) ?? [];

          const saveContext = {
            chapter: state.save.chapter,
            relationship: state.save.relationships[characterId] ?? 0,
          };

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              characterId,
              message: trimmedMessage,
              history: apiHistory,
              saveContext,
              image: options?.image,
              imageCaption: options?.imageCaption,
            }),
          });

          if (!res.ok) {
            throw new Error(`Chat API failed: ${res.status}`);
          }

          // Check if response is a stream (SSE) or JSON
          const contentType = res.headers.get("content-type") || "";
          let aiContent: string;

          if (contentType.includes("text/event-stream")) {
            // Stream: read SSE chunks and progressively update the AI message
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            if (reader) {
              // Create an initial empty AI message for progressive updates
              const initialAiMsg: ChatMessage = {
                role: "assistant",
                content: "",
                ts: Date.now(),
              };
              let sAfter = get().save;
              if (!sAfter) return;
              set({
                save: {
                  ...sAfter,
                  chatHistory: {
                    ...sAfter.chatHistory,
                    [characterId]: pruneChatHistory([
                      ...(sAfter.chatHistory[characterId] ?? []),
                      initialAiMsg,
                    ]),
                  },
                },
              });

              // Read stream chunks
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                // Parse SSE lines
                const lines = text.split("\n");
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.chunk) {
                        fullText += data.chunk;
                        // Update the AI message content progressively
                        sAfter = get().save;
                        if (!sAfter) break;
                        const hist = sAfter.chatHistory[characterId] ?? [];
                        if (hist.length > 0) {
                          const updated = [...hist];
                          updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            content: fullText,
                          };
                          set({
                            save: {
                              ...sAfter,
                              chatHistory: {
                                ...sAfter.chatHistory,
                                [characterId]: updated,
                              },
                            },
                          });
                        }
                      }
                      if (data.fullText) {
                        fullText = data.fullText;
                      }
                    } catch {}
                  }
                }
              }
            }

            aiContent = fullText || CHARACTERS.find((c) => c.id === characterId)?.chatGreeting || "…";
            // Final update with complete text
            const sFinal = get().save;
            if (sFinal) {
              const hist = sFinal.chatHistory[characterId] ?? [];
              if (hist.length > 0) {
                const updated = [...hist];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: aiContent,
                };
                set({
                  save: {
                    ...sFinal,
                    chatHistory: {
                      ...sFinal.chatHistory,
                      [characterId]: pruneChatHistory(updated),
                    },
                  },
                  chatLoading: false,
                });
              } else {
                set({ chatLoading: false });
              }
            } else {
              set({ chatLoading: false });
            }
          } else {
            // Non-streaming JSON response (fallback or image/VLM)
            const data = await res.json();
            aiContent =
              data?.response ??
              CHARACTERS.find((c) => c.id === characterId)?.chatGreeting ??
              "…";

            const aiMsg: ChatMessage = {
              role: "assistant",
              content: aiContent,
              ts: Date.now(),
            };

            // Append AI message to chat history
            const sAfter = get().save;
            if (!sAfter) return;
            set({
              save: {
                ...sAfter,
                chatHistory: {
                  ...sAfter.chatHistory,
                  [characterId]: pruneChatHistory([
                    ...(sAfter.chatHistory[characterId] ?? []),
                    aiMsg,
                  ]),
                },
              },
              chatLoading: false,
            });
          }
        } catch (e) {
          console.error("Chat request failed:", e);
          set({ chatLoading: false });
          get().pushToast("Связь с экипажем прервана", "bad");
        }
      },

      markTutorialFlag: (flag) => {
        const s = get().save;
        if (!s) return;
        if (s.tutorialFlags.includes(flag)) return;
        set({
          save: {
            ...s,
            tutorialFlags: [...s.tutorialFlags, flag],
          },
        });
      },

      resolveEpilogue: () => {
        const s = get().save;
        if (!s) return;
        const ending = resolveEnding(s);
        set({ screen: "ending" });
        get().pushToast(
          `Финал: ${ending.title}`,
          ending.tone === "good" ? "good" : ending.tone === "bad" ? "bad" : "info"
        );
      },

      pushToast: (text, tone = "info") => {
        const duration = 3200;
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const toast: Toast = { id, text, tone, createdAt: Date.now(), duration };
        set({ toasts: [...get().toasts, toast].slice(-4) });
        // Play a short chime matching the toast tone
        playSound(tone === "good" ? "toast_good" : tone === "bad" ? "toast_bad" : "toast_info");
        setTimeout(() => {
          get().dismissToast(id);
        }, duration);
      },

      dismissToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      },

      setAudioEnabled: (v) => set({ settings: { ...get().settings, audioEnabled: v } }),
      setAudioVolume: (v) => set({ settings: { ...get().settings, audioVolume: v } }),
      setAmbientEnabled: (v) => set({ settings: { ...get().settings, ambientEnabled: v } }),
      setTextSpeed: (v) => set({ settings: { ...get().settings, textSpeed: v } }),
      setAnimationsEnabled: (v) => set({ settings: { ...get().settings, animationsEnabled: v } }),
      setDifficulty: (v) => set({ settings: { ...get().settings, difficulty: v } }),
      setAutoAdvanceDialogue: (v) => set({ settings: { ...get().settings, autoAdvanceDialogue: v } }),
      setCombatSpeed: (v) => set({ settings: { ...get().settings, combatSpeed: v } }),
      setReducedMotion: (v) => set({ settings: { ...get().settings, reducedMotion: v } }),
      setTheme: (v) => {
        set({ settings: { ...get().settings, theme: v } });
        const s = get().save;
        if (s && !s.flags.includes("theme_customized")) {
          set({ save: { ...s, flags: [...s.flags, "theme_customized"] } });
        }
      },

      checkAchievements: () => {
        const s = get().save;
        if (!s) return;
        const newly = newlyUnlockedAchievements(s);
        if (newly.length === 0) return;
        const seen = [...s.seenAchievements, ...newly.map((a) => a.id)];
        set({ save: { ...s, seenAchievements: seen } });
        // Note: the AchievementUnlockOverlay in GameShell handles visual feedback
        // when seenAchievements changes. We don't push toasts here to avoid duplicates.
      },
    }),
    {
      name: "star-courier-save",
      version: 2, // Bump version to trigger one-time migration
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage)
      ),
      partialize: (s) => ({ save: s.save, settings: s.settings }),
      // One-time migration: force ambientEnabled=false for v1 saves (music OFF by default)
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { save?: unknown; settings?: Record<string, unknown> };
        if (version < 2 && state?.settings) {
          // Force music OFF — user must explicitly enable via MusicPlayer or Settings
          state.settings.ambientEnabled = false;
        }
        return state as { save?: GameSave; settings?: Settings };
      },
      // Hydration: ensure chatHistory exists on older saves
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const s = state.save;
        if (s && !s.chatHistory) {
          state.save = { ...s, chatHistory: {} };
        }
      },
    }
  )
);
