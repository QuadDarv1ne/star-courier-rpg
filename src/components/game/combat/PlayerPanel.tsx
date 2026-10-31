"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, Shield, Rocket, FlaskConical, Dna, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { GameSave, Branch } from "@/game/types";

interface FloatNumber {
  id: string;
  text: string;
  tone: "good" | "bad" | "crit";
}

interface PlayerPanelProps {
  save: GameSave;
  hpPct: number;
  playerShield: number;
  playerFlash: boolean;
  playerHpCritical: boolean;
  playerHpColor: string;
  animationsOn: boolean;
  castRingKey: number | null;
  floats: FloatNumber[];
}

const BRANCH_LUCIDE: Record<Branch, typeof FlaskConical> = {
  alchemy: FlaskConical,
  biotics: Dna,
  psyche: Brain,
};

export const PlayerPanel = memo(function PlayerPanel({
  save,
  hpPct,
  playerShield,
  playerFlash,
  playerHpCritical,
  playerHpColor,
  animationsOn,
  castRingKey,
  floats,
}: PlayerPanelProps) {
  return (
    <motion.div
      animate={playerFlash ? { x: [-8, 7, -4, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`panel-glow clip-corner relative overflow-hidden p-5 ${playerFlash ? "glow-destructive" : ""} ${playerHpCritical && animationsOn ? "animate-pulse-low-hp" : ""}`}
    >
      {/* Cast shockwave — full panel glow when ability cast */}
      {castRingKey !== null && (
        <motion.div
          key={`shock_${castRingKey}`}
          initial={{ opacity: 0.15, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 32% 30%, oklch(0.78 0.15 70 / 60%) 0%, transparent 60%)",
          }}
        />
      )}
      <div className="mb-4 flex items-center gap-4">
        {/* Big portrait with ring */}
        <div className="relative">
          <div className={`flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-amber-500/70 bg-gradient-to-br from-amber-700/80 to-amber-900/60 text-2xl font-bold text-amber-50 combat-portrait-ring`}>
            М
          </div>
          {/* Cast ring animation overlay */}
          {castRingKey !== null && (
            <motion.div
              key={castRingKey}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-full border-4 border-amber-300"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-amber-100 sm:text-lg">Капитан Макс Велл</div>
          <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Командир «Элеи»</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-200">
              <Rocket className="size-2.5" /> Капитан
            </span>
          </div>
        </div>
      </div>

      {/* Float numbers */}
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end gap-1">
        <AnimatePresence>
          {floats.filter((f) => f.tone !== "good").slice(-3).map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -50, scale: f.tone === "crit" ? 1.5 : 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={`text-3xl font-bold drop-shadow-lg ${f.tone === "crit" ? "text-rose-400 animate-critical-flash" : f.tone === "bad" ? "text-rose-400" : "text-emerald-300"}`}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HP */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-rose-300 font-bold">
            <Heart className={`size-4 ${playerHpCritical && animationsOn ? "fill-rose-400 animate-pulse" : ""}`} /> Здоровье
          </span>
          <span className="font-mono text-amber-100 font-bold text-base">{save.hp}<span className="text-slate-500">/{save.maxHp}</span></span>
        </div>
        <motion.div
          animate={playerFlash ? { x: [-6, 5, -3, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Progress value={hpPct} className={`h-4 bg-rose-950/50 [&>div]:${playerHpColor} transition-all`} />
        </motion.div>
      </div>

      {/* Energy */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-sky-300 font-bold">
            <Zap className="size-4" /> Энергия
          </span>
          <span className="font-mono text-amber-100 font-bold text-base">{save.energy}<span className="text-slate-500">/{save.maxEnergy}</span></span>
        </div>
        <Progress value={(save.energy / save.maxEnergy) * 100} className="h-4 bg-sky-950/50 [&>div]:bg-sky-500 transition-all" />
      </div>

      {/* Shield */}
      {playerShield > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3"
        >
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-emerald-300 font-bold">
              <Shield className="size-4" /> Щит
            </span>
            <span className="font-mono text-emerald-200 font-bold text-base">{playerShield}</span>
          </div>
          <Progress value={Math.min(100, (playerShield / 50) * 100)} className="h-3 bg-emerald-950/50 [&>div]:bg-emerald-500 transition-all" />
        </motion.div>
      )}

      {/* Branch XP — small footer */}
      <div className="mt-4 flex gap-3 rounded-md border border-slate-700/40 bg-slate-900/40 px-3 py-2">
        {(["alchemy", "biotics", "psyche"] as const).map((b) => {
          const BIcon = BRANCH_LUCIDE[b];
          return (
            <span key={b} className="flex items-center gap-1.5 text-xs font-mono font-bold" style={{ color: `var(--color-${b})` }}>
              <BIcon className="size-3.5" /> {save.branchXp[b]}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
});
