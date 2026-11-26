import { plural, type MessagePattern, type MessageTable } from '../index.js';

type Labels = Readonly<Record<string, string>>;

function label(value: string, labels: Labels): string {
  return Object.hasOwn(labels, value) ? labels[value] : value;
}

function joinLabels(value: string, labels: Labels, separator = ', ', translatedSeparator = separator): string {
  return value.split(separator).map((part) => label(part, labels)).join(translatedSeparator);
}

const joinWithAnd = (value: string) => value.replace(' and ', ' и ');

function ariaIssues(value: string): string {
  return value.split('; ').map((part) => part
    .replace(/^(\w+) is outside ([\w ]+)$/, (_, role, parents: string) =>
      role + ' находится вне ' + parents.replace(' or ', ' или '))
    .replace(/^(\w+) contains no (\w+)$/, '$1 не содержит $2')).join('. ');
}

function linkTargets(value: string): string {
  // The engine does not escape quotation marks inside link text. Only
  // translate counts at the end of a recognizable list item.
  return value.replace(/" \((\d+) targets\)(?=, "|$)/g, (_, count: string) =>
    '" (' + count + ' ' + plural(count, 'адрес', 'адреса', 'адресов') + ')');
}

const missingLandmarks = (value: string) => value.replace(/^\. Also missing: /, '. Также отсутствуют: ');

function landmarkIssues(value: string): string {
  return value.replace(/^missing: /, 'отсутствуют: ')
    .replace('Multiple <main> landmarks found (should be only one)', 'найдено несколько <main>, должен быть один')
    .replace(/(\d+) nav landmarks found; (\d+) lack labels/, 'найдено $1 областей nav, из них без подписи: $2')
    .replaceAll('; ', '. ');
}

const axeAreas: Labels = {
  'names and labels': 'доступные имена и подписи',
  landmarks: 'области страницы',
  'keyboard and focus': 'клавиатурное управление и фокус',
  tables: 'таблицы',
  lists: 'списки',
  'media and motion': 'медиа и анимация',
  frames: 'фреймы',
  'ARIA validity': 'корректность ARIA',
  'document language': 'язык документа',
  other: 'прочие проверки доступности',
  'colour contrast': 'цветовой контраст',
  'touch target size': 'размер областей касания',
};

const axeImpacts: Labels = {
  critical: 'критическое',
  serious: 'серьёзное',
  moderate: 'умеренное',
  minor: 'незначительное',
  unrated: 'важность не определена',
};

function axeFindings(value: string): string {
  return value.replace(/\(([\w-]+), (\d+) elements?\)/g, (_, severity: string, count: string) =>
    '(' + label(severity, axeImpacts) + ', ' + count + ' ' + plural(count, 'элемент', 'элемента', 'элементов') + ')');
}

const axeResults: readonly MessagePattern[] = [
  [/^axe (\S+) found no (.*?) problems in the rendered page$/, (version, area) =>
    'axe ' + version + ' не выявил нарушений после загрузки страницы в браузере. Проверка: ' + label(area, axeAreas)],
  [/^axe found (.*?) problems: (.+)$/s, (area, findings) =>
    'axe выявил нарушения. Проверка: ' + label(area, axeAreas) + '. Нарушения: ' + axeFindings(findings)],
];

const renderResults: readonly MessagePattern[] = [
  [/^The browser render failed for this page$/, 'Не удалось загрузить страницу в браузере'],
  [/^Needs a browser render: rerun with --render$/, 'Для проверки нужна загрузка страницы в браузере. Запустите аудит с --render'],
];

const axeGroupKeys = ['names', 'landmarks', 'keyboard', 'tables', 'lists', 'media', 'frames', 'aria', 'language', 'other'];
const axeGroupResults: readonly MessagePattern[] = [
  ...axeResults,
  [/^The accessibility engine did not run in this render$/, 'При загрузке страницы в браузере проверка доступности не запустилась'],
  ...renderResults,
];

function dateConflicts(value: string): string {
  return value.split('; ').map((part) => part
    .replace(/^schema datePublished (\d+) is not among visible time years (.+)$/, 'Год datePublished в разметке ($1) отсутствует среди годов в элементах time ($2)')
    .replace(/^schema datePublished (\d+) disagrees with URL year (\d+)$/, 'Год datePublished в разметке ($1) не совпадает с годом в URL ($2)')
    .replace(/^URL year (\d+) is not among visible time years (.+)$/, 'Год из URL ($1) отсутствует среди годов в элементах time ($2)')).join('. ');
}

function eligibilityReason(value: string): string {
  return label(value, {
    'not in the crawl records': 'страница отсутствует в данных обхода',
    'the page could not be fetched': 'страницу не удалось получить',
    'blocked by robots.txt': 'обход запрещён в robots.txt',
    'a later page of a paginated series': 'страница пагинации после первой',
  }).replace(/^the page returned HTTP (\d+)$/, 'страница вернула HTTP $1')
    .replace(/^canonicalised to /, 'canonical указывает на ');
}

const alsoTooShort = (note: string) => label(note, { ' (also too short)': '. Description также слишком короткий' });

function headingLengths(value: string): string {
  return value.replace(/(\d+) too short \(<(\d+) chars\)/g, 'слишком коротких: $1 (<$2 символов)')
    .replace(/(\d+) too long \(>(\d+) chars\)/g, 'слишком длинных: $1 (>$2 символов)');
}

const readingLevel = (value: string) => label(value, {
  'Very Easy (5th grade)': 'очень легко, 5-й класс',
  'Easy (6th grade)': 'легко, 6-й класс',
  'Fairly Easy (7th grade)': 'довольно легко, 7-й класс',
  'Standard (8th-9th grade)': 'средняя сложность, 8-9-й класс',
  'Fairly Difficult (10th-12th grade)': 'довольно сложно, 10-12-й класс',
  'Difficult (college level)': 'сложно, уровень вуза',
  'Very Difficult (college graduate)': 'очень сложно, уровень выпускника вуза',
});

const pageKind = (value: string) => label(value, { article: 'статья', product: 'товар', other: 'прочее' });
const wordCountNote = (value: string) => label(value, {
  ' (consider breaking into multiple focused articles for very long content)': '. Очень длинный материал можно разбить на несколько тематических статей',
  ' (optimal range)': ' (оптимальный диапазон)',
});

function snippetIssues(value: string): string {
  return value.split('; ').map((part) => part.replace(
    /^(Meta (robots|googlebot)|X-Robots-Tag header) contains ("(?:nosnippet|max-snippet:[^"]*)")(?: \(blocks snippets\))?$/,
    (_, source: string, bot: string | undefined, directive: string) =>
      (bot ? 'в метатеге ' + bot : 'в заголовке ' + source.replace(/ header$/, '')) + ' указано ' + directive
  )).join(', ');
}

function repeatedRobots(value: string): string {
  return value.replace(/(noindex|nofollow) declared in (\d+) locations/g, (_, directive: string, count: string) =>
    directive + ' в ' + count + ' ' + plural(count, 'месте', 'местах', 'местах')).replaceAll('; ', ', ');
}

function blockedResourceIssues(value: string): string {
  return value.replace(/(\d+) path rule\(s\) blocking resource directories/g, 'правила блокируют каталоги ресурсов ($1)')
    .replace(/(\d+) rule\(s\) blocking CSS\/JS file extensions/g, 'правила блокируют расширения файлов CSS/JS ($1)')
    .replaceAll('; ', '. ');
}

function canonicalDrift(value: string): string {
  return value.split('; ').map((part) => label(part, {
    'www and apex hosts': 'хосты с www и без него',
    'trailing-slash and no-trailing-slash paths': 'пути с завершающим слешем и без него',
  }).replace(/^schemes (.+)$/, (_, schemes: string) => 'схемы ' + schemes.replace(' and ', ' и '))
    .replace(/^hostnames /, 'имена хостов ')).join('. ');
}

const canonicalError = (value: string) => label(value, {
  timeout: 'истекло время ожидания',
  dns: 'не удалось определить IP-адрес по DNS',
  refused: 'сервер отклонил соединение',
  network: 'ошибка сети',
  'private-address': 'адрес относится к частной сети',
  'too-large': 'ответ превышает допустимый размер',
});

const canonicalRedirect = (count: string) => count
  ? 'В цепочке URL canonical ' + count + ' ' + plural(count, 'перенаправление', 'перенаправления', 'перенаправлений')
  : 'URL canonical перенаправляет на другой адрес';

function sitemapGaps(value: string): string {
  if (value === '') return value;
  return value.split(', ').map((part) => part
    .replace(/^(\d+) sitemaps? could not be fetched$/, 'не удалось получить sitemap: $1')
    .replace(/^(\d+) sitemaps? could not be parsed$/, 'не удалось разобрать sitemap: $1')
    .replace(/^(\d+) sitemaps? were not read( \(limit reached\))?$/, (_, count: string, limit: string | undefined) =>
      'непрочитанных sitemap: ' + count + (limit ? ' (достигнут лимит)' : ''))
    .replace(/^URLs past 50,000 were dropped$/, 'URL сверх лимита 50,000 пропущены')).join(', ');
}

const partialOrphans = (value: string) => value ? '. Удалось прочитать только часть sitemap (' + sitemapGaps(value) + '), поэтому таких URL может быть больше' : '';

const skippedSitemaps = (value: string) => value.replace(/^; (\d+) listed sitemap\(s\) not fetched$/, '. Не удалось получить sitemap из списка: $1');

const sitemapSubject = (value: string) => value.replace(/^Sitemap(?= |$)/, 'sitemap');

const discoverySources = (value: string) => joinLabels(value, {
  'a canonical tag': 'тег canonical',
  'a redirect': 'перенаправление',
  'the XML sitemap': 'sitemap в XML',
  'non-link sources': 'источники без ссылок',
}, ' and ', ' и ');

const paginationSources = (value: string) => joinLabels(value, { 'X-Robots-Tag header': 'заголовок X-Robots-Tag' });

const inNavigation = (value: string) => label(value, { ' in navigation': ' в меню навигации' });
const inFooter = (value: string) => label(value, { ' in footer': ' в подвале страницы' });
const ftcWording = (value: string) => label(value, { ' (FTC compliant language)': ' (формулировка соответствует требованиям FTC)' });
const structuredAddress = (value: string) => label(value, { ' with structured data': ' в структурированных данных' });

const visibleContactMethods = (value: string) => value.replace(/^ \((\d+) contact methods? visible\)$/, ' (видимых способов связи: $1)');

const contactMethod = (value: string) => label(value, {
  email: 'электронная почта',
  'email (visible)': 'электронная почта в видимом тексте',
  phone: 'телефон',
  'phone (visible)': 'телефон в видимом тексте',
  'contact form': 'форма обратной связи',
  'address (structured)': 'адрес в структурированных данных',
  'live chat': 'чат',
});

const ymylTopics = (value: string) => joinLabels(value, {
  health: 'здоровье',
  financial: 'финансы',
  legal: 'право',
  safety: 'безопасность',
  news: 'новости',
});

const ymylConfidence = (value: string) => label(value, {
  high: 'высокая уверенность',
  medium: 'средняя уверенность',
  low: 'низкая уверенность',
  none: 'уровень уверенности не определён',
});

const editorialCount = (value: string) => value.replace(/^ with (\d+) editorial signals?$/, ' (признаков редакционной политики: $1)');

const editorialSignals = (value: string) => joinLabels(value, {
  factCheck: 'проверка фактов',
  corrections: 'порядок внесения исправлений',
  process: 'редакционный процесс',
  'schema.org editorial markup': 'редакционная разметка Schema.org',
});

function napIssues(value: string): string {
  // Separate complete findings after their fixed suffix, since organization
  // names can contain punctuation or line breaks.
  return value.replace(/ has (\d+) (phone numbers|addresses)(; |$)/g, (_, count: string, kind: string, separator: string) =>
    ': ' + count + ' ' + (kind === 'addresses'
      ? plural(count, 'адрес', 'адреса', 'адресов')
      : plural(count, 'номер телефона', 'номера телефона', 'номеров телефона')) + (separator ? '. ' : ''));
}

const trustSignals = (value: string) => joinLabels(value, {
  security: 'безопасность',
  business: 'сведения о компании',
  reviews: 'отзывы',
  media: 'упоминания в СМИ',
  payment: 'платёжные сервисы',
  professional: 'профессиональные организации',
  'social-proof': 'социальные подтверждения',
});

function contentSignals(value: string): string {
  return value.split('; ').map((part) => label(part, {
    'empty Content-Signal': 'пустая директива Content-Signal',
    'empty token': 'пустое значение',
  }).replace(/^unknown key ([a-z0-9-]+)$/, 'неизвестный ключ $1')
    .replace(/^ai-train=yes while (.+) (?:is|are) disallowed$/, 'при ai-train=yes обход запрещён для $1')).join('; ');
}

const contentStructure = (value: string) => joinLabels(value, {
  'main content area (<main>, <article>, or [role="main"])': 'области основного содержимого (<main>, <article> или [role="main"])',
  'hierarchical headings (h1 followed by h2, h3, etc.)': 'иерархии заголовков (после h1 идут h2, h3 и т. д.)',
  'paragraph content (at least 30 words of prose in <p> elements)': 'текста в абзацах (хотя бы 30 слов в элементах <p>)',
  'structured data (<ul>, <ol>, <dl>, or <table> elements)': 'структурированных данных (элементов <ul>, <ol>, <dl> или <table>)',
}, '; ', '. ');

const semanticElements = (value: string) => label(value, { 'more semantic elements': 'больше семантических элементов' });

function baseDescriptions(value: string): string {
  return value.replace(/(?:^|, )(empty href|"[\s\S]*?" \((?:malformed|invalid-protocol)\))(?=, |$)/g,
    (part) => part.endsWith('empty href') ? part.replace(/empty href$/, 'пустой href')
      : part.replace(/ \(malformed\)$/, ' (некорректный адрес)')
        .replace(/ \(invalid-protocol\)$/, ' (недопустимый протокол)'));
}

function bodyProblems(value: string): string {
  return value.split('; ').map((part) => part
    .replace(/^(\d+) <body> start tags/, 'Открывающих тегов <body>: $1')
    .replace(/^<body> comes before <html>/, 'Элемент <body> находится перед <html>')
    .replace(/^an element between <html> and <head>/, 'Между <html> и <head> есть элемент')
    .replace(/^text between <html> and <head>/, 'Между <html> и <head> есть текст')
    .replace(/ \(at character (\d+)\)$/, ' (позиция: $1)')).join('. ');
}

function hreflangRedirects(value: string): string {
  return value.replace(/^(\d+) using HTTP on an HTTPS site/, 'ссылок с HTTP на сайте с HTTPS: $1')
    .replace(/(\d+) returned a 3xx redirect during the crawl$/, 'перенаправлений 3xx при обходе: $1')
    .replaceAll('; ', '. ');
}

function figureIssues(value: string): string {
  return value.replace(/(\d+) figure\(s\) missing figcaption/, 'Элементы figure без figcaption: $1')
    .replace(/(\d+) figure\(s\) without images/, 'Элементы figure без изображений: $1')
    .replaceAll('; ', '. ');
}

function pictureIssues(value: string): string {
  return value.replace(/(\d+) picture element\(s\) missing img fallback/, 'Элементы picture без резервного img: $1')
    .replace(/(\d+) picture element\(s\) without source elements/, 'Элементы picture без элементов source: $1')
    .replaceAll('; ', '. ');
}

