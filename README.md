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

### База данных (аналитика и админка)

Prisma использует SQLite, путь берётся из `DATABASE_URL`. Файл `.env` не попадает в git, поэтому создайте его локально:

```bash
# .env
DATABASE_URL="file:./dev.db"
```

После этого сгенерируйте клиент и создайте файл базы:

```bash
npm run db:generate
npm run db:push
```

Без этих шагов `/api/analytics` отвечает `500` с ошибкой `@prisma/client did not initialize yet`.

`npm install` сам запускает `prisma generate` через скрипт `postinstall`, так что на чистой копии проекта этих команд можно не выполнять. Если `postinstall` сообщит «Prisma client was NOT generated» — см. пункт про Windows ниже.

> Почему это вообще происходит: npm 11 по умолчанию блокирует install-скрипты зависимостей (`npm warn allow-scripts`), в том числе `postinstall` у `@prisma/client`, который обычно и генерирует клиент. Клиент остаётся заглушкой из `npm pack`, и любой роут, импортирующий `@/lib/db`, падает с `500`. Собственный `postinstall` проекта этим ограничением не затронут — он и закрывает проблему.

**Windows:** `prisma generate` не может перезаписать `node_modules\.prisma\client\query_engine-windows.dll.node`, пока запущен dev-сервер (процесс держит DLL) — будет `EPERM: operation not permitted, rename ...`. Сначала остановите `npm run dev`, затем генерируйте. Оставшиеся файлы `query_engine-windows.dll.node.tmp*` — безвредный мусор неудачной перезаписи, их можно удалить.

### AI-чат с экипажем

Чат ходит в Z.AI через `z-ai-web-dev-sdk`. SDK читает `baseUrl` и `apiKey` из файла `.z-ai-config`, ища его в порядке: каталог проекта → домашний каталог → `/etc`. Файл тоже не в git, шаблон — в `.z-ai-config.example`:

```bash
# скопировать и вписать свой ключ
copy .z-ai-config.example .z-ai-config     # Windows
cp .z-ai-config.example .z-ai-config       # Unix
```

`baseUrl` должен включать версию API (`https://api.z.ai/api/paas/v4`) — SDK сам допишет `/chat/completions`. Ключ создаётся в кабинете Z.AI («API Keys»). На превью-платформе space-z.ai этот файл предоставляет само окружение.

Если `.z-ai-config` отсутствует, `/api/chat` отвечает `503` с текстом «AI-провайдер не настроен» — чат не заработает сам собой, нужен ключ.

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
