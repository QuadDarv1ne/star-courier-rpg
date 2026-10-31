"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { DIALOGUES } from "@/game/data/story";
import { getCharacter } from "@/game/data/characters";
import { BRANCH_INFO } from "@/game/data/characters";
import { playSound } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Save, ScrollText, FlaskConical, Dna, Brain, Lock } from "lucide-react";
import type { Branch, DialogueChoice, GameSave } from "@/game/types";

const HINT_ICON: Record<Branch, typeof FlaskConical> = {
  alchemy: FlaskConical,
  biotics: Dna,
  psyche: Brain,
};

// Check if a choice's `requires` block is satisfied by the current save state
function checkRequirements(req: NonNullable<DialogueChoice["requires"]>, save: GameSave): boolean {
  if (req.flags) {
    for (const f of req.flags) {
      if (!save.flags.includes(f)) return false;
    }
  }
  if (req.branchXp) {
    for (const [b, v] of Object.entries(req.branchXp)) {
      const branch = b as Branch;
      if (save.branchXp[branch] < (v ?? 0)) return false;
    }
  }
  if (req.relationships) {
    for (const [k, v] of Object.entries(req.relationships)) {
      if ((save.relationships[k] ?? 0) < (v ?? 0)) return false;
    }
  }
  return true;
}

// Human-readable description of unsatisfied requirements (for tooltips / lock icon)
function describeRequirements(req: NonNullable<DialogueChoice["requires"]>): string {
  const parts: string[] = [];
  if (req.flags && req.flags.length > 0) {
    parts.push(`флаг: ${req.flags.join(", ")}`);
  }
  if (req.branchXp) {
    for (const [b, v] of Object.entries(req.branchXp)) {
      parts.push(`${b}: ${v} XP`);
    }
  }
  if (req.relationships) {
    for (const [k, v] of Object.entries(req.relationships)) {
      parts.push(`отн. ${k}: ${v}`);
    }
  }
  return parts.join(" · ");
}

