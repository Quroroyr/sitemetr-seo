/**
 * Groups of search queries worth a page section of their own.
 *
 * Each regex group is written once, in syntax both JavaScript and RE2 (the
 * engine behind Search Console's «Пользовательское (регулярное выражение)»
 * filter) read the same way, so the app's grouping and the copied filter
 * find the same queries. Two rules keep it portable:
 * - no `\b`: in RE2 it is an ASCII word boundary and never fires inside
 *   Cyrillic, so word edges are spelled `(^|\s)` and `(\s|$)`;
 * - no lookarounds or backreferences, which RE2 lacks.
 * Stems without a right edge (`инструкци`) are deliberate: they catch every
 * case ending.
 */

import type { QueryRow } from './parse.js';

export interface QueryFilter {
  id: string;
  title: string;
  /** What the group finds, one line */
  finds: string;
  /** What to do with what it finds */
  action: string;
  /** The Search Console regex, when the group is a regex */
  regex?: string;
  /** For the groups that are about numbers rather than words */
  test?: (row: QueryRow) => boolean;
}

const CITIES =
  'москв|мск|спб|санкт-петербург|петербург|питер|новосибирск|екатеринбург|казан[ьи]|нижн[а-я]* новгород|челябинск|самар|омск|ростов|уф[аеы]|красноярск|воронеж|перм[ьи]|волгоград|краснодар|сочи|владивосток|хабаровск|иркутск|тюмен|калининград|ярославл|минск|алмат|астан';

