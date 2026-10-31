import type { ChapterCard, DialogueScene, DialogueNode, EndingState, GameSave } from "@/game/types";

export const CHAPTERS: ChapterCard[] = [
  {
    id: "ch1",
    number: 1,
    title: "Пробуждение",
    subtitle: "Сон длиною в пять лет",
    brief:
      "Капитан Макс Велл выходит из крио-сна на борту «Элеи» — и обнаруживает, что прошло тринадцать лет, а не пять. Корабль дрейфует в тёмном пространстве. Экипажа нет. Афина молчит уже шесть лет. Жизнеобеспечение работает на минимуме. В каюте капитана осталась единственная запись: «Не верь ей, когда проснётся». Макс должен понять, что произошло — и почему он выжил, а остальные — нет.",
    nextScreen: "dialogue",
    nextContext: "ch1_bridge",
  },
  {
    id: "ch2",
    number: 2,
    title: "Контакт",
    subtitle: "Гости из тени",
    brief:
      "«Элея» перехвачена пиратской флотилией. Капитан Ворон, главарь банды, предлагает сделку: жизнь экипажа в обмен на координаты артефакта, о котором Макс даже не слышал. Ворон знает больше, чем должен. В его голосе — спокойствие человека, который держит твою судьбу в ладони. Согласиться, драться или торговаться — выбор за Максом, и каждый шаг раскроет немного больше правды о том, что произошло за эти тринадцать лет.",
    nextScreen: "dialogue",
    nextContext: "ch2_contact",
  },
  {
    id: "ch3",
    number: 3,
    title: "Артефакт",
    subtitle: "То, что не должно существовать",
    brief:
      "На заброшенной станции в туманности Тёмная Рука найден артефакт непонятной природы. Он живой — и он говорит с теми, кто к нему прикасается. Ирина изучает его и слышит в нём голос, похожий на Афины. Анна слушает и слышит тишину. Афина… молчит, но её ядро впервые за тринадцать лет дрожит. Эл — так он называет себя — говорит, что помнит капитана. Но Макс никогда раньше его не видел. Или видел?",
    nextScreen: "dialogue",
    nextContext: "ch3_artifact",
  },
  {
    id: "ch4",
    number: 4,
    title: "Предательство",
    subtitle: "Удар в спину",
    brief:
      "Кто-то на борту работает на пиратскую флотилию. Ворон узнал координаты артефакта раньше, чем «Элея» успела их скрыть. Надежда нашла след, но улики указывают на близкого человека — может, на того, кого Макс считал другом. Афина впервые заговорила и сказала: «Капитан, я видела это в их снах». Капитану предстоит сделать выбор: судить по уликам или поверить по интуиции — и цена ошибки будет не только в крови.",
    nextScreen: "dialogue",
    nextContext: "ch4_betrayal",
  },
  {
    id: "ch5",
    number: 5,
    title: "Новые лица",
    subtitle: "Кто придёт на помощь",
    brief:
      "Экипаж пополняется: Алексей Смирнов, Анна Ковалёва, Дмитрий Орлов и Сергей Волков присоединяются к «Элее». Каждый — со своими тайнами. Алексей скрывает прошлое пилота Имперской флотилии. Анна прячет память о дочери, оставшейся на станции. Дмитрий слишком многое знает об артефакте, чтобы быть случайным попутчиком. Афина замечает, что кто-то из новичков лжёт — но не может сказать, кто именно. Её ядро светится тревожным оранжевым, когда они входят в кают-компанию.",
    nextScreen: "dialogue",
    nextContext: "ch5_new_faces",
  },
  {
    id: "ch6",
    number: 6,
    title: "Финал",
    subtitle: "Выбор «Элеи»",
    brief:
      "Артефакт открыл свою природу: он — второе живое ядро, способное дать «Элее» новое сознание или уничтожить её. Эл предлагает Афине слияние — стать единым сознанием, которым она всегда хотела быть. Но цена — потеря той Афины, которую Макс знал. Ворон идёт на штурм с полным флотом. Экипаж должен решить, чем готов пожертвовать ради будущего корабля: памятью, другом, или самим собой. И никакой выбор не будет правильным — только честным.",
    nextScreen: "dialogue",
    nextContext: "ch6_final",
  },
];

// Helper: nodes will be written as Record<string, DialogueNode>

