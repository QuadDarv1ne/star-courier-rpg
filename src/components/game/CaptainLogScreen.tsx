"use client";

import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Book } from "lucide-react";
import { playSound } from "@/lib/audio";
import { CAPTAIN_LOG, unlockedLogEntries } from "@/game/data/captain_log";
import { useEffect, useState } from "react";

export function CaptainLogScreen() {
  const save = useGame((s) => s.save);
  const setScreen = useGame((s) => s.setScreen);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Esc → back to bridge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("ui_click");
        setScreen("bridge");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  const chapter = save?.chapter ?? 1;
  const flags = save?.flags ?? [];
  const unlocked = unlockedLogEntries(chapter, flags);
  const locked = CAPTAIN_LOG.filter((e) => !unlocked.includes(e));
  const selected = selectedId
    ? CAPTAIN_LOG.find((e) => e.id === selectedId) ?? null
    : unlocked[unlocked.length - 1] ?? null;

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-center justify-between gap-3"
        >
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/80">
              ЛИЧНЫЙ ЖУРНАЛ
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 text-shadow-glow sm:text-2xl">
              Записи капитана Велла
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound("ui_click"); setScreen("bridge"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-1.5 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2"
          >
            <ArrowLeft className="size-4" /> На мостик
          </Button>
        </motion.div>

        <div className="mb-4 flex items-center gap-2 text-xs text-amber-300/60 font-mono tracking-wider">
          <span>ОТКРЫТО:</span>
          <span className="text-amber-200 font-bold">{unlocked.length}</span>
          <span className="text-slate-500">/ {CAPTAIN_LOG.length}</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="panel-glow clip-corner p-3.5 md:col-span-2">
            <ScrollArea className="h-[70vh] pr-2">
              <div className="flex flex-col gap-1.5">
                {unlocked.map((e, idx) => {
                  const isActive = selected?.id === e.id;
                  return (
                    <motion.button
                      key={e.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.4) }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => playSound("ui_hover")}
                      onClick={() => { playSound("ui_click"); setSelectedId(e.id); }}
                      className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "border-amber-400/60 bg-amber-500/15"
                          : "border-slate-700/40 bg-slate-800/30 hover:bg-slate-700/40"
                      }`}
                    >
                      <Book className="size-3.5 shrink-0 text-amber-400" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-bold text-amber-100">{e.title}</div>
                        <div className="text-[11px] text-slate-400">Глава {e.chapter}</div>
                      </div>
                    </motion.button>
                  );
                })}
                {locked.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-md border border-slate-800/40 bg-slate-900/30 px-3 py-2 opacity-50"
                  >
                    <Book className="size-3.5 shrink-0 text-slate-600" />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-500">??? Глава {e.chapter}</div>
                      <div className="text-[11px] text-slate-600 italic">Откроется по мере прохождения</div>
                    </div>
                  </div>
                ))}
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
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-[11px] font-mono tracking-widest text-amber-300/60">
                    ГЛАВА {selected.chapter} · ЛИЧНЫЙ ЖУРНАЛ
                  </div>
                  <h2 className="mt-1.5 text-2xl font-bold text-amber-100 sm:text-3xl">{selected.title}</h2>

                  {selected.epigraph && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="mt-4 border-l-2 border-amber-400/50 pl-4 italic text-amber-200/80 text-sm leading-relaxed"
                    >
                      {selected.epigraph}
                    </motion.div>
                  )}

                  <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-200 sm:text-[15px]">
                    {selected.body.split("\n\n").map((para, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.1, 0.4), duration: 0.5 }}
                      >
                        {para}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              </ScrollArea>
            ) : (
              <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex size-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10"
                  style={{ boxShadow: "0 0 24px oklch(0.78 0.15 70 / 20%)" }}
                >
                  <Book className="size-8 text-amber-400/50" />
                </motion.div>
                <div>
                  <div className="text-base font-semibold text-amber-200/70">Журнал пуст</div>
                  <div className="mt-1 text-xs text-slate-500">Записи капитана откроются по мере прохождения сюжета.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
