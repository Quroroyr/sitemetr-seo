import { plural, type MessageTable } from '../index.js';

const pageKinds: Readonly<Record<string, string>> = {
  article: 'других статей',
  product: 'других страниц товаров',
  other: 'других страниц того же типа',
};

const ymylTopics: Readonly<Record<string, string>> = {
  'Health & Medical': 'здоровье и медицина',
  Financial: 'финансы',
  Legal: 'право',
  'Safety & Security': 'безопасность',
  'News & Current Events': 'новости и текущие события',
};

const disclaimers: Readonly<Record<string, string>> = {
  'Add medical disclaimer: "This content is for informational purposes only and is not a substitute for professional medical advice"':
    'Добавьте предупреждение для медицинских материалов — «Материал носит информационный характер и не заменяет консультацию врача».',
  'Add financial disclaimer: "This is not financial advice. Consult a qualified financial advisor"':
    'Добавьте предупреждение для финансовых материалов — «Материал не является финансовой рекомендацией. Обратитесь к квалифицированному финансовому консультанту».',
  'Add legal disclaimer: "This is not legal advice. Consult a licensed attorney"':
    'Добавьте предупреждение для юридических материалов — «Материал не является юридической консультацией. Обратитесь к лицензированному юристу».',
};

function translateDisclaimers(value: string): string {
  const entries = value.split(/\. (?=Add (?:medical|financial|legal) disclaimer: )/);
  return entries.every((entry) => Object.hasOwn(disclaimers, entry))
    ? entries.map((entry) => disclaimers[entry]).join(' ')
    : value;
}

