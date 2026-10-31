"use client";

import { useEffect } from "react";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Music, Type, Sparkles, Swords, Zap, Eye } from "lucide-react";
import { playSound, primeAudio } from "@/lib/audio";
import type { Settings } from "@/game/types";

const TEXT_SPEED_LABEL: Record<Settings["textSpeed"], string> = {
  slow: "Медленно",
  normal: "Нормально",
  fast: "Быстро",
  instant: "Мгновенно",
};
const TEXT_SPEEDS: Settings["textSpeed"][] = ["slow", "normal", "fast", "instant"];

const DIFFICULTY_LABEL: Record<Settings["difficulty"], string> = {
  easy: "Лёгкая",
  normal: "Обычная",
  hard: "Сложная",
};
const DIFFICULTIES: Settings["difficulty"][] = ["easy", "normal", "hard"];

const COMBAT_SPEED_LABEL: Record<Settings["combatSpeed"], string> = {
  slow: "Медленно",
  normal: "Обычно",
  fast: "Быстро",
};
const COMBAT_SPEEDS: Settings["combatSpeed"][] = ["slow", "normal", "fast"];

export function SettingsScreen() {
  const settings = useGame((s) => s.settings);
  const setAudioEnabled = useGame((s) => s.setAudioEnabled);
  const setAudioVolume = useGame((s) => s.setAudioVolume);
  const setAmbientEnabled = useGame((s) => s.setAmbientEnabled);
  const setTextSpeed = useGame((s) => s.setTextSpeed);
  const setAnimationsEnabled = useGame((s) => s.setAnimationsEnabled);
  const setDifficulty = useGame((s) => s.setDifficulty);
  const setAutoAdvanceDialogue = useGame((s) => s.setAutoAdvanceDialogue);
  const setCombatSpeed = useGame((s) => s.setCombatSpeed);
  const setReducedMotion = useGame((s) => s.setReducedMotion);
  const setScreen = useGame((s) => s.setScreen);

  // Keyboard shortcut: Esc → back to menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("ui_click");
        setScreen("menu");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  const handleAudioToggle = (v: boolean) => {
    primeAudio();
    playSound("ui_click");
    setAudioEnabled(v);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-400/15 panel backdrop-blur">
        <Button variant="ghost" size="sm" onClick={() => { playSound("ui_click"); setScreen("menu"); }} className="text-foreground/70 hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> В меню
        </Button>
        <span className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-mono">Настройки</span>
        <span className="w-16" />
      </header>

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* AUDIO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="panel-glow clip-corner p-5 space-y-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-amber-300/80 font-mono">Звук</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Звуковые эффекты</span>
            <Switch checked={settings.audioEnabled} onCheckedChange={handleAudioToggle} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Громкость</span>
              <span className="text-xs font-mono text-amber-300">{Math.round(settings.audioVolume * 100)}%</span>
            </div>
            <Slider value={[Math.round(settings.audioVolume * 100)]} min={0} max={100} step={5}
              onValueChange={(v) => setAudioVolume(v[0] / 100)} disabled={!settings.audioEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-400/80" />
              <span className="text-sm">Фоновая музыка</span>
            </div>
            <Switch checked={settings.ambientEnabled} onCheckedChange={(v) => { playSound("ui_click"); setAmbientEnabled(v); }} disabled={!settings.audioEnabled} />
          </div>
        </motion.div>

        {/* GAMEPLAY */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="panel-glow clip-corner p-5 space-y-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Swords className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-amber-300/80 font-mono">Геймплей</h3>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Сложность</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => { playSound("ui_click"); setDifficulty(d); }} onMouseEnter={() => playSound("ui_hover")}
                  className={`px-2 py-2 text-xs uppercase tracking-wider font-mono clip-corner border transition-all ${
                    settings.difficulty === d ? "bg-amber-500 text-zinc-950 border-amber-500 font-semibold" : "bg-zinc-900/40 border-amber-400/20 hover:border-amber-400/50 text-foreground/70"}`}>
                  {DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground/50 italic mt-1.5 leading-relaxed">
              {settings.difficulty === "easy" ? "Враги слабее на 25%, больше HP у капитана." : settings.difficulty === "hard" ? "Враги сильнее на 25%, меньше HP у капитана." : "Стандартный баланс боя."}
            </p>
          </div>

          {/* Text speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Скорость печати диалогов</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {TEXT_SPEEDS.map((s) => (
                <button key={s} onClick={() => { playSound("ui_click"); setTextSpeed(s); }} onMouseEnter={() => playSound("ui_hover")}
                  className={`px-2 py-2 text-xs uppercase tracking-wider font-mono clip-corner border transition-all ${
                    settings.textSpeed === s ? "bg-amber-500 text-zinc-950 border-amber-500 font-semibold" : "bg-zinc-900/40 border-amber-400/20 hover:border-amber-400/50 text-foreground/70"}`}>
                  {TEXT_SPEED_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-advance dialogue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Авто-продолжение диалога</span>
            </div>
            <Switch checked={settings.autoAdvanceDialogue} onCheckedChange={(v) => { playSound("ui_click"); setAutoAdvanceDialogue(v); }} />
          </div>
          <p className="text-xs text-foreground/50 italic -mt-2 leading-relaxed">
            Автоматически переходит к следующему узлу после завершения печати текста.
          </p>

          {/* Combat speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Скорость боя</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {COMBAT_SPEEDS.map((s) => (
                <button key={s} onClick={() => { playSound("ui_click"); setCombatSpeed(s); }} onMouseEnter={() => playSound("ui_hover")}
                  className={`px-2 py-2 text-xs uppercase tracking-wider font-mono clip-corner border transition-all ${
                    settings.combatSpeed === s ? "bg-amber-500 text-zinc-950 border-amber-500 font-semibold" : "bg-zinc-900/40 border-amber-400/20 hover:border-amber-400/50 text-foreground/70"}`}>
                  {COMBAT_SPEED_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ACCESSIBILITY */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="panel-glow clip-corner p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-amber-300/80 font-mono">Доступность</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Анимации интерфейса</span>
            </div>
            <Switch checked={settings.animationsEnabled} onCheckedChange={(v) => { playSound("ui_click"); setAnimationsEnabled(v); }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Уменьшить движение</span>
            </div>
            <Switch checked={settings.reducedMotion} onCheckedChange={(v) => { playSound("ui_click"); setReducedMotion(v); }} />
          </div>
          <p className="text-xs text-foreground/50 italic leading-relaxed">
            Отключает дополнительные анимации (тряска при уроне, пульсация, glow-эффекты). Основные переходы сохраняются.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          className="panel-glow clip-corner p-5"
        >
          <p className="text-xs text-foreground/60 leading-relaxed">
            Настройки сохраняются в браузере и применяются ко всем последующим играм. Все звуковые эффекты и музыка генерируются процедурно через Web Audio API, кроме трёх MP3-композиций.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
