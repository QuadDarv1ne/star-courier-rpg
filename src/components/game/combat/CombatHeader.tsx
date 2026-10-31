"use client";
import { memo } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Swords, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";

interface CombatHeaderProps {
  chapter: number;
  battleNumber: number;
  combatTurn: "player" | "enemy" | null;
  turnCount: number;
  onExit: () => void;
}

export const CombatHeader = memo(function CombatHeader({
  chapter,
  battleNumber,
  combatTurn,
  turnCount,
  onExit,
}: CombatHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md border border-amber-400/30 bg-amber-500/10">
          <Swords className="size-5 text-amber-300" />
        </div>
        <div>
          <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70 font-bold">
            ОРБИТАЛЬНЫЙ БОЙ · ГЛАВА {chapter}
          </div>
          <div className="text-sm font-bold text-amber-100">
            Бой {battleNumber} в этой главе
          </div>
        </div>
      </div>

      {/* Turn counter — center */}
      <div className="hidden items-center gap-2 sm:flex">
        <AnimatePresence mode="wait">
          {combatTurn && (
            <motion.div
              key={`${combatTurn}-${turnCount}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                combatTurn === "player"
                  ? "border-amber-400/60 bg-amber-500/20 text-amber-200 animate-intent-pulse"
                  : "border-rose-400/60 bg-rose-500/20 text-rose-200"
              }`}
              aria-live="polite"
            >
              {combatTurn === "player" ? (
                <>
                  <Target className="size-4" /> Ваш ход · {turnCount}
                </>
              ) : (
                <>
                  <Swords className="size-4" /> Ход врага
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          playSound("ui_click");
          onExit();
        }}
        onMouseEnter={() => playSound("ui_hover")}
        className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 h-9 w-9 p-0"
        aria-label="Покинуть бой"
        title="Покинуть бой"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
});
