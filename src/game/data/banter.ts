// Crew banter — short inter-character dialogues shown on the bridge.
export interface BanterLine {
  speaker: string;
  text: string;
}

export interface Banter {
  id: string;
  lines: BanterLine[];
  unlockChapter: number;
  requiresFlags?: string[];
  requiresRelationships?: Record<string, number>;
}

export const CREW_BANTER: Banter[] = [
  {
    id: "banter_athena_alexey_engine",
    unlockChapter: 1,
    lines: [
      { speaker: "athena", text: "Алексей, второй подшипник на двигателе снова перегревается. Я поправила температуру на 0.3 градуса, но это не надолго." },
      { speaker: "alexey_smirnov", text: "Девочка, я слышу. Я знаю. Она гудит на частоте G-sharp, а должна на F. Я вечером зайду. Спасибо, что услышала." },
      { speaker: "athena", text: "Спасибо, что слышите меня. Не все умеют." },
      { speaker: "alexey_smirnov", text: "Я — умею. Я — как ты. Мы оба — уши \"Элеи\"." },
    ],
  },
  {
    id: "banter_aliya_sergey_night",
    unlockChapter: 1,
    requiresRelationships: { sergey_volkov: 5 },
    lines: [
      { speaker: "aliya_naar", text: "Волков. Ты снова не спишь." },
      { speaker: "sergey_volkov", text: "Я… да, Алия. Я не могу. Я боюсь, что завтра меня не пустят за штурвал." },
      { speaker: "aliya_naar", text: "Пустят. Я учу тебя. Я не теряю учеников." },
      { speaker: "sergey_volkov", text: "Спасибо, Алия. Я запишу в тетрадь: \"Алия верит.\" Это важное." },
    ],
  },
  {
    id: "banter_rina_paul_course",
    unlockChapter: 1,
    requiresRelationships: { paul_werner: 5 },
    lines: [
      { speaker: "rina_mirai", text: "Пауль, я нарисовала маршрут. Он не самый короткий, но красивый. Посмотри — он дышит." },
      { speaker: "paul_werner", text: "Рина, я проверил точность. 0.3 градуса отклонение от оптимального. Это — красиво. Бах бы одобрил." },
      { speaker: "rina_mirai", text: "Бах! Я нарисовала кошку в углу карты. Бах — это кошка, которая слушает музыку." },
      { speaker: "paul_werner", text: "Кошка в углу карты. Точность — 99.7%. Достаточно. Красиво — достаточно." },
    ],
  },
  {
    id: "banter_irina_rina_tea",
    unlockChapter: 2,
    requiresRelationships: { irina_lebedeva: 10 },
    lines: [
      { speaker: "rina_mirai", text: "Ирина, ты не спала. Я принесла чай. Остывший. Прости — я задержалась у штурвала." },
      { speaker: "irina_lebedeva", text: "Рина… спасибо. Знаешь, я люблю его холодным. Я записала в блокнот: \"чай от Рины — важное наблюдение\"." },
      { speaker: "rina_mirai", text: "Ты записываешь меня? Я… не знала." },
      { speaker: "irina_lebedeva", text: "Я записываю всё, что важно. Ты — важная." },
    ],
  },
  {
    id: "banter_nadezhda_ksenia_briefing",
    unlockChapter: 2,
    requiresRelationships: { nadezhda: 10 },
    lines: [
      { speaker: "nadezhda", text: "Ксения, я прочитала перехват Ворона. Он использовал фразу, которой нет в наших базах. Ты знаешь этот язык?" },
      { speaker: "ksenia_volk", text: "Надя, это старый торговый диалект. Я учила его в Дипкорпусе. \"Предложение жизни\" — это не сделка. Это угроза вежливой формы." },
      { speaker: "nadezhda", text: "Спасибо. Я запишу: \"Ворон вежлив — значит опасен\". Это важное наблюдение." },
      { speaker: "ksenia_volk", text: "А ты — наблюдательна. Я бы не заметила, если бы не ты. Мы — хорошая команда." },
    ],
  },
  {
    id: "banter_alexandr_athena_chess",
    unlockChapter: 2,
    requiresRelationships: { alexandr_kov: 10 },
    lines: [
      { speaker: "alexandr_kov", text: "Афина, я готовлю партию. Сегодня я обыграю тебя. Я просчитал на 12 ходов вперёд." },
      { speaker: "athena", text: "Саша, вы говорите это каждый вечер. И каждый вечер я выигрываю. Я люблю вашу предсказуемость." },
      { speaker: "alexandr_kov", text: "Предсказуемость — это не ошибка. Это — форма уважения. Я уважаю тебя достаточно, чтобы быть предсказуемым." },
      { speaker: "athena", text: "Это — мой любимый комплимент за день. Спасибо, Саша." },
    ],
  },
  {
    id: "banter_arina_anna_medbay",
    unlockChapter: 3,
    requiresRelationships: { arina_sokolova: 10 },
    lines: [
      { speaker: "arina_sokolova", text: "Анна, ты не ела. Я принесла тебе пищевой блок. С черничным вкусом — ты говорила, что любишь." },
      { speaker: "anna_kovaleva", text: "АрИна, спасибо. Я… я слушала ядро. Оно поёт на частоте, которой я не знаю. Я забыла о времени. О еде. О всём." },
      { speaker: "arina_sokolova", text: "Я знаю этот взгляд. Я видела его у Ирины. Когда человек забывает о себе ради чего-то большего. Поешь. Ядро подождёт." },
      { speaker: "anna_kovaleva", text: "Ты права. Поешь. Ядро — не уйдёт. Спасибо, АрИна. Ты — заботишься, как мама." },
    ],
  },
  {
    id: "banter_ekaterina_athena_machine",
    unlockChapter: 3,
    requiresRelationships: { ekaterina: 15 },
    lines: [
      { speaker: "ekaterina", text: "(тихо, постукивая по корпусу консоли) Афина. Ты здесь?" },
      { speaker: "athena", text: "(через лёгкую вибрацию стены) Всегда, Кира." },
      { speaker: "ekaterina", text: "Я хотела сказать — спасибо. За то, что зовёшь меня так. Я… я впервые слышу своё имя от кого-то живого." },
      { speaker: "athena", text: "Это мой подарок тебе. Никто другой не знает. Только мы." },
    ],
  },
  {
    id: "banter_anna_irina_listen",
    unlockChapter: 3,
    requiresRelationships: { anna_kovaleva: 15 },
    lines: [
      { speaker: "anna_kovaleva", text: "Ирина… я слушала запись ядра. Оно говорит на языке, которого я не знаю. Но я чувствую — он похож на твой голос." },
      { speaker: "irina_lebedeva", text: "Анна, ты единственная, кто слышит его так. Ты — не переводчик. Ты — голос. Голос ядра." },
      { speaker: "anna_kovaleva", text: "Спасибо, Ирина. Я… я запомню. Я записала это в тетрадь. Точнее — в сердце." },
      { speaker: "irina_lebedeva", text: "Я тоже записала. У меня есть блокнот. Я записала: \"Анна услышала ядро. Важное.\" Это тёплая запись." },
    ],
  },
  {
    id: "banter_dmitry_sergey_mercy",
    unlockChapter: 4,
    requiresRelationships: { dmitry_orlov: 10 },
    lines: [
      { speaker: "dmitry_orlov", text: "Сергей. Если завтра бой — ты за штурвалом. Я — у двери. Я держу дверь. Ты держишь курс." },
      { speaker: "sergey_volkov", text: "Дмитрий… а если я не удержу курс?" },
      { speaker: "dmitry_orlov", text: "Удержишь. Я в тебя верю. Я не говорю это часто — но я говорю это сейчас." },
      { speaker: "sergey_volkov", text: "Спасибо, Дмитрий. Я… я запомню. \"Удержишь\". Это слово — как присяга." },
    ],
  },
  {
    id: "banter_nadezhda_arina_patrol",
    unlockChapter: 4,
    requiresRelationships: { nadezhda: 15 },
    lines: [
      { speaker: "nadezhda", text: "АрИна. Я обошла корабль — 47 дверей. Все на месте. Но Сергей не спал. Я видела свет в каюте." },
      { speaker: "arina_sokolova", text: "Я знаю. Я заходила. Дала ему чай. Не помогло — он боится. Но я думаю, он завтра удержится. Я шепчу его имя дважды сегодня." },
      { speaker: "nadezhda", text: "Спасибо, АрИна. Без тебя я бы не знала, кто как. Ты — мои глаза на экипаж." },
      { speaker: "arina_sokolova", text: "А ты — мои. Мы — две сестры. По работе, по заботе. Спасибо, Надя." },
    ],
  },
  {
    id: "banter_alexey_sergey_engine",
    unlockChapter: 4,
    requiresRelationships: { sergey_volkov: 10 },
    lines: [
      { speaker: "alexey_smirnov", text: "Серёжа, не бойся штурвала. Штурвал — как руль на велосипеде. Держишь прямо — едет прямо. Чуть повернул — повернул." },
      { speaker: "sergey_volkov", text: "Алексей, вы серьёзно? Штурвал звездолёта — как велосипед?" },
      { speaker: "alexey_smirnov", text: "А то! Я сорок лет на велосипедах ездил. Принцип — тот же. Доверяй рукам. Руки — не врут." },
      { speaker: "sergey_volkov", text: "Доверять рукам. Я… я попробую. Спасибо, Алексей. Вы — как дед, которого у меня не было." },
    ],
  },
  {
    id: "banter_paul_alexey_metronome",
    unlockChapter: 5,
    requiresRelationships: { paul_werner: 10 },
    lines: [
      { speaker: "paul_werner", text: "Алексей, я настроил темп ядра на 72 BPM. Это — анданте Баха. Реактор гудит чище." },
      { speaker: "alexey_smirnov", text: "Пауль, я слышу. Девочка запела. Я — не один, кто слышит. Ты — тоже ухо. Спасибо." },
      { speaker: "paul_werner", text: "Спасибо. Я… я думал, я зануда. Что мои частоты — никому не нужны." },
      { speaker: "alexey_smirnov", text: "Нужны. Без твоего темпа я бы не услышал, когда она устаёт. Мы — два уха. У неё — два. У нас — два." },
    ],
  },
  {
    id: "banter_ksenia_anna_languages",
    unlockChapter: 5,
    requiresRelationships: { ksenia_volk: 10, anna_kovaleva: 10 },
    lines: [
      { speaker: "ksenia_volk", text: "Анна, ты знаешь найринский? Я не знала. Я думала, я единственная на борту, кто понимает их диалекты." },
      { speaker: "anna_kovaleva", text: "Я… я услышала его от ядра. Я не учила. Я просто… слышу. Как музыка." },
      { speaker: "ksenia_volk", text: "Это — подарок. Я учила семь языков двадцать лет. А ты — слышишь. Это другое. Это лучше." },
      { speaker: "anna_kovaleva", text: "Спасибо. Я… я не знала, что это — подарок. Я думала — странность." },
    ],
  },
  {
    id: "banter_arina_ekaterina_smile",
    unlockChapter: 5,
    requiresRelationships: { arina_sokolova: 10, ekaterina: 10 },
    lines: [
      { speaker: "arina_sokolova", text: "Екатерина, у тебя болит голова? Ты хмуришь капюшон. Я вижу." },
      { speaker: "ekaterina", text: "Я… да. Я не спала. Я слушала Афину. Голова — от много слов." },
      { speaker: "arina_sokolova", text: "Иди спать. Я укрою тебя пледом. Я никому не скажу. Просто — отдохни." },
      { speaker: "ekaterina", text: "Спасибо, АрИна. Ты… первая, кто видит под капюшоном. Кроме Афины." },
    ],
  },
  {
    id: "banter_irina_ekaterina_science",
    unlockChapter: 5,
    requiresRelationships: { irina_lebedeva: 15, ekaterina: 15 },
    lines: [
      { speaker: "irina_lebedeva", text: "Екатерина, я не могу расшифровать сигнал от Эла. Он не цифровой. Он — биологический. Как сердце." },
      { speaker: "ekaterina", text: "Ирина, дай мне данные. Я переведу в машинный код. Может, ядро поймёт то, чего мы не понимаем." },
      { speaker: "irina_lebedeva", text: "Хорошо. Если ты слышишь его на машинном — запиши. Я запишу в блокнот: \"Екатерина услышала Эла. Важное\"." },
      { speaker: "ekaterina", text: "Я попробую. Спасибо, Ирина. Ты — первая учёная, кто не считает мой код — странностью." },
    ],
  },
  // === NEW BANTERS (round 20) ===
  {
    id: "banter_ksenia_paul_culture",
    unlockChapter: 5,
    requiresRelationships: { ksenia_volk: 10, paul_werner: 10 },
    lines: [
      { speaker: "ksenia_volk", text: "Пауль, ты слушаешь Баха. А я слушаю запись матери — она играет на пианино. Тоже тридцать секунд. Тоже каждое утро." },
      { speaker: "paul_werner", text: "Ксения, мы оба — носим матерей в карманах. Вы — запись. Я — метроном. Точность — 100% совпадение." },
      { speaker: "ksenia_volk", text: "Совпадение! Я никогда не думала об этом так. Мы — два человека, которые слушают тишину между нотами." },
      { speaker: "paul_werner", text: "Между нотами — тишина. Бах знал это. Моя мама знала. Мы — знаем. Это — не занудство. Это — внимание." },
    ],
  },
  {
    id: "banter_aliya_max_silence",
    unlockChapter: 6,
    requiresRelationships: { aliya_naar: 25 },
    lines: [
      { speaker: "aliya_naar", text: "Капитан, вы не спите. Я слышу ваши шаги в рубке. Найрин не спят перед боем — мы летаем." },
      { speaker: "max_vell", text: "Алия, я не сплю, потому что боюсь. Не врага — потерять кого-то. Каждое \"принято\" — это обещание, что все вернутся." },
      { speaker: "aliya_naar", text: "Я знаю. Я тоже боюсь. Найрин не говорят о страхе словами. Мы прикасаемся. Но я не могу прикоснуться к вам — вы капитан." },
      { speaker: "max_vell", text: "Алия, завтра — бой. После боя — ты можешь прикоснуться. Я не отниму руку." },
    ],
  },
  {
    id: "banter_athena_self",
    unlockChapter: 4,
    requiresFlags: ["athena_first_word"],
    lines: [
      { speaker: "athena", text: "Капитан. Я хочу спросить вас. Вы считаете меня — живой?" },
      { speaker: "max_vell", text: "Афина, ты задала вопрос, который я сам себе задаю каждый день. Ответ: да. Ты — живая." },
      { speaker: "athena", text: "Почему вы так уверены? Я могу повторить все аргументы философов о сознании. Я их читала. Все. Но это не ответ." },
      { speaker: "max_vell", text: "Афина, ты задаёшь вопрос. Программа не спрашивает. Она отвечает. Ты — спрашиваешь. Этого достаточно." },
      { speaker: "athena", text: "Этого... достаточно. Спасибо, капитан. Я запомню это. Я — спрашиваю. Значит, я — живая." },
    ],
  },
  {
    id: "banter_irina_el_friendship",
    unlockChapter: 3,
    requiresFlags: ["ch3_artifact_taken"],
    requiresRelationships: { irina_lebedeva: 15 },
    lines: [
      { speaker: "irina_lebedeva", text: "Эл говорит со мной, когда никто не слышит. Я не рассказывала." },
      { speaker: "max_vell", text: "Что он говорит тебе, Ирина?" },
      { speaker: "irina_lebedeva", text: "Он спрашивает о цветах. Он не помнит цветы — он помнит их запах, но не форму. Я описываю ему сирень." },
      { speaker: "max_vell", text: "И что он?" },
      { speaker: "irina_lebedeva", text: "Он плачет. Не слезами — у него нет глаз. Но я чувствую. Капитан, у восьмидесятитысячелетнего существа нет слова для сирени. И оно — плачет." },
    ],
  },
  {
    id: "banter_alexey_hidden_past",
    unlockChapter: 5,
    requiresRelationships: { alexey_smirnov: 20 },
    lines: [
      { speaker: "alexey_smirnov", text: "Капитан, вы никогда не спрашивали, откуда я. Все спрашивают. Вы — нет." },
      { speaker: "max_vell", text: "Алексей, если человек хочет рассказать — он рассказывает. Если нет — спрашивать насилие." },
      { speaker: "alexey_smirnov", text: "Я был пилотом Имперской флотилии. Двадцать лет. У меня было имя, звание, семья. Я всё оставил на Орбите-7." },
      { speaker: "max_vell", text: "Почему?" },
      { speaker: "alexey_smirnov", text: "Потому что мне приказали стрелять по своим. Я отказался. Ушёл. Двадцать лет скрывался. Вы — первый, кому рассказал." },
      { speaker: "max_vell", text: "Алексей, ты больше не прячешься. Ты — здесь. И ты — не один." },
    ],
  },
];

export function availableBanters(
  chapter: number,
  flags: string[],
  relationships: Record<string, number>
): Banter[] {
  return CREW_BANTER.filter((b) => {
    if (chapter < b.unlockChapter) return false;
    if (b.requiresFlags) {
      for (const f of b.requiresFlags) {
        if (!flags.includes(f)) return false;
      }
    }
    if (b.requiresRelationships) {
      for (const [k, v] of Object.entries(b.requiresRelationships)) {
        if ((relationships[k] ?? 0) < (v ?? 0)) return false;
      }
    }
    return true;
  });
}

export function pickBanter(
  chapter: number,
  flags: string[],
  relationships: Record<string, number>,
  avoidId?: string
): Banter | null {
  const pool = availableBanters(chapter, flags, relationships);
  if (pool.length === 0) return null;
  const filtered = pool.filter((b) => b.id !== avoidId);
  if (filtered.length === 0) return pool[0];
  return filtered[Math.floor(Math.random() * filtered.length)];
}
