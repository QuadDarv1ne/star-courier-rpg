"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { PlayerPanel } from "@/components/game/combat/PlayerPanel";
import { EnemyPanel } from "@/components/game/combat/EnemyPanel";
import type { Enemy, EnemyIntent, GameSave } from "@/game/types";

interface FloatNumber {
  id: string;
  text: string;
  tone: "good" | "bad" | "crit";
}

interface LogEntry {
  id: string;
  text: string;
  tone: "player" | "enemy" | "system";
}

interface CombatSceneProps {
  // Player panel props
  save: GameSave;
  hpPct: number;
  playerShield: number;
  playerFlash: boolean;
  playerHpCritical: boolean;
  playerHpColor: string;
  animationsOn: boolean;
  castRingKey: number | null;
  // Enemy panel props
  enemy: Enemy;
  eHpPct: number;
  eShieldPct: number;
  boss: boolean;
  enemyFlash: boolean;
  enemyHpCritical: boolean;
  enemyWeakenTurns: number;
  enemyIntent: EnemyIntent | null;
  combatTurn: "player" | "enemy" | null;
  turnCount: number;
  // Shared
  floats: FloatNumber[];
  log: LogEntry[];
}

export function CombatScene({
  save,
  hpPct,
  playerShield,
  playerFlash,
  playerHpCritical,
  playerHpColor,
  animationsOn,
  castRingKey,
  enemy,
  eHpPct,
  eShieldPct,
  boss,
  enemyFlash,
  enemyHpCritical,
  enemyWeakenTurns,
  enemyIntent,
  combatTurn,
  turnCount,
  floats,
  log,
}: CombatSceneProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr]">
      <PlayerPanel
        save={save}
        hpPct={hpPct}
        playerShield={playerShield}
        playerFlash={playerFlash}
        playerHpCritical={playerHpCritical}
        playerHpColor={playerHpColor}
        animationsOn={animationsOn}
        castRingKey={castRingKey}
        floats={floats}
      />

      {/* === VS DIVIDER (center, md+ only) === */}
      <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:gap-3">
        <div className="text-[11px] font-mono tracking-[0.4em] text-amber-300/40">VS</div>
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-12 items-center justify-center rounded-full border-2 border-amber-400/60 bg-gradient-to-br from-amber-700/40 to-rose-900/40 animate-vs-clash"
        >
          <Swords className="size-5 text-amber-200" />
        </motion.div>
        <div className="h-32 w-px combat-vs-divider" />
        {/* Combat log */}
        <div className="hidden w-44 flex-col gap-1 lg:flex">
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300/50">Журнал боя</div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {log.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[11px] leading-tight ${
                    entry.tone === "player" ? "text-amber-200"
                      : entry.tone === "enemy" ? "text-rose-300"
                      : "text-slate-400"
                  }`}
                >
                  {entry.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <EnemyPanel
        enemy={enemy}
        eHpPct={eHpPct}
        eShieldPct={eShieldPct}
        boss={boss}
        enemyFlash={enemyFlash}
        enemyHpCritical={enemyHpCritical}
        enemyWeakenTurns={enemyWeakenTurns}
        animationsOn={animationsOn}
        floats={floats}
        enemyIntent={enemyIntent}
        combatTurn={combatTurn}
        turnCount={turnCount}
      />
    </div>
  );
}
