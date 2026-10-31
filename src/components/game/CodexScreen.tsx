"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { CODEX, CODEX_CATEGORIES, isCodexUnlocked } from "@/game/data/codex";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Lock, BookOpen, Rocket, Users, Globe, Sparkles, Gem, Flame } from "lucide-react";
import { playSound } from "@/lib/audio";
import type { CodexEntry } from "@/game/types";

const CATEGORY_ICON: Record<CodexEntry["category"], typeof BookOpen> = {
  ship: Rocket,
  characters: Users,
  world: Globe,
  abilities: Sparkles,
  artifacts: Gem,
  philosophy: Flame,
};

export function CodexScreen() {
  const save = useGame((s) => s.save);
  const setScreen = useGame((s) => s.setScreen);
  const [category, setCategory] = useState<CodexEntry["category"] | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const entries = useMemo(
    () => CODEX.filter((e) => category === "all" || e.category === category),
    [category]
  );

  if (!save) {
    // Show codex entries that unlock from start, even without a save
    const startEntries = entries.filter((e) => e.unlockFromStart);
    return (
      <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/80">КОДЕКС</div>
              <div className="mt-1 text-xl font-bold text-amber-100 text-shadow-glow sm:text-2xl">Кодекс мира</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { playSound("ui_click"); setScreen("menu"); }} className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2">
              <ArrowLeft className="size-4" /> Назад
            </Button>
          </div>
          <div className="mb-4 text-xs text-slate-400">
            Доступно записей: {startEntries.length} из {CODEX.length}. Начните новую игру, чтобы открыть остальные.
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {startEntries.map((entry) => {
              const Icon = CATEGORY_ICON[entry.category] ?? BookOpen;
              return (
                <div key={entry.id} className="panel-glow clip-corner p-4">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-300/60 font-mono">
                    <Icon className="size-3" />
                    {entry.category}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-amber-100">{entry.title}</div>
                  <p className="mt-1.5 text-xs text-slate-300/70 line-clamp-3 leading-relaxed">{entry.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const selected = selectedId ? CODEX.find((e) => e.id === selectedId) ?? null : null;

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/80">
              КОДЕКС «ЭЛЕИ»
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 text-shadow-glow sm:text-2xl">
              База знаний
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

        <div className="mb-4 flex flex-wrap gap-1.5">
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0 }}
            onClick={() => { playSound("ui_click"); setCategory("all"); }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
              category === "all"
                ? "border-amber-400/60 bg-amber-500/15 text-amber-100"
                : "border-slate-700/40 bg-slate-800/30 text-slate-300 hover:bg-slate-700/40"
            }`}
          >
            <BookOpen className="size-3.5" />
            Все
          </motion.button>
          {CODEX_CATEGORIES.map((c, idx) => {
            const Icon = CATEGORY_ICON[c.id as CodexEntry["category"]] ?? BookOpen;
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (idx + 1) * 0.05 }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playSound("ui_click"); setCategory(c.id); }}
                onMouseEnter={() => playSound("ui_hover")}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === c.id
                    ? "border-amber-400/60 bg-amber-500/15 text-amber-100"
                    : "border-slate-700/40 bg-slate-800/30 text-slate-300 hover:bg-slate-700/40"
                }`}
              >
                <Icon className="size-3.5" />
                {c.label}
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="panel-glow clip-corner p-3 md:col-span-2">
            <ScrollArea className="h-[70vh] pr-2">
              <div className="flex flex-col gap-1.5">
                {entries.map((e, idx) => {
                  const unlocked = isCodexUnlocked(e, save);
                  const isActive = selectedId === e.id;
                  return (
                    <motion.button
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.4), ease: "easeOut" }}
                      whileHover={{ scale: unlocked ? 1.02 : 1, x: unlocked ? 2 : 0 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => playSound("ui_hover")}
                      onClick={() => {
                        if (unlocked) {
                          // Play mystery stinger if selecting a philosophy entry, regular click otherwise
                          if (e.category === "philosophy") {
                            playSound("stinger_mystery");
                          } else {
                            playSound("ui_click");
                          }
                          setSelectedId(e.id);
                        } else {
                          playSound("ui_back");
                        }
                      }}
                      aria-disabled={!unlocked}
                      title={unlocked ? e.title : "Запись недоступна — выполните условие"}
                      className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-amber-400/60 bg-amber-500/15"
                          : unlocked
                            ? "border-slate-700/40 bg-slate-800/30 hover:bg-slate-700/40"
                            : "border-slate-800/40 bg-slate-900/30 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {unlocked ? (
                        <span className="text-xs font-medium text-slate-200">{e.title}</span>
                      ) : (
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <Lock className="size-3" /> ??? {e.title}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
                {entries.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Нет записей в категории.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="panel-glow clip-corner p-5 md:col-span-3">
            {selected ? (
              <ScrollArea className="h-[70vh] pr-2">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="text-[11px] font-mono tracking-widest text-amber-300/60">
                    {CODEX_CATEGORIES.find((c) => c.id === selected.category)?.label}
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-amber-100 sm:text-3xl">{selected.title}</h2>
                  <div className="mt-4 text-sm leading-relaxed text-slate-200">
                    {selected.body}
                  </div>
                </motion.div>
              </ScrollArea>
            ) : (
              <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex size-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10"
                  style={{ boxShadow: "0 0 24px oklch(0.78 0.15 70 / 20%)" }}
                >
                  <BookOpen className="size-8 text-amber-400/50" />
                </motion.div>
                <div>
                  <div className="text-base font-semibold text-amber-200/70">Запись не выбрана</div>
                  <div className="mt-1 text-xs text-slate-500">Выберите запись из списка слева, чтобы прочитать.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
