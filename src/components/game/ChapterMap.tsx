"use client";

import { useGame } from "@/game/store";
import { CHAPTERS } from "@/game/data/story";
import { motion } from "framer-motion";
import { Check, CircleDot, Circle, ChevronRight } from "lucide-react";
import { playSound } from "@/lib/audio";

export function ChapterMap() {
  const currentChapterId = useGame((s) => s.currentChapterId);
  const saveChapter = useGame((s) => s.save?.chapter ?? 1);
  const startChapter = useGame((s) => s.startChapter);

  const currentIdx = CHAPTERS.findIndex((c) => c.id === currentChapterId);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono tracking-widest text-amber-300/70">
          КАРТА ГЛАВ
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          {currentIdx + 1} / {CHAPTERS.length}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CHAPTERS.map((c, i) => {
          const done = i < currentIdx || saveChapter > c.number;
          const current = i === currentIdx;
          const upcoming = i > currentIdx;
          return (
            <motion.button
              key={c.id}
              whileHover={{ scale: current ? 1.02 : 1 }}
              onMouseEnter={() => { if (!upcoming) playSound("ui_hover"); }}
              onClick={() => {
                if (current || done) {
                  playSound("ui_click");
                  startChapter(c.id);
                }
              }}
              disabled={upcoming}
              className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-xs transition-colors ${
                done
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : current
                    ? "border-amber-400/60 bg-amber-500/15 text-amber-100"
                    : "border-slate-700/40 bg-slate-800/30 text-slate-500"
              } ${upcoming ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {done ? (
                <Check className="size-3.5 shrink-0" />
              ) : current ? (
                <CircleDot className="size-3.5 shrink-0 animate-pulse-glow" />
              ) : (
                <Circle className="size-3.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-mono font-bold">Гл. {c.number}</div>
                <div className="truncate text-[11px] opacity-80">{c.title}</div>
              </div>
              {current && <ChevronRight className="size-3.5 shrink-0" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
