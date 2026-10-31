import type { Enemy } from "@/game/types";

// Static definitions — use cloneEnemy() to get a fresh mutable instance.
const ENEMY_DEFS: Record<string, Omit<Enemy, "hp" | "shield">> = {
  pirate_scout: {
    id: "pirate_scout",
    name: "Пират-разведчик",
    description: "Лёгкий пиратский истребитель. Слабая броня, но маневренный. Служит глазами банды.",
    maxHp: 70,
    damage: [6, 12],
    abilities: ["strike"],
    weakness: "biotics",
    portraitColor: "#d4a878",
    ai: "standard",
    reward: {
      branchXp: { alchemy: 0, biotics: 5, psyche: 0 },
      items: [{ id: "stim_pack", count: 1 }],
    },
  },
  pirate_brute: {
    id: "pirate_brute",
    name: "Пират-громила",
    description: "Тяжёлый пиратский корабль с усиленной обшивкой. Медленный, но опасный в ближнем бою.",
    maxHp: 130,
    damage: [10, 18],
    abilities: ["strike", "board"],
    weakness: "psyche",
    portraitColor: "#c08060",
    ai: "heavy",
    reward: {
      branchXp: { alchemy: 8, biotics: 0, psyche: 5 },
      items: [{ id: "shield_cell", count: 1 }],
    },
  },
  synth_hunter: {
    id: "synth_hunter",
    name: "Охотник-синтет",
    description: "Автономный боевой дроид с собственным ИИ. Без emotions, без колебаний. Только цель.",
    maxHp: 110,
    damage: [12, 20],
    abilities: ["strike", "lock_on"],
    weakness: "alchemy",
    portraitColor: "#9aa8d4",
    ai: "defensive",
    reward: {
      branchXp: { alchemy: 10, biotics: 5, psyche: 0 },
      items: [{ id: "energy_cell", count: 2 }],
    },
  },
  shadow: {
    id: "shadow",
    name: "Тень",
    description: "Разумный сгусток тёмной материи. Не отражает свет, только поглощает. Один из охранников артефакта.",
    maxHp: 80,
    damage: [8, 14],
    abilities: ["strike", "vanish"],
    weakness: "biotics",
    portraitColor: "#3a2a4a",
    ai: "defensive",
    reward: {
      branchXp: { alchemy: 0, biotics: 8, psyche: 12 },
      flags: ["shadow_seen"],
    },
  },
  security_drone: {
    id: "security_drone",
    name: "Дрон безопасности",
    description: "Старый корпоративный охранный дрон. Холодный, расчётливый, смертельно опасный на средних дистанциях.",
    maxHp: 100,
    damage: [9, 16],
    abilities: ["strike", "lock_on"],
    weakness: "alchemy",
    portraitColor: "#80c8a8",
    ai: "standard",
    reward: {
      branchXp: { alchemy: 8, biotics: 0, psyche: 8 },
      items: [{ id: "shield_cell", count: 1 }],
    },
  },
  pirate_captain: {
    id: "pirate_captain",
    name: "Капитан Ворон",
    description: "Лидер пиратской флотилии. Командует флагманом \"Чёрный Коготь\". Известен своей жестокостью и стратегическим умом. БОСС.",
    maxHp: 180,
    damage: [14, 24],
    abilities: ["strike", "board", "lock_on"],
    weakness: "psyche",
    portraitColor: "#5a2a3a",
    ai: "heavy",
    reward: {
      branchXp: { alchemy: 20, biotics: 20, psyche: 20 },
      flags: ["voron_defeated", "chapter4_complete"],
      items: [{ id: "shield_cell", count: 2 }, { id: "energy_cell", count: 2 }],
    },
  },
  void_pirate: {
    id: "void_pirate",
    name: "Пустотный пират",
    description: "Фанатик с окраинных миров, поклявшийся служить пустоте. Молниеносный, но хрупкий.",
    maxHp: 55,
    damage: [14, 22],
    abilities: ["strike", "lock_on"],
    weakness: "alchemy",
    portraitColor: "#5a3a8a",
    ai: "standard",
    reward: { branchXp: { alchemy: 6, biotics: 0, psyche: 8 }, items: [{ id: "combat_stim", count: 1 }] },
  },
  cultist_acolyte: {
    id: "cultist_acolyte",
    name: "Культист-послушник",
    description: "Адепт ордена Тёмной Руки. Атакует разум, не тело.",
    maxHp: 95,
    damage: [11, 18],
    abilities: ["strike", "lock_on", "vanish"],
    weakness: "alchemy",
    portraitColor: "#6a3a5a",
    ai: "defensive",
    reward: { branchXp: { alchemy: 12, biotics: 6, psyche: 10 }, items: [{ id: "regen_catalyst", count: 1 }], flags: ["cultist_seen"] },
  },
  merc_engineer: {
    id: "merc_engineer",
    name: "Наёмник-инженер",
    description: "Бывший военный инженер корпорации \"Гелиос\". Чинится в бою.",
    maxHp: 120,
    damage: [9, 15],
    abilities: ["strike", "lock_on"],
    weakness: "biotics",
    portraitColor: "#7a8a5a",
    ai: "defensive",
    reward: { branchXp: { alchemy: 8, biotics: 12, psyche: 5 }, items: [{ id: "heavy_plate", count: 1 }, { id: "energy_cell", count: 1 }] },
  },
  void_prophet: {
    id: "void_prophet",
    name: "Пророк Пустоты",
    description: "Лидер пустотных пиратов. Корабль не отражает свет. Голос — тишина, которая звучит. МИНИ-БОСС.",
    maxHp: 140,
    damage: [12, 22],
    abilities: ["strike", "lock_on", "vanish"],
    weakness: "alchemy",
    portraitColor: "#2a1a4a",
    ai: "heavy",
    reward: { branchXp: { alchemy: 15, biotics: 10, psyche: 20 }, items: [{ id: "regen_catalyst", count: 1 }, { id: "combat_stim", count: 2 }], flags: ["void_prophet_defeated"] },
  },
  cultist_high_priest: {
    id: "cultist_high_priest",
    name: "Верховный жрец Тёмной Руки",
    description: "Древнее существо, помнящее рождение Эла. Мантия из тёмной материи. МИНИ-БОСС.",
    maxHp: 160,
    damage: [14, 24],
    abilities: ["strike", "lock_on", "vanish"],
    weakness: "biotics",
    portraitColor: "#3a1a5a",
    ai: "heavy",
    reward: { branchXp: { alchemy: 20, biotics: 20, psyche: 15 }, items: [{ id: "heavy_plate", count: 1 }, { id: "regen_catalyst", count: 1 }], flags: ["high_priest_defeated"] },
  },
};

