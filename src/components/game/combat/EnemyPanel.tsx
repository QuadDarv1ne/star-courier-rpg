"use client";
import { memo } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Skull, Heart, Shield, Crosshair, Eye, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Enemy, EnemyIntent } from "@/game/types";
import { BRANCH_BADGE, intentPanelClasses, intentIconBoxClasses } from "@/components/game/combat/helpers";

interface FloatNumber {
  id: string;
  text: string;
  tone: "good" | "bad" | "crit";
}

interface EnemyPanelProps {
  enemy: Enemy;
  eHpPct: number;
  eShieldPct: number;
  boss: boolean;
  enemyFlash: boolean;
  enemyHpCritical: boolean;
  enemyWeakenTurns: number;
  animationsOn: boolean;
  floats: FloatNumber[];
  enemyIntent: EnemyIntent | null;
  combatTurn: "player" | "enemy" | null;
  turnCount: number;
}

export const EnemyPanel = memo(function EnemyPanel({
  enemy,
  eHpPct,
  eShieldPct,
  boss,
  enemyFlash,
  enemyHpCritical,
  enemyWeakenTurns,
  animationsOn,
  floats,
  enemyIntent,
  combatTurn,
  turnCount,
}: EnemyPanelProps) {
  return (
    <motion.div
      animate={enemyFlash ? { x: [7, -8, 4, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`panel-glow clip-corner p-5 ${enemyFlash ? "glow-destructive" : ""} ${enemyHpCritical && animationsOn ? "animate-pulse-low-hp" : ""}`}
    >
      <div className="mb-4 flex items-center gap-4">
        {/* Big portrait with red ring */}
        <div
          className={`flex size-16 shrink-0 items-center justify-center rounded-full border-2 text-2xl font-bold text-white combat-portrait-ring-enemy ${boss ? "bg-gradient-to-br from-red-900/80 to-rose-950/60 border-rose-400/70" : ""}`}
          style={boss ? undefined : { background: enemy.portraitColor, borderColor: `${enemy.portraitColor}88` }}
        >
          {boss ? <Skull className="size-7" /> : enemy.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold flex items-center gap-2 sm:text-lg" style={{ color: enemy.portraitColor }}>
            {boss && <Skull className="size-4" />} {enemy.name}
            {enemyWeakenTurns > 0 && (
              <span
                className="rounded-full bg-purple-500/30 px-2 py-0.5 text-[11px] font-mono text-purple-200 border border-purple-400/50"
                title="Враг ослаблен: −30% урона"
              >
                −30% · {enemyWeakenTurns}х
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
            {boss ? "Мини-босс" : "Противник"}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-rose-200">
              <Crosshair className="size-2.5" /> Урон {enemy.damage[0]}–{enemy.damage[1]}
            </span>
            {enemy.weakness && (
              <span
                className="flex items-center gap-1 rounded-full border bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-200"
                style={{ borderColor: `var(--color-${enemy.weakness})` }}
                title={`Уязвимость: ветка ${BRANCH_BADGE[enemy.weakness]}`}
              >
                Уязв. {BRANCH_BADGE[enemy.weakness]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Float numbers on enemy */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end gap-1">
        <AnimatePresence>
          {floats.filter((f) => f.tone === "good" || f.tone === "crit").slice(-3).map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -50, scale: f.tone === "crit" ? 1.5 : 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`text-3xl font-bold drop-shadow-lg ${f.tone === "crit" ? "text-amber-300 animate-critical-flash" : "text-emerald-300"}`}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Enemy HP */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-bold" style={{ color: enemy.portraitColor }}>
            <Heart className={`size-4 ${enemyHpCritical && animationsOn ? "fill-current animate-pulse" : ""}`} /> Здоровье
          </span>
          <span className="font-mono font-bold text-base" style={{ color: enemy.portraitColor }}>{enemy.hp}<span className="text-slate-500">/{enemy.maxHp}</span></span>
        </div>
        <motion.div
          animate={enemyFlash ? { x: [6, -5, 3, -2, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {boss ? (
            <div className={`relative h-5 w-full overflow-hidden rounded-full bg-red-950/50 border border-red-800/40 ${enemyHpCritical && animationsOn ? "animate-blood-pulse" : ""}`}>
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${eHpPct}%`,
                  background: "repeating-linear-gradient(45deg, #5a2a3a, #5a2a3a 8px, #7a3a4a 8px, #7a3a4a 16px)",
                }}
              />
            </div>
          ) : (
            <Progress value={eHpPct} className="h-4 bg-red-950/50 [&>div]:bg-red-600 transition-all" />
          )}
        </motion.div>
      </div>

      {/* Enemy shield */}
      {enemy.shield > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3"
        >
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-300 font-bold">
              <Shield className="size-4" /> Щит врага
            </span>
            <span className="font-mono font-bold text-slate-200 text-base">{enemy.shield}</span>
          </div>
          <Progress value={eShieldPct} className="h-3 bg-slate-800/50 [&>div]:bg-slate-400 transition-all" />
        </motion.div>
      )}

      {/* Enemy intent — prominent */}
      {combatTurn === "player" && enemyIntent && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={`${enemy.id}-${combatTurn}-${enemy.hp}-${enemy.shield}-${turnCount}`}
          className={`mt-3 rounded-lg border p-3 animate-intent-pulse ${intentPanelClasses(enemyIntent)}`}
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-300/80 font-bold">
            <Eye className="size-3.5" /> Намерение врага
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-md border ${intentIconBoxClasses(enemyIntent)}`}
            >
              {enemyIntent.kind === "attack" ? (
                <Crosshair className="size-5" />
              ) : enemyIntent.kind === "defend" ? (
                <Shield className="size-5" />
              ) : (
                <Star className="size-5" />
              )}
            </div>
            <div className="flex-1">
              {enemyIntent.kind === "attack" && (
                <div className="text-base text-rose-100 font-bold leading-tight">
                  Атака <span className="font-mono text-rose-200 text-lg">{enemyIntent.min}–{enemyIntent.max}</span>
                  <div className="text-[11px] text-rose-300/70 font-normal">ед. урона</div>
                </div>
              )}
              {enemyIntent.kind === "defend" && (
                <div className="text-base text-sky-100 font-bold leading-tight">
                  Защита +<span className="font-mono text-sky-200 text-lg">{enemyIntent.shieldGain}</span>
                  <div className="text-[11px] text-sky-300/70 font-normal">ед. щита</div>
                </div>
              )}
              {enemyIntent.kind === "special" && (
                <div className="text-base text-purple-100 font-bold leading-tight">
                  {enemyIntent.label}
                  <div className="text-[11px] text-purple-300/70 font-normal">особая атака</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});