function ajaxSignals(value: string): string {
  return value.replace(/^(\d+) internal link\(s\) use #! URLs/, 'Внутренние ссылки с URL вида #! ($1)')
    .replace(/^the page declares /, 'На странице задан ')
    .replace(/ and the page declares /, '. На странице задан ');
}

function resourceFailure(value: string): string {
  const types: Labels = {
    script: 'скрипт',
    stylesheet: 'таблица стилей',
    image: 'изображение',
    font: 'шрифт',
    media: 'медиаресурс',
    document: 'документ',
    other: 'другой ресурс',
    manifest: 'манифест',
    texttrack: 'текстовая дорожка',
    eventsource: 'EventSource',
    websocket: 'WebSocket',
  };
  return value.replace(/^(\w+) (.*?): /s, (_, type: string, failure: string) =>
    label(type, types) + ' ' + (failure === 'Request failed' ? 'запрос завершился ошибкой' : failure) + ': ');
}

const robotsChanges = (value: string) => joinLabels(value, {
  'JavaScript removed the noindex directive (page becomes indexable after JS)': 'JavaScript удалил noindex, после выполнения скриптов страница доступна для индексации',
  'JavaScript added a noindex directive (page becomes hidden after JS)': 'JavaScript добавил noindex, после выполнения скриптов индексация страницы запрещена',
  'JavaScript removed the nofollow directive (page links become followed after JS)': 'JavaScript удалил nofollow, после выполнения скриптов по ссылкам страницы можно переходить',
  'JavaScript added a nofollow directive (page links become unfollowed after JS)': 'JavaScript добавил nofollow, после выполнения скриптов робот получает указание не переходить по ссылкам страницы',
}, '; ', '. ');

const translations: MessageTable = {
  ...Object.fromEntries(axeGroupKeys.map((key) => ['a11y-axe-' + key, axeGroupResults])),

  // a11y
  'a11y-accesskey-unique': [
    [/^Access key\(s\) reused: (.*?)$/s, "Повторяющиеся клавиши быстрого доступа: $1"],
    [/^All (\d+) access key\(s\) are unique$/, "Все клавиши быстрого доступа уникальны ($1)"],
    [/^No access keys in use$/, "Клавиши быстрого доступа не используются"],
  ],
  'a11y-aria-hidden-body': [
    [/^html and body are not aria-hidden$/, "У html и body нет aria-hidden"],
    [/^aria-hidden="true" on (.*?) hides the page from assistive technology$/s, (hidden) => `Атрибут aria-hidden="true" у ${joinWithAnd(hidden)} скрывает страницу от вспомогательных технологий`],
  ],
  'a11y-aria-hidden-focusable': [
    [/^(\d+) aria-hidden problem\(s\): content is hidden from screen readers but still reachable by keyboard$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "проблема", "проблемы", "проблем")} с aria-hidden: содержимое скрыто от программ чтения с экрана, но доступно с клавиатуры`],
    [/^aria-hidden is not hiding focusable content$/, "aria-hidden не скрывает элементы, которые могут получить фокус"],
  ],
  'a11y-aria-labels': [
    [/^All interactive elements have accessible names$/, "У всех интерактивных элементов есть доступные имена"],
    [/^Found (\d+) interactive element\(s\) without accessible names$/, "Интерактивные элементы без доступных имён: $1"],
  ],
  'a11y-aria-required': [
    [/^Explicit ARIA widgets have their required roles$/, "У элементов с явно указанными ролями ARIA есть все обязательные роли"],
    [/^((?:\w+ (?:is outside \w+(?: or \w+)?|contains no \w+))(?:; \w+ (?:is outside \w+(?: or \w+)?|contains no \w+))*)$/, ariaIssues],
  ],
  'a11y-aria-valid': [
    [/^(\d+) invalid ARIA role\(s\) or attribute\(s\) found — these are ignored by assistive technology$/, "Недопустимые роли или значения атрибутов ARIA ($1). Вспомогательные технологии их игнорируют"],
    [/^ARIA roles and attributes are valid$/, "Роли и атрибуты ARIA заданы корректно"],
  ],
  'a11y-autocomplete': [
    [/^Email and telephone inputs set autocomplete, or the page has none$/, "У всех полей для электронной почты и телефона задан autocomplete или таких полей на странице нет"],
    [/^(\d+) email or telephone input\(s\) are missing the matching autocomplete token$/, (missingCount) => `У ${missingCount} ${plural(missingCount, "поля", "полей", "полей")} для электронной почты или телефона отсутствует нужное значение autocomplete`],
  ],
  'a11y-button-name': [
    [/^Buttons have accessible names, or the page has none$/, "У всех кнопок есть доступные имена или на странице нет кнопок"],
    [/^(\d+) button\(s\) have no accessible name$/, "Кнопки без доступных имён: $1"],
  ],
  'a11y-color-contrast': [
    ...axeResults,
    [/^No inline colours to check; contrast set in stylesheets needs a rendered check$/, "Встроенные стили не задают цвета. Для проверки контраста в таблицах стилей нужна загрузка страницы в браузере"],
    [/^No obvious color contrast issues detected$/, "Явных проблем с цветовым контрастом не обнаружено"],
    [/^Found (\d+) potential contrast issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "возможное нарушение", "возможных нарушения", "возможных нарушений")} цветового контраста`],
  ],
  'a11y-duplicate-id': [
    [/^(\d+) duplicated ID\(s\) are targeted by ARIA or label references: (.*?)$/s, "ARIA или label ссылаются на повторяющиеся ID ($1): $2"],
    [/^(\d+) duplicated ID\(s\) found: (.*?)$/s, "Повторяющиеся ID ($1): $2"],
    [/^No ARIA-breaking duplicate IDs \((.*?) duplicated inside <svg>, which is harmless\)$/s, "Повторов ID, нарушающих работу ARIA, нет. Внутри <svg> повторяется $1 ID, это допустимо"],
    [/^All element IDs are unique$/, "Все ID элементов уникальны"],
  ],
  'a11y-empty-heading': [
    [/^(\d+) empty heading\(s\) found$/, (emptyHeadingCount) => `Обнаружено ${emptyHeadingCount} ${plural(emptyHeadingCount, "пустой заголовок", "пустых заголовка", "пустых заголовков")}`],
    [/^All (.*?) heading\(s\) contain content$/s, "Все заголовки содержат текст ($1)"],
    [/^No headings on the page$/, "На странице нет заголовков"],
  ],
  'a11y-focus-visible': [
    [/^No focus indicator issues detected$/, "Проблем с индикацией фокуса не обнаружено"],
    [/^Focus outline removed but :focus-visible detected$/, "Контур фокуса убран, при этом задан :focus-visible"],
    [/^Found (\d+) focus indicator issues$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} индикации фокуса`],
    [/^Found (\d+) potential focus indicator issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "возможное нарушение", "возможных нарушения", "возможных нарушений")} индикации фокуса`],
  ],
  'a11y-form-labels': [
    [/^No form inputs found on page$/, "На странице нет полей форм"],
    [/^All form inputs have associated labels$/, "С каждым полем формы связана подпись"],
    [/^(\d+) of (\d+) form inputs lack proper labels$/, "У $1 из $2 полей форм нет корректных подписей"],
  ],
  'a11y-form-multiple-labels': [
    [/^(\d+) form control\(s\) have multiple labels: (.*?)$/s, "Элементы формы с несколькими подписями ($1): $2"],
    [/^No form control has multiple labels$/, "У каждого элемента формы максимум одна подпись"],
  ],
  'a11y-heading-order': [
    [/^No headings found on page$/, "На странице нет заголовков"],
    [/^Heading hierarchy is correct$/, "Иерархия заголовков корректна"],
    [/^Found (\d+) heading hierarchy issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} иерархии заголовков`],
  ],
  'a11y-identical-links-purpose': [
    [/^(\d+) link text\(s\) point to different destinations: (.*?)$/s, (textCount, links) => `Одинаковый текст ведёт на разные адреса (${textCount}): ${linkTargets(links)}`],
    [/^Links with identical text share a destination$/, "Ссылки с одинаковым текстом ведут на один адрес"],
  ],
  'a11y-iframe-title': [
    [/^No frames on the page$/, "На странице нет фреймов"],
    [/^(\d+) of (.*?) frame\(s\) have no title$/s, "У $1 из $2 фреймов нет title"],
    [/^All (.*?) frame\(s\) have a title$/s, "У всех фреймов есть title ($1)"],
  ],
  'a11y-input-image-alt': [
    [/^No image buttons on the page$/, "На странице нет кнопок с изображениями"],
    [/^(\d+) of (.*?) image button\(s\) have no alt text$/s, "У $1 из $2 кнопок с изображениями нет alt"],
    [/^All (.*?) image button\(s\) have alt text$/s, "У всех кнопок с изображениями есть alt ($1)"],
  ],
  'a11y-label-name-mismatch': [
    [/^(\d+) control\(s\) have an accessible name that omits their visible text, breaking voice control$/, (mismatchedCount) => `У ${mismatchedCount} ${plural(mismatchedCount, "элемента управления", "элементов управления", "элементов управления")} доступное имя не содержит видимый текст. Это мешает голосовому управлению`],
    [/^Accessible names contain their visible labels$/, "Доступные имена содержат видимый текст подписей"],
  ],
  'a11y-landmark-regions': [
    [/^All essential landmark regions present$/, "Все основные области страницы обозначены"],
    [/^Missing essential landmark: <main>(.*?)$/s, (suffix) => `Отсутствует основная область: <main>${missingLandmarks(suffix)}`],
    [/^Landmark issues: (.*?)$/s, (issues) => `Проблемы с областями страницы: ${landmarkIssues(issues)}`],
  ],
  'a11y-link-text': [
    [/^All links have descriptive text$/, "У всех ссылок информативный текст"],
    [/^Found (.*?) link text accessibility issue\(s\)$/s, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} доступности в тексте ссылок`],
  ],
  'a11y-list-structure': [
    [/^(\d+) list structure problem\(s\) found$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} структуры списков`],
    [/^List markup is well-formed$/, "Разметка списков корректна"],
  ],
  'a11y-main-landmark': [
    [/^No main landmark found\. Add <main> so users can skip directly to the content\.$/, "Основная область страницы отсутствует. Добавьте <main>, чтобы посетители могли сразу перейти к содержимому."],
    [/^(.*?) main landmarks found\. Exactly one should identify the primary content\.$/s, (count) => `Найдено ${count} ${plural(count, "обозначение основной области", "обозначения основной области", "обозначений основной области")}. Оставьте одно для основного содержимого страницы.`],
    [/^Page has one main landmark$/, "На странице одна основная область"],
  ],
  'a11y-object-alt': [
    [/^No <object> elements on the page$/, "На странице нет элементов <object>"],
    [/^(\d+) of (.*?) <object> element\(s\) have no text alternative$/s, "У $1 из $2 элементов <object> нет текстового описания"],
    [/^All (.*?) <object> element\(s\) have alternatives$/s, "У всех элементов <object> есть текстовые описания ($1)"],
  ],
  'a11y-presentation-role-conflict': [
    [/^(\d+) element\(s\) with role="none"\/"presentation" are still exposed to assistive technology$/, (conflictCount) => `${conflictCount} ${plural(conflictCount, "элемент", "элемента", "элементов")} с role="none"/"presentation" по-прежнему видны вспомогательным технологиям`],
    [/^No presentation role conflicts$/, "Конфликтов ролей отображения нет"],
  ],
  'a11y-redundant-alt': [
    [/^(\d+) image\(s\) have alt text identical to their surrounding text, so it is announced twice$/, (redundantCount) => `У ${redundantCount} ${plural(redundantCount, "изображения", "изображений", "изображений")} текст alt совпадает с соседним текстом, поэтому программа чтения с экрана озвучивает его дважды`],
    [/^No redundant alt text found$/, "Повторов в тексте alt не обнаружено"],
  ],
  'a11y-skip-link': [
    [/^Skip link is present$/, "На странице есть ссылка для перехода к основному содержимому"],
    [/^Page is simple enough that skip link may not be needed$/, "Структура страницы простая. Ссылка для перехода к основному содержимому может не понадобиться"],
    [/^No skip link found for keyboard navigation$/, "Ссылки для перехода к основному содержимому с клавиатуры нет"],
  ],
  'a11y-svg-img-alt': [
    [/^No SVGs with an image role on the page$/, "На странице нет SVG с ролью изображения"],
    [/^(\d+) of (.*?) SVG image\(s\) have no accessible name$/s, "У $1 из $2 SVG-изображений нет доступных имён"],
    [/^All (.*?) SVG image\(s\) have accessible names$/s, "У всех SVG-изображений есть доступные имена ($1)"],
  ],
  'a11y-tabindex-positive': [
    [/^(\d+) element\(s\) use a positive tabindex, overriding the natural tab order$/, (offenderCount) => `У ${offenderCount} ${plural(offenderCount, "элемента", "элементов", "элементов")} задан положительный tabindex. Это меняет естественный порядок перехода с клавиатуры`],
    [/^No positive tabindex values$/, "Положительных значений tabindex нет"],
  ],
  'a11y-table-caption': [
    [/^(\d+) of (.*?) data table\(s\) have caption problems$/s, "Проблемы с caption есть у $1 из $2 таблиц с данными"],
    [/^All (.*?) data table\(s\) are captioned$/s, "У всех таблиц с данными есть caption ($1)"],
    [/^No data tables on the page$/, "На странице нет таблиц с данными"],
  ],
  'a11y-table-headers': [
    [/^No data tables found on page$/, "На странице нет таблиц с данными"],
    [/^All data tables have proper headers$/, "У всех таблиц с данными корректные заголовки"],
    [/^(\d+) table\(s\) missing header cells$/, "Таблицы без ячеек заголовков: $1"],
    [/^Found (\d+) table accessibility issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} доступности таблиц`],
  ],
  'a11y-touch-targets': [
    ...axeResults,
    [/^No obvious touch target size issues detected$/, "Явных проблем с размером областей касания не обнаружено"],
    [/^Found (\d+) potential touch target sizing issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "возможное нарушение", "возможных нарушения", "возможных нарушений")} размера областей касания`],
  ],
  'a11y-valid-lang-element': [
    [/^No element-level lang attributes to validate$/, "У элементов нет атрибутов lang для проверки"],
    [/^(\d+) of (.*?) element lang attribute\(s\) are not valid BCP 47: (.*?)$/s, "У $1 из $2 элементов значение lang не соответствует BCP 47: $3"],
    [/^All (.*?) element lang attribute\(s\) are valid$/s, "Все атрибуты lang у элементов заданы корректно ($1)"],
  ],
  'a11y-video-captions': [
    [/^No video or audio elements found on page$/, "На странице нет элементов видео или аудио"],
    [/^All video\/audio elements have captions or transcripts$/, "У всех элементов видео и аудио есть субтитры или расшифровка"],
    [/^(\d+) video\/audio element\(s\) missing captions$/, "Элементы видео или аудио без субтитров: $1"],
    [/^(\d+) video\/audio element\(s\) may need captions$/, (issueCount) => `Субтитры могут понадобиться для ${issueCount} ${plural(issueCount, "элемента", "элементов", "элементов")} видео или аудио`],
  ],
  'a11y-xml-lang-mismatch': [
    [/^html does not set both lang and xml:lang$/, "У html не заданы оба атрибута lang и xml:lang"],
    [/^lang and xml:lang are both (.*?)$/s, "Атрибуты lang и xml:lang совпадают: $1"],
    [/^lang="(.*?)" disagrees with xml:lang="(.*?)"$/s, "Значения lang=\"$1\" и xml:lang=\"$2\" различаются"],
  ],
  'a11y-zoom-disabled': [
    [/^No viewport meta tag found$/, "Метатег viewport отсутствует"],
    [/^Viewport allows user zoom$/, "Метатег viewport разрешает масштабирование"],
    [/^Viewport meta tag prevents user zoom$/, "Метатег viewport запрещает масштабирование"],
  ],

  // content
  'content-article-links': [
    [/^Content too short for link density check \((.*?) words\)$/s, (wordCount) => `Текста слишком мало для проверки плотности ссылок (${wordCount} ${plural(wordCount, "слово", "слова", "слов")})`],
    [/^Link density too low: (.*?) links per 100 words \(minimum (.*?)\)$/s, "Плотность ссылок слишком низкая: $1 на 100 слов (минимум $2)"],
    [/^Link density too high: (.*?) links per 100 words \(maximum (.*?)\)$/s, "Плотность ссылок слишком высокая: $1 на 100 слов (максимум $2)"],
    [/^Link density is appropriate: (.*?) links per 100 words$/s, "Плотность ссылок в норме: $1 на 100 слов"],
  ],
  'content-author-info': [
    [/^Author information found \((\d+) signal(.*?)\)$/s, (signalCount) => `Найдены сведения об авторе (${signalCount} ${plural(signalCount, "признак", "признака", "признаков")})`],
    [/^No author information found$/, "Сведения об авторе не найдены"],
  ],
  'content-broken-html': [
    [/^Significant HTML structure issues: (\d+) problems found$/, "Серьёзные ошибки структуры HTML ($1)"],
    [/^HTML structure issues found: (\d+) problem(.*?)$/s, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} структуры HTML`],
    [/^No significant HTML structure issues detected$/, "Серьёзных ошибок структуры HTML не обнаружено"],
  ],
  'content-date-agreement': [
    [/^No published-date sources to compare$/, "Нет источников даты публикации для сравнения"],
    [/^Published date sources agree$/, "Дата публикации совпадает в разных источниках"],
    [/^((?:schema datePublished|URL year) .+)$/, dateConflicts],
  ],
  'content-description-pixel-width': [
    [/^No meta description found \(handled by other rules\)$/, "Метатег description отсутствует. Это проверяют другие правила"],
    [/^Meta description will be truncated in SERP: estimated (.*?)px \(max ~(.*?)px\)$/s, "Description будет обрезан в поисковой выдаче: около $1px (предел ~$2px)"],
    [/^Meta description may be truncated in SERP: estimated (.*?)px \(max ~(.*?)px\)$/s, "Description может обрезаться в поисковой выдаче: около $1px (предел ~$2px)"],
    [/^Meta description fits within SERP display: estimated (.*?)px$/s, "Description помещается в поисковой выдаче: около $1px"],
  ],
  'content-duplicate-description': [
    [/^Page has no meta description$/, "У страницы нет метатега description"],
    [/^Description uniqueness needs other pages to compare against - run with --crawl$/, "Запустите аудит с --crawl, чтобы сравнить description с другими страницами"],
    [/^Not compared: (.*?)$/s, (reason) => `Сравнение пропущено: ${eligibilityReason(reason)}`],
    [/^Duplicate description found on (.*?) pages(.*?)$/s, (count, suffix) => `Одинаковый description на ${count} ${plural(count, "странице", "страницах", "страницах")}${alsoTooShort(suffix)}`],
    [/^Meta description is too short$/, "Метатег description слишком короткий"],
    [/^Meta description is unique$/, "Метатег description уникален"],
  ],
  'content-duplicate-exact': [
    [/^Duplicate content detection needs other pages to compare against - run with --crawl$/, "Запустите аудит с --crawl, чтобы найти точные дубли содержимого на других страницах"],
    [/^Not compared: (.*?)$/s, (reason) => `Сравнение пропущено: ${eligibilityReason(reason)}`],
    [/^Page has insufficient content for duplicate detection$/, "На странице слишком мало содержимого для поиска дублей"],
    [/^Exact duplicate content detected on (.*?) pages \(matches (.*?)\)$/s, (count, value) => `Точный дубль содержимого на ${count} ${plural(count, "странице", "страницах", "страницах")} (совпадение с ${value})`],
    [/^Content is unique \(no exact duplicates detected\)$/, "Точных дублей содержимого нет"],
  ],
  'content-duplicate-h1': [
    [/^Cross-page H1 comparison needs the crawl page inventory - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать список страниц и сравнить H1"],
    [/^No H1 text recorded for this page in the crawl data$/, "В результатах обхода для этой страницы нет текста H1"],
    [/^Not compared: (.*?)$/s, (reason) => `Сравнение пропущено: ${eligibilityReason(reason)}`],
    [/^This page's H1 is identical to (\d+) other crawled page\(s\)$/, "Страницы обхода с таким же H1: $1"],
    [/^This page's H1 is unique across the crawled pages$/, "H1 уникален среди страниц обхода"],
  ],
  'content-duplicate-near': [
    [/^Near-duplicate detection needs other pages to compare against - run with --crawl$/, "Запустите аудит с --crawl, чтобы найти похожее содержимое на других страницах"],
    [/^Not compared: (.*?)$/s, (reason) => `Сравнение пропущено: ${eligibilityReason(reason)}`],
    [/^Page has insufficient content for near-duplicate detection$/, "На странице слишком мало содержимого для поиска почти точных дублей"],
    [/^Too many similar pages to compare \((.*?) candidate pairs\); run a smaller crawl or narrow it with include\/exclude$/s, "Слишком много похожих страниц для сравнения: $1 пар-кандидатов. Уменьшите область обхода с помощью include/exclude"],
    [/^Near-duplicate content detected: (.*?)% similar to (.*?)$/s, "Содержимое почти совпадает с $2. Сходство: $1%"],
    [/^Similar content detected: (.*?)% similar to (.*?)$/s, "Найдено похожее содержимое на $2. Сходство: $1%"],
    [/^Content is sufficiently unique$/, "Содержимое достаточно уникально"],
  ],
  'content-freshness': [
    [/^Content freshness signals found \((\d+) type(.*?)\)$/s, (signalCount) => `Найдены признаки актуальности содержимого (${signalCount} ${plural(signalCount, "тип", "типа", "типов")})`],
    [/^No content freshness signals found$/, "Признаков актуальности содержимого нет"],
  ],
  'content-heading-hierarchy': [
    [/^No headings found in the document$/, "В документе нет заголовков"],
    [/^Heading hierarchy issues found: (\d+) problem\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "нарушение", "нарушения", "нарушений")} иерархии заголовков`],
    [/^Heading hierarchy is correct$/, "Иерархия заголовков корректна"],
  ],
  'content-heading-length': [
    [/^No headings found to check$/, "Нет заголовков для проверки"],
    [/^Heading length issues: (.*?)$/s, (issues) => `Проблемы с длиной заголовков: ${headingLengths(issues)}`],
    [/^All (\d+) headings have appropriate length$/, "У всех заголовков подходящая длина ($1)"],
  ],
  'content-heading-unique': [
    [/^No headings found to check$/, "Нет заголовков для проверки"],
    [/^Found (\d+) duplicate heading text\(s\) \((.*?) total occurrences\)$/s, "Повторяющиеся тексты заголовков: $1 (всего вхождений: $2)"],
    [/^All (\d+) headings have unique content$/, "Текст каждого заголовка уникален ($1)"],
  ],
  'content-hidden-text': [
    [/^No long text hidden with an inline style$/, "Встроенные стили не скрывают длинные фрагменты текста"],
    [/^(\d+) block\(s\) of text are hidden with an inline style$/, (sampleCount) => `Встроенные стили скрывают ${sampleCount} ${plural(sampleCount, "блок", "блока", "блоков")} текста`],
  ],
  'content-keyword-stuffing': [
    [/^Content too short for keyword analysis \((\d+) content words\)$/, (contentWordCount) => `Слишком мало текста для анализа ключевых слов (${contentWordCount} ${plural(contentWordCount, "слово", "слова", "слов")})`],
    [/^Very high keyword density: "(.*?)" appears (.*?) times \((.*?)%\)$/s, (word, count, density) => `Очень высокая плотность ключевых слов: "${word}" встречается ${count} ${plural(count, "раз", "раза", "раз")} (${density}%)`],
    [/^(\d+) terms exceed (.*?)% density$/s, (termCount, threshold) => `Плотность выше ${threshold}% у ${termCount} ${plural(termCount, "слова", "слов", "слов")}`],
    [/^No keyword stuffing detected$/, "Избыточных повторов ключевых слов не обнаружено"],
  ],
  'content-meta-in-body': [
    [/^Found (\d+) meta element(.*?) incorrectly placed in document body$/s, "Элементы meta ошибочно размещены в body ($1)"],
    [/^All meta elements are correctly placed in document head$/, "Все элементы meta размещены в head"],
  ],
  'content-mime-type': [
    [/^Missing Content-Type header$/, "Заголовок Content-Type отсутствует"],
    [/^Incorrect MIME type: (.*?)$/s, "Неверный тип MIME: $1"],
    [/^Content-Type header missing charset specification$/, "В заголовке Content-Type не указан charset"],
    [/^Non-UTF-8 charset detected: (.*?)$/s, "Указана кодировка, отличная от UTF-8: $1"],
    [/^Content-Type is correct; UTF-8 is declared by <meta> within the first 1,024 bytes$/, "Content-Type задан корректно. UTF-8 объявлена в <meta> в первых 1,024 байтах"],
    [/^Content-Type header is correctly configured$/, "Заголовок Content-Type задан корректно"],
  ],
  'content-mojibake': [
    [/^No mojibake in visible text$/, "В видимом тексте нет признаков неверной кодировки"],
    [/^Visible text contains encoding corruption \((\d+) sample(.*?)\)$/s, (sampleCount) => `В видимом тексте есть искажения из-за неверной кодировки (${sampleCount} ${plural(sampleCount, "пример", "примера", "примеров")})`],
  ],
  'content-placeholder-text': [
    [/^Visible text contains unrendered template syntax: (.*?)$/s, "В видимом тексте остался необработанный синтаксис шаблона: $1"],
    [/^Visible text contains author notes: (.*?)$/s, "В видимом тексте остались заметки автора: $1"],
    [/^No template leftovers or author notes in visible text$/, "В видимом тексте нет остатков шаблонов или заметок автора"],
  ],
  'content-reading-level': [
    [/^Readability is only graded for English text \(Flesch-Kincaid\)$/, 'Читаемость оценивается только для текстов на английском (формула Флеша — Кинкейда)'],
    [/^Content too short for readability analysis \((\d+) words\)$/, (wordCount) => `Текста слишком мало для оценки читаемости (${wordCount} ${plural(wordCount, "слово", "слова", "слов")})`],
    [/^Optimal readability: (.*?) \((.*?)\)$/s, (score, level) => `Оптимальная читаемость: ${score} (${readingLevel(level)})`],
    [/^Acceptable readability: (.*?) \((.*?)\)$/s, (score, level) => `Приемлемая читаемость: ${score} (${readingLevel(level)})`],
    [/^Content may be too complex: (.*?) \((.*?)\)$/s, (score, level) => `Текст может быть слишком сложным: ${score} (${readingLevel(level)})`],
    [/^Content may be too simplistic: (.*?) \((.*?)\)$/s, (score, level) => `Текст может быть слишком простым: ${score} (${readingLevel(level)})`],
  ],
  'content-stale-copyright': [
    [/^No footer copyright year to compare$/, "В подвале страницы нет года для проверки уведомления об авторских правах"],
    [/^Footer copyright year is current \((.*?)\)$/s, "В уведомлении об авторских правах в подвале указан текущий год ($1)"],
    [/^Footer copyright year (.*?) is behind (.*?)$/s, "Год в уведомлении об авторских правах в подвале устарел: $1. Текущий год: $2"],
  ],
  'content-text-html-ratio': [
    [/^Page has no HTML content$/, "На странице нет HTML"],
    [/^Very low text-to-HTML ratio: (.*?)% \((.*?) text bytes \/ (.*?) HTML bytes\)$/s, "Очень низкая доля текста в HTML: $1% ($2 байт текста из $3 байт HTML)"],
    [/^Low text-to-HTML ratio: (.*?)% \((.*?) text bytes \/ (.*?) HTML bytes\)$/s, "Низкая доля текста в HTML: $1% ($2 байт текста из $3 байт HTML)"],
    [/^Good text-to-HTML ratio: (.*?)% \((.*?) text bytes \/ (.*?) HTML bytes\)$/s, "Хорошая доля текста в HTML: $1% ($2 байт текста из $3 байт HTML)"],
  ],
  'content-thin-vs-site': [
    [/^Comparing length with the rest of the site needs a crawl of at least four pages$/, "Для сравнения объёма текста с другими страницами сайта нужна выборка хотя бы из четырёх страниц"],
    [/^Fewer than (.*?) (.*?) pages to compare$/s, (minimum, kind) => `Для сравнения доступно меньше ${minimum} страниц этого типа (${pageKind(kind)})`],
    [/^(.*?) words is within the (.*?) median of (.*?)$/s, (words, kind, median) => `Объём текста (${words} ${plural(words, "слово", "слова", "слов")}) в пределах обычного для типа «${pageKind(kind)}». Медиана: ${median}`],
    [/^(.*?) words is under half the (.*?) median of (.*?)$/s, (words, kind, median) => `Объём текста (${words} ${plural(words, "слово", "слова", "слов")}) меньше половины медианы (${median}) для типа «${pageKind(kind)}»`],
  ],
  'content-title-pattern': [
    [/^A title template needs a crawl of at least four titled pages$/, "Для выявления шаблона title обойдите хотя бы четыре страницы с title"],
    [/^Fewer than four titles to infer a template$/, "Получено меньше четырёх title для выявления шаблона"],
    [/^Titles do not share one suffix$/, "У title нет общего окончания"],
    [/^This page has no title to compare$/, "У этой страницы нет title для сравнения"],
    [/^Title follows the site suffix "(.*?)"$/s, "Title использует общее для сайта окончание \"$1\""],
    [/^Title does not use the site suffix "(.*?)" shared by (.*?) pages$/s, (dominant, dominantCount) => `В title нет окончания "${dominant}", общего для ${dominantCount} ${plural(dominantCount, "страницы", "страниц", "страниц")}`],
  ],
  'content-title-pixel-width': [
    [/^No title tag found \(handled by core rules\)$/, "Тег title отсутствует. Это проверяют основные правила"],
    [/^Title will be truncated in SERP: estimated (.*?)px \(max ~(.*?)px\)$/s, "Title будет обрезан в поисковой выдаче: около $1px (предел ~$2px)"],
    [/^Title may be truncated in SERP: estimated (.*?)px \(max ~(.*?)px\)$/s, "Title может обрезаться в поисковой выдаче: около $1px (предел ~$2px)"],
    [/^Title fits within SERP display: estimated (.*?)px$/s, "Title помещается в поисковой выдаче: около $1px"],
  ],
  'content-title-same-as-description': [
    [/^Title or meta description is missing \(handled by other rules\)$/, "Title или метатег description отсутствует. Это проверяют другие правила"],
    [/^Title tag and meta description are identical$/, "Текст title и метатега description совпадает"],
    [/^Title tag and meta description are different$/, "Текст title отличается от метатега description"],
  ],
  'content-title-same-as-h1': [
    [/^Title or H1 is missing \(handled by other rules\)$/, "Title или H1 отсутствует. Это проверяют другие правила"],
    [/^Title tag and H1 heading are identical$/, "Текст title и H1 совпадает"],
    [/^Title tag and H1 heading are different$/, "Текст title отличается от H1"],
  ],
  'content-unrendered-markup': [
    [/^No unrendered Markdown in visible text$/, "В видимом тексте нет необработанной разметки Markdown"],
    [/^Visible text contains unrendered Markdown: (.*?)$/s, "В видимом тексте осталась необработанная разметка Markdown: $1"],
  ],
  'content-word-count': [
    [/^Extremely thin content: (.*?) words \(minimum (.*?) recommended\)$/s, (wordCount, threshold) => `Очень мало текста: ${wordCount} ${plural(wordCount, "слово", "слова", "слов")} (рекомендуется хотя бы ${threshold})`],
    [/^Thin content detected: (.*?) words \((.*?)\+ recommended\)$/s, (wordCount, threshold) => `Мало текста: ${wordCount} ${plural(wordCount, "слово", "слова", "слов")} (рекомендуется ${threshold}+)`],
    [/^Adequate content length: (.*?) words(.*?)$/s, (wordCount, note) => `Объём текста достаточный: ${wordCount} ${plural(wordCount, "слово", "слова", "слов")}${wordCountNote(note)}`],
  ],

  // core
  'core-canonical-attributes': [
    [/^No canonical element present$/, "Элемент canonical отсутствует"],
    [/^Canonical element carries invalid attribute\(s\): (.*?)$/s, "У элемента canonical недопустимые атрибуты: $1"],
    [/^Canonical element carries superfluous attribute\(s\): (.*?)$/s, "У элемента canonical лишние атрибуты: $1"],
    [/^Canonical element carries only rel and href attributes$/, "У элемента canonical есть только атрибуты rel и href"],
  ],
  'core-canonical-conflicting': [
    [/^No conflicting canonical URLs detected \(at most one canonical source present\)$/, "Конфликтующих URL canonical нет. Указан максимум один источник canonical"],
    [/^HTML canonical and Link header canonical point to the same URL$/, "Canonical в HTML и заголовке Link указывает на один URL"],
    [/^Conflicting canonical URLs: HTML tag specifies "(.*?)" but Link header specifies "(.*?)"$/s, "Конфликт URL canonical: в HTML-теге указан \"$1\", в заголовке Link указан \"$2\""],
  ],
  'core-canonical-external': [
    [/^No canonical tag declared$/, "Тег canonical отсутствует"],
    [/^Canonical URL could not be parsed for host comparison$/, "Не удалось разобрать URL canonical для сравнения хостов"],
    [/^Canonical points to an external host: (.*?)$/s, "Canonical указывает на внешний хост: $1"],
    [/^Canonical points to a URL on the same host$/, "Canonical указывает на URL на том же хосте"],
  ],
  'core-canonical-fragment': [
    [/^No canonical declared$/, "Canonical не указан"],
    [/^The canonical URL has no fragment$/, "В URL canonical нет фрагмента"],
    [/^The canonical uses a hash-bang URL \((.*?)\); search engines ignore the fragment, so it points at (.*?)$/s, "Canonical использует URL с #! ($1). Поисковые системы игнорируют фрагмент и видят адрес $2"],
    [/^The canonical has a fragment \((.*?)\); search engines ignore it, so it points at (.*?)$/s, "В canonical есть фрагмент ($1). Поисковые системы игнорируют его и видят адрес $2"],
  ],
  'core-canonical-header': [
    [/^No conflicting canonical signals \(neither HTML tag nor Link header present\)$/, "Canonical отсутствует и в HTML-теге, и в заголовке Link"],
    [/^Single canonical signal present \(no conflict\)$/, "Canonical указан в одном месте, конфликта нет"],
    [/^HTML canonical and Link header match$/, "Canonical в HTML и заголовке Link совпадает"],
    [/^Canonical mismatch: HTML tag "(.*?)" differs from Link header "(.*?)"$/s, "Canonical не совпадает: в HTML-теге \"$1\", в заголовке Link \"$2\""],
  ],
  'core-canonical-http-mismatch': [
    [/^No canonical tag present; skipping protocol check$/, "Тег canonical отсутствует, сравнение протоколов пропущено"],
    [/^Canonical URL could not be parsed; skipping protocol check$/, "Не удалось разобрать URL canonical, сравнение протоколов пропущено"],
    [/^Page URL could not be parsed; skipping protocol check$/, "Не удалось разобрать URL страницы, сравнение протоколов пропущено"],
    [/^Page and canonical use the same protocol \((.*?)\)$/s, "Страница и canonical используют один протокол ($1)"],
    [/^Protocol mismatch: page is (.*?) but canonical points to (.*?) \("(.*?)"\)$/s, "Протоколы различаются: у страницы $1, у canonical $2 (\"$3\")"],
  ],
  'core-canonical-loop': [
    [/^No canonical tag present; no loop risk$/, "Тег canonical отсутствует, риска зацикливания нет"],
    [/^Canonical URL could not be parsed; skipping loop check$/, "Не удалось разобрать URL canonical, проверка на зацикливание пропущена"],
    [/^Canonical is self-referencing \(best practice\)$/, "Canonical указывает на эту же страницу"],
    [/^Canonical points to a different URL \("(.*?)"\); verify the target does not canonicalize back to this page$/s, "Canonical указывает на другой URL (\"$1\"). Проверьте, что canonical по этому адресу не указывает обратно на эту страницу"],
  ],
  'core-canonical-multiple': [
    [/^At most one canonical element in the HTML$/, "В HTML не больше одного элемента canonical"],
    [/^(\d+) canonical elements specify different URLs: (.*?)$/s, "Элементы canonical ($1) указывают на разные URL: $2"],
    [/^(\d+) identical canonical elements found \("(.*?)"\)$/s, (hrefCount, value) => `Обнаружено ${hrefCount} ${plural(hrefCount, "одинаковый элемент", "одинаковых элемента", "одинаковых элементов")} canonical ("${value}")`],
  ],
  'core-canonical-outside-head': [
    [/^No canonical element outside the <head>$/, "За пределами <head> нет элементов canonical"],
    [/^(\d+) canonical element\(s\) found outside the <head>: (.*?)$/s, "Элементы canonical вне <head> ($1): $2"],
  ],
  'core-canonical-present': [
    [/^No <link rel="canonical"> tag found in the document$/, "В документе нет тега <link rel=\"canonical\">"],
    [/^Canonical link tag exists but has no href$/, "У тега canonical нет href"],
    [/^Canonical URL tag is present$/, "Тег с URL canonical присутствует"],
  ],
  'core-canonical-to-homepage': [
    [/^No canonical tag present; skipping homepage check$/, "Тег canonical отсутствует, проверка ссылки на главную пропущена"],
    [/^Could not parse page URL; skipping check$/, "Не удалось разобрать URL страницы, проверка пропущена"],
    [/^Page is the homepage; canonical to homepage is expected$/, "Canonical главной страницы корректно указывает на главную"],
    [/^Canonical URL could not be resolved; skipping homepage check$/, "Не удалось определить URL canonical, проверка ссылки на главную пропущена"],
    [/^Non-homepage page canonicalizes to homepage: canonical is "(.*?)" but page path is "(.*?)"$/s, "Canonical внутренней страницы указывает на главную: canonical \"$1\", путь страницы \"$2\""],
    [/^Canonical URL does not point to the homepage$/, "URL canonical не ведёт на главную страницу"],
  ],
  'core-canonical-to-noindex': [
    [/^No canonical tag present; no noindex conflict possible$/, "Тег canonical отсутствует, конфликта с noindex нет"],
    [/^Canonical URL could not be parsed; skipping noindex conflict check$/, "Не удалось разобрать URL canonical, проверка конфликта с noindex пропущена"],
    [/^No noindex directive found; no conflict with canonical$/, "Директивы noindex нет, конфликта с canonical нет"],
    [/^Page has noindex with self-referencing canonical; no conflicting signals$/, "На странице есть noindex, canonical указывает на эту же страницу. Конфликта нет"],
    [/^Page has both noindex and a canonical pointing to "(.*?)" \(conflicting signals\)$/s, "На странице задан noindex, а canonical указывает на \"$1\". Директивы конфликтуют"],
  ],
  'core-canonical-valid': [
    [/^No <link rel="canonical"> tag found in the document$/, "В документе нет тега <link rel=\"canonical\">"],
    [/^Canonical link tag exists but has no href$/, "У тега canonical нет href"],
    [/^Canonical URL is not a valid absolute URL: "(.*?)"$/s, "Canonical должен быть корректным абсолютным URL: \"$1\""],
    [/^Canonical URL is a valid absolute URL$/, "Canonical задан корректным абсолютным URL"],
  ],
  'core-description-length': [
    [/^No <meta name="description"> tag found in the document$/, "В документе нет тега <meta name=\"description\">"],
    [/^Meta description tag exists but has no content$/, "У метатега description нет значения content"],
    [/^Meta description is too short \((.*?) characters\)\. Recommended: (.*?)-(.*?) characters$/s, (length, minLength, maxLength) => `Метатег description слишком короткий (${length} ${plural(length, "символ", "символа", "символов")}). Рекомендуемая длина: ${minLength}-${maxLength} символов`],
    [/^Meta description is too long \((.*?) characters\)\. Recommended: (.*?)-(.*?) characters$/s, (length, minLength, maxLength) => `Метатег description слишком длинный (${length} ${plural(length, "символ", "символа", "символов")}). Рекомендуемая длина: ${minLength}-${maxLength} символов`],
    [/^Meta description length is optimal \((.*?) characters\)$/s, (length) => `Длина метатега description оптимальна (${length} ${plural(length, "символ", "символа", "символов")})`],
  ],
  'core-description-present': [
    [/^No <meta name="description"> tag found in the document$/, "В документе нет тега <meta name=\"description\">"],
    [/^Meta description tag exists but has no content$/, "У метатега description нет значения content"],
    [/^Meta description tag is present$/, "Метатег description присутствует"],
  ],
  'core-favicon-present': [
    [/^No favicon link tag found in the document$/, "В документе нет ссылки на значок сайта"],
    [/^Favicon link tag exists but has no href$/, "У ссылки на значок сайта нет href"],
    [/^Favicon link tag is present$/, "Ссылка на значок сайта присутствует"],
  ],
  'core-h1-present': [
    [/^No <h1> tag found in the document$/, "В документе нет тега <h1>"],
    [/^H1 tag exists but is empty$/, "Тег H1 пустой"],
    [/^H1 tag is present$/, "Тег H1 присутствует"],
  ],
  'core-h1-single': [
    [/^No <h1> tag found in the document$/, "В документе нет тега <h1>"],
    [/^Multiple <h1> tags found \((.*?)\)\. Best practice is to have only one <h1> per page$/s, "Обнаружено несколько тегов <h1> ($1). Оставьте один <h1> на странице"],
    [/^Document has exactly one <h1> tag$/, "В документе ровно один тег <h1>"],
  ],
  'core-nosnippet': [
    [/^Page blocks search snippets: (.*?)$/s, (issues) => `Страница запрещает сниппеты в поиске: ${snippetIssues(issues)}`],
    [/^Page allows search engine snippets$/, "Страница разрешает поисковым системам показывать сниппеты"],
  ],
  'core-obsolete-robots-directives': [
    [/^No robots directives on this page$/, "На странице нет директив robots"],
    [/^No obsolete robots directives$/, "Устаревших директив robots нет"],
    [/^(.*?) (.*?) no effect and can be removed$/s, (names) => `Можно удалить директивы ${joinWithAnd(names)}. Они не действуют`],
  ],
  'core-robots-directive-mismatch': [
    [/^No robots directives declared in HTML or HTTP header$/, "Директивы robots не заданы ни в HTML, ни в HTTP-заголовке"],
    [/^Conflicting robots directives between HTML and X-Robots-Tag header: (.*?)$/s, "Директивы robots в HTML и заголовке X-Robots-Tag конфликтуют: $1"],
    [/^Robots directives declared multiple times: (.*?)$/s, (directives) => `Директивы robots заданы несколько раз: ${repeatedRobots(directives)}`],
    [/^Robots directives are consistent between HTML and HTTP header$/, "Директивы robots в HTML и HTTP-заголовке согласованы"],
  ],
  'core-robots-meta': [
    [/^Restrictive indexing directives found: (.*?)$/s, "Обнаружены ограничения индексации: $1"],
    [/^No robots meta tag found \(default: index, follow\)$/, "Метатег robots отсутствует (по умолчанию: index, follow)"],
    [/^Robots directives allow indexing$/, "Директивы robots разрешают индексацию"],
  ],
  'core-title-length': [
    [/^No <title> tag found in the document$/, "В документе нет тега <title>"],
    [/^Title tag exists but is empty$/, "Тег title пустой"],
    [/^Title is too short \((.*?) characters\)\. Recommended: (.*?)-(.*?) characters$/s, (length, minLength, maxLength) => `Title слишком короткий (${length} ${plural(length, "символ", "символа", "символов")}). Рекомендуемая длина: ${minLength}-${maxLength} символов`],
    [/^Title is too long \((.*?) characters\)\. Recommended: (.*?)-(.*?) characters$/s, (length, minLength, maxLength) => `Title слишком длинный (${length} ${plural(length, "символ", "символа", "символов")}). Рекомендуемая длина: ${minLength}-${maxLength} символов`],
    [/^Title length is optimal \((.*?) characters\)$/s, (length) => `Длина title оптимальна (${length} ${plural(length, "символ", "символа", "символов")})`],
  ],
  'core-title-present': [
    [/^No <title> tag found in the document$/, "В документе нет тега <title>"],
    [/^Title tag exists but is empty$/, "Тег title пустой"],
    [/^Title tag is present$/, "Тег title присутствует"],
  ],
  'core-title-unique': [
    [/^Page has no title tag$/, "У страницы нет тега title"],
    [/^Title uniqueness needs other pages to compare against - run with --crawl$/, "Запустите аудит с --crawl, чтобы сравнить title с другими страницами"],
    [/^Not compared: (.*?)$/s, (reason) => `Сравнение пропущено: ${eligibilityReason(reason)}`],
    [/^Duplicate title found on (.*?) pages$/s, (count) => `Одинаковый title на ${count} ${plural(count, "странице", "страницах", "страницах")}`],
    [/^Page title is unique$/, "Title страницы уникален"],
  ],
  'core-unavailable-after': [
    [/^No unavailable_after directive on this page$/, "На странице нет директивы unavailable_after"],
    [/^unavailable_after (.*?) has passed: Google no longer shows this page$/s, "Срок unavailable_after $1 истёк. Google больше не показывает эту страницу"],
    [/^unavailable_after (.*?) is (.*?) day\(s\) away: the page will leave search results then$/s, (date, days) => `До даты unavailable_after ${date} осталось ${days} ${plural(days, "день", "дня", "дней")}. После этого страница исчезнет из поиска`],
    [/^unavailable_after date not understood: (.*?)$/s, "Не удалось распознать дату unavailable_after: $1"],
    [/^unavailable_after (.*?): the page leaves search results on that date$/s, "Страница исчезнет из поиска в дату unavailable_after $1"],
  ],
  'core-viewport-present': [
    [/^No <meta name="viewport"> tag found in the document$/, "В документе нет тега <meta name=\"viewport\">"],
    [/^Viewport meta tag exists but has no content$/, "У метатега viewport нет значения content"],
    [/^Viewport meta tag is present$/, "Метатег viewport присутствует"],
  ],

  // crawl
  'crawl-blocked-images': [
    [/^robots\.txt was not fetched, so disallow status of image URLs is unknown$/, "Не удалось получить robots.txt, поэтому неизвестно, разрешён ли обход URL изображений"],
    [/^Page URL could not be parsed, so image URLs cannot be resolved against it$/, "Не удалось разобрать URL страницы и определить по нему адреса изображений"],
    [/^(\d+) image URL\(s\) are disallowed by robots\.txt$/, "robots.txt запрещает обход $1 URL изображений"],
    [/^No images are disallowed by robots\.txt \((.*?) checked\)$/s, "robots.txt не запрещает обход изображений (проверено: $1)"],
  ],
  'crawl-blocked-resources': [
    [/^No robots\.txt content available to check$/, "Нет содержимого robots.txt для проверки"],
    [/^No Disallow rules found in robots\.txt$/, "В robots.txt нет директив Disallow"],
    [/^robots\.txt may block CSS\/JS resources: (.*?)$/s, (issues) => `robots.txt может блокировать ресурсы CSS/JS: ${blockedResourceIssues(issues)}`],
    [/^robots\.txt does not block important CSS\/JS resources$/, "robots.txt разрешает обход важных ресурсов CSS/JS"],
  ],
  'crawl-canonical-chain': [
    [/^Following the canonical chain needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проследить цепочку canonical по страницам"],
    [/^No canonical tag declared$/, "Тег canonical отсутствует"],
    [/^Canonical is self-referencing$/, "Canonical указывает на эту же страницу"],
    [/^Canonical target is a final destination$/, "URL canonical указывает на конечный адрес"],
    [/^Canonical chain leaves the crawled set, so its end is unknown$/, "Цепочка canonical выходит за пределы обхода. Конечный адрес неизвестен"],
    [/^Canonical forms a loop - reported by crawl-canonical-loop$/, "Canonical образует цикл. Подробнее в результате crawl-canonical-loop"],
    [/^Canonical points to a URL that is itself canonicalized elsewhere$/, "Canonical указывает на URL, у которого canonical ведёт на другой адрес"],
  ],
  'crawl-canonical-form-drift': [
    [/^Canonical form comparison needs a crawl of at least two pages — run with --crawl$/, "Запустите аудит с --crawl, чтобы сравнить формат canonical хотя бы на двух страницах"],
    [/^Fewer than two canonicals to compare$/, "Найдено меньше двух canonical для сравнения"],
    [/^Canonicals use one host, scheme, and slash form$/, "У canonical совпадают хост, схема и форма завершающего слеша"],
    [/^Canonicals disagree on (.*?)$/s, (issues) => `Canonical различаются: ${canonicalDrift(issues)}`],
  ],
  'crawl-canonical-loop': [
    [/^Following the canonical chain needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проследить цепочку canonical по страницам"],
    [/^No canonical tag declared$/, "Тег canonical отсутствует"],
    [/^Canonical is self-referencing$/, "Canonical указывает на эту же страницу"],
    [/^Canonical chain resolves to a final destination$/, "У цепочки canonical есть конечный адрес"],
    [/^Canonical chain leaves the crawled set, so a loop cannot be ruled out$/, "Цепочка canonical выходит за пределы обхода, поэтому нельзя исключить цикл"],
    [/^Canonical chain does not loop$/, "В цепочке canonical нет цикла"],
    [/^Canonical targets form a loop with no final destination$/, "Адреса canonical образуют цикл без конечного адреса"],
  ],
  'crawl-canonical-redirect': [
    [/^No canonical tag found$/, "Тег canonical отсутствует"],
    [/^Canonical URL is malformed$/, "URL canonical имеет неверный формат"],
    [/^Could not verify canonical URL: (.*?)$/s, (error) => `Не удалось проверить URL canonical: ${canonicalError(error)}`],
    [/^Canonical URL returns HTTP (.*?)$/s, "URL canonical возвращает HTTP $1"],
    [/^Canonical URL (?:has (\d+)-redirect chain|redirects to another URL)$/, canonicalRedirect],
    [/^Canonical is self-referencing and does not redirect$/, "Canonical указывает на эту же страницу и не перенаправляет"],
    [/^Canonical URL does not redirect$/, "URL canonical не перенаправляет"],
  ],
  'crawl-canonical-to-disallowed': [
    [/^Checking the canonical target needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить адрес canonical по данным обхода"],
    [/^Canonical tag is declared but unresolvable - nothing to cross-reference$/, "Тег canonical задан, но его адрес не удалось определить для проверки"],
    [/^No canonical tag declared$/, "Тег canonical отсутствует"],
    [/^Canonical is self-referencing$/, "Canonical указывает на эту же страницу"],
    [/^Canonical target was not crawled, so its robots\.txt state is unknown$/, "Страница canonical не попала в обход. Действие robots.txt для неё неизвестно"],
    [/^Canonical points to a URL disallowed by robots\.txt$/, "Canonical указывает на URL, обход которого запрещён в robots.txt"],
    [/^Canonical target is crawlable$/, "Обход адреса canonical разрешён"],
  ],
  'crawl-canonical-to-noindex': [
    [/^Checking the canonical target needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить адрес canonical по данным обхода"],
    [/^Canonical tag is declared but unresolvable - nothing to cross-reference$/, "Тег canonical задан, но его адрес не удалось определить для проверки"],
    [/^No canonical tag declared$/, "Тег canonical отсутствует"],
    [/^Canonical is self-referencing$/, "Canonical указывает на эту же страницу"],
    [/^Canonical target was not crawled, so its robots state is unknown$/, "Страница canonical не попала в обход. Директивы robots для неё неизвестны"],
    [/^Canonical points to a URL that is noindex$/, "Canonical указывает на URL с noindex"],
    [/^Canonical target is indexable$/, "Индексация адреса canonical разрешена"],
  ],
  'crawl-crawl-delay': [
    [/^No robots\.txt content available to check$/, "Нет содержимого robots.txt для проверки"],
    [/^No Crawl-delay directive found in robots\.txt$/, "В robots.txt нет директивы Crawl-delay"],
    [/^Crawl-delay is (.*?) seconds \(excessive for user-agent: (.*?)\)$/s, (delay, userAgent) => `Crawl-delay для user-agent ${userAgent} слишком велик (в секундах): ${delay}`],
    [/^Crawl-delay is (.*?) second\(s\) for user-agent: (.*?) \(reasonable\)$/s, (delay, userAgent) => `Crawl-delay для user-agent ${userAgent} в норме (в секундах): ${delay}`],
  ],
  'crawl-hreflang-disallowed-target': [
    [/^Checking incoming hreflang needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить входящие ссылки hreflang"],
    [/^This page has no crawl record, so its robots\.txt state is unknown$/, "Страница отсутствует в результатах обхода. Действие robots.txt для неё неизвестно"],
    [/^Page is not disallowed by robots\.txt$/, "Файл robots.txt разрешает обход страницы"],
    [/^Page is disallowed by robots\.txt but (\d+) crawled page\(s\) point hreflang annotations at it$/, (referringCount) => `Файл robots.txt запрещает обход страницы. На неё ссылаются через hreflang ${referringCount} ${plural(referringCount, "страница", "страницы", "страниц")} из обхода`],
    [/^Page is disallowed but no crawled page points hreflang annotations at it$/, "Обход страницы запрещён. Другие страницы из обхода не ссылаются на неё через hreflang"],
  ],
  'crawl-hreflang-incoming-conflict': [
    [/^Comparing incoming hreflang annotations needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы сравнить входящие ссылки hreflang"],
    [/^No other crawled page annotates this URL with hreflang$/, "Другие страницы из обхода не указывают на этот URL через hreflang"],
    [/^Incoming hreflang annotations agree: this URL is "(.*?)"$/s, "Входящие hreflang согласованы: для этого URL указан \"$1\""],
    [/^Other pages annotate this URL with (\d+) different hreflang codes$/, (sourcesByCodeCount) => `Другие страницы указывают для этого URL ${sourcesByCodeCount} ${plural(sourcesByCodeCount, "разный код", "разных кода", "разных кодов")} hreflang`],
  ],
  'crawl-hreflang-reciprocity': [
    [/^Checking hreflang return tags needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить обратные ссылки hreflang"],
    [/^No hreflang annotations on this page$/, "На странице нет hreflang"],
    [/^None of the hreflang targets were crawled, so their return tags cannot be checked$/, "Ни одна страница hreflang не попала в обход. Проверить обратные ссылки невозможно"],
    [/^(\d+) hreflang target\(s\) do not annotate this page in return$/, (missingReturnCount) => `У ${missingReturnCount} ${plural(missingReturnCount, "адреса", "адресов", "адресов")} hreflang нет обратной ссылки на эту страницу`],
    [/^All crawled hreflang targets annotate this page in return$/, "Все проверенные страницы hreflang ссылаются обратно на эту страницу"],
  ],
  'crawl-hreflang-to-disallowed': [
    [/^Checking hreflang targets needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить адреса hreflang"],
    [/^No hreflang annotations on this page$/, "На странице нет hreflang"],
    [/^(\d+) hreflang annotation\(s\) point to robots\.txt-disallowed URL\(s\)$/, "Найдены hreflang, указывающие на URL с запретом обхода в robots.txt ($1)"],
    [/^None of the hreflang targets were crawled, so their robots\.txt state is unknown$/, "Ни один адрес hreflang не попал в обход. Действие robots.txt для них неизвестно"],
    [/^No hreflang annotation points to a disallowed URL$/, "Ни один hreflang не указывает на URL, обход которого запрещён"],
  ],
  'crawl-hreflang-to-noindex': [
    [/^Checking hreflang targets needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить адреса hreflang"],
    [/^No hreflang annotations on this page$/, "На странице нет hreflang"],
    [/^(\d+) hreflang annotation\(s\) point to noindex URL\(s\)$/, "Найдены hreflang, указывающие на URL с noindex ($1)"],
    [/^None of the hreflang targets were crawled, so their robots state is unknown$/, "Ни один адрес hreflang не попал в обход. Директивы robots для них неизвестны"],
    [/^No hreflang annotation points to a noindex URL$/, "Ни один hreflang не указывает на URL с noindex"],
  ],
  'crawl-indexability-conflict': [
    [/^No robots\.txt found \(no conflict possible\)$/, "Файл robots.txt не найден. Конфликта нет"],
    [/^Could not access robots\.txt to check for conflicts$/, "Не удалось получить robots.txt для проверки конфликтов"],
    [/^Page is blocked by robots\.txt AND has noindex \(redundant\)$/, "Страница одновременно закрыта в robots.txt и помечена noindex. Эти ограничения избыточны"],
    [/^robots\.txt allows crawling, noindex prevents indexing \(functional but check if intentional\)$/, "Файл robots.txt разрешает обход, noindex запрещает индексацию. Проверьте, что это задано намеренно"],
    [/^Page blocked by robots\.txt \((.*?)\) but has no noindex$/s, "Файл robots.txt запрещает обход страницы ($1), директива noindex отсутствует"],
    [/^No indexability conflict detected$/, "Конфликтов директив индексации нет"],
  ],
  'crawl-indexable-not-in-sitemap': [
    [/^Needs a crawl to compare pages with the sitemap - run with --crawl$/, "Запустите аудит с --crawl, чтобы сравнить список страниц с sitemap"],
    [/^No sitemap was found \(technical-sitemap-exists reports it\)$/, "Не удалось найти sitemap. Подробнее в результате technical-sitemap-exists"],
    [/^The sitemap could not be read in full \((.*?)\)$/s, (gaps) => `Не удалось прочитать sitemap полностью (${sitemapGaps(gaps)})`],
    [/^Not checked: (.*?)$/s, (reason) => `Проверка пропущена: ${eligibilityReason(reason)}`],
    [/^The page is listed in the sitemap$/, "Страница есть в sitemap"],
    [/^An indexable page is missing from the sitemap$/, "Страница доступна для индексации, но отсутствует в sitemap"],
  ],
  'crawl-isolated-url': [
    [/^Checking how the URL was discovered needs the crawl's per-URL discovery records - run with --crawl to build them$/, "Запустите аудит с --crawl, чтобы собрать сведения об обнаружении каждого URL"],
    [/^No discovery record for this URL - its reachability cannot be judged$/, "Для этого URL нет сведений об обнаружении. Оценить его доступность по ссылкам невозможно"],
    [/^Crawl entry point$/, "Начальная страница обхода"],
    [/^URL is isolated: it can only be found via (.*?)$/s, (sources) => `На URL не ведут ссылки. Его удалось обнаружить только через ${discoverySources(sources)}`],
    [/^Discovery records show an inbound link but the link graph has none - the records disagree$/, "В записях об обнаружении есть входящая ссылка, а в графе ссылок её нет. Данные расходятся"],
    [/^URL is only reachable through noindex,follow page\(s\): (.*?)$/s, "URL доступен только со страниц с noindex,follow: $1"],
    [/^URL is only linked from other isolated URLs: (.*?)$/s, "На URL ссылаются только другие изолированные страницы: $1"],
    [/^URL is reachable through internal links$/, "На URL ведут внутренние ссылки"],
  ],
  'crawl-noindex-in-sitemap': [
    [/^Page is indexable \(no noindex directive\)$/, "Страница доступна для индексации, директивы noindex нет"],
    [/^Page has noindex but could not verify sitemap status$/, "У страницы задан noindex. Проверить её наличие в sitemap не удалось"],
    [/^Page has noindex directive but is listed in sitemap \(conflicting signals\)$/, "На странице задан noindex, но она есть в sitemap. Директивы конфликтуют"],
    [/^Page has noindex and is not in sitemap \(consistent\)$/, "На странице задан noindex, и её нет в sitemap"],
  ],
  'crawl-pagination-broken': [
    [/^No pagination links found \(rel="next"\/"prev"\)$/, "Ссылки пагинации не найдены (rel=\"next\"/\"prev\")"],
    [/^Pagination (.*?) link\(s\) have invalid URLs$/s, (brokenRels) => `Некорректные URL у ссылок пагинации: ${joinWithAnd(brokenRels)}`],
    [/^Pagination (.*?) link\(s\) have valid URLs$/s, (validRels) => `Корректные URL у ссылок пагинации: ${joinWithAnd(validRels)}`],
  ],
  'crawl-pagination-canonical': [
    [/^Page does not appear to be paginated$/, "Признаков пагинации у страницы нет"],
    [/^Paginated page is missing canonical tag$/, "У страницы пагинации нет тега canonical"],
    [/^Paginated page has self-referencing canonical \(correct\)$/, "Canonical страницы пагинации правильно указывает на неё саму"],
    [/^Paginated page (.*?) canonicalizes to page 1 \(incorrect\)$/s, "Canonical страницы пагинации $1 ошибочно указывает на страницу 1"],
    [/^Paginated page canonical does not match current URL$/, "Canonical страницы пагинации не совпадает с текущим URL"],
  ],
  'crawl-pagination-isolated': [
    [/^Counting incoming links needs the site-wide crawl graph - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать граф сайта и посчитать входящие ссылки"],
    [/^Page does not appear to be paginated$/, "Признаков пагинации у страницы нет"],
    [/^Crawl entry point$/, "Начальная страница обхода"],
    [/^Paginated URL \((.*?)\) has no incoming internal links$/s, "На URL страницы пагинации ($1) не ведут внутренние ссылки"],
    [/^Paginated URL has (.*?) incoming internal link\(s\)$/s, (inboundCount) => `На URL страницы пагинации ведут ${inboundCount} ${plural(inboundCount, "внутренняя ссылка", "внутренние ссылки", "внутренних ссылок")}`],
  ],
  'crawl-pagination-loop': [
    [/^No pagination links found \(rel="next"\/"prev"\)$/, "Ссылки пагинации не найдены (rel=\"next\"/\"prev\")"],
    [/^Pagination (.*?) points back to the current page \(infinite loop\)$/s, (loopRels) => `Ссылки пагинации (${joinWithAnd(loopRels)}) ведут обратно на текущую страницу, образуя бесконечный цикл`],
    [/^Pagination links do not create a loop$/, "Ссылки пагинации не образуют цикла"],
  ],
  'crawl-pagination-noindex': [
    [/^Page is not paginated \(no rel="next"\/"prev" links\)$/, "У страницы нет пагинации (нет ссылок rel=\"next\"/\"prev\")"],
    [/^Paginated page has noindex directive \(via (.*?)\)$/s, (sources) => `У страницы пагинации задан noindex (${paginationSources(sources)})`],
    [/^Paginated page is not noindexed \(correct\)$/, "У страницы пагинации нет noindex"],
  ],
  'crawl-pagination-orphaned': [
    [/^Paginated page has rel="next" and\/or rel="prev" links$/, "У страницы пагинации есть хотя бы одна из ссылок rel=\"next\" и rel=\"prev\""],
    [/^Page does not appear to be paginated$/, "Признаков пагинации у страницы нет"],
    [/^URL appears paginated \((.*?)\) but is missing rel="next"\/"prev" link tags$/s, "URL выглядит как адрес страницы пагинации ($1), но ссылок rel=\"next\"/\"prev\" нет"],
  ],
  'crawl-pagination-sequence': [
    [/^Only one pagination direction present \(sequence check not applicable\)$/, "Есть только одно направление пагинации. Сравнивать ссылки не требуется"],
    [/^No pagination links found$/, "Ссылки пагинации не найдены"],
    [/^Cannot validate sequence: next link URL is invalid$/, "Не удалось проверить последовательность: URL ссылки next некорректен"],
    [/^Cannot validate sequence: prev link URL is invalid$/, "Не удалось проверить последовательность: URL ссылки prev некорректен"],
    [/^Pagination next and prev links point to the same URL \(broken sequence\)$/, "Ссылки пагинации next и prev ведут на один URL, последовательность нарушена"],
    [/^Pagination next and prev links point to different pages \(correct sequence\)$/, "Ссылки пагинации next и prev ведут на разные страницы"],
  ],
  'crawl-pdf-size': [
    [/^No PDF links on the page$/, "На странице нет ссылок на PDF"],
    [/^Linked PDFs are within 10 MB, or their size was not advertised$/, "Размер PDF по ссылкам не превышает 10 MB или сервер не сообщил размер"],
    [/^Linked PDF over 10 MB: (.*?)$/s, "PDF по ссылкам превышают 10 MB: $1"],
  ],
  'crawl-schema-noindex-conflict': [
    [/^Page is noindexed but has no rich result schema \(no conflict\)$/, "Страница закрыта через noindex, разметки для расширенных результатов нет. Конфликта нет"],
    [/^Page has (\d+) rich result schema type\(s\) and is indexable$/, "Страница доступна для индексации. Типы разметки для расширенных результатов: $1"],
    [/^Page has no rich result schema$/, "На странице нет разметки для расширенных результатов"],
    [/^Page has (\d+) rich result schema type\(s\) but is blocked from indexing$/, "Индексация страницы запрещена. Типы разметки для расширенных результатов: $1"],
  ],
  'crawl-sitemap-cross-duplicates': [
    [/^Per-page crawl data needs a multi-page crawl - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать данные по нескольким страницам"],
    [/^No sitemap URLs available to check for cross-sitemap duplication$/, "Нет URL из sitemap для поиска дублей между файлами"],
    [/^Which sitemap documents declared each URL was not recorded, so cross-sitemap duplication cannot be checked$/, "Не записано, в каких sitemap объявлены URL, поэтому сравнить их невозможно"],
    [/^(\d+) URL\(s\) are declared in more than one sitemap document$/, "В нескольких sitemap указаны одни и те же URL ($1)"],
    [/^No URL is declared by more than one sitemap document \((\d+) URLs tracked\)$/, "Каждый URL указан максимум в одном sitemap (проверено URL: $1)"],
  ],
  'crawl-sitemap-date-drift': [
    [/^Sitemap entries were not fetched, so lastmod cannot be compared with dateModified$/, "Записи sitemap не получены, поэтому сравнить lastmod с dateModified невозможно"],
    [/^No lastmod and dateModified pair to compare$/, "Нет пары lastmod и dateModified для сравнения"],
    [/^lastmod and dateModified are both (.*?)$/s, "Значения lastmod и dateModified совпадают: $1"],
    [/^Sitemap lastmod (.*?) disagrees with schema dateModified (.*?)$/s, "Значение lastmod в sitemap ($1) не совпадает с dateModified в разметке ($2)"],
  ],
  'crawl-sitemap-disallowed': [
    [/^Per-page crawl data needs a multi-page crawl - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать данные по нескольким страницам"],
    [/^No sitemap URLs available to cross-reference against robots\.txt$/, "Нет URL из sitemap для сверки с robots.txt"],
    [/^(\d+) sitemap URL\(s\) are disallowed by robots\.txt$/, "Файл robots.txt запрещает обход $1 URL из sitemap"],
    [/^robots\.txt was not fetched, so disallow status of sitemap URLs is unknown$/, "Не удалось получить robots.txt, поэтому неизвестно, разрешён ли обход URL из sitemap"],
    [/^No sitemap URLs are disallowed by robots\.txt \((.*?) checked\)$/s, "Файл robots.txt не запрещает обход URL из sitemap (проверено: $1)"],
  ],
  'crawl-sitemap-domain': [
    [/^Could not determine expected domain from URL$/, "Не удалось определить ожидаемый домен по URL"],
    [/^Could not find sitemap to validate$/, "Не найден sitemap для проверки"],
    [/^Sitemap index contains no sitemap URLs$/, "Индекс sitemap не содержит ссылок на sitemap"],
    [/^Sitemap contains no page URLs$/, "В sitemap нет URL страниц"],
    [/^All (\d+) sitemap URLs belong to the expected domain$/, "Все URL из sitemap относятся к ожидаемому домену (проверено: $1)"],
    [/^(\d+) of (\d+) sitemap URLs \((\d+(?:\.\d+)?)%\) have incorrect domain$/, "У $1 из $2 URL в sitemap ($3%) указан неверный домен"],
    [/^(\d+) sitemap URL\(s\) have different domain than expected$/, "У $1 URL в sitemap домен отличается от ожидаемого"],
  ],
  'crawl-sitemap-duplicate-urls': [
    [/^No sitemap URLs available to check$/, "Нет URL из sitemap для проверки"],
    [/^Sitemap contains (\d+) duplicate URL\(s\)$/, "Дубли URL в sitemap: $1"],
    [/^All (\d+) sitemap URLs are unique$/, "Все URL в sitemap уникальны (проверено: $1)"],
  ],
  'crawl-sitemap-in-robotstxt': [
    [/^No robots\.txt content available to check$/, "Нет содержимого robots.txt для проверки"],
    [/^robots\.txt does not reference a sitemap$/, "В robots.txt нет ссылки на sitemap"],
    [/^robots\.txt references (\d+) sitemap\(s\)$/, (sitemapDirectiveCount) => `В robots.txt есть ${sitemapDirectiveCount} ${plural(sitemapDirectiveCount, "ссылка", "ссылки", "ссылок")} на sitemap`],
  ],
  'crawl-sitemap-lastmod': [
    [/^Sitemap not available, so lastmod values could not be checked$/, "Файл sitemap недоступен, поэтому проверить lastmod невозможно"],
    [/^No sitemap entries to check$/, "Нет записей sitemap для проверки"],
    [/^No sitemap entries declare <lastmod> \((.*?) URLs\)$/s, "В записях sitemap отсутствует <lastmod> (проверено URL: $1)"],
    [/^(\d+) sitemap entr\(ies\) have an unparseable <lastmod>: (.*?)$/s, (invalidCount, value) => `Не удалось распознать <lastmod> в ${invalidCount} ${plural(invalidCount, "записи", "записях", "записях")} sitemap. Пример: ${value}`],
    [/^(\d+) sitemap entr\(ies\) declare a <lastmod> in the future: (.*?)$/s, (futureCount, value) => `Дата <lastmod> в будущем у ${futureCount} ${plural(futureCount, "записи", "записей", "записей")} sitemap. Пример: ${value}`],
    [/^(.*?) of (.*?) URLs share the same <lastmod> \((.*?)\), which looks generated rather than genuine$/s, "У $1 из $2 URL одинаковый <lastmod> ($3). Похоже, дата задана автоматически и не отражает реальные изменения"],
    [/^Sitemap <lastmod> values look genuine \((.*?)\/(.*?) URLs dated\)$/s, "Даты <lastmod> в sitemap выглядят достоверно (дата указана для $1 из $2 URL)"],
  ],
  'crawl-sitemap-non-200': [
    [/^Per-page crawl data needs a multi-page crawl - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать данные по нескольким страницам"],
    [/^No sitemap URLs available to cross-reference against crawled status codes$/, "Нет URL из sitemap для сверки с HTTP-статусами обхода"],
    [/^(.*?) sitemap URL\(s\) return an error status \((\d+) 5xx, (\d+) 4xx\)$/s, "URL из sitemap, вернувшие ошибку: $1 ($2 с 5xx, $3 с 4xx)"],
    [/^(\d+) sitemap URL\(s\) redirect \(3xx\) and (\d+) could not be fetched during the crawl \(timed out or rate-limited\)$/, "Перенаправления (3xx) у $1 URL из sitemap. Не удалось получить ещё $2 URL из-за тайм-аута или ограничения частоты запросов"],
    [/^All (.*?) crawled sitemap URLs return a success status$/s, "Все проверенные URL из sitemap вернули успешный HTTP-статус ($1)"],
  ],
  'crawl-sitemap-non-canonical': [
    [/^Per-page crawl data needs a multi-page crawl - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы собрать данные по нескольким страницам"],
    [/^No sitemap URLs available to cross-reference against canonicals$/, "Нет URL из sitemap для сверки с canonical"],
    [/^(\d+) sitemap URL\(s\) canonicalise to a different URL$/, "Canonical у $1 URL из sitemap указывает на другой адрес"],
    [/^No sitemap URLs canonicalise to a different URL \((.*?) checked\)$/s, "Ни у одного URL из sitemap canonical не указывает на другой адрес (проверено: $1)"],
  ],
  'crawl-sitemap-orphan-urls': [
    [/^Orphan detection needs the links of crawled pages - run with --crawl to build them$/, "Запустите аудит с --crawl, чтобы найти URL без входящих ссылок"],
    [/^No sitemap URLs available for orphan detection$/, "Нет URL из sitemap для поиска страниц без входящих ссылок"],
    [/^(\d+) sitemap URL\(s\) \(([\d.]+)%\) are not linked from any crawled page(?:; the sitemap was read in part \((.*?)\), so there may be more)?$/s, (orphanCount, percentage, gaps) => `Ни одна страница обхода не ссылается на ${orphanCount} URL из sitemap (${percentage}%)${partialOrphans(gaps)}`],
    [/^The sitemap could not be read in full \((.*?)\), so it cannot be said that no sitemap URL is an orphan$/s, (gaps) => `Не удалось прочитать sitemap полностью (${sitemapGaps(gaps)}). В непрочитанной части могут быть URL без входящих ссылок`],
    [/^All (.*?) sitemap URLs are linked from crawled pages$/s, "На все URL из sitemap есть ссылки со страниц обхода (проверено: $1)"],
  ],
  'crawl-sitemap-size-limit': [
    [/^No sitemap content available to check$/, "Нет содержимого sitemap для проверки"],
    [/^The sitemap is an index, and none of the sitemaps it lists could be fetched$/, "Не удалось получить ни одного sitemap из указанного в индексе списка"],
    [/^(.*?) is (.*?), exceeding the 50 MB limit$/s, (sitemap, size) => `Размер ${sitemapSubject(sitemap)} составляет ${size} и превышает лимит 50 MB`],
    [/^(.*?) is (.*?), approaching the 50 MB limit$/s, (sitemap, size) => `Размер ${sitemapSubject(sitemap)} составляет ${size} и приближается к лимиту 50 MB`],
    [/^Largest of (\d+) sitemaps is (.*?) \(within 50 MB limit\)$/s, "Самый большой из $1 файлов sitemap занимает $2 (в пределах 50 MB)"],
    [/^(.*?) size is (.*?) \(within 50 MB limit\)$/s, (sitemap, size) => `Размер ${sitemapSubject(sitemap)} составляет ${size} (в пределах 50 MB)`],
  ],
  'crawl-sitemap-url-limit': [
    [/^No sitemap content available to check$/, "Нет содержимого sitemap для проверки"],
    [/^The sitemap is an index, and none of the sitemaps it lists could be fetched$/, "Не удалось получить ни одного sitemap из указанного в индексе списка"],
    [/^(.*?) contains (.*?) URLs, exceeding the (.*?) limit$/s, (sitemap, value, limit) => `В ${sitemapSubject(sitemap)} указано ${value} URL. Лимит ${limit} превышен`],
    [/^(.*?) contains (.*?) URLs, approaching the (.*?) limit$/s, (sitemap, value, limit) => `В ${sitemapSubject(sitemap)} указано ${value} URL. Это близко к лимиту ${limit}`],
    [/^Largest of (\d+) sitemaps lists (.*?) URLs \(within (.*?) limit\)(.*?)$/s, (fileCount, value, limit, suffix) => `В самом большом из ${fileCount} файлов sitemap указано ${value} URL (в пределах лимита ${limit})${skippedSitemaps(suffix)}`],
    [/^(.*?) contains (.*?) URLs \(within (.*?) limit\)$/s, (sitemap, value, limit) => `В ${sitemapSubject(sitemap)} указано ${value} URL (в пределах лимита ${limit})`],
  ],

  // eeat
  'eeat-about-page': [
    [/^About page link found(.*?)$/s, (suffix) => `Найдена ссылка на страницу о компании${inNavigation(suffix)}`],
    [/^No about page link found - important for trust and E-E-A-T$/, "Ссылка на страницу о компании не найдена. Она помогает укрепить доверие и E-E-A-T"],
  ],
  'eeat-affiliate-disclosure': [
    [/^Disclosure found \(no affiliate links detected on this page\)$/, "Найдено уведомление о партнёрских ссылках. На этой странице партнёрских ссылок нет"],
    [/^No affiliate or sponsored content detected$/, "Партнёрский или спонсорский контент не обнаружен"],
    [/^Affiliate disclosure found(.*?)$/s, (suffix) => `Найдено уведомление о партнёрских ссылках${ftcWording(suffix)}`],
    [/^(\d+) affiliate link(.*?) found without disclosure - FTC requires clear disclosure$/s, (affiliateLinkCount) => `Найдено ${affiliateLinkCount} ${plural(affiliateLinkCount, "партнёрская ссылка", "партнёрские ссылки", "партнёрских ссылок")} без уведомления. FTC требует явно сообщать о таких ссылках`],
  ],
  'eeat-author-byline': [
    [/^Author byline found \((\d+) signal(.*?)\)$/s, (signalCount) => `Найдена подпись автора (${signalCount} ${plural(signalCount, "признак", "признака", "признаков")})`],
    [/^No author byline found$/, "Подпись автора не найдена"],
  ],
  'eeat-author-expertise': [
    [/^Strong author expertise signals found \((\d+) indicators\)$/, "Найдены убедительные признаки компетентности автора ($1)"],
    [/^Author expertise signals found \((\d+) indicator(.*?)\)$/s, "Найдены признаки компетентности автора ($1)"],
    [/^Author found but no expertise indicators detected$/, "Автор указан, но признаков его компетентности не обнаружено"],
    [/^No author present - expertise check not applicable$/, "Автор не указан. Проверка его компетентности неприменима"],
  ],
  'eeat-citations': [
    [/^Strong citation profile: (\d+) authoritative sources cited$/, (citationCount) => `Хорошая подборка ссылок: указано ${citationCount} ${plural(citationCount, "авторитетный источник", "авторитетных источника", "авторитетных источников")}`],
    [/^(\d+) authoritative source(.*?) cited$/s, (citationCount) => `Указано ${citationCount} ${plural(citationCount, "авторитетный источник", "авторитетных источника", "авторитетных источников")}`],
    [/^(.*?) external links found, but none to recognized authoritative sources$/s, "Внешние ссылки найдены ($1), но среди них нет ссылок на авторитетные источники"],
    [/^No external citations found \(may not be needed for this content type\)$/, "Ссылки на внешние источники не найдены. Для этого типа содержимого они могут не требоваться"],
  ],
  'eeat-contact-page': [
    [/^Contact page found with (.*?) contact methods$/s, "Найдена страница контактов. Способы связи: $1"],
    [/^Contact page found(.*?)$/s, (suffix) => `Найдена страница контактов${visibleContactMethods(suffix)}`],
    [/^(.*?) contact methods found on page$/s, "Способы связи на странице: $1"],
    [/^Only 1 contact method found \((.*?)\) - add more for better trust signals$/s, (method) => `Найден только 1 способ связи (${contactMethod(method)}). Добавьте другие способы, чтобы укрепить доверие`],
    [/^No contact page or contact methods found - important for trust$/, "Страница контактов и способы связи не найдены. Они важны для доверия к сайту"],
  ],
  'eeat-content-dates': [
    [/^Content date signals found \((\d+) type(.*?)\)$/s, (signalCount) => `Найдены признаки даты публикации или обновления (${signalCount} ${plural(signalCount, "тип", "типа", "типов")})`],
    [/^No content date signals found$/, "Признаков даты публикации или обновления нет"],
  ],
  'eeat-disclaimers': [
    [/^Disclaimer found \(not required for non-YMYL content\)$/, "Найдено предупреждение. Для содержимого вне тематики YMYL оно необязательно"],
    [/^Non-YMYL content - disclaimers not required$/, "Содержимое вне тематики YMYL. Предупреждения необязательны"],
    [/^Appropriate disclaimers found for YMYL content \((.*?)\)$/s, (topics) => `Найдены подходящие предупреждения для содержимого YMYL (${ymylTopics(topics)})`],
    [/^Disclaimer found, but may need category-specific disclaimer for (.*?) content$/s, (topics) => `Предупреждение найдено. Для содержимого YMYL на темы «${ymylTopics(topics)}» может потребоваться более конкретное предупреждение`],
    [/^YMYL content \((.*?)\) without appropriate disclaimers$/s, (topics) => `У содержимого YMYL (${ymylTopics(topics)}) нет подходящих предупреждений`],
  ],
  'eeat-editorial-policy': [
    [/^Editorial policy page found(.*?)$/s, (suffix) => `Найдена страница редакционной политики${editorialCount(suffix)}`],
    [/^Editorial signals found \((.*?)\) but no dedicated policy page$/s, (signals) => `Признаки редакционной политики найдены (${editorialSignals(signals)}), но отдельной страницы нет`],
    [/^Editorial signal found \((.*?)\) - consider adding editorial policy page$/s, (signals) => `Найден признак редакционной политики (${editorialSignals(signals)}). Рассмотрите возможность добавить отдельную страницу`],
    [/^No editorial policy found - recommended for content-focused sites$/, "Редакционная политика не найдена. Она рекомендуется для сайтов, ориентированных на публикации"],
    [/^No editorial policy \(may not be applicable for this site type\)$/, "Редакционная политика не найдена. Для этого типа сайта она может не требоваться"],
  ],
  'eeat-geo-meta': [
    [/^No local-business schema, so geo meta tags are not required$/, "Разметки местной организации нет, поэтому географические метатеги необязательны"],
    [/^Geo meta present: (.*?)$/s, "Найдены географические метатеги: $1"],
    [/^Local-business schema is present and no geo meta tag was found$/, "Разметка местной организации есть, географические метатеги не найдены"],
  ],
  'eeat-nap-consistency': [
    [/^Schema identity across pages needs a crawl of at least two pages — run with --crawl$/, "Запустите аудит с --crawl хотя бы для двух страниц, чтобы сравнить сведения об организациях в разметке"],
    [/^No structured data on the crawled pages to compare$/, "На страницах обхода нет структурированных данных для сравнения"],
    [/^Organization names agree on phone and address$/, "Для организаций с одинаковым названием телефон и адрес совпадают"],
    [/^((?:[\s\S]+?) has \d+ (?:phone numbers|addresses)[\s\S]*)$/, napIssues],
  ],
  'eeat-physical-address': [
    [/^Physical address found(.*?)$/s, (suffix) => `Найден физический адрес${structuredAddress(suffix)}`],
    [/^No physical address found - important for business trust signals$/, "Физический адрес не найден. Он помогает укрепить доверие к компании"],
    [/^No physical address found \(may not be required for this site type\)$/, "Физический адрес не найден. Для этого типа сайта он может не требоваться"],
  ],
  'eeat-privacy-policy': [
    [/^Privacy policy link found(.*?) \((\d+) link(.*?)\)$/s, (location, foundLinkCount) => `Найдена ссылка на политику конфиденциальности${inFooter(location)} (${foundLinkCount} ${plural(foundLinkCount, "ссылка", "ссылки", "ссылок")})`],
    [/^No privacy policy link found - important for trust and legal compliance$/, "Ссылка на политику конфиденциальности не найдена. Она важна для доверия и соблюдения требований закона"],
  ],
  'eeat-terms-of-service': [
    [/^Terms of service link found(.*?) \((\d+) link(.*?)\)$/s, (location, foundLinkCount) => `Найдена ссылка на условия использования${inFooter(location)} (${foundLinkCount} ${plural(foundLinkCount, "ссылка", "ссылки", "ссылок")})`],
    [/^No terms of service link found - recommended for this site type$/, "Ссылка на условия использования не найдена. Она рекомендуется для этого типа сайта"],
    [/^No terms of service link found \(may not be required for this site type\)$/, "Ссылка на условия использования не найдена. Для этого типа сайта она может не требоваться"],
  ],
  'eeat-trust-signals': [
    [/^Strong trust signals: (\d+) types of social proof found$/, (typeCount) => `Найдены убедительные признаки доверия к сайту: ${typeCount} ${plural(typeCount, "тип", "типа", "типов")} подтверждений`],
    [/^Trust signals found: (.*?)$/s, (signals) => `Найдены признаки доверия к сайту: ${trustSignals(signals)}`],
    [/^Trust signal found: (.*?)$/s, (signals) => `Найден признак доверия к сайту: ${trustSignals(signals)}`],
    [/^No trust signals detected \(may not be required for this site type\)$/, "Признаков доверия к сайту не найдено. Для этого типа сайта они могут не требоваться"],
  ],
  'eeat-ymyl-detection': [
    [/^YMYL content detected: (.*?) \((.*?) confidence\)$/s, (topics, confidence) => `Обнаружено содержимое YMYL: ${ymylTopics(topics)} (${ymylConfidence(confidence)})`],
    [/^No YMYL content detected$/, "Содержимое YMYL не обнаружено"],
  ],

  // geo
  'geo-agents-md': [
    [/^Page URL has no origin to probe$/, "Не удалось определить адрес сайта для проверки по URL страницы"],
    [/^AGENTS\.md found at (.*?)$/s, "Файл AGENTS.md найден по пути $1"],
    [/^(.*?) returned an HTML document instead of the instructions file$/s, "По пути $1 получен HTML-документ вместо файла инструкций"],
    [/^No AGENTS\.md at the usual paths$/, "Файл AGENTS.md не найден по стандартным путям"],
  ],
  'geo-ai-bot-access': [
    [/^No robots\.txt found or not accessible - AI bots are not blocked$/, "Файл robots.txt не найден или недоступен. Запрет на обход ИИ-роботами не обнаружен"],
    [/^AI bots are not blocked in robots\.txt$/, "В robots.txt нет запрета на обход ИИ-роботами"],
    [/^All (\d+) AI answer engines are blocked in robots\.txt - this site cannot be cited in AI-generated answers$/, "Файл robots.txt блокирует все проверяемые ИИ-системы ($1). Они не смогут ссылаться на сайт в своих ответах"],
    [/^(\d+) AI answer engine\(s\) blocked in robots\.txt: (.*?)$/s, "Файл robots.txt блокирует обход для ИИ-систем ($1): $2"],
    [/^Answer-engine crawlers are allowed; (\d+) training-only crawler\(s\) blocked: (.*?)$/s, "Роботам ИИ-поиска обход разрешён. Роботы для обучения моделей заблокированы ($1): $2"],
  ],
  'geo-content-signals': [
    [/^robots\.txt was not fetched, so Content-Signal cannot be checked$/, "Не удалось получить robots.txt, поэтому проверить Content-Signal невозможно"],
    [/^robots\.txt has no Content-Signal directive$/, "В robots.txt нет директивы Content-Signal"],
    [/^Content-Signal problem: (.*?)$/s, (issues) => `Проблемы с Content-Signal: ${contentSignals(issues)}`],
    [/^Content-Signal directive is consistent$/, "Директива Content-Signal задана без противоречий"],
  ],
  'geo-content-structure': [
    [/^Page has excellent content structure for AI extraction \(all 4 signals present\)$/, "Структура страницы хорошо подходит для извлечения содержимого ИИ: есть все 4 признака"],
    [/^Good content structure \((.*?)\/4 signals\)\. Missing: (.*?)$/s, (signalCount, signals) => `Хорошая структура содержимого (${signalCount}/4 признаков). Не хватает: ${contentStructure(signals)}`],
    [/^Poor content structure for AI extraction \((.*?)\/4 signals\)\. Missing: (.*?)$/s, (signalCount, signals) => `Структура затрудняет извлечение содержимого ИИ (${signalCount}/4 признаков). Не хватает: ${contentStructure(signals)}`],
  ],
  'geo-llms-txt': [
    [/^llms\.txt reference found \((\d+) reference\(s\)\)$/, "Найдены ссылки на llms.txt ($1)"],
    [/^No llms\.txt reference found - consider adding for AI discoverability$/, "Ссылок на llms.txt нет. Рассмотрите возможность добавить файл, чтобы ИИ-системам было легче найти содержимое"],
  ],
  'geo-markdown-page': [
    [/^Page URL cannot be parsed$/, "Не удалось разобрать URL страницы"],
    [/^The origin root is checked by the Markdown response rule$/, "Корневой адрес проверяется правилом ответа в Markdown"],
    [/^This URL responds with Markdown$/, "По этому URL возвращается Markdown"],
    [/^(.*?) is available$/s, "Доступен адрес $1"],
    [/^This URL has no Markdown representation$/, "По этому URL нет версии в Markdown"],
  ],
  'geo-markdown-response': [
    [/^Page URL has no origin to probe$/, "Не удалось определить адрес сайта для проверки по URL страницы"],
    [/^Root responds with Markdown$/, "Корневой адрес возвращает Markdown"],
    [/^index\.md is available$/, "Файл index.md доступен"],
    [/^The origin does not serve a Markdown representation of \/$/, "Сервер не отдаёт версию / в Markdown"],
  ],
  'geo-noai-signals': [
    [/^No noai or noimageai directive$/, "Директивы noai и noimageai отсутствуют"],
    [/^AI opt-out declared: (.*?)$/s, "Указан запрет на использование ИИ: $1"],
  ],
  'geo-pay-per-crawl': [
    [/^The response is not a pay-per-crawl challenge$/, "В ответе нет требования оплатить обход"],
    [/^HTTP 402 includes payment terms$/, "Ответ HTTP 402 содержит условия оплаты"],
    [/^HTTP 402 does not say how a crawler can pay$/, "В ответе HTTP 402 не указано, как робот может заплатить"],
  ],
  'geo-rsl-license': [
    [/^robots\.txt was not fetched, so a License directive cannot be checked$/, "Не удалось получить robots.txt, поэтому проверить директиву License невозможно"],
    [/^robots\.txt has no License directive$/, "В robots.txt нет директивы License"],
    [/^License target resolves$/, "Документ лицензии доступен по указанному адресу"],
    [/^License target did not resolve as a license document: (.*?)$/s, "По указанным адресам не удалось получить документ лицензии: $1"],
  ],
  'geo-schema-drift': [
    [/^No JSON-LD structured data to check$/, "Нет структурированных данных JSON-LD для проверки"],
    [/^No parseable JSON-LD structured data found$/, "Не найдено структурированных данных JSON-LD, которые удалось разобрать"],
    [/^JSON-LD found but no name, description, or author fields to verify$/, "В JSON-LD нет полей name, description или author для проверки"],
    [/^Schema data is consistent with visible content \((\d+) field\(s\) verified\)$/, "Разметка соответствует видимому содержимому (проверено полей: $1)"],
    [/^Schema name\/headline not found in visible page content$/, "Значение name/headline из разметки не найдено в видимом содержимом страницы"],
    [/^(\d+) schema field\(s\) don't match visible content: (.*?)$/s, "Поля разметки, которые не совпадают с видимым содержимым ($1): $2"],
  ],
  'geo-semantic-html': [
    [/^Excellent semantic HTML structure \((.*?) distinct semantic elements found\)$/s, (elementCount) => `Хорошая семантическая структура HTML: найдено ${elementCount} ${plural(elementCount, "элемент", "элемента", "элементов")} разных типов`],
    [/^Good semantic structure \((.*?) elements\), could improve by adding: (.*?)$/s, (elementCount, elements) => `Хорошая семантическая структура (${elementCount} ${plural(elementCount, "элемент", "элемента", "элементов")}). Можно добавить: ${semanticElements(elements)}`],
    [/^Poor semantic HTML - AI systems struggle to parse content \(only (.*?) semantic element\(s\) found\)$/s, (elementCount) => `Слабая семантическая структура HTML затрудняет разбор содержимого ИИ. Найдено только ${elementCount} ${plural(elementCount, "семантический элемент", "семантических элемента", "семантических элементов")}`],
  ],
  'geo-well-known': [
    [/^Page URL has no origin to probe$/, "Не удалось определить адрес сайта для проверки по URL страницы"],
    [/^Agent manifest found: (.*?)$/s, "Найден манифест агента: $1"],
    [/^Only a legacy ai-plugin\.json manifest was found$/, "Найден только устаревший манифест ai-plugin.json"],
    [/^No MCP or agent-card manifest under \.well-known$/, "В .well-known нет манифеста MCP или agent-card"],
  ],

  // htmlval
  'htmlval-base-url': [
    [/^No <base> element found$/, "Элемент <base> не найден"],
    [/^<base> href is empty or malformed: (.*?)\. Relative links on the page may not resolve correctly for crawlers$/s, (problems) => `В <base> пустой или некорректный href: ${baseDescriptions(problems)}. Поисковые роботы могут неверно определить адреса относительных ссылок`],
    [/^Document has (\d+) <base> elements with different hrefs \((.*?)\)\. Only one <base> element is allowed per document$/s, "В документе несколько элементов <base> ($1) с разными href ($2). Допускается один элемент <base> на документ"],
    [/^Document has (\d+) <base> elements\. Only one <base> element is allowed per document$/, "В документе несколько элементов <base> ($1). Допускается один элемент <base> на документ"],
    [/^Document has a single valid <base> element \((.*?)\)$/s, "В документе один корректный элемент <base> ($1)"],
  ],
  'htmlval-body-structure': [
    [/^The document has one <body> and nothing before <head>$/, "В документе один элемент <body>, перед <head> нет содержимого"],
    [/^((?:\d+ <body> start tags|<body> comes before <html>|(?:an element|text) between <html> and <head>) \(at character \d+\)[\s\S]*)$/, bodyProblems],
  ],
  'htmlval-invalid-head': [
    [/^No <head> element found to validate$/, "Элемент <head> не найден"],
    [/^<head> contains elements that belong in <body>: <(.*?)>$/s, "В <head> есть элементы, которые следует разместить в <body>: <$1>"],
    [/^<head> contains only valid metadata elements$/, "В <head> только допустимые элементы метаданных"],
  ],
  'htmlval-lorem-ipsum': [
    [/^Placeholder\/dummy text detected: "(.*?)"\. Remove all placeholder text before publishing$/s, "Обнаружен текст-заглушка: \"$1\". Уберите все заглушки перед публикацией"],
    [/^No placeholder text detected$/, "Текста-заглушки не обнаружено"],
  ],
  'htmlval-missing-charset': [
    [/^Charset is declared via <meta charset>$/, "Кодировка объявлена через <meta charset>"],
    [/^Charset is declared via <meta http-equiv="Content-Type">$/, "Кодировка объявлена через <meta http-equiv=\"Content-Type\">"],
    [/^Charset is only declared in the HTTP Content-Type header, not in HTML\. Add <meta charset="utf-8"> to <head>$/, "Кодировка объявлена только в заголовке HTTP Content-Type. Добавьте <meta charset=\"utf-8\"> в <head>"],
    [/^No charset declaration found\. Put <meta charset="utf-8"> at the very top of <head>$/, "Кодировка не объявлена. Поместите <meta charset=\"utf-8\"> в самое начало <head>"],
  ],
  'htmlval-missing-doctype': [
    [/^DOCTYPE declaration is present$/, "В документе есть объявление DOCTYPE"],
    [/^Missing DOCTYPE declaration\. Add <!DOCTYPE html> at the beginning of the document$/, "Объявление DOCTYPE отсутствует. Добавьте <!DOCTYPE html> в начало документа"],
  ],
  'htmlval-multiple-descriptions': [
    [/^No meta description found \(checked by core-description-present\)$/, "Метатег description отсутствует. Это проверяет правило core-description-present"],
    [/^Document has a single meta description$/, "В документе один метатег description"],
    [/^Document has (.*?) <meta name="description"> elements\. Only one is allowed per document$/s, "В документе несколько элементов <meta name=\"description\"> ($1). Допускается один на документ"],
  ],
  'htmlval-multiple-heads': [
    [/^Document has a single <head> element$/, "В документе один элемент <head>"],
    [/^Document has (.*?) <head> elements\. Only one <head> is allowed per document$/s, "В документе несколько элементов <head> ($1). Допускается один <head> на документ"],
  ],
  'htmlval-multiple-titles': [
    [/^No <title> element found \(checked by core-title-present\)$/, "Элемент <title> отсутствует. Это проверяет правило core-title-present"],
    [/^Document has a single <title> element$/, "В документе один элемент <title>"],
    [/^Document has (.*?) <title> elements\. Only one <title> is allowed per document$/s, "В документе несколько элементов <title> ($1). Допускается один <title> на документ"],
  ],
  'htmlval-noscript-in-head': [
    [/^No <noscript> elements found in <head>$/, "В <head> нет элементов <noscript>"],
    [/^<noscript> in <head> contains non-permitted elements: <(.*?)>\. Only <link>, <style>, and <meta> are allowed$/s, "Элемент <noscript> в <head> содержит недопустимые элементы: <$1>. Разрешены только <link>, <style> и <meta>"],
    [/^<noscript> in <head> contains only permitted elements$/, "Элемент <noscript> в <head> содержит только допустимые элементы"],
  ],
  'htmlval-size-limit': [
    [/^HTML document is (.*?), which exceeds the ~2 MB Googlebot crawl cutoff\. Googlebot may only crawl and index the first part of the HTML, so content and links near the end of the document may be missed entirely$/s, "Размер HTML-документа ($1) превышает порог обхода Googlebot (~2 MB). Googlebot может обойти и проиндексировать только начало HTML и пропустить содержимое и ссылки ближе к концу документа"],
    [/^HTML document is (.*?), which exceeds the 500 KB limit\. Consider reducing inline styles, scripts, or splitting content$/s, "Размер HTML-документа ($1) превышает лимит 500 KB. Сократите встроенные стили и скрипты или разделите содержимое"],
    [/^HTML document is (.*?)\. Consider keeping it under 250 KB for optimal performance$/s, "Размер HTML-документа: $1. Для хорошей производительности старайтесь укладываться в 250 KB"],
    [/^HTML document size is (.*?)$/s, "Размер HTML-документа: $1"],
  ],
  'htmlval-title-outside-head': [
    [/^No <title> element found \(checked by core-title-present\)$/, "Элемент <title> отсутствует. Это проверяет правило core-title-present"],
    [/^All <title> elements are inside <head>$/, "Все элементы <title> находятся внутри <head>"],
    [/^Found (\d+) <title> element\(s\) outside of <head>\. Search engines may ignore a title that is not in <head>$/, "Найдены элементы <title> за пределами <head> ($1). Поисковые системы могут их проигнорировать"],
  ],

  // i18n
  'i18n-hreflang-conflicting': [
    [/^No hreflang tags found$/, "Теги hreflang отсутствуют"],
    [/^No conflicting hreflang annotations found$/, "Конфликтов hreflang не обнаружено"],
    [/^Found (.*?) hreflang conflict\(s\)$/s, (conflictCount) => `Обнаружено ${conflictCount} ${plural(conflictCount, "конфликт", "конфликта", "конфликтов")} hreflang`],
  ],
  'i18n-hreflang-incoming-invalid': [
    [/^Validating incoming hreflang annotations needs per-page crawl state - run with --crawl to build it$/, "Запустите аудит с --crawl, чтобы проверить входящие ссылки hreflang"],
    [/^(\d+) incoming hreflang annotation\(s\) use invalid language\/region codes$/, "Входящие ссылки hreflang с неверными кодами языка или региона: $1"],
    [/^No other crawled page annotates this URL with hreflang$/, "Другие страницы из обхода не указывают на этот URL через hreflang"],
    [/^All incoming hreflang annotations use valid codes$/, "Во всех входящих hreflang корректные коды"],
  ],
  'i18n-hreflang-lang-mismatch': [
    [/^No hreflang tags found, no mismatch possible$/, "Теги hreflang отсутствуют, конфликта нет"],
    [/^No html lang attribute set, cannot compare with hreflang$/, "У html не задан lang, поэтому сравнить его с hreflang невозможно"],
    [/^Cannot parse current URL for comparison$/, "Не удалось разобрать текущий URL для сравнения"],
    [/^No hreflang self-reference found, cannot compare with lang attribute$/, "У страницы нет hreflang со ссылкой на саму себя, поэтому сравнить его с lang невозможно"],
    [/^HTML lang "(.*?)" matches hreflang self-reference "(.*?)"$/s, "В HTML значение lang \"$1\" совпадает с hreflang \"$2\" в ссылке на эту же страницу"],
    [/^HTML lang "(.*?)" does not match hreflang self-reference "(.*?)"$/s, "В HTML значение lang \"$1\" не совпадает с hreflang \"$2\" в ссылке на эту же страницу"],
  ],
  'i18n-hreflang-multiple-methods': [
    [/^No hreflang declarations found$/, "Директивы hreflang не найдены"],
    [/^Hreflang declared via HTML link tags only \(consistent method\)$/, "Hreflang задан только в тегах link в HTML"],
    [/^Hreflang declared via HTTP Link header only \(consistent method\)$/, "Hreflang задан только в HTTP-заголовке Link"],
    [/^Hreflang declared via both HTML link tags and HTTP Link header \(risk of inconsistency\)$/, "Hreflang задан и в тегах link в HTML, и в HTTP-заголовке Link. Значения могут расходиться"],
  ],
  'i18n-hreflang-relative-url': [
    [/^No hreflang tags found$/, "Теги hreflang отсутствуют"],
    [/^All (\d+) hreflang annotation\(s\) use absolute URLs$/, "Во всех hreflang абсолютные URL (проверено: $1)"],
    [/^Found (\d+) hreflang annotation\(s\) using relative URLs$/, "Обнаружены hreflang с относительными URL ($1)"],
  ],
  'i18n-hreflang-return-links': [
    [/^No hreflang tags found \(nothing to check\)$/, "Теги hreflang отсутствуют"],
    [/^Cannot parse current URL for comparison$/, "Не удалось разобрать текущий URL для сравнения"],
    [/^Hreflang set includes self-referencing link for current page$/, "В наборе hreflang есть ссылка на текущую страницу"],
    [/^Hreflang set does not include a self-referencing link for the current page$/, "В наборе hreflang нет ссылки на текущую страницу"],
  ],
  'i18n-hreflang-to-broken': [
    [/^No hreflang tags found$/, "Теги hreflang отсутствуют"],
    [/^All (\d+) hreflang URL\(s\) are valid absolute URLs$/, "Все адреса hreflang являются корректными абсолютными URL (проверено: $1)"],
    [/^(\d+) hreflang target\(s\) could not be fetched during the crawl \(timed out or rate-limited\)$/, "Не удалось получить $1 URL из hreflang во время обхода из-за тайм-аута или ограничения частоты запросов"],
    [/^Found (.*?) broken hreflang URL\(s\)$/s, "Нерабочие URL в hreflang: $1"],
  ],
  'i18n-hreflang-to-noindex': [
    [/^No hreflang tags found, no conflict possible$/, "Теги hreflang отсутствуют, конфликта нет"],
    [/^No conflict between hreflang and indexing directives$/, "Конфликтов между hreflang и директивами индексации нет"],
    [/^Page has both hreflang annotations and noindex directive \(conflicting signals\)$/, "На странице одновременно заданы hreflang и noindex. Директивы конфликтуют"],
  ],
  'i18n-hreflang-to-non-canonical': [
    [/^No hreflang tags found, no conflict possible$/, "Теги hreflang отсутствуют, конфликта нет"],
    [/^No canonical URL specified, cannot compare$/, "URL canonical не указан. Сравнение невозможно"],
    [/^Cannot parse canonical URL for comparison$/, "Не удалось разобрать URL canonical для сравнения"],
    [/^Cannot parse current URL for comparison$/, "Не удалось разобрать текущий URL для сравнения"],
    [/^Hreflang self-reference matches canonical URL$/, "Ссылка hreflang на текущую страницу совпадает с URL canonical"],
    [/^Hreflang self-reference URL differs from canonical URL$/, "URL ссылки hreflang на текущую страницу отличается от URL canonical"],
  ],
  'i18n-hreflang-to-redirect': [
    [/^No hreflang tags found$/, "Теги hreflang отсутствуют"],
    [/^Cannot parse current URL for comparison$/, "Не удалось разобрать текущий URL для сравнения"],
    [/^No hreflang target redirected during the crawl$/, "Ни один URL из hreflang не перенаправлял при обходе"],
    [/^Current page is HTTP; protocol mismatch check not applicable$/, "Текущая страница использует HTTP. Сравнение протоколов неприменимо"],
    [/^All hreflang URLs use the same protocol as the current page$/, "Все URL в hreflang используют тот же протокол, что и текущая страница"],
    [/^Found hreflang URL\(s\) likely to redirect: (.*?)$/s, (issues) => `Обнаружены URL hreflang с вероятным перенаправлением: ${hreflangRedirects(issues)}`],
  ],
  'i18n-hreflang-x-default': [
    [/^No hreflang tags found$/, "Теги hreflang отсутствуют"],
    [/^No x-default hreflang annotation found$/, "Значение x-default в hreflang не найдено"],
    [/^(\d+) hreflang annotation\(s\) also target the x-default URL$/, "URL, совпадающий с x-default, указан и в других hreflang ($1)"],
    [/^No hreflang annotation duplicates the x-default target$/, "Ни один hreflang не дублирует адрес x-default"],
  ],
  'i18n-hreflang': [
    [/^Hreflang is declared in the HTTP Link header, not in the HTML$/, "Hreflang задан в HTTP-заголовке Link. В HTML он отсутствует"],
    [/^Page links to (\d+) other-language version\(s\) of itself but declares no hreflang in the HTML or HTTP headers$/, "Страница ссылается на версии на других языках ($1), но hreflang отсутствует и в HTML, и в HTTP-заголовках"],
    [/^No hreflang tags found, and no links to other-language versions of this page$/, "Теги hreflang и ссылки на версии страницы на других языках отсутствуют"],
    [/^Found (\d+) valid hreflang tags$/, (hreflangTagCount) => `Обнаружено ${hreflangTagCount} ${plural(hreflangTagCount, "корректное объявление", "корректных объявления", "корректных объявлений")} hreflang`],
    [/^Found (\d+) hreflang issue\(s\)$/, (issueCount) => `Обнаружено ${issueCount} ${plural(issueCount, "проблема", "проблемы", "проблем")} с hreflang`],
    [/^Found (\d+) hreflang recommendation\(s\)$/, (issueCount) => `Сформировано ${issueCount} ${plural(issueCount, "рекомендация", "рекомендации", "рекомендаций")} по hreflang`],
  ],
  'i18n-lang-attribute': [
    [/^No <html> element found in the document$/, "В документе нет элемента <html>"],
    [/^Missing lang attribute on <html> element$/, "У элемента <html> отсутствует атрибут lang"],
    [/^The lang attribute on <html> is empty$/, "У элемента <html> пустой атрибут lang"],
    [/^Lang attribute "(.*?)" may not be valid BCP 47 format$/s, "Значение lang \"$1\" может не соответствовать BCP 47"],
    [/^HTML lang attribute set to "(.*?)"$/s, "В HTML задан атрибут lang со значением \"$1\""],
  ],

  // images
  'images-alt-length': [
    [/^No images with alt text to evaluate for length$/, "Нет изображений с текстом alt для проверки длины"],
    [/^All (\d+) image\(s\) have alt text within the recommended length \((.*?) chars\)$/s, "Длина текста alt у всех изображений ($1) в рекомендуемых пределах (до $2 символов)"],
    [/^Found (.*?) image\(s\) with excessively long alt text \(over (.*?) chars\)$/s, (excessiveCount, maxLength) => `Слишком длинный текст alt (более ${maxLength} символов) у ${excessiveCount} ${plural(excessiveCount, "изображения", "изображений", "изображений")}`],
    [/^Found (.*?) image\(s\) with long alt text \((.*?)-(.*?) chars\)$/s, (longCount, recommendedLength, maxLength) => `Длинный текст alt (${recommendedLength}-${maxLength} символов) у ${longCount} ${plural(longCount, "изображения", "изображений", "изображений")}`],
  ],
  'images-alt-present': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Found (\d+) image\(s\) missing alt attribute \((.*?)% of images\)$/s, (missingAltCount, percentage) => `У ${missingAltCount} ${plural(missingAltCount, "изображения", "изображений", "изображений")} отсутствует alt (${percentage}% всех изображений)`],
    [/^All (\d+) image\(s\) have alt attributes$/, "У всех изображений есть атрибут alt ($1)"],
  ],
  'images-alt-quality': [
    [/^No images with alt attributes to evaluate$/, "Нет изображений с alt для проверки"],
    [/^Found (\d+) image\(s\) with low-quality alt text \((.*?)% of images with alt\)$/s, (issueCount, percentage) => `У ${issueCount} ${plural(issueCount, "изображения", "изображений", "изображений")} неинформативный текст alt (${percentage}% изображений с alt)`],
    [/^All (\d+) image\(s\) have quality alt text$/, "У всех изображений информативный текст alt ($1)"],
  ],
  'images-background-seo': [
    [/^No inline CSS background images detected$/, "Фоновые изображения во встроенных стилях CSS не найдены"],
    [/^Found (\d+) inline CSS background image \(minimal usage\)$/, "Фоновые изображения во встроенных стилях CSS используются редко ($1)"],
    [/^Found (\d+) inline CSS background images; significant visual content may be invisible to search engine crawlers$/, "Фоновые изображения во встроенных стилях CSS ($1). Значительная часть изображений может быть недоступна поисковым роботам"],
    [/^Found (\d+) inline CSS background images; these are not indexable by search engines$/, "Фоновые изображения во встроенных стилях CSS ($1). Поисковые системы их не индексируют"],
    [/^Found (\d+) inline CSS background image\(s\) \(minimal usage\)$/, "Фоновые изображения во встроенных стилях CSS используются редко ($1)"],
  ],
  'images-broken': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Found (\d+) broken image\(s\) \(404\/410 errors\)$/, (brokenImageCount) => `Обнаружено ${brokenImageCount} ${plural(brokenImageCount, "недоступное изображение", "недоступных изображения", "недоступных изображений")} (ошибки 404/410)`],
    [/^All (\d+) checked image\(s\) are accessible$/, "Все проверенные изображения доступны ($1)"],
  ],
  'images-dimensions': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Found (\d+) image\(s\) missing width and\/or height attributes \((.*?)% of images\)$/s, (missingDimensionCount, percentage) => `У ${missingDimensionCount} ${plural(missingDimensionCount, "изображения", "изображений", "изображений")} отсутствует width, height или оба атрибута (${percentage}% всех изображений)`],
    [/^All (\d+) image\(s\) have width and height attributes$/, "У всех изображений заданы атрибуты width и height ($1)"],
  ],
  'images-figure-captions': [
    [/^No figure elements found on page$/, "На странице нет элементов figure"],
    [/^((?:\d+ figure\(s\) (?:missing figcaption|without images))(?:; \d+ figure\(s\) (?:missing figcaption|without images))*)$/, figureIssues],
    [/^All (\d+) figure element\(s\) have proper figcaption$/, "У всех элементов figure корректно задан figcaption ($1)"],
  ],
  'images-filename-quality': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Found (\d+) image\(s\) with non-descriptive filenames \((.*?)%\)$/s, (poorFilenameCount, percentage) => `У ${poorFilenameCount} ${plural(poorFilenameCount, "изображения", "изображений", "изображений")} неинформативные имена файлов (${percentage}%)`],
    [/^All (\d+) image\(s\) have descriptive filenames$/, "У всех изображений информативные имена файлов ($1)"],
  ],
  'images-inline-svg-size': [
    [/^No inline SVGs found on page$/, "На странице нет встроенных SVG"],
    [/^Found (\d+) large inline SVG\(s\) \(>(.*?)KB each, (\d+(?:\.\d+)?)KB total\)$/s, "Обнаружены крупные встроенные SVG ($1, >$2KB каждый, всего $3KB)"],
    [/^All (\d+) inline SVG\(s\) are appropriately sized \((\d+(?:\.\d+)?)KB total\)$/, "Размер всех встроенных SVG в норме ($1, всего $2KB)"],
  ],
  'images-lazy-loading': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Only (\d+) image\(s\) found \(considered above fold\)$/, (imageCount) => `Найдено только ${imageCount} ${plural(imageCount, "изображение", "изображения", "изображений")}. Они считаются видимыми на первом экране`],
    [/^Found (\d+) below-fold image\(s\) not using lazy loading \((.*?)%\)$/s, (notLazyLoadedCount, percentage) => `У ${notLazyLoadedCount} ${plural(notLazyLoadedCount, "изображения", "изображений", "изображений")} за пределами первого экрана нет отложенной загрузки (${percentage}%)`],
    [/^All (\d+) below-fold image\(s\) use lazy loading$/, "У всех изображений за пределами первого экрана используется отложенная загрузка ($1)"],
  ],
  'images-modern-format': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^No modern image formats detected \(0% WebP\/AVIF usage\)$/, "Современные форматы изображений не найдены (0% WebP/AVIF)"],
    [/^Partial modern format adoption \((.*?)% WebP\/AVIF\)$/s, "Современные форматы используются частично ($1% WebP/AVIF)"],
    [/^Good modern format usage \((.*?)% WebP\/AVIF\/SVG\)$/s, "Современные форматы широко используются ($1% WebP/AVIF/SVG)"],
  ],
  'images-oversized-delivery': [
    ...renderResults,
    [/^The render did not report image sizes$/, "При загрузке страницы в браузере не получены размеры изображений"],
    [/^No displayed images on this page$/, "На странице нет отображаемых изображений"],
    [/^(\d+) image\(s\) are served at about the size they are shown$/, (imageCount) => `Размеры файлов соответствуют размеру отображения (${imageCount} ${plural(imageCount, "изображение", "изображения", "изображений")})`],
    [/^(\d+) image\(s\) are larger than they are shown, wasting about (.*?)$/s, (imageCount, wastedSize) => `Размеры ${imageCount} ${plural(imageCount, "изображения", "изображений", "изображений")} превышают размеры отображения. Лишний объём загрузки: около ${wastedSize}`],
  ],
  'images-picture-element': [
    [/^No picture elements found on page$/, "На странице нет элементов picture"],
    [/^((?:\d+ picture element\(s\) (?:missing img fallback|without source elements))(?:; \d+ picture element\(s\) (?:missing img fallback|without source elements))*)$/, pictureIssues],
    [/^All (\d+) picture element\(s\) are valid \((\d+) use modern formats\)$/, "Все элементы picture корректны ($1, из них $2 используют современные форматы)"],
  ],
  'images-responsive': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Good responsive image usage \((.*?) picture element\(s\), (.*?) srcset attribute\(s\)\)$/s, "Адаптивные изображения используются (элементов picture: $1, атрибутов srcset: $2)"],
    [/^No responsive image techniques detected \((.*?)% of images could benefit\)$/s, "Адаптивные изображения не используются. Их можно применить к $1% изображений"],
    [/^Found (\d+) image\(s\) not using responsive techniques \((.*?)%\)$/s, "Найдены изображения без адаптивной загрузки ($1, $2%)"],
  ],
  'images-size': [
    [/^No images found on page$/, "На странице нет изображений"],
    [/^Found (\d+) potentially oversized image\(s\) \(may exceed 200KB\)$/, (potentiallyOversizedCount) => `Обнаружено ${potentiallyOversizedCount} ${plural(potentiallyOversizedCount, "потенциально тяжёлое изображение", "потенциально тяжёлых изображения", "потенциально тяжёлых изображений")} (возможно, больше 200KB)`],
    [/^No obviously oversized images detected among (\d+) image\(s\)$/, "Среди проверенных изображений ($1) нет явно слишком тяжёлых"],
  ],

  // js
  'js-ajax-crawling-scheme': [
    [/^The page does not use the AJAX crawling scheme$/, "Страница не использует схему обхода AJAX"],
    [/^(.*?); Google no longer supports the AJAX crawling scheme$/s, (signals) => `${ajaxSignals(signals)}. Google больше не поддерживает схему обхода AJAX`],
  ],
  'js-blocked-resources': [
    [/^No robots\.txt available to check for blocked JS resources$/, "Файл robots.txt недоступен, поэтому проверить блокировку ресурсов JavaScript невозможно"],
    [/^No Disallow rules found in robots\.txt$/, "В robots.txt нет директив Disallow"],
    [/^No external script sources found on the page$/, "На странице нет скриптов с внешним источником"],
    [/^(\d+) JavaScript resource\(s\) may be blocked by robots\.txt$/, "Файл robots.txt может блокировать ресурсы JavaScript ($1)"],
    [/^No JavaScript resources are blocked by robots\.txt$/, "Файл robots.txt разрешает обход всех ресурсов JavaScript"],
  ],
  'js-canonical-mismatch': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Unable to compare canonical tags$/, "Не удалось сравнить теги canonical"],
    [/^Canonical tag not present in either raw or rendered DOM \(no mismatch\)$/, "Тег canonical отсутствует в исходном DOM и после загрузки в браузере. Расхождений нет"],
    [/^Canonical URL changed after JavaScript execution$/, "URL canonical изменился после выполнения JavaScript"],
    [/^Canonical URL is consistent between raw and rendered DOM$/, "URL canonical совпадает в исходном DOM и после загрузки в браузере"],
  ],
  'js-console-errors': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to capture JavaScript errors$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv, чтобы собрать ошибки JavaScript"],
    [/^(\d+) uncaught JavaScript error\(s\) while rendering: (.*?)$/s, "Необработанные ошибки JavaScript при загрузке в браузере ($1). Первая ошибка: $2"],
    [/^(\d+) console error\(s\) while rendering: (.*?)$/s, "Ошибки в консоли при загрузке в браузере ($1). Первая ошибка: $2"],
    [/^No JavaScript errors while rendering the page$/, "Ошибок JavaScript при загрузке страницы в браузере нет"],
  ],
  'js-description-modified': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Unable to compare meta description elements$/, "Не удалось сравнить метатеги description"],
    [/^Meta description is not present in either raw or rendered DOM \(no modification detected\)$/, "Метатег description отсутствует в исходном DOM и после загрузки в браузере"],
    [/^Meta description was modified by JavaScript execution$/, "Метатег description изменился после выполнения JavaScript"],
    [/^Meta description is unchanged after JavaScript execution$/, "Метатег description не изменился после выполнения JavaScript"],
  ],
  'js-document-write': [
    [/^(.*?) document\.write\(\) call\(s\) found in (\d+) inline script\(s\)\. This blocks the parser and delays first paint\.$/s, (total, scriptCount) => `Найдено ${total} ${plural(total, "вызов", "вызова", "вызовов")} document.write() во встроенных скриптах (${scriptCount}). Такие вызовы блокируют разбор HTML и задерживают первую отрисовку.`],
    [/^No document\.write\(\) calls in inline scripts$/, "Во встроенных скриптах нет вызовов document.write()"],
  ],
  'js-failed-requests': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to capture failed resource requests$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv, чтобы собрать сведения о неудачных запросах ресурсов"],
    [/^All page resources loaded successfully$/, "Все ресурсы страницы загрузились"],
    [/^(\d+) script\/stylesheet request\(s\) failed while rendering: (.*?)$/s, (criticalCount, failure) => `Не удалось загрузить скрипты или стили при открытии страницы в браузере (${criticalCount}). Первый сбой: ${resourceFailure(failure)}`],
    [/^(\d+) non-critical resource request\(s\) failed while rendering: (.*?)$/s, (failureCount, failure) => `Не удалось загрузить некритичные ресурсы при открытии страницы в браузере (${failureCount}). Первый сбой: ${resourceFailure(failure)}`],
  ],
  'js-h1-modified': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Unable to compare H1 elements$/, "Не удалось сравнить элементы H1"],
    [/^H1 is not present in either raw or rendered DOM \(no modification detected\)$/, "Заголовок H1 отсутствует в исходном DOM и после загрузки в браузере"],
    [/^H1 heading was modified by JavaScript execution$/, "Заголовок H1 изменился после выполнения JavaScript"],
    [/^H1 heading is unchanged after JavaScript execution$/, "Заголовок H1 не изменился после выполнения JavaScript"],
  ],
  'js-noindex-mismatch': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Robots directives changed after JavaScript execution: (.*?)$/s, (changes) => `Директивы robots изменились после выполнения JavaScript: ${robotsChanges(changes)}`],
    [/^Noindex and nofollow status is consistent between raw and rendered DOM$/, "Статус noindex и nofollow совпадает в исходном DOM и после загрузки в браузере"],
  ],
  'js-rendered-canonical': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Canonical link tag is missing in the rendered DOM after JavaScript execution$/, "После выполнения JavaScript в DOM отсутствует тег canonical"],
    [/^Canonical link tag is present in the rendered DOM$/, "Тег canonical присутствует в DOM после загрузки в браузере"],
  ],
  'js-rendered-content': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Page is essentially empty without JavaScript; all content is client-side rendered$/, "Без JavaScript страница практически пуста. Всё содержимое формируется в браузере"],
    [/^Most page content is injected by JavaScript; raw HTML has significantly less content$/, "Большая часть содержимого добавляется через JavaScript. В исходном HTML содержимого гораздо меньше"],
    [/^Page content is mostly present in raw HTML$/, "Большая часть содержимого есть в исходном HTML"],
  ],
  'js-rendered-description': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Meta description is missing in the rendered DOM after JavaScript execution$/, "После выполнения JavaScript в DOM отсутствует метатег description"],
    [/^Meta description is present in the rendered DOM$/, "Метатег description присутствует в DOM после загрузки в браузере"],
  ],
  'js-rendered-h1': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^H1 heading is missing or empty in the rendered DOM after JavaScript execution$/, "После выполнения JavaScript заголовок H1 отсутствует в DOM или пуст"],
    [/^H1 heading is present in the rendered DOM$/, "Заголовок H1 присутствует в DOM после загрузки в браузере"],
  ],
  'js-rendered-links': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^JavaScript adds (.*?) links to the page; most links are not in raw HTML$/s, (addedLinks) => `JavaScript добавляет ${addedLinks} ${plural(addedLinks, "ссылку", "ссылки", "ссылок")}. Большинства ссылок нет в исходном HTML`],
    [/^Links are mostly present in raw HTML$/, "Большая часть ссылок есть в исходном HTML"],
  ],
  'js-rendered-title': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Title tag is missing or empty in the rendered DOM after JavaScript execution$/, "После выполнения JavaScript тег title отсутствует в DOM или пуст"],
    [/^Title tag is present in the rendered DOM$/, "Тег title присутствует в DOM после загрузки в браузере"],
  ],
  'js-ssr-check': [
    [/^Page appears to be client-side rendered only: empty root element with minimal HTML content$/, "Похоже, страница формируется только в браузере. Корневой элемент пуст, в HTML почти нет содержимого"],
    [/^Page may rely on client-side rendering: root element has minimal content$/, "Возможно, страница формируется в браузере. В корневом элементе почти нет содержимого"],
    [/^Page indicates JavaScript is required and has minimal HTML content$/, "Страница сообщает о необходимости JavaScript и содержит минимум HTML"],
    [/^Page appears to be server-side rendered with content in the initial HTML$/, "Похоже, страница формируется на сервере. Содержимое есть в исходном HTML"],
  ],
  'js-title-modified': [
    ...renderResults,
    [/^Rendered DOM not available - run with --cwv to enable JavaScript rendering checks$/, "DOM после загрузки в браузере недоступен. Запустите аудит с --cwv для проверки JavaScript"],
    [/^Unable to compare title elements$/, "Не удалось сравнить элементы title"],
    [/^Title is not present in either raw or rendered DOM \(no modification detected\)$/, "Тег title отсутствует в исходном DOM и после загрузки в браузере"],
    [/^Title was modified by JavaScript execution$/, "Тег title изменился после выполнения JavaScript"],
    [/^Title is unchanged after JavaScript execution$/, "Тег title не изменился после выполнения JavaScript"],
  ],
};

const ruleError: MessagePattern = [
  /^The check failed to run: (.*)$/s,
  (message) => 'Не удалось выполнить проверку: ' + label(message, { 'Unknown error': 'неизвестная ошибка' }),
];

/** Сообщения правил и результаты запуска проверки по идентификатору правила. */
export const MESSAGES_RU_A: MessageTable = Object.fromEntries(
  Object.entries(translations).map(([id, patterns]) => [id, [...patterns, ruleError]])
);
