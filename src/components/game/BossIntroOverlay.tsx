"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skull } from "lucide-react";
import { playSound } from "@/lib/audio";

export const BossIntroOverlay = memo(function BossIntroOverlay({
  enemyName,
  enemyDescription,
  onDone,
}: {
  enemyName: string;
  enemyDescription: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    playSound("boss_warning");
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onDone()}
      className="fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-black/95 px-4 overflow-hidden"
      role="button"
      aria-label="Пропустить вступление босса"
      title="Нажмите, чтобы пропустить"
    >
      {/* Animated stripes background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(45deg, #5a2a3a, #5a2a3a 30px, transparent 30px, transparent 60px)",
          backgroundSize: "120px 120px",
          animation: "starfield-pan 6s linear infinite",
        }}
      />
      {/* Expanding red shockwave rings */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 3, 4], opacity: [0, 0.5, 0.2, 0] }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute rounded-full border-2 border-rose-500/60"
        style={{ width: 300, height: 300 }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 3, 4], opacity: [0, 0.4, 0.15, 0] }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.4 }}
        className="absolute rounded-full border border-rose-400/40"
        style={{ width: 400, height: 400 }}
      />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, oklch(0.62 0.22 22 / 25%) 80%, oklch(0.45 0.20 22 / 40%) 100%)",
        }}
      />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center"
      >
        {/* Boss avatar with pulsing red glow */}
        <motion.div
          animate={{ rotate: [0, -4, 4, -4, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-6 flex size-24 items-center justify-center rounded-full border-4 border-rose-600/70 bg-gradient-to-br from-rose-950 to-red-950"
          style={{ boxShadow: "0 0 32px rgba(220,80,80,0.6), inset 0 0 16px rgba(180,40,60,0.4)" }}
        >
          <Skull className="size-14 text-rose-300" />
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-8px] rounded-full border border-dashed border-rose-400/30"
          />
        </motion.div>

        <motion.div
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-mono tracking-[0.5em] text-rose-400/80"
        >
          ОПАСНОСТЬ · БОСС
        </motion.div>
        <motion.h1
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 12 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-4xl font-black text-rose-200 text-shadow-glow sm:text-5xl"
          style={{ textShadow: "0 0 24px oklch(0.62 0.22 22 / 70%), 0 0 60px oklch(0.62 0.22 22 / 30%)" }}
        >
          {enemyName}
        </motion.h1>
        <motion.p
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 15 }}
          transition={{ duration: 0.4 }}
          className="mt-3 max-w-md text-sm leading-relaxed text-slate-300"
        >
          {enemyDescription}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 0.5 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-6 left-0 right-0 text-center text-[11px] uppercase tracking-[0.4em] text-slate-500 font-mono"
      >
        Нажмите, чтобы пропустить
      </motion.div>
    </motion.div>
  );
});
