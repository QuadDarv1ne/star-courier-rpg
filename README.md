# Star Courier

Космическая RPG, в которой вы играете за капитана Макса Велла, командующего звездолётом «Элея» с живым ядром и ИИ-сознанием по имени Афина. После тринадцати лет крио-сна капитан просыпается в пустом корабле, без экипажа и без памяти о последних событиях.

## Особенности

- **6 глав** с развилками, диалогами и боями
- **4 финала**: «Хороший», «Любимый», «Нейтральный» и «Плохой»
- **15 персонажей** с эмоциональной глубиной (childhoodMemory, definingMoment, secretJoy, vulnerability, bonds)
- **18 способностей** в трёх ветках (Алхимия, Биотика, Психея) + free
- **11 типов врагов** + 2 мини-босса
- **32 достижения** за боевые, романтические и сюжетные успехи
- **100 статей кодекса**, включая 24 философские медитации
- **21 разговор экипажа** (banter)
- **8 записей журнала капитана** (2 flag-gated alt entries)
- **AI чат** с экипажем через z-ai-web-dev-sdk

## Технологии

- Next.js 16 (App Router, Turbopack)
- React 18, TypeScript
- Tailwind CSS v4
- framer-motion для анимаций
- zustand для state management (с persist middleware)
- Web Audio API для процедурного звука

## Аудио движок

- **33 типа SFX** (синтезированных через Web Audio API)
- **14 музыкальных треков** (10 процедурных + 3 MP3 + 1 эпический)
- Full mastering chain: EQ → Compressor → Reverb → Destination
- Dynamic ducking, stereo panning, chord voicing variation, arp octave variation
- Drum fills + crash cymbals, fade-in, crossfade
- 4 кинематографических стингера (reveal, choice, mystery, boss_warning)
- **Музыка ВЫКЛЮЧЕНА по умолчанию** — пользователь включает через MusicPlayer или Settings

## Установка

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Сборка

```bash
npm run build
npm start
```

## Управление

- **1-9** — выбор способности в бою
- **Пробел** — пропустить ход / продолжить диалог
- **I** — переключить предметы/способности в бою
- **Esc** — меню / назад на всех экранах
- **Enter** — отправить сообщение в чате
- **Shift+Enter** — новая строка в чате

## Структура проекта

```
src/
├── components/game/
│   ├── combat/           # Combat module (10 files)
│   │   ├── CombatView.tsx
│   │   ├── CombatHeader.tsx
│   │   ├── CombatScene.tsx
│   │   ├── PlayerPanel.tsx
│   │   ├── EnemyPanel.tsx
│   │   ├── AbilityGrid.tsx
│   │   ├── CombatEffectsLayer.tsx
│   │   ├── helpers.ts
│   │   ├── useCombatEffects.ts
│   │   └── index.ts
│   ├── MainMenu.tsx
│   ├── Bridge.tsx
│   ├── DialogueView.tsx
│   ├── CharacterSheet.tsx
│   ├── CodexScreen.tsx
│   ├── CaptainLogScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── EndingScreen.tsx
│   ├── ChatScreen.tsx
│   ├── Starfield.tsx
│   ├── MusicPlayer.tsx
│   └── ...
├── game/
│   ├── store.ts          # Zustand store
│   ├── types.ts          # TypeScript types
│   └── data/
│       ├── story.ts      # 6 chapters, ~90 nodes, 4 endings
│       ├── characters.ts # 15 characters
│       ├── abilities.ts  # 18 abilities
│       ├── enemies.ts    # 11 enemies + 2 bosses
│       ├── achievements.ts # 32 achievements
│       ├── codex.ts      # 100 entries (24 philosophy)
│       ├── banter.ts     # 21 crew banters
│       └── captain_log.ts # 8 journal entries
├── lib/
│   └── audio.ts          # Procedural audio engine (1164 lines)
└── app/
    ├── globals.css       # CSS + keyframes + theme overrides
    ├── layout.tsx
    └── page.tsx
```

## Оптимизация

- **9 React.memo** компонентов
- **useCallback** для всех handlers в CombatView, Bridge, DialogueView
- **useMemo** для expensive computations
- **Lazy loading** для ChatScreen
- **Memory leak fixes** во всех setTimeout
- **Combat guards**: endCombat double-call, turn validation

## Авторы

- QuadDarv1ne · 2025

## Лицензия

Проект создан для образовательных целей.
