"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { CHAPTERS } from "@/game/data/story";
import { playSound } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Play, ChevronRight } from "lucide-react";

interface ChapterCardProps {
  chapterId: string;
}

export function ChapterCard({ chapterId }: ChapterCardProps) {
  const ch = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
  const startDialogue = useGame((s) => s.startDialogue);
  const setScreen = useGame((s) => s.setScreen);

  useEffect(() => {
    playSound("chapter");
  }, [chapterId]);

  const handleContinue = () => {
    playSound("ui_click");
    startDialogue(ch.nextContext ?? "");
  };

  const handleBridge = () => {
    playSound("ui_click");
    setScreen("bridge");
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        key={ch.id}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="panel-glow clip-corner relative w-full max-w-2xl overflow-hidden p-8 sm:p-12"
      >
        {/* Decorative corner brackets — sci-fi panel feel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="pointer-events-none absolute left-4 top-4 size-6 border-l-2 border-t-2 border-amber-400/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="pointer-events-none absolute right-4 top-4 size-6 border-r-2 border-t-2 border-amber-400/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pointer-events-none absolute left-4 bottom-4 size-6 border-l-2 border-b-2 border-amber-400/50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="pointer-events-none absolute right-4 bottom-4 size-6 border-r-2 border-b-2 border-amber-400/50"
        />

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[11px] font-mono tracking-[0.4em] text-amber-400/80"
          >
            ГЛАВА {String(ch.number).padStart(2, "0")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-3xl font-bold text-amber-100 text-shadow-glow sm:text-4xl"
          >
            {ch.title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-2 text-sm italic text-amber-300/70"
          >
            {ch.subtitle}
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto my-6 h-px w-32 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mx-auto max-w-xl text-left text-sm leading-relaxed text-slate-200 sm:text-base"
          >
            {ch.brief}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Button
            variant="ghost"
            onClick={handleContinue}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-2 bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 px-8 py-3 text-base clip-corner group"
          >
            <Play className="size-5 group-hover:scale-110 transition-transform" />
            Продолжить главу
          </Button>
          <Button
            variant="ghost"
            onClick={handleBridge}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-1.5 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2 text-xs clip-corner"
          >
            <ChevronRight className="size-3.5" />
            На мостик
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
