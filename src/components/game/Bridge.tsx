"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useGame } from "@/game/store";
import { CHAPTERS } from "@/game/data/story";
import { CHARACTERS, getCharacter, quoteOfTheMoment, relationshipStatus } from "@/game/data/characters";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Heart, Users, Zap, Shield, ChevronRight, Save, Menu, ScrollText, MessageCircle, Shuffle, FlaskConical, Dna, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChapterMap } from "@/components/game/ChapterMap";
import { playSound } from "@/lib/audio";
import { pickBanter, type Banter } from "@/game/data/banter";

export function Bridge() {
  const save = useGame((s) => s.save);
  const currentChapterId = useGame((s) => s.currentChapterId);
  const setScreen = useGame((s) => s.setScreen);
  const saveGame = useGame((s) => s.saveGame);
  const startDialogue = useGame((s) => s.startDialogue);
  const pushToast = useGame((s) => s.pushToast);

  const [quote, setQuote] = useState({ text: "", author: "" });
  const [currentBanter, setCurrentBanter] = useState<Banter | null>(null);

  const chapterNum = save?.chapter ?? 1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(quoteOfTheMoment());
  }, []);

  useEffect(() => {
    if (!save) return;
    const picked = pickBanter(save.chapter, save.flags, save.relationships, currentBanter?.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentBanter(picked);
  }, [chapterNum]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoized crew list — prevents re-sort on every render
  const crewMembers = useMemo(() => {
    if (!save) return [];
    return CHARACTERS.map((c) => ({
      char: c,
      rel: save.relationships[c.id] ?? 0,
    })).sort((a, b) => b.rel - a.rel);
  }, [save]);

  const handleNewQuote = useCallback(() => {
    playSound("ui_click");
    setQuote(quoteOfTheMoment());
  }, []);

  const handleShuffleBanter = useCallback(() => {
    if (!save) return;
    playSound("ui_click");
    const picked = pickBanter(save.chapter, save.flags, save.relationships, currentBanter?.id);
    setCurrentBanter(picked);
  }, [save, currentBanter]);

  const handleSave = useCallback(() => {
    playSound("ui_click");
    saveGame();
    pushToast("Игра сохранена", "good");
  }, [saveGame, pushToast]);

  const handleContinueStory = useCallback(() => {
    playSound("ui_click");
    if (currentChapterId) {
      const ch = CHAPTERS.find((c) => c.id === currentChapterId);
      if (ch?.nextContext) {
        startDialogue(ch.nextContext);
      } else {
        pushToast("Нет следующей сцены", "bad");
      }
    } else {
      pushToast("Глава не определена", "bad");
    }
  }, [currentChapterId, startDialogue, pushToast]);

  if (!save) {
    return null;
  }

  const hpPct = (save.hp / save.maxHp) * 100;
  const enPct = (save.energy / save.maxEnergy) * 100;

  const branchXpPct = (v: number) => Math.min(100, (v / 90) * 100);

  const branchIcons = { alchemy: FlaskConical, biotics: Dna, psyche: Brain } as const;
  const branchLabels = { alchemy: "Алхимия", biotics: "Биотика", psyche: "Психея" } as const;

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70">
              КАПИТАНСКИЙ МОСТИК
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 sm:text-2xl">
              «Элея» — Глава {chapterNum}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleContinueStory}
              onMouseEnter={() => playSound("ui_hover")}
              className="bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 clip-corner px-4 py-2 gap-1.5"
            >
              <ChevronRight className="size-4" /> Продолжить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Сохранить игру"
              title="Сохранить"
              className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 h-9 w-9 p-0"
            >
              <Save className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { playSound("ui_click"); useGame.getState().openChat(); }}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="Чат с экипажем"
              title="Чат"
              className="bg-amber-500/20 text-amber-100 hover:bg-amber-500/35 border border-amber-400/40 h-9 w-9 p-0"
            >
              <MessageCircle className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { playSound("ui_click"); setScreen("menu"); }}
              onMouseEnter={() => playSound("ui_hover")}
              aria-label="В главное меню"
              title="Меню"
              className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 h-9 w-9 p-0"
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Vitals */}
          <div className="panel-glow clip-corner p-4 md:col-span-1">
            <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
              ВИТАЛЬНОСТЬ
            </div>

            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                  <Heart className="size-3.5" /> HP
                </span>
                <span className="font-mono font-semibold text-rose-200">{save.hp}/{save.maxHp}</span>
              </div>
              <Progress value={hpPct} className="h-3.5 bg-rose-950/40 [&_span]:bg-rose-500" />
            </div>

            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
                  <Zap className="size-3.5" /> Энергия
                </span>
                <span className="font-mono font-semibold text-sky-200">{save.energy}/{save.maxEnergy}</span>
              </div>
              <Progress value={enPct} className="h-3.5 bg-sky-950/40 [&_span]:bg-sky-500" />
            </div>

            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Users className="size-3.5" /> Экипаж
                </span>
                <span className="font-mono font-semibold">{CHARACTERS.length}</span>
              </div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(15, 1fr)" }}>
                {CHARACTERS.map((c) => (
                  <div
                    key={c.id}
                    className="size-3 rounded-full border"
                    style={{ background: c.portraitColor, borderColor: `${c.portraitColor}88` }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-700/40 pt-3">
              <div className="mb-2 text-[11px] font-mono tracking-widest text-amber-300/70">
                ОПЫТ ВЕТОК
              </div>
              <div className="space-y-2.5">
                {(["alchemy", "biotics", "psyche"] as const).map((b) => {
                  const BIcon = branchIcons[b];
                  return (
                    <div key={b}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-semibold" style={{ color: `var(--color-${b})` }}>
                          <BIcon className="size-3.5" />
                          {branchLabels[b]}
                        </span>
                        <span className="font-mono text-slate-400">{save.branchXp[b]} XP</span>
                      </div>
                      <Progress
                        value={branchXpPct(save.branchXp[b])}
                        className={`h-2 bg-slate-800/60 ${b === "alchemy" ? "[&>div]:bg-alchemy" : b === "biotics" ? "[&>div]:bg-biotics" : "[&>div]:bg-psyche"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quote of the moment */}
          <div className="panel-glow clip-corner p-4 md:col-span-2">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="text-[11px] font-mono tracking-widest text-amber-300/70">
                ЦИТАТА ЭКИПАЖА
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewQuote}
                onMouseEnter={() => playSound("ui_hover")}
                aria-label="Новая цитата экипажа"
                title="Новая цитата"
                className="size-8 bg-slate-800/40 text-amber-300 hover:bg-slate-700/60 border border-slate-600/40"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
            <motion.blockquote
              key={quote.text}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative italic text-amber-100 text-base leading-relaxed sm:text-lg pl-4 border-l-2 border-amber-400/40"
            >
              "{quote.text}"
              {/* Decorative opening quote mark */}
              <span
                className="absolute -top-3 -left-1 text-3xl text-amber-400/30 font-mono leading-none select-none"
                aria-hidden="true"
              >
                "
              </span>
            </motion.blockquote>
            <div className="mt-2 text-right text-xs text-amber-300/70">— {quote.author}</div>

            {/* Crew Banter */}
            <div className="mt-5 border-t border-slate-700/40 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-mono tracking-widest text-amber-300/80">
                  РАЗГОВОРЫ ЭКИПАЖА
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShuffleBanter}
                  onMouseEnter={() => playSound("ui_hover")}
                  aria-label="Другой разговор"
                  title="Случайный разговор"
                  className="flex size-8 items-center justify-center rounded-full bg-slate-800/60 text-amber-200 hover:bg-slate-700/80 border border-amber-700/50"
                >
                  <Shuffle className="size-3.5" />
                </motion.button>
              </div>
              <AnimatePresence mode="wait">
                {currentBanter ? (
                  <motion.div
                    key={currentBanter.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5"
                  >
                    {currentBanter.lines.map((line, i) => {
                      const speaker = getCharacter(line.speaker);
                      if (!speaker) return null;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.25 }}
                          className="flex items-start gap-2.5"
                        >
                          <div
                            className="size-6 shrink-0 rounded-full border mt-0.5"
                            style={{ background: speaker.portraitColor, borderColor: `${speaker.portraitColor}88` }}
                            title={speaker.name}
                          />
                          <div className="flex-1 text-sm text-slate-200 leading-relaxed">
                            <span className="font-bold text-amber-100 mr-1">{speaker.name}:</span>
                            {line.text}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="text-sm text-slate-500 italic">
                    Экипаж спит. Поговорите с ними позже.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chapter map */}
          <div className="panel-glow clip-corner p-4 md:col-span-2">
            <ChapterMap />
          </div>

          {/* Mission tracker */}
          <div className="panel-glow clip-corner p-4 md:col-span-1">
            <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
              ТРЕКЕР МИССИИ
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 size-3.5 text-amber-400" />
                <div>
                  <div className="text-amber-100 font-semibold">Глава {chapterNum}</div>
                  <div className="text-[11px] text-slate-500">Текущая глава</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="mt-0.5 size-3.5 text-rose-400" />
                <div>
                  <div className="text-amber-100 font-semibold">{save.defeatedEnemies.length} врагов</div>
                  <div className="text-[11px] text-slate-500">Побеждено</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ScrollText className="mt-0.5 size-3.5 text-sky-400" />
                <div>
                  <div className="text-amber-100 font-semibold">{save.flags.length} флагов</div>
                  <div className="text-[11px] text-slate-500">Сюжетных</div>
                </div>
              </div>
            </div>
          </div>

          {/* Crew roster */}
          <div className="panel-glow clip-corner p-4 md:col-span-3">
            <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
              СОСТАВ ЭКИПАЖА
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {crewMembers.map(({ char, rel }, idx) => {
                const romanceActive = !!char.romanceInterest && rel >= (char.romanceThreshold ?? 50);
                return (
                  <motion.button
                    key={char.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.5), ease: "easeOut" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={() => playSound("ui_hover")}
                    onClick={() => { playSound("ui_click"); useGame.getState().openChat(char.id); }}
                    aria-label={`Чат с ${char.name}`}
                    title={`Написать ${char.name}`}
                    className={`flex flex-col items-center gap-1 rounded-md border p-2.5 text-center transition-colors ${
                      romanceActive
                        ? "border-rose-400/40 bg-rose-950/20 hover:bg-rose-900/30"
                        : "border-slate-700/40 bg-slate-800/30 hover:border-amber-400/40 hover:bg-slate-700/40"
                    }`}
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 3 + (idx % 3), repeat: Infinity, ease: "easeInOut" }}
                        className="size-10 rounded-full border-2"
                        style={{ background: char.portraitColor, borderColor: `${char.portraitColor}88` }}
                      />
                      {romanceActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -right-1 -top-1"
                        >
                          <Heart
                            className="size-3.5 fill-rose-400 text-rose-400"
                            aria-label="Романтическая связь активна"
                          />
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-bold text-amber-100">{char.name}</div>
                    <div className="text-[11px] text-slate-400 leading-tight">{char.role}</div>
                    <div
                      className="text-[11px] font-bold"
                      style={{
                        color: rel >= 20 ? (romanceActive ? "#ff7a9c" : "#7fffa0") : rel < 0 ? "#ff7a7a" : "#94a3b8",
                      }}
                    >
                      {relationshipStatus(rel)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
