"use client";

import { motion } from "framer-motion";
import { Skull, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";

export function DefeatOverlay({ onRetry, onMenu }: { onRetry: () => void; onMenu: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
    >
      {/* Animated blood-red stripes background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "repeating-linear-gradient(135deg, oklch(0.45 0.22 22), oklch(0.45 0.22 22) 40px, transparent 40px, transparent 80px)",
          backgroundSize: "160px 160px",
          animation: "starfield-pan-reverse 8s linear infinite",
        }}
      />
      {/* Slow pulsing red glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.62 0.22 22 / 20%) 0%, transparent 60%)",
        }}
      />
      {/* Expanding dark shockwave */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0.6 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute rounded-full border-2 border-rose-500/40"
        style={{ width: 200, height: 200 }}
      />

      <motion.div
        initial={{ scale: 0.85, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="panel-glow glow-destructive clip-corner relative w-full max-w-md p-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -4, 4, -4, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-2 border-rose-500/60 bg-gradient-to-br from-rose-950 to-red-950"
          style={{ boxShadow: "0 0 40px oklch(0.62 0.22 22 / 50%)" }}
        >
          <Skull className="size-10 text-rose-300" />
          {/* Outer rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-8px] rounded-full border border-dashed border-rose-400/30"
          />
        </motion.div>

        <div className="text-[11px] font-mono tracking-[0.4em] text-rose-300/70">
          ПОРАЖЕНИЕ
        </div>
        <h2
          className="mt-2 text-3xl font-black text-rose-100"
          style={{ textShadow: "0 0 20px oklch(0.62 0.22 22 / 60%)" }}
        >
          Экипаж пал в бою
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          «Элея» потеряла капитана. Без вас корабль дрейфует в темноте.
          Но история ещё не закончена — вы можете вернуться.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); onRetry(); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-2 bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 clip-corner px-5 py-2.5"
          >
            <RotateCcw className="size-4" /> Повторить бой
          </Button>
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); onMenu(); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-2 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 clip-corner px-5 py-2.5"
          >
            <Home className="size-4" /> В главное меню
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
