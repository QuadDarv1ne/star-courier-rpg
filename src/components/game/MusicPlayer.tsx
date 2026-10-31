"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Pause, ChevronLeft, ChevronRight, Volume2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useGame } from "@/game/store";
import {
  getTrackCount,
  getTrackName,
  getCurrentTrackIndex,
  switchTrack,
  startAmbient,
  stopAmbient,
  setAudioVolume,
  setAmbientEnabled,
  primeAudio,
  playSound,
} from "@/lib/audio";

export const MusicPlayer = memo(function MusicPlayer() {
  const settings = useGame((s) => s.settings);
  const setAudioVolumeStore = useGame((s) => s.setAudioVolume);
  const setAmbientStore = useGame((s) => s.setAmbientEnabled);
  const [expanded, setExpanded] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(getCurrentTrackIndex());
  const [isPlaying, setIsPlaying] = useState(settings.ambientEnabled && settings.audioEnabled);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentIdx(getCurrentTrackIndex());
    }, 800);
    return () => clearInterval(t);
  }, []);

  const total = getTrackCount();
  const trackName = currentIdx >= 0 ? getTrackName(currentIdx) : "—";

  const handlePrev = () => {
    playSound("ui_click");
    const next = (currentIdx - 1 + total) % total;
    primeAudio();
    switchTrack(next);
    setCurrentIdx(next);
  };

  const handleNext = () => {
    playSound("ui_click");
    const next = (currentIdx + 1) % total;
    primeAudio();
    switchTrack(next);
    setCurrentIdx(next);
  };

  const handlePlay = () => {
    playSound("ui_click");
    if (isPlaying) {
      stopAmbient();
      setIsPlaying(false);
      setAmbientStore(false);
      setAmbientEnabled(false);
    } else {
      primeAudio();
      startAmbient();
      setIsPlaying(true);
      setAmbientStore(true);
      setAmbientEnabled(true);
    }
  };

  const handleVolume = (v: number[]) => {
    const n = v[0] ?? 0;
    setAudioVolumeStore(n);
    setAudioVolume(n);
  };

  return (
    <div className="fixed left-4 top-16 z-40">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => { playSound("ui_click"); setExpanded(true); }}
            onMouseEnter={() => playSound("ui_hover")}
            aria-label="Открыть музыкальный плеер"
            title="Музыка"
            className="flex size-10 items-center justify-center rounded-full border border-amber-400/40 bg-slate-900/80 text-amber-300 backdrop-blur hover:bg-slate-800/80"
          >
            {/* Vinyl-spin animation while playing */}
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Music className="size-5" />
              </motion.div>
            ) : (
              <Music className="size-5 opacity-70" />
            )}
            {/* Pulse ring while playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-400/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="panel-glow clip-corner flex w-72 flex-col gap-2 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 4, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                  className="flex items-center justify-center size-4"
                >
                  <Music className="size-4 text-amber-400" />
                </motion.div>
                <span className="text-xs font-mono tracking-widest text-amber-300/70">
                  ПЛЕЕР
                </span>
              </div>
              <button
                onClick={() => { playSound("ui_click"); setExpanded(false); }}
                onMouseEnter={() => playSound("ui_hover")}
                aria-label="Свернуть плеер"
                title="Свернуть"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-200"
              >
                <Minimize2 className="size-3" /> свернуть
              </button>
            </div>

            <div className="rounded-md border border-slate-700/40 bg-slate-900/50 p-2.5 text-center">
              <div className="text-xs font-bold text-amber-100">{trackName}</div>
              <div className="text-[11px] text-slate-500">Трек {String(currentIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { playSound("ui_click"); primeAudio(); switchTrack(i); setCurrentIdx(i); }}
                  onMouseEnter={() => playSound("ui_hover")}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === currentIdx ? "bg-amber-400" : "bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={getTrackName(i)}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                onMouseEnter={() => playSound("ui_hover")}
                aria-label="Предыдущий трек"
                title="Предыдущий"
                className="size-8 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlay}
                onMouseEnter={() => playSound("ui_hover")}
                aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
                title={isPlaying ? "Пауза" : "Играть"}
                className="size-10 rounded-full bg-amber-500/30 text-amber-100 hover:bg-amber-500/50 border border-amber-400/50"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                onMouseEnter={() => playSound("ui_hover")}
                aria-label="Следующий трек"
                title="Следующий"
                className="size-8 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/40"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="size-3 text-slate-400" />
              <Slider
                value={[settings.audioVolume]}
                max={1}
                min={0}
                step={0.05}
                onValueChange={handleVolume}
              />
              <span className="w-10 text-right text-[11px] font-mono text-slate-400">
                {Math.round(settings.audioVolume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