export const QUERY_FILTERS: QueryFilter[] = [
  {
    id: 'questions',
    title: 'Вопросы',
    finds: 'Запросы, заданные вопросом: как, что, где, почему, сколько, можно ли…',
    action: 'Вынесите вопрос в подзаголовок H2 или в блок FAQ и сразу под ним дайте короткий прямой ответ.',
    regex:
      '^(как|что|где|когда|почему|зачем|сколько|какой|какая|какое|какие|каким|какую|кто|чем|чего|куда|откуда|who|what|when|where|why|how|which|can|does|is|are)(\\s|$)|\\sли(\\s|$)',
  },
  {
    id: 'howto',
    title: 'Инструкции',
    finds: 'Как сделать, выбрать, настроить; инструкции, способы, «своими руками»',
    action: 'Ответьте пошаговой инструкцией: нумерованный список, по шагу на пункт, при возможности — фото или видео.',
    regex:
      '(^|\\s)как (сделать|выбрать|настроить|установить|подключить|починить|убрать|удалить|приготовить|найти|получить|оформить|рассчитать)|инструкци|пошагов|руководств|своими руками|(^|\\s)способ|how to|guide|tutorial',
  },
  {
    id: 'definitions',
    title: 'Что это такое',
    finds: 'Определения: что такое, что значит, расшифровка',
    action: 'Дайте определение в первом абзаце одним-двумя предложениями: такие ответы попадают в быстрые ответы и в AI-поиск.',
    regex: 'что такое|что значит|что означает|определени|расшифровк|what is|meaning of',
  },
  {
    id: 'problems',
    title: 'Проблемы и ошибки',
    finds: 'Не работает, ошибка, что делать, почему не…',
    action: 'Сделайте раздел «Частые проблемы»: причина — решение, по одной проблеме на подзаголовок.',
    regex:
      'не работает|не включается|не запускается|не грузится|не открывается|не видит|ошибк|сломал|что делать|почему не|(^|\\s)проблем|not working|error|(^|\\s)fix(\\s|$)',
  },
  {
    id: 'compare',
    title: 'Сравнение и выбор',
    finds: 'Что лучше, или, отличия, рейтинги, отзывы',
    action: 'Добавьте таблицу сравнения и честный вывод «кому что подойдёт»; отзывы — с датой и именем.',
    regex:
      '(^|\\s)(или|vs|против)\\s|сравнени|отлич(ие|ия|ается)|разниц|что лучше|(^|\\s)лучш|(^|\\s)топ(\\s|$|-)|рейтинг|отзыв|(^|\\s)(best|top|review)',
  },
  {
    id: 'commercial',
    title: 'Купить и цены',
    finds: 'Купить, цена, стоимость, заказать, доставка, недорого',
    action: 'Покажите цену и кнопку заказа на первом экране; если цены нет на странице, этот запрос она не удержит.',
    regex:
      '(^|\\s)(купить|куплю|цен[аыуе]|стоимост|сколько стоит|заказать|недорог|дешев|прайс|доставк|оптом|в наличии|скидк|аренд|buy|price|cost)',
  },
  {
    id: 'local',
    title: 'Город и «рядом»',
    finds: 'Запросы с городом, «рядом», адресом, телефоном, режимом работы',
    action: 'Проверьте, что город, адрес и телефон есть текстом на странице, и что организация добавлена в Яндекс Бизнес и Google.',
    regex: `(^|\\s)(рядом|поблизости|недалеко|около меня|адрес|на карте|режим работы|телефон|near me|${CITIES})`,
  },
  {
    id: 'prompts',
    title: 'Похоже на запрос к нейросети',
    finds: 'Подскажи, объясни, помоги, напиши, посоветуй — так спрашивают ИИ-ассистента',
    action: 'Такие запросы — признак того, что люди ждут развёрнутого совета: дайте его на странице прямо, без воды.',
    regex: '^(подскажи|подскажите|объясни|помоги|напиши|расскажи|составь|сравни|придумай|посоветуй|give me|show me|help me|explain)(\\s|$)',
  },
  {
    id: 'long',
    title: 'Длинные запросы',
    finds: 'Четыре слова и больше: длинный хвост, где проще подняться',
    action: 'Ищите в них уточнения, которых нет на странице, и добавляйте их абзацами или подзаголовками.',
    regex: '^\\S+(\\s+\\S+){3,}$',
  },
  {
    id: 'very-long',
    title: 'Очень конкретные',
    finds: 'Семь слов и больше: почти готовые вопросы',
    action: 'Часто это готовая тема для отдельной статьи или ответа в FAQ.',
    regex: '^\\S+(\\s+\\S+){6,}$',
  },
  {
    id: 'near-top',
    title: 'Почти в топе',
    finds: 'Средняя позиция от 4 до 15: страница уже рядом с первой тройкой',
    action: 'Самые дешёвые клики: доработайте заголовок и текст под запрос, добавьте внутренние ссылки на эту страницу.',
    test: (row) => row.position !== null && row.position >= 4 && row.position <= 15,
  },
  {
    id: 'low-ctr',
    title: 'Много показов, мало кликов',
    finds: 'От 100 показов, а CTR втрое ниже обычного для такой позиции',
    action: 'Перепишите title и description: в выдаче страницу видят, но не выбирают.',
    // A third, not a half: the yardstick comes from studies of clean result
    // pages, and real CTR runs lower under ads and answer blocks, so a half
    // flagged most of a typical export.
    test: (row) =>
      row.position !== null && row.impressions >= 100 && row.clicks / row.impressions < expectedCtr(row.position) / 3,
  },
];

/**
 * A typical organic CTR by position, rounded from public click-through
 * studies of desktop and mobile results. It is only a yardstick for "fewer
 * clicks than this position usually gets", not a forecast.
 */
const CTR_BY_POSITION = [0.28, 0.155, 0.11, 0.08, 0.065, 0.05, 0.04, 0.033, 0.028, 0.025];

export function expectedCtr(position: number): number {
  const rounded = Math.max(1, Math.round(position));
  if (rounded <= 10) return CTR_BY_POSITION[rounded - 1];
  if (rounded <= 20) return 0.01;
  return 0.003;
}

const compiled = new Map<string, RegExp>();

export function matchesFilter(filter: QueryFilter, row: QueryRow): boolean {
  if (filter.test) return filter.test(row);
  if (!filter.regex) return false;
  let re = compiled.get(filter.id);
  if (!re) {
    re = new RegExp(filter.regex, 'iu');
    compiled.set(filter.id, re);
  }
  return re.test(row.query);
}
