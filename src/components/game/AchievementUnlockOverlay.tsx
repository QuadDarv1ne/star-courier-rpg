"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import type { Achievement } from "@/game/types";
import { playSound } from "@/lib/audio";

interface Props {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementUnlockOverlay = memo(function AchievementUnlockOverlay({ achievement, onClose }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    playSound("achievement");
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Auto-close after 5 seconds, or on click
  useEffect(() => {
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          playSound("ui_click");
          onClose();
        }}
        className="fixed inset-0 z-[80] flex cursor-pointer items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
        role="dialog"
        aria-label="Достижение разблокировано"
      >
        <motion.div
          initial={{ scale: 0.5, y: 40, opacity: 0, rotate: -8 }}
          animate={{
            scale: phase >= 1 ? 1 : 0.5,
            y: 0,
            opacity: 1,
            rotate: phase >= 2 ? [0, -2, 2, -1, 0] : 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="panel-glow clip-corner relative w-full max-w-md p-6 text-center"
          style={{
            boxShadow: "0 0 60px oklch(0.78 0.15 70 / 40%), inset 0 0 20px oklch(0.78 0.15 70 / 8%)",
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound("ui_click");
              onClose();
            }}
            className="absolute right-3 top-3 size-7 flex items-center justify-center rounded-full border border-slate-600/40 bg-slate-800/40 text-slate-400 hover:text-slate-200"
            aria-label="Закрыть"
            title="Закрыть"
          >
            <X className="size-3.5" />
          </button>

          {/* Animated trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.6 }}
            className="mx-auto mb-3 flex size-20 items-center justify-center rounded-full border-2 border-amber-400/60 bg-amber-500/10"
            style={{ boxShadow: "0 0 40px oklch(0.78 0.15 70 / 30%)" }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="size-12 text-amber-300" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-mono uppercase tracking-[0.5em] text-amber-400"
          >
            Достижение
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-1 text-2xl font-bold text-amber-100 text-shadow-glow"
          >
            {achievement.name}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto my-3 h-px w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm leading-relaxed text-slate-300"
          >
            {achievement.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 0.5 : 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 text-[11px] uppercase tracking-[0.3em] text-slate-500"
          >
            Нажмите, чтобы закрыть
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
