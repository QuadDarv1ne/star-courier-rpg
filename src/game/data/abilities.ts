import type { Ability, Branch } from "@/game/types";

// ============ FREE / BASIC ABILITIES (available to all) ============
const FREE_ABILITIES: Ability[] = [
  {
    id: "strike",
    branch: "free",
    name: "Удар прикладом",
    description: "Прямой удар оружием. Не требует энергии, всегда доступен. Наносит 10 урона противнику.",
    energyCost: 0,
    tier: 0,
    damage: 10,
    icon: "",
  },
  {
    id: "recharge",
    branch: "free",
    name: "Перезарядка",
    description: "Быстрая перезарядка энергозапаса. Восстанавливает 15 единиц энергии. Перезарядка 3 хода.",
    energyCost: 0,
    energyRestore: 15,
    cooldown: 3,
    tier: 0,
    icon: "",
  },
  {
    id: "meditate",
    branch: "free",
    name: "Медитация",
    description: "Краткая медитация, восстанавливающая тело и разум. Восстанавливает 10 HP и 5 энергии. Перезарядка 4 хода.",
    energyCost: 0,
    heal: 10,
    energyRestore: 5,
    cooldown: 4,
    tier: 0,
    icon: "",
  },
];

// ============ ALCHEMY BRANCH ============
const ALCHEMY_ABILITIES: Ability[] = [
  {
    id: "alc_acid",
    branch: "alchemy",
    name: "Кислотный удар",
    description: "Выстрел концентрированной кислотой. Игнорирует броню. Наносит 18 урона, не реагирует на щиты противника.",
    energyCost: 12,
    tier: 1,
    damage: 18,
    ignoreShield: true,
    icon: "",
  },
  {
    id: "alc_regen",
    branch: "alchemy",
    name: "Клеточная регенерация",
    description: "Стимуляция быстрого деления клеток. Восстанавливает 30 HP. Перезарядка 3 хода.",
    energyCost: 18,
    tier: 1,
    heal: 30,
    cooldown: 3,
    icon: "",
  },
  {
    id: "alc_toxin",
    branch: "alchemy",
    name: "Токсичный коктейль",
    description: "Поджигает кровь противника ядами. Наносит 25 урона и ослабляет (теряет щит врага на 50%). Перезарядка 4 хода.",
    energyCost: 22,
    tier: 2,
    damage: 25,
    cooldown: 4,
    shieldReducePct: 50,
    icon: "",
  },
  {
    id: "alc_catalyst",
    branch: "alchemy",
    name: "Катализатор",
    description: "Запускает цепную реакцию в организме цели. Наносит 45 урона, но стоит 30 энергии. Перезарядка 5 ходов.",
    energyCost: 30,
    tier: 3,
    damage: 45,
    cooldown: 5,
    icon: "",
  },
  {
    id: "alc_genesis",
    branch: "alchemy",
    name: "Генезис",
    description: "Венец алхимии: перестраивает молекулы цели. 70 урона, игнор щита, ослабление 3 хода. Перезарядка 6.",
    energyCost: 45,
    tier: 4,
    damage: 70,
    cooldown: 6,
    ignoreShield: true,
    weakenTurns: 3,
    icon: "",
  },
];
const BIOTICS_ABILITIES: Ability[] = [
  {
    id: "bio_barrier",
    branch: "biotics",
    name: "Био-барьер",
    description: "Концентрирует живую энергию в защитный панцирь вокруг капитана. Ставит 25 щита. Перезарядка 2 хода.",
    energyCost: 14,
    tier: 1,
    shield: 25,
    cooldown: 2,
    icon: "",
  },
  {
    id: "bio_lance",
    branch: "biotics",
    name: "Био-копь",
    description: "Сгусток живой энергии, пробивающий броню. Наносит 22 урона и пробивает 15 щита врага.",
    energyCost: 16,
    tier: 1,
    damage: 22,
    shieldPenetrate: 15,
    icon: "",
  },
  {
    id: "bio_drain",
    branch: "biotics",
    name: "Энергетический дренаж",
    description: "Вытягивает жизнь из врага, передавая её капитану. Наносит 20 урона и лечит капитана на 15 HP. Перезарядка 3 хода.",
    energyCost: 20,
    tier: 2,
    damage: 20,
    heal: 15,
    cooldown: 3,
    icon: "",
  },
  {
    id: "bio_storm",
    branch: "biotics",
    name: "Био-шторм",
    description: "Волна живой энергии, накрывающая всё поле боя. Наносит 40 урона и ставит 30 щита капитану. Перезарядка 5 ходов.",
    energyCost: 32,
    tier: 3,
    damage: 40,
    shield: 30,
    cooldown: 5,
    icon: "",
  },
  {
    id: "bio_genesis_field",
    branch: "biotics",
    name: "Поле генезиса",
    description: "Венец биотики: поле, впитывающее удар (60 щита) + 25 HP. Перезарядка 7.",
    energyCost: 45,
    tier: 4,
    shield: 60,
    heal: 25,
    cooldown: 7,
    icon: "",
  },
];

