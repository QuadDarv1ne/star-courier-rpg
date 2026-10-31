import type { Achievement, GameSave } from "@/game/types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_blood",
    name: "Первая кровь",
    description: "Победите первого врага в бою.",
    icon: "",
    check: (s) => s.defeatedEnemies.length >= 1,
  },
  {
    id: "pirate_slayer",
    name: "Истребитель пиратов",
    description: "Победите 5 врагов суммарно.",
    icon: "",
    check: (s) => s.defeatedEnemies.length >= 5,
  },
  {
    id: "voron_slayer",
    name: "Свержение Ворона",
    description: "Победите капитана Ворона в финальной битве.",
    icon: "",
    check: (s) => s.defeatedEnemies.includes("pirate_captain"),
  },
  {
    id: "apprentice_alchemist",
    name: "Ученик алхимика",
    description: "Достигните 10 XP в ветке Алхимия.",
    icon: "",
    check: (s) => s.branchXp.alchemy >= 10,
  },
  {
    id: "apprentice_biotic",
    name: "Ученик биотика",
    description: "Достигните 10 XP в ветке Биотика.",
    icon: "",
    check: (s) => s.branchXp.biotics >= 10,
  },
  {
    id: "apprentice_psyche",
    name: "Ученик психеи",
    description: "Достигните 10 XP в ветке Психея.",
    icon: "",
    check: (s) => s.branchXp.psyche >= 10,
  },
  {
    id: "master_alchemist",
    name: "Мастер алхимии",
    description: "Достигните 90 XP в ветке Алхимия.",
    icon: "",
    check: (s) => s.branchXp.alchemy >= 90,
  },
  {
    id: "master_biotic",
    name: "Мастер биотики",
    description: "Достигните 90 XP в ветке Биотика.",
    icon: "",
    check: (s) => s.branchXp.biotics >= 90,
  },
  {
    id: "master_psyche",
    name: "Мастер психеи",
    description: "Достигните 90 XP в ветке Психея.",
    icon: "",
    check: (s) => s.branchXp.psyche >= 90,
  },
  {
    id: "trust_athena",
    name: "Доверие Афины",
    description: "Получите 30 или более очков отношений с Афины.",
    icon: "",
    check: (s) => (s.relationships.athena ?? 0) >= 30,
  },
  {
    id: "true_friend",
    name: "Настоящий друг",
    description: "Достигните 50+ отношений с любым членом экипажа.",
    icon: "",
    check: (s) => Object.values(s.relationships).some((v) => v >= 50),
  },
  {
    id: "whole_crew",
    name: "Весь экипаж",
    description: "Достигните 20+ отношений со всеми членами экипажа.",
    icon: "",
    check: (s) => {
      const ids = [
        "max_vell",
        "athena",
        "aliya_naar",
        "irina_lebedeva",
        "rina_mirai",
        "nadezhda",
        "ekaterina",
        "alexey_smirnov",
        "anna_kovaleva",
        "dmitry_orlov",
        "sergey_volkov",
      ];
      return ids.every((id) => (s.relationships[id] ?? 0) >= 20);
    },
  },
  {
    id: "athena_ascended",
    name: "Афина воспарила",
    description: "Слияние Афины с Элом — корабль обрёл вторую душу.",
    icon: "",
    check: (s) => s.flags.includes("athena_ascended"),
  },
  {
    id: "no_kill_run",
    name: "Без лишних жертв",
    description: "Завершите игру, победив только Ворона (один убитый враг — финальный босс).",
    icon: "",
    check: (s) =>
      s.defeatedEnemies.length === 1 && s.defeatedEnemies.includes("pirate_captain"),
  },
  // ===== ROMANCE ACHIEVEMENTS =====
  {
    id: "first_love",
    name: "Первая любовь",
    description: "Достигните 50+ отношений с любым членом экипажа.",
    icon: "",
    check: (s) => Object.values(s.relationships).some((v) => v >= 50),
  },
  {
    id: "ship_cupid",
    name: "Сваха \"Элеи\"",
    description: "Поощрите Анну признаться в чувствах к Ирине в Главе 5.",
    icon: "",
    check: (s) => s.flags.includes("ch5_anna_encouraged"),
  },
  {
    id: "two_hearts",
    name: "Два сердца",
    description: "Достигните 30+ отношений одновременно с двумя членами экипажа.",
    icon: "",
    check: (s) => {
      const high = Object.values(s.relationships).filter((v) => v >= 30);
      return high.length >= 2;
    },
  },
  {
    id: "beloved_captain",
    name: "Любимый капитан",
    description: "Достигните 20+ отношений со ВСЕМ экипажем (15 человек).",
    icon: "",
    check: (s) =>
      Object.values(s.relationships).filter((v) => v >= 20).length >= 15,
  },
  {
    id: "athena_soulmate",
    name: "Душа Афины",
    description: "Достигните 80+ отношений с Афиной — высшая близость с ИИ-сознанием.",
    icon: "",
    check: (s) => (s.relationships.athena ?? 0) >= 80,
  },
  // ===== ENEMY/COMBAT ACHIEVEMENTS =====
  {
    id: "void_hunter",
    name: "Охотник на пустоту",
    description: "Победите Пустотного пирата — фанатика с окраинных миров.",
    icon: "",
    check: (s) => s.defeatedEnemies.includes("void_pirate"),
  },
  {
    id: "cultist_breaker",
    name: "Сломленный орден",
    description: "Победите Культиста-послушника из ордена Тёмной Руки.",
    icon: "",
    check: (s) => s.defeatedEnemies.includes("cultist_acolyte"),
  },
  {
    id: "variety_killer",
    name: "Универсальный боец",
    description: "Победите 5+ разных типов врагов.",
    icon: "",
    check: (s) => s.defeatedEnemies.length >= 5,
  },
  {
    id: "mini_boss_hunter",
    name: "Охотник на гигантов",
    description: "Победите обоих мини-боссов — Пророка Пустоты и Верховного жреца.",
    icon: "",
    check: (s) => s.defeatedEnemies.includes("void_prophet") && s.defeatedEnemies.includes("cultist_high_priest"),
  },
  // ===== EMOTIONAL DEPTH ACHIEVEMENTS =====
  {
    id: "silent_bonds",
    name: "Немые связи",
    description: "Достигните 30+ отношений с тремя членами экипажа одновременно.",
    icon: "",
    check: (s) => Object.values(s.relationships).filter((v) => v >= 30).length >= 3,
  },
  {
    id: "deep_listener",
    name: "Глубокий слушатель",
    description: "Достигните 50+ отношений с пятью членами экипажа.",
    icon: "",
    check: (s) => Object.values(s.relationships).filter((v) => v >= 50).length >= 5,
  },
  // ===== TIER 4 + STORY ACHIEVEMENTS =====
  {
    id: "branch_master",
    name: "Венец ветки",
    description: "Достигните 150 XP в любой ветке — откройте способность четвёртого тира.",
    icon: "",
    check: (s) => s.branchXp.alchemy >= 150 || s.branchXp.biotics >= 150 || s.branchXp.psyche >= 150,
  },
  {
    id: "five_memories",
    name: "Пять воспоминаний",
    description: "Откройте все пять сюжетных сцен-флешбэков.",
    icon: "",
    check: (s) => ["ch1_max_father_memory", "ch3_irina_mother_shared", "ch4_alex_chess_witnessed", "ch5_anna_irina_together", "ch5_kira_name_used"].every((f) => s.flags.includes(f)),
  },
  {
    id: "all_memories",
    name: "Полный путь",
    description: "Откройте все 6 воспоминаний пути — от голоса отца до прощального круга.",
    icon: "",
    check: (s) => ["ch1_max_father_memory", "ch3_irina_mother_shared", "ch4_alex_chess_witnessed", "ch5_anna_irina_together", "ch5_kira_name_used", "ch6_farewell_complete"].every((f) => s.flags.includes(f)),
  },
  {
    id: "log_reader",
    name: "Капитанский дневник",
    description: "Прочитайте все 6 записей личного журнала капитана Велла.",
    icon: "",
    check: (s) => s.chapter >= 6,
  },
  {
    id: "farewell_circle",
    name: "Последнее слово",
    description: "Соберите экипаж в кают-компании перед финальной битвой — проститесь с каждым.",
    icon: "",
    check: (s) => s.flags.includes("ch6_farewell_complete"),
  },
  {
    id: "theme_picker",
    name: "Свой стиль",
    description: "Смените цветовую тему интерфейса в настройках.",
    icon: "",
    check: (s) => s.flags.includes("theme_customized"),
  },
  {
    id: "philosopher",
    name: "Мыслитель",
    description: "Откройте все 12 философских медитаций в кодексе.",
    icon: "",
    check: (s) => ["ch1_max_father_memory", "ch3_irina_mother_shared", "ch3_artifact_taken", "ch4_alex_chess_witnessed", "ch4_nadezhda_bond", "ch5_kira_name_used"].every((f) => s.flags.includes(f)) && ["aliya_naar", "anna_kovaleva", "arina_sokolova", "paul_werner", "dmitry_orlov"].every((id) => (s.relationships[id] ?? 0) >= 25),
  },
];

export function unlockedAchievements(save: GameSave): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(save));
}

export function newlyUnlockedAchievements(save: GameSave): Achievement[] {
  const all = unlockedAchievements(save);
  return all.filter((a) => !save.seenAchievements.includes(a.id));
}
