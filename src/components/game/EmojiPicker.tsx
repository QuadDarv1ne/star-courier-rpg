"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile } from "lucide-react";
import { playSound } from "@/lib/audio";

interface Props {
  onPick: (_: string) => void;
}

// Curated set of common emojis grouped by category
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Эмоции",
    emojis: [
      "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
      "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
      "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕",
    ],
  },
  {
    label: "Жесты",
    emojis: [
      "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟",
      "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋",
      "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🙏", "🤝",
      "💪", "✊", "👊", "🤛", "🤜", "❤️", "🧡", "💛",
    ],
  },
  {
    label: "Сердца",
    emojis: [
      "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️",
      "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
    ],
  },
  {
    label: "Космос",
    emojis: [
      "🚀", "🛸", "🪐", "🌌", "⭐", "🌟", "✨", "☄️",
      "🌙", "☀️", "🌍", "🌎", "🌏", "🌑", "🌒", "🌓",
    ],
  },
  {
    label: "Разное",
    emojis: [
      "🔥", "💯", "✅", "❌", "⚠️", "💬", "💭", "😴",
      "🤔", "🤗", "🤐", "🤫", "🤥", "😶", "😐", "🥺",
      "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳",
      "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    ],
  },
];

export function EmojiPicker({ onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          playSound("ui_click");
          setOpen((v) => !v);
        }}
        onMouseEnter={() => playSound("ui_hover")}
        aria-label="Выбрать эмодзи"
        title="Эмодзи"
        className={`size-10 shrink-0 rounded-md border transition-colors ${
          open
            ? "bg-amber-500/30 text-amber-100 border-amber-400/50"
            : "bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border-slate-600/40"
        }`}
      >
        <Smile className="mx-auto size-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 right-0 z-50 w-72 rounded-lg border border-amber-400/30 bg-zinc-950/95 p-2 backdrop-blur-md shadow-2xl"
          >
            {/* Group tabs */}
            <div className="mb-2 flex flex-wrap gap-1 border-b border-slate-700/40 pb-2">
              {EMOJI_GROUPS.map((g, idx) => (
                <button
                  key={g.label}
                  onClick={() => {
                    playSound("ui_hover");
                    setActiveGroup(idx);
                  }}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    activeGroup === idx
                      ? "bg-amber-500/30 text-amber-100"
                      : "text-slate-400 hover:bg-slate-800/60"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto">
              {EMOJI_GROUPS[activeGroup].emojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => {
                    playSound("ui_click");
                    onPick(emoji);
                    setOpen(false);
                  }}
                  onMouseEnter={() => playSound("ui_hover")}
                  className="size-8 flex items-center justify-center rounded text-lg transition-transform hover:scale-125 hover:bg-slate-800/60"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Hint */}
            <div className="mt-2 border-t border-slate-700/40 pt-1.5 text-center text-[10px] text-slate-500">
              Esc — закрыть
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
