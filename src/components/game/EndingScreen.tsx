"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { ENDINGS, resolveEnding } from "@/game/data/story";
import { CHARACTERS } from "@/game/data/characters";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { playSound } from "@/lib/audio";
import { Rocket, BookOpen, Trophy, Home, Quote } from "lucide-react";

// Closing aphorisms — one per ending tone
const CLOSING_APHORISMS: Record<"good" | "bad" | "neutral", { text: string; source: string }> = {
  good: {
    text: "Корабль — это не корпус и не двигатели. Это люди, которые выбирают идти дальше.",
    source: "Запись капитана Велла, последняя",
  },
  neutral: {
    text: "Звёзды равнодушны. Но капитан, который идёт к ним с открытыми глазами, уже победил тишину.",
    source: "Из бортового журнала «Элеи»",
  },
  bad: {
    text: "Иногда корабль умирает первым. Иногда — капитан. В конце всегда остаётся тишина космоса.",
    source: "Поминальная запись",
  },
};

function Stat({ label, value, index = 0 }: { label: string; value: number | string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.08, ease: "easeOut" }}
      className="text-center"
    >
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">{label}</div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 + index * 0.08 + 0.15 }}
        className="mt-0.5 text-2xl font-bold text-amber-100 font-mono"
      >
        {value}
      </motion.div>
    </motion.div>
  );
}

export function EndingScreen() {
  const save = useGame((s) => s.save);
  const newGame = useGame((s) => s.newGame);
  const setScreen = useGame((s) => s.setScreen);
  const deleteSave = useGame((s) => s.deleteSave);
  const openCodex = useGame((s) => s.openCodex);
  const openAchievements = useGame((s) => s.openAchievements);

  const ending = useMemo(() => (save ? resolveEnding(save) : ENDINGS.neutral), [save]);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    playSound(ending.tone === "good" ? "victory" : ending.tone === "bad" ? "defeat" : "chapter");
    // Stinger for dramatic endings — delayed after the main tone
    const stingerDelay = ending.tone === "good" ? 1400 : ending.tone === "bad" ? 1200 : 1600;
    const stingerT = setTimeout(() => {
      playSound(ending.tone === "good" ? "stinger_choice" : ending.tone === "bad" ? "stinger_reveal" : "stinger_mystery");
    }, stingerDelay);
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(stingerT);
    };
  }, [ending]);

  const crewFates = useMemo(() => {
    if (!save) return [];
    return CHARACTERS.map((c) => {
      const rel = save.relationships[c.id] ?? 0;
      let fate: string;
      if (rel >= 50) {
        fate = `${c.name} остаётся с Максом до конца пути. Их связь пережила всё.`;
      } else if (rel >= 20) {
        fate = `${c.name} идёт своей дорогой, но всегда вспоминает "Элею" с теплом.`;
      } else if (rel >= -20) {
        fate = `${c.name} уходит на свой путь. Иногда присылает сигналы.`;
      } else {
        fate = `${c.name} покидает "Элею" без прощания. Они не простят.`;
      }
      return { char: c, rel, fate };
    });
  }, [save]);

  if (!save) return null;

  const toneColor = ending.tone === "good" ? "#7fffa0" : ending.tone === "bad" ? "#ff7a7a" : "#d9a066";
  const aphorism = CLOSING_APHORISMS[ending.tone];

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      {/* Subtle animated background gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${toneColor} 0%, transparent 60%)`,
        }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${toneColor}80 0%, transparent 50%)`,
        }}
      />
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: phase >= 0 ? 1 : 0, y: 0 }}
          transition={{ duration: 0.8 }}
          className="panel-glow clip-corner p-8 text-center"
          style={{ borderColor: `${toneColor}55` }}
        >
          <div className="text-[11px] font-mono tracking-[0.4em]" style={{ color: toneColor }}>
            ФИНАЛ
          </div>
          <h1
            className="mt-3 text-3xl font-bold text-shadow-glow sm:text-5xl"
            style={{ color: toneColor }}
          >
            {ending.title}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 text-sm leading-relaxed text-slate-200 sm:text-base"
          >
            {ending.epilogue}
          </motion.p>

          {/* Closing aphorism */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 mx-auto max-w-lg border-l-2 pl-4 text-left"
            style={{ borderColor: `${toneColor}88` }}
          >
            <Quote className="size-4 mb-2" style={{ color: toneColor, opacity: 0.7 }} />
            <p className="italic text-sm leading-relaxed sm:text-[15px]" style={{ color: `${toneColor}dd` }}>
              {aphorism.text}
            </p>
            <div className="mt-2 text-xs text-slate-500">
              — {aphorism.source}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="mt-4 panel-glow clip-corner p-6"
        >
          <div className="mb-4 text-[11px] font-mono tracking-widest text-amber-300/70">
            СТАТИСТИКА ИГРЫ
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Глава" value={save.chapter} index={0} />
            <Stat label="Врагов побеждено" value={save.defeatedEnemies.length} index={1} />
            <Stat label="Сюжетных флагов" value={save.flags.length} index={2} />
            <Stat
              label="Время в игре"
              value={(() => {
                const minutes = Math.floor((save.updatedAt - save.createdAt) / 60000);
                if (minutes < 60) return `${minutes}м`;
                const h = Math.floor(minutes / 60);
                const m = minutes % 60;
                return `${h}ч ${m}м`;
              })()}
              index={3}
            />
            <Stat label="Алхимия XP" value={save.branchXp.alchemy} index={4} />
            <Stat label="Биотика XP" value={save.branchXp.biotics} index={5} />
            <Stat label="Психея XP" value={save.branchXp.psyche} index={6} />
            <Stat label="Способностей" value={save.unlockedAbilities.length} index={7} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 panel-glow clip-corner p-6"
        >
          <div className="mb-4 text-[11px] font-mono tracking-widest text-amber-300/70">
            СУДЬБА ЭКИПАЖА
          </div>
          <ScrollArea className="h-64 pr-2">
            <div className="flex flex-col gap-3">
              {crewFates.map(({ char, rel, fate }, idx) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06, ease: "easeOut" }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="size-10 shrink-0 rounded-full border-2"
                    style={{ background: char.portraitColor, borderColor: `${char.portraitColor}88` }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-100">{char.name}</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: rel >= 20 ? "#7fffa0" : rel < 0 ? "#ff7a7a" : "#94a3b8" }}>
                        {rel > 0 ? `+${rel}` : rel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed mt-0.5">{fate}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); newGame(); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 clip-corner gap-1.5 px-5 py-2.5"
          >
            <Rocket className="size-4" /> Новая игра
          </Button>
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); openCodex(); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-amber-200 hover:bg-slate-700/60 border border-amber-700/40 clip-corner gap-1.5 px-5 py-2.5"
          >
            <BookOpen className="size-4" /> Открыть кодекс
          </Button>
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); openAchievements(); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-amber-200 hover:bg-slate-700/60 border border-amber-700/40 clip-corner gap-1.5 px-5 py-2.5"
          >
            <Trophy className="size-4" /> Достижения
          </Button>
          <Button
            variant="ghost"
            onClick={() => { playSound("ui_click"); deleteSave(); setScreen("menu"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 clip-corner gap-1.5 px-5 py-2.5"
          >
            <Home className="size-4" /> В главное меню
          </Button>
        </div>
      </div>
    </div>
  );
}
