import { plural, type MessagePattern, type MessageTable } from '../index.js';
import { MESSAGES_RU_SHARED } from './messages-shared.js';

function translatePart(text: string, patterns: readonly MessagePattern[]): string {
  for (const [pattern, replacement] of patterns) {
    const match = pattern.exec(text);
    if (match?.[0] !== text) continue;
    return typeof replacement === 'string'
      ? text.replace(pattern, replacement)
      : replacement(...match.slice(1).map((part) => part ?? ''));
  }
  return text;
}

function translateRequestError(error: string): string {
  return translatePart(error, MESSAGES_RU_SHARED['*']);
}

function translateParts(text: string, patterns: readonly MessagePattern[], separator: string | RegExp = '; '): string {
  return text.split(separator)
    .map((part) => translatePart(part, patterns))
    .join(separator === ', ' ? ', ' : '. ');
}

const invalidLinkIssues: readonly MessagePattern[] = [
  [/^(\d+) empty href\(s\)$/, '$1 пустых href'],
  [/^(\d+) javascript: link\(s\)$/, (count) => `${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} javascript:`],
  [/^(\d+) malformed URL\(s\)$/, '$1 некорректных URL'],
];

const invalidContactLinks: readonly MessagePattern[] = [
  [/^(\d+) invalid phone number\(s\)$/, (count) => `${count} ${plural(count, 'некорректный номер', 'некорректных номера', 'некорректных номеров')} телефона`],
  [/^(\d+) invalid email\(s\)$/, (count) => `${count} ${plural(count, 'некорректный адрес', 'некорректных адреса', 'некорректных адресов')} электронной почты`],
];

const externalLinkAside: readonly MessagePattern[] = [
  [/^(\d+) could not be verified$/, 'не удалось проверить: $1'],
  [/^(\d+) not checked$/, 'пропущено: $1'],
];

function translateExternalLinkAside(aside: string): string {
  return aside ? ` (${translateParts(aside.slice(2, -1), externalLinkAside, ', ')})` : '';
}

const viewportIssues: readonly MessagePattern[] = [
  [/^width directive is missing$/, 'нет width'],
  [/^initial-scale directive is missing$/, 'нет initial-scale'],
  [/^initial-scale is set to "(.*)" instead of 1$/s, 'initial-scale задано как «$1» вместо 1'],
  [/^minimum-scale is set, limiting how far users can zoom out$/, 'minimum-scale ограничивает уменьшение масштаба'],
];

const queryIssues: readonly MessagePattern[] = [
  [/^query string contains (\d+) '\?' characters$/, (count) => `в строке запроса ${count} ${plural(count, 'символ', 'символа', 'символов')} '?'`],
  [/^repetitive parameter\(s\): (.*)$/s, 'повторяются параметры: $1'],
];

const cssSizeIssues: readonly MessagePattern[] = [
  [/^(\d+) external CSS files \(recommended: <=(\d+)\)$/, (count, limit) => `${count} ${plural(count, 'внешний файл', 'внешних файла', 'внешних файлов')} CSS (рекомендуется <=${limit})`],
  [/^(\d+) external CSS files - consider bundling$/, (count) => `${count} ${plural(count, 'внешний файл', 'внешних файла', 'внешних файлов')} CSS, объедините их`],
  [/^(\d+(?:\.\d+)?)KB inline CSS \(recommended: <(\d+)KB\)$/, 'встроенный CSS занимает $1KB (рекомендуется <$2KB)'],
  [/^(\d+(?:\.\d+)?)KB inline CSS - consider extracting to external file$/, 'встроенный CSS занимает $1KB, вынесите его в отдельный файл'],
];

const cssSizeSummary: readonly MessagePattern[] = [
  [/^No external CSS files \(inline only\)$/, 'есть только встроенный CSS'],
  [/^(\d+) CSS file\(s\), (\d+(?:\.\d+)?)KB inline$/, (count, size) => `${count} ${plural(count, 'файл', 'файла', 'файлов')} CSS, встроенный CSS занимает ${size}KB`],
];

const domSizeIssues: readonly MessagePattern[] = [
  [/^([\d,.\s]+) DOM nodes \(recommended: <(\d+)\)$/, 'узлов DOM: $1 (рекомендуется <$2)'],
  [/^Max depth: (\d+) \(recommended: <(\d+)\)$/, 'максимальная глубина: $1 (рекомендуется <$2)'],
  [/^Max depth: (\d+) at (.*)$/s, 'максимальная глубина: $1 у $2'],
  [/^Max children: (\d+) in (.*) \(recommended: <(\d+)\)$/s, 'максимум дочерних элементов: $1 у $2 (рекомендуется <$3)'],
];

const fontIssues: readonly MessagePattern[] = [
  [/^(\d+) Google Fonts URL\(s\) missing display=swap$/, 'У $1 URL Google Fonts отсутствует display=swap'],
  [/^(\d+) @font-face rule\(s\) missing font-display$/, (count) => `Нет font-display в ${count} ${plural(count, 'правиле', 'правилах', 'правилах')} @font-face`],
  [/^No fonts are preloaded$/, 'Нет предварительной загрузки шрифтов'],
  [/^(\d+) font files loaded \(consider reducing\)$/, (count) => `Загружается ${count} ${plural(count, 'файл', 'файла', 'файлов')} шрифтов. Сократите их число`],
];

const fontOptimizations: readonly MessagePattern[] = [
  [/^(\d+) preloaded$/, (count) => `предварительно загружается ${count} ${plural(count, 'шрифт', 'шрифта', 'шрифтов')}`],
  [/^font-display set$/, 'задан font-display'],
];

const lcpIssues: readonly MessagePattern[] = [
  [/^no preload or fetchpriority$/, 'нет preload и fetchpriority'],
  [/^missing preload$/, 'нет preload'],
  [/^missing fetchpriority="high"$/, 'нет fetchpriority="high"'],
];

const renderBlockingIssues: readonly MessagePattern[] = [
  [/^(\d+) render-blocking scripts in <head>$/, (count) => `В <head> отрисовку блокирует ${count} ${plural(count, 'скрипт', 'скрипта', 'скриптов')}`],
  [/^(\d+) script\(s\) in <head> without async\/defer$/, (count) => `В <head> ${count} ${plural(count, 'скрипт', 'скрипта', 'скриптов')} без async/defer`],
  [/^(\d+) large inline script\(s\) \((\d+)KB total\)$/, (count, size) => `${count} ${plural(count, 'крупный встроенный скрипт', 'крупных встроенных скрипта', 'крупных встроенных скриптов')} (всего ${size}KB)`],
  [/^(\d+) CSS files in head \(consider critical CSS extraction\)$/, (count) => `В <head> ${count} ${plural(count, 'файл', 'файла', 'файлов')} CSS. Выделите критический CSS`],
];

const unmeasuredSize = /^(\d+) (text asset|uncompressed text asset|image|stylesheet|script)\(s\) were served without a content-length header \(chunked or HTTP\/2 framing\), so their size could not be read$/;
const assetNames: ReadonlyMap<string, readonly [string, string, string]> = new Map([
  ['text asset', ['текстового ресурса', 'текстовых ресурсов', 'текстовых ресурсов']],
  ['uncompressed text asset', ['несжатого текстового ресурса', 'несжатых текстовых ресурсов', 'несжатых текстовых ресурсов']],
  ['image', ['изображения', 'изображений', 'изображений']],
  ['stylesheet', ['таблицы стилей', 'таблиц стилей', 'таблиц стилей']],
  ['script', ['скрипта', 'скриптов', 'скриптов']],
]);

function translateUnmeasuredSize(reason: string): string {
  const match = unmeasuredSize.exec(reason);
  if (match?.[0] !== reason) return reason;
  const [, count, kind] = match;
  const forms = assetNames.get(kind);
  if (!forms) return reason;
  return `нет заголовка content-length (передача блоками или кадрами HTTP/2), поэтому не удалось определить размер ${count} ${plural(count, ...forms)}`;
}

function translateAssetList(list: string): string {
  // URL берётся целиком. Уточнения о размере и кэше идут после пробела.
  const [assets, extra = ''] = list.split(/; (?=(?:additionally, \d+ |\d+ image\(s\) also exceed 100KB: ))/, 2);
  const translated = assets
    .replace(/ \(no cache-control\)(?=, |$)/g, ' (без cache-control)')
    .replace(/ \((\d+) bytes\)(?=, |$)/g, (_match, count: string) => ` (${count} ${plural(count, 'байт', 'байта', 'байтов')})`)
    .replace(/, and (\d+) more$/, ' и ещё $1');
  if (extra.startsWith('additionally, ')) {
    return `${translated}. Кроме того, ${translateUnmeasuredSize(extra.slice('additionally, '.length))}`;
  }
  const oversized = /^(\d+) image\(s\) also exceed 100KB: (.*)$/s.exec(extra);
  if (oversized) {
    const [, count, urls] = oversized;
    return `${translated}. Размер выше 100KB у ${count} ${plural(count, 'изображения', 'изображений', 'изображений')}: ${translateAssetList(urls)}`;
  }
  return extra ? `${translated}. ${extra}` : translated;
}

const inlineJsIssues: readonly MessagePattern[] = [
  [/^~(\d+)% whitespace$/, 'около $1% пробельных символов'],
  [/^(\d+) bytes in block comments$/, (count) => `${count} ${plural(count, 'байт', 'байта', 'байтов')} в блочных комментариях`],
];

function translateInlineJsWarning(bytes: string, reasons: string, savings: string): string {
  return `Встроенный JavaScript, вероятно, не минифицирован (${bytes} ${plural(bytes, 'байт', 'байта', 'байтов')}, ${translateParts(reasons, inlineJsIssues, ', ')}). Минификация может сэкономить примерно ${savings} ${plural(savings, 'байт', 'байта', 'байтов')}`;
}

function translateExternalSuspects(count: string, kind: string, bytes: string, urls: string): string {
  const files = kind === 'script'
    ? plural(count, 'внешний скрипт', 'внешних скрипта', 'внешних скриптов')
    : plural(count, 'внешняя таблица стилей', 'внешние таблицы стилей', 'внешних таблиц стилей');
  return `Вероятно, без минификации: ${count} ${files} (признаки: >${bytes} ${plural(bytes, 'байта', 'байтов', 'байтов')} и нет ".min." в URL, содержимое не проверялось): ${translateAssetList(urls)}`;
}

const externalMinification: readonly MessagePattern[] = [
  [/^(\d+) external (script|stylesheet)\(s\) appear unminified \(heuristic: >(\d+) bytes and URL lacks "\.min\." — asset bodies are not inspected\): (.*)$/s, translateExternalSuspects],
];

function minificationMessages(kind: 'script' | 'stylesheet'): readonly MessagePattern[] {
  const css = kind === 'stylesheet';
  const id = css ? 'perf-minify-css' : 'perf-minify-js';
  const label = css ? 'внешних таблиц стилей' : 'внешних скриптов';
  return [
    [
      /^Could not check external (?:script|stylesheet) minification — (.*?their size could not be read)\. (.*)$/s,
      (reason, inline) => `Не удалось проверить минификацию ${label}: ${translateUnmeasuredSize(reason)}. ${translatePart(inline, MESSAGES_RU_B[id])}`,
    ],
    [
      /^((?:Inline|No inline) .*?) — additionally, (\d+ external (?:script|stylesheet)\(s\) appear unminified .*)$/s,
      (inline, external) => `${translatePart(inline, MESSAGES_RU_B[id])}. Кроме того, ${translatePart(external, externalMinification)}`,
    ],
    ...externalMinification,
  ];
}

const schemaFieldIssues: readonly MessagePattern[] = [
  [/^([^:]+): missing recommended fields: (.*)$/s, '$1: отсутствуют рекомендуемые поля $2'],
  [/^([^:]+): missing (?:required fields: )?(.*)$/s, '$1: отсутствуют обязательные поля $2'],
  [/^([^:]+): author should be a Person or Organization object, not a plain string$/, '$1: задайте author объектом Person или Organization'],
  [/^([^:]+): address should be PostalAddress object, not string$/, '$1: задайте address объектом PostalAddress'],
  [/^([^:]+): (address|geo) missing fields: (.*)$/s, '$1: в $2 отсутствуют поля $3'],
];

const breadcrumbIssues: readonly MessagePattern[] = [
  [/^BreadcrumbList \((.*)\) missing itemListElement$/, 'в BreadcrumbList ($1) нет itemListElement'],
  [/^BreadcrumbList missing itemListElement$/, 'в BreadcrumbList нет itemListElement'],
  [/^itemListElement should be an array$/, 'itemListElement должен быть массивом'],
  [/^BreadcrumbList should have at least 2 items, found (\d+)$/, 'в BreadcrumbList должно быть не менее 2 элементов, найдено $1'],
];

