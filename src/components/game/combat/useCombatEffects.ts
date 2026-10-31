"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { playSound } from "@/lib/audio";
import type { Enemy, GameSave } from "@/game/types";

interface FloatNumber {
  id: string;
  text: string;
  tone: "good" | "bad" | "crit";
}

interface LogEntry {
  id: string;
  text: string;
  tone: "player" | "enemy" | "system";
}

interface UseCombatEffectsParams {
  save: GameSave | null;
  enemy: Enemy | null;
  playerShield: number;
  combatTurn: "player" | "enemy" | null;
  animationsOn: boolean;
}

interface UseCombatEffectsReturn {
  playerFlash: boolean;
  enemyFlash: boolean;
  critFlash: boolean;
  floats: FloatNumber[];
  log: LogEntry[];
  turnCount: number;
  pushFloat: (text: string, tone: FloatNumber["tone"]) => void;
  pushLog: (text: string, tone: LogEntry["tone"]) => void;
}

/**
 * Custom hook that encapsulates all combat effect tracking:
 * - Player HP changes (damage taken, healing)
 * - Enemy HP changes (damage dealt)
 * - Shield changes (for log)
 * - Turn changes (counter + log)
 * - Critical hit detection (≥25 player, ≥30 enemy)
 * - Float numbers + combat log management
 *
 * Returns all state + pushFloat/pushLog helpers for external use.
 */
export function useCombatEffects({
  save,
  enemy,
  playerShield,
  combatTurn,
  animationsOn,
}: UseCombatEffectsParams): UseCombatEffectsReturn {
  const [playerFlash, setPlayerFlash] = useState(false);
  const [enemyFlash, setEnemyFlash] = useState(false);
  const [critFlash, setCritFlash] = useState(false);
  const [floats, setFloats] = useState<FloatNumber[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [turnCount, setTurnCount] = useState(1);

  const prevHpRef = useRef(save?.hp ?? 0);
  const prevEnemyHpRef = useRef(enemy?.hp ?? 0);
  const prevShieldRef = useRef(playerShield);
  const prevTurnRef = useRef(combatTurn);

  const pushFloat = useCallback((text: string, tone: FloatNumber["tone"]) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setFloats((arr) => [...arr, { id, text, tone }].slice(-4));
    setTimeout(() => {
      setFloats((arr) => arr.filter((x) => x.id !== id));
    }, 1100);
  }, []);

  const pushLog = useCallback((text: string, tone: LogEntry["tone"]) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setLog((arr) => [{ id, text, tone }, ...arr].slice(0, 4));
  }, []);

  // Track player HP changes — damage, heal, critical detection
  useEffect(() => {
    if (!save) return;
    if (save.hp < prevHpRef.current) {
      const diff = prevHpRef.current - save.hp;
      const isCrit = diff >= 25;
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      if (animationsOn) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlayerFlash(true);
        if (isCrit) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCritFlash(true);
          timeouts.push(setTimeout(() => setCritFlash(false), 1200));
        }
      }
      pushFloat(`-${diff}`, isCrit ? "crit" : "bad");
      pushLog(`${enemy?.name ?? "Враг"} наносит ${diff} урона${isCrit ? " (крит!)" : ""}`, "enemy");
      playSound(isCrit ? "hit_critical" : "hit_player");
      timeouts.push(setTimeout(() => setPlayerFlash(false), 400));
      prevHpRef.current = save.hp;
      return () => { timeouts.forEach(clearTimeout); };
    }
    if (save.hp > prevHpRef.current) {
      const diff = save.hp - prevHpRef.current;
      pushFloat(`+${diff}`, "good");
      pushLog(`Восстановлено ${diff} HP`, "system");
    }
    prevHpRef.current = save.hp;
  }, [save?.hp, animationsOn, enemy?.name, pushFloat, pushLog]);

  // Track enemy HP changes — damage dealt, critical detection
  useEffect(() => {
    if (!enemy) return;
    if (enemy.hp < prevEnemyHpRef.current) {
      const diff = prevEnemyHpRef.current - enemy.hp;
      const isCrit = diff >= 30;
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      if (animationsOn) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnemyFlash(true);
        if (isCrit) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCritFlash(true);
          timeouts.push(setTimeout(() => setCritFlash(false), 1200));
        }
      }
      pushFloat(`-${diff}`, isCrit ? "crit" : "good");
      pushLog(`Нанесено ${diff} урона ${enemy.name}${isCrit ? " (критич.)" : ""}`, "player");
      playSound(isCrit ? "hit_critical" : "hit_enemy");
      timeouts.push(setTimeout(() => setEnemyFlash(false), 400));
      prevEnemyHpRef.current = enemy.hp;
      return () => { timeouts.forEach(clearTimeout); };
    }
    prevEnemyHpRef.current = enemy.hp;
  }, [enemy?.hp, animationsOn, enemy?.name, pushFloat, pushLog]);

  // Track shield changes for log
  useEffect(() => {
    if (playerShield > prevShieldRef.current) {
      const diff = playerShield - prevShieldRef.current;
      pushLog(`Активирован щит +${diff}`, "system");
    }
    prevShieldRef.current = playerShield;
  }, [playerShield, pushLog]);

  // Track turn changes for turn counter + log
  useEffect(() => {
    if (combatTurn && combatTurn !== prevTurnRef.current) {
      if (combatTurn === "player") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTurnCount((n) => n + 1);
        pushLog(`Ход следующий — ваш`, "system");
      } else {
        pushLog("Ход переходит к врагу", "system");
      }
    }
    prevTurnRef.current = combatTurn;
  }, [combatTurn, pushLog]);

  return {
    playerFlash,
    enemyFlash,
    critFlash,
    floats,
    log,
    turnCount,
    pushFloat,
    pushLog,
  };
}
