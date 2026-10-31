"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/store";
import { CHARACTERS, relationshipStatus, BRANCH_INFO, getCharacter } from "@/game/data/characters";
import { ABILITIES, isAbilityUnlocked } from "@/game/data/abilities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Lock,
  Heart,
  Shield,
  Zap,
  Users,
  Sparkles,
  Package,
  Swords,
  Wind,
  Brain,
  FlaskConical,
  Dna,
  Wand2,
  Activity,
  Hourglass,
} from "lucide-react";
import { playSound } from "@/lib/audio";
import type { Branch } from "@/game/types";

const BRANCH_LUCIDE: Record<Branch, typeof FlaskConical> = {
  alchemy: FlaskConical,
  biotics: Dna,
  psyche: Brain,
};

const ABILITY_KIND_ICON: Record<string, typeof Swords> = {
  damage: Swords,
  heal: Heart,
  shield: Shield,
  energy: Zap,
  buff: Activity,
  control: Brain,
};

function kindIconFor(ab: { damage?: number; heal?: number; shield?: number; energyRestore?: number }) {
  if (ab.damage) return Swords;
  if (ab.heal) return Heart;
  if (ab.shield) return Shield;
  if (ab.energyRestore) return Zap;
  return Sparkles;
}

export function CharacterSheet() {
  const save = useGame((s) => s.save);
  const setScreen = useGame((s) => s.setScreen);
  const consumeItem = useGame((s) => s.consumeItem);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Esc → back to bridge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("ui_click");
        setScreen("bridge");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScreen]);

  // Memoized sorted crew — prevents re-sort on every render (only re-sorts when relationships change)
  const sortedCrew = useMemo(() => {
    if (!save) return [];
    return [...CHARACTERS].sort(
      (a, b) => (save.relationships[b.id] ?? 0) - (save.relationships[a.id] ?? 0)
    );
  }, [save]);

  if (!save) {
    return null;
  }

  const selected = selectedId ? CHARACTERS.find((c) => c.id === selectedId) : null;

  return (
    <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70">
              ЭКИПАЖ "ЭЛЕИ"
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 sm:text-2xl">
              Состав и способности
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound("ui_click"); setScreen("bridge"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2"
          >
            <ArrowLeft className="size-4" /> На мостик
          </Button>
        </div>

        <Tabs defaultValue="crew" className="w-full">
          <TabsList className="bg-slate-900/60 p-1.5 gap-1">
            <TabsTrigger
              value="crew"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 gap-1.5 px-4 py-1.5 text-sm"
            >
              <Users className="size-4" /> Экипаж
            </TabsTrigger>
            <TabsTrigger
              value="abilities"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 gap-1.5 px-4 py-1.5 text-sm"
            >
              <Sparkles className="size-4" /> Способности
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 gap-1.5 px-4 py-1.5 text-sm"
            >
              <Package className="size-4" /> Инвентарь
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crew" className="mt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="panel-glow clip-corner p-4">
                <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
                  СПИСОК ЭКИПАЖА
                </div>
                <ScrollArea className="h-[68vh] pr-2">
                  <div className="flex flex-col gap-1.5">
                    {sortedCrew.map((c) => {
                      const rel = save.relationships[c.id] ?? 0;
                      const isActive = selectedId === c.id;
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => playSound("ui_hover")}
                          onClick={() => { playSound("ui_click"); setSelectedId(c.id); }}
                          className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                            isActive
                              ? "border-amber-400/60 bg-amber-500/15"
                              : "border-slate-700/40 bg-slate-800/30 hover:bg-slate-700/40"
                          }`}
                        >
                          <div
                            className="size-10 shrink-0 rounded-full border-2"
                            style={{ background: c.portraitColor, borderColor: `${c.portraitColor}88` }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-bold text-amber-100">{c.name}</div>
                            <div className="truncate text-xs text-slate-400">{c.role}</div>
                          </div>
                          <div className="text-right text-xs">
                            <div className={`font-semibold ${rel >= 20 ? "text-emerald-300" : rel < 0 ? "text-rose-300" : "text-slate-300"}`}>
                              {relationshipStatus(rel)}
                            </div>
                            <div className="font-mono text-slate-500">{rel > 0 ? `+${rel}` : rel}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <div className="panel-glow clip-corner p-4">
                {selected ? (
                  <ScrollArea className="h-[68vh] pr-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-16 shrink-0 rounded-full border-2"
                        style={{ background: selected.portraitColor, borderColor: `${selected.portraitColor}88` }}
                      />
                      <div>
                        <div className="text-xl font-bold text-amber-100 sm:text-2xl">{selected.name}</div>
                        <div className="text-sm text-slate-400">{selected.role}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {selected.tags.map((t) => (
                            <Badge key={t} variant="outline" className="text-[11px] text-slate-300">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-l-2 pl-3 italic text-sm leading-relaxed text-amber-200/90" style={{ borderColor: selected.portraitColor }}>
                      "{selected.quote}"
                    </div>

                    <div className="mt-4 text-sm leading-relaxed text-slate-200">
                      {selected.bio}
                    </div>

                    {/* Romantic interest indicator */}
                    {selected.romanceInterest && (() => {
                      const interest = getCharacter(selected.romanceInterest);
                      if (!interest) return null;
                      const rel = save.relationships[selected.id] ?? 0;
                      const threshold = selected.romanceThreshold ?? 50;
                      const romanceActive = rel >= threshold;
                      return (
                        <div
                          className={`mt-4 rounded-md border p-3 ${
                            romanceActive
                              ? "border-rose-500/40 bg-rose-950/20"
                              : "border-slate-700/40 bg-slate-800/30"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <Heart
                              className={`size-4 ${romanceActive ? "text-rose-400 fill-rose-400" : "text-slate-500"}`}
                            />
                            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300/70">
                              {romanceActive ? "Романтическая связь" : "Скрытая симпатия"}
                            </span>
                          </div>
                          <div className="text-sm text-slate-200">
                            <span className="font-semibold text-amber-100">{interest.name}</span>{" "}
                            ({interest.role})
                          </div>
                          {!romanceActive && (
                            <div className="mt-1 text-xs text-slate-400 italic">
                              Откроется при отношениях ≥ {threshold} (сейчас {rel})
                            </div>
                          )}
                          {romanceActive && (
                            <div className="mt-1 text-xs text-rose-300/80 italic">
                              Тёплая связь на уровне {rel} — доступен интимный режим чата
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-md border border-slate-700/40 bg-slate-800/30 p-2.5">
                        <div className="mb-1.5 text-[11px] font-mono tracking-widest text-amber-300/70">ПРИВЫЧКИ</div>
                        <ul className="space-y-1 text-xs text-slate-200">
                          {selected.quirks.map((q, i) => <li key={i} className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>{q}</span></li>)}
                        </ul>
                      </div>
                      <div className="rounded-md border border-slate-700/40 bg-slate-800/30 p-2.5">
                        <div className="mb-1.5 text-[11px] font-mono tracking-widest text-amber-300/70">РИТУАЛ</div>
                        <div className="text-xs italic text-slate-200">{selected.ritual ?? "—"}</div>
                      </div>
                      <div className="rounded-md border border-rose-700/30 bg-rose-950/20 p-2.5">
                        <div className="mb-1.5 text-[11px] font-mono tracking-widest text-rose-300/70">СТРАХ</div>
                        <div className="text-xs text-slate-200">{selected.fears}</div>
                      </div>
                      <div className="rounded-md border border-emerald-700/30 bg-emerald-950/20 p-2.5">
                        <div className="mb-1.5 text-[11px] font-mono tracking-widest text-emerald-300/70">НАДЕЖДА</div>
                        <div className="text-xs text-slate-200">{selected.hopes}</div>
                      </div>
                    </div>

                    <div className="mt-2 rounded-md border border-sky-700/30 bg-sky-950/20 p-2.5">
                      <div className="mb-1.5 text-[11px] font-mono tracking-widest text-sky-300/70">РЕЧЬ</div>
                      <div className="text-xs text-slate-200">{selected.speech}</div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-[68vh] items-center justify-center text-sm text-slate-500">
                    Выберите члена экипажа
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="abilities" className="mt-4">
            <div className="panel-glow clip-corner p-4">
              <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
                СПОСОБНОСТИ — 15 ВСЕГО · {save.unlockedAbilities.length + 3} ОТКРЫТО
              </div>
              <ScrollArea className="h-[68vh] pr-2">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ABILITIES.map((ab, idx) => {
                    const unlocked = ab.branch === "free" || isAbilityUnlocked(ab.id, save.unlockedAbilities, save.branchXp);
                    const branchInfo = ab.branch !== "free" ? BRANCH_INFO[ab.branch as Branch] : null;
                    const BranchIcon = branchInfo ? BRANCH_LUCIDE[ab.branch as Branch] : null;
                    const KindIcon = kindIconFor(ab);
                    return (
                      <motion.div
                        key={ab.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4), ease: "easeOut" }}
                        whileHover={{ scale: unlocked ? 1.02 : 1, y: unlocked ? -1 : 0 }}
                        className={`rounded-md border p-3.5 transition-colors ${
                          unlocked
                            ? "border-slate-600/40 bg-slate-800/30"
                            : "border-slate-800/40 bg-slate-900/40 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-900/60 border border-amber-700/30">
                            <KindIcon className="size-4 text-amber-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-sm font-bold text-amber-100">{ab.name}</span>
                              {unlocked ? (
                                <Badge variant="outline" className="text-[11px] text-emerald-300 border-emerald-500/40 px-1.5 py-0">
                                  открыта
                                </Badge>
                              ) : (
                                <Lock className="size-3.5 text-slate-500" />
                              )}
                              {ab.branch === "free" && (
                                <Badge className="text-[11px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0">FREE</Badge>
                              )}
                              {branchInfo && BranchIcon && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: branchInfo.color }}>
                                  <BranchIcon className="size-3" />
                                  {branchInfo.name}
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 text-xs text-slate-300">{ab.description}</div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                              {ab.damage && <span className="flex items-center gap-1 text-rose-300"><Swords className="size-3" />{ab.damage}</span>}
                              {ab.heal && <span className="flex items-center gap-1 text-emerald-300"><Heart className="size-3" />+{ab.heal}</span>}
                              {ab.shield && <span className="flex items-center gap-1 text-sky-300"><Shield className="size-3" />+{ab.shield}</span>}
                              {ab.energyRestore && <span className="flex items-center gap-1 text-sky-300"><Zap className="size-3" />+{ab.energyRestore}</span>}
                              {ab.energyCost > 0 && <span className="flex items-center gap-1 text-amber-300"><Zap className="size-3" />−{ab.energyCost}</span>}
                              {ab.cooldown && <span className="flex items-center gap-1 text-slate-400"><Hourglass className="size-3" />{ab.cooldown}</span>}
                              {ab.ignoreShield && <span className="text-purple-300">игнор щита</span>}
                              {ab.shieldPenetrate && <span className="text-purple-300">пробой −{ab.shieldPenetrate}щ</span>}
                              {ab.shieldReducePct && <span className="text-purple-300">ослабление {ab.shieldReducePct}%щ</span>}
                              {ab.weakenTurns && <span className="text-purple-300">ослабление ×{ab.weakenTurns}</span>}
                              <span className="ml-auto text-slate-500 font-mono">Тир {ab.tier}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <div className="panel-glow clip-corner p-4">
              <div className="mb-3 text-[11px] font-mono tracking-widest text-amber-300/70">
                ИНВЕНТАРЬ
              </div>
              <ScrollArea className="h-[68vh] pr-2">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {save.inventory.filter((i) => i.count > 0).length === 0 && (
                    <div className="col-span-full py-12 text-center text-sm text-slate-500">
                      Инвентарь пуст.
                    </div>
                  )}
                  {save.inventory.filter((i) => i.count > 0).map((item, idx) => {
                    const ItemIcon = item.shield
                      ? Shield
                      : item.energy
                        ? Zap
                        : item.heal
                          ? Heart
                          : FlaskConical;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4), ease: "easeOut" }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        className="flex items-start gap-3 rounded-md border border-slate-600/40 bg-slate-800/30 p-3.5"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-900/60 border border-amber-700/30">
                          <ItemIcon className="size-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-amber-100">{item.name}</span>
                            <span className="font-mono text-xs text-slate-400">×{item.count}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{item.description}</div>
                          <div className="mt-1.5 flex gap-2.5 text-[11px] font-semibold">
                            {item.heal && <span className="flex items-center gap-1 text-rose-300"><Heart className="size-3" />{item.heal}</span>}
                            {item.energy && <span className="flex items-center gap-1 text-sky-300"><Zap className="size-3" />{item.energy}</span>}
                            {item.shield && <span className="flex items-center gap-1 text-emerald-300"><Shield className="size-3" />{item.shield}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { playSound("ui_click"); consumeItem(item.id); }}
                            onMouseEnter={() => playSound("ui_hover")}
                            className="mt-2.5 h-8 bg-amber-500/15 text-amber-100 hover:bg-amber-500/30 border border-amber-700/30 text-xs font-semibold px-3"
                          >
                            Использовать
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
