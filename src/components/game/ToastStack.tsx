"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/game/store";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const TONE_STYLES: Record<"good" | "bad" | "info", { bg: string; border: string; icon: typeof Info; iconColor: string; bar: string }> = {
  good: { bg: "bg-emerald-950/80", border: "border-emerald-500/40", icon: CheckCircle2, iconColor: "text-emerald-400", bar: "bg-emerald-400" },
  bad: { bg: "bg-rose-950/80", border: "border-rose-500/40", icon: AlertCircle, iconColor: "text-rose-400", bar: "bg-rose-400" },
  info: { bg: "bg-sky-950/80", border: "border-sky-500/40", icon: Info, iconColor: "text-sky-400", bar: "bg-sky-400" },
};

export const ToastStack = memo(function ToastStack() {
  const toasts = useGame((s) => s.toasts);
  const dismissToast = useGame((s) => s.dismissToast);

  return (
    <div
      className="fixed bottom-3 right-3 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const style = TONE_STYLES[t.tone];
          const Icon = style.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`relative flex items-center gap-2.5 overflow-hidden rounded-md border px-3.5 py-2.5 backdrop-blur ${style.bg} ${style.border} max-w-xs`}
            >
              <Icon className={`size-4 shrink-0 ${style.iconColor}`} />
              <div className="flex-1 text-xs text-slate-100 leading-relaxed">{t.text}</div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-500 hover:text-slate-200 shrink-0"
                aria-label="Скрыть"
              >
                <X className="size-3" />
              </button>
              {/* Progress bar — visual countdown to auto-dismiss */}
              <motion.div
                key={t.id}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: t.duration / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-0.5 ${style.bar}`}
                style={{ opacity: 0.6 }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
