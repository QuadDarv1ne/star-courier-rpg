// Combat module — barrel exports for cleaner imports
// Usage: `import { PlayerPanel, EnemyPanel, CombatScene, ... } from "@/components/game/combat"`

export { CombatHeader } from "./CombatHeader";
export { CombatScene } from "./CombatScene";
export { PlayerPanel } from "./PlayerPanel";
export { EnemyPanel } from "./EnemyPanel";
export { AbilityGrid } from "./AbilityGrid";
export { CombatEffectsLayer } from "./CombatEffectsLayer";

// Helper utilities
export {
  BRANCH_BADGE,
  BRANCH_LUCIDE,
  abilityKindIcon,
  itemKindIcon,
  intentIcon,
  hpColorClass,
  matchesWeakness,
  branchCardClasses,
  branchIconClasses,
  WEAKNESS_HIGHLIGHT,
  intentPanelClasses,
  intentIconBoxClasses,
} from "./helpers";