const faqIssues: readonly MessagePattern[] = [
  [/^FAQPage: missing mainEntity property$/, 'в FAQPage нет свойства mainEntity'],
  [/^FAQPage: mainEntity must be an array of Questions$/, 'в FAQPage свойство mainEntity должно быть массивом объектов Question'],
  [/^FAQPage: mainEntity array is empty$/, 'в FAQPage массив mainEntity пуст'],
  [/^FAQPage Question #(\d+): @type must be "Question", found "(.*)"$/s, (index, type) => `FAQPage, вопрос #${index}: значение @type должно быть "Question" (${type === 'missing' ? 'отсутствует' : `найдено "${type}"`})`],
  [/^FAQPage Question #(\d+): missing or empty "name" property \(the question text\)$/, 'FAQPage, вопрос #$1: свойство "name" с текстом вопроса отсутствует или пустое'],
  [/^FAQPage Question #(\d+): missing "acceptedAnswer" property$/, 'FAQPage, вопрос #$1: нет свойства "acceptedAnswer"'],
  [/^FAQPage Question #(\d+): acceptedAnswer @type must be "Answer", found "(.*)"$/s, (index, type) => `FAQPage, вопрос #${index}: задайте в acceptedAnswer значение @type "Answer" (${type === 'missing' ? 'отсутствует' : `найдено "${type}"`})`],
  [/^FAQPage Question #(\d+): acceptedAnswer missing or empty "text" property$/, 'FAQPage, вопрос #$1: в acceptedAnswer свойство "text" отсутствует или пустое'],
];

const schemaFormats: readonly MessagePattern[] = [[/^Microdata$/, 'микроданные']];

const productIssues: readonly MessagePattern[] = [
  [/^Product missing offers \(required for rich results\)$/, 'в Product нет offers (обязательно для расширенных результатов поиска)'],
  [/^Product missing: (.*)$/s, 'в Product отсутствуют поля: $1'],
  [/^Offer missing (.*)$/s, 'в Offer нет поля $1'],
];

const ratingIssues: readonly MessagePattern[] = [
  [/^AggregateRating on (.*)$/s, 'AggregateRating указан на странице $1'],
  [/^ratingValue (.*) is not in the visible text$/s, 'в видимом тексте нет значения ratingValue $1'],
];

const reviewIssues: readonly MessagePattern[] = [
  [/^Review missing (itemReviewed|author)$/, 'в Review нет поля $1'],
  [/^(reviewRating|AggregateRating) missing ratingValue$/, 'в $1 нет поля ratingValue'],
  [/^AggregateRating should have reviewCount or ratingCount$/, 'добавьте reviewCount или ratingCount в AggregateRating'],
];

const videoIssues: readonly MessagePattern[] = [
  [/^VideoObject missing: (.*)$/s, 'в VideoObject отсутствуют поля: $1'],
];

const websiteIssues: readonly MessagePattern[] = [
  [/^WebSite missing (name|url)$/, 'в WebSite нет поля $1'],
  [/^SearchAction missing (target|query-input)$/, 'в SearchAction нет поля $1'],
  [/^SearchAction (target|urlTemplate) should include \{search_term_string\}$/, 'в $1 объекта SearchAction должно быть {search_term_string}'],
];

const entityConflicts: readonly MessagePattern[] = [
  [/^(https?:\/\/.*) has (\d+) logos$/is, (id, count) => `у ${id} ${count} ${plural(count, 'логотип', 'логотипа', 'логотипов')}`],
  [/^(https?:\/\/.*) has (\d+) phone numbers$/is, (id, count) => `у ${id} ${count} ${plural(count, 'номер', 'номера', 'номеров')} телефона`],
];

const cspIssues: readonly MessagePattern[] = [
  [/^script-src allows 'unsafe-inline' with no nonce or hash$/, "script-src разрешает 'unsafe-inline' без nonce или хеша"],
  [/^script-src allows any host$/, 'script-src допускает любой хост'],
  [/^no script-src or default-src directive$/, 'нет директивы script-src или default-src'],
  [/^script-src allows 'unsafe-eval'$/, "script-src разрешает 'unsafe-eval'"],
  [/^no object-src directive \(plugins can execute; set object-src 'none'\)$/, "нет object-src. Чтобы запретить выполнение плагинов, задайте object-src 'none'"],
  [/^no base-uri directive \(a <base> injection can redirect relative scripts\)$/, 'нет base-uri. Вставка <base> может изменить адреса скриптов с относительными URL'],
];

const duplicateOgIssues: readonly MessagePattern[] = [
  [/^(og:title|og:description) is shared with (\d+) other page\(s\)$/, (tag, count) => `${tag} совпадает с ${count} ${plural(count, 'другой страницей', 'другими страницами', 'другими страницами')}`],
];

const shareImageFindings: readonly MessagePattern[] = [
  [/^((?:og:image|twitter:image) \S+) cannot be loaded \(HTTP (\d+)\)$/, 'Не удалось загрузить $1 (HTTP $2)'],
  [/^((?:og:image|twitter:image) \S+) is not an image \(served as no content type\)$/, '$1 не распознан как изображение (нет Content-Type)'],
  [/^((?:og:image|twitter:image) \S+) is not an image \(served as (.*)\)$/s, '$1 не является изображением (Content-Type: $2)'],
  [/^((?:og:image|twitter:image) \S+) is (\d+(?:\.\d+)? MB); platforms may refuse images over 5 MB$/, 'Размер $1 — $2. Платформы могут отклонять изображения больше 5 MB'],
  [/^((?:og:image|twitter:image) \S+) is (\d+×\d+); the minimum is (\d+×\d+)$/, 'Размер $1 — $2, минимум — $3'],
  [/^((?:og:image|twitter:image) \S+) is (\d+×\d+); (\d+×\d+) displays sharply$/, 'Размер $1 — $2. Для чёткого отображения используйте $3'],
  [/^((?:og:image|twitter:image) \S+) is (\d+(?:\.\d+)?:1); cards crop to (\d+(?:\.\d+)?:1)$/, 'Пропорции $1 — $2. В карточке изображение обрезается до $3'],
];

const httpStatusLabels: ReadonlyMap<string, string> = new Map([
  ['Bad Request', 'некорректный запрос'],
  ['Payment Required', 'требуется оплата'],
  ['Method Not Allowed', 'метод запрещён'],
  ['Not Acceptable', 'нет подходящего формата ответа'],
  ['Proxy Authentication Required', 'требуется аутентификация на прокси-сервере'],
  ['Request Timeout', 'истекло время ожидания запроса'],
  ['Conflict', 'конфликт'],
  ['Length Required', 'требуется Content-Length'],
  ['Precondition Failed', 'предварительное условие не выполнено'],
  ['Payload Too Large', 'слишком большое тело запроса'],
  ['URI Too Long', 'слишком длинный URI'],
  ['Unsupported Media Type', 'тип содержимого не поддерживается'],
  ['Range Not Satisfiable', 'запрошенный диапазон недоступен'],
  ["I'm a Teapot", 'я чайник'],
  ['Unprocessable Entity', 'не удалось обработать содержимое запроса'],
  ['Locked', 'ресурс заблокирован'],
  ['Unavailable For Legal Reasons', 'доступ закрыт по юридическим причинам'],
  ['Client Error', 'ошибка клиента'],
  ['Internal Server Error', 'внутренняя ошибка сервера'],
  ['Not Implemented', 'не реализовано'],
  ['Bad Gateway', 'некорректный ответ шлюза'],
  ['Service Unavailable', 'служба недоступна'],
  ['Gateway Timeout', 'шлюз не дождался ответа'],
  ['HTTP Version Not Supported', 'версия HTTP не поддерживается'],
  ['Insufficient Storage', 'недостаточно места для хранения'],
  ['Loop Detected', 'обнаружен цикл'],
  ['Unknown Error (Cloudflare)', 'неизвестная ошибка (Cloudflare)'],
  ['Web Server Is Down (Cloudflare)', 'веб-сервер не работает (Cloudflare)'],
  ['Connection Timed Out (Cloudflare)', 'истекло время ожидания подключения (Cloudflare)'],
  ['Origin Is Unreachable (Cloudflare)', 'сервер-источник недоступен (Cloudflare)'],
  ['A Timeout Occurred (Cloudflare)', 'истекло время ожидания (Cloudflare)'],
  ['SSL Handshake Failed (Cloudflare)', 'не удалось установить SSL-соединение (Cloudflare)'],
  ['Invalid SSL Certificate (Cloudflare)', 'некорректный SSL-сертификат (Cloudflare)'],
  ['Server Error', 'ошибка сервера'],
]);

const soft404Indicators: readonly MessagePattern[] = [
  [/^(title|H1) reads "(.*)"$/s, '$1 содержит «$2»'],
  [/^the text says "(.*)"$/s, 'на странице есть текст «$1»'],
];

const urlStructureIssues: readonly MessagePattern[] = [
  [/^URL contains underscores \(use hyphens instead\)$/, 'в URL есть знаки подчёркивания, замените их дефисами'],
  [/^URL contains uppercase letters \(should be lowercase\)$/, 'в URL есть заглавные буквы, замените их строчными'],
  [/^URL path is (\d+) characters \(recommended max: (\d+)\)$/, (count, limit) => `длина пути URL — ${count} ${plural(count, 'символ', 'символа', 'символов')} (рекомендуется не больше ${limit})`],
  [/^Total URL length is (\d+) characters \(max: (\d+)\)$/, (count, limit) => `длина URL — ${count} ${plural(count, 'символ', 'символа', 'символов')} (предел — ${limit})`],
  [/^URL contains multiple consecutive hyphens$/, 'в URL несколько дефисов подряд'],
  [/^URL contains special characters: (.*)$/s, 'в URL есть специальные символы: $1'],
  [/^URL contains server-side file extension \(consider clean URLs\)$/, 'в URL есть расширение серверного файла. Используйте URL без расширения'],
  [/^URL has (\d+) query parameters \(may impact crawlability\)$/, (count) => `в URL ${count} ${plural(count, 'параметр', 'параметра', 'параметров')} запроса. Это может затруднить обход`],
];

function wwwVersion(version: string): string {
  return version === 'www' ? 'с www' : 'без www';
}

/** Переводы сообщений результата по id правила. */
export const MESSAGES_RU_B: MessageTable = {
  // Правовые требования
  'legal-cookie-consent': [
    [/^Cookie consent mechanism detected \((\d+(?:\.\d+)?) indicator(s)?\)$/, (count) => `Обнаружен механизм согласия на использование cookie (${count} ${plural(count, 'признак', 'признака', 'признаков')})`],
    [/^No cookie consent mechanism detected \(tracking scripts present\)$/, 'Механизм согласия на использование cookie не обнаружен, хотя на странице есть скрипты отслеживания'],
    [/^No cookie consent mechanism detected \(may not be required if no tracking cookies used\)$/, 'Механизм согласия на использование cookie не обнаружен. Если сайт не использует cookie для отслеживания, согласие может не требоваться'],
  ],
  'legal-privacy-policy': [
    [/^Privacy policy link found( in footer)? \((\d+(?:\.\d+)?) link(s)?\)$/, (footer, count) => `Найдена ссылка на политику конфиденциальности${footer && ' в подвале сайта'} (${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')})`],
    [/^No privacy policy link found - legally required in many jurisdictions \(GDPR, CCPA\)$/, 'Ссылка на политику конфиденциальности не найдена. Она обязательна во многих юрисдикциях (GDPR, CCPA)'],
  ],
  'legal-terms-of-service': [
    [/^Terms of service link found( in footer)? \((\d+(?:\.\d+)?) link(s)?\)$/, (footer, count) => `Найдена ссылка на условия использования${footer && ' в подвале сайта'} (${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')})`],
    [/^No terms of service link found - recommended for this site type$/, 'Ссылка на условия использования не найдена. Для такого сайта рекомендуется её добавить'],
    [/^No terms of service link found \(may not be required for this site type\)$/, 'Ссылка на условия использования не найдена. Для такого сайта она может не требоваться'],
  ],

  // Ссылки
  'links-anchor-text': [
    [/^Found (\d+(?:\.\d+)?) link\(s\) with non-descriptive anchor text \((.*)% of all links\)$/s, (count, detail) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} с неинформативным текстом (${detail}% всех ссылок)`],
    [/^All (\d+(?:\.\d+)?) link\(s\) have descriptive anchor text$/, 'Информативный текст у всех ссылок ($1)'],
  ],
  'links-broken-fragment': [
    [/^Could not parse page URL, skipping fragment check$/, 'Не удалось разобрать URL страницы, проверка ссылок на фрагменты пропущена'],
    [/^No same-page fragment links found to check$/, 'Ссылок на фрагменты этой страницы нет'],
    [/^Found (\d+(?:\.\d+)?) fragment link\(s\) pointing to non-existent IDs$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} на фрагменты с несуществующими ID`],
    [/^All (\d+(?:\.\d+)?) same-page fragment link\(s\) have matching IDs$/, 'У всех ссылок на фрагменты этой страницы есть соответствующий ID ($1)'],
  ],
  'links-broken-internal': [
    [/^No internal links found to check$/, 'Внутренних ссылок для проверки нет'],
    [/^Found (\d+(?:\.\d+)?) broken internal link\(s\) out of (\d+(?:\.\d+)?)$/, 'Нерабочих внутренних ссылок: $1 из $2'],
    [/^No broken internal links found, but (\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) could not be checked \(timeout or network error\)$/, 'Нерабочих внутренних ссылок не найдено. Не удалось проверить $1 из $2 (истекло время ожидания или произошла сетевая ошибка)'],
    [/^All (\d+(?:\.\d+)?) internal link\(s\) are accessible$/, 'Доступны все проверенные внутренние ссылки ($1)'],
  ],
  'links-chrome-inbound': [
    [/^No inbound links to classify \(orphan rules cover that case\)$/, 'Входящих ссылок для классификации нет. Их отсутствие проверяют правила для страниц без входящих ссылок'],
    [/^Inbound edges do not record whether the link was in site chrome$/, 'В графе входящих ссылок не сохранено их расположение на странице'],
    [/^(\d+(?:\.\d+)?) inbound link\(s\) sit outside site chrome$/, (count) => `За пределами навигации, шапки и подвала найдено ${count} ${plural(count, 'входящая ссылка', 'входящие ссылки', 'входящих ссылок')}`],
    [/^Every inbound internal link is in the nav, header, or footer$/, 'Все входящие внутренние ссылки находятся в навигации, шапке или подвале'],
  ],
  'links-dead-end-pages': [
    [/^Page is a dead-end with no outgoing internal links$/, 'Со страницы нельзя перейти на другие страницы сайта по внутренним ссылкам'],
    [/^Page has (\d+(?:\.\d+)?) outgoing internal link\(s\)$/, 'Исходящие внутренние ссылки на странице: $1'],
  ],
  'links-depth': [
    [/^Click depth needs the site-wide link graph - run with --crawl to measure it$/, 'Для измерения глубины переходов нужен граф ссылок сайта. Запустите аудит с --crawl'],
    [/^Page was not reached by following links from the entry point$/, 'До страницы не удалось дойти по ссылкам с начальной страницы обхода'],
    [/^Crawl entry point \(depth 0\)$/, 'Начальная страница обхода (глубина 0)'],
    [/^Page is (\d+(?:\.\d+)?) clicks from the entry point, well beyond the (\d+(?:\.\d+)?)-click guideline$/, 'Глубина переходов от начальной страницы — $1, значительно выше рекомендации ($2)'],
    [/^Page is (\d+(?:\.\d+)?) clicks from the entry point \(more than the recommended (\d+(?:\.\d+)?)\)$/, 'Глубина переходов от начальной страницы — $1 (рекомендуется не больше $2)'],
    [/^Page is (\d+(?:\.\d+)?) click\(s\) from the entry point$/, (count) => `От начальной страницы до этой — ${count} ${plural(count, 'переход', 'перехода', 'переходов')}`],
  ],
  'links-excessive': [
    [/^Page has (\d+(?:\.\d+)?) links, which exceeds the recommended maximum of (\d+(?:\.\d+)?)$/, (count, detail) => `На странице ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')}, что превышает рекомендуемый максимум ${detail}`],
    [/^Page has (\d+(?:\.\d+)?) links, which is above the recommended (\d+(?:\.\d+)?)$/, (count, detail) => `На странице ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')}, рекомендуется не больше ${detail}`],
    [/^Page has (\d+(?:\.\d+)?) link\(s\), within recommended limits$/, (count) => `На странице ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')}, это в пределах рекомендации`],
  ],
  'links-external-count': [
    [/^Page has (\d+(?:\.\d+)?) external links \(exceeds (\d+(?:\.\d+)?) threshold\)$/, (count, detail) => `На странице ${count} ${plural(count, 'внешняя ссылка', 'внешние ссылки', 'внешних ссылок')} (превышен порог ${detail})`],
    [/^Page has (\d+(?:\.\d+)?) external link\(s\) across (\d+(?:\.\d+)?) domain\(s\)$/, (count, secondCount) => `На странице ${count} ${plural(count, 'внешняя ссылка', 'внешние ссылки', 'внешних ссылок')}. Они ведут на ${secondCount} ${plural(secondCount, 'домен', 'домена', 'доменов')}`],
  ],
  'links-external-valid': [
    [/^External link checking is turned off \(\[external_links\] enabled = false\)$/, 'Проверка внешних ссылок отключена ([external_links] enabled = false)'],
    [/^No external links found to check$/, 'Внешних ссылок для проверки нет'],
    [/^No external link could be verified(.*)$/s, (aside) => `Не удалось проверить ни одной внешней ссылки${translateExternalLinkAside(aside)}`],
    [/^Found (\d+(?:\.\d+)?) broken external link\(s\) out of (\d+(?:\.\d+)?) checked(.*)$/s, (broken, verified, aside) => `Нерабочих внешних ссылок: ${broken} из ${verified} проверенных${translateExternalLinkAside(aside)}`],
    [/^All (\d+(?:\.\d+)?) checked external link\(s\) are reachable(.*)$/s, (verified, aside) => `Все проверенные внешние ссылки доступны (${verified})${translateExternalLinkAside(aside)}`],
  ],
  'links-https-downgrade': [
    [/^Page is not served over HTTPS, check not applicable$/, 'Страница открывается без HTTPS, проверка неприменима'],
    [/^Found (\d+(?:\.\d+)?) link\(s\) from HTTPS page to HTTP URLs$/, (count) => `На HTTPS-странице найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} на HTTP-адреса`],
    [/^All links maintain HTTPS security$/, 'Все ссылки сохраняют защищённое соединение HTTPS'],
  ],
  'links-inbound-all-nofollow': [
    [/^All (\d+(?:\.\d+)?) inbound internal link\(s\) are nofollow, so no link equity reaches this page$/, 'Все входящие внутренние ссылки ($1) помечены nofollow, поэтому не передают ссылочный вес этой странице'],
    [/^(.*) of (\d+(?:\.\d+)?) inbound internal link\(s\) are followed$/s, 'Разрешено переходить по $1 из $2 входящих внутренних ссылок'],
  ],
  'links-inbound-anchor-text': [
    [/^All (\d+(?:\.\d+)?) followed inbound internal link\(s\) use generic anchor text$/, 'У всех входящих внутренних ссылок без nofollow ($1) общий текст без конкретики'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) followed inbound internal link\(s\) use descriptive anchor text$/, 'Информативный текст у $1 из $2 входящих внутренних ссылок без nofollow'],
  ],
  'links-inbound-low-quality': [
    [/^No inbound internal link passes link equity - every link is nofollow or from a page canonicalized elsewhere$/, 'Ни одна входящая внутренняя ссылка не передаёт ссылочный вес: все ссылки помечены nofollow или стоят на страницах, у которых canonical указывает на другой URL'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) inbound internal link\(s\) pass link equity$/, 'Ссылочный вес передают $1 из $2 входящих внутренних ссылок'],
  ],
  'links-inbound-mixed-follow': [
    [/^Receives both followed \((\d+(?:\.\d+)?)\) and nofollowed \((\d+(?:\.\d+)?)\) internal links$/, 'На страницу ведут внутренние ссылки с nofollow ($2) и без nofollow ($1)'],
    [/^All (\d+(?:\.\d+)?) inbound internal link\(s\) are followed$/, 'Все входящие внутренние ссылки ($1) разрешают переход'],
    [/^All inbound internal links are nofollow - covered by links-inbound-all-nofollow$/, 'Все входящие внутренние ссылки помечены nofollow. Это проверяет правило links-inbound-all-nofollow'],
  ],
  'links-internal-present': [
    [/^No internal links found on this page$/, 'На странице нет внутренних ссылок'],
    [/^Found (\d+(?:\.\d+)?) internal link\(s\) on this page$/, (count) => `На странице найдено ${count} ${plural(count, 'внутренняя ссылка', 'внутренние ссылки', 'внутренних ссылок')}`],
  ],
  'links-invalid': [
    [/^No invalid links found$/, 'Некорректных ссылок не найдено'],
    [/^Found (\d+(?:\.\d+)?) invalid link\(s\): (.*)$/s, (count, issues) => `Найдено ${count} ${plural(count, 'некорректная ссылка', 'некорректные ссылки', 'некорректных ссылок')}: ${translateParts(issues, invalidLinkIssues, ', ')}`],
  ],
  'links-local-file': [
    [/^Found (\d+(?:\.\d+)?) local file reference\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} на локальные файлы`],
    [/^No local file references found$/, 'Ссылок на локальные файлы не найдено'],
  ],
  'links-localhost': [
    [/^Found (\d+(?:\.\d+)?) localhost\/development URL reference\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} на localhost или адреса среды разработки`],
    [/^No localhost or development URL references found$/, 'Ссылок на localhost или адреса среды разработки не найдено'],
  ],
  'links-nofollow-appropriate': [
    [/^Found (\d+(?:\.\d+)?) link\(s\) with potentially inappropriate nofollow usage$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')}, где nofollow мог быть указан ошибочно`],
    [/^Nofollow attributes appear to be used appropriately$/, 'Атрибуты nofollow используются уместно'],
  ],
  'links-nofollow-internal': [
    [/^No internal links carry rel=nofollow$/, 'Внутренних ссылок с rel=nofollow нет'],
    [/^(\d+(?:\.\d+)?) internal link\(s\) carry rel=nofollow$/, 'Внутренние ссылки с rel=nofollow: $1'],
  ],
  'links-non-http-protocol': [
    [/^Found (\d+(?:\.\d+)?) link\(s\) using non-HTTP protocol\(s\): (.*)$/s, (count, detail) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} с протоколами, отличными от HTTP и HTTPS: ${detail}`],
    [/^All links use HTTP\(S\), tel: or mailto: protocols$/, 'Все ссылки используют HTTP(S), tel: или mailto:'],
  ],
  'links-onclick': [
    [/^Found (\d+(?:\.\d+)?) element\(s\) using onclick for navigation$/, (count) => `Найдено ${count} ${plural(count, 'элемент', 'элемента', 'элементов')} с навигацией через onclick`],
    [/^No onclick-based navigation detected$/, 'Навигация через onclick не обнаружена'],
  ],
  'links-orphan-pages': [
    [/^Inbound link counting needs the site-wide link graph - run with --crawl to build it$/, 'Для подсчёта входящих ссылок нужен граф ссылок сайта. Запустите аудит с --crawl'],
    [/^Crawl entry point - pages inside the crawl are not expected to link back to where it started$/, 'Это начальная страница обхода, поэтому ссылки на неё с других страниц обхода необязательны'],
    [/^Only one page was crawled, which is too few to measure inbound linking$/, 'В обходе только одна страница. Этого мало, чтобы подсчитать входящие ссылки'],
    [/^No internal links point to this page across (.*) crawled pages$/s, (count) => `На эту страницу не ведёт ни одна внутренняя ссылка с ${count} ${plural(count, 'проверенной страницы', 'проверенных страниц', 'проверенных страниц')}`],
    [/^Only one internal link points to this page, so it is one edit away from being orphaned$/, 'На эту страницу ведёт только одна внутренняя ссылка. Если её удалить, страница останется без входящих ссылок'],
    [/^(\d+(?:\.\d+)?) internal link\(s\) point to this page$/, (count) => `На эту страницу ведёт ${count} ${plural(count, 'внутренняя ссылка', 'внутренние ссылки', 'внутренних ссылок')}`],
  ],
  'links-redirect-chains': [
    [/^No internal links to check$/, 'Внутренних ссылок для проверки нет'],
    [/^All (.*) sampled internal link\(s\) resolve directly$/s, 'Все внутренние ссылки из выборки ($1) открываются без переадресации'],
    [/^Found (\d+(?:\.\d+)?) link\(s\) with 3\+ redirect hops$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} с 3+ перенаправлениями`],
    [/^Found (\d+(?:\.\d+)?) link\(s\) with 1-2 redirect hops$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} с 1–2 перенаправлениями`],
  ],
  'links-tel-mailto': [
    [/^No tel: or mailto: links found$/, 'Ссылок tel: или mailto: не найдено'],
    [/^All (\d+(?:\.\d+)?) tel:\/mailto: link\(s\) have valid formats$/, 'У всех ссылок tel:/mailto: ($1) корректный формат'],
    [/^Found (\d+(?:\.\d+)?) invalid special link\(s\): (.*)$/s, (count, issues) => `Найдено ${count} ${plural(count, 'некорректная ссылка', 'некорректные ссылки', 'некорректных ссылок')} с tel: или mailto: — ${translateParts(issues, invalidContactLinks, ', ')}`],
  ],
  'links-weak-inbound': [
    [/^The crawl entry URL is not judged for a single inbound link$/, 'Ограничение по одной входящей ссылке не применяется к начальной странице обхода'],
    [/^No dofollow inbound links \(orphan rules cover that case\)$/, 'Входящих ссылок без nofollow нет. Этот случай проверяют правила для страниц без входящих ссылок'],
    [/^(\d+(?:\.\d+)?) dofollow inbound links$/, 'Входящие ссылки без nofollow: $1'],
    [/^Only one dofollow internal link points at this page$/, 'На эту страницу ведёт только одна внутренняя ссылка без nofollow'],
  ],
  'links-whitespace-href': [
    [/^Found (\d+(?:\.\d+)?) link\(s\) with whitespace issues in href attributes$/, (count) => `Найдено ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')} с лишними пробельными символами в href`],
    [/^All link hrefs are free of whitespace issues$/, 'В href ссылок нет лишних пробельных символов'],
  ],

  // Мобильная версия
  'mobile-font-size': [
    [/^No mobile font size issues detected$/, 'Проблемы с размером шрифта на мобильных устройствах не обнаружены'],
    [/^Found (\d+(?:\.\d+)?) critical font size issue\(s\) below 12px$/, (count) => `Найдено ${count} ${plural(count, 'критическая проблема', 'критические проблемы', 'критических проблем')} со шрифтом меньше 12px`],
    [/^Found (\d+(?:\.\d+)?) mobile font size issue\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'проблема', 'проблемы', 'проблем')} с размером шрифта на мобильных устройствах`],
  ],
  'mobile-horizontal-scroll': [
    [/^No elements likely to cause horizontal scrolling detected$/, 'Элементов, которые могут вызвать горизонтальную прокрутку, не найдено'],
    [/^(\d+(?:\.\d+)?) element\(s\) may overflow the screen sideways$/, (count) => `За пределы экрана по горизонтали могут выйти ${count} ${plural(count, 'элемент', 'элемента', 'элементов')}`],
    [/^Found (\d+(?:\.\d+)?) potential horizontal scroll issue\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'возможная проблема', 'возможные проблемы', 'возможных проблем')} с горизонтальной прокруткой`],
  ],
  'mobile-image-maps': [
    [/^No image map tags found$/, 'Теги карт изображений не найдены'],
    [/^Page uses image maps \((\d+(?:\.\d+)?) <map>, (\d+(?:\.\d+)?) <area>\); their fixed-coordinate tap targets do not adapt to mobile screens$/, 'Страница использует карты изображений ($1 <map>, $2 <area>). Области нажатия с фиксированными координатами не адаптируются к мобильным экранам'],
  ],
  'mobile-interstitials': [
    [/^No intrusive interstitials detected$/, 'Навязчивых перекрывающих блоков не обнаружено'],
    [/^Found (\d+(?:\.\d+)?) potentially intrusive interstitial\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'блок', 'блока', 'блоков')}, которые могут навязчиво перекрывать страницу`],
    [/^Found (\d+(?:\.\d+)?) potential interstitial issue\(s\)$/, (count) => `Найдено ${count} ${plural(count, 'возможная проблема', 'возможные проблемы', 'возможных проблем')} с перекрывающими блоками`],
  ],
  'mobile-multiple-viewports': [
    [/^No viewport meta tags found \(handled by viewport-present rule\)$/, 'Метатег viewport не найден. Это проверяет правило viewport-present'],
    [/^Single viewport meta tag found \(correct\)$/, 'Найден один метатег viewport'],
    [/^Found (\d+(?:\.\d+)?) viewport meta tags; browsers use the last one, which can cause unexpected behavior$/, (count) => `Найдено ${count} ${plural(count, 'метатег', 'метатега', 'метатегов')} viewport. Браузер использует последний, это может изменить отображение страницы`],
  ],
  'mobile-parity-canonical': [
    [/^Canonical differs - mobile: "(.*)" vs desktop: "(.*)"$/s, (mobile, desktop) => `canonical различается: в мобильной версии «${mobile === '(none)' ? 'отсутствует' : mobile}», в настольной «${desktop === '(none)' ? 'отсутствует' : desktop}»`],
    [/^Canonical URL matches on mobile and desktop$/, 'URL в canonical совпадает в мобильной и настольной версиях'],
  ],
  'mobile-parity-content': [
    [/^Too little content to assess parity$/, 'Слишком мало контента, чтобы сравнить версии'],
    [/^Mobile shows (\d+(?:\.\d+)?) words vs (\d+(?:\.\d+)?) on desktop \((\d+(?:\.\d+)?)%\) - Google indexes the mobile version$/, (count, detail, extra) => `В мобильной версии ${count} ${plural(count, 'слово', 'слова', 'слов')}, в настольной — ${detail} (${extra}%). Google индексирует мобильную версию`],
    [/^Mobile shows (\d+(?:\.\d+)?)% of the desktop content \((\d+(?:\.\d+)?) vs (\d+(?:\.\d+)?) words\)$/, (value, secondCount, extra) => `В мобильной версии ${value}% контента настольной версии (${secondCount} ${plural(secondCount, 'слово', 'слова', 'слов')} против ${extra})`],
    [/^Mobile and desktop content are in parity \((\d+(?:\.\d+)?) vs (\d+(?:\.\d+)?) words\)$/, (value, secondCount) => `Объём контента в мобильной и настольной версиях сопоставим (${value} и ${secondCount} ${plural(secondCount, 'слово', 'слова', 'слов')} соответственно)`],
  ],
  'mobile-parity-links': [
    [/^Too few links to assess parity$/, 'Слишком мало ссылок, чтобы сравнить версии'],
    [/^Mobile exposes (\d+(?:\.\d+)?) links vs (\d+(?:\.\d+)?) on desktop \((\d+(?:\.\d+)?)%\)$/, (count, detail, extra) => `В мобильной версии ${count} ${plural(count, 'ссылка', 'ссылки', 'ссылок')}, в настольной — ${detail} (${extra}%)`],
    [/^Mobile and desktop expose a comparable number of links \((\d+(?:\.\d+)?) vs (\d+(?:\.\d+)?)\)$/, 'Количество ссылок в мобильной и настольной версиях сопоставимо ($1 и $2)'],
  ],
  'mobile-parity-structured-data': [
    [/^Mobile has (\d+(?:\.\d+)?) JSON-LD block\(s\) vs (\d+(?:\.\d+)?) on desktop - rich results are built from the mobile page$/, (count, detail) => `В мобильной версии ${count} ${plural(count, 'блок', 'блока', 'блоков')} JSON-LD, в настольной — ${detail}. Для расширенных результатов поиска используются данные мобильной страницы`],
    [/^No structured data on either render$/, 'Структурированных данных нет ни в одной версии'],
    [/^Structured data present on mobile \((\d+(?:\.\d+)?) block\(s\)\) matches desktop$/, (count) => `Структурированные данные мобильной версии (${count} ${plural(count, 'блок', 'блока', 'блоков')}) совпадают с настольной`],
  ],
  'mobile-parity-title': [
    [/^Title differs between mobile and desktop - mobile: "(.*)" vs desktop: "(.*)"$/s, 'title различается: в мобильной версии «$1», в настольной «$2»'],
    [/^Meta description differs between mobile and desktop renders$/, 'Метатег description различается в мобильной и настольной версиях'],
    [/^Title and description match on mobile and desktop$/, 'title и description совпадают в мобильной и настольной версиях'],
  ],
  'mobile-separate-urls': [
    [/^No separate mobile URL declared$/, 'Отдельный URL мобильной версии не указан'],
    [/^The mobile alternate URL cannot be resolved: (.*)$/s, 'Не удалось разобрать URL мобильной версии: $1'],
    [/^The mobile page (.*) does not load \(HTTP (\d+(?:\.\d+)?)\)$/s, 'Мобильная страница $1 не открывается (HTTP $2)'],
    [/^The mobile page (.*) does not name this page as its canonical$/s, 'Мобильная страница $1 не указывает текущую страницу в canonical'],
    [/^The mobile page loads and names this page as its canonical$/, 'Мобильная страница открывается и указывает текущую страницу в canonical'],
  ],
  'mobile-viewport-content': [
    [/^No viewport meta tag present; content directives cannot be checked \(handled by viewport-present rule\)$/, 'Метатег viewport отсутствует, его директивы нельзя проверить. Это проверяет правило viewport-present'],
    [/^Viewport meta tag sets width and initial-scale=1, with no minimum-scale$/, 'В метатеге viewport указаны width и initial-scale=1, minimum-scale отсутствует'],
    [/^Viewport meta tag has (\d+) content issue\(s\): (.*)$/s, (count, issues) =>
      `В содержимом метатега viewport найдено ${count} ${plural(count, 'проблема', 'проблемы', 'проблем')}: ${translateParts(issues, viewportIssues, /(?<=^width directive is missing); |; (?=minimum-scale is set, limiting how far users can zoom out$)/)}`],
  ],
  'mobile-viewport-width': [
    [/^No viewport meta tag present; skipping width check \(handled by viewport-present rule\)$/, 'Метатег viewport отсутствует, проверка ширины пропущена. Это проверяет правило viewport-present'],
    [/^Viewport meta tag does not specify a width directive$/, 'В метатеге viewport отсутствует директива width'],
    [/^Viewport width is set to device-width \(responsive\)$/, 'В viewport указано width=device-width, ширина адаптируется к экрану'],
    [/^Viewport sets a fixed width of (\d+(?:\.\d+)?)px instead of device-width; mobile browsers will scale the page down$/, 'В viewport прописана фиксированная ширина $1px вместо device-width. Мобильные браузеры уменьшат масштаб страницы'],
    [/^Viewport width is set to "(.*)"$/s, 'Ширина viewport задана как «$1»'],
  ],

  // Производительность
  'cwv-cls': [
    [/^Could not measure Cumulative Layout Shift$/, 'Не удалось измерить CLS'],
    [/^CLS is (\d+(?:\.\d+)?) \(good, under 0\.1\)$/, 'CLS — $1 (в норме, ниже 0.1)'],
    [/^CLS is (\d+(?:\.\d+)?) \(needs improvement, should be under 0\.1\)$/, 'CLS — $1 (нужно улучшить, рекомендуемое значение ниже 0.1)'],
    [/^CLS is (\d+(?:\.\d+)?) \(poor, should be under 0\.1\)$/, 'CLS — $1 (плохой результат, рекомендуемое значение ниже 0.1)'],
  ],
  'cwv-fcp': [
    [/^Could not measure First Contentful Paint$/, 'Не удалось измерить FCP'],
    [/^FCP is (\d+(?:\.\d+)?)s \(good, under 1\.8s\)$/, 'FCP — $1s (в норме, ниже 1.8s)'],
    [/^FCP is (\d+(?:\.\d+)?)s \(needs improvement, should be under 1\.8s\)$/, 'FCP — $1s (нужно улучшить, рекомендуемое значение ниже 1.8s)'],
    [/^FCP is (\d+(?:\.\d+)?)s \(poor, should be under 1\.8s\)$/, 'FCP — $1s (плохой результат, рекомендуемое значение ниже 1.8s)'],
  ],
  'cwv-inp': [
    [/^INP not measured - it requires real user interaction, which an automated crawl does not perform\. Use field data \(CrUX or RUM\) for INP, or --simulate-interaction for an indicative lab value\.$/, 'INP не измерен. Для него нужно реальное взаимодействие пользователя, которого нет при автоматическом обходе. Используйте полевые данные (CrUX или RUM) или --simulate-interaction для приблизительной лабораторной оценки'],
    [/^INP is (\d+(?:\.\d+)?)ms from a synthetic interaction \(indicative only - not real user data\)$/, 'INP — $1ms по имитации взаимодействия (приблизительная оценка)'],
    [/^INP is (\d+(?:\.\d+)?)ms \(good, under 200ms\)$/, 'INP — $1ms (в норме, ниже 200ms)'],
    [/^INP is (\d+(?:\.\d+)?)ms \(needs improvement, should be under 200ms\)$/, 'INP — $1ms (нужно улучшить, рекомендуемое значение ниже 200ms)'],
    [/^INP is (\d+(?:\.\d+)?)ms \(poor, should be under 200ms\)$/, 'INP — $1ms (плохой результат, рекомендуемое значение ниже 200ms)'],
  ],
  'cwv-lcp': [
    [/^Could not measure Largest Contentful Paint$/, 'Не удалось измерить LCP'],
    [/^LCP is (\d+(?:\.\d+)?)s \(good, under 2\.5s\)$/, 'LCP — $1s (в норме, ниже 2.5s)'],
    [/^LCP is (\d+(?:\.\d+)?)s \(needs improvement, should be under 2\.5s\)$/, 'LCP — $1s (нужно улучшить, рекомендуемое значение ниже 2.5s)'],
    [/^LCP is (\d+(?:\.\d+)?)s \(poor, should be under 2\.5s\)$/, 'LCP — $1s (плохой результат, рекомендуемое значение ниже 2.5s)'],
  ],
  'cwv-ttfb': [
    [/^Could not measure Time to First Byte$/, 'Не удалось измерить TTFB'],
    [/^TTFB is (\d+(?:\.\d+)?)ms \(good, under 800ms\)$/, 'TTFB — $1ms (в норме, ниже 800ms)'],
    [/^TTFB is (\d+(?:\.\d+)?)ms \(needs improvement, should be under 800ms\)$/, 'TTFB — $1ms (нужно улучшить, рекомендуемое значение ниже 800ms)'],
    [/^TTFB is (\d+(?:\.\d+)?)ms \(poor, should be under 800ms\)$/, 'TTFB — $1ms (плохой результат, рекомендуемое значение ниже 800ms)'],
  ],
  'perf-asset-cache-policy': [
    [/^Could not measure static asset cache policies — page was not rendered$/, 'Для проверки кэширования статических ресурсов нужны данные загрузки страницы в браузере'],
    [/^No static assets observed during render$/, 'При загрузке страницы в браузере статические ресурсы не обнаружены'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) static asset\(s\) lack an efficient cache policy: (.*)$/s, (count, total, assets) => `Неэффективное кэширование у ${count} из ${total} статических ресурсов: ${translateAssetList(assets)}`],
    [/^All (\d+) static asset\(s\) are cacheable for at least (\d+(?:\.\d+)?)h$/, 'Все статические ресурсы ($1) можно кэшировать как минимум на $2h'],
  ],
  'perf-asset-compression': [
    [/^Could not measure text compression of assets — page was not rendered$/, 'Для проверки сжатия текстовых ресурсов нужны данные загрузки страницы в браузере'],
    [/^(\d+(?:\.\d+)?) text asset\(s\) served without compression: (.*)$/s, (count, assets) => `Без сжатия передаётся ${count} ${plural(count, 'текстовый ресурс', 'текстовых ресурса', 'текстовых ресурсов')}: ${translateAssetList(assets)}`],
    [/^Could not confirm text compression — (.*)$/s, (reason) => `Не удалось подтвердить сжатие текста: ${translateUnmeasuredSize(reason)}`],
    [/^All sizable text assets are served with compression$/, 'Все текстовые ресурсы, размер которых удалось определить, передаются со сжатием'],
  ],
  'perf-brotli': [
    [/^No compression detected — consider enabling Brotli for optimal transfer size$/, 'Сжатие не обнаружено. Включите Brotli, чтобы уменьшить объём передаваемых данных'],
    [/^Brotli compression is active — optimal text compression$/, 'Включено сжатие Brotli, оптимальное для текста'],
    [/^Using gzip but not Brotli — Brotli gives ~15-20% better compression for text assets$/, 'Для сжатия используется gzip. Brotli сжимает текстовые ресурсы примерно на 15-20% эффективнее'],
    [/^Using "(.*)" compression — consider Brotli for better compression ratios$/s, 'Используется сжатие «$1». Для более эффективного сжатия включите Brotli'],
  ],
  'perf-cache-policy': [
    [/^No caching headers found — browsers cannot cache this response efficiently$/, 'Заголовки кэширования не найдены. Браузер не сможет эффективно кэшировать ответ'],
    [/^Cache policy set to "(.*)" — appropriate for dynamic HTML content$/s, 'Политика кэширования «$1» подходит для динамического HTML'],
    [/^Cache policy configured with max-age=(\d+(?:\.\d+)?)s$/, 'Для кэширования задано max-age=$1s'],
    [/^Cache-control set with max-age=0 — revalidation required on every request$/, 'В Cache-control задано max-age=0. Актуальность ответа проверяется при каждом запросе'],
    [/^Cache expiry set via Expires header: (.*)$/s, 'Срок действия кэша задан заголовком Expires: $1'],
    [/^Cache-control header present but no effective caching directives found$/, 'Заголовок Cache-control есть, но в нём нет действующих директив кэширования'],
    [/^Validation caching enabled \((ETag|Last-Modified|ETag, Last-Modified)\)$/, 'Включена проверка актуальности кэша ($1)'],
  ],
  'perf-css-file-size': [
    [/^CSS optimization needed: (.*)$/s, (issues) => `CSS требует оптимизации: ${translateParts(issues, cssSizeIssues)}`],
    [/^CSS could be optimized: (.*)$/s, (issues) => `CSS можно оптимизировать: ${translateParts(issues, cssSizeIssues)}`],
    [/^CSS is well optimized: (.*)$/s, (summary) => `CSS хорошо оптимизирован: ${translatePart(summary, cssSizeSummary)}`],
  ],
  'perf-dom-size': [
    [/^DOM size is too large: (.*)$/s, (issues) => `Слишком большой DOM: ${translateParts(issues, domSizeIssues, /; (?=Max (?:depth|children): \d+ )/)}`],
    [/^DOM size could be optimized: (.*)$/s, (issues) => `Размер DOM можно уменьшить: ${translateParts(issues, domSizeIssues, /; (?=Max (?:depth|children): \d+ )/)}`],
    [/^DOM size is optimal \((.*) nodes, depth (\d+(?:\.\d+)?)\)$/s, 'Оптимальный размер DOM (узлов: $1, глубина: $2)'],
  ],
  'perf-duplicate-js': [
    [/^No known library is loaded more than once$/, 'Ни одна известная библиотека не загружается повторно'],
    [/^Library loaded more than once: (.*)$/s, 'Библиотека загружается больше одного раза: $1'],
  ],
  'perf-font-loading': [
    [/^No custom fonts detected$/, 'Пользовательские шрифты не обнаружены'],
    [/^Font loading not optimized: (.*)$/s, (issues) => `Загрузка шрифтов не оптимизирована: ${translateParts(issues, fontIssues)}`],
    [/^Font loading could be improved: (.*)$/s, (issues) => `Загрузку шрифтов можно улучшить: ${translateParts(issues, fontIssues)}`],
    [/^Font loading is optimized \((.*)\)$/s, (tips) => `Загрузка шрифтов оптимизирована (${translateParts(tips, fontOptimizations, ', ')})`],
  ],
  'perf-http2': [
    [/^HTTP\/3 support advertised via alt-svc header — optimal protocol performance$/, 'Заголовок alt-svc объявляет поддержку HTTP/3, что даёт оптимальную производительность протокола'],
    [/^alt-svc header present \("(.*)"\) — modern protocol support indicated$/s, 'Заголовок alt-svc («$1») указывает на поддержку современных протоколов'],
    [/^No alt-svc header found — server may not support HTTP\/2 or HTTP\/3 \(informational\)$/, 'Заголовок alt-svc не найден. Возможно, сервер не поддерживает HTTP/2 или HTTP/3 (справочная информация)'],
  ],
  'perf-image-encoding': [
    [/^Could not measure image encoding — page was not rendered$/, 'Для проверки форматов изображений нужны данные загрузки страницы в браузере'],
    [/^No images observed during render$/, 'При загрузке страницы в браузере изображения не обнаружены'],
    [/^(\d+(?:\.\d+)?) image\(s\) use legacy formats \(BMP\/TIFF\) — replace with WebP or AVIF: (.*)$/s, (count, images) => `Устаревшие форматы (BMP/TIFF) используют ${count} ${plural(count, 'изображение', 'изображения', 'изображений')}. Замените их на WebP или AVIF: ${translateAssetList(images)}`],
    [/^(\d+(?:\.\d+)?) image\(s\) transferred over 100KB: (.*)$/s, (count, images) => `Размер при передаче превышает 100KB у ${count} ${plural(count, 'изображения', 'изображений', 'изображений')}: ${translateAssetList(images)}`],
    [/^No legacy image formats found, but transfer size could not be confirmed — (.*)$/s, (reason) => `Устаревшие форматы изображений не обнаружены. Не удалось подтвердить размер при передаче: ${translateUnmeasuredSize(reason)}`],
    [/^All (\d+(?:\.\d+)?) image\(s\) are reasonably sized and use efficient formats$/, 'У всех изображений ($1) приемлемый размер и эффективный формат'],
  ],
  'perf-js-file-size': [
    [/^Total inline JavaScript is (.*) across (\d+(?:\.\d+)?) script\(s\) \(recommended: <(.*)\) — externalize large scripts for caching$/s, (value, secondCount, extra) => `Размер встроенного JavaScript — ${value} (${secondCount} ${plural(secondCount, 'скрипт', 'скрипта', 'скриптов')}, рекомендуется <${extra}). Вынесите большие скрипты в отдельные файлы, чтобы кэшировать их`],
    [/^Total inline JavaScript is (.*) across (\d+(?:\.\d+)?) script\(s\) \(recommended: <(.*)\) — consider externalizing$/s, (value, secondCount, extra) => `Размер встроенного JavaScript — ${value} (${secondCount} ${plural(secondCount, 'скрипт', 'скрипта', 'скриптов')}, рекомендуется <${extra}). Вынесите скрипты в отдельные файлы`],
    [/^No inline JavaScript found$/, 'Встроенный JavaScript не найден'],
    [/^Inline JavaScript is (.*) across (\d+(?:\.\d+)?) script\(s\) — within optimal range$/s, (value, secondCount) => `Размер встроенного JavaScript — ${value} (${secondCount} ${plural(secondCount, 'скрипт', 'скрипта', 'скриптов')}), в пределах нормы`],
  ],
  'perf-lazy-above-fold': [
    [/^No images found on page$/, 'На странице не найдено изображений'],
    [/^Hero image has loading="lazy" - this delays LCP$/, 'У главного изображения задано loading="lazy", что увеличивает LCP'],
    [/^(\d+(?:\.\d+)?) above-fold image\(s\) have loading="lazy"$/, (count) => `На первом экране у ${count} ${plural(count, 'изображения', 'изображений', 'изображений')} задано loading="lazy"`],
    [/^(\d+) image\(s\) correctly without lazy loading$/, (count) => `${count} ${plural(count, 'изображение', 'изображения', 'изображений')} на первом экране загружается без отложенной загрузки`],
    [/^First (\d+) images correctly without lazy loading$/, 'Первые $1 изображений загружаются без отложенной загрузки'],
  ],
  'perf-lcp-hints': [
    [/^(\d+(?:\.\d+)?) image\(s\) preloaded$/, (count) => `Предварительно загружается ${count} ${plural(count, 'изображение', 'изображения', 'изображений')}`],
    [/^No clear LCP image candidate detected$/, 'Не найдено изображение, которое явно влияет на LCP'],
    [/^LCP candidate \((.*)\) has loading="lazy" - this severely impacts LCP$/s, 'У вероятного элемента LCP ($1) задано loading="lazy". Это значительно ухудшает LCP'],
    [/^LCP candidate \((.*?)\) could be optimized: (.*)$/s, (element, issues) => `Вероятный элемент LCP (${element}) можно оптимизировать: ${translateParts(issues, lcpIssues, ', ')}`],
    [/^LCP candidate \((.*)\) is optimized with preload and fetchpriority$/s, 'Для вероятного элемента LCP ($1) настроены preload и fetchpriority'],
  ],
  'perf-legacy-javascript': [
    [/^Legacy JavaScript detected \((.*)\)\. Modern browsers do not need these; consider dropping them from the default bundle\.$/s, 'Найден устаревший JavaScript ($1). Уберите эти компоненты из основного пакета: современным браузерам они не нужны'],
    [/^No legacy polyfills or transpiler runtimes detected$/, 'Устаревшие полифилы и библиотеки транспиляторов не найдены'],
  ],
  'perf-minify-css': [
    [/^No inline CSS found$/, 'Встроенный CSS не найден'],
    [/^Inline CSS is minimal \((\d+(?:\.\d+)?) bytes across (\d+(?:\.\d+)?) <style> tag\(s\)\)$/, (count, secondCount) => `Объём встроенного CSS минимален (${count} ${plural(count, 'байт', 'байта', 'байтов')}, ${secondCount} ${plural(secondCount, 'тег', 'тега', 'тегов')} <style>)`],
    [/^Inline CSS appears unminified \((\d+(?:\.\d+)?) bytes, ~(\d+(?:\.\d+)?)% whitespace\) — minification could save ~(\d+(?:\.\d+)?) bytes$/, (count, detail, thirdCount) => `Встроенный CSS, вероятно, не минифицирован (${count} ${plural(count, 'байт', 'байта', 'байтов')}, примерно ${detail}% пробельных символов). Минификация может сэкономить примерно ${thirdCount} ${plural(thirdCount, 'байт', 'байта', 'байтов')}`],
    [/^Inline CSS is minified \((\d+(?:\.\d+)?) bytes, (\d+(?:\.\d+)?)% whitespace\)$/, (count, detail) => `Встроенный CSS минифицирован (${count} ${plural(count, 'байт', 'байта', 'байтов')}, ${detail}% пробельных символов)`],
    ...minificationMessages('stylesheet'),
  ],
  'perf-minify-js': [
    [/^No inline JavaScript found$/, 'Встроенный JavaScript не найден'],
    [/^Inline JavaScript is minimal \((\d+(?:\.\d+)?) bytes across (\d+(?:\.\d+)?) <script> tag\(s\)\)$/, (count, secondCount) => `Объём встроенного JavaScript минимален (${count} ${plural(count, 'байт', 'байта', 'байтов')}, ${secondCount} ${plural(secondCount, 'тег', 'тега', 'тегов')} <script>)`],
    [/^Inline JavaScript appears unminified \((\d+(?:\.\d+)?) bytes, (.*)\) — minification could save ~(\d+(?:\.\d+)?) bytes$/s, translateInlineJsWarning],
    [/^Inline JavaScript is minified \((\d+(?:\.\d+)?) bytes, (\d+(?:\.\d+)?)% whitespace\)$/, (count, detail) => `Встроенный JavaScript минифицирован (${count} ${plural(count, 'байт', 'байта', 'байтов')}, ${detail}% пробельных символов)`],
    ...minificationMessages('script'),
  ],
  'perf-page-weight': [
    [/^HTML document is (.*) \(recommended: <(.*)\) — consider reducing inline content, splitting pages, or lazy loading$/s, 'Размер HTML-документа — $1 (рекомендуется <$2). Сократите встроенный контент, разделите страницу или настройте отложенную загрузку'],
    [/^HTML document is (.*) \(recommended: <(.*)\) — consider externalizing inline resources$/s, 'Размер HTML-документа — $1 (рекомендуется <$2). Вынесите встроенные ресурсы в отдельные файлы'],
    [/^HTML document is (.*) — within optimal range$/s, 'Размер HTML-документа — $1, в пределах нормы'],
  ],
  'perf-preconnect': [
    [/^No third-party origins detected$/, 'Сторонние источники ресурсов не обнаружены'],
    [/^Missing preconnect for (\d+(?:\.\d+)?) critical origin\(s\): (.*)$/s, (count, detail) => `Не задан preconnect для ${count} ${plural(count, 'критичного источника', 'критичных источников', 'критичных источников')}: ${detail}`],
    [/^Preconnect hints configured \((\d+(?:\.\d+)?) origin\(s\)\)$/, (count) => `Настроен preconnect (${count} ${plural(count, 'источник', 'источника', 'источников')})`],
    [/^(\d+(?:\.\d+)?) third-party origin\(s\) detected \(no critical origins requiring preconnect\)$/, (count) => `Обнаружено ${count} ${plural(count, 'сторонний источник', 'сторонних источника', 'сторонних источников')}. Среди них нет критичных, требующих preconnect`],
  ],
  'perf-render-blocking': [
    [/^Render-blocking resources detected: (.*)$/s, (issues) => `Обнаружены ресурсы, блокирующие отрисовку: ${translateParts(issues, renderBlockingIssues)}`],
    [/^Render-blocking resources found: (.*)$/s, (issues) => `Найдены ресурсы, блокирующие отрисовку: ${translateParts(issues, renderBlockingIssues)}`],
    [/^No render-blocking scripts \((\d+) async\/defer\/module\)$/, 'Скрипты не блокируют отрисовку ($1 с async/defer/module)'],
    [/^No external scripts in head$/, 'В <head> нет внешних скриптов'],
    [/^Scripts properly optimized$/, 'Скрипты оптимизированы'],
  ],
  'perf-response-time': [
    [/^Response time is (\d+(?:\.\d+)?)ms \(threshold: (\d+(?:\.\d+)?)ms\) — consider server-side optimizations, caching, or a CDN$/, 'Время ответа — $1ms (порог $2ms). Оптимизируйте сервер, настройте кэширование или используйте CDN'],
    [/^Response time is (\d+(?:\.\d+)?)ms \(recommended: <(\d+(?:\.\d+)?)ms\) — may impact user experience$/, 'Время ответа — $1ms (рекомендуется <$2ms). Это может ухудшить работу сайта для пользователей'],
    [/^Response time is (\d+(?:\.\d+)?)ms — within optimal range$/, 'Время ответа — $1ms, в пределах нормы'],
  ],
  'perf-source-maps': [
    [/^No source map reference in the page or response headers$/, 'На странице и в заголовках ответа нет ссылок на карты исходного кода'],
    [/^Source map reference exposed: (.*)$/s, 'Доступна ссылка на карту исходного кода: $1'],
  ],
  'perf-text-compression': [
    [/^No text compression detected — page may load slowly without gzip or Brotli$/, 'Сжатие текста не обнаружено. Без gzip или Brotli страница может загружаться медленно'],
    [/^Text compression enabled \((.*)\)$/s, 'Сжатие текста включено ($1)'],
    [/^Unrecognized content-encoding "(.*)" — expected gzip, br, deflate, or zstd$/s, 'Неизвестное значение content-encoding «$1». Ожидается gzip, br, deflate или zstd'],
  ],
  'perf-unused-css': [
    [/^No (.*) files loaded$/s, 'Файлы $1 не загружались'],
    [/^(.*) of (.*) loaded but never run during page load$/s, 'При загрузке страницы не использовано $1 кода $2'],
    [/^(\d+(?:\.\d+)?) (.*) file\(s\) are mostly unused during load \((.*) in total\)$/s, (count, detail, extra) => `При загрузке страницы почти не используется ${count} ${plural(count, 'файл', 'файла', 'файлов')} ${detail} (всего ${extra})`],
    [/^(.*) loaded is mostly used \((.*) unused\)$/s, 'Бо́льшая часть загруженного кода $1 используется (не используется $2)'],
  ],
  'perf-unused-js': [
    [/^No (.*) files loaded$/s, 'Файлы $1 не загружались'],
    [/^(.*) of (.*) loaded but never run during page load$/s, 'При загрузке страницы не использовано $1 кода $2'],
    [/^(\d+(?:\.\d+)?) (.*) file\(s\) are mostly unused during load \((.*) in total\)$/s, (count, detail, extra) => `При загрузке страницы почти не используется ${count} ${plural(count, 'файл', 'файла', 'файлов')} ${detail} (всего ${extra})`],
    [/^(.*) loaded is mostly used \((.*) unused\)$/s, 'Бо́льшая часть загруженного кода $1 используется (не используется $2)'],
  ],
  'perf-video-for-animations': [
    [/^Found (\d+(?:\.\d+)?) GIF image\(s\)(?: \(showing first (\d+)\))? — consider using <video> \(MP4\/WebM\) or animated WebP\/AVIF for much smaller file sizes$/, (count, shown) => `Найдено ${count} ${plural(count, 'изображение', 'изображения', 'изображений')} GIF${shown ? ` (показаны первые ${shown})` : ''}. Используйте <video> (MP4/WebM) или анимированные WebP/AVIF, чтобы значительно уменьшить размер файлов`],
    [/^No GIF images found — page uses appropriate media formats$/, 'Изображения GIF не найдены. Страница использует подходящие форматы медиафайлов'],
  ],

  // Перенаправления
  'redirect-broken': [
    [/^Redirect chain ends in (\d+(?:\.\d+)?) \((.*)\); the redirect destination is broken$/s, (status, kind) => `Цепочка перенаправлений заканчивается кодом ${status} (${kind === 'client error' ? 'ошибка клиента' : 'ошибка сервера'}). Целевая страница недоступна`],
    [/^Redirect chain resolves to a valid page$/, 'Цепочка перенаправлений ведёт на доступную страницу'],
  ],
  'redirect-case-normalization': [
    [/^No canonical URL to compare$/, 'Нет URL в canonical для сравнения'],
    [/^Canonical tag has no href value$/, 'В теге canonical нет значения href'],
    [/^Could not parse URLs for comparison$/, 'Не удалось разобрать URL для сравнения'],
    [/^Current URL matches canonical URL$/, 'URL страницы совпадает с URL в canonical'],
    [/^Canonical URL differs from current URL only by letter casing; add a case-normalization redirect$/, 'URL в canonical отличается от URL страницы только регистром букв. Добавьте перенаправление на URL с нужным регистром'],
    [/^URL and canonical differ by more than case \(handled by other rules\)$/, 'URL страницы и canonical отличаются не только регистром. Это проверяют другие правила'],
  ],
  'redirect-http-refresh': [
    [/^No Refresh HTTP header present$/, 'HTTP-заголовок Refresh отсутствует'],
    [/^Refresh HTTP header detected; use proper 301\/302 status codes for redirects$/, 'Обнаружен HTTP-заголовок Refresh. Используйте коды 301/302 для перенаправлений'],
  ],
  'redirect-javascript': [
    [/^No inline scripts found$/, 'Встроенных скриптов не найдено'],
    [/^No JavaScript redirects detected in inline scripts$/, 'Во встроенных скриптах не обнаружены перенаправления через JavaScript'],
    [/^JavaScript redirect detected \((\d+(?:\.\d+)?) pattern\(s\) found\); search engines may not follow$/, (count) => `Обнаружено перенаправление через JavaScript (${count} ${plural(count, 'шаблон', 'шаблона', 'шаблонов')}). Поисковые системы могут по нему не перейти`],
  ],
  'redirect-loop': [
    [/^No redirect loop detected$/, 'Цикл перенаправлений не обнаружен'],
    [/^Redirect loop detected: (\d+(?:\.\d+)?) URL\(s\) appear more than once in the chain$/, 'Обнаружен цикл перенаправлений: повторяющиеся URL в цепочке — $1'],
  ],
  'redirect-meta-refresh': [
    [/^No meta refresh redirect found$/, 'Перенаправление через meta refresh не найдено'],
    [/^Meta refresh with delay 0 detected; use a server-side 301 redirect instead$/, 'Обнаружен meta refresh с задержкой 0. Настройте серверное перенаправление 301'],
    [/^Meta refresh with (\d+(?:\.\d+)?)s delay detected; search engines may not follow this redirect$/, 'Обнаружен meta refresh с задержкой $1s. Поисковые системы могут не перейти по этому перенаправлению'],
  ],
  'redirect-resource': [
    [/^Page is not HTTPS; resource redirect check not applicable$/, 'Страница открывается без HTTPS, проверка перенаправлений ресурсов неприменима'],
    [/^No HTTP resources found on HTTPS page$/, 'На HTTPS-странице нет HTTP-ресурсов'],
    [/^Found (\d+(?:\.\d+)?) HTTP resource\(s\) on HTTPS page that likely cause redirect chains$/, (count) => `На HTTPS-странице найдено ${count} ${plural(count, 'ресурс', 'ресурса', 'ресурсов')} по HTTP. Они могут вызывать цепочки перенаправлений`],
  ],
  'redirect-resource-broken': [
    [/^No redirected resources resolve to a broken \(4xx\/5xx\) response$/, 'Ни одно перенаправление ресурсов не заканчивается ответом 4xx/5xx'],
    [/^(\d+(?:\.\d+)?) redirected resource\(s\) resolve to a 4xx\/5xx status; the redirect destination is broken$/, (count) => `У ${count} ${plural(count, 'ресурса', 'ресурсов', 'ресурсов')} цепочка перенаправлений заканчивается ошибкой 4xx/5xx. Ресурсы недоступны`],
  ],
  'redirect-resource-chain': [
    [/^No multi-hop resource redirect chains detected$/, 'Цепочек из нескольких перенаправлений ресурсов не обнаружено'],
    [/^(\d+(?:\.\d+)?) page resource\(s\) resolve through redirect chains of 2 or more hops$/, (count) => `Через 2 или более перенаправления загружается ${count} ${plural(count, 'ресурс', 'ресурса', 'ресурсов')} страницы`],
  ],
  'redirect-resource-loop': [
    [/^No resource redirect loops detected$/, 'Циклов перенаправлений ресурсов не обнаружено'],
    [/^(\d+(?:\.\d+)?) page resource\(s\) are caught in a redirect loop and never resolve$/, (count) => `Из-за циклических перенаправлений не удаётся загрузить ${count} ${plural(count, 'ресурс', 'ресурса', 'ресурсов')} страницы`],
  ],
  'redirect-type': [
    [/^Page is not a redirect$/, 'Страница не перенаправляет на другой URL'],
    [/^Permanent redirect \((.*)\) correctly used$/s, 'Постоянное перенаправление ($1) настроено корректно'],
    [/^Temporary redirect \((.*)\) detected; use 301 or 308 for permanent moves to preserve link equity$/s, 'Обнаружено временное перенаправление ($1). Если URL изменился навсегда, используйте 301 или 308, чтобы сохранить ссылочный вес'],
  ],

  // Структурированные данные
  'schema-article': [
    [/^No Article schema found \(not required\)$/, 'Разметка Article не найдена. Она необязательна'],
    [/^Article schema validation failed: (.*)$/s, (issues) => `Ошибки в разметке Article: ${translateParts(issues, schemaFieldIssues)}`],
    [/^Article schema has warnings: (.*)$/s, (issues) => `Замечания к разметке Article: ${translateParts(issues, schemaFieldIssues)}`],
    [/^All (\d+(?:\.\d+)?) Article schema\(s\) have required fields$/, 'Во всех объектах Article ($1) есть обязательные поля'],
  ],
  'schema-breadcrumb': [
    [/^Homepage - breadcrumb not required$/, 'Главная страница, навигационная цепочка необязательна'],
    [/^Non-homepage missing BreadcrumbList schema$/, 'На внутренней странице нет разметки BreadcrumbList'],
    [/^BreadcrumbList validation issues: (.*)$/s, (issues) => `Проблемы в разметке BreadcrumbList: ${translateParts(issues, breadcrumbIssues)}`],
    [/^Valid BreadcrumbList schema found with proper structure \((.*)\)$/s, 'Структура BreadcrumbList корректна ($1)'],
  ],
  'schema-entity-conflict': [
    [/^Absolute @ids do not disagree on logo or telephone$/, 'У объектов с одинаковым абсолютным @id совпадают значения logo и telephone'],
    [/^(https?:\/\/.* has \d+ (?:logos|phone numbers))$/is, (issues) =>
      `Разметка содержит противоречия: ${translateParts(issues, entityConflicts, /(?<= has \d+ (?:logos|phone numbers)); (?=https?:\/\/)/i)}`],
  ],
  'schema-entity-dangling': [
    [/^Schema @id references resolve inside the crawl$/, 'Все ссылки на @id ведут к объектам на страницах обхода'],
    [/^(\d+(?:\.\d+)?) schema @id reference\(s\) are never declared: (.*)$/s, (count, detail) => `Не найдены объявления для ${count} ${plural(count, 'ссылки', 'ссылок', 'ссылок')} на @id: ${detail}`],
  ],
  'schema-entity-id': [
    [/^Schema entity identifiers are absolute, or no identity schema is present$/, 'Идентификаторы сущностей в разметке абсолютные или разметки сущностей нет'],
    [/^(.*?) missing @id\. relative @id: (.*)$/s, 'У $1 нет @id. Относительные @id: $2'],
    [/^(.*) missing @id$/s, 'У $1 нет @id'],
    [/^relative @id: (.*)$/s, 'Относительные @id: $1'],
  ],
  'schema-entity-split': [
    [/^Each named identity uses one absolute @id$/, 'У каждой именованной сущности один абсолютный @id'],
    [/^One name is published under more than one @id: (.*)$/s, 'Одно имя указано для нескольких @id: $1'],
  ],
  'schema-entity-type-drift': [
    [/^Absolute @ids keep a consistent @type$/, 'У объектов с одинаковым абсолютным @id совпадает @type'],
    [/^(https?:\/\/.*?: .*? vs .*)$/is, (issues) => {
      // @type берётся со страницы. Разделяем список только для обычных имён Schema.org.
      const plainTypes = /^(\S+: [\w:+\/#.-]+(?: vs [\w:+\/#.-]+)+(?:; \S+: [\w:+\/#.-]+(?: vs [\w:+\/#.-]+)+)*)$/;
      const details = plainTypes.test(issues) ? issues.replaceAll(' vs ', ' и ') : issues;
      return `Для одного @id заданы разные @type: ${details}`;
    }],
  ],
  'schema-faq': [
    [/^No FAQPage schema found \(not required\)$/, 'Разметка FAQPage не найдена. Она необязательна'],
    [/^FAQPage schema validation failed: (.*)$/s, (issues) =>
      `Ошибки в разметке FAQPage: ${translateParts(issues, faqIssues, /(?<="|property|Questions|empty|\(the question text\)); (?=FAQPage(?:: | Question #\d+: ))/)}`],
    [/^Valid FAQPage schema found with (\d+(?:\.\d+)?) question\(s\)$/, (count) => `Найдена корректная разметка FAQPage (${count} ${plural(count, 'вопрос', 'вопроса', 'вопросов')})`],
  ],
  'schema-local-business': [
    [/^No LocalBusiness schema found \(not required\)$/, 'Разметка LocalBusiness не найдена. Она необязательна'],
    [/^LocalBusiness schema validation failed: (.*)$/s, (issues) => `Ошибки в разметке LocalBusiness: ${translateParts(issues, schemaFieldIssues)}`],
    [/^LocalBusiness schema has warnings: (.*)$/s, (issues) => `Замечания к разметке LocalBusiness: ${translateParts(issues, schemaFieldIssues)}`],
    [/^All (\d+(?:\.\d+)?) LocalBusiness schema\(s\) have required fields$/, 'Во всех объектах LocalBusiness ($1) есть обязательные поля'],
  ],
  'schema-organization': [
    [/^No Organization schema found \(not required\)$/, 'Разметка Organization не найдена. Она необязательна'],
    [/^Organization missing: (.*)$/s, 'В разметке Organization отсутствуют поля: $1'],
    [/^Organization schema valid with suggestions$/, 'Разметка Organization корректна, есть рекомендации по улучшению'],
    [/^(\d+(?:\.\d+)?) Organization schema\(s\) properly configured$/, (count) => `Корректно настроено ${count} ${plural(count, 'объект', 'объекта', 'объектов')} Organization`],
  ],
  'schema-present': [
    [/^No structured data found on the page \(JSON-LD, microdata, or RDFa\)$/, 'На странице нет структурированных данных (JSON-LD, микроданные или RDFa)'],
    [/^Structured data found: (.*)$/s, (formats) => `Найдены структурированные данные: ${translateParts(formats, schemaFormats, ', ')}`],
    [/^Structured data found \((.*)\), but consider using JSON-LD for better compatibility$/s, (formats) => `Найдены структурированные данные (${translateParts(formats, schemaFormats, ', ')}). Используйте JSON-LD для лучшей совместимости`],
  ],
  'schema-product': [
    [/^No Product schema found \(not required\)$/, 'Разметка Product не найдена. Она необязательна'],
    [/^Product schema valid with suggestions$/, 'Разметка Product корректна, есть рекомендации по улучшению'],
    [/^(\d+(?:\.\d+)?) Product schema\(s\) properly configured$/, (count) => `Корректно настроено ${count} ${plural(count, 'объект', 'объекта', 'объектов')} Product`],
    [/^((?:Product missing(?::| offers)|Offer missing) .*)$/s, (issues) => `Ошибки в разметке Product: ${translateParts(issues, productIssues)}`],
  ],
  'schema-rating-scope': [
    [/^No AggregateRating schema$/, 'Разметка AggregateRating не найдена'],
    [/^AggregateRating is on-topic and visible$/, 'Разметка AggregateRating относится к теме страницы, оценка видна в тексте'],
    [/^((?:AggregateRating on|ratingValue) .*)$/s, (issues) => `Проблемы с AggregateRating: ${translateParts(issues, ratingIssues, /; (?=ratingValue )/)}`],
  ],
  'schema-required-fields': [
    [/^Found (\d+(?:\.\d+)?) schema type\(s\) that are not in the validation list$/, (count) => `Найдено ${count} ${plural(count, 'тип', 'типа', 'типов')} разметки вне списка проверки`],
    [/^No recognized schema\.org types found to validate$/, 'Не найдено известных типов Schema.org для проверки'],
    [/^(\d+(?:\.\d+)?) type\(s\) missing required fields: (.*)$/s, (count, issues) => `Обязательные поля отсутствуют у ${count} ${plural(count, 'типа', 'типов', 'типов')}: ${translateParts(issues, schemaFieldIssues)}`],
    [/^All required fields present, but (\d+(?:\.\d+)?) recommended field\(s\) missing$/, (count) => `Все обязательные поля есть. Не заполнено ${count} ${plural(count, 'рекомендуемое поле', 'рекомендуемых поля', 'рекомендуемых полей')}`],
    [/^All (\d+(?:\.\d+)?) schema type\(s\) have required fields$/, 'Во всех типах разметки ($1) есть обязательные поля'],
  ],
  'schema-review': [
    [/^No Review\/AggregateRating schema found \(not required\)$/, 'Разметка Review/AggregateRating не найдена. Она необязательна'],
    [/^Review schema valid with suggestions$/, 'Разметка Review корректна, есть рекомендации по улучшению'],
    [/^Review\/Rating schema properly configured$/, 'Разметка Review/Rating настроена корректно'],
    [/^((?:Review missing|reviewRating missing|AggregateRating (?:missing|should have)) .*)$/s, (issues) => `Ошибки в разметке отзывов: ${translateParts(issues, reviewIssues)}`],
  ],
  'schema-type': [
    [/^No JSON-LD scripts contain a @type field$/, 'Ни в одном скрипте JSON-LD нет поля @type'],
    [/^Could not check @type - all JSON-LD scripts have parse errors$/, 'Не удалось проверить @type: все скрипты JSON-LD содержат ошибки разбора'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) JSON-LD script\(s\) have @type, found: (.*)$/s, 'Поле @type есть у $1 из $2 скриптов JSON-LD. Найденные типы: $3'],
    [/^All (\d+(?:\.\d+)?) JSON-LD script\(s\) have @type: (.*)$/s, 'Во всех скриптах JSON-LD ($1) есть @type: $2'],
  ],
  'schema-valid': [
    [/^All (\d+(?:\.\d+)?) JSON-LD script\(s\) contain valid JSON$/, 'Во всех скриптах JSON-LD ($1) корректный JSON'],
    [/^All (\d+(?:\.\d+)?) JSON-LD script\(s\) contain invalid JSON$/, 'Во всех скриптах JSON-LD ($1) некорректный JSON'],
    [/^(\d+(?:\.\d+)?) of (\d+(?:\.\d+)?) JSON-LD script\(s\) contain invalid JSON$/, 'Некорректный JSON в $1 из $2 скриптов JSON-LD'],
  ],
  'schema-video': [
    [/^No VideoObject schema found \(not required\)$/, 'Разметка VideoObject не найдена. Она необязательна'],
    [/^VideoObject valid with suggestions$/, 'Разметка VideoObject корректна, есть рекомендации по улучшению'],
    [/^(\d+(?:\.\d+)?) VideoObject schema\(s\) properly configured$/, (count) => `Корректно настроено ${count} ${plural(count, 'объект', 'объекта', 'объектов')} VideoObject`],
    [/^((?:VideoObject missing: ).*)$/s, (issues) => `Ошибки в разметке VideoObject: ${translateParts(issues, videoIssues)}`],
  ],
  'schema-website-search': [
    [/^Homepage missing WebSite schema$/, 'На главной странице нет разметки WebSite'],
    [/^Non-homepage - WebSite schema not required here$/, 'Это внутренняя страница, разметка WebSite здесь необязательна'],
    [/^WebSite found but no SearchAction for sitelinks searchbox$/, 'Есть разметка WebSite, но нет SearchAction для поля поиска по сайту в результатах поиска'],
    [/^WebSite schema with SearchAction properly configured$/, 'Разметка WebSite с SearchAction настроена корректно'],
    [/^((?:WebSite missing|SearchAction) .*)$/s, (issues) => `Ошибки в разметке поиска: ${translateParts(issues, websiteIssues)}`],
  ],

  // Безопасность
  'security-brand-impersonation': [
    [/^Brand sign-in links point at the brand or this host$/, 'Ссылки для входа через сторонние сервисы ведут на их домены или на домен текущего сайта'],
    [/^(\d+(?:\.\d+)?) brand sign-in control\(s\) point at an unexpected host$/, (count) => `На неожиданный домен ведёт ${count} ${plural(count, 'элемент', 'элемента', 'элементов')} входа через сторонние сервисы`],
  ],
  'security-cookie-flags': [
    [/^Response cookies not available - Set-Cookie headers are only captured on a live fetch$/, 'Cookie из ответа недоступны. Заголовки Set-Cookie можно получить только при запросе к сайту'],
    [/^No cookies set by the server on this response$/, 'В этом ответе сервер не выставил cookie'],
    [/^(\d+(?:\.\d+)?) session cookie\(s\) missing HttpOnly: (.*)$/s, 'У $1 сеансовых cookie отсутствует HttpOnly: $2'],
    [/^(\d+(?:\.\d+)?) cookie\(s\) use SameSite=None without Secure and will be rejected by browsers: (.*)$/s, 'Браузеры отклонят cookie с SameSite=None без Secure ($1): $2'],
    [/^(\d+(?:\.\d+)?) cookie\(s\) on an HTTPS page missing the Secure attribute: (.*)$/s, 'У cookie на HTTPS-странице отсутствует Secure ($1): $2'],
    [/^(\d+(?:\.\d+)?) cookie\(s\) have no SameSite attribute: (.*)$/s, 'У cookie отсутствует SameSite ($1): $2'],
    [/^All (\d+(?:\.\d+)?) cookie\(s\) set appropriate security flags$/, 'Все cookie ($1) используют подходящие атрибуты безопасности'],
  ],
  'security-cookie-lifetime': [
    [/^Response cookies not available - Set-Cookie headers are only captured on a live fetch$/, 'Cookie из ответа недоступны. Заголовки Set-Cookie можно получить только при запросе к сайту'],
    [/^No cookies set by the server on this response$/, 'В этом ответе сервер не выставил cookie'],
    [/^(\d+(?:\.\d+)?) cookie\(s\) set a lifetime beyond the 400-day browser cap \(longest: (.*) at (\d+(?:\.\d+)?) days\)$/s, (value, detail, thirdCount) => `Срок действия ${value} cookie превышает предел браузера в 400 дней. Самый долгий срок у ${detail}: ${thirdCount} ${plural(thirdCount, 'день', 'дня', 'дней')}`],
    [/^All (\d+(?:\.\d+)?) cookie\(s\) use a reasonable lifetime$/, 'У всех cookie ($1) разумный срок действия'],
  ],
  'security-coop': [
    [/^Missing Cross-Origin-Opener-Policy header\. Pages that open this one keep a reference to its window\.$/, 'Заголовок Cross-Origin-Opener-Policy отсутствует. Страницы, с которых открыли эту страницу, сохраняют доступ к ссылке на её окно'],
    [/^Cross-Origin-Opener-Policy is "unsafe-none", which is the default and provides no isolation\.$/, 'В Cross-Origin-Opener-Policy задано значение по умолчанию «unsafe-none», оно не изолирует окно'],
    [/^Cross-Origin-Opener-Policy has unrecognised value "(.*)"\. Expected same-origin or same-origin-allow-popups\.$/s, 'Неизвестное значение Cross-Origin-Opener-Policy «$1». Ожидается same-origin или same-origin-allow-popups'],
    [/^Cross-Origin-Opener-Policy is "(.*)"$/s, 'В Cross-Origin-Opener-Policy задано «$1»'],
  ],
  'security-csp': [
    [/^Content-Security-Policy header is missing\. Consider adding CSP to prevent XSS attacks\.$/, 'Заголовок Content-Security-Policy отсутствует. Добавьте CSP для защиты от XSS'],
    [/^Content-Security-Policy is in report-only mode\. Consider enforcing the policy\.$/, 'Content-Security-Policy работает в режиме report-only. Включите применение политики'],
    [/^Content-Security-Policy is present but missing recommended directives: (.*)$/s, 'В Content-Security-Policy отсутствуют рекомендуемые директивы: $1'],
    [/^Content-Security-Policy is properly configured with (\d+(?:\.\d+)?) directives$/, (count) => `Content-Security-Policy настроен корректно (${count} ${plural(count, 'директива', 'директивы', 'директив')})`],
  ],
  'security-csp-xss': [
    [/^No Content-Security-Policy to grade$/, 'Нет Content-Security-Policy для проверки'],
    [/^Content-Security-Policy does not effectively restrict scripts: (.*)$/s, (issues) => `Content-Security-Policy недостаточно ограничивает выполнение скриптов: ${translateParts(issues, cspIssues, /; (?!set object-src)/)}`],
    [/^Content-Security-Policy restricts scripts but could be tightened: (.*)$/s, (issues) => `Content-Security-Policy ограничивает выполнение скриптов, но политику можно усилить: ${translateParts(issues, cspIssues, /; (?!set object-src)/)}`],
    [/^Content-Security-Policy meaningfully restricts script execution$/, 'Content-Security-Policy эффективно ограничивает выполнение скриптов'],
  ],
  'security-external-links': [
    [/^All external target="_blank" links have noopener\/noreferrer$/, 'У всех внешних ссылок с target="_blank" задано noopener/noreferrer'],
    [/^(\d+(?:\.\d+)?) external link\(s\) with target="_blank" missing noopener\/noreferrer$/, (count) => `У ${count} ${plural(count, 'внешней ссылки', 'внешних ссылок', 'внешних ссылок')} с target="_blank" отсутствует noopener/noreferrer`],
  ],
  'security-form-https': [
    [/^No forms found on page$/, 'На странице нет форм'],
    [/^All (\d+(?:\.\d+)?) form\(s\) use secure actions$/, 'Все формы ($1) отправляют данные по защищённому соединению'],
    [/^(\d+(?:\.\d+)?) form\(s\) submit to insecure HTTP URLs$/, (count) => `Отправка данных по незащищённому HTTP настроена у ${count} ${plural(count, 'формы', 'форм', 'форм')}`],
  ],
  'security-hsts': [
    [/^HSTS only applies to HTTPS URLs; site is currently served over HTTP$/, 'HSTS применяется только к URL с HTTPS. Сайт сейчас открывается по HTTP'],
    [/^Strict-Transport-Security header is missing$/, 'Заголовок Strict-Transport-Security отсутствует'],
    [/^HSTS header is present but max-age directive is missing or invalid$/, 'В заголовке HSTS директива max-age отсутствует или некорректна'],
    [/^HSTS max-age is (.*) seconds \(recommended: (\d+(?:\.\d+)?) seconds \/ 1 year\)$/s, (count, secondCount) => `В HSTS задано max-age ${count} ${plural(count, 'секунда', 'секунды', 'секунд')} (рекомендуется ${secondCount} ${plural(secondCount, 'секунда', 'секунды', 'секунд')} / 1 год)`],
    [/^HSTS is properly configured: (.*)$/s, 'HSTS настроен корректно: $1'],
  ],
  'security-https': [
    [/^Page is served over HTTPS$/, 'Страница открывается по HTTPS'],
    [/^Page is served over HTTP instead of HTTPS$/, 'Страница открывается по HTTP вместо HTTPS'],
    [/^Failed to parse URL: (.*)$/s, 'Не удалось разобрать URL: $1'],
  ],
  'security-https-redirect': [
    [/^Could not connect to HTTP version \(timeout or network error\)$/, 'Не удалось подключиться к HTTP-версии (истекло время ожидания или произошла сетевая ошибка)'],
    [/^HTTP redirects to HTTPS \((\d+(?:\.\d+)?) -> (.*)\)$/s, 'HTTP-версия перенаправляет на HTTPS ($1 -> $2)'],
    [/^HTTP redirects to another HTTP URL instead of HTTPS \((\d+(?:\.\d+)?) -> (.*)\)$/s, 'HTTP-версия перенаправляет на другой HTTP-адрес вместо HTTPS ($1 -> $2)'],
    [/^HTTP redirects but location header is invalid: (.*)$/s, 'HTTP-версия перенаправляет, но заголовок location некорректен: $1'],
    [/^HTTP returns redirect status (\d+(?:\.\d+)?) but no Location header$/, 'HTTP-версия возвращает код перенаправления $1 без заголовка Location'],
    [/^HTTP version is accessible without redirecting to HTTPS$/, 'HTTP-версия доступна без перенаправления на HTTPS'],
    [/^HTTP version returns status (\d+(?:\.\d+)?) \(expected 301\/302 redirect to HTTPS\)$/, 'HTTP-версия возвращает код $1 (ожидается перенаправление 301/302 на HTTPS)'],
    [/^Failed to check HTTP redirect: (.*)$/s, (error) => `Не удалось проверить перенаправление с HTTP: ${translateRequestError(error)}`],
  ],
  'security-info-disclosure': [
    [/^Response headers disclose the software stack \((.*)\)\. Suppress or genericise these headers\.$/s, 'Заголовки ответа раскрывают сведения об используемом ПО ($1). Уберите эти заголовки или замените значения на общие'],
    [/^Response headers do not disclose software versions$/, 'Заголовки ответа не раскрывают версии ПО'],
  ],
  'security-leaked-secrets': [
    [/^No exposed secrets detected$/, 'Открытых секретов не обнаружено'],
    [/^Found (\d+(?:\.\d+)?) potential exposed secret\(s\)$/, (count) => `Обнаружено ${count} ${plural(count, 'возможный секрет', 'возможных секрета', 'возможных секретов')} в открытом доступе`],
  ],
  'security-mixed-content': [
    [/^Page is not HTTPS, mixed content check not applicable$/, 'Страница открывается без HTTPS, проверка смешанного содержимого неприменима'],
    [/^No mixed content detected$/, 'Смешанное содержимое не обнаружено'],
    [/^Found (\d+(?:\.\d+)?) HTTP resource\(s\) on HTTPS page$/, (count) => `На HTTPS-странице найдено ${count} ${plural(count, 'ресурс', 'ресурса', 'ресурсов')} по HTTP`],
  ],
  'security-obfuscated-script': [
    [/^No obfuscated inline script found$/, 'Обфусцированных встроенных скриптов не найдено'],
    [/^(\d+(?:\.\d+)?) inline script\(s\) are long, high-entropy, and call an eval-style function$/, (count) => `Найдено ${count} ${plural(count, 'встроенный скрипт', 'встроенных скрипта', 'встроенных скриптов')} с высокой энтропией, большой длиной и вызовом функции наподобие eval`],
  ],
  'security-password-http': [
    [/^Page is served over HTTPS; password inputs are secure$/, 'Страница открывается по HTTPS, поля паролей защищены'],
    [/^No password input fields found on this HTTP page$/, 'На HTTP-странице нет полей паролей'],
    [/^Found (\d+(?:\.\d+)?) password input\(s\) on an HTTP page; credentials will be transmitted in plaintext$/, (count) => `На HTTP-странице найдено ${count} ${plural(count, 'поле', 'поля', 'полей')} пароля. Учётные данные будут передаваться открытым текстом`],
  ],
  'security-paste-blocking': [
    [/^(\d+(?:\.\d+)?) input\(s\) block pasting(?:, including (\d+) password field\(s\))?\. This breaks password managers and encourages weaker passwords\.$/, (count, passwords) => `Вставка заблокирована в ${count} ${plural(count, 'поле', 'полях', 'полях')}${passwords ? `, из них полей пароля: ${passwords}` : ''}. Это мешает менеджерам паролей и побуждает использовать более слабые пароли`],
    [/^No inputs block pasting$/, 'Ни одно поле не блокирует вставку'],
  ],
  'security-permissions-policy': [
    [/^Permissions-Policy header is missing\. Consider adding to control browser features\.$/, 'Заголовок Permissions-Policy отсутствует. Добавьте его, чтобы управлять доступом к возможностям браузера'],
    [/^Using deprecated Feature-Policy header\. Migrate to Permissions-Policy\.$/, 'Используется устаревший заголовок Feature-Policy. Перейдите на Permissions-Policy'],
    [/^Permissions-Policy header is set with (\d+(?:\.\d+)?) feature\(s\)$/, (count) => `В заголовке Permissions-Policy задано ${count} ${plural(count, 'возможность', 'возможности', 'возможностей')} браузера`],
  ],
  'security-protocol-relative': [
    [/^No protocol-relative URLs found in resource references$/, 'В ссылках на ресурсы нет URL без указания протокола'],
    [/^Found (\d+(?:\.\d+)?) protocol-relative URL\(s\) in resources; use explicit https:\/\/ instead$/, 'Найдено $1 URL ресурсов без указания протокола. Укажите https:// явно'],
  ],
  'security-referrer-policy': [
    [/^Referrer-Policy is not set\. Consider adding to control referrer information\.$/, 'Referrer-Policy не задан. Добавьте его, чтобы управлять передачей адреса предыдущей страницы'],
    [/^Invalid Referrer-Policy value: "(.*)"$/s, 'Некорректное значение Referrer-Policy: «$1»'],
    [/^Referrer-Policy "unsafe-url" leaks full URL to all origins\. Consider a stricter policy\.$/, 'Referrer-Policy со значением «unsafe-url» передаёт полный URL всем источникам. Используйте более строгую политику'],
    [/^Referrer-Policy is set to "(.*?)"( \(recommended\))?$/s, (policy, recommended) => `В Referrer-Policy задано «${policy}»${recommended ? ' (рекомендуется)' : ''}`],
  ],
  'security-sri': [
    [/^Page URL has no origin to compare assets against$/, 'В URL страницы нет источника, с которым можно сравнить источники ресурсов'],
    [/^No cross-origin script or stylesheet is missing an integrity hash$/, 'У всех скриптов и таблиц стилей с других источников есть хеш целостности'],
    [/^(\d+(?:\.\d+)?) cross-origin asset\(s\) have no integrity hash$/, (count) => `Хеш целостности отсутствует у ${count} ${plural(count, 'ресурса', 'ресурсов', 'ресурсов')} с других источников`],
  ],
  'security-ssl-expiry': [
    [/^Page is served over HTTP; no SSL certificate in use$/, 'Страница открывается по HTTP, SSL-сертификат не используется'],
    [/^HTTPS is enabled but no Strict-Transport-Security header found; browsers can be downgraded to HTTP$/, 'HTTPS включён, но заголовок Strict-Transport-Security отсутствует. Браузеры могут переключиться на HTTP'],
    [/^HSTS header present but max-age is missing or invalid$/, 'В заголовке HSTS директива max-age отсутствует или некорректна'],
    [/^HSTS max-age is very short \((\d+(?:\.\d+)?) seconds \/ (.*) hours\); this provides minimal protection$/s, (count, detail) => `В HSTS задан очень короткий max-age (${count} ${plural(count, 'секунда', 'секунды', 'секунд')} / ${detail} ч), поэтому защита минимальна`],
    [/^SSL health indicators are good: HSTS max-age is (.*) days$/s, (count) => `Признаки корректной настройки SSL: max-age в HSTS составляет ${count} ${plural(count, 'день', 'дня', 'дней')}`],
    [/^HSTS max-age is (.*) days; recommended minimum is 1 year \(365 days\)$/s, (count) => `max-age в HSTS составляет ${count} ${plural(count, 'день', 'дня', 'дней')}. Рекомендуемый минимум — 1 год (365 дней)`],
  ],
  'security-ssl-protocol': [
    [/^Page is served over HTTP; TLS configuration check not applicable$/, 'Страница открывается по HTTP, проверка TLS неприменима'],
    [/^No Strict-Transport-Security header on HTTPS site; browsers cannot enforce secure connections$/, 'На HTTPS-сайте нет заголовка Strict-Transport-Security. Браузеры не могут требовать защищённое соединение'],
    [/^TLS configuration is robust: HSTS with includeSubDomains and preload enabled$/, 'TLS настроен надёжно: в HSTS включены includeSubDomains и preload'],
    [/^HSTS is present but missing includeSubDomains and preload; full protection requires both directives$/, 'В HSTS отсутствуют includeSubDomains и preload. Для полной защиты нужны обе директивы'],
    [/^HSTS is present but missing (includeSubDomains|preload); full protection requires both directives$/, 'В HSTS отсутствует $1. Для полной защиты нужны обе директивы'],
  ],
  'security-trusted-types': [
    [/^No Content-Security-Policy, so Trusted Types cannot be enforced yet$/, 'Content-Security-Policy отсутствует, поэтому Trusted Types пока нельзя включить'],
    [/^Content-Security-Policy does not set require-trusted-types-for 'script', which would block DOM-based XSS sinks\.$/, "В Content-Security-Policy не задано require-trusted-types-for 'script', которое защищает от XSS в DOM при работе со скриптами"],
    [/^Content-Security-Policy requires Trusted Types for script sinks$/, 'Content-Security-Policy требует Trusted Types для операций со скриптами'],
  ],
  'security-x-content-type-options': [
    [/^X-Content-Type-Options header is missing\. Add "nosniff" to prevent MIME type sniffing attacks\.$/, 'Заголовок X-Content-Type-Options отсутствует. Добавьте «nosniff», чтобы браузер не определял MIME-тип по содержимому'],
    [/^X-Content-Type-Options has invalid value "(.*)"\. Should be "nosniff"\.$/s, 'У X-Content-Type-Options некорректное значение «$1». Укажите «nosniff»'],
    [/^X-Content-Type-Options is correctly set to nosniff$/, 'В X-Content-Type-Options корректно задано nosniff'],
  ],
  'security-x-frame-options': [
    [/^Neither X-Frame-Options nor CSP frame-ancestors is set\. Site is vulnerable to clickjacking\.$/, 'Заголовок X-Frame-Options и директива CSP frame-ancestors отсутствуют. Сайт уязвим для перехвата кликов'],
    [/^CSP frame-ancestors directive is set \(modern replacement for X-Frame-Options\)$/, 'Задана директива CSP frame-ancestors, современная замена X-Frame-Options'],
    [/^X-Frame-Options ALLOW-FROM is deprecated and not supported in modern browsers\. Use CSP frame-ancestors instead\.$/, 'Значение X-Frame-Options ALLOW-FROM устарело и не поддерживается современными браузерами. Используйте CSP frame-ancestors'],
    [/^X-Frame-Options has invalid value "(.*)"\. Should be DENY or SAMEORIGIN\.$/s, 'У X-Frame-Options некорректное значение «$1». Укажите DENY или SAMEORIGIN'],
    [/^X-Frame-Options is set to (.*)$/s, 'В X-Frame-Options задано $1'],
  ],

  // Социальные сети
  'social-duplicate-og': [
    [/^No og:title or og:description on this page$/, 'На странице нет og:title или og:description'],
    [/^og:title and og:description are unique across the crawl$/, 'og:title и og:description уникальны среди страниц обхода'],
    [/^((?:og:title|og:description) is shared with \d+ other page\(s\)(?:; (?:og:title|og:description) is shared with \d+ other page\(s\))?)$/, (issues) => translateParts(issues, duplicateOgIssues)],
  ],
  'social-meta-multiple': [
    [/^No Open Graph or Twitter tags on this page$/, 'На странице нет тегов Open Graph или Twitter'],
    [/^Each social property has one value$/, 'У каждого свойства для соцсетей одно значение'],
    [/^Declared more than once with different values: (.*)$/s, 'Несколько разных значений указано для свойств: $1'],
  ],
  'social-og-description': [
    [/^No <meta property="og:description"> tag found in the document$/, 'В документе нет тега <meta property="og:description">'],
    [/^Open Graph description tag exists but has no content$/, 'В теге описания Open Graph нет значения content'],
    [/^Open Graph description tag is present$/, 'Тег описания Open Graph присутствует'],
  ],
  'social-og-image': [
    [/^No <meta property="og:image"> tag found in the document$/, 'В документе нет тега <meta property="og:image">'],
    [/^Open Graph image tag exists but has no content$/, 'В теге изображения Open Graph нет значения content'],
    [/^Open Graph image URL is not a valid absolute URL: "(.*)"$/s, 'URL изображения Open Graph некорректен или задан относительным путём: «$1»'],
    [/^Open Graph image tag is present with a valid URL$/, 'Тег изображения Open Graph содержит корректный URL'],
  ],
  'social-og-image-reachable': [
    [/^No og:image or twitter:image to check$/, 'Нет og:image или twitter:image для проверки'],
    [/^The share image loads and is the right size$/, 'Изображение для соцсетей загружается и подходит по размеру'],
    [/^The share image loads and is right for each card$/, 'Изображения для соцсетей загружаются и подходят для каждой карточки'],
    [/^((?:og:image|twitter:image) \S+ (?:cannot be loaded|is) .*)$/s, (issues) => translateParts(issues, shareImageFindings, /; (?=(?:og:image|twitter:image) )/)],
  ],
  'social-og-image-size': [
    [/^No og:image to check$/, 'Нет og:image для проверки'],
    [/^og:image:width and og:image:height are not declared, so there is nothing to compare$/, 'og:image:width и og:image:height не заявлены, размеры сравнить нельзя'],
    [/^og:image:width or og:image:height is not a whole number of pixels$/, 'Значение og:image:width или og:image:height не является целым числом пикселей'],
    [/^og:image declares (\d+|\?)×(\d+|\?) but the image is (\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)$/, 'В og:image заявлено $1×$2, фактический размер — $3×$4'],
    [/^og:image:width and og:image:height match the image \((\d+(?:\.\d+)?)×(\d+(?:\.\d+)?)\)$/, 'og:image:width и og:image:height совпадают с размером изображения ($1×$2)'],
  ],
  'social-og-title': [
    [/^No <meta property="og:title"> tag found in the document$/, 'В документе нет тега <meta property="og:title">'],
    [/^Open Graph title tag exists but has no content$/, 'В теге заголовка Open Graph нет значения content'],
    [/^Open Graph title tag is present$/, 'Тег заголовка Open Graph присутствует'],
  ],
  'social-og-url': [
    [/^No <meta property="og:url"> tag found in the document$/, 'В документе нет тега <meta property="og:url">'],
    [/^Open Graph URL tag exists but has no content$/, 'В теге URL Open Graph нет значения content'],
    [/^Open Graph URL is not a valid absolute URL: "(.*)"$/s, 'URL в Open Graph некорректен или задан относительным путём: «$1»'],
    [/^Open Graph URL tag is present with a valid URL$/, 'Тег URL Open Graph содержит корректный URL'],
  ],
  'social-og-url-canonical': [
    [/^Neither og:url nor canonical URL found - add both for consistent SEO signals$/, 'URL в og:url и canonical не найдены. Добавьте оба, чтобы поисковые системы получали согласованные сигналы'],
    [/^Missing og:url - should match canonical: (.*)$/s, 'og:url отсутствует. Он должен совпадать с canonical: $1'],
    [/^og:url exists but no canonical URL to compare against$/, 'og:url есть, но для сравнения нет URL в canonical'],
    [/^og:url matches canonical URL$/, 'og:url совпадает с URL в canonical'],
    [/^og:url \((.*)\) does not match canonical URL \((.*)\)$/s, 'og:url ($1) не совпадает с URL в canonical ($2)'],
  ],
  'social-profiles': [
    [/^Found links to (\d+(?:\.\d+)?) social profiles: (.*)$/s, (count, detail) => `Найдены ссылки на ${count} ${plural(count, 'профиль', 'профиля', 'профилей')} в соцсетях: ${detail}`],
    [/^Only (\d+(?:\.\d+)?) social profile(s?) found \((.*)\)\. Consider adding more for brand presence$/s, (count, _suffix, profiles) => `Найдено только ${count} ${plural(count, 'профиль', 'профиля', 'профилей')} в соцсетях (${profiles}). Добавьте другие профили, чтобы улучшить присутствие бренда`],
    [/^No social media profile links found\. Add links to your social profiles in header\/footer$/, 'Ссылок на профили в соцсетях нет. Добавьте их в шапку или подвал сайта'],
  ],
  'social-share-buttons': [
    [/^Found share buttons for (\d+(?:\.\d+)?) platforms: (.*)$/s, (count, detail) => `Кнопки «Поделиться» найдены для ${count} ${plural(count, 'платформы', 'платформ', 'платформ')}: ${detail}`],
    [/^Social sharing widget detected$/, 'Обнаружен виджет публикации в соцсетях'],
    [/^Only found share button for (.*)\. Consider adding more platforms \(Facebook, Twitter\/X, LinkedIn\)$/s, 'Кнопка «Поделиться» найдена только для $1. Добавьте другие платформы (Facebook, Twitter/X, LinkedIn)'],
    [/^No social sharing buttons detected\. Add share buttons to encourage social engagement$/, 'Кнопки «Поделиться» не найдены. Добавьте их, чтобы посетители могли делиться страницей'],
  ],
  'social-twitter-attribute': [
    [/^No Twitter card tags on this page$/, 'На странице нет тегов карточки Twitter'],
    [/^Twitter card tags are declared with name=$/, 'Для тегов карточки Twitter указан атрибут name='],
    [/^(.*) declared with property= instead of name=$/s, 'Для $1 указан атрибут property= вместо name='],
  ],
  'social-twitter-card': [
    [/^No <meta name="twitter:card"> tag found in the document$/, 'В документе нет тега <meta name="twitter:card">'],
    [/^Twitter card tag exists but has no content$/, 'В теге карточки Twitter нет значения content'],
    [/^Twitter card type "(.*)" is not a recognized type\. Valid types: (.*)$/s, 'Тип карточки Twitter «$1» не распознан. Допустимые типы: $2'],
    [/^Twitter card tag is present with a valid type$/, 'Тег карточки Twitter содержит корректный тип'],
  ],

  // Технические проверки
  'technical-404-page': [
    [/^Non-existent page returned 200 instead of 404 \(soft 404 issue\)$/, 'Несуществующая страница вернула 200 вместо 404 (ложная 404)'],
    [/^Non-existent page redirects \((\d+(?:\.\d+)?)\) instead of returning 404$/, 'Несуществующая страница перенаправляет ($1) вместо ответа 404'],
    [/^Non-existent page returned (\d+(?:\.\d+)?) instead of 404$/, 'Несуществующая страница вернула $1 вместо 404'],
    [/^Site has a custom 404 page with proper navigation and content$/, 'У сайта есть собственная страница 404 с навигацией и полезным содержимым'],
    [/^404 page exists but could be improved$/, 'Страница 404 есть, её можно улучшить'],
    [/^404 page appears to be a default server error page$/, 'Страница 404 похожа на стандартную страницу ошибки сервера'],
    [/^Failed to test 404 page: (.*)$/s, (error) => `Не удалось проверить страницу 404: ${translateRequestError(error)}`],
  ],
  'technical-4xx-non-404': [
    [/^Page returns 404 \(handled by dedicated 404 rules\)$/, 'Страница возвращает 404. Это проверяют отдельные правила'],
    [/^No client error detected$/, 'Ошибок клиента не обнаружено'],
    [/^Page requires authentication \(401 (.*)\)$/s, 'Страница требует аутентификации (401)'],
    [/^Page is forbidden \(403 (.*)\)$/s, 'Доступ к странице запрещён (403)'],
    [/^Page is permanently gone \(410 (.*)\)$/s, 'Страница удалена навсегда (410)'],
    [/^Rate limited \(429 (.*)\)$/s, 'Превышен лимит запросов (429)'],
    [/^Page returned client error (\d+(?:\.\d+)?) (.*)$/s, (status, label) => `Страница вернула ошибку клиента ${status} (${httpStatusLabels.get(label) ?? label})`],
  ],
  'technical-amp-pairing': [
    [/^No AMP version declared$/, 'AMP-версия не указана'],
    [/^The amphtml URL cannot be resolved: (.*)$/s, 'Не удалось разобрать URL в amphtml: $1'],
    [/^The AMP page (.*) does not load \(HTTP (\d+(?:\.\d+)?)\)$/s, 'AMP-страница $1 не открывается (HTTP $2)'],
    [/^The AMP page loads and names this page as its canonical$/, 'AMP-страница открывается и указывает текущую страницу в canonical'],
    [/^The AMP page (.*) is indexable on its own: it names itself as canonical$/s, 'AMP-страница $1 индексируется отдельно: её canonical указывает на неё саму'],
    [/^The AMP page (.*) does not name this page as its canonical$/s, 'AMP-страница $1 не указывает текущую страницу в canonical'],
  ],
  'technical-bad-content-type': [
    [/^Content-Type header is missing$/, 'Заголовок Content-Type отсутствует'],
    [/^Content-Type is correct: (.*)$/s, 'Корректный Content-Type: $1'],
    [/^Incorrect Content-Type "(.*)" for an HTML page$/s, 'Некорректный Content-Type «$1» для HTML-страницы'],
  ],
  'technical-consent-mode': [
    [/^No Google tag found$/, 'Тег Google не найден'],
    [/^Google tag is paired with a consent update$/, 'Тег Google получает обновления статуса согласия'],
    [/^Google tag is present and no consent update was found$/, 'Тег Google найден, обновления статуса согласия не обнаружены'],
  ],
  'technical-duplicate-ga': [
    [/^Page HTML was not collected; cannot scan for Analytics properties$/, 'Не удалось получить HTML страницы для поиска ресурсов Google Analytics'],
    [/^Page contains (\d+(?:\.\d+)?) distinct Google Analytics properties: (.*)$/s, (count, detail) => `На странице найдено ${count} ${plural(count, 'отдельный ресурс', 'отдельных ресурса', 'отдельных ресурсов')} Google Analytics: ${detail}`],
    [/^Page contains a single Google Analytics property: (.*)$/s, 'На странице один ресурс Google Analytics: $1'],
    [/^No Google Analytics properties found$/, 'Ресурсы Google Analytics не найдены'],
  ],
  'technical-duplicate-gtm': [
    [/^Page HTML was not collected; cannot scan for Tag Manager containers$/, 'Не удалось получить HTML страницы для поиска контейнеров Google Tag Manager'],
    [/^Page contains (\d+(?:\.\d+)?) distinct Google Tag Manager containers: (.*)$/s, (count, detail) => `На странице найдено ${count} ${plural(count, 'отдельный контейнер', 'отдельных контейнера', 'отдельных контейнеров')} Google Tag Manager: ${detail}`],
    [/^Page contains a single Google Tag Manager container: (.*)$/s, 'На странице один контейнер Google Tag Manager: $1'],
    [/^No Google Tag Manager containers found$/, 'Контейнеры Google Tag Manager не найдены'],
  ],
  'technical-empty-html': [
    [/^Page HTML was not collected; cannot check for empty HTML$/, 'Не удалось получить HTML страницы для проверки содержимого'],
    [/^Page returns (\d+(?:\.\d+)?); empty HTML check applies to 200 responses$/, 'Страница возвращает $1. Проверка пустого HTML применяется к ответам 200'],
    [/^Page returns 200 but the response HTML is missing \(empty body\)$/, 'Страница возвращает 200, но в ответе нет HTML (тело ответа пустое)'],
    [/^Page returns 200 but the HTML has no meaningful content \(empty <head> and empty or missing <body>\)$/, 'Страница возвращает 200, но в HTML нет полезного содержимого (пустой <head>, пустой или отсутствующий <body>)'],
    [/^Page contains meaningful HTML content$/, 'В HTML страницы есть полезное содержимое'],
  ],
  'technical-form-get-method': [
    [/^Page HTML was not collected; cannot inspect forms$/, 'Не удалось получить HTML страницы для проверки форм'],
    [/^Page contains (\d+(?:\.\d+)?) form\(s\) using the GET method; submitted data will be appended to the URL$/, (count) => `На странице ${count} ${plural(count, 'форма', 'формы', 'форм')} с методом GET. При отправке данные добавляются к URL`],
    [/^No forms using the GET method found$/, 'Форм с методом GET не найдено'],
  ],
  'technical-robots-txt-exists': [
    [/^robots\.txt file exists and is accessible$/, 'Файл robots.txt существует и доступен'],
    [/^Could not connect to robots\.txt \(timeout or network error\)$/, 'Не удалось получить robots.txt (истекло время ожидания или произошла сетевая ошибка)'],
    [/^robots\.txt returned HTTP (\d+(?:\.\d+)?) \(expected 200\)$/, 'При запросе robots.txt получен HTTP $1 (ожидался 200)'],
    [/^Failed to check robots\.txt: (.*)$/s, (error) => `Не удалось проверить robots.txt: ${translateRequestError(error)}`],
  ],
  'technical-robots-txt-valid': [
    [/^robots\.txt returned HTTP (.*), cannot validate$/s, 'При запросе robots.txt получен HTTP $1, проверить файл не удалось'],
    [/^robots\.txt has valid syntax$/, 'Синтаксис robots.txt корректен'],
    [/^robots\.txt missing required User-agent directive$/, 'В robots.txt нет обязательной директивы User-agent'],
    [/^robots\.txt has (\d+(?:\.\d+)?) syntax issue\(s\)$/, (count) => `В robots.txt найдено ${count} ${plural(count, 'синтаксическая ошибка', 'синтаксические ошибки', 'синтаксических ошибок')}`],
    [/^Failed to fetch robots\.txt for validation: (.*)$/s, (error) => `Не удалось загрузить robots.txt для проверки: ${translateRequestError(error)}`],
  ],
  'technical-server-error': [
    [/^Page returned (\d+(?:\.\d+)?) (.*)$/s, (status, label) => `Страница вернула ${status} (${httpStatusLabels.get(label) ?? label})`],
    [/^Page returned a successful response$/, 'Страница вернула успешный ответ'],
    [/^No server error detected$/, 'Ошибок сервера не обнаружено'],
  ],
  'technical-sitemap-exists': [
    [/^Sitemap found: (\d+(?:\.\d+)?) sitemap\(s\) accessible$/, (count) => `Найден sitemap. Доступно ${count} ${plural(count, 'файл', 'файла', 'файлов')} sitemap`],
    [/^No sitemap\.xml found at default location and no sitemap referenced in robots\.txt$/, 'По стандартному адресу нет sitemap.xml, в robots.txt sitemap не указан'],
    [/^Sitemap referenced in robots\.txt but not accessible \(checked (\d+(?:\.\d+)?) locations\)$/, (count) => `sitemap указан в robots.txt, но недоступен (проверено ${count} ${plural(count, 'адрес', 'адреса', 'адресов')})`],
  ],
  'technical-sitemap-valid': [
    [/^Could not find sitemap to validate$/, 'Не найден sitemap для проверки'],
    [/^Sitemap has valid XML structure \((\d+(?:\.\d+)?) (sitemaps|URLs)\)$/, (count, kind) => `Структура XML в sitemap корректна (${count} ${kind === 'URLs' ? 'URL' : plural(count, 'файл', 'файла', 'файлов') + ' sitemap'})`],
    [/^Sitemap has (\d+(?:\.\d+)?) validation issue\(s\) but contains (\d+(?:\.\d+)?) entries$/, (count, secondCount) => `В sitemap найдено ${count} ${plural(count, 'ошибка', 'ошибки', 'ошибок')}. В файле ${secondCount} ${plural(secondCount, 'запись', 'записи', 'записей')}`],
    [/^Sitemap has invalid XML structure$/, 'Структура XML в sitemap некорректна'],
  ],
  'technical-soft-404': [
    [/^Page correctly returns 404 status code$/, 'Страница корректно возвращает код 404'],
    [/^Page does not return 200 status code; not a soft 404 candidate$/, 'Страница возвращает код, отличный от 200. Проверка на ложную 404 неприменима'],
    [/^Page returns 200 but appears to be a soft 404: (.*), on a page of (\d+(?:\.\d+)?) words$/s, (indicators, count) => `Страница возвращает 200, но похожа на ложную 404: ${translateParts(indicators, soft404Indicators, /; (?=(?:title reads|H1 reads|the text says) ")/)}. Объём страницы — ${count} ${plural(count, 'слово', 'слова', 'слов')}`],
    [/^Page does not appear to be a soft 404$/, 'Страница не похожа на ложную 404'],
  ],
  'technical-timeout': [
    [/^Page response time is (\d+(?:\.\d+)?)ms \(effectively a timeout for most crawlers\)$/, 'Время ответа страницы — $1ms. Для большинства роботов это превышает время ожидания'],
    [/^Page response time is (\d+(?:\.\d+)?)ms \(slow; may timeout for some crawlers\)$/, 'Время ответа страницы — $1ms. Некоторые роботы могут не дождаться ответа'],
    [/^Page response time is (\d+(?:\.\d+)?)ms$/, 'Время ответа страницы — $1ms'],
  ],
  'technical-trailing-slash': [
    [/^Trailing slash usage is consistent \(no internal paths to analyze\)$/, 'Нет внутренних путей для проверки завершающей косой черты'],
    [/^Each internal path is linked in one form \((\d+(?:\.\d+)?) with a trailing slash, (\d+(?:\.\d+)?) without\)$/, 'Ссылки на каждый внутренний путь оформлены единообразно (с завершающей косой чертой — $1, без — $2)'],
    [/^(\d+(?:\.\d+)?) path\(s\) linked both with and without a trailing slash: (.*)$/s, (count, detail) => `Найдено ${count} ${plural(count, 'путь', 'пути', 'путей')}, на которые ведут ссылки с завершающей косой чертой и без неё: ${detail}`],
  ],
  'technical-url-structure': [
    [/^URL follows SEO best practices$/, 'Структура URL соответствует рекомендациям SEO'],
    [/^URL has structural issues: (.*)$/s, (issues) => `Проблемы в структуре URL: ${translateParts(issues, urlStructureIssues)}`],
    [/^URL has minor structural issues: (.*)$/s, (issues) => `Небольшие проблемы в структуре URL: ${translateParts(issues, urlStructureIssues)}`],
  ],
  'technical-www-redirect': [
    [/^Could not determine www\/non-www variants for this URL$/, 'Не удалось определить варианты URL с www и без www'],
    [/^(\S+) does not respond, so only the (www|non-www) version serves the site$/, (host, version) =>
      `${host} не отвечает. Сайт доступен только в версии ${wwwVersion(version)}`],
    [/^Canonical URL is set to (www|non-www) version$/, (version) => `URL в canonical указывает на версию ${wwwVersion(version)}`],
    [/^Current page is (www|non-www) but canonical points to (www|non-www)$/, (current, canonical) =>
      `Текущая страница открыта в версии ${wwwVersion(current)}, а canonical указывает на версию ${wwwVersion(canonical)}`],
    [/^Both www and non-www versions are accessible \(should redirect to one canonical version\)$/, 'Доступны обе версии сайта, с www и без www. Настройте перенаправление на одну каноническую версию'],
    [/^WWW version returned (.*), non-www returned (.*)$/s, 'Версия с www вернула $1, без www — $2'],
  ],

  // URL
  'url-double-slash': [
    [/^URL path contains double slashes$/, 'В пути URL есть двойные косые черты'],
    [/^URL path has no double slashes$/, 'В пути URL нет двойных косых черт'],
  ],
  'url-http-https-duplicate': [
    [/^No canonical URL specified \(no protocol mismatch to check\)$/, 'URL в canonical не указан, сравнить протоколы невозможно'],
    [/^Canonical URL is relative \(no protocol mismatch possible\)$/, 'В canonical указан относительный URL, поэтому протокол не может отличаться'],
    [/^Canonical protocol \((.*)\/\/\) differs from page protocol \((.*)\/\/\)$/s, 'Протокол в canonical ($1//) отличается от протокола страницы ($2//)'],
    [/^Canonical URL protocol matches page URL protocol$/, 'Протоколы в canonical и URL страницы совпадают'],
    [/^Could not parse URL or canonical$/, 'Не удалось разобрать URL страницы или canonical'],
  ],
  'url-internal-search': [
    [/^URL appears to be an internal search page \(path: (.*), param: (.*)\)$/s, 'URL похож на адрес внутреннего поиска (путь «$1», параметр «$2»)'],
    [/^URL may be an internal search page \(param: (.*)=(.*)\)$/s, 'URL может вести на страницу внутреннего поиска (параметр $1=$2)'],
    [/^URL path suggests a search results page: (.*)$/s, 'Путь URL похож на адрес страницы результатов поиска: $1'],
    [/^URL does not appear to be an internal search page$/, 'URL не похож на адрес внутреннего поиска'],
  ],
  'url-length': [
    [/^URL length is (\d+(?:\.\d+)?) characters \(good, <= (\d+(?:\.\d+)?)\)$/, (count, detail) => `Длина URL — ${count} ${plural(count, 'символ', 'символа', 'символов')} (в пределах нормы, <= ${detail})`],
    [/^URL length is (\d+(?:\.\d+)?) characters \(recommended: <= (\d+(?:\.\d+)?)\)$/, (count, detail) => `Длина URL — ${count} ${plural(count, 'символ', 'символа', 'символов')} (рекомендуется <= ${detail})`],
    [/^URL length is (\d+(?:\.\d+)?) characters \(exceeds (\d+(?:\.\d+)?) limit\)$/, (count, detail) => `Длина URL — ${count} ${plural(count, 'символ', 'символа', 'символов')} (превышает предел ${detail})`],
  ],
  'url-non-ascii': [
    [/^URL contains malformed percent-encoding$/, 'В URL есть некорректное процентное кодирование'],
    [/^URL path contains only ASCII characters$/, 'Путь URL содержит только символы ASCII'],
    [/^URL path contains (\d+(?:\.\d+)?) non-ASCII character\(s\): (.*)$/s, (count, detail) => `В пути URL найдено ${count} ${plural(count, 'символ', 'символа', 'символов')} за пределами ASCII: ${detail}`],
  ],
  'url-parameters': [
    [/^URL query string is malformed: (.*)$/s, (issues) => `Некорректная строка запроса в URL: ${translateParts(issues, queryIssues)}`],
    [/^URL has no query parameters$/, 'В URL нет параметров запроса'],
    [/^URL has (\d+(?:\.\d+)?) query parameter\(s\) \(acceptable\)$/, (count) => `В URL ${count} ${plural(count, 'параметр', 'параметра', 'параметров')} запроса (допустимо)`],
    [/^URL has (\d+(?:\.\d+)?) query parameters: (.*)$/s, (count, detail) => `В URL ${count} ${plural(count, 'параметр', 'параметра', 'параметров')} запроса: ${detail}`],
    [/^URL has (\d+(?:\.\d+)?) query parameters \(exceeds (\d+(?:\.\d+)?)\): (.*)$/s, (count, detail, extra) => `В URL ${count} ${plural(count, 'параметр', 'параметра', 'параметров')} запроса (выше порога ${detail}): ${extra}`],
  ],
  'url-repetitive-path': [
    [/^URL path has no repetitive segments$/, 'В пути URL нет повторяющихся сегментов'],
    [/^URL path contains repetitive segments: (.*)$/s, 'В пути URL есть повторяющиеся сегменты: $1'],
  ],
  'url-session-ids': [
    [/^Session ID found in URL \((.*)\)$/s, 'В URL найден идентификатор сеанса ($1)'],
    [/^Session ID embedded in URL path$/, 'Идентификатор сеанса встроен в путь URL'],
    [/^No session IDs found in URL$/, 'В URL не найдено идентификаторов сеанса'],
  ],
  'url-slug-keywords': [
    [/^URL contains descriptive keywords: (.*)$/s, 'В URL есть информативные ключевые слова: $1'],
    [/^URL path may lack descriptive keywords$/, 'В пути URL может не хватать информативных ключевых слов'],
    [/^URL uses dynamic parameters instead of descriptive slugs$/, 'В URL используются динамические параметры вместо понятных путей'],
    [/^URL uses generic identifiers instead of descriptive keywords$/, 'В URL используются общие идентификаторы вместо информативных ключевых слов'],
  ],
  'url-spaces': [
    [/^URL contains spaces; use hyphens as word separators$/, 'В URL есть пробелы. Разделяйте слова дефисами'],
    [/^URL contains no spaces$/, 'В URL нет пробелов'],
  ],
  'url-stop-words': [
    [/^URL contains no stop words$/, 'В URL нет стоп-слов'],
    [/^URL contains (\d+(?:\.\d+)?) stop word\(s\) but ratio is acceptable \((\d+(?:\.\d+)?)%\)$/, (count, detail) => `В URL ${count} ${plural(count, 'стоп-слово', 'стоп-слова', 'стоп-слов')}, их доля допустима (${detail}%)`],
    [/^URL contains (\d+(?:\.\d+)?) stop words \((.*)\): (\d+(?:\.\d+)?)% of slug$/s, (count, detail, extra) => `В URL ${count} ${plural(count, 'стоп-слово', 'стоп-слова', 'стоп-слов')} (${detail}): ${extra}% читаемой части URL`],
  ],
  'url-tracking-params': [
    [/^No tracking parameters found in URL$/, 'В URL нет параметров отслеживания'],
    [/^URL contains (\d+(?:\.\d+)?) tracking parameter\(s\): (.*)$/s, (count, detail) => `В URL ${count} ${plural(count, 'параметр', 'параметра', 'параметров')} отслеживания: ${detail}`],
  ],
  'url-underscores': [
    [/^Root path has no underscores$/, 'В корневом пути нет знаков подчёркивания'],
    [/^URL path uses no underscores$/, 'В пути URL нет знаков подчёркивания'],
    [/^URL path contains (\d+(?:\.\d+)?) underscore\(s\); use hyphens instead$/, (count) => `В пути URL ${count} ${plural(count, 'знак', 'знака', 'знаков')} подчёркивания. Замените их дефисами`],
  ],
  'url-uppercase': [
    [/^URL path is all lowercase$/, 'Путь URL записан строчными буквами'],
    [/^URL path contains (\d+(?:\.\d+)?) uppercase character\(s\): (.*)$/s, (count, detail) => `В пути URL ${count} ${plural(count, 'заглавная буква', 'заглавные буквы', 'заглавных букв')}: ${detail}`],
  ],
};
