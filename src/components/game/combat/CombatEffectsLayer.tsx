"use client";
import { memo } from "react";

import { motion, AnimatePresence } from "framer-motion";

interface CombatEffectsLayerProps {
  critFlash: boolean;
  enemyDefeated: boolean;
  enemyName: string;
}

export const CombatEffectsLayer = memo(function CombatEffectsLayer({ critFlash, enemyDefeated, enemyName }: CombatEffectsLayerProps) {
  return (
    <>
      {/* === CRITICAL HIT OVERLAY === */}
      <AnimatePresence>
        {critFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ rotate: -12, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 12, scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-7xl font-black text-rose-400 drop-shadow-[0_0_30px_oklch(0.62_0.22_22_/_70%)] animate-critical-flash sm:text-9xl"
              style={{ textShadow: "0 0 24px oklch(0.62 0.22 22 / 80%), 0 0 60px oklch(0.62 0.22 22 / 40%)" }}
            >
              КРИТ!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === VICTORY FLASH OVERLAY === */}
      <AnimatePresence>
        {enemyDefeated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-amber-400/15 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", type: "spring", bounce: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl font-black text-amber-200 sm:text-7xl"
                style={{ textShadow: "0 0 30px oklch(0.78 0.15 70 / 80%), 0 0 60px oklch(0.78 0.15 70 / 40%)" }}
              >
                ПОБЕДА
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-2 text-sm font-mono uppercase tracking-[0.4em] text-amber-300/80"
              >
                {enemyName} повержен
              </motion.div>
            </motion.div>
            {/* Expanding gold ring */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute rounded-full border-4 border-amber-300/50"
              style={{ width: 200, height: 200 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
