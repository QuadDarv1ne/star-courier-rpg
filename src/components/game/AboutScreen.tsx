"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/audio";
import { useGame } from "@/game/store";
import { ArrowLeft, FlaskConical, Dna, Brain } from "lucide-react";
import { BRANCH_INFO } from "@/game/data/characters";
import { CHARACTERS } from "@/game/data/characters";

const BRANCH_ICON = {
  alchemy: FlaskConical,
  biotics: Dna,
  psyche: Brain,
} as const;

export function AboutScreen() {
  const setScreen = useGame((s) => s.setScreen);

  // Esc → back to menu
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

  return (
    <div className="relative z-10 min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-amber-300/70">
              О ИГРЕ
            </div>
            <div className="mt-1 text-xl font-bold text-amber-100 sm:text-2xl">Star Courier</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playSound("ui_click"); setScreen("menu"); }}
            onMouseEnter={() => playSound("ui_hover")}
            className="bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 border border-slate-600/40 px-4 py-2"
          >
            <ArrowLeft className="size-4" /> Назад
          </Button>
        </div>

        <div className="panel-glow clip-corner p-6">
          <p className="text-sm leading-relaxed text-slate-200">
            «Star Courier» — это космическая RPG, в которой вы играете за капитана Макса Велла, командующего звездолётом «Элея» с живым ядром и ИИ-сознанием по имени Афина. После тринадцати лет крио-сна капитан просыпается в пустом корабле, без экипажа и без памяти о последних событиях. Шесть глав пути, развилки, диалоги и бои — всё это ждёт вас среди звёзд.
          </p>

          <div className="mt-6">
            <div className="mb-2.5 text-[11px] font-mono tracking-widest text-amber-300/70">
              ТРИ ВЕТКИ СПОСОБНОСТЕЙ
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(["alchemy", "biotics", "psyche"] as const).map((b) => {
                const info = BRANCH_INFO[b];
                const Icon = BRANCH_ICON[b];
                return (
                  <div key={b} className="rounded-md border border-slate-600/40 bg-slate-800/30 p-3.5">
                    <div
                      className="flex size-9 items-center justify-center rounded-md bg-slate-900/60 border border-amber-700/30"
                      style={{ color: info.color }}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="mt-2 text-sm font-bold" style={{ color: info.color }}>{info.name}</div>
                    <div className="mt-1 text-xs text-slate-300 leading-relaxed">{info.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2.5 text-[11px] font-mono tracking-widest text-amber-300/70">
              ЭКИПАЖ «ЭЛЕИ»
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CHARACTERS.map((c) => (
                <div key={c.id} className="flex items-center gap-2 rounded-md border border-slate-700/40 bg-slate-800/30 p-2.5">
                  <div className="size-8 rounded-full border-2" style={{ background: c.portraitColor, borderColor: `${c.portraitColor}88` }} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-amber-100">{c.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{c.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2.5 text-[11px] font-mono tracking-widest text-amber-300/70">
              МЕХАНИКИ
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Пошаговый бой с тремя ветками способностей, щитами и слабостями врагов.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Развилки в диалогах влияют на отношения с экипажем, опыт веток и сюжетные флаги.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Шесть глав с уникальными сценами и финальным выбором судьбы корабля.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Четыре финала: «Хороший», «Любимый», «Нейтральный» и «Плохой» — зависят от ваших решений.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Кодекс на 100 статей, включая 24 философские медитации — открывается по мере прохождения.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>32 достижения за боевые, романтические и сюжетные успехи.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Сохранение в любой момент диалога — продолжите с того же места.</span></li>
              <li className="flex gap-1.5"><span className="text-amber-400/60">·</span><span>Процедурный аудио-движок с 4 слоями (барабаны, саб-бас, pad-sweep, мелодия) + 13 музыкальных композиций + 4 кинематографических стингера.</span></li>
            </ul>
          </div>

          <div className="mt-6 border-t border-slate-700/40 pt-4 text-center text-[11px] text-slate-500">
            v1.0 · Авторы: QuadDarv1ne · 2025
          </div>
        </div>
      </div>
    </div>
  );
}
