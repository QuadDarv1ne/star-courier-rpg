"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { ACHIEVEMENTS, unlockedAchievements } from "@/game/data/achievements";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Lock, CheckCircle2, Trophy, Star, Award, Sparkles, Heart, Swords, Shield, Zap, Globe } from "lucide-react";
import { playSound } from "@/lib/audio";

// Lucide fallback icon for achievements that don't have a meaningful icon mapping
const ACHIEVEMENT_ICON = Trophy;

// Try to map achievement IDs to lucide icons — otherwise use generic Trophy
function pickAchievementIcon(id: string): typeof Trophy {
  if (id.includes("combat") || id.includes("boss") || id.includes("defeat")) return Swords;
  if (id.includes("romance") || id.includes("love") || id.includes("intimacy")) return Heart;
  if (id.includes("shield") || id.includes("defense")) return Shield;
  if (id.includes("energy") || id.includes("speed") || id.includes("lightning")) return Zap;
  if (id.includes("explore") || id.includes("world") || id.includes("travel")) return Globe;
  if (id.includes("unlock") || id.includes("all")) return Star;
  if (id.includes("achieve") || id.includes("master")) return Award;
  if (id.includes("special") || id.includes("secret")) return Sparkles;
  return ACHIEVEMENT_ICON;
}

export function AchievementsScreen() {
  const save = useGame((s) => s.save);
  const setScreen = useGame((s) => s.setScreen);

  // Esc → back to menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("ui_click");
        setScreen("menu");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  const unlocked = useMemo(() => (save ? unlockedAchievements(save) : []), [save]);
  const pct = save ? Math.round((unlocked.length / ACHIEVEMENTS.length) * 100) : 0;

  if (!save) {
    return (
      <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70">ДОСТИЖЕНИЯ</div>
              <div className="mt-1 text-xl font-bold text-amber-100 sm:text-2xl">0 / {ACHIEVEMENTS.length} · 0%</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { playSound("ui_click"); setScreen("menu"); }} className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2">
              <ArrowLeft className="size-4" /> Назад
            </Button>
          </div>
          <div className="mb-4 h-2 w-full rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: "0%" }} />
          </div>
          <p className="mb-4 text-center text-xs text-slate-400">Начните новую игру, чтобы открывать достижения.</p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.id} className="panel-glow clip-corner p-4 flex items-center gap-3 opacity-50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-300">{a.name}</div>
                  <div className="text-[11px] text-slate-500">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70">
              ДОСТИЖЕНИЯ
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 sm:text-2xl">
              {unlocked.length} / {ACHIEVEMENTS.length} · {pct}%
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound("ui_click"); setScreen("menu"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2"
          >
            <ArrowLeft className="size-4" /> Назад
          </Button>
        </div>

        {/* Progress bar */}
        <div className="panel-glow clip-corner mb-4 p-4">
          <div className="mb-2.5 flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            <span className="text-[11px] font-mono tracking-widest text-amber-300/70">
              ПРОГРЕСС
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-300 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Grid */}
        <ScrollArea className="h-[68vh] pr-2">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {ACHIEVEMENTS.map((a, idx) => {
              const isUnlocked = unlocked.some((u) => u.id === a.id);
              const Icon = pickAchievementIcon(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4), ease: "easeOut" }}
                  whileHover={{ scale: isUnlocked ? 1.03 : 1, y: isUnlocked ? -2 : 0 }}
                  className={`rounded-md border p-3.5 transition-colors ${
                    isUnlocked
                      ? "border-amber-500/40 bg-amber-500/10"
                      : "border-slate-700/40 bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      animate={isUnlocked ? { scale: [1, 1.06, 1] } : {}}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                      className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${isUnlocked ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-slate-700/40 bg-slate-900/60 text-slate-500"}`}
                    >
                      {isUnlocked ? <Icon className="size-4" /> : <Lock className="size-4" />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-100">
                        {a.name}
                        {isUnlocked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {isUnlocked ? a.description : "??? — скрыто, пока не открыто"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
