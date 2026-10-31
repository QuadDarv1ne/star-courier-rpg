"use client";

import { motion } from "framer-motion";
import { Heart, Zap, Shield, Hourglass, Star, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";
import {
  abilityKindIcon,
  itemKindIcon,
  branchCardClasses,
  branchIconClasses,
} from "@/components/game/combat/helpers";
import type { Ability, Enemy, GameSave } from "@/game/types";

interface AbilityGridProps {
  showItems: boolean;
  setShowItems: (v: boolean | ((prev: boolean) => boolean)) => void;
  availableAbilities: Ability[];
  save: GameSave;
  cooldowns: Record<string, number>;
  enemy: Enemy;
  onCast: (id: string) => void;
  onUseItem: (id: string) => void;
  onSkip: () => void;
}

export function AbilityGrid({
  showItems,
  setShowItems,
  availableAbilities,
  save,
  cooldowns,
  enemy,
  onCast,
  onUseItem,
  onSkip,
}: AbilityGridProps) {
  const itemsAvailable = save.inventory.filter((i) => i.count > 0);

  return (
    <div className="mt-4 panel-glow clip-corner p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono tracking-widest text-amber-300/80 font-bold">
            {showItems ? "ПРЕДМЕТЫ" : "СПОСОБНОСТИ"}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {showItems ? `${itemsAvailable.length} в наличии` : `${availableAbilities.length} доступно`}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { playSound("ui_click"); setShowItems(!showItems); }}
          onMouseEnter={() => playSound("ui_hover")}
          className="gap-1.5 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-3 py-2"
        >
          {showItems ? (
            <>
              <Sparkles className="size-3.5" /> Способности
            </>
          ) : (
            <>
              <Package className="size-3.5" /> Предметы
            </>
          )}
        </Button>
      </div>

      {showItems ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {itemsAvailable.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-slate-500 italic">
              <Package className="mx-auto mb-2 size-6 text-slate-600" />
              Нет предметов. Используйте способность пропуска хода, чтобы накопить энергию.
            </div>
          )}
          {itemsAvailable.map((item) => {
            const ItemIcon = itemKindIcon(item);
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onUseItem(item.id)}
                onMouseEnter={() => playSound("ui_hover")}
                className="flex items-start gap-3 bg-slate-800/50 px-4 py-3 text-left hover:bg-slate-700/60 border border-amber-400/20 hover:border-amber-400/40 clip-corner h-auto"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-amber-700/30 bg-slate-900/60 text-amber-300">
                  <ItemIcon className="size-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-amber-100">{item.name}</span>
                    <span className="rounded-full bg-amber-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-100">×{item.count}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400 leading-snug">{item.description}</div>
                  <div className="mt-1.5 flex gap-2.5 text-[11px] font-bold">
                    {item.heal && (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <Heart className="size-3" />+{item.heal} HP
                      </span>
                    )}
                    {item.energy && (
                      <span className="flex items-center gap-1 text-sky-300">
                        <Zap className="size-3" />+{item.energy}
                      </span>
                    )}
                    {item.shield && (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <Shield className="size-3" />+{item.shield}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {availableAbilities.map((ab, idx) => {
            const cd = cooldowns[ab.id] ?? 0;
            const cdActive = cd > 0;
            const energyLow = save.energy < ab.energyCost;
            const disabled = cdActive || energyLow;
            const KindIcon = abilityKindIcon(ab);
            const matchesWeaknessFlag = !!enemy.weakness && ab.branch === enemy.weakness;
            return (
              <motion.div
                key={ab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.3) }}
                whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
                whileTap={{ scale: disabled ? 1 : 0.97 }}
              >
                <button
                  disabled={disabled}
                  onClick={() => onCast(ab.id)}
                  onMouseEnter={() => !disabled && playSound("ui_hover")}
                  className={`relative flex w-full items-start gap-3 px-3.5 py-3 text-left clip-corner border transition-all ${branchCardClasses(ab, disabled, matchesWeaknessFlag)}`}
                >
                  {/* Kind icon */}
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${branchIconClasses(ab.branch)}`}>
                    <KindIcon className="size-4.5" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-bold text-amber-50 leading-tight">{ab.name}</div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">{idx + 1}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-300/90 flex flex-wrap gap-x-2 gap-y-0.5 leading-tight">
                      {ab.damage && <span className="text-rose-300 font-bold">Урон {ab.damage}</span>}
                      {ab.heal && <span className="text-emerald-300 font-bold">+{ab.heal} HP</span>}
                      {ab.shield && <span className="text-sky-300 font-bold">+{ab.shield} щит</span>}
                      {ab.energyRestore && <span className="text-sky-300 font-bold">+{ab.energyRestore} эн</span>}
                      {ab.energyCost > 0 && <span className="text-amber-300 font-bold">−{ab.energyCost} эн</span>}
                    </div>
                    {(ab.ignoreShield || ab.shieldPenetrate || ab.shieldReducePct || ab.weakenTurns) && (
                      <div className="mt-1 text-[11px] text-purple-300/90 font-mono flex flex-wrap gap-x-2">
                        {ab.ignoreShield && <span>игнор щита</span>}
                        {ab.shieldPenetrate && <span>пробой −{ab.shieldPenetrate}</span>}
                        {ab.shieldReducePct && <span>снижение {ab.shieldReducePct}%</span>}
                        {ab.weakenTurns && <span>ослабление {ab.weakenTurns}х</span>}
                      </div>
                    )}
                    {matchesWeaknessFlag && !disabled && (
                      <div className="mt-1.5 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <Star className="size-2.5 fill-amber-300" /> Сильное против врага
                      </div>
                    )}
                  </div>

                  {/* Status badges */}
                  {cdActive && (
                    <div className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border-2 border-amber-400/80 bg-black/70 text-xs font-bold text-amber-200" title={`Перезарядка: ${cd} ход(а)`}>
                      {cd}
                    </div>
                  )}
                  {energyLow && !cdActive && (
                    <div className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border-2 border-rose-400/80 bg-black/70" title="Недостаточно энергии">
                      <Zap className="size-4 text-rose-300" />
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer: keyboard hints + skip */}
      <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-700/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          <span className="text-amber-400/70">1–9</span> способность · <span className="text-amber-400/70">Пробел</span> пропустить · <span className="text-amber-400/70">I</span> предметы · <span className="text-amber-400/70">Esc</span> меню
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          onMouseEnter={() => playSound("ui_hover")}
          className="gap-1.5 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25 border border-amber-400/40 px-4 py-2 text-xs font-bold uppercase tracking-wider clip-corner"
        >
          <Hourglass className="size-4" /> Пропустить ход (+10 эн)
        </Button>
      </div>
    </div>
  );
}