/** Переводы строк из details правил по id правила. */
export const MESSAGES_RU_REC: MessageTable = {
  'a11y-aria-hidden-body': [
    [/^Remove aria-hidden from html and body\. Hide a widget, not the document\.$/, 'Удалите aria-hidden у html и body. Скрывайте отдельный виджет, чтобы документ оставался доступным.'],
  ],
  'a11y-aria-required': [
    [/^Put tab inside tablist, menuitem inside menu, option inside listbox, and give each of those widgets at least one child of the required role\.$/, 'Поместите tab внутрь tablist, menuitem внутрь menu, а option внутрь listbox. Добавьте в каждый из этих виджетов хотя бы один дочерний элемент с нужной ролью.'],
  ],
  'a11y-autocomplete': [
    [/^Set autocomplete="email" on email fields and autocomplete="tel" on telephone fields\.$/, 'Задайте autocomplete="email" для полей электронной почты и autocomplete="tel" для полей телефона.'],
  ],
  'a11y-button-name': [
    [/^Give the button text, an aria-label, or an img alt\. An icon alone is not a name\.$/, 'Добавьте кнопке текст, aria-label или alt у img. Одной иконки для доступного имени недостаточно.'],
  ],
  'a11y-color-contrast': [
    [/^Full WCAG contrast checking requires visual rendering$/, 'Для полной проверки контрастности по WCAG нужна визуальная отрисовка'],
    [/^These are heuristic detections; verify with a visual contrast checker$/, 'Проверка приблизительная. Проверьте результат в инструменте проверки контрастности'],
  ],
  'a11y-focus-visible': [
    [/^External stylesheets not analyzed$/, 'Внешние таблицы стилей не проверялись'],
    [/^Ensure :focus-visible provides clear focus indicators$/, 'Убедитесь, что :focus-visible отчётливо выделяет элемент в фокусе'],
    [/^Ensure all interactive elements have visible focus indicators$/, 'Убедитесь, что фокус хорошо виден на всех интерактивных элементах'],
  ],
  'a11y-form-labels': [
    [/^Placeholder text is not a substitute for labels$/, 'Подсказка внутри поля не заменяет подпись поля'],
  ],
  'a11y-heading-order': [
    [/^Add heading structure for accessibility and SEO$/, 'Добавьте заголовки с понятной иерархией для доступности и SEO'],
  ],
  'a11y-landmark-regions': [
    [/^Consider adding role="search" to search forms$/, 'Добавьте role="search" к формам поиска'],
    [/^Add <main> landmark to wrap primary content$/, 'Оберните основное содержимое страницы в <main>'],
    [/^Add landmark regions for better screen reader navigation$/, 'Обозначьте основные области страницы, чтобы упростить навигацию с программой чтения с экрана'],
  ],
  'a11y-skip-link': [
    [/^Simple pages without navigation may not require skip links$/, 'На простых страницах без навигации ссылка для перехода к основному содержимому может не понадобиться'],
    [/^Add a skip link pointing to your <main> element$/, 'Добавьте ссылку для перехода к элементу <main>'],
    [/^Add <main> landmark and a skip link at the top of the page$/, 'Добавьте область <main> и ссылку для перехода к ней в начале страницы'],
  ],
  'a11y-touch-targets': [
    [/^Full touch target analysis requires visual rendering$/, 'Для полной проверки размеров областей нажатия нужна визуальная отрисовка'],
    [/^Ensure interactive elements are at least 44x44 CSS pixels$/, 'Сделайте интерактивные элементы размером не менее 44x44 пикселей CSS'],
  ],
  'a11y-video-captions': [
    [/^If adding video content, include captions or transcripts$/, 'Если добавляете видео, приложите субтитры или расшифровку'],
  ],
  'a11y-xml-lang-mismatch': [
    [/^Set lang and xml:lang to the same language tag, or drop xml:lang\.$/, 'Укажите одинаковый код языка в lang и xml:lang или удалите xml:lang.'],
  ],
  'a11y-zoom-disabled': [
    [/^Consider adding viewport meta tag for mobile optimization$/, 'Добавьте метатег viewport для мобильных устройств'],
    [/^Remove user-scalable=no and ensure maximum-scale > 1 \(or remove it entirely\)$/, 'Удалите user-scalable=no. Задайте maximum-scale > 1 или удалите этот параметр'],
  ],
  'content-article-links': [
    [/^Add more relevant links\. For (\d+) words, aim for at least (\d+) links\. Include internal links to related content and external links to authoritative sources\.$/, (words, links) => `Добавьте ссылки по теме. На ${words} ${plural(words, 'слово', 'слова', 'слов')} ориентируйтесь хотя бы на ${links} ${plural(links, 'ссылку', 'ссылки', 'ссылок')}. Ссылайтесь на материалы по теме внутри сайта и на авторитетные внешние источники.`],
    [/^Remove less relevant links\. Focus on quality over quantity - each link should provide clear value to users\.$/, 'Уберите ссылки, которые слабо связаны с текстом. Оставьте те, которые помогут читателю.'],
    [/^Consider adding internal links to related content$/, 'Добавьте внутренние ссылки на материалы по теме'],
    [/^Consider adding external links to authoritative sources$/, 'Добавьте внешние ссылки на авторитетные источники'],
    [/^Good mix of internal and external links$/, 'Внутренние и внешние ссылки хорошо сбалансированы'],
  ],
  'content-author-info': [
    [/^Add author attribution using Schema\.org Person markup, meta author tag, or visible byline$/, 'Укажите автора в разметке Schema.org Person, метатеге author или видимой подписи'],
  ],
  'content-broken-html': [
    [/^Use an HTML validator to identify and fix structural issues\. Prioritize duplicate IDs and nesting errors\.$/, 'Найдите и исправьте ошибки структуры с помощью валидатора HTML. Начните с повторяющихся id и неправильной вложенности.'],
    [/^Fix the markup errors listed\. A browser often repairs broken HTML silently; a crawler reading the raw source may not\.$/, 'Исправьте перечисленные ошибки разметки. Браузер часто исправляет их при отрисовке, а робот при чтении исходного HTML может их пропустить.'],
    [/^HTML structure appears well-formed$/, 'Структура HTML выглядит корректной'],
  ],
  'content-date-agreement': [
    [/^Make datePublished, the visible time element, and the year in the URL the same published year\. Keep dateModified separate\.$/, 'Укажите один и тот же год публикации в datePublished, видимом элементе time и URL. Дату обновления укажите отдельно в dateModified.'],
  ],
  'content-description-pixel-width': [
    [/^Shorten the description to fit within 920px \(~155 characters\)\. Place the most compelling information first\.$/, 'Сократите description до 920px (~155 символов). Поместите самое важное в начало.'],
    [/^Consider trimming a few characters to ensure the description displays fully in search results$/, 'Уберите несколько символов, чтобы description целиком помещался в результатах поиска'],
  ],
  'content-duplicate-description': [
    [/^Add a unique, compelling meta description between 120-160 characters$/, 'Добавьте уникальный и привлекательный description длиной 120-160 символов'],
    [/^Create unique, descriptive meta descriptions for each page that accurately summarize the specific content$/, 'Напишите для каждой страницы уникальный description, который точно передаёт её содержание'],
    [/^Expand description to 120-160 characters for optimal display in search results$/, 'Увеличьте длину description до 120-160 символов для лучшего отображения в результатах поиска'],
  ],
  'content-duplicate-exact': [
    [/^Consolidate duplicate pages using canonical tags, 301 redirects, or by removing the duplicate\. Ensure each URL serves unique content\.$/, 'Объедините дубли через canonical или редиректы 301 либо удалите повторяющиеся страницы. Оставьте уникальное содержимое по каждому URL.'],
  ],
  'content-duplicate-h1': [
    [/^Give each page a unique H1 that reflects its specific topic\.$/, 'Напишите для каждой страницы уникальный H1, отражающий её тему.'],
  ],
  'content-duplicate-near': [
    [/^Consolidate similar pages, differentiate their content significantly, or use canonical tags to indicate the preferred version\.$/, 'Объедините похожие страницы, существенно переработайте их содержимое или укажите предпочтительные версии через canonical.'],
    [/^Review both pages and differentiate their content, titles, and meta descriptions to target different search intents\.$/, 'Сравните обе страницы. Сделайте их содержимое, title и description подходящими для разных поисковых запросов.'],
  ],
  'content-freshness': [
    [/^Update dateModified when making significant content changes$/, 'Обновляйте dateModified при существенных изменениях содержимого'],
    [/^Add datePublished and dateModified to Article schema, or use <time> elements with datetime attributes$/, 'Добавьте datePublished и dateModified в разметку Article или используйте элементы <time> с атрибутами datetime'],
  ],
  'content-hidden-text': [
    [/^Remove text that is hidden from visitors\. Screen-reader text should use a dedicated class such as sr-only, which this rule ignores\.$/, 'Удалите текст, скрытый от посетителей. Для текста, доступного программе чтения с экрана, используйте отдельный класс, например sr-only. Проверка его пропускает.'],
  ],
  'content-keyword-stuffing': [
    [/^"([\s\S]*)" is treated as this page's primary topic and allowed up to (\d+)% density before being flagged\.$/, '«$1» считается основной темой страницы. Проверка допускает частоту до $2%.'],
    [/^Read the affected passages aloud\. If the repetition sounds forced, vary the wording with synonyms and related terms\. If it reads naturally, no change is needed\.$/, 'Прочитайте отмеченные фрагменты вслух. Если повторения звучат неестественно, используйте синонимы и близкие по смыслу слова. Если текст звучит естественно, оставьте его как есть.'],
    [/^Check whether the flagged terms read naturally in context\. Vary the wording only where the repetition feels mechanical\.$/, 'Проверьте, естественно ли звучат отмеченные слова в тексте. Меняйте формулировки там, где повторения заметны.'],
    [/^Keyword density is within acceptable limits\. "([\s\S]*)" is treated as this page's primary topic and allowed up to (\d+)% density before being flagged\.$/, 'Плотность ключевых слов в допустимых пределах. «$1» считается основной темой страницы. Проверка допускает частоту до $2%.'],
  ],
  'content-meta-in-body': [
    [/^Move all meta tags, title, and canonical link to the <head> section\. Check for HTML template errors or dynamic rendering issues\.$/, 'Перенесите метатеги, title и ссылку canonical в <head>. Проверьте шаблон HTML и динамическую отрисовку.'],
  ],
  'content-mime-type': [
    [/^Configure your server to send the Content-Type header with every response$/, 'Настройте сервер так, чтобы он отправлял заголовок Content-Type с каждым ответом'],
    [/^HTML pages should be served with text\/html or application\/xhtml\+xml MIME type$/, 'Отдавайте HTML-страницы с MIME-типом text/html или application/xhtml+xml'],
    [/^Add charset=utf-8 to Content-Type header: "text\/html; charset=utf-8"$/, 'Добавьте charset=utf-8 в заголовок Content-Type — «text/html; charset=utf-8»'],
    [/^Use UTF-8 encoding for maximum compatibility: "text\/html; charset=utf-8"$/, 'Используйте UTF-8 для совместимости — «text/html; charset=utf-8»'],
  ],
  'content-mojibake': [
    [/^Serve the HTML as UTF-8 and re-save the source as UTF-8\. Typical corruption is a curly quote or accented letter decoded as Latin-1\.$/, 'Сохраните исходник в UTF-8 и отдавайте HTML в этой кодировке. Типичный пример ошибки — фигурные кавычки или буквы с диакритикой, прочитанные как Latin-1.'],
  ],
  'content-placeholder-text': [
    [/^Render the template before the page is served\. A visitor should not see \{\{ \}\}, \{% %\}, or \[object Object\]\.$/, 'Обработайте шаблон до отправки страницы. Убедитесь, что посетители не видят {{ }}, {% %} и [object Object].'],
    [/^Remove TODO and FIXME notes from published copy\.$/, 'Удалите пометки TODO и FIXME из опубликованного текста.'],
  ],
  'content-reading-level': [
    [/^Content is accessible to a general audience while maintaining substance$/, 'Текст понятен широкой аудитории и подробно раскрывает тему'],
    [/^Content may be too simple for some topics\. Consider adding more technical depth if appropriate\.$/, 'Для некоторых тем текст может быть слишком простым. Добавьте технических подробностей, если они уместны.'],
    [/^Content could be simplified for broader accessibility\. Use shorter sentences and simpler vocabulary\.$/, 'Упростите текст, чтобы его понимало больше читателей. Используйте более короткие предложения и простые слова.'],
    [/^Simplify language by: using shorter sentences, replacing jargon with common words, breaking long paragraphs into smaller chunks, and using bullet points for lists\.$/, 'Пишите короткими предложениями, заменяйте жаргон общеупотребительными словами, разбивайте длинные абзацы и оформляйте перечисления маркированными списками.'],
    [/^Technical content for expert audiences may legitimately score lower\.$/, 'Технические материалы для специалистов могут закономерно получать более низкую оценку.'],
    [/^Consider adding more depth and detail\. Use varied sentence structures and include relevant technical terms where appropriate\.$/, 'Раскройте тему подробнее. Чередуйте конструкции предложений и используйте профильные термины там, где это уместно.'],
  ],
  'content-stale-copyright': [
    [/^Update the footer copyright to (\d+)\.$/, 'Укажите $1 год в отметке об авторских правах в подвале сайта.'],
  ],
  'content-text-html-ratio': [
    [/^Reduce unnecessary markup, inline styles, and scripts\. Add more meaningful text content\.$/, 'Уберите лишнюю разметку, встроенные стили и скрипты. Добавьте полезный текст.'],
    [/^Aim for at least 25% text-to-HTML ratio by reducing code bloat or adding more content$/, 'Доведите долю текста в HTML хотя бы до 25%. Сократите лишний код или добавьте содержательный текст'],
  ],
  'content-thin-vs-site': [
    [/^Bring this (article|product|other) page toward the length of the other \1 pages, about (\d+) words\.$/, (kind, words) => `Доведите объём текста примерно до ${words} ${plural(words, 'слова', 'слов', 'слов')}, как у ${pageKinds[kind]} на сайте.`],
  ],
  'content-title-pattern': [
    [/^End the title with the same separator and "([\s\S]*)" the rest of the site uses, or drop the suffix everywhere\.$/, 'Используйте в конце title тот же разделитель и суффикс «$1», что и на остальных страницах, или удалите суффикс везде.'],
  ],
  'content-title-pixel-width': [
    [/^Shorten the title to fit within 580px\. Move the most important keywords to the beginning\.$/, 'Сократите title до 580px. Перенесите самые важные ключевые слова в начало.'],
    [/^Consider trimming a few characters to ensure the title displays fully in search results$/, 'Уберите несколько символов, чтобы title целиком помещался в результатах поиска'],
  ],
  'content-title-same-as-description': [
    [/^Write a distinct meta description that expands on the title and encourages clicks from search results$/, 'Напишите отдельный description, который дополняет title и помогает заинтересовать пользователя в результатах поиска'],
  ],
  'content-title-same-as-h1': [
    [/^Differentiate the title from the H1\. For example, add your brand name to the title or use a slightly different phrasing to target additional keywords\.$/, 'Сделайте title и H1 разными. Например, добавьте в title название бренда или измените формулировку, чтобы охватить дополнительные ключевые слова.'],
  ],
  'content-unrendered-markup': [
    [/^Render the field as HTML before publishing, or stop storing Markdown in a plain-text slot\.$/, 'Преобразуйте содержимое поля в HTML перед публикацией или храните Markdown в поле, которое поддерживает такую разметку.'],
  ],
  'content-word-count': [
    [/^Expand content to at least 300 words, or consider consolidating with other pages$/, 'Увеличьте объём текста хотя бы до 300 слов или объедините материал с другими страницами'],
    [/^Add more comprehensive content covering the topic thoroughly\. Aim for 500\+ words for standard pages, 1000\+ for in-depth articles\.$/, 'Раскройте тему подробнее. Ориентируйтесь на 500+ слов для обычных страниц и 1000+ для подробных статей.'],
  ],
  'core-canonical-attributes': [
    [/^Remove invalid attributes from the canonical element; use alternate annotations \(e\.g\. hreflang links\) where appropriate$/, 'Удалите недопустимые атрибуты из элемента canonical. При необходимости добавьте отдельную разметку, например ссылки hreflang'],
    [/^Simplify the canonical element to only rel and href attributes$/, 'Оставьте у элемента canonical только атрибуты rel и href'],
  ],
  'core-canonical-conflicting': [
    [/^Remove one canonical source to avoid conflicting signals; prefer the HTML <link rel="canonical"> tag$/, 'Уберите один из источников canonical, чтобы избежать противоречий. Предпочтительный вариант — тег HTML <link rel="canonical">'],
  ],
  'core-canonical-external': [
    [/^Cross-domain canonicals are legitimate for syndicated or consolidated content - verify the target is intentional, as this page cedes its ranking signals to the other host\.$/, 'canonical на другом домене допустим при перепубликации или объединении материалов. Проверьте адрес назначения, поскольку эта страница передаёт сигналы ранжирования другому домену.'],
  ],
  'core-canonical-fragment': [
    [/^Use a canonical URL without #: give each piece of content its own path\.$/, 'Используйте canonical без #. Назначьте каждому самостоятельному материалу свой путь.'],
  ],
  'core-canonical-header': [
    [/^Use HTML canonical tag exclusively; reserve Link header for non-HTML resources like PDFs$/, 'Указывайте canonical в теге HTML. Используйте заголовок Link для ресурсов без HTML, например PDF'],
  ],
  'core-canonical-http-mismatch': [
    [/^Update canonical to use HTTPS to match the page protocol and avoid indexing the insecure version$/, 'Укажите HTTPS в canonical, чтобы он совпадал с протоколом страницы и поисковики не индексировали незащищённую версию'],
    [/^Ensure canonical protocol matches the page protocol$/, 'Убедитесь, что протокол в canonical совпадает с протоколом страницы'],
  ],
  'core-canonical-loop': [
    [/^Ensure the canonical target page does not point back to this page, which would create a loop that confuses search engines$/, 'Проверьте, что целевая страница canonical не ссылается через canonical обратно. Такая цепочка образует цикл для поисковых роботов'],
  ],
  'core-canonical-multiple': [
    [/^Keep a single <link rel="canonical"> element pointing at the correct URL$/, 'Оставьте один элемент <link rel="canonical"> с правильным URL'],
    [/^Specify the canonical only once per page$/, 'Указывайте canonical на странице один раз'],
  ],
  'core-canonical-outside-head': [
    [/^Move the <link rel="canonical"> element into the <head>$/, 'Перенесите <link rel="canonical"> в <head>'],
  ],
  'core-canonical-to-homepage': [
    [/^Set the canonical URL to the current page URL \(self-referencing canonical\) unless this is an intentional redirect$/, 'Укажите в canonical URL текущей страницы, если перенаправление не было запланировано'],
  ],
  'core-canonical-to-noindex': [
    [/^Remove the noindex directive to let the canonical signal work, or remove the canonical and keep noindex if the page should not be indexed$/, 'Удалите noindex, чтобы поисковики учли canonical. Если страницу нужно исключить из индекса, удалите canonical и оставьте noindex'],
  ],
  'core-nosnippet': [
    [/^Remove nosnippet directive unless specifically needed for sensitive content \(login, legal pages\)$/, 'Удалите nosnippet, если он не нужен для страниц с чувствительным содержимым, например страниц входа или правовых документов'],
  ],
  'core-obsolete-robots-directives': [
    [/^Remove (\w+(?: and \w+)*) from the robots directives\.$/, (directives) => `Удалите ${directives.replaceAll(' and ', ' и ')} из директив robots.`],
  ],
  'core-robots-directive-mismatch': [
    [/^Declare robots directives in one location only and make them agree$/, 'Объявите директивы robots в одном месте и устраните противоречия'],
    [/^Declare each robots directive once, in either the HTML or the HTTP header$/, 'Объявляйте каждую директиву robots один раз, в HTML или в заголовке HTTP'],
  ],
  'core-robots-meta': [
    [/^Remove restrictive directives unless intentionally blocking search engines$/, 'Уберите ограничивающие директивы, если не собирались закрывать доступ для поисковых роботов'],
  ],
  'core-title-unique': [
    [/^Create unique, descriptive titles for each page \(e\.g\., "Page Topic \| Brand Name"\)$/, 'Напишите для каждой страницы уникальный title, который описывает её содержание. Например, «Тема страницы | Название бренда»'],
  ],
  'core-unavailable-after': [
    [/^Remove the unavailable_after directive if the page should still appear in search results\.$/, 'Удалите директиву unavailable_after, если страница должна оставаться в результатах поиска.'],
    [/^Write the date in RFC 822, RFC 850 or ISO 8601 form, for example 2026-12-31T23:59:59Z\.$/, 'Укажите дату в формате RFC 822, RFC 850 или ISO 8601, например 2026-12-31T23:59:59Z.'],
  ],
  'crawl-blocked-images': [
    [/^Allow the image paths in robots\.txt, or serve the images from a path that is not disallowed\.$/, 'Разрешите пути к изображениям в robots.txt или перенесите изображения по разрешённому пути.'],
  ],
  'crawl-blocked-resources': [
    [/^Allow search engines to access CSS and JS files by removing or adjusting these Disallow rules$/, 'Откройте поисковым роботам доступ к файлам CSS и JS. Удалите или скорректируйте эти директивы Disallow'],
  ],
  'crawl-canonical-chain': [
    [/^Point the canonical directly at (\S+)\.$/, 'Укажите в canonical напрямую $1.'],
  ],
  'crawl-canonical-form-drift': [
    [/^Pick one canonical form — https, one host, and one trailing-slash rule — and use it on every page\.$/, 'Приведите canonical на всех страницах к одному виду. Используйте https, один хост и единый подход к завершающему слешу.'],
  ],
  'crawl-canonical-loop': [
    [/^Make every page in the loop canonicalize to a single final URL\.$/, 'Укажите для всех страниц в цикле один конечный URL в canonical.'],
  ],
  'crawl-canonical-redirect': [
    [/^Update canonical to point to a valid URL$/, 'Укажите в canonical действительный URL'],
    [/^Update canonical to point directly to (\S+)$/, 'Укажите в canonical напрямую $1'],
  ],
  'crawl-canonical-to-disallowed': [
    [/^Point the canonical at a crawlable URL, or remove the robots\.txt disallow for the target\.$/, 'Укажите в canonical URL, доступный для обхода, или снимите запрет в robots.txt для целевого URL.'],
  ],
  'crawl-canonical-to-noindex': [
    [/^Point the canonical at an indexable URL, or remove noindex from the canonical target\.$/, 'Укажите в canonical URL, доступный для индексации, или удалите noindex с целевой страницы.'],
  ],
  'crawl-crawl-delay': [
    [/^Reduce Crawl-delay to 1-(\d+) seconds or remove it; Google ignores this directive$/, 'Задайте Crawl-delay в пределах 1-$1 секунд или удалите директиву. Google её игнорирует'],
  ],
  'crawl-hreflang-disallowed-target': [
    [/^Remove the robots\.txt disallow for this URL, or remove the hreflang annotations pointing at it\.$/, 'Разрешите обход этого URL в robots.txt или удалите ведущие на него ссылки hreflang.'],
  ],
  'crawl-hreflang-incoming-conflict': [
    [/^Make every page in the hreflang cluster annotate each member URL with the same single language\/region code\.$/, 'Используйте один и тот же код языка и региона для каждого URL на всех страницах группы hreflang.'],
  ],
  'crawl-hreflang-reciprocity': [
    [/^Add reciprocal hreflang annotations on the target pages pointing back at this URL\.$/, 'Добавьте на целевых страницах обратные ссылки hreflang на этот URL.'],
  ],
  'crawl-hreflang-to-disallowed': [
    [/^Remove the robots\.txt disallow for the hreflang targets, or drop the annotations pointing at them\.$/, 'Снимите в robots.txt запрет на обход целевых страниц hreflang или удалите ведущие на них ссылки hreflang.'],
  ],
  'crawl-hreflang-to-noindex': [
    [/^Remove noindex from the hreflang targets, or drop the annotations pointing at them\.$/, 'Удалите noindex с целевых страниц hreflang или уберите ведущие на них ссылки hreflang.'],
  ],
  'crawl-indexability-conflict': [
    [/^Choose one method: either block in robots\.txt OR use noindex, not both$/, 'Выберите один способ. Закройте обход в robots.txt или используйте noindex'],
    [/^This is a valid configuration if you want the page crawlable but not indexed$/, 'Такая настройка подходит, если страницу нужно оставить доступной для обхода и исключить из индекса'],
    [/^Add noindex if you want to guarantee no indexing, or allow crawling in robots\.txt$/, 'Добавьте noindex, если нужно гарантированно исключить страницу из индекса, или разрешите обход в robots.txt'],
  ],
  'crawl-indexable-not-in-sitemap': [
    [/^Add the page to the XML sitemap, or noindex it if it should not be found\.$/, 'Добавьте страницу в XML sitemap или задайте для неё noindex, если её нужно скрыть из поиска.'],
  ],
  'crawl-isolated-url': [
    [/^Link to this page from ordinary anchors on relevant, indexable pages; do not rely on canonicals, redirects or the sitemap for discovery\.$/, 'Добавьте обычные ссылки на эту страницу с тематических страниц, доступных для индексации. Не полагайтесь только на canonical, редиректы и sitemap.'],
    [/^Link to this page from at least one indexable page so the discovery path survives\.$/, 'Добавьте ссылку хотя бы с одной индексируемой страницы, чтобы робот мог найти этот URL.'],
    [/^Link to this page - or to the pages linking to it - from ordinarily linked, indexable content\.$/, 'Добавьте с доступных для индексации страниц обычные ссылки на эту страницу или на страницы, которые на неё ссылаются.'],
  ],
  'crawl-noindex-in-sitemap': [
    [/^Either remove the page from sitemap or remove the noindex directive$/, 'Удалите страницу из sitemap или снимите с неё noindex'],
  ],
  'crawl-pagination-broken': [
    [/^Fix the pagination link URLs to use valid, absolute or relative URLs$/, 'Исправьте ссылки пагинации. Используйте действительные абсолютные или относительные URL'],
  ],
  'crawl-pagination-canonical': [
    [/^Add a self-referencing canonical tag to this paginated page$/, 'Укажите URL текущей страницы в её canonical'],
    [/^Each paginated page should have a self-referencing canonical$/, 'Указывайте в canonical каждой страницы пагинации её собственный URL'],
    [/^Verify this is intentional; typically each paginated page should self-reference$/, 'Проверьте, так ли было задумано. Обычно canonical каждой страницы пагинации указывает на неё саму'],
  ],
  'crawl-pagination-isolated': [
    [/^Link to the pagination series from ordinary anchors \(e\.g\. a pager in the body\), not only rel="next"\/"prev" tags\.$/, 'Добавьте обычные ссылки между страницами пагинации, например блок навигации в теле страницы. Одних тегов rel="next"/"prev" недостаточно.'],
  ],
  'crawl-pagination-loop': [
    [/^Fix pagination links to point to the correct next\/previous page in the series$/, 'Исправьте ссылки пагинации, чтобы они вели на правильную следующую или предыдущую страницу'],
  ],
  'crawl-pagination-noindex': [
    [/^Remove noindex from paginated pages; use rel="canonical" to consolidate signals instead$/, 'Удалите noindex со страниц пагинации. Для объединения сигналов используйте rel="canonical"'],
  ],
  'crawl-pagination-orphaned': [
    [/^Add <link rel="next"> and\/or <link rel="prev"> to declare the pagination relationship$/, 'Добавьте <link rel="next"> и/или <link rel="prev">, чтобы связать страницы пагинации'],
  ],
  'crawl-pagination-sequence': [
    [/^Ensure rel="next" and rel="prev" point to different pages in the series$/, 'Убедитесь, что rel="next" и rel="prev" ведут на разные страницы'],
  ],
  'crawl-pdf-size': [
    [/^Compress the PDF or split it\. Files over 10 MB are slow to download and to crawl\.$/, 'Сожмите PDF или разделите его на части. Файлы больше 10 MB медленно загружаются и замедляют обход.'],
  ],
  'crawl-schema-noindex-conflict': [
    [/^Remove noindex to allow rich results, or remove schema markup if page should stay hidden$/, 'Уберите noindex, чтобы страница могла появляться в расширенных результатах. Если её нужно скрыть, удалите структурированные данные'],
  ],
  'crawl-sitemap-cross-duplicates': [
    [/^Assign each URL to a single sitemap so coverage reporting stays meaningful\.$/, 'Указывайте каждый URL только в одном sitemap, чтобы отчёты об охвате отражали реальную картину.'],
  ],
  'crawl-sitemap-date-drift': [
    [/^Make lastmod and dateModified the same day, or stop publishing the one that is stale\.$/, 'Укажите один и тот же день в lastmod и dateModified или уберите устаревшее значение.'],
  ],
  'crawl-sitemap-disallowed': [
    [/^Remove the URLs from the sitemap or allow them in robots\.txt - whichever reflects intent\.$/, 'Удалите URL из sitemap, если они закрыты намеренно. Если их нужно обходить, разрешите их в robots.txt.'],
  ],
  'crawl-sitemap-domain': [
    [/^Remove cross-domain URLs from the sitemap or fix incorrect domain formatting$/, 'Удалите из sitemap URL других доменов или исправьте написание домена'],
    [/^Review and remove cross-domain URLs from the sitemap$/, 'Проверьте sitemap и удалите URL других доменов'],
  ],
  'crawl-sitemap-duplicate-urls': [
    [/^Remove duplicate entries from the sitemap$/, 'Удалите дубли из sitemap'],
  ],
  'crawl-sitemap-in-robotstxt': [
    [/^Add a Sitemap: directive to robots\.txt \(e\.g\., Sitemap: https:\/\/example\.com\/sitemap\.xml\)$/, 'Добавьте в robots.txt директиву Sitemap:, например Sitemap: https://example.com/sitemap.xml'],
  ],
  'crawl-sitemap-lastmod': [
    [/^Add <lastmod> reflecting genuine content changes so crawlers can prioritise what actually changed\.$/, 'Укажите в <lastmod> дату последнего реального изменения, чтобы поисковые роботы могли обходить изменившиеся страницы в первую очередь.'],
    [/^lastmod must be a W3C Datetime, e\.g\. 2026-08-31 or 2026-08-31T12:00:00\+00:00\.$/, 'Укажите lastmod в формате W3C Datetime, например 2026-08-31 или 2026-08-31T12:00:00+00:00.'],
  ],
  'crawl-sitemap-non-200': [
    [/^Remove erroring URLs from the sitemap or fix the underlying responses\.$/, 'Удалите из sitemap URL, которые возвращают ошибки, или исправьте ответы сервера.'],
    [/^Replace redirected URLs with their final targets and investigate timed-out pages\.$/, 'Замените URL с редиректами на конечные адреса. Выясните, почему другие страницы не ответили вовремя.'],
  ],
  'crawl-sitemap-non-canonical': [
    [/^List the canonical targets in the sitemap instead of URLs that canonicalise away\.$/, 'Укажите в sitemap URL из canonical вместо адресов страниц, у которых canonical ведёт на другой URL.'],
  ],
  'crawl-sitemap-orphan-urls': [
    [/^Add internal links to orphan pages or remove them from the sitemap if obsolete$/, 'Добавьте внутренние ссылки на страницы, на которые никто не ссылается. Если эти страницы устарели, удалите их из sitemap'],
  ],
  'crawl-sitemap-size-limit': [
    [/^Split the sitemap into multiple smaller files using a sitemap index$/, 'Разделите sitemap на несколько файлов меньшего размера и перечислите их в индексном файле sitemap'],
    [/^Consider splitting into multiple sitemaps before reaching the limit$/, 'Разделите sitemap на несколько файлов до достижения лимита'],
  ],
  'crawl-sitemap-url-limit': [
    [/^Split the sitemap into multiple files using a sitemap index$/, 'Разделите sitemap на несколько файлов и перечислите их в индексном файле sitemap'],
    [/^Consider splitting into multiple sitemaps before reaching the limit$/, 'Разделите sitemap на несколько файлов до достижения лимита'],
  ],
  'eeat-about-page': [
    [/^Add an "About" or "About Us" page explaining who you are and link to it from your navigation$/, 'Добавьте страницу «О нас» с информацией о компании или команде и ссылку на неё в меню'],
  ],
  'eeat-affiliate-disclosure': [
    [/^Consider making disclosure more prominent \(near top of content\)$/, 'Разместите уведомление заметнее, например ближе к началу материала'],
    [/^Add a clear affiliate disclosure near the top of content\. Example: "This post contains affiliate links\. We may earn a commission at no extra cost to you\."$/, 'Добавьте в начале материала понятное уведомление о партнёрских ссылках. Например, «В этом материале есть партнёрские ссылки. Мы можем получить комиссию, а цена для покупателя останется прежней».'],
  ],
  'eeat-author-byline': [
    [/^Add author attribution using Schema\.org Person markup, meta author tag, or visible byline$/, 'Укажите автора в разметке Schema.org Person, метатеге author или видимой подписи'],
  ],
  'eeat-author-expertise': [
    [/^Consider adding more expertise indicators: credentials, detailed bio, social profiles$/, 'Укажите квалификацию автора, добавьте подробную биографию и ссылки на профили в соцсетях'],
    [/^Add author credentials, bio, and professional social links to establish expertise$/, 'Укажите квалификацию автора, добавьте биографию и ссылки на профессиональные профили в соцсетях'],
    [/^This check requires author attribution\. See eeat-author-byline rule\.$/, 'Укажите автора, чтобы проверка могла выполниться. См. правило eeat-author-byline.'],
  ],
  'eeat-citations': [
    [/^Consider removing nofollow from citations to authoritative sources$/, 'Уберите nofollow со ссылок на авторитетные источники'],
    [/^Consider adding more citations to authoritative sources \(\.gov, \.edu, research papers\)$/, 'Добавьте больше ссылок на авторитетные источники, например сайты .gov, .edu и научные работы'],
    [/^Consider linking to authoritative sources like \.gov, \.edu, or peer-reviewed publications$/, 'Добавьте ссылки на авторитетные источники, например сайты .gov, .edu или рецензируемые публикации'],
    [/^For content making claims, consider citing authoritative sources to build credibility$/, 'Подкрепляйте утверждения ссылками на авторитетные источники'],
  ],
  'eeat-contact-page': [
    [/^Add a contact page with multiple ways to reach you: email, phone, form, and\/or physical address$/, 'Добавьте страницу контактов с несколькими способами связи. Укажите электронную почту, телефон, форму обратной связи и/или почтовый адрес'],
    [/^Add a contact page with multiple ways to reach you: email, phone, contact form, and physical address$/, 'Добавьте страницу контактов с несколькими способами связи. Укажите электронную почту, телефон, форму обратной связи и почтовый адрес'],
  ],
  'eeat-content-dates': [
    [/^Update dateModified when making significant content changes$/, 'Обновляйте dateModified при существенных изменениях содержимого'],
    [/^Add datePublished and dateModified to Article schema, or use <time> elements with datetime attributes$/, 'Добавьте datePublished и dateModified в разметку Article или используйте элементы <time> с атрибутами datetime'],
  ],
  'eeat-disclaimers': [
    [/^Consider adding specific disclaimers for (.+) content$/, (topics) => `Добавьте предупреждения об ограничениях к материалам по указанным темам — ${topics.split(', ').map((topic) => ymylTopics[topic] ?? topic).join(', ')}.`],
    [/^Add appropriate disclaimers for sensitive content$/, 'Добавьте предупреждения об ограничениях для материалов на чувствительные темы'],
    [/^(Add (?:medical|financial|legal) disclaimer: "[^"]+"(?:\. Add (?:medical|financial|legal) disclaimer: "[^"]+")*)$/, translateDisclaimers],
  ],
  'eeat-editorial-policy': [
    [/^Consider creating a dedicated editorial policy page explaining your content standards$/, 'Создайте отдельную страницу редакционной политики и опишите, по каким стандартам готовятся материалы'],
    [/^Create an editorial policy page to document your content quality standards$/, 'Создайте страницу редакционной политики и опишите требования к качеству материалов'],
    [/^Add an editorial policy page explaining your content creation, review, and correction processes$/, 'Добавьте страницу редакционной политики. Объясните, как готовятся и проверяются материалы и как исправляются ошибки'],
  ],
  'eeat-geo-meta': [
    [/^Add meta tags for geo\.region, geo\.placename, or geo\.position on pages that describe a place\.$/, 'Добавьте метатеги geo.region, geo.placename или geo.position на страницы с описанием мест.'],
  ],
  'eeat-nap-consistency': [
    [/^Publish one phone number and one postal address for each organization name\.$/, 'Укажите один номер телефона и один почтовый адрес для каждого названия организации.'],
  ],
  'eeat-physical-address': [
    [/^Add your business address using Schema\.org PostalAddress and display it visibly on the page$/, 'Укажите адрес компании в разметке Schema.org PostalAddress и разместите его на видном месте на странице'],
    [/^Consider adding a physical address if you operate a business to build trust$/, 'Если сайт принадлежит компании, укажите её фактический адрес, чтобы повысить доверие'],
  ],
  'eeat-privacy-policy': [
    [/^Add a link to your privacy policy in the footer of every page$/, 'Добавьте ссылку на политику конфиденциальности в подвал каждой страницы'],
  ],
  'eeat-terms-of-service': [
    [/^Add a link to your terms of service in the footer of every page$/, 'Добавьте ссылку на условия использования в подвал каждой страницы'],
  ],
  'eeat-trust-signals': [
    [/^Consider adding more trust signals: reviews, certifications, media mentions$/, 'Добавьте больше подтверждений надёжности, например отзывы, сертификаты и упоминания в СМИ'],
    [/^Add more types of trust signals: customer reviews, certifications, security badges, media mentions$/, 'Добавьте разные подтверждения надёжности, например отзывы клиентов, сертификаты, значки безопасности и упоминания в СМИ'],
    [/^Add trust signals: customer reviews\/testimonials, certifications, security badges, media mentions, or client logos$/, 'Покажите, почему компании можно доверять. Добавьте отзывы или рекомендации клиентов, сертификаты, значки безопасности, упоминания в СМИ или логотипы клиентов'],
  ],
  'eeat-ymyl-detection': [
    [/^YMYL content requires strong E-E-A-T signals: author credentials, citations, disclaimers$/, 'Подкрепите материалы на темы YMYL сигналами E-E-A-T. Укажите квалификацию авторов, добавьте ссылки на источники и предупреждения об ограничениях'],
  ],
  'geo-agents-md': [
    [/^Serve AGENTS\.md as text or Markdown, not the site HTML fallback\.$/, 'Отдавайте AGENTS.md как текст или Markdown и отключите подстановку HTML сайта для этого пути.'],
    [/^Add \/AGENTS\.md describing how an agent should use this site\.$/, 'Добавьте /AGENTS.md и опишите, как агентам работать с сайтом.'],
  ],
  'geo-ai-bot-access': [
    [/^Allow the answer-engine crawlers \(OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended\) to appear in AI answers\. Training crawlers such as GPTBot can stay blocked if that is your policy\.$/, 'Откройте OAI-SearchBot, PerplexityBot, ClaudeBot и Google-Extended доступ к сайту, чтобы он мог появляться в ответах ИИ. Роботов для обучения, например GPTBot, можно оставить заблокированными, если такова политика сайта.'],
    [/^These crawlers fetch pages to answer user questions and can cite you\. Blocking them removes this site from those answers\.$/, 'Эти роботы загружают страницы, чтобы отвечать на вопросы пользователей, и могут ссылаться на сайт. При их блокировке сайт пропадёт из таких ответов.'],
    [/^Blocking training-only crawlers does not affect visibility in AI answers\.$/, 'Блокировка роботов, которые собирают данные только для обучения, не влияет на видимость в ответах ИИ.'],
  ],
  'geo-content-signals': [
    [/^Use search, ai-input, and ai-train with yes or no\. If training crawlers are disallowed, set ai-train=no\.$/, 'Используйте yes или no в search, ai-input и ai-train. Чтобы запретить использование данных для обучения, задайте ai-train=no.'],
  ],
  'geo-content-structure': [
    [/^Add a clear <main> or <article> area, use hierarchical headings, write paragraph prose, and include lists or tables for structured information$/, 'Выделите основное содержимое тегом <main> или <article>. Выстройте иерархию заголовков, разбейте текст на абзацы и используйте списки или таблицы для структурированных данных'],
  ],
  'geo-llms-txt': [
    [/^llms\.txt is an emerging standard \(llmstxt\.org\) - not yet required but recommended for AI visibility$/, 'llms.txt — формирующийся стандарт (llmstxt.org). Он пока не обязателен, но может улучшить видимость в ИИ-сервисах'],
    [/^Add <link rel="llms" href="\/llms\.txt"> in <head>, or create \/llms\.txt describing your site for LLMs \(see llmstxt\.org\)$/, 'Добавьте <link rel="llms" href="/llms.txt"> в <head> или создайте /llms.txt с описанием сайта для языковых моделей (см. llmstxt.org)'],
  ],
  'geo-markdown-page': [
    [/^Answer Accept: text\/markdown for this URL, or publish the same path with a \.md suffix\.$/, 'Отдавайте Markdown по этому URL в ответ на Accept: text/markdown или опубликуйте тот же путь с суффиксом .md.'],
  ],
  'geo-markdown-response': [
    [/^Answer Accept: text\/markdown for \/, or publish \/index\.md, so an agent can read the page without the HTML chrome\.$/, 'Отдавайте Markdown по пути / в ответ на Accept: text/markdown или опубликуйте /index.md. Так агент сможет прочитать страницу без служебной разметки HTML.'],
  ],
  'geo-pay-per-crawl': [
    [/^Add a Pay or Crawler-Price header, or a Link with rel=payment, to the 402 response\.$/, 'Добавьте в ответ 402 заголовок Pay или Crawler-Price либо заголовок Link с rel=payment.'],
  ],
  'geo-rsl-license': [
    [/^Point License: at a document that returns 200 and describes the license, not an HTML page\.$/, 'Укажите в License: адрес документа с условиями лицензии, который возвращает код 200. Используйте отдельный документ вместо HTML-страницы.'],
  ],
  'geo-schema-drift': [
    [/^Ensure the name or headline in your JSON-LD matches text that actually appears on the page$/, 'Убедитесь, что name или headline в JSON-LD совпадает с текстом на странице'],
    [/^Keep JSON-LD structured data consistent with visible page content to avoid misleading AI systems$/, 'Согласуйте данные JSON-LD с видимым содержимым страницы, чтобы ИИ-системы получали точную информацию'],
  ],
  'geo-semantic-html': [
    [/^Add semantic elements like <main>, <article>, <header>, <footer>, and <nav> to help AI understand your content structure$/, 'Добавьте семантические элементы <main>, <article>, <header>, <footer> и <nav>, чтобы ИИ-системы могли разобрать структуру материала'],
  ],
  'geo-well-known': [
    [/^Replace the ChatGPT plugin file with an MCP server card or an agent card\.$/, 'Замените файл плагина ChatGPT карточкой сервера MCP или карточкой агента.'],
    [/^Publish \/\.well-known\/mcp\.json or \/\.well-known\/agent-card\.json if agents should call this site\.$/, 'Опубликуйте /.well-known/mcp.json или /.well-known/agent-card.json, если агенты должны обращаться к сайту.'],
  ],
  'htmlval-body-structure': [
    [/^Keep one <head> and one <body> inside <html>, with nothing but whitespace or comments before <head>\. Content before <head> makes browsers and search engines ignore the head\.$/, 'Оставьте внутри <html> по одному элементу <head> и <body>. Перед <head> допустимы только пробельные символы и комментарии. Иное содержимое перед <head> может привести к тому, что браузеры и поисковые роботы проигнорируют этот элемент.'],
  ],
  'i18n-hreflang-conflicting': [
    [/^Each language\/region code should point to exactly one URL, each URL should be targeted by exactly one code, and the page should self-reference under a single code\. Remove duplicate entries\.$/, 'Укажите ровно один URL для каждого кода языка или региона и ровно один код для каждого URL. Добавьте ссылку страницы на себя под одним кодом. Удалите дубли.'],
  ],
  'i18n-hreflang-incoming-invalid': [
    [/^Fix the annotations on the source pages to use valid ISO 639-1 language codes with optional ISO 3166-1 Alpha-2 region codes \(e\.g\. "en", "en-GB"\)\.$/, 'Исправьте hreflang на исходных страницах. Используйте коды языков ISO 639-1 и при необходимости коды регионов ISO 3166-1 Alpha-2, например «en» и «en-GB».'],
  ],
  'i18n-hreflang-lang-mismatch': [
    [/^Ensure the html lang attribute and hreflang self-reference use the same primary language code$/, 'Укажите один и тот же основной код языка в атрибуте lang тега html и в hreflang, который ссылается на текущую страницу'],
  ],
  'i18n-hreflang-multiple-methods': [
    [/^Use a single method for hreflang declaration to avoid conflicting annotations$/, 'Объявляйте hreflang одним способом, чтобы избежать противоречий'],
  ],
  'i18n-hreflang-relative-url': [
    [/^Hreflang targets must be absolute URLs including the protocol \(e\.g\. https:\/\/example\.com\/fr\/\)\.$/, 'Используйте абсолютные URL с протоколом для целевых страниц hreflang, например https://example.com/fr/.'],
  ],
  'i18n-hreflang-return-links': [
    [/^Add a <link rel="alternate" hreflang="xx" href="\.\.\."> pointing to the current page URL$/, 'Добавьте <link rel="alternate" hreflang="xx" href="..."> со ссылкой на URL текущей страницы'],
  ],
  'i18n-hreflang-to-broken': [
    [/^Re-crawl or fetch these URLs manually to confirm they are reachable$/, 'Запустите повторный обход или откройте эти URL вручную, чтобы проверить их доступность'],
    [/^Ensure all hreflang href values are valid absolute HTTP\(S\) URLs that return a 200 status$/, 'Убедитесь, что все href в hreflang содержат действительные абсолютные URL с HTTP(S) и возвращают код 200'],
  ],
  'i18n-hreflang-to-noindex': [
    [/^Remove noindex to allow search engines to index this language version, or remove hreflang if the page should not be indexed$/, 'Удалите noindex, чтобы поисковые системы могли проиндексировать эту языковую версию. Если страницу нужно исключить из индекса, удалите hreflang'],
  ],
  'i18n-hreflang-to-non-canonical': [
    [/^Ensure hreflang URLs point to the canonical version of each page$/, 'Убедитесь, что hreflang указывает на версию каждой страницы, заданную в её canonical'],
  ],
  'i18n-hreflang-to-redirect': [
    [/^Update hreflang URLs to point at the final HTTPS destination to avoid redirect chains$/, 'Укажите в hreflang конечные HTTPS-адреса, чтобы избежать цепочек редиректов'],
  ],
  'i18n-hreflang': [
    [/^Ignore if hreflang is declared in the XML sitemap, which this rule does not read$/, 'Пропустите замечание, если hreflang объявлен в XML sitemap. Это правило его не проверяет'],
    [/^Add <link rel="alternate" hreflang="\.\.\."> for every language version, including this page itself$/, 'Добавьте <link rel="alternate" hreflang="..."> для каждой языковой версии, включая текущую страницу'],
    [/^Add hreflang tags if you have multi-language or regional versions$/, 'Добавьте теги hreflang, если у страницы есть языковые или региональные версии'],
  ],
  'i18n-lang-attribute': [
    [/^Add lang attribute: <html lang="en">$/, 'Добавьте атрибут lang, например <html lang="en">'],
  ],
  'images-alt-length': [
    [/^Keep alt text concise and under (\d+) characters; use longdesc or figcaption for detailed descriptions$/, (count) => `Пишите короткий alt длиной меньше ${count} ${plural(count, 'символа', 'символов', 'символов')}. Для подробных описаний используйте longdesc или figcaption`],
    [/^Aim for alt text under (\d+) characters for optimal screen reader and SEO performance$/, (count) => `Пишите alt короче ${count} ${plural(count, 'символа', 'символов', 'символов')}. Это поможет SEO и сделает текст удобнее для чтения с экрана`],
  ],
  'images-alt-present': [
    [/^Add descriptive alt text to all images for accessibility and SEO benefits$/, 'Добавьте описательный текст alt для всех изображений. Это улучшит доступность и SEO'],
  ],
  'images-alt-quality': [
    [/^Write descriptive alt text that explains the content and context of each image$/, 'Напишите для каждого изображения текст alt, который объясняет, что на нём изображено и зачем оно здесь'],
  ],
  'images-background-seo': [
    [/^Use <img> tags with descriptive alt text for important visual content instead of CSS background-image$/, 'Для важных изображений используйте теги <img> с описательным alt вместо CSS-свойства background-image'],
  ],
  'images-broken': [
    [/^Fix or remove broken image references$/, 'Исправьте или удалите ссылки на недоступные изображения'],
    [/^Only first (\d+) images were checked$/, (count) => `Проверено только ${count} ${plural(count, 'изображение', 'изображения', 'изображений')} с начала списка`],
  ],
  'images-dimensions': [
    [/^Add explicit width and height attributes to images to prevent Cumulative Layout Shift \(CLS\)$/, 'Явно задайте атрибуты width и height у изображений, чтобы избежать сдвига макета (CLS)'],
  ],
  'images-figure-captions': [
    [/^Add figcaption elements to describe figure content for accessibility$/, 'Добавьте элементы figcaption с описаниями изображений в figure для доступности'],
  ],
  'images-filename-quality': [
    [/^Use descriptive filenames like "red-running-shoes\.jpg" instead of "IMG_001\.jpg"$/, 'Используйте описательные имена файлов, например «red-running-shoes.jpg» вместо «IMG_001.jpg»'],
  ],
  'images-inline-svg-size': [
    [/^Move large SVGs to external files for better caching and smaller HTML payload$/, 'Вынесите крупные SVG в отдельные файлы, чтобы они лучше кешировались и меньше весил HTML'],
  ],
  'images-lazy-loading': [
    [/^Set loading="lazy" on images outside the first screen so they load only when scrolled to$/, 'Укажите loading="lazy" у изображений за пределами первого экрана, чтобы они загружались при прокрутке к ним'],
  ],
  'images-modern-format': [
    [/^Convert images to WebP or AVIF format for 25-50% smaller file sizes$/, 'Преобразуйте изображения в WebP или AVIF, чтобы файлы весили на 25-50% меньше'],
    [/^Consider converting remaining legacy images to WebP or AVIF$/, 'Преобразуйте оставшиеся изображения в старых форматах в WebP или AVIF'],
  ],
  'images-oversized-delivery': [
    [/^Serve each image at most twice its displayed size, with srcset for the sizes the layout uses\.$/, 'Отдавайте изображение размером не более чем вдвое больше размера его отображения. Укажите в srcset варианты для размеров, которые использует макет.'],
  ],
  'images-picture-element': [
    [/^Every <picture> element must contain an <img> element as fallback for browsers that do not support picture$/, 'Добавьте <img> внутрь каждого <picture> для браузеров без поддержки picture'],
    [/^Add <source> elements inside <picture> to provide alternative image formats$/, 'Добавьте элементы <source> внутри <picture>, чтобы предложить альтернативные форматы изображений'],
  ],
  'images-responsive': [
    [/^Use srcset attribute or picture element to serve appropriately sized images for different screen sizes$/, 'Используйте атрибут srcset или элемент picture для загрузки изображений подходящего размера на разных экранах'],
    [/^Consider adding srcset or picture element for larger images to improve performance on various devices$/, 'Добавьте srcset или picture для крупных изображений, чтобы ускорить их загрузку на разных устройствах'],
  ],
  'images-size': [
    [/^Optimize large images using compression, resizing, or modern formats \(WebP\/AVIF\)$/, 'Оптимизируйте крупные изображения. Сожмите их, уменьшите размеры или используйте WebP/AVIF'],
    [/^File sizes are estimated based on image attributes and filenames\. Use browser DevTools for actual sizes\.$/, 'Размер файлов оценён по атрибутам изображений и именам файлов. Точный размер проверьте в инструментах разработчика браузера.'],
    [/^This is a heuristic check\. Use browser DevTools to verify actual file sizes\.$/, 'Проверка приблизительная. Точные размеры файлов проверьте в инструментах разработчика браузера.'],
  ],
  'js-ajax-crawling-scheme': [
    [/^Give each view a real URL \(the History API\) and render its content on the server or at load\.$/, 'Назначьте каждому представлению собственный URL через History API. Отрисовывайте содержимое на сервере или при загрузке страницы.'],
  ],
  'js-blocked-resources': [
    [/^Allow search engine access to JavaScript files in robots\.txt$/, 'Разрешите поисковым роботам доступ к файлам JavaScript в robots.txt'],
  ],
  'js-canonical-mismatch': [
    [/^Ensure the canonical URL is consistent in both raw HTML and after JS rendering$/, 'Убедитесь, что canonical содержит один и тот же URL в исходном HTML и после выполнения JavaScript'],
  ],
  'js-description-modified': [
    [/^Set the correct meta description in server-side HTML rather than modifying it with JavaScript$/, 'Задайте правильный description в HTML, который отдаёт сервер. Уберите его подмену через JavaScript'],
  ],
  'js-h1-modified': [
    [/^Set the correct H1 heading in server-side HTML rather than modifying it with JavaScript$/, 'Задайте правильный H1 в HTML, который отдаёт сервер. Уберите его подмену через JavaScript'],
  ],
  'js-noindex-mismatch': [
    [/^Set noindex\/nofollow directives in server-side HTML, not via client-side JavaScript$/, 'Задайте директивы noindex/nofollow в HTML, который отдаёт сервер. Уберите их подстановку через JavaScript в браузере'],
  ],
  'js-rendered-canonical': [
    [/^Ensure your JavaScript framework injects <link rel="canonical"> during rendering$/, 'Настройте фреймворк JavaScript так, чтобы он добавлял <link rel="canonical"> при отрисовке'],
  ],
  'js-rendered-content': [
    [/^Implement server-side rendering \(SSR\) or static generation to include content in raw HTML$/, 'Используйте серверную отрисовку (SSR) или статическую генерацию, чтобы содержимое было в исходном HTML'],
    [/^Consider server-side rendering for critical content to ensure indexability$/, 'Отдавайте важное содержимое с сервера, чтобы поисковики могли его проиндексировать'],
  ],
  'js-rendered-description': [
    [/^Ensure your JavaScript framework injects <meta name="description"> during rendering$/, 'Настройте фреймворк JavaScript так, чтобы он добавлял <meta name="description"> при отрисовке'],
  ],
  'js-rendered-h1': [
    [/^Ensure your JavaScript framework renders an H1 heading element$/, 'Настройте фреймворк JavaScript так, чтобы он выводил элемент H1'],
  ],
  'js-rendered-links': [
    [/^Include critical navigation and internal links in server-side HTML for reliable discovery$/, 'Включите важные элементы навигации и внутренние ссылки в HTML, который отдаёт сервер. Так поисковые роботы смогут их найти'],
  ],
  'js-rendered-title': [
    [/^Ensure your JavaScript framework injects the <title> tag during rendering$/, 'Настройте фреймворк JavaScript так, чтобы он добавлял тег <title> при отрисовке'],
  ],
  'js-ssr-check': [
    [/^Implement server-side rendering \(SSR\) or static site generation \(SSG\) to include content in initial HTML$/, 'Используйте серверную отрисовку (SSR) или статическую генерацию сайта (SSG), чтобы содержимое было в исходном HTML'],
    [/^Consider implementing SSR to ensure content is available in the initial HTML response$/, 'Настройте SSR, чтобы содержимое было доступно в первом ответе HTML'],
    [/^Implement SSR so search engines can access content without JavaScript$/, 'Настройте SSR, чтобы поисковые роботы могли читать содержимое без JavaScript'],
  ],
  'js-title-modified': [
    [/^Set the correct title in server-side HTML rather than modifying it with JavaScript$/, 'Задайте правильный title в HTML, который отдаёт сервер. Уберите его подмену через JavaScript'],
  ],
  'legal-privacy-policy': [
    [/^Add a link to your privacy policy in the footer of every page$/, 'Добавьте ссылку на политику конфиденциальности в подвал каждой страницы'],
  ],
  'legal-terms-of-service': [
    [/^Add a link to your terms of service in the footer of every page$/, 'Добавьте ссылку на условия использования в подвал каждой страницы'],
  ],
  'links-anchor-text': [
    [/^Use descriptive anchor text that tells users and search engines what the linked page is about$/, 'Пишите понятный текст ссылок, чтобы посетители и поисковые системы понимали, куда ведёт ссылка'],
  ],
  'links-broken-fragment': [
    [/^Add matching id attributes to target elements or update the fragment references$/, 'Добавьте целевым элементам соответствующие атрибуты id или обновите ссылки на фрагменты'],
  ],
  'links-chrome-inbound': [
    [/^Link to this page from body copy on a relevant page, not only from sitewide chrome\.$/, 'Добавьте ссылку на эту страницу в текст тематического материала. Одних ссылок в общих блоках сайта недостаточно.'],
  ],
  'links-dead-end-pages': [
    [/^Add navigation links, related content links, or breadcrumbs$/, 'Добавьте ссылки в меню, ссылки на похожие материалы или навигационную цепочку'],
  ],
  'links-excessive': [
    [/^Reduce the number of links to avoid diluting page authority and hurting crawl efficiency$/, 'Сократите число ссылок, чтобы сохранить вес страницы и упростить обход'],
    [/^Consider reducing links to improve page authority distribution$/, 'Сократите число ссылок, чтобы вес страницы распределялся между меньшим числом адресов'],
  ],
  'links-external-count': [
    [/^Reduce external links to essential, high-quality resources only$/, 'Оставьте только необходимые внешние ссылки на качественные ресурсы'],
  ],
  'links-external-valid': [
    [/^Update or remove links to pages that no longer exist\.$/, 'Обновите или удалите ссылки на страницы, которых больше нет.'],
  ],
  'links-inbound-all-nofollow': [
    [/^If these pages should pass ranking signal, remove nofollow from the internal links pointing here$/, 'Удалите nofollow с внутренних ссылок на эти страницы, если ссылки должны передавать сигналы ранжирования'],
  ],
  'links-inbound-anchor-text': [
    [/^Ask for descriptive anchor text on internal links pointing here - it tells search engines what this page is about$/, 'Добавьте понятный текст внутренним ссылкам на эту страницу, чтобы поисковые системы понимали её тему'],
  ],
  'links-inbound-low-quality': [
    [/^Earn followed links from indexable, self-canonical pages so this URL receives internal link equity$/, 'Добавьте ссылки без nofollow со страниц, доступных для индексации и указывающих на себя в canonical. Так этот URL получит внутренний ссылочный вес'],
  ],
  'links-inbound-mixed-follow': [
    [/^Decide whether internal links to this page should be nofollowed and apply it consistently$/, 'Решите, нужен ли nofollow для внутренних ссылок на эту страницу, и применяйте решение последовательно'],
  ],
  'links-internal-present': [
    [/^Add internal links to improve site navigation and help search engines crawl your site$/, 'Добавьте внутренние ссылки, чтобы упростить навигацию по сайту и помочь поисковым роботам обходить его'],
  ],
  'links-invalid': [
    [/^Replace javascript: links with buttons, fix malformed URLs, add proper hrefs to empty links$/, 'Замените ссылки javascript: на кнопки, исправьте неверные URL и укажите действительные href для пустых ссылок'],
  ],
  'links-local-file': [
    [/^Replace local file references with proper relative or absolute HTTP\/HTTPS URLs$/, 'Замените ссылки на локальные файлы относительными URL или абсолютными URL с HTTP/HTTPS'],
  ],
  'links-localhost': [
    [/^Replace localhost and development URLs with production URLs before deploying$/, 'Перед публикацией замените localhost и адреса среды разработки на рабочие URL'],
  ],
  'links-nofollow-appropriate': [
    [/^Review nofollow usage: use for sponsored\/UGC external links, avoid on internal navigation links$/, 'Проверьте, где используется nofollow. Применяйте его к рекламным внешним ссылкам и ссылкам из пользовательского содержимого. Уберите его из внутренней навигации'],
  ],
  'links-nofollow-internal': [
    [/^Remove nofollow from links to your own pages\. Keep it for untrusted, sponsored, or user-generated external links\.$/, 'Уберите nofollow со ссылок на свои страницы. Оставьте его на непроверенных и рекламных внешних ссылках, а также на внешних ссылках от пользователей.'],
  ],
  'links-non-http-protocol': [
    [/^Review links using non-HTTP protocols; browsers hand them to external handlers, so prefer HTTP\(S\) URLs unless the protocol is intentional$/, 'Проверьте ссылки с протоколами, отличными от HTTP. Браузеры передают их внешним обработчикам. Используйте HTTP(S), если другой протокол не нужен'],
  ],
  'links-onclick': [
    [/^Use proper <a href="\.\.\."> links for navigation so search engines can discover and index linked pages$/, 'Используйте для навигации обычные ссылки <a href="...">, чтобы поисковые роботы могли находить и индексировать целевые страницы'],
  ],
  'links-redirect-chains': [
    [/^Update links to point directly to final destination URLs$/, 'Обновите ссылки, чтобы они вели прямо на конечные URL'],
  ],
  'links-tel-mailto': [
    [/^Use E\.164 format for phone numbers \(\+1234567890\), use valid email format for mailto$/, 'Указывайте телефоны в формате E.164 (+1234567890), а в mailto используйте действительные адреса электронной почты'],
  ],
  'links-weak-inbound': [
    [/^Add another followed internal link from a relevant page\.$/, 'Добавьте ещё одну внутреннюю ссылку без nofollow с тематической страницы.'],
  ],
  'links-whitespace-href': [
    [/^Trim whitespace from href attributes and replace whitespace-only hrefs with valid URLs$/, 'Удалите пробельные символы в начале и конце href. Если значение состоит только из пробелов, укажите действительный URL'],
  ],
  'mobile-font-size': [
    [/^Static analysis - verify on actual mobile device$/, 'Выполнена статическая проверка. Проверьте результат на мобильном устройстве'],
    [/^Use minimum 16px for body text, 12px absolute minimum$/, 'Задайте основному тексту размер не менее 16px. Абсолютный минимум — 12px'],
    [/^Use 16px or larger for body text; prefer relative units \(rem, em\)$/, 'Задайте основному тексту размер от 16px. По возможности используйте относительные единицы (rem, em)'],
  ],
  'mobile-horizontal-scroll': [
    [/^Static analysis - test on actual mobile devices$/, 'Выполнена статическая проверка. Проверьте результат на мобильных устройствах'],
    [/^Use max-width: 100% on images, overflow-x: auto on tables, responsive iframes$/, 'Задайте изображениям max-width: 100%, таблицам — overflow-x: auto. Используйте адаптивные iframe'],
    [/^Add max-width: 100% to images, wrap tables in overflow containers$/, 'Задайте изображениям max-width: 100%. Оберните таблицы в контейнеры с прокруткой'],
  ],
  'mobile-image-maps': [
    [/^Replace image maps with SVG links or positioned anchors over a fluid image$/, 'Замените карты изображений ссылками в SVG или позиционированными ссылками поверх адаптивного изображения'],
  ],
  'mobile-interstitials': [
    [/^Static analysis - JavaScript-triggered popups may not be detected$/, 'Статическая проверка может пропустить всплывающие окна, которые открывает JavaScript'],
    [/^Remove popups that cover main content on mobile\. Use compact banners instead\.$/, 'Уберите всплывающие окна, которые закрывают основное содержимое на мобильных устройствах. Используйте компактные баннеры.'],
    [/^Review detected popups to ensure they don't cover main content on mobile$/, 'Проверьте, что найденные всплывающие окна не перекрывают основное содержимое на мобильных устройствах'],
  ],
  'mobile-multiple-viewports': [
    [/^Remove duplicate viewport meta tags; keep only one with content="width=device-width, initial-scale=1"$/, 'Удалите дублирующиеся метатеги viewport. Оставьте один с content="width=device-width, initial-scale=1"'],
  ],
  'mobile-parity-links': [
    [/^Ensure navigation and in-content links render on mobile - hiding them behind a collapsed menu is fine, but they must be in the DOM\.$/, 'Убедитесь, что ссылки навигации и ссылки в тексте присутствуют в DOM на мобильных устройствах. Их можно скрыть в свёрнутом меню.'],
  ],
  'mobile-separate-urls': [
    [/^Add <link rel="canonical" href="([^"]+)"> to the mobile page\.$/, 'Добавьте <link rel="canonical" href="$1"> на мобильную страницу.'],
  ],
  'mobile-viewport-content': [
    [/^Use <meta name="viewport" content="width=device-width, initial-scale=1">$/, 'Используйте <meta name="viewport" content="width=device-width, initial-scale=1">'],
  ],
  'mobile-viewport-width': [
    [/^Change width to device-width: <meta name="viewport" content="width=device-width, initial-scale=1">$/, 'Замените width на device-width. Используйте <meta name="viewport" content="width=device-width, initial-scale=1">'],
  ],
  'perf-brotli': [
    [/^br$/, 'Настройте сжатие Brotli с Content-Encoding: br'],
  ],
  'perf-duplicate-js': [
    [/^Keep one script URL per library, and one version of it\.$/, 'Оставьте один URL скрипта и одну версию для каждой библиотеки.'],
  ],
  'perf-source-maps': [
    [/^Stop publishing sourceMappingURL and the SourceMap header on production responses, or restrict the map files\.$/, 'Уберите sourceMappingURL и заголовок SourceMap из ответов рабочего сайта или ограничьте доступ к файлам карт исходного кода.'],
  ],
  'perf-unused-js': [
    [/^Split bundles by route and load code when it is needed; drop libraries the page does not use\.$/, 'Разделите сборки по маршрутам и загружайте код по мере необходимости. Уберите библиотеки, которые страница не использует.'],
  ],
  'perf-unused-css': [
    [/^Remove unused selectors, split CSS by page, and inline only what the first screen needs\.$/, 'Удалите неиспользуемые селекторы, разделите CSS по страницам и встраивайте в HTML только стили для первого экрана.'],
  ],
  'redirect-case-normalization': [
    [/^Configure the server to redirect non-canonical URL casings to the canonical form$/, 'Настройте сервер так, чтобы URL с другим регистром перенаправлялись на выбранный вариант'],
  ],
  'redirect-resource-broken': [
    [/^Update the resource URLs to point directly at a working destination$/, 'Укажите для ресурсов URL, которые ведут прямо на доступные файлы'],
  ],
  'redirect-resource-chain': [
    [/^Update the resource URLs to point directly at the final destination$/, 'Укажите для ресурсов конечные URL напрямую'],
  ],
  'redirect-resource-loop': [
    [/^Fix the redirect target so the chain resolves to a final resource instead of looping$/, 'Исправьте адрес перенаправления, чтобы цепочка завершалась загрузкой ресурса и не зацикливалась'],
  ],
  'redirect-resource': [
    [/^Update resource URLs to use HTTPS to avoid unnecessary redirects$/, 'Укажите HTTPS в URL ресурсов, чтобы убрать лишние редиректы'],
  ],
  'redirect-type': [
    [/^Change to 301 \(Moved Permanently\) or 308 \(Permanent Redirect\) if the move is permanent$/, 'Замените код на 301 (Moved Permanently) или 308 (Permanent Redirect), если перенос постоянный'],
  ],
  'schema-entity-conflict': [
    [/^Use one logo and one telephone for each @id\. Pages that describe the same entity should repeat the same values\.$/, 'Используйте один logo и один telephone для каждого @id. Повторяйте те же значения на всех страницах, которые описывают эту сущность.'],
  ],
  'schema-entity-dangling': [
    [/^Declare the referenced entity on at least one crawled page, or point the reference at an @id that page already publishes\.$/, 'Объявите сущность, на которую ведёт ссылка, хотя бы на одной просканированной странице или укажите уже объявленный на ней @id.'],
  ],
  'schema-entity-id': [
    [/^Give each Organization, WebSite, and Person one absolute @id, such as https:\/\/example\.com\/#organization, and reuse that URL on every page\.$/, 'Задайте каждой сущности Organization, WebSite и Person один абсолютный @id, например https://example.com/#organization. Используйте этот URL на всех страницах.'],
  ],
  'schema-entity-split': [
    [/^Pick one absolute @id for that name and reuse it everywhere\.$/, 'Выберите один абсолютный @id для этого имени и используйте его везде.'],
  ],
  'schema-entity-type-drift': [
    [/^Give each @id one @type on every page that declares it\.$/, 'Задавайте каждому @id один @type на всех страницах, где он объявлен.'],
  ],
  'schema-present': [
    [/^JSON-LD is recommended over microdata and RDFa$/, 'Используйте JSON-LD вместо микроданных и RDFa'],
  ],
  'schema-rating-scope': [
    [/^Put AggregateRating only on the page the rating is about, and show the same ratingValue in the visible text\.$/, 'Разместите AggregateRating только на странице, к которой относится оценка. Покажите то же значение ratingValue в видимом тексте.'],
  ],
  'schema-required-fields': [
    [/^([A-Za-z]+): consider adding ([A-Za-z]+(?:, [A-Za-z]+)*)$/, (type, fields) =>
      `Добавьте в разметку ${type} ${fields.includes(', ') ? 'свойства' : 'свойство'} ${fields}`],
  ],
  'schema-website-search': [
    [/^Add WebSite schema to enable sitelinks searchbox$/, 'Добавьте разметку WebSite, чтобы включить поле поиска по сайту в результатах поиска'],
    [/^Add potentialAction with SearchAction for sitelinks searchbox eligibility$/, 'Добавьте potentialAction с SearchAction, чтобы поле поиска по сайту могло появляться в результатах'],
  ],
  'security-brand-impersonation': [
    [/^Point "Sign in with …" controls at the brand host, or at a URL on your own host that starts the real flow\.$/, 'Направьте элементы «Войти через …» на домен указанного сервиса или на URL своего сайта, с которого начинается настоящий вход через этот сервис.'],
  ],
  'security-cookie-flags': [
    [/^Browsers default these to Lax, but setting it explicitly documents the intent and avoids relying on a default that has changed before\.$/, 'Обычно браузеры подставляют Lax. Задайте его явно, чтобы закрепить нужное поведение. Значение по умолчанию уже менялось.'],
  ],
  'security-cookie-lifetime': [
    [/^Chrome trims stored lifetimes to 400 days, so the excess has no effect while still signalling long-term tracking intent to auditors\.$/, 'Chrome ограничивает срок хранения cookie 400 днями. Превышение этого срока не продлевает хранение, хотя при аудите видно намерение отслеживать посетителей дольше.'],
  ],
  'security-obfuscated-script': [
    [/^Remove the inline script if it is not yours\. A legitimate decoder should live in a reviewed file, not an opaque block in the page\.$/, 'Удалите встроенный скрипт, если он добавлен посторонними. Если декодирование требуется, вынесите проверенный код в отдельный файл.'],
  ],
  'security-password-http': [
    [/^Migrate the page to HTTPS to protect user credentials from interception$/, 'Переведите страницу на HTTPS, чтобы защитить данные входа от перехвата'],
  ],
  'security-protocol-relative': [
    [/^Replace protocol-relative URLs \(\/\/example\.com\) with explicit https:\/\/ URLs to prevent potential HTTP downgrades$/, 'Замените URL без явного протокола (//example.com) на URL с https://, чтобы избежать перехода к HTTP'],
  ],
  'security-referrer-policy': [
    [/^strict-origin-when-cross-origin$/, 'Задайте политику strict-origin-when-cross-origin'],
  ],
  'security-sri': [
    [/^Add an integrity attribute with a sha384 or sha256 hash, and crossorigin="anonymous", to cross-origin scripts and stylesheets\.$/, 'Добавьте к скриптам и таблицам стилей с других источников атрибут integrity с хешем sha384 или sha256 и атрибут crossorigin="anonymous".'],
  ],
  'security-ssl-expiry': [
    [/^Install an SSL certificate and serve the site over HTTPS$/, 'Установите SSL-сертификат и отдавайте сайт по HTTPS'],
    [/^Add Strict-Transport-Security header with max-age of at least 1 year \(31536000 seconds\)$/, 'Добавьте заголовок Strict-Transport-Security. Укажите в max-age не менее 1 года (31536000 секунд)'],
    [/^Set a valid max-age directive in the Strict-Transport-Security header$/, 'Укажите действительное значение max-age в заголовке Strict-Transport-Security'],
    [/^Increase HSTS max-age to at least 1 year \(31536000 seconds\) for proper browser enforcement$/, 'Увеличьте max-age в HSTS до 1 года (31536000 секунд) или дольше, чтобы браузеры применяли защиту'],
    [/^Increase HSTS max-age to at least 31536000 seconds \(1 year\)$/, 'Увеличьте max-age в HSTS хотя бы до 31536000 секунд (1 год)'],
  ],
  'security-ssl-protocol': [
    [/^Migrate to HTTPS to enable TLS protection$/, 'Перейдите на HTTPS, чтобы включить защиту TLS'],
    [/^Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload$/, 'Добавьте заголовок Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'],
    [/^Add (\w+(?: and \w+)*) to the Strict-Transport-Security header for complete TLS enforcement$/, (directives) => `Добавьте ${directives.replaceAll(' and ', ' и ')} в заголовок Strict-Transport-Security, чтобы браузеры всегда использовали TLS`],
  ],
  'social-duplicate-og': [
    [/^Write a share title and description for each page\.$/, 'Напишите отдельные title и description для публикации каждой страницы в соцсетях.'],
  ],
  'social-meta-multiple': [
    [/^Keep one tag per property; platforms pick differently when there are several\.$/, 'Оставьте один тег для каждого свойства. Если их несколько, разные платформы могут выбрать разные значения.'],
  ],
  'social-og-image-reachable': [
    [/^Serve a JPEG or PNG of at least 1200×630 and under 5 MB at the og:image URL\.$/, 'Отдавайте по URL из og:image файл JPEG или PNG размером не менее 1200×630 и весом меньше 5 MB.'],
  ],
  'social-og-image-size': [
    [/^Set og:image:width to (\d+) and og:image:height to (\d+)\.$/, 'Укажите $1 в og:image:width и $2 в og:image:height.'],
  ],
  'social-share-buttons': [
    [/^Add share buttons for Facebook, Twitter\/X, and LinkedIn$/, 'Добавьте кнопки «Поделиться» для Facebook, Twitter/X и LinkedIn'],
  ],
  'social-profiles': [
    [/^Add links to major platforms like Facebook, Twitter\/X, Instagram, or LinkedIn$/, 'Добавьте ссылки на крупные платформы, например Facebook, Twitter/X, Instagram или LinkedIn'],
    [/^Add social profile links in header\/footer and include sameAs in Organization schema$/, 'Добавьте ссылки на профили в соцсетях в шапку или подвал сайта и укажите sameAs в разметке Organization'],
  ],
  'social-twitter-attribute': [
    [/^Write Twitter card tags as <meta name="twitter:\.\.\." content="\.\.\.">\.$/, 'Используйте для карточек Twitter теги вида <meta name="twitter:..." content="...">.'],
  ],
  'technical-amp-pairing': [
    [/^Set the AMP page's canonical to (\S+)\.$/, 'Укажите $1 в canonical AMP-страницы.'],
    [/^Add <link rel="canonical" href="([^"]+)"> to the AMP page\.$/, 'Добавьте <link rel="canonical" href="$1"> на AMP-страницу.'],
  ],
  'technical-consent-mode': [
    [/^Call gtag\('consent', 'default', \.\.\.\) with ad_storage, ad_user_data, and ad_personalization before the tag loads\.$/, 'Вызовите gtag(\'consent\', \'default\', ...) с параметрами ad_storage, ad_user_data и ad_personalization до загрузки тега.'],
  ],
  'technical-trailing-slash': [
    [/^Link each page in the form the server serves, and redirect the other form to it$/, 'Используйте в ссылках тот вариант URL, по которому сервер отдаёт страницу. Настройте редирект с другого варианта'],
  ],
};