// ============ PSYCHE BRANCH ============
const PSYCHE_ABILITIES: Ability[] = [
  {
    id: "psy_fear",
    branch: "psyche",
    name: "Страх",
    description: "Проникает в разум врага и пробуждает его кошмары. Наносит 16 урона и снижает урон врага на 30% на 2 хода. Перезарядка 2 хода.",
    energyCost: 14,
    tier: 1,
    damage: 16,
    cooldown: 2,
    weakenTurns: 2,
    icon: "",
  },
  {
    id: "psy_clarity",
    branch: "psyche",
    name: "Ясность разума",
    description: "Снимает туман с разума капитана. Восстанавливает 20 энергии и 15 HP. Перезарядка 3 хода.",
    energyCost: 0,
    tier: 1,
    heal: 15,
    energyRestore: 20,
    cooldown: 3,
    icon: "",
  },
  {
    id: "psy_dominate",
    branch: "psyche",
    name: "Подчинение воли",
    description: "Заставляет врага атаковать самого себя. Наносит 28 урона. Перезарядка 4 хода.",
    energyCost: 24,
    tier: 2,
    damage: 28,
    cooldown: 4,
    icon: "",
  },
  {
    id: "psy_shatter",
    branch: "psyche",
    name: "Разлом разума",
    description: "Разрушает связь между разумом и телом врага. Наносит 42 урона, игнорируя щиты. Перезарядка 5 ходов.",
    energyCost: 30,
    tier: 3,
    damage: 42,
    cooldown: 5,
    ignoreShield: true,
    icon: "",
  },
  {
    id: "psy_dominion",
    branch: "psyche",
    name: "Владычество",
    description: "Венец психеи: полное подчинение. 55 урона, игнор щита, 100% снятие щита. Перезарядка 8.",
    energyCost: 50,
    tier: 4,
    damage: 55,
    cooldown: 8,
    ignoreShield: true,
    shieldReducePct: 100,
    icon: "",
  },
];

export const ABILITIES: Ability[] = [
  ...FREE_ABILITIES,
  ...ALCHEMY_ABILITIES,
  ...BIOTICS_ABILITIES,
  ...PSYCHE_ABILITIES,
];

export const STARTING_ABILITIES: string[] = ["strike", "recharge", "meditate"];

export function getAbility(id: string): Ability | undefined {
  return ABILITIES.find((a) => a.id === id);
}

export function abilitiesForBranch(branch: Branch): Ability[] {
  return ABILITIES.filter((a) => a.branch === branch);
}

export const BRANCH_UNLOCK_XP: Record<Branch, number[]> = {
  alchemy: [10, 40, 90, 150],
  biotics: [10, 40, 90, 150],
  psyche: [10, 40, 90, 150],
};

export function abilitiesUnlockedForBranch(branch: Branch, xp: number): Ability[] {
  const thresholds = BRANCH_UNLOCK_XP[branch];
  return abilitiesForBranch(branch).filter((a) => {
    const t = a.tier;
    if (t === 1) return xp >= thresholds[0];
    if (t === 2) return xp >= thresholds[1];
    if (t === 3) return xp >= thresholds[2];
    if (t === 4) return xp >= thresholds[3];
    return false;
  });
}

export function isAbilityUnlocked(
  abilityId: string,
  unlockedAbilities: string[],
  branchXp: { alchemy: number; biotics: number; psyche: number }
): boolean {
  const a = getAbility(abilityId);
  if (!a) return false;
  if (a.branch === "free") return true;
  if (unlockedAbilities.includes(abilityId)) return true;
  if (a.branch === "alchemy") return abilitiesUnlockedForBranch("alchemy", branchXp.alchemy).some((x) => x.id === abilityId);
  if (a.branch === "biotics") return abilitiesUnlockedForBranch("biotics", branchXp.biotics).some((x) => x.id === abilityId);
  if (a.branch === "psyche") return abilitiesUnlockedForBranch("psyche", branchXp.psyche).some((x) => x.id === abilityId);
  return false;
}
