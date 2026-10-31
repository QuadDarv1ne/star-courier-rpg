"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Play, BookOpen, Info, Trash2, Book, Trophy, Settings as SettingsIcon } from "lucide-react";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarshipIcon } from "./StarshipIcon";
import { playSound, switchTrack, setAudioEnabled, setAudioVolume, setAmbientEnabled, primeAudio } from "@/lib/audio";

export function MainMenu() {
  const { newGame, loadGame, hasSave, save, deleteSave, openAbout, openCodex, openAchievements, openSettings, settings } = useGame();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleNew = () => {
    primeAudio();
    playSound("ui_click");
    setAudioEnabled(settings.audioEnabled);
    setAudioVolume(settings.audioVolume);
    setAmbientEnabled(settings.ambientEnabled);
    switchTrack(0);
    // Music is NEVER auto-started — user enables via MusicPlayer or Settings
    newGame();
  };
  const handleContinue = () => {
    primeAudio();
    playSound("ui_click");
    setAudioEnabled(settings.audioEnabled);
    setAudioVolume(settings.audioVolume);
    setAmbientEnabled(settings.ambientEnabled);
    switchTrack(0);
    // Music is NEVER auto-started — user enables via MusicPlayer or Settings
    loadGame();
  };
  const handleAbout = () => { playSound("ui_click"); openAbout(); };
  const handleCodex = () => { playSound("ui_click"); openCodex(); };
  const handleAchievements = () => { playSound("ui_click"); openAchievements(); };
  const handleSettings = () => { playSound("ui_click"); openSettings(); };
  const handleDelete = () => { playSound("ui_back"); deleteSave(); };
  const handleDeleteConfirm = () => {
    playSound("ui_back");
  };

  const handleAnyClick = () => {
    primeAudio();
    // Only prime audio context on first click — don't auto-start music
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4" onClick={handleAnyClick}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="relative z-10 text-center mb-8"
      >
        <div className="relative flex items-center justify-center mb-6">
          {/* Pulsing glow halo behind starship */}
          {settings.animationsEnabled && !settings.reducedMotion && (
            <>
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  background: "radial-gradient(circle, oklch(0.78 0.15 70 / 30%) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 220,
                  height: 220,
                  background: "radial-gradient(circle, oklch(0.78 0.15 70 / 15%) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </>
          )}
          <StarshipIcon
            size={96}
            animated={settings.animationsEnabled}
            className="relative drop-shadow-[0_0_30px_oklch(0.78_0.15_70_/_60%)]"
          />
        </div>

        <h1 className="font-mono text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-shadow-glow">
          STAR
          <span className="text-amber-400 ml-3">COURIER</span>
        </h1>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs sm:text-sm uppercase tracking-[0.3em] text-amber-200/60 font-mono">
          <span className="h-px w-8 bg-amber-400/40" />
          <span>космическая RPG</span>
          <span className="h-px w-8 bg-amber-400/40" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-6 text-sm sm:text-base text-foreground/70 max-w-md mx-auto leading-relaxed"
        >
          Капитан Макс Велл и экипаж звездолёта "Элея"
          <br className="hidden sm:block" />
          доставляют загадочный артефакт через пиратские рубежи.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="relative z-10 flex flex-col gap-3 w-full max-w-xs"
      >
        {/* New Game — show confirmation if save exists */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
        {save ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                onMouseEnter={() => playSound("ui_hover")}
                className="bg-amber-500/90 hover:bg-amber-400 text-zinc-950 font-semibold uppercase tracking-wider clip-corner glow-primary animate-primary-pulse group w-full"
              >
                <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Новая игра
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-amber-500/40 text-slate-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-amber-100">Начать заново?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  У вас уже есть сохранение (Глава {save.chapter}). Начало новой игры перезапишет текущий прогресс без возможности восстановления.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onMouseEnter={() => playSound("ui_hover")}
                  className="bg-slate-800/60 text-slate-300 border-slate-600/50 hover:bg-slate-700/60"
                >
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleNew}
                  onMouseEnter={() => playSound("ui_hover")}
                  className="bg-amber-500/90 hover:bg-amber-400 text-zinc-950 font-semibold"
                >
                  Начать заново
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNew}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-amber-500/90 hover:bg-amber-400 text-zinc-950 font-semibold uppercase tracking-wider clip-corner glow-primary animate-primary-pulse group w-full"
          >
            <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            Новая игра
          </Button>
        )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.5 }}
        >
          <Button
            variant="outline"
            size="lg"
            disabled={!hasSave()}
            onClick={handleContinue}
            onMouseEnter={() => playSound("ui_hover")}
            className="border-amber-400/40 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-amber-400/70 text-foreground backdrop-blur clip-corner w-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {save ? "Продолжить" : "Нет сохранения"}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="grid grid-cols-3 gap-2 mt-1"
        >
          <Button variant="ghost" size="sm" onClick={handleCodex} onMouseEnter={() => playSound("ui_hover")}
            className="text-foreground/70 hover:text-amber-300 border border-amber-400/15 hover:border-amber-400/40 clip-corner">
            <Book className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">Кодекс</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAchievements} onMouseEnter={() => playSound("ui_hover")}
            className="text-foreground/70 hover:text-amber-300 border border-amber-400/15 hover:border-amber-400/40 clip-corner">
            <Trophy className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">Награды</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSettings} onMouseEnter={() => playSound("ui_hover")}
            className="text-foreground/70 hover:text-amber-300 border border-amber-400/15 hover:border-amber-400/40 clip-corner">
            <SettingsIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] uppercase tracking-wider">Настройки</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.15, duration: 0.5 }}
          className="flex gap-3 mt-2"
        >
          <Button variant="ghost" size="sm" onClick={handleAbout} onMouseEnter={() => playSound("ui_hover")}
            className="text-foreground/60 hover:text-foreground flex-1">
            <Info className="w-4 h-4 mr-1" />
            Об игре
          </Button>
          {save && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseEnter={() => playSound("ui_hover")}
                  onClick={handleDeleteConfirm}
                  className="text-rose-400/60 hover:text-rose-400 flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Стереть
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-rose-500/40 text-slate-100">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-rose-100">Стереть сохранение?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Это действие удалит текущее сохранение без возможности восстановления. Глава {save.chapter}, {save.defeatedEnemies.length} побеждённых врагов, {save.flags.length} сюжетных флагов будут утеряны.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onMouseEnter={() => playSound("ui_hover")}
                    className="bg-slate-800/60 text-slate-300 border-slate-600/50 hover:bg-slate-700/60"
                  >
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    onMouseEnter={() => playSound("ui_hover")}
                    className="bg-rose-600/90 hover:bg-rose-500 text-white font-semibold"
                  >
                    Стереть
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-6 left-0 right-0 flex flex-col items-center text-xs text-foreground/40 font-mono"
      >
        <Sparkles className="w-3 h-3 mb-1 text-amber-400/50" />
        <p>© Star Courier — QuadDarv1ne · Веб-адаптация</p>
      </motion.div>
    </div>
  );
}