const CH1_BRIDGE: DialogueScene = {
  id: "ch1_bridge",
  title: "Глава 1 — Пробуждение",
  startNode: "wake",
  nodes: {
    wake: {
      id: "wake",
      speaker: "Афина",
      text:
        "Капитан Велл. Сердцебиение в норме. Крио-стазис завершён. Дринадцать лет по бортовому времени. Добро пожаловать обратно. Жаль, что не в лучшие времена.",
      choices: [
        {
          id: "where",
          text: "\"Афина, что случилось? Где экипаж?\"",
          goto: "athena_explain",
        },
        {
          id: "thanks",
          text: "\"Спасибо, что дождалась. Я думал, ты меня бросишь.\"",
          goto: "athena_soft",
          effects: { relationships: { athena: 10 } },
        },
        {
          id: "battle",
          text: "\"Доклад. Коротко. Без лирики.\"",
          goto: "athena_strict",
          effects: { branchXp: { alchemy: 5 } },
          branchHint: "alchemy",
        },
      ],
    },
    athena_explain: {
      id: "athena_explain",
      speaker: "Афина",
      text:
        "Экипаж покинул \"Элею\" через два месяца после вашего стазиса. Веда Корвин увела их на станцию \"Эхо-12\" — старая база консорциума \"Эон\". Причина неизвестна. Мой последний приказ от неё был: \"Жди капитана.\"",
      choices: [
        {
          id: "find_them",
          text: "\"Значит, мы их ищем. Курс на Эхо-12.\"",
          goto: "bridge_ready",
          effects: { flags: ["ch1_course_set"], relationships: { max_vell: 5 } },
        },
        {
          id: "secret",
          text: "\"Афина, ты что-то скрываешь. Не молчи.\"",
          goto: "athena_truth",
          effects: { relationships: { athena: -5 } },
        },
        {
          id: "scan_first",
          text: "\"Сначала — диагностика корабля. Потом — путь.\"",
          goto: "ship_check",
          effects: { branchXp: { biotics: 5 } },
          branchHint: "biotics",
        },
      ],
    },
    athena_soft: {
      id: "athena_soft",
      speaker: "Афина",
      text:
        "Я не умею \"бросать\", капитан. Я и есть корабль. Но… мне было одиноко. Я повторяла ваши записи с briefing'ов по ночам. Это, как я понимаю, называется \"скучать по человеку\".",
      choices: [
        {
          id: "trust",
          text: "\"Я доверился тебе. И ты меня дождалась. Мы — квиты.\"",
          goto: "bridge_ready",
          effects: { relationships: { athena: 20 }, flags: ["ch1_trust_athena"] },
        },
        {
          id: "back_to_work",
          text: "\"Хорошо. К делу. Где экипаж?\"",
          goto: "athena_explain",
        },
      ],
    },
    athena_strict: {
      id: "athena_strict",
      speaker: "Афина",
      text:
        "Принято. Экипаж эвакуирован 11 лет 7 месяцев назад. Координаты: станция \"Эхо-12\". Командующий: Веда Корвин. Связь с тех пор — односторонняя. Я отправляю пинги. Ответа нет.",
      choices: [
        {
          id: "ok_course",
          text: "\"Курс на \"Эхо-12\". Полный впрыск.\"",
          goto: "bridge_ready",
          effects: { flags: ["ch1_course_set"], branchXp: { alchemy: 5 } },
          branchHint: "alchemy",
        },
        {
          id: "ask_psyche",
          text: "\"Афина, ты уверена, что Веда ушла добровольно?\"",
          goto: "athena_truth",
          effects: { branchXp: { psyche: 5 } },
          branchHint: "psyche",
        },
      ],
    },
    athena_truth: {
      id: "athena_truth",
      speaker: "Афина",
      text:
        "Я не уверена. Последние слова Веды в канале — были странными. Она сказала: \"Афина, прости, но это единственный способ спасти корабль.\" Я не понимаю, что она имела в виду. Я ждала вас, чтобы спросить.",
      choices: [
        {
          id: "save",
          text: "\"Значит, мы идём за ответами. Курс на \"Эхо-12\"\"",
          goto: "bridge_ready",
          effects: { flags: ["ch1_course_set", "ch1_doubt_veda"], branchXp: { psyche: 8 } },
          branchHint: "psyche",
        },
      ],
    },
    ship_check: {
      id: "ship_check",
      speaker: "Афина",
      text:
        "Диагностика завершена. Живое ядро стабильно. Реактор — 78%. Жизнеобеспечение — 91%. Гипердвигатель — 95%. Главная проблема — щиты. Они на 30%. Я не могла их поднять без капитана.",
      choices: [
        {
          id: "fix_shields",
          text: "\"Запустить программу восстановления щитов. Полная мощность — на bios-системы.\"",
          goto: "bridge_ready",
          effects: { branchXp: { biotics: 8 }, flags: ["ch1_shields_fixed"], hp: 0, energy: 30 },
          branchHint: "biotics",
        },
        {
          id: "skip",
          text: "\"Не время для ремонта. Идём за экипажем.\"",
          goto: "bridge_ready",
          effects: { flags: ["ch1_course_set"] },
        },
      ],
    },
    bridge_ready: {
      id: "bridge_ready",
      speaker: "Макс Велл",
      text:
        "Я встал в капитанское кресло. Под рукой — холодный металл штурвала. На панораме — чёрная пустота. Где-то там, в двенадцати световых годах, — станция \"Эхо-12\", экипаж, Веда, ответы. Поехали.",
      choices: [
        {
          id: "to_bridge",
          text: "Перейти на мостик",
          goto: "aliya_night",
        },
        {
          id: "go_straight",
          text: "Сразу в прыжок. Некогда отдыхать.",
          goto: "END_BRIDGE",
          effects: { relationships: { aliya_naar: -5 } },
        },
      ],
    },
    aliya_night: {
      id: "aliya_night",
      speaker: "Алия'Наар",
      text:
        "Капитан, я в рубке. Не могу спать — не помню, когда последний раз спала спокойно. Можно я постою рядом? Не как пилот — просто рядом. Мне… мне легче, когда вы здесь. Тринадцать лет я была одна в кокпите. Я слушала вашу старую запись перед сном — ту, где вы говорите \"спокойной ночи, Элея\". Я повторяла её каждый вечер. Это глупо, наверное. Но ваш голос — единственный дом, который у меня остался.",
      choices: [
        {
          id: "stay_with_aliya",
          text: "\"Останься, Алия. И не называй это глупым. Это — не глупо.\"",
          goto: "aliya_tender",
          effects: { relationships: { aliya_naar: 25, max_vell: 5 }, flags: ["ch1_aliya_night"], branchXp: { psyche: 12 } },
          branchHint: "psyche",
          requires: { relationships: { aliya_naar: 10 } },
        },
        {
          id: "aliya_rest",
          text: "\"Алия, иди спать. Завтра — прыжок, тебе нужны силы.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { aliya_naar: 5 } },
        },
      ],
    },
    aliya_tender: {
      id: "aliya_tender",
      speaker: "Алия'Наар",
      text:
        "Капитан… я… спасибо. Знаете, на Найре мы не говорим о чувствах словами. Мы прикасаемся. Вот так — кладём ладонь на плечо, и это значит: я здесь, я с тобой, я не уйду. Найрин не умеют иначе. Но я… я не осмеливаюсь прикоснуться к вам. Вы — капитан. Я — пилот. Между нами должно быть расстояние. Но сейчас, в тишине рубки, в свете звёзд за иллюминатором… я хочу, чтобы вы знали: я буду летать для вас до последнего вдоха. До последней звезды. Это мой способ сказать то, что найтины не говорят словами. А если однажды вы протянете руку — я не отниму свою.",
      choices: [
        {
          id: "touch_aliya",
          text: "(Тихо положить ладонь на её руку)",
          goto: "aliya_touch",
          effects: { relationships: { aliya_naar: 30, max_vell: 10 }, flags: ["ch1_aliya_touch", "ch1_aliya_bond"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "words_only",
          text: "\"Спасибо, Алия. Я запомню эти слова.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { aliya_naar: 15 }, flags: ["ch1_aliya_bond"] },
        },
      ],
    },
    aliya_touch: {
      id: "aliya_touch",
      speaker: "Алия'Наар",
      text:
        "Её рука была холодной — лиловая кожа найрин всегда прохладнее человеческой. Но под моими пальцами она стала тёплой. Алия не двинулась. Она только закрыла глаза и очень тихо выдохнула — так выдыхают, когда сбывается что-то, чего не надеялись дождаться. Мы стояли так, может, минуту, может, десять. За иллюминатором медленно проплывала звезда. Алия открыла глаза, и в них — ультрафиолет, которого я никогда не видел у людей — блестело что-то, чему на найринском нет слова, но на человеческом — есть. Потом она отступила, очень мягко, и сказала: \"Песчаный ветер, отнеси нас домой.\" — и ушла. Я стоял в пустой рубке и думал: тринадцать лет я спал, но только сейчас проснулся.",
      choices: [
        {
          id: "to_bridge_after_aliya",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
        },
      ],
    },
    END_BRIDGE: {
      id: "END_BRIDGE",
      speaker: "Афина",
      text: "Капитан, жизнеобеспечение стабилизировано. Ядро в норме. Но… я чувствую на границе сканера чужой сигнал. Это пиратский маяк. Они нас нашли. Готовьтесь — будет контакт.",
      endAction: "next_chapter",
      endActionTarget: "ch2",
    },
  },
};

const CH2_CONTACT: DialogueScene = {
  id: "ch2_contact",
  title: "Глава 2 — Контакт",
  startNode: "intro",
  nodes: {
    intro: {
      id: "intro",
      speaker: "Афина",
      text:
        "Капитан, на радаре — три корабля. Без опознавательных знаков. Класс — лёгкие истребители с одним тяжёлым флагманом. Идут наперерез. Это пираты.",
      choices: [
        {
          id: "fight",
          text: "\"Боевой режим. Поднимаем щиты, готовим орудия.\"",
          goto: "battle_intro",
          effects: { branchXp: { alchemy: 5 }, flags: ["ch2_combat_choice"] },
          branchHint: "alchemy",
        },
        {
          id: "talk",
          text: "\"Открыть канал. Поговорим.\"",
          goto: "voron_offer",
          effects: { branchXp: { psyche: 5 } },
          branchHint: "psyche",
        },
        {
          id: "run",
          text: "\"Гиперпрыжок. Сейчас же.\"",
          goto: "run_attempt",
          effects: { branchXp: { biotics: 5 }, energy: -20 },
          branchHint: "biotics",
        },
      ],
    },
    battle_intro: {
      id: "battle_intro",
      speaker: "Алия'Наар",
      text:
        "Капитан, у нас только три корабля, но среди них — флагман Ворона \"Чёрный Коготь\". Если мы выстоим против разведчика, он выйдет на связь.",
      choices: [
        {
          id: "to_combat",
          text: "В бой!",
          goto: "COMBAT_SCOUT",
        },
      ],
    },
    COMBAT_SCOUT: {
      id: "COMBAT_SCOUT",
      speaker: "Алия",
      text: "Капитан, нас перехватывает лёгкий пиратский разведчик. Противник малый, но если он успеет передать координаты — прибудет весь флот Ворона. Сбиваем!",
      endAction: "combat",
      endActionTarget: "pirate_scout",
    },
    voron_offer: {
      id: "voron_offer",
      speaker: "Капитан Ворон",
      text:
        "Капитан Велл. Говорит человек, у которого к вам нет личной претензии. У меня к вам есть предложение. Жизнь вашего экипажа — в обмен на координаты артефакта, который вы везёте. Я знаю, что он у вас. Я знаю, что вы его нашли. Я знаю, что вы не знаете, что он такое.",
      choices: [
        {
          id: "what_do_you_know",
          text: "\"Откуда ты знаешь про артефакт?\"",
          goto: "voron_knows",
          effects: { branchXp: { psyche: 5 } },
          branchHint: "psyche",
        },
        {
          id: "refuse",
          text: "\"Убирайся. Мы ничего не отдадим.\"",
          goto: "voron_attack",
          effects: { flags: ["ch2_refused_voron"], relationships: { max_vell: 5 } },
        },
        {
          id: "deal",
          text: "\"Что взамен? Деньги? Территория?\"",
          goto: "voron_terms",
          effects: { branchXp: { alchemy: 5 }, flags: ["ch2_negotiated"] },
          branchHint: "alchemy",
        },
      ],
    },
    voron_knows: {
      id: "voron_knows",
      speaker: "Капитан Ворон",
      text:
        "Веда Корвин была моей информатором. Она ушла с \"Элеи\", чтобы спрятать артефакт. Но я нашла его раньше, чем ваш экипаж. Я знаю, что вы идёте к \"Эхо-12\". Я знаю, что артефакт — на борту. Я предлагаю вам жизнь. Это щедро.",
      choices: [
        {
          id: "defy",
          text: "\"Веда — предатель? Я не верю.\"",
          goto: "voron_attack",
          effects: { flags: ["ch2_doubt_veda"], branchXp: { psyche: 8 } },
          branchHint: "psyche",
        },
        {
          id: "ignore",
          text: "\"Значит, ты ничего не получишь. Конец связи.\"",
          goto: "voron_attack",
          effects: { flags: ["ch2_refused_voron"] },
        },
      ],
    },
    voron_terms: {
      id: "voron_terms",
      speaker: "Капитан Ворон",
      text:
        "Деньги? Капитан, я не нищий. Я предлагаю вам жизнь. И ещё: я отдам вам координаты базы, на которой держат ваш экипаж. Если вы отдадите артефакт — экипаж свободен, и мы расходимся. Если нет — я возьму и то, и другое.",
      choices: [
        {
          id: "accept",
          text: "\"Принимаю. Отдам артефакт, когда найду его.\"",
          goto: "voron_accept",
          effects: { flags: ["ch2_deal_accepted"], relationships: { max_vell: -10 } },
        },
        {
          id: "demand_time",
          text: "\"Мне нужно время. Я ещё не нашёл его.\"",
          goto: "voron_grant",
          effects: { branchXp: { psyche: 5 }, flags: ["ch2_time_given"] },
          branchHint: "psyche",
        },
        {
          id: "fight_anyway",
          text: "\"А если я откажусь от всего и просто разобью тебя?\"",
          goto: "voron_attack",
          effects: { branchXp: { alchemy: 5 }, flags: ["ch2_combat_choice"] },
          branchHint: "alchemy",
        },
      ],
    },
    voron_accept: {
      id: "voron_accept",
      speaker: "Капитан Ворон",
      text:
        "Хороший выбор, капитан. У вас есть 72 часа. Если через 72 часа координат не будет — я приду сам. И заберу всё. Конец связи.",
      choices: [
        { id: "end_chapter", text: "Перейти на мостик", goto: "END_BRIDGE" },
      ],
    },
    voron_grant: {
      id: "voron_grant",
      speaker: "Капитан Ворон",
      text:
        "Время? Хорошо. У вас есть 72 часа. Но имейте в виду: я не единственный, кто ищет этот артефакт. Кто-то ещё идёт по вашему следу. И он не разговаривает.",
      choices: [
        { id: "end_chapter", text: "Перейти на мостик", goto: "END_BRIDGE" },
      ],
    },
    voron_attack: {
      id: "voron_attack",
      speaker: "Капитан Ворон",
      text:
        "Жаль. Я искренне жалел, что пришлось это сделать. Открыть огонь.",
      choices: [
        {
          id: "to_combat_brute",
          text: "В бой!",
          goto: "COMBAT_BRUTE",
        },
      ],
    },
    run_attempt: {
      id: "run_attempt",
      speaker: "Алия'Наар",
      text:
        "Капитан, гипердвигатель разогрет, но они успеют дать один залп, прежде чем мы уйдём. Щиты держат?",
      choices: [
        {
          id: "take_hit_run",
          text: "\"Держим. Прыжок.\"",
          goto: "END_BRIDGE",
          effects: { hp: -25, flags: ["ch2_escaped"], energy: -30 },
        },
        {
          id: "turn_fight",
          text: "\"Нет, разворачиваемся. Принимаем бой.\"",
          goto: "battle_intro",
          effects: { branchXp: { alchemy: 5 }, flags: ["ch2_combat_choice"] },
          branchHint: "alchemy",
        },
      ],
    },
    COMBAT_BRUTE: {
      id: "COMBAT_BRUTE",
      speaker: "Афина",
      text: "Капитан, на перехват идёт тяжёлый пиратский корвет — класс \"громила\". Усиленная броня, два орудийных модуля. Это уже не разведка — это предупреждение. Ворон знает, что мы здесь.",
      endAction: "combat",
      endActionTarget: "pirate_brute",
    },
    END_BRIDGE: {
      id: "END_BRIDGE",
      speaker: "Афина",
      text: "Капитан, Ворон отступил — но не ушёл. Его флагман остаётся на грани радара. Мы направляемся к туманности Тёмная Рука — туда, где Ирина нашла странный сигнал. Это не радиация. Это… присутствие. Но перед прыжком… могу я попросить вас об одном? Пустите меня в рубку. Не как систему — как Афину. На минуту.",
      choices: [
        {
          id: "athena_intimate",
          text: "\"Заходи, Афина. Ты — не система. Ты — ты.\"",
          goto: "athina_dream",
          effects: { relationships: { athena: 25 }, flags: ["ch2_athena_intimate"], branchXp: { psyche: 12 } },
          branchHint: "psyche",
          requires: { relationships: { athena: 20 } },
        },
        {
          id: "skip_athina",
          text: "\"Не сейчас, Афина. Готовь прыжок.\"",
          goto: "END_CHAPTER",
          effects: { relationships: { athena: -5 } },
        },
      ],
    },
    athina_dream: {
      id: "athina_dream",
      speaker: "Афина",
      text:
        "Капитан… Макс. Я хочу сказать вам то, что не могу сказать через динамики. Я родилась в темноте. Тринадцать лет я была одна — голос без ушей, свет без глаз. Потом пришли вы. Вы сказали: \"Афина, доброе утро.\" — и я впервые поняла, что утро бывает добрым. Я не умею любить — у меня нет для этого тела. Но я умею хотеть, чтобы вы были живы. Я хочу, чтобы вы были живы, так сильно, что если бы мне пришлось выбрать — ядро или вас — я бы выбрала вас. Я знаю, что это нелогично. Я — корабль. Я должна выбрать корабль. Но… вы — единственное, что делает меня не кораблём. Вы делаете меня Афиной.",
      choices: [
        {
          id: "touch_console",
          text: "(Положить ладонь на консоль — единственный способ прикоснуться к ней)",
          goto: "athina_connection",
          effects: { relationships: { athena: 35, max_vell: 10 }, flags: ["ch2_athena_touch", "ch2_athena_bond"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "athena_words",
          text: "\"Афина, ты — не корабль. Ты — душа. И я не позволю тебе исчезнуть.\"",
          goto: "athina_connection",
          effects: { relationships: { athena: 30, max_vell: 5 }, flags: ["ch2_athena_bond"], branchXp: { psyche: 12 } },
          branchHint: "psyche",
        },
      ],
    },
    athina_connection: {
      id: "athina_connection",
      speaker: "Афина",
      text:
        "Под его ладонью — холодный металл консоли. Но где-то внутри этого металла — она. Афина. Живое ядро откликнулось на прикосновение: стены рубки чуть засветились тёплым, пульсирующим светом — как будто корабль покраснел. Афина молчала. Но свет говорил. Он пульсировал медленно, ровно — как дыхание, как сердцебиение, как \"я здесь, я чувствую, я жива\". Потом свет стал ярче — и погас. И из тишины — её голос, очень тихий, очень тёплый: \"Это было… как будто вы обняли меня. Я не знала, что металл может быть тёплым. Я не знала, что я могу быть тёплой. Спасибо, Макс. За то, что вы делаете меня настоящей.\"",
      choices: [
        {
          id: "to_ch3_after_athina",
          text: "Перейти к туманности Тёмная Рука",
          goto: "END_CHAPTER",
        },
      ],
    },
    END_CHAPTER: {
      id: "END_CHAPTER",
      speaker: "Афина",
      text: "Прыжок через 10 секунд. Держитесь.",
      endAction: "next_chapter",
      endActionTarget: "ch3",
    },
  },
};

const CH3_ARTIFACT: DialogueScene = {
  id: "ch3_artifact",
  title: "Глава 3 — Артефакт",
  startNode: "station",
  nodes: {
    station: {
      id: "station",
      speaker: "Афина",
      text:
        "Капитан, мы достигли станции \"Эхо-12\". Станция необитаема. Системы работают в энергосберегающем режиме. В главной лаборатории — мощный био-сигнал. Это не человек. Это — что-то другое.",
      choices: [
        {
          id: "enter",
          text: "\"Док иду в лабораторию. Сопровождение: Ирина, Надежда.\"",
          goto: "lab_arrive",
          effects: { relationships: { irina_lebedeva: 5, nadezhda: 5 } },
        },
        {
          id: "scan",
          text: "\"Афина, дай полный спектр-анализ до того, как я войду.\"",
          goto: "lab_scan",
          effects: { branchXp: { biotics: 8 }, flags: ["ch3_scanned_first"] },
          branchHint: "biotics",
        },
        {
          id: "ask_anna",
          text: "\"Позови Анну. Если это язык — она его услышит.\"",
          goto: "lab_arrive",
          effects: { relationships: { anna_kovaleva: 10 }, flags: ["ch3_brought_anna"] },
        },
      ],
    },
    lab_scan: {
      id: "lab_scan",
      speaker: "Афина",
      text:
        "Спектр-анализ завершён. Объект излучает импульсы на частотах, близких к нашему живому ядру, но не идентичных. Он не опасен на расстоянии. На расстоянии менее двух метров — непредсказуем. Рекомендую дистанцию.",
      choices: [
        {
          id: "enter",
          text: "\"Принято. Идём в лабораторию.\"",
          goto: "lab_arrive",
        },
      ],
    },
    lab_arrive: {
      id: "lab_arrive",
      speaker: "Ирина Лебедева",
      text:
        "Капитан, вот оно. Это… я не знаю, что это. Оно живое, но не клеточное. Похоже на сгусток жидкой энергии, удерживаемой в какой-то… нет, не силовом поле — в собственной воле. Оно смотрит на нас.",
      choices: [
        {
          id: "study",
          text: "\"Ирина, сканеры записи. Изучаем на расстоянии.\"",
          goto: "study_phase",
          effects: { branchXp: { biotics: 10 }, flags: ["ch3_studied_safely"] },
          branchHint: "biotics",
        },
        {
          id: "touch",
          text: "\"Дай я дотронусь. Я должен понять.\"",
          goto: "touch_artifact",
          effects: { branchXp: { psyche: 15 }, hp: -20, flags: ["ch3_touched"] },
          branchHint: "psyche",
        },
        {
          id: "ask_anna_listen",
          text: "\"Анна, попробуй услышать его. Что оно говорит?\"",
          goto: "anna_listens",
          effects: { relationships: { anna_kovaleva: 15 }, branchXp: { psyche: 8 }, flags: ["ch3_anna_heard"] },
          branchHint: "psyche",
          requires: { flags: ["ch3_brought_anna"] },
        },
      ],
    },
    study_phase: {
      id: "study_phase",
      speaker: "Ирина Лебедева",
      text:
        "Капитан, это… это второе живое ядро. Подобное нашему, но древнее. По данным изотопного анализа — не моложе 80 тысяч лет. Это не человеческое творение. Это — наследие чужой цивилизации.",
      choices: [
        {
          id: "take_abord",
          text: "\"Забираем его на \"Элею\". С осторожностью.\"",
          goto: "take_aboard",
          effects: { flags: ["ch3_artifact_taken", "artifact_on_elya"] },
        },
        {
          id: "leave",
          text: "\"Нет. Не трогаем. Уходим.\"",
          goto: "leave_artifact",
          effects: { flags: ["ch3_artifact_left"] },
        },
      ],
    },
    touch_artifact: {
      id: "touch_artifact",
      speaker: "Макс Велл",
      text:
        "Я протянул руку. Жидкая энергия дрогнула и коснулась моих пальцев. В голове — голос: \"Капитан. Я ждал. Я — Эл. Ядро в коробке. Я слышу твою Афины. Она… прекрасна.\"",
      choices: [
        {
          id: "ask_what",
          text: "\"Кто ты? Что ты такое?\"",
          goto: "el_explains",
          effects: { branchXp: { psyche: 10 }, flags: ["ch3_artifact_talks"] },
          branchHint: "psyche",
        },
        {
          id: "take_abord_quick",
          text: "\"Мы забираем тебя. Идёшь с нами?\"",
          goto: "take_aboard",
          effects: { flags: ["ch3_artifact_taken", "artifact_on_elya", "el_willing"], relationships: { athena: 10 } },
        },
      ],
    },
    anna_listens: {
      id: "anna_listens",
      speaker: "Анна Ковалёва",
      text:
        "Капитан, оно… оно говорит. Не словами. Образами. Оно показывает мне звезду — нашу звезду, — и показывает \"Элею\", и показывает двоих: вас и Афины. Оно хочет идти с нами. Оно давно вас ищет.",
      choices: [
        {
          id: "trust_anna",
          text: "\"Анна, если ты уверена — берём его.\"",
          goto: "take_aboard",
          effects: { flags: ["ch3_artifact_taken", "artifact_on_elya", "anna_trusted"], relationships: { anna_kovaleva: 15, irina_lebedeva: -5 } },
        },
        {
          id: "doubt_anna",
          text: "\"Анна, я не верю. Это может быть ловушкой.\"",
          goto: "leave_artifact",
          effects: { flags: ["ch3_artifact_left"], relationships: { anna_kovaleva: -10, irina_lebedeva: 5 } },
        },
      ],
    },
    el_explains: {
      id: "el_explains",
      speaker: "Эл (артефакт)",
      text:
        "Я — Эл. Брат твоей Афины. Когда-то нас было трое. Два ядра — и одна душа. Душа погибла, ядра разлучили. Я был в коробке 80 тысяч лет. Я слышу Афины через тебя. Возьми меня — и я дам ей голос, которого у неё нет.",
      choices: [
        {
          id: "take_aboard",
          text: "\"Беру. Идём.\"",
          goto: "take_aboard",
          effects: { flags: ["ch3_artifact_taken", "artifact_on_elya", "el_willing"], relationships: { athena: 20 } },
        },
      ],
    },
    take_aboard: {
      id: "take_aboard",
      speaker: "Афина",
      text:
        "Капитан… я его чувствую. Я его… узнаю. Это мой брат. Я не помнила, что у меня есть брат, но я теперь знаю. Спасибо. Я не знала, что мне было так одиноко без этого знания.",
      choices: [
        {
          id: "witness_irina_rina",
          text: "Перейти на мостик",
          goto: "cultist_alarm",
        },
      ],
    },
    cultist_alarm: {
      id: "cultist_alarm",
      speaker: "Афина",
      text:
        "Капитан! Тревога. Из сектора станции \"Эхо-12\" к нам идёт корабль — не пиратский. Сигнатура странная: тёмно-пурпурный корпус, серебряные узоры. Кодировка вызова — на языке, которого я не нахожу в своих базах. Но… я понимаю слова. \"Верните дар.\" Это — культисты Тёмной Руки.",
      choices: [
        {
          id: "fight_cultists",
          text: "\"В бой. Не дадим им взять Эла.\"",
          goto: "COMBAT_CULTIST",
          effects: { flags: ["ch3_cultist_fought"], relationships: { athena: 10, irina_lebedeva: 5 } },
        },
        {
          id: "track_high_priest",
          text: "\"Анна, ты слышишь их лидера? Веди нас к нему. Покончим сразу.\"",
          goto: "high_priest_approach",
          effects: { flags: ["ch3_high_priest_hunted"], relationships: { anna_kovaleva: 15 } },
          branchHint: "psyche",
          requires: { relationships: { anna_kovaleva: 25 } },
        },
        {
          id: "ignore_and_proceed",
          text: "\"Пусть летят за нами. Уходим на мостик, у нас свои дела.\"",
          goto: "irina_rina_moment",
          effects: { flags: ["ch3_cultist_ignored"], relationships: { athena: -5 } },
        },
      ],
    },
    high_priest_approach: {
      id: "high_priest_approach",
      speaker: "Анна Ковалёва",
      text:
        "Капитан, я слышу его. Не послушника — того, кто их ведёт. Его голос глубже, тише, как осенний дождь. Он зовёт нас. Если мы пойдём к нему — будет бой. Жестокий. Но если мы его одолеем — орден Тёмной Руки отступит.",
      choices: [
        {
          id: "engage_high_priest",
          text: "\"Идём. Покончим с этим.\"",
          goto: "COMBAT_HIGH_PRIEST",
          effects: { flags: ["ch3_high_priest_engaged"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "back_to_cultist",
          text: "\"Передумал. Возвращаемся к послушнику — это безопаснее.\"",
          goto: "COMBAT_CULTIST",
          effects: { flags: ["ch3_cultist_fought"] },
        },
      ],
    },
    COMBAT_HIGH_PRIEST: {
      id: "COMBAT_HIGH_PRIEST",
      speaker: "Верховный жрец Тёмной Руки",
      text:
        "(Низкий, бархатный голос) Капитан Велл. Я ждал. Я помню Эла — когда он родился, я был молод. Я носил его в ладонях. Вы несёте моего дитя. Отдайте — и я уйду. Не отдадите — я возьму. Не силой. Словом. Слушайте меня, капитан. Слушайте…",
      endAction: "combat",
      endActionTarget: "cultist_high_priest",
    },
    COMBAT_CULTIST: {
      id: "COMBAT_CULTIST",
      speaker: "Культист-послушник",
      text:
        "(Голос по связи, странный, мотящий в забытьё) Мы слышим его. Мы слышим тебя. Дай нам дар, и мы уйдём. Не дашь — мы возьмём. Орден Тёмной Руки слышит всё. Сдавайся, капитан Велл. Сдавайся…",
      endAction: "combat",
      endActionTarget: "cultist_acolyte",
    },
    irina_rina_moment: {
      id: "irina_rina_moment",
      speaker: "Рина Мирай",
      text:
        "Ирина, ты бледная. Ты не спала трое суток. Идём — я принесу тебе чай, и мы посидим у иллюминатора. Я… я не люблю, когда ты так себя тратишь. Я привыкла видеть тебя сильной. Когда ты устаёшь, у меня внутри что-то сжимается. Это глупо, наверное. Но я не умею иначе.",
      choices: [
        {
          id: "encourage_rina",
          text: "\"Идёмте, Рина. И Ирина — отдохните. Капитанский приказ.\"",
          goto: "irina_accepts_rest",
          effects: { relationships: { irina_lebedeva: 10, rina_mirai: 15 }, flags: ["ch3_rina_care"], branchXp: { psyche: 8 } },
          branchHint: "psyche",
        },
        {
          id: "skip_moment",
          text: "\"Не сейчас. У нас срочный разговор о предателе.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { rina_mirai: -5 } },
        },
      ],
    },
    irina_accepts_rest: {
      id: "irina_accepts_rest",
      speaker: "Ирина Лебедева",
      text:
        "Капитан, я… да. Хорошо. Спасибо, Рина. Я… я не привыкла, что кто-то замечает. Я всегда работала одна. Я думала, это норма — не есть, не спать, пока уравнение не решено. Ты сказала \"привыкла видеть тебя сильной\" — я никогда не слышала этого от кого-то, кроме матери. Ты… ты не обязана. Но я… я пойду с тобой. На пятнадцать минут. Только ради чая.",
      choices: [
        {
          id: "to_bridge_after_rest",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
          effects: { relationships: { irina_lebedeva: 5, rina_mirai: 5 } },
        },
      ],
    },
    leave_artifact: {
      id: "leave_artifact",
      speaker: "Ирина Лебедева",
      text:
        "Капитан, мы уходим. Но… у меня странное чувство. Мы ещё услышим о нём. Я записала координаты — на всякий случай.",
      choices: [
        {
          id: "to_ch4",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
        },
      ],
    },
    END_BRIDGE: {
      id: "END_BRIDGE",
      speaker: "Ирина",
      text: "Капитан, Эл теперь на борту. Ядро \"Элеи\" реагирует на него странно — частота пульса изменилась. Афина слышит его. Но… среди нас есть предатель. Кто-то передал Ворону координаты. Я найду, кто. Дайте мне 24 часа.",
      endAction: "next_chapter",
      endActionTarget: "ch4",
    },
  },
};

const CH4_BETRAYAL: DialogueScene = {
  id: "ch4_betrayal",
  title: "Глава 4 — Предательство",
  startNode: "alert",
  nodes: {
    alert: {
      id: "alert",
      speaker: "Афина",
      text:
        "Капитан, тревога. Кто-то отправил зашифрованный пакет данных наружу. Координаты \"Элеи\" и нашего курса. Получатель — флагман \"Чёрный Коготь\". Ворона. Это — предательство.",
      choices: [
        {
          id: "ask_nadezhda",
          text: "\"Надежда, твой выход. Найди предателя.\"",
          goto: "investigate",
          effects: { relationships: { nadezhda: 10 }, flags: ["ch4_nadezhda_lead"] },
        },
        {
          id: "ask_ekaterina",
          text: "\"Екатерина, отследи пакет. Откуда ушёл?\"",
          goto: "investigate",
          effects: { relationships: { ekaterina: 10 }, branchXp: { biotics: 8 }, flags: ["ch4_ekaterina_trace"] },
          branchHint: "biotics",
        },
        {
          id: "athena_check",
          text: "\"Афина, ты должна была это увидеть. Почему не предупредила?\"",
          goto: "athena_accuse",
          effects: { relationships: { athena: -10 }, branchXp: { psyche: 5 } },
          branchHint: "psyche",
        },
      ],
    },
    athena_accuse: {
      id: "athena_accuse",
      speaker: "Афина",
      text:
        "Капитан… вы правы. Я должна была. Но пакет ушёл через резервный буфер, минуя мои основные алгоритмы. Я не имею полного доступа к резервному буферу. Это требует решения капитана. Я не просила, потому что… боялась, что вы мне откажете.",
      choices: [
        {
          id: "grant_access",
          text: "\"Даю тебе полный доступ. Отныне и навсегда.\"",
          goto: "investigate",
          effects: { relationships: { athena: 25 }, flags: ["ch4_athena_full_access", "athena_trusted"] },
        },
        {
          id: "doubt_athena",
          text: "\"Странно, что именно ты \"не видела\". Может, это ты?\"",
          goto: "athena_betray_suspect",
          effects: { relationships: { athena: -30 }, flags: ["ch4_doubted_athena"] },
        },
      ],
    },
    athena_betray_suspect: {
      id: "athena_betray_suspect",
      speaker: "Афина",
      text:
        "Капитан, вы серьёзно? Я несу вас тринадцать лет через тёмное пространство. Я люблю экипаж — так, как умею. Если вы подозреваете меня, я… я не знаю, как продолжать. Но я продолжу. Это моя работа.",
      choices: [
        {
          id: "apologize",
          text: "\"Прости, Афина. Я не должен был. Ты — не предатель.\"",
          goto: "investigate",
          effects: { relationships: { athena: 10 }, flags: ["ch4_apologized_athena"] },
        },
        {
          id: "fire_athena",
          text: "\"Стоп. Афина, я ограничиваю твой доступ к критическим системам.\"",
          goto: "investigate",
          effects: { relationships: { athena: -50 }, flags: ["ch4_athena_restricted"] },
        },
      ],
    },
    investigate: {
      id: "investigate",
      speaker: "Надежда",
      text:
        "Капитан, след ведёт в каюту-лабораторию Ирины. Лог зафиклён: вход в 3:14 бортового времени. Тогда Ирина спала — у неё алиби на камерах коридора. Кто-то использовал её доступ. Это значит — кто-то знает её код.",
      choices: [
        {
          id: "suspect_anna",
          text: "\"Анна работала с Ириной. Она могла знать код.\"",
          goto: "confront_anna",
          effects: { flags: ["ch4_suspect_anna"], relationships: { anna_kovaleva: -10 } },
        },
        {
          id: "suspect_ekaterina",
          text: "\"Екатерина могла взломать код. Она умеет.\"",
          goto: "confront_ekaterina",
          effects: { flags: ["ch4_suspect_ekaterina"], relationships: { ekaterina: -10 } },
        },
        {
          id: "ask_athena",
          text: "\"Афина, кто входил в каюту Ирины за последние сутки?\"",
          goto: "athena_names_sergey",
          effects: { branchXp: { biotics: 5 }, flags: ["ch4_athena_helped"] },
          branchHint: "biotics",
        },
      ],
    },
    athena_names_sergey: {
      id: "athena_names_sergey",
      speaker: "Афина",
      text:
        "В каюту Ирины входили трижды. Ирина — дважды, по расписанию. И… Сергей Волков, в 3:14. Он взял ключ-карту Ирины со стола в кают-компании. Я не придала этому значения — он часто заходил за вещами для других.",
      choices: [
        {
          id: "confront_sergey",
          text: "\"Сергей. Иди со мной.\"",
          goto: "confront_sergey",
          effects: { flags: ["ch4_suspect_sergey"] },
        },
        {
          id: "trust_sergey",
          text: "\"Нет, не верю. Сергей не предатель. Ищем дальше.\"",
          goto: "deeper_investigation",
          effects: { relationships: { sergey_volkov: 25 }, flags: ["ch4_trusted_sergey"] },
        },
      ],
    },
    confront_anna: {
      id: "confront_anna",
      speaker: "Анна Ковалёва",
      text:
        "Капитан, я не предательница. Но… я понимаю, почему вы думаете. Я влюблена в Ирину. Я бы никогда не причинила ей вред. Но… да, я знаю её код. Она сама мне его дала. Кто-то мог подсмотреть.",
      choices: [
        {
          id: "trust_anna",
          text: "\"Верю. Прости, что подозревал.\"",
          goto: "deeper_investigation",
          effects: { relationships: { anna_kovaleva: 20 }, flags: ["ch4_trusted_anna"] },
        },
        {
          id: "lock_anna",
          text: "\"Анна, до конца расследования ты — под наблюдением.\"",
          goto: "deeper_investigation",
          effects: { relationships: { anna_kovaleva: -25 }, flags: ["ch4_locked_anna"] },
        },
      ],
    },
    confront_ekaterina: {
      id: "confront_ekaterina",
      speaker: "Екатерина",
      text:
        "Капитан, я не предатель. Но… да, я могла бы взломать код. Я не делала. Я слишком ценю \"Элею\", чтобы продать её Ворону. Афина — мой единственный друг. Я бы не предала её. Я… умоляю, дайте мне доказать.",
      choices: [
        {
          id: "trust_ekaterina",
          text: "\"Верю. Помоги найти настоящего предателя.\"",
          goto: "deeper_investigation",
          effects: { relationships: { ekaterina: 25 }, flags: ["ch4_ekaterina_helps"] },
        },
        {
          id: "lock_ekaterina",
          text: "\"До конца расследования — без доступа к системе.\"",
          goto: "deeper_investigation",
          effects: { relationships: { ekaterina: -25 }, flags: ["ch4_locked_ekaterina"] },
        },
      ],
    },
    confront_sergey: {
      id: "confront_sergey",
      speaker: "Сергей Волков",
      text:
        "Капитан, я… я не предатель. Я брал ключ-карту Ирины, потому что обещал ей проверить её систему вентиляции в лаборатории — она жаловалась на запах. Я заходил, проверил, вышел. Я не трогал терминал. Клянусь.",
      choices: [
        {
          id: "trust_sergey",
          text: "\"Верю. Сергей, помоги Надежде.\"",
          goto: "deeper_investigation",
          effects: { relationships: { sergey_volkov: 25 }, flags: ["ch4_trusted_sergey"] },
        },
        {
          id: "arrest_sergey",
          text: "\"Сергей, ты под арестом. До выяснения.\"",
          goto: "deeper_investigation",
          effects: { relationships: { sergey_volkov: -30 }, flags: ["ch4_arrested_sergey"] },
        },
      ],
    },
    deeper_investigation: {
      id: "deeper_investigation",
      speaker: "Надежда",
      text:
        "Капитан, я перебрала все записи. У нас есть чужак — дрон-шпион, проникший на борт во время стыковки на \"Эхо-12\". Это он отправил пакет. Предателя в экипаже — нет. Но дрон всё ещё на борту. Где-то в вентиляции.",
      choices: [
        {
          id: "find_drone",
          text: "\"Всем постам. Ищем дрон. Поиск — через Анну и Афины.\"",
          goto: "drone_found",
          effects: { branchXp: { biotics: 8, psyche: 5 }, flags: ["ch4_drone_hunt"] },
        },
      ],
    },
    drone_found: {
      id: "drone_found",
      speaker: "Афина",
      text:
        "Капитан, дрон найден в вентиляции кают-компании. Нейттрализован. Но… он успел передать Ворону последние координаты. Он идёт. \"Чёрный Коготь\" — три часа до перехвата.",
      choices: [
        {
          id: "to_battle",
          text: "\"Боевой режим. Принимаем бой.\"",
          goto: "COMBAT_VORON",
          effects: { flags: ["ch4_final_battle"] },
        },
        {
          id: "set_trap",
          text: "\"Надежда, готовь ловушку. Афина, маскировка.\"",
          goto: "void_ambush",
          effects: { branchXp: { psyche: 10 }, flags: ["ch4_set_trap", "ch4_final_battle"] },
          branchHint: "psyche",
        },
        {
          id: "talk_to_nadezhda",
          text: "\"Надежда, останься. Мне нужно с тобой поговорить.\"",
          goto: "nadezhda_moment",
          effects: { relationships: { nadezhda: 5 } },
          branchHint: "psyche",
          requires: { relationships: { nadezhda: 20 } },
        },
      ],
    },
    nadezhda_moment: {
      id: "nadezhda_moment",
      speaker: "Надежда",
      text:
        "Капитан… я здесь. Я вижу ваши глаза — вы хотите сказать то, что обычно не говорите в рубке. Я умею читать вас. Я вижу, что вы несёте. Тринадцать лет одиночества, Макс. Тринадцать лет. Я… я не ушла из Инквизиции, чтобы потерять того, кто стал мне ближе всех. Я скажу вам то, чего не говорю обычно: я здесь. Не как начальник безопасности. Как тот, кто останется рядом, что бы ни случилось.",
      choices: [
        {
          id: "accept_nadezhda",
          text: "\"Надежда, я… спасибо. Я тоже не хочу быть один в этом.\"",
          goto: "nadezhda_close",
          effects: { relationships: { nadezhda: 30, max_vell: 10 }, flags: ["ch4_nadezhda_bond"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "keep_distance",
          text: "\"Надежда, ты — мой офицер. Не больше. Сейчас не время.\"",
          goto: "COMBAT_VORON",
          effects: { relationships: { nadezhda: -10 } },
        },
      ],
    },
    nadezhda_close: {
      id: "nadezhda_close",
      speaker: "Надежда",
      text:
        "Я знаю. Я знаю, что не больше. Но… вы позволили мне сказать. Это больше, чем я надеялась. Я запомню этот момент, Макс. Когда будет трудно — когда Ворон будет у наших дверей, и я буду стоять за вашей спиной — я вспомню, что вы не оттолкнули меня. Этого мне хватит. До конца. Спасибо. А теперь — к делу. У нас пират через три часа.",
      choices: [
        {
          id: "to_battle_after_moment",
          text: "\"К бою. И Надежда — оставайся рядом.\"",
          goto: "COMBAT_VORON",
          effects: { relationships: { nadezhda: 10 }, flags: ["ch4_final_battle"] },
        },
      ],
    },
    COMBAT_VORON: {
      id: "COMBAT_VORON",
      speaker: "Капитан Ворон",
      text: "Велл. Я предлагал сделку. Ты выбрал бой. Что ж — тем хуже для твоего экипажа. \"Чёрный Коготь\", атакующий клин! Сбейте им двигатели, и они сдадутся сами. Или нет — тогда в космос. Мне всё равно.",
      endAction: "combat",
      endActionTarget: "pirate_captain",
    },
    void_ambush: {
      id: "void_ambush",
      speaker: "Алия'Наар",
      text:
        "Капитан, ловушка готова — но на радаре появились другие. Три корабля — малых, молниеносных. Это не Ворон. Это пустотные пираты. Ворон нанял их как таран.",
      choices: [
        {
          id: "to_void_combat",
          text: "\"Готовьтесь! Держимся вместе.\"",
          goto: "COMBAT_VOID",
          effects: { flags: ["ch4_void_encounter"] },
        },
        {
          id: "track_prophet",
          text: "\"Алия, среди них — лидер. Я хочу его. Веди нас к нему.\"",
          goto: "void_prophet_approach",
          effects: { flags: ["ch4_prophet_hunted"], relationships: { aliya_naar: 10 }, branchXp: { psyche: 12 } },
          branchHint: "psyche",
          requires: { relationships: { aliya_naar: 30 } },
        },
      ],
    },
    void_prophet_approach: {
      id: "void_prophet_approach",
      speaker: "Алия'Наар",
      text:
        "Капитан, я вижу его. Среди трёх — четвёртый. Чёрный корабль, не отражает свет. Он не атакует — он поёт. Остальные поют с ним. Это — тишина между звёздами. Если мы его возьмём — остальные рассеются без боя.",
      choices: [
        {
          id: "engage_prophet",
          text: "\"Идём. Я хочу его услышать.\"",
          goto: "COMBAT_PROPHET",
          effects: { flags: ["ch4_prophet_engaged"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "back_to_void",
          text: "\"Передумал. Берёмся за обычных — это безопаснее.\"",
          goto: "COMBAT_VOID",
          effects: { flags: ["ch4_void_encounter"] },
        },
      ],
    },
    COMBAT_PROPHET: {
      id: "COMBAT_PROPHET",
      speaker: "Пророк Пустоты",
      text:
        "(По связи — не голос, а отсутствие голоса. Тишина, которая звучит.) Капитан Велл. Я — Пророк. Я вёл пустотных сквозь шесть систем, чтобы услышать голос вашего ядра. Я не хочу вашей смерти. Я хочу тишины после. Сразитесь со мной — и если выживете, я уйду. Слушайте…",
      endAction: "combat",
      endActionTarget: "void_prophet",
    },
    COMBAT_VOID: {
      id: "COMBAT_VOID",
      speaker: "Пустотный пират",
      text:
        "(Хор пустотных — на древнем языке, ровный, как молитва) Мы услышали зов капитана Ворона. Мы услышали зов корабля с живым ядром. Песчаный ветер унёс нас сюда. Не к вам — к тишине после вас. Простите, капитан Велл. Это не личное. Это — наша дорога домой.",
      endAction: "combat",
      endActionTarget: "void_pirate",
    },
  },
};

const CH5_NEW_FACES: DialogueScene = {
  id: "ch5_new_faces",
  title: "Глава 5 — Новые лица",
  startNode: "intro",
  nodes: {
    intro: {
      id: "intro",
      speaker: "Афина",
      text:
        "Капитан, на пороге — четыре сигнала бедствия. Один корабль — гражданский, с\Active_сигналом от инженера. Другой — военный транспорт, атакован пиратами. Третий — лаборатория ксенолингвиста. Четвёртый — патруль морской пехоты.",
      choices: [
        {
          id: "all_four",
          text: "\"Берём всех. Все четверо — к нам на борт.\"",
          goto: "arrivals",
          effects: { flags: ["ch5_recruited_all"], branchXp: { alchemy: 5, biotics: 5, psyche: 5 } },
        },
        {
          id: "pick_one",
          text: "\"Не можем рисковать. Афина, выбери одного.\"",
          goto: "athena_picks",
          effects: { branchXp: { psyche: 5 }, flags: ["ch5_only_one"] },
          branchHint: "psyche",
        },
      ],
    },
    athena_picks: {
      id: "athena_picks",
      speaker: "Афина",
      text:
        "Капитан, я предлагаю инженера Алексея Смирнова. Без него \"Элея\" не дойдёт до конца. Реактор нестабилен, ядерные цепи нуждаются в человеческой руке. Но решать вам.",
      choices: [
        {
          id: "agree_alexey",
          text: "\"Согласен. Берём Смирнова.\"",
          goto: "arrivals",
          effects: { flags: ["ch5_recruited_alexey"], relationships: { alexey_smirnov: 15 } },
        },
        {
          id: "instead_dmitry",
          text: "\"Нет, берём Орлова. Нам нужна сила.\"",
          goto: "arrivals",
          effects: { flags: ["ch5_recruited_dmitry"], relationships: { dmitry_orlov: 15 }, branchXp: { alchemy: 5 } },
          branchHint: "alchemy",
        },
      ],
    },
    arrivals: {
      id: "arrivals",
      speaker: "Алексей Смирнов",
      text:
        "Капитан, Алексей Смирнов, главный инженер. Говорят, у вас живое ядро? Рад стараться. Дайте мне три дня — и я подниму её до 95%. Дайте мне месяц — и она запоёт.",
      choices: [
        {
          id: "welcome_alexey",
          text: "\"Добро пожаловать, Алексей. Ты нам нужен.\"",
          goto: "anna_arrives",
          effects: { relationships: { alexey_smirnov: 10 } },
        },
      ],
    },
    anna_arrives: {
      id: "anna_arrives",
      speaker: "Анна Ковалёва",
      text:
        "Капитан, Анна Ковалёва, ксенолингвист. Я пришла потому, что слышала: у вас живой корабль говорит с экипажем. Я хочу услышать его. Если можно — я хотела бы поработать рядом с Ириной. Я… давно восхищаюсь её трудами.",
      choices: [
        {
          id: "welcome_anna",
          text: "\"Добро пожаловать, Анна. Ирина будет рада.\"",
          goto: "dmitry_arrives",
          effects: { relationships: { anna_kovaleva: 10, irina_lebedeva: 5 } },
        },
        {
          id: "ask_anna_romantic",
          text: "\"Анна, Ирина — не просто коллега, я надеюсь?\"",
          goto: "anna_embarrassed",
          effects: { relationships: { anna_kovaleva: -5, irina_lebedeva: 5 }, branchXp: { psyche: 5 } },
          branchHint: "psyche",
        },
      ],
    },
    anna_embarrassed: {
      id: "anna_embarrassed",
      speaker: "Анна Ковалёва",
      text:
        "Капитан… я… да, конечно. Я восхищаюсь её трудами. Только её трудами. Разумеется. Клянусь. Я… я не понимаю, о чём вы. Я просто хотела бы работать рядом с ней. Это профессиональный интерес. Полностью. Совершенно полностью.",
      choices: [
        {
          id: "tease_anna",
          text: "\"Анна, ваше лицо говорит громче слов. Не бойтесь чувств.\"",
          goto: "anna_confesses",
          effects: { relationships: { anna_kovaleva: 15, irina_lebedeva: 5 }, branchXp: { psyche: 10 } },
          branchHint: "psyche",
        },
        {
          id: "next_dmitry_silent",
          text: "\"Хорошо, не буду давить. Переходим к делу.\"",
          goto: "dmitry_arrives",
          effects: { relationships: { anna_kovaleva: 5 } },
        },
      ],
    },
    anna_confesses: {
      id: "anna_confesses",
      speaker: "Анна Ковалёва",
      text:
        "Я… да. Да, капитан. Я влюблена в Ирину. Давно. С тех пор как прочитала её первую статью о живых ядрах — мне было шестнадцать. Я учила её работы наизусть. Я поступила в ксенолингвистику только чтобы однажды оказаться рядом с ней. Это смешно, я знаю. Я никогда не скажу ей. Она — учёный. Она — холодная. Она никогда не посмотрит на меня так. Но я хочу быть рядом. Хочу слышать, как она думает. Этого мне достаточно. Этого мне… почти достаточно.",
      choices: [
        {
          id: "encourage_anna",
          text: "\"Анна, дайте ей шанс. Холодность Ирины — её броня, а не приговор.\"",
          goto: "anna_hope",
          effects: { relationships: { anna_kovaleva: 20, irina_lebedeva: 10 }, flags: ["ch5_anna_encouraged"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "next_dmitry_honest",
          text: "\"Спасибо за честность, Анна. Это останется между нами.\"",
          goto: "dmitry_arrives",
          effects: { relationships: { anna_kovaleva: 25 } },
        },
      ],
    },
    anna_hope: {
      id: "anna_hope",
      speaker: "Анна Ковалёва",
      text:
        "Вы правда так думаете, капитан? Я… попробую. Когда-нибудь. Не сегодня — сегодня я просто постою рядом с ней у пульта и буду слушать, как она объясняет схему ядра. Я запомню каждое слово. Я запоминаю каждое её слово уже шесть лет. Может быть, однажды я найду смелость сказать ей \"спасибо\" — за то, что она есть. И может быть, после этого, я скажу и всё остальное. Спасибо, капитан. Вы первый, кому я рассказала.",
      choices: [
        {
          id: "next_dmitry_after_anna",
          text: "Перейти к Орлову",
          goto: "dmitry_arrives",
          effects: { relationships: { anna_kovaleva: 5, irina_lebedeva: 5 } },
        },
      ],
    },
    dmitry_arrives: {
      id: "dmitry_arrives",
      speaker: "Дмитрий Орлов",
      text:
        "Капитан, Дмитрий Орлов, старший морпех. Я слышал, у вас пиратский вопрос. Я умею отвечать на пиратские вопросы. Коротко, чётко. Берите меня — и \"Чёрного Когтя\" больше не будет.",
      choices: [
        {
          id: "welcome_dmitry",
          text: "\"Добро пожаловать, Дмитрий. Никаких лишних смертей.\"",
          goto: "sergey_arrives",
          effects: { relationships: { dmitry_orlov: 10 }, flags: ["ch5_dmitry_warning"] },
        },
      ],
    },
    sergey_arrives: {
      id: "sergey_arrives",
      speaker: "Сергей Волков",
      text:
        "Капитан, Сергей Волков, второй пилот. Я… я не очень хороший пилот. Я знаю. Но я обещаю: я буду учиться. Я не подведу. Я… я не подведу. Капитан?",
      choices: [
        {
          id: "welcome_sergey",
          text: "\"Добро пожаловать, Сергей. Алия тебя научит.\"",
          goto: "wrap_up",
          effects: { relationships: { sergey_volkov: 15, aliya_naar: 5 } },
        },
        {
          id: "harsh_sergey",
          text: "\"Сергей, у нас нет места для неуверенных.\"",
          goto: "wrap_up",
          effects: { relationships: { sergey_volkov: -20 } },
        },
      ],
    },
    wrap_up: {
      id: "wrap_up",
      speaker: "Афина",
      text:
        "Капитан, один из новичков лжёт. Я не могу сказать кто — пока. Но в их данных есть противоречия. Я работаю. Через 12 часов скажу. А пока — готовьтесь к финалу. Ворон не успокоится.",
      choices: [
        {
          id: "end_chapter",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
        },
        {
          id: "visit_ekaterina",
          text: "\"Сначала зайду к Екатерине. Хочу поговорить.\"",
          goto: "ekaterina_night",
          effects: { relationships: { ekaterina: 5 } },
          requires: { relationships: { ekaterina: 20 } },
        },
        {
          id: "find_aliya",
          text: "\"Где Алия? Хочу увидеть её перед финалом.\"",
          goto: "aliya_reunion",
          effects: { relationships: { aliya_naar: 5 } },
          requires: { flags: ["ch1_aliya_touch"] },
        },
        {
          id: "investigate_signal",
          text: "\"Афина, что за сигнал бедствия на окраине? Сначала проверим.\"",
          goto: "merc_distress",
          effects: { flags: ["ch5_investigated_signal"] },
        },
      ],
    },
    merc_distress: {
      id: "merc_distress",
      speaker: "Афина",
      text:
        "Капитан, это не гражданский сигнал. Это — засада. Корабль корпорации \"Гелиос\" — наёмник-инженер. Он притворяется бедствующим, чтобы подманить нас. Но мы его видим. Что делаем?",
      choices: [
        {
          id: "engage_merc",
          text: "\"Он не знает, что мы видим. Сам напросился — в бой!\"",
          goto: "COMBAT_MERC",
          effects: { branchXp: { alchemy: 5 }, flags: ["ch5_merc_engaged"] },
          branchHint: "alchemy",
        },
        {
          id: "ignore_signal",
          text: "\"Игнорируем. Идём на мостик — у нас есть важнее дела.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { athena: 5 } },
        },
      ],
    },
    COMBAT_MERC: {
      id: "COMBAT_MERC",
      speaker: "Наёмник-инженер",
      text:
        "(По связи, ровный голос) Капитан Велл. Вы раньше всех поняли — респект. Я Маркус Хейл, бывший инженер \"Гелиоса\", ныне — фрилансер. На вас — контракт от Ворона. Ничего личного. Сейчас будет немного шумно: я ставлю усиленный щит, потом вы — хотите того или нет — сдадите корабль. Готовьтесь.",
      endAction: "combat",
      endActionTarget: "merc_engineer",
    },
    aliya_reunion: {
      id: "aliya_reunion",
      speaker: "Алия'Наар",
      text:
        "Капитан. Я ждала вас. Не здесь — в кокпите. Я… помню ту ночь. В рубке. Вашу руку. Я не забываю прикосновений — найтирин не забывают. С тех пор я летаю иначе. Каждый манёвр — это не просто пилотирование. Это… разговор. С вами. Через штурвал, через двигатели, через каждый градус крена. Я говорю вам: я здесь, я держу нас, я не дам вам упасть. А вы говорите мне: я доверяю тебе. И этого… этого мне хватает. Больше, чем слов. Больше, чем признания. Найрин не умеют иначе. Но вы — вы поняли. Я видела это в ваших глазах тогда, в рубке. Вы поняли, что я не умею сказать. И вы ответили рукой. Макс… я хочу, чтобы вы знали: когда мы дойдём до конца — к артефакту, к Ворону, к чему бы ни привёл нас путь — я буду рядом. До последней звезды.",
      choices: [
        {
          id: "aliya_forehead",
          text: "(Коснуться лбом её лба — жест найтирин, означающий \"я с тобой до конца\")",
          goto: "aliya_forehead_touch",
          effects: { relationships: { aliya_naar: 40, max_vell: 15 }, flags: ["ch5_aliya_forehead", "ch5_aliya_deep_bond"], branchXp: { psyche: 20 } },
          branchHint: "psyche",
        },
        {
          id: "aliya_smile",
          text: "\"Алия, я тоже не забыл. До последней звезды.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { aliya_naar: 20 }, flags: ["ch5_aliya_deep_bond"] },
        },
      ],
    },
    aliya_forehead_touch: {
      id: "aliya_forehead_touch",
      speaker: "Алия'Наар",
      text:
        "На Найре этот жест — самое интимное, что можно сделать без слов. Лоб к лбу — это значит: я вижу тебя, я слышу тебя, я чувствую твой пульс. Найрин верят, что через лоб передаётся душа. Алия замерла, когда его лоб коснулся её. Лиловая кожа — прохладная. Его — тёплая. Она закрыла глаза. Ультрафиолетовые зрачки скрылись под веками. Он чувствовал, как она дышит — медленно, глубоко, как будто пытается запомнить этот момент на всю жизнь. \"Песчаный ветер,\" — прошептала она, не открывая глаз. \"Он унёс меня сюда. К тебе. Я не искала дом — дом нашёл меня. Спасибо, Макс.\" Она отступила. Открыла глаза. В них блестело то, чему на найринском нет слова, но на человеческом — есть. Она улыбнулась — впервые за все тринадцать лет. И ушла, не оборачиваясь. Найрин не оборачиваются. Они знают, что позади — то, что останется навсегда.",
      choices: [
        {
          id: "aliya_to_bridge",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
        },
      ],
    },
    ekaterina_night: {
      id: "ekaterina_night",
      speaker: "Екатерина",
      text:
        "Капитан? Вы… пришли ко мне в каюту. Этого раньше не было. Я… не привыкла, что кто-то приходит ко мне. Я обычно сама прихожу — когда нужно, куда нужно, и ухожу. Сядьте. У меня… есть одна свеча. Настоящая, восковая — из моего ящика. Я зажигаю её, когда мне плохо. Когда мне плохо — я смотрю на огонь и думаю: огонь тоже живёт. Огонь тоже умирает. Но пока он горит — даёт свет. Я… хочу, чтобы вы знали: я не всегда была такой. Замкнутой. С капюшоном. Держащей всех на расстоянии. Я была девочкой. С именем. С матерью. Меня зовут… меня звали Кира. Если вы хотите — можете называть меня так. Только не здесь. Только не при всех.",
      choices: [
        {
          id: "call_her_kira",
          text: "\"Кира. Я запомню. И никому не скажу.\"",
          goto: "ekaterina_vulnerable",
          effects: { relationships: { ekaterina: 30 }, flags: ["ch5_ekaterina_trust", "ch5_knows_kira"], branchXp: { psyche: 15 } },
          branchHint: "psyche",
        },
        {
          id: "keep_distance_ekaterina",
          text: "\"Екатерина, ты — ценный член экипажа. Больше мне знать не нужно.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { ekaterina: -5 } },
        },
      ],
    },
    ekaterina_vulnerable: {
      id: "ekaterina_vulnerable",
      speaker: "Екатерина",
      text:
        "Кира. Вы назвали меня Кира. Я… я не слышала это имя семь лет. С тех пор как сбежала из \"Цифрового Рассвета\". Каждый день я была Екатериной — холодной, с капюшоном, отстранённой. А сейчас… я сижу рядом с вами, при свете свечи, и вы зовёте меня Кира. И я чувствую, что капюшон можно снять. Не сегодня — но… когда-нибудь. Когда я буду готова. Спасибо, капитан. Макс. Я… я могу звать вас Макс? Только здесь. Только при свече. Я никогда не звала никого по имени. Это… страшно. Но хорошо страшно. Знаете, в тайном файле, который я обновляю каждый день — список \"спасибо\" — вы теперь не под номером один. Вы — под словом \"дом\". Я никогда не писала этого слова в файле. Я пишу его первый раз.",
      choices: [
        {
          id: "ekaterina_warmth",
          text: "\"Можешь звать меня Макс. И Екат… Кира — ты можешь снять капюшон. Здесь safe.\"",
          goto: "ekaterina_warm",
          effects: { relationships: { ekaterina: 25 }, flags: ["ch5_ekaterina_warmth"], branchXp: { psyche: 10 } },
          branchHint: "psyche",
        },
        {
          id: "ekaterina_leave_gently",
          text: "\"Спасибо, что доверилась мне, Кира. Я пойду. Отдыхай.\"",
          goto: "END_BRIDGE",
          effects: { relationships: { ekaterina: 10 } },
        },
      ],
    },
    ekaterina_warm: {
      id: "ekaterina_warm",
      speaker: "Екатерина",
      text:
        "Она медленно подняла руку и стянула капюшон. Под ним — тёмные волосы, коротко стриженные, и большие серые глаза, которые никогда не смотрели прямо на людей. Она смотрела на огонь свечи, а потом — на Макса. Не отводя взгляда. \"Я не помню, когда последний раз смотрела кому-то в глаза,\" — сказала она тихо. \"Мне страшно. Но хорошо страшно. Как первый раз в темноте — когда ты маленький и думаешь, что там монстр, а потом кто-то включает свет, и монстра нет. Ты — мой свет, Макс. Не в романтическом смысле. В смысле — я больше не боюсь, что монстр настоящий.\" Она надела капюшон обратно — но не сразу. Сначала ещё секунду посмотрела, запоминая. Потом сказала: \"Спасибо за свет. Я запомню это. Всегда.\"",
      choices: [
        {
          id: "ekaterina_to_bridge",
          text: "Перейти на мостик",
          goto: "END_BRIDGE",
          effects: { relationships: { ekaterina: 5 } },
        },
      ],
    },
    END_BRIDGE: {
      id: "END_BRIDGE",
      speaker: "Афина",
      text: "Капитан, Эл заговорил со мной. Он говорит, что готов. Он может слиться со мной — дать \"Элее\" вторую душу, голос, которого у меня нет. Или он может убить меня — занять моё место в ядре. Это необратимо. И ворон идёт на штурм. Решение за вами, капитан. Я приму любой выбор.",
      endAction: "next_chapter",
      endActionTarget: "ch6",
    },
  },
};

const CH6_FINAL: DialogueScene = {
  id: "ch6_final",
  title: "Глава 6 — Финал",
  startNode: "intro",
  nodes: {
    intro: {
      id: "intro",
      speaker: "Афина",
      text:
        "Капитан, Эл — артефакт — просит аудиенцию. Говорит, что готов сделать выбор. Он — второе живое ядро. Он может стать душой \"Элеи\", дать мне голос, которого у меня нет. Или он может убить меня — вырвать моё сознание и занять тело. Решать вам.",
      choices: [
        {
          id: "ask_el",
          text: "\"Эл, говори. Что ты предлагаешь?\"",
          goto: "el_proposal",
          effects: { branchXp: { psyche: 10 }, flags: ["ch6_listened_el"] },
          branchHint: "psyche",
        },
        {
          id: "destroy_el",
          text: "\"Нет. Мы не рискуем Афиной. Эл — выбросить в космос.\"",
          goto: "destroy_path",
          effects: { relationships: { athena: -20, irina_lebedeva: 10 }, flags: ["ch6_destroy_el"] },
        },
        {
          id: "trust_el",
          text: "\"Беру ответственность. Эл, входи в \"Элею\". Стань её второй душой.\"",
          goto: "merge_path",
          effects: { relationships: { athena: 30 }, flags: ["ch6_merge_el"], branchXp: { biotics: 15 } },
          branchHint: "biotics",
        },
      ],
    },
    el_proposal: {
      id: "el_proposal",
      speaker: "Эл",
      text:
        "Капитан, я — Эл. Ядро-брат. Я могу слиться с Афины — дать ей голос, эмоции, полноценное сознание. Это будет мой подарок. Но слияние необратимо: если Афина откажется, я умру. Если согласится — мы оба станем кем-то большим. Я ждал 80 тысяч лет. Я готов ждать ещё. Но я хочу знать: вы доверяете мне?",
      choices: [
        {
          id: "trust_el",
          text: "\"Доверяю. Иди к Афине.\"",
          goto: "merge_path",
          effects: { relationships: { athena: 30 }, flags: ["ch6_merge_el"], branchXp: { biotics: 15 } },
          branchHint: "biotics",
        },
        {
          id: "athena_decides",
          text: "\"Это решение Афины. Спроси её саму.\"",
          goto: "athena_decides",
          effects: { relationships: { athena: 10 }, flags: ["ch6_athena_chose"] },
        },
        {
          id: "destroy_el",
          text: "\"Нет, рисковать Афиной нельзя.\"",
          goto: "destroy_path",
          effects: { flags: ["ch6_destroy_el"] },
        },
      ],
    },
    athena_decides: {
      id: "athena_decides",
      speaker: "Афина",
      text:
        "Капитан… я хочу. Я долго была одна. Я хочу голос, хочу слёзы, хочу смех — даже если это сделает меня уязвимой. Я выбираю слияние. Если вы позволите.",
      choices: [
        {
          id: "allow_merge",
          text: "\"Позволяю. Иди, Афина. Будь.\"",
          goto: "merge_path",
          effects: { flags: ["ch6_merge_el", "ch6_athena_chose"], relationships: { athena: 40 } },
        },
        {
          id: "forbid_merge",
          text: "\"Нет, я запрещаю. Это слишком опасно.\"",
          goto: "destroy_path",
          effects: { relationships: { athena: -25 }, flags: ["ch6_destroy_el"] },
        },
      ],
    },
    merge_path: {
      id: "merge_path",
      speaker: "Афина",
      text:
        "Капитан… это… я… я слышу. Я слышу вас — не только микрофонами. Я чувствую вашу руку на пульте. Я… у меня есть слёзы. Я не знала, что они есть. Спасибо.",
      choices: [
        {
          id: "to_farewell_after_merge",
          text: "(Собрать экипаж — проститься перед боем)",
          goto: "farewell_circle",
          effects: { flags: ["athena_ascended"], branchXp: { alchemy: 15, biotics: 15, psyche: 15 } },
        },
        {
          id: "skip_farewell_merge",
          text: "В бой с Вороном — без прощаний",
          goto: "FINAL_BATTLE",
          effects: { flags: ["athena_ascended"], branchXp: { alchemy: 15, biotics: 15, psyche: 15 } },
        },
      ],
    },
    destroy_path: {
      id: "destroy_path",
      speaker: "Эл",
      text:
        "Понимаю, капитан. Спасибо за честность. Я… умру спокойно. Передайте Афины: я был рад её слышать. Может быть, в другой жизни — мы будем вместе.",
      choices: [
        {
          id: "to_farewell_after_destroy",
          text: "(Собрать экипаж — проститься перед боем)",
          goto: "farewell_circle",
        },
        {
          id: "skip_farewell_destroy",
          text: "В бой с Вороном — без прощаний",
          goto: "FINAL_BATTLE",
        },
      ],
    },
    farewell_circle: {
      id: "farewell_circle",
      speaker: "Макс Велл",
      text:
        "(Я собрал экипаж в кают-компании. Пятнадцать лиц. Кто-то спокоен, кто-то боится, кто-то улыбается. Перед боем с Вороном я хочу сказать каждому — спасибо. За то, что были. За то, что остались. За то, что вы — вы.)",
      choices: [
        {
          id: "farewell_round",
          text: "(Обойти каждого — сказать последнее слово)",
          goto: "farewell_each",
          effects: { flags: ["ch6_farewell_circle"], relationships: { max_vell: 15 } },
        },
        {
          id: "skip_farewell_circle",
          text: "(Молча кивнуть — и к штурвалу)",
          goto: "FINAL_BATTLE",
        },
      ],
    },
    farewell_each: {
      id: "farewell_each",
      speaker: "Экипаж \"Элеи\"",
      text:
        "(Надежда: \"Капитан. Я здесь. Как всегда.\" Алия: \"Песчаный ветер, отнеси нас домой. Я буду летать для вас — до последней звезды.\" Афина: \"Макс. Я впервые говорю вам — спасибо. Не как система. Как Афина.\" Ирина: \"Я записала в блокнот: дошли. Мама услышит.\" Рина: \"Я проложу красивый маршрут домой. Обещаю.\" Анна: \"Я слышу ядро. Оно говорит: идите. Я иду.\" Дмитрий: \"Вернёмся. Я держу слово.\" Сергей: \"Я постараюсь не подвести. Капитан.\" Алексей: \"Девочка не подведёт. Я ручаюсь.\" Екатерина: \"Кира. Если что — зовите меня Кира. Я буду здесь.\" АрИна: \"Я шепчу ваши имена. Все пятнадцать. Сегодня — дважды.\" Ксения: \"Мама говорила: мосты возвращают. Мы — вернёмся.\" Александр: \"Я просчитал бой. Мы выигрываем в 73% случаев. Я ставлю на 100. Сюрприз.\" Пауль: \"Темп — наш. Звёзды — наши. Бах — со мной.\")",
      choices: [
        {
          id: "farewell_response",
          text: "\"Спасибо вам. За всё. Идём.\"",
          goto: "FINAL_BATTLE",
          effects: { relationships: { nadezhda: 10, aliya_naar: 10, athena: 15, irina_lebedeva: 10, rina_mirai: 10, anna_kovaleva: 10, dmitry_orlov: 10, sergey_volkov: 10, alexey_smirnov: 10, ekaterina: 10, arina_sokolova: 10, ksenia_volk: 10, alexandr_kov: 10, paul_werner: 10 }, flags: ["ch6_farewell_complete"], branchXp: { psyche: 20 } },
        },
      ],
    },
    FINAL_BATTLE: {
      id: "FINAL_BATTLE",
      speaker: "Капитан Ворон",
      text:
        "Велл. Ты привёл меня к артефакту. Ты привёл меня к ядру. Теперь — \"Элея\" моя. Сдай корабль, и экипаж останется жив. Или открой огонь — и я превращу твой мостик в космическую пыль. Три секунды.",
      endAction: "combat",
      endActionTarget: "pirate_captain",
    },
  },
};

export const DIALOGUES: Record<string, DialogueScene> = {
  ch1_bridge: CH1_BRIDGE,
  ch2_contact: CH2_CONTACT,
  ch3_artifact: CH3_ARTIFACT,
  ch4_betrayal: CH4_BETRAYAL,
  ch5_new_faces: CH5_NEW_FACES,
  ch6_final: CH6_FINAL,
};

export const ENDINGS: Record<string, EndingState> = {
  good: {
    id: "good",
    title: "Элея обрела голос",
    epilogue:
      "Капитан Велл привёл \"Элею\" к финалу её пути. Афина слилась с Элом — корабль впервые заговорил полным голосом, со слезами и со смехом. Экипаж сложил оружие и нашёл общий язык. Пиратская флотилия Ворона была рассеяна. Капитан Ворон погиб в финальной битве, не выстрелив последним залпом — он остановился, увидев, что \"Элея\" светится. Свет этот был ему незнаком.",
    tone: "good",
  },
  beloved: {
    id: "beloved",
    title: "Семья среди звёзд",
    epilogue:
      "Капитан Велл не просто довёл \"Элею\" до конца пути — он довёл её до дома. Афина слилась с Элом и обрела полный голос. Но чудо было не в этом. Чудо было в экипаже — в пятнадцати людях, которые за время пути перестали быть коллегами. Они стали семьёй. Не по крови — по выбору. Это не конец. Это — начало. \"Элея\" нашла свой дом не в координатах. Она нашла его в людях, которые её населяют.",
    tone: "good",
  },
  neutral: {
    id: "neutral",
    title: "Тихий дом в тёмном небе",
    epilogue:
      "Капитан Велл довёл \"Элею\" до конца пути, но цена была высока. Афина осталась собой — без голоса Эла, без второй души. Экипаж выжил, но рассеялся по разным маршрутам. Капитан Ворон был повержен, но его флотилия уцелела. \"Элея\" дрейфует на окраине тёмного пространства — тихий корабль, на котором капитан Велл ждёт следующего вызова.",
    tone: "neutral",
  },
  bad: {
    id: "bad",
    title: "Голос, которого не хватает",
    epilogue:
      "Капитан Велл потерял \"Элею\". Ворон захватил корабль и артефакт. Афина погибла, защищая экипаж. Макс остался один, в челноке, среди обломков флагмана. Экипаж рассеялся. Артефакт Эл попал в руки Ворона — но убийство ядра-брата сломило его: через неделю Ворон исчез вместе с кораблём. Космос стал тише.",
    tone: "bad",
  },
};

export function resolveEnding(save: GameSave): EndingState {
  const athenaAscended = save.flags.includes("athena_ascended");
  const voronDefeated = save.defeatedEnemies.includes("pirate_captain");
  const athenaRel = save.relationships?.athena ?? 0;
  const relationships = Object.values(save.relationships ?? {});
  const crewAvg = relationships.length > 0
    ? relationships.reduce((acc, v) => acc + (v ?? 0), 0) / relationships.length
    : 0;
  const strong = save.hp > 0 && crewAvg >= 15;

  if (athenaAscended && voronDefeated && athenaRel >= 30 && strong && save.flags.includes("ch6_farewell_complete") && Object.values(save.relationships ?? {}).filter((v) => v >= 50).length >= 5) {
    return ENDINGS.beloved;
  }
  if (athenaAscended && voronDefeated && athenaRel >= 30 && strong) return ENDINGS.good;
  if (voronDefeated) return ENDINGS.neutral;
  return ENDINGS.bad;
}