export function DialogueView() {
  const sceneId = useGame((s) => s.currentSceneId);
  const nodeId = useGame((s) => s.currentNodeId);
  const settings = useGame((s) => s.settings);
  const save = useGame((s) => s.save);
  const applyChoiceEffects = useGame((s) => s.applyChoiceEffects);
  const setScreen = useGame((s) => s.setScreen);
  const saveGame = useGame((s) => s.saveGame);
  const dialogueLog = useGame((s) => s.dialogueLog);

  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const skipRef = useRef(false);

  const scene = sceneId ? DIALOGUES[sceneId] : null;
  const node = scene && nodeId ? scene.nodes[nodeId] : null;
  const fullText = node?.text ?? "";
  const speaker = node?.speaker ?? "";
  const speakerChar = speaker ? getCharacter(speaker.toLowerCase().replace(/[^a-zа-я]/gi, "").replace(/\s/g, "_")) : undefined;

  // Resolve speaker color
  const speakerColor = (() => {
    if (!speaker) return "#d9a066";
    const map: Record<string, string> = {
      "Макс Велл": "#d9a066",
      "Афина": "#7fb8d4",
      "Алия'Наар": "#c8a8e9",
      "Ирина Лебедева": "#a8d4a0",
      "Рина Мирай": "#f0a8c8",
      "Надежда": "#e0a8a8",
      "Екатерина": "#a8c8e0",
      "Алексей Смирнов": "#d4c878",
      "Анна Ковалёва": "#c8d4a8",
      "Дмитрий Орлов": "#e0c0a8",
      "Сергей Волков": "#b8a8e9",
      "Капитан Ворон": "#5a2a3a",
      "Эл": "#d4a8e0",
      "Эл (артефакт)": "#d4a8e0",
    };
    return map[speaker] ?? "#d9a066";
  })();

  // typewriter speed
  const speedMs = (() => {
    switch (settings.textSpeed) {
      case "slow": return 60;
      case "normal": return 30;
      case "fast": return 12;
      case "instant": return 0;
    }
  })();

  useEffect(() => {
    setTyped("");
    setDone(false);
    skipRef.current = false;
    if (!fullText) {
      setDone(true);
      return;
    }
    if (speedMs === 0) {
      setTyped(fullText);
      setDone(true);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      if (skipRef.current) {
        setTyped(fullText);
        setDone(true);
        clearInterval(id);
        playSound("typing_done");
        return;
      }
      i += 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDone(true);
        playSound("typing_done");
      }
    }, speedMs);
    return () => clearInterval(id);
  }, [nodeId, fullText, speedMs]);

  // Handle node endAction
  useEffect(() => {
    if (!node || !done) return;
    if (node.endAction === "combat" && node.endActionTarget) {
      const startCombat = useGame.getState().startCombat;
      const t = setTimeout(() => {
        startCombat(node.endActionTarget!);
      }, 400);
      return () => clearTimeout(t);
    }
    if (node.endAction === "next_chapter" && node.endActionTarget) {
      const startChapter = useGame.getState().startChapter;
      const t = setTimeout(() => {
        startChapter(node.endActionTarget!);
      }, 400);
      return () => clearTimeout(t);
    }
    if (node.endAction === "ending") {
      const resolveEpilogue = useGame.getState().resolveEpilogue;
      const t = setTimeout(() => resolveEpilogue(), 400);
      return () => clearTimeout(t);
    }
  }, [node, done]);

  // Auto-advance dialogue when the setting is enabled AND there is exactly one choice
  // and the node has no endAction (endAction nodes don't have choices anyway)
  useEffect(() => {
    if (!settings.autoAdvanceDialogue) return;
    if (!done) return;
    if (!node?.choices || node.choices.length !== 1) return;
    if (node.endAction) return; // node will be handled by the endAction effect
    const choice = node.choices[0];
    // Don't auto-advance if the choice has unmet requirements
    if (choice.requires && (!save || !checkRequirements(choice.requires, save))) return;
    const t = setTimeout(() => {
      handleChoose(choice.id);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, node, settings.autoAdvanceDialogue, save]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("ui_click");
        setScreen("menu");
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (!done) {
          skipRef.current = true;
        } else if (node?.choices && node.choices.length === 1) {
          // auto-continue single choice (only if requirements are met)
          const c = node.choices[0];
          if (!c.requires || (save && checkRequirements(c.requires, save))) {
            handleChoose(c.id);
          } else {
            playSound("ui_back");
          }
        }
        return;
      }
      if (!done || !node?.choices) return;
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < node.choices.length) {
        const c = node.choices[idx];
        // Respect disabled state — don't activate choices with unmet requirements
        if (!c.requires || (save && checkRequirements(c.requires, save))) {
          handleChoose(c.id);
        } else {
          playSound("ui_back");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, node, save]);

  const handleChoose = useCallback((choiceId: string) => {
    playSound("ui_click");
    applyChoiceEffects(choiceId);
  }, [applyChoiceEffects]);

  const handleSave = useCallback(() => {
    playSound("ui_click");
    saveGame();
    useGame.getState().pushToast("Игра сохранена", "good");
  }, [saveGame]);

  if (!scene || !node) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center text-slate-300">
        <div className="panel-glow p-6 text-center">
          <p>Сцена не найдена. Возврат в меню.</p>
          <Button variant="ghost" onClick={() => setScreen("menu")} className="mt-4 bg-amber-500/20 text-amber-100">
            В меню
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col px-4 py-6 sm:px-8">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70 truncate">
          {scene.title}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLog((v) => !v)}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-1.5 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-3 py-2"
          >
            <ScrollText className="size-4" />
            <span className="hidden sm:inline">Лог</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-1.5 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-3 py-2"
          >
            <Save className="size-4" />
            <span className="hidden sm:inline">Сохранить</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound("ui_click"); setScreen("menu"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="gap-1.5 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-3 py-2"
          >
            <Menu className="size-4" />
            <span className="hidden sm:inline">Меню</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {/* Dialogue panel */}
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="panel-glow clip-corner mx-auto flex w-full max-w-3xl flex-col p-6 sm:p-8"
        >
          {/* Speaker */}
          <div className="flex items-center gap-4">
            <motion.div
              key={`spk_${speaker}`}
              initial={{ scale: 0.6, opacity: 0.5, rotate: -10 }}
              animate={{ scale: [0.6, 1.15, 1], opacity: 1, rotate: [-10, 6, 0] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="size-12 shrink-0 rounded-full border-2 flex items-center justify-center text-lg font-bold text-white shadow-lg"
              style={{ background: speakerColor, borderColor: `${speakerColor}88`, boxShadow: `0 0 20px ${speakerColor}40` }}
            >
              {speaker ? speaker.charAt(0).toUpperCase() : "—"}
            </motion.div>
            <div className="flex-1 min-w-0">
              <motion.div
                key={`name_${speaker}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="font-mono text-lg font-bold sm:text-xl truncate" style={{ color: speakerColor }}
              >
                {speaker || "—"}
              </motion.div>
              {speakerChar && (
                <div className="text-xs text-slate-500 truncate">{speakerChar.role}</div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="mt-5 min-h-[120px] text-base leading-relaxed text-slate-100 sm:text-lg">
            {typed}
            {!done && <span className="ml-1 inline-block h-5 w-2 bg-amber-300 animate-cursor" />}
          </div>

          {/* Choices */}
          {done && node.choices && node.choices.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              {node.choices.map((c, idx) => {
                const hint = c.branchHint ? BRANCH_INFO[c.branchHint] : null;
                const reqsMet = !c.requires || (save ? checkRequirements(c.requires, save) : false);
                const reqHint = c.requires && !reqsMet ? describeRequirements(c.requires) : null;
                return (
                  <Button
                    key={c.id}
                    variant="ghost"
                    disabled={!reqsMet}
                    onClick={() => handleChoose(c.id)}
                    onMouseEnter={() => reqsMet && playSound("ui_hover")}
                    title={reqHint ?? undefined}
                    className={`justify-start gap-3 px-4 py-3 text-left text-sm clip-corner border sm:text-base ${
                      reqsMet
                        ? "bg-slate-800/50 text-slate-100 hover:bg-slate-700/70 border-slate-600/40 hover:border-amber-400/40"
                        : "bg-slate-900/40 text-slate-500 border-slate-800/40 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <span className="font-mono text-xs text-amber-400/70">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{c.text}</span>
                    {reqHint && (
                      <span className="ml-auto flex items-center gap-1 text-[11px] text-rose-400/70 italic">
                        <Lock className="size-3" /> {reqHint}
                      </span>
                    )}
                    {hint && reqsMet && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-semibold opacity-80" style={{ color: hint.color }}>
                        {(() => {
                          const Icon = c.branchHint ? HINT_ICON[c.branchHint] : null;
                          return Icon ? <Icon className="size-3.5" /> : null;
                        })()}
                        {hint.name}
                      </span>
                    )}
                  </Button>
                );
              })}
              <div className="mt-2 text-right text-[11px] text-slate-600">
                1–9 выбрать · Пробел продолжить · Esc меню
              </div>
            </div>
          )}

          {/* End-of-node with no choices and endAction */}
          {done && (!node.choices || node.choices.length === 0) && node.endAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center justify-center gap-2 text-xs text-amber-300/70 italic"
            >
              <span className="size-2 rounded-full bg-amber-400/60 animate-pulse" />
              Переход к следующей сцене…
            </motion.div>
          )}
        </motion.div>

        {/* Log panel (collapsible) */}
        {showLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mx-auto w-full max-w-3xl"
          >
            <div className="panel-glow clip-corner p-4">
              <div className="mb-2.5 text-[11px] font-mono tracking-widest text-amber-300/70">
                ЛОГ ДИАЛОГА
              </div>
              <ScrollArea className="h-48 pr-3">
                <div className="flex flex-col gap-1.5 text-xs">
                  {dialogueLog.length === 0 && (
                    <div className="text-slate-500 italic">Лог пуст.</div>
                  )}
                  {dialogueLog.map((l, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed">
                      {l}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
