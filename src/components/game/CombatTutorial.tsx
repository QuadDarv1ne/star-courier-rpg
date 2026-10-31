"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";

const TIPS = [
  {
    title: "Добро пожаловать в бой",
    body: "Это пошаговый бой. Ходите вы, затем ходит враг. Используйте способности и предметы, чтобы победить.",
  },
  {
    title: "Энергия",
    body: "Каждое действие тратит энергию (кроме \"Удара прикладом\"). В начале вашего хода +3 энергии. Пропуск хода даёт +10.",
  },
  {
    title: "Способности",
    body: "Открывайте новые способности, набрав ветку опыта (Алхимия, Биотика или Психея). Нажимайте 1-9 для быстрого выбора.",
  },
  {
    title: "Слабости врагов",
    body: "У каждого врага есть слабость к одной из веток. Способность совпадающей ветки наносит +50% урона.",
  },
  {
    title: "Щиты",
    body: "Щит впитывает урон первым. Ставьте щиты перед сильными атаками врага. Лечитесь аптечками, чтобы восстановить здоровье в трудный момент.",
  },
  {
    title: "Перезарядка",
    body: "Мощные способности имеют перезарядку. Перезарядка уменьшается на 1 каждый ход. Следите за способностями!",
  },
];

export function CombatTutorial({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const tip = TIPS[idx];
  const isLast = idx === TIPS.length - 1;

  const next = () => {
    playSound("ui_click");
    if (isLast) {
      onClose();
    } else {
      setIdx((i) => i + 1);
    }
  };

  const prev = () => {
    playSound("ui_click");
    setIdx((i) => Math.max(0, i - 1));
  };

  // Keyboard shortcuts: ← → for navigation, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (idx > 0) prev();
      } else if (e.key === "Escape") {
        playSound("ui_back");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, isLast]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
    >
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="panel-glow clip-corner relative w-full max-w-lg p-8"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { playSound("ui_click"); onClose(); }}
          aria-label="Закрыть обучение"
          title="Закрыть"
          className="absolute right-3 top-3 size-8 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
        >
          <X className="size-4" />
        </Button>

        <div className="mb-4 text-xs font-mono tracking-[0.3em] text-amber-300/70">
          ОБУЧЕНИЕ · {idx + 1} / {TIPS.length}
        </div>
        <h2 className="mb-3 text-2xl font-bold text-amber-100">{tip.title}</h2>
        <p className="text-sm leading-relaxed text-slate-200">{tip.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={idx === 0}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" /> Назад
          </Button>
          <div className="flex gap-1">
            {TIPS.map((_, i) => (
              <div
                key={i}
                className={`size-2 rounded-full ${i === idx ? "bg-amber-400" : "bg-slate-700"}`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={next}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40"
          >
            {isLast ? "В бой" : "Далее"} <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
