import {
  Swords,
  Heart,
  Shield,
  Zap,
  Sparkles,
  FlaskConical,
  Dna,
  Brain,
  Crosshair,
  Star,
} from "lucide-react";
import type { Ability, Branch, EnemyIntent } from "@/game/types";

// Branch short badges for compact UI display
export const BRANCH_BADGE: Record<Branch | "free", string> = {
  alchemy: "ALK",
  biotics: "BIO",
  psyche: "PSY",
  free: "FR",
};

// Lucide icon for each branch
export const BRANCH_LUCIDE: Record<Branch, typeof FlaskConical> = {
  alchemy: FlaskConical,
  biotics: Dna,
  psyche: Brain,
};

// Pick an icon based on ability type (damage/heal/shield/energy/etc)
export function abilityKindIcon(ab: Ability): typeof Swords {
  if (ab.damage) return Swords;
  if (ab.heal) return Heart;
  if (ab.shield) return Shield;
  if (ab.energyRestore) return Zap;
  return Sparkles;
}

// Pick an icon for inventory items based on their effect
export function itemKindIcon(item: {
  heal?: number;
  energy?: number;
  shield?: number;
}): typeof Heart {
  if (item.shield) return Shield;
  if (item.energy) return Zap;
  if (item.heal) return Heart;
  return FlaskConical;
}

// Pick an icon for the enemy intent (attack/defend/special)
export function intentIcon(intent: EnemyIntent | null): typeof Crosshair {
  if (!intent) return Crosshair;
  if (intent.kind === "attack") return Crosshair;
  if (intent.kind === "defend") return Shield;
  return Star;
}

// HP color tier based on percentage
export function hpColorClass(hpPct: number): string {
  if (hpPct > 60) return "bg-rose-500";
  if (hpPct > 30) return "bg-amber-500";
  return "bg-red-700";
}

// Check if ability matches enemy weakness (highlighted in UI)
export function matchesWeakness(ab: Ability, weakness: Branch | undefined): boolean {
  return !!weakness && ab.branch === weakness;
}

// Tailwind classes for branch-colored ability cards
export function branchCardClasses(
  ab: Ability,
  disabled: boolean,
  matchesWeaknessFlag: boolean
): string {
  if (disabled) {
    return "border-slate-800/60 bg-slate-900/40 opacity-50 cursor-not-allowed grayscale";
  }
  if (matchesWeaknessFlag) {
    return "border-amber-400/70 bg-amber-500/15 hover:bg-amber-500/25 hover:border-amber-300 animate-intent-pulse";
  }
  if (ab.branch === "free") {
    return "border-slate-500/50 bg-slate-700/40 hover:bg-slate-600/60 hover:border-slate-400/70";
  }
  if (ab.branch === "alchemy") {
    return "border-amber-500/50 bg-amber-900/40 hover:bg-amber-800/50 hover:border-amber-400/80";
  }
  if (ab.branch === "biotics") {
    return "border-emerald-500/50 bg-emerald-900/40 hover:bg-emerald-800/50 hover:border-emerald-400/80";
  }
  return "border-purple-500/50 bg-purple-900/40 hover:bg-purple-800/50 hover:border-purple-400/80";
}

// Branch icon container styling
export function branchIconClasses(branch: Ability["branch"]): string {
  if (branch === "alchemy") {
    return "border-amber-700/30 bg-amber-950/40 text-amber-300";
  }
  if (branch === "biotics") {
    return "border-emerald-700/30 bg-emerald-950/40 text-emerald-300";
  }
  if (branch === "psyche") {
    return "border-purple-700/30 bg-purple-950/40 text-purple-300";
  }
  return "border-slate-700/30 bg-slate-950/40 text-slate-300";
}

// Color used to indicate enemy weakness in UI (for highlight)
export const WEAKNESS_HIGHLIGHT = "text-amber-300";

// Intent panel classes — color-coded by intent kind
export function intentPanelClasses(intent: EnemyIntent | null): string {
  if (!intent) return "border-amber-400/40 bg-amber-950/30";
  if (intent.kind === "attack") return "border-rose-400/50 bg-rose-950/30";
  if (intent.kind === "defend") return "border-sky-400/50 bg-sky-950/30";
  return "border-purple-400/50 bg-purple-950/30";
}

export function intentIconBoxClasses(intent: EnemyIntent | null): string {
  if (!intent) return "border-amber-400/60 bg-amber-500/20 text-amber-200";
  if (intent.kind === "attack") return "border-rose-400/60 bg-rose-500/20 text-rose-200";
  if (intent.kind === "defend") return "border-sky-400/60 bg-sky-500/20 text-sky-200";
  return "border-purple-400/60 bg-purple-500/20 text-purple-200";
}
