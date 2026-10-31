"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/game/store";
import { ABILITIES, getAbility, isAbilityUnlocked } from "@/game/data/abilities";
import { isBoss } from "@/game/data/enemies";
import { playSound, playAbilitySound } from "@/lib/audio";
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
} from "@/components/ui/alert-dialog";
import { CombatTutorial } from "@/components/game/CombatTutorial";
import { DefeatOverlay } from "@/components/game/DefeatOverlay";
import { BossIntroOverlay } from "@/components/game/BossIntroOverlay";
import {
  PlayerPanel,
  EnemyPanel,
  AbilityGrid,
  CombatEffectsLayer,
  CombatScene,
  CombatHeader,
} from "@/components/game/combat";
import { useCombatEffects } from "@/components/game/combat/useCombatEffects";
import type { Ability, Branch } from "@/game/types";

export function CombatView() {
  const save = useGame((s) => s.save);
  const enemy = useGame((s) => s.enemy);
  const cooldowns = useGame((s) => s.cooldowns);
  const playerShield = useGame((s) => s.playerShield);
  const enemyWeakenTurns = useGame((s) => s.enemyWeakenTurns);
  const castAbility = useGame((s) => s.castAbility);
  const skipTurn = useGame((s) => s.skipTurn);
  const consumeItem = useGame((s) => s.consumeItem);
  const setScreen = useGame((s) => s.setScreen);
  const markTutorialFlag = useGame((s) => s.markTutorialFlag);
  const settings = useGame((s) => s.settings);
  const combatTurn = useGame((s) => s.combatTurn);
  const enemyIntent = useGame((s) => s.enemyIntent);
  const defeatedEnemies = useGame((s) => s.save?.defeatedEnemies ?? []);

  const [showItems, setShowItems] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [castRingKey, setCastRingKey] = useState<number | null>(null);

  const animationsOn = settings.animationsEnabled && !settings.reducedMotion;

  // Combat effect tracking — extracted into useCombatEffects hook
  const {
    playerFlash,
    enemyFlash,
    critFlash,
    floats,
    log,
    turnCount,
    pushLog,
  } = useCombatEffects({
    save,
    enemy,
    playerShield,
    combatTurn,
    animationsOn,
  });

  // Memoized available abilities — prevents recalculation on every render
  const availableAbilities: Ability[] = useMemo(() => {
    if (!save) return [];
    return ABILITIES.filter((a) =>
      a.branch === "free" ||
      save.unlockedAbilities.includes(a.id) ||
      isAbilityUnlocked(a.id, save.unlockedAbilities, save.branchXp)
    );
  }, [save]);

  // Memoized handlers — prevents re-creation on every render
  const handleCast = useCallback((id: string) => {
    const ab = getAbility(id);
    if (!ab) return;
    playSound("ui_click");
    if (ab.branch !== "free") {
      playAbilitySound(ab.branch as Branch);
    }
    pushLog(`Использовано: ${ab.name}`, "player");
    setCastRingKey(Date.now());
    setTimeout(() => setCastRingKey(null), 800);
    castAbility(id);
  }, [pushLog, castAbility]);

  const handleSkip = useCallback(() => {
    playSound("ui_click");
    pushLog("Ход пропущен (+10 эн)", "player");
    skipTurn();
  }, [pushLog, skipTurn]);

  const handleUseItem = useCallback((id: string) => {
    playSound("ui_click");
    const item = save?.inventory.find((i) => i.id === id);
    if (item) pushLog(`Использован предмет: ${item.name}`, "player");
    consumeItem(id);
    setShowItems(false);
  }, [save, pushLog, consumeItem]);

  useEffect(() => {
    if (!save) return;
    if (!save.tutorialFlags.includes("combat_tutorial_seen")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTutorial(true);
    }
    // Play combat start alarm
    playSound("combat_start");
  }, [save]);

  useEffect(() => {
    if (enemy && isBoss(enemy) && !save?.tutorialFlags.includes(`boss_intro_${enemy.id}`)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowBossIntro(true);
    }
  }, [enemy, save]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showItems || showTutorial || showBossIntro) return;
      if (e.code === "Space") {
        e.preventDefault();
        playSound("ui_click");
        skipTurn();
        return;
      }
      if (e.key.toLowerCase() === "i") {
        setShowItems((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setShowExitConfirm(true);
        return;
      }
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < 9) {
        const s = useGame.getState().save;
        if (!s) return;
        const ab = ABILITIES.filter((a) =>
          a.branch === "free" ||
          s.unlockedAbilities.includes(a.id) ||
          isAbilityUnlocked(a.id, s.unlockedAbilities, s.branchXp)
        )[idx];
        if (ab) {
          playSound("ui_click");
          if (ab.branch !== "free") {
            playAbilitySound(ab.branch as Branch);
          }
          castAbility(ab.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showItems, showTutorial, showBossIntro, cooldowns, save, enemy, skipTurn, castAbility]);

  if (!save || !enemy) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center text-slate-300">
        <div className="panel-glow p-8 text-center">
          <p className="text-sm">Бой не инициализирован.</p>
          <Button variant="ghost" onClick={() => setScreen("menu")} className="mt-4 bg-amber-500/20 text-amber-100">
            В меню
          </Button>
        </div>
      </div>
    );
  }

  const hpPct = (save.hp / save.maxHp) * 100;
  const eHpPct = (enemy.hp / enemy.maxHp) * 100;
  const eShieldPct = enemy.shield > 0 ? (enemy.shield / (enemy.maxHp * 0.4)) * 100 : 0;
  const boss = isBoss(enemy);
  const playerHpCritical = hpPct <= 30;
  const enemyHpCritical = eHpPct <= 30;
  const enemyDefeated = enemy.hp <= 0;

  const playerHpColor = hpPct > 60 ? "bg-rose-500" : hpPct > 30 ? "bg-amber-500" : "bg-red-700";

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* === HEADER — extracted into CombatHeader subcomponent === */}
        <CombatHeader
          chapter={save.chapter}
          battleNumber={defeatedEnemies.length + 1}
          combatTurn={combatTurn}
          turnCount={turnCount}
          onExit={() => { playSound("ui_click"); setShowExitConfirm(true); }}
        />

        {/* === COMBAT SCENE — VS LAYOUT (extracted into CombatScene subcomponent) === */}
        <CombatScene
          save={save}
          hpPct={hpPct}
          playerShield={playerShield}
          playerFlash={playerFlash}
          playerHpCritical={playerHpCritical}
          playerHpColor={playerHpColor}
          animationsOn={animationsOn}
          castRingKey={castRingKey}
          enemy={enemy}
          eHpPct={eHpPct}
          eShieldPct={eShieldPct}
          boss={boss}
          enemyFlash={enemyFlash}
          enemyHpCritical={enemyHpCritical}
          enemyWeakenTurns={enemyWeakenTurns}
          enemyIntent={enemyIntent}
          combatTurn={combatTurn}
          turnCount={turnCount}
          floats={floats}
          log={log}
        />

        {/* === COMBAT EFFECTS OVERLAYS — extracted into CombatEffectsLayer === */}
        <CombatEffectsLayer
          critFlash={critFlash}
          enemyDefeated={enemyDefeated}
          enemyName={enemy.name}
        />

        {/* === ABILITY GRID === */}
        <AbilityGrid
          showItems={showItems}
          setShowItems={setShowItems}
          availableAbilities={availableAbilities}
          save={save}
          cooldowns={cooldowns}
          enemy={enemy}
          onCast={handleCast}
          onUseItem={handleUseItem}
          onSkip={handleSkip}
        />
      </div>

      <AnimatePresence>
        {showTutorial && <CombatTutorial onClose={() => {
          setShowTutorial(false);
          markTutorialFlag("combat_tutorial_seen");
        }} />}
      </AnimatePresence>
      <AnimatePresence>
        {showBossIntro && enemy && (
          <BossIntroOverlay
            enemyName={enemy.name}
            enemyDescription={enemy.description}
            onDone={() => {
              setShowBossIntro(false);
              markTutorialFlag(`boss_intro_${enemy.id}`);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {save.hp <= 0 && (
          <DefeatOverlay
            onRetry={() => {
              useGame.getState().retryCombat();
            }}
            onMenu={() => setScreen("menu")}
          />
        )}
      </AnimatePresence>

      {/* Exit confirmation */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-zinc-900 border-amber-500/40 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-100">Покинуть бой?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Текущий бой будет прерван. Прогресс главы сохранится, но придётся начать бой заново с этим противником ({enemy.name}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onMouseEnter={() => playSound("ui_hover")}
              className="bg-slate-800/60 text-slate-300 border-slate-600/50 hover:bg-slate-700/60"
            >
              Остаться в бою
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { playSound("ui_back"); setScreen("menu"); }}
              onMouseEnter={() => playSound("ui_hover")}
              className="bg-rose-600/90 hover:bg-rose-500 text-white font-semibold"
            >
              Покинуть бой
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