export const ENEMIES: Record<string, Omit<Enemy, "hp" | "shield">> = ENEMY_DEFS;

const BOSS_IDS = new Set<string>(["pirate_captain"]);
const MINI_BOSS_IDS = new Set<string>(["void_prophet", "cultist_high_priest"]);

export function isBoss(enemy: Enemy): boolean {
  return BOSS_IDS.has(enemy.id);
}

export function isMiniBoss(enemy: Enemy): boolean {
  return MINI_BOSS_IDS.has(enemy.id);
}

export function bossShieldById(id: string): number {
  switch (id) {
    case "pirate_scout":
      return 0;
    case "pirate_brute":
      return 10;
    case "synth_hunter":
      return 25;
    case "shadow":
      return 0;
    case "security_drone":
      return 20;
    case "pirate_captain":
      return 40;
    case "void_pirate":
      return 0;
    case "cultist_acolyte":
      return 15;
    case "merc_engineer":
      return 30;
    case "void_prophet":
      return 35;
    case "cultist_high_priest":
      return 45;
    default:
      return 0;
  }
}

export function cloneEnemy(id: string): Enemy {
  const def = ENEMY_DEFS[id];
  if (!def) {
    throw new Error(`Unknown enemy id: ${id}`);
  }
  return {
    ...def,
    hp: def.maxHp,
    shield: bossShieldById(id),
    damage: [...def.damage] as [number, number],
    abilities: [...def.abilities],
  };
}
