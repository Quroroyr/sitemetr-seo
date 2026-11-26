/** Советы по исправлению нарушений по id правила. */
export const FIXES_RU: Readonly<Record<string, string>> = {
  // Основные проверки SEO
  'core-title-present':
    'Добавьте тег <title> в раздел <head>',
  'core-title-length':
    'Уложите title в 30-60 символов для корректного отображения в поиске',
  'core-description-present':
    'Добавьте <meta name="description" content="..."> длиной 120-160 символов',
  'core-description-length':
    'Уложите description в 120-160 символов',
  'core-canonical-present':
    'Добавьте <link rel="canonical" href="...">, чтобы указать предпочтительный URL',
  'core-canonical-valid':
    'Укажите в canonical доступный абсолютный URL, который возвращает статус 200',
  'core-viewport-present':
    'Добавьте <meta name="viewport" content="width=device-width, initial-scale=1">',
  'core-favicon-present':
    'Добавьте <link rel="icon" href="/favicon.ico"> или значок в формате PNG/SVG',
  'core-h1-present':
    'Добавьте один заголовок H1, который описывает основную тему страницы',
  'core-h1-single':
    'Оставьте на странице один H1; для подразделов используйте H2-H6',
  'core-canonical-header':
    'Указывайте canonical в HTML; используйте заголовок Link для PDF и других ресурсов, отличных от HTML',
  'core-nosnippet':
    'Удалите директиву nosnippet, если страница должна показываться в поиске со сниппетом',
  'core-robots-meta':
    'Удалите noindex/nofollow, если блокировать поисковые системы не требуется',
  'core-title-unique':
    'Задайте каждой странице уникальный title: "Page Topic | Brand Name"',
  'core-canonical-conflicting':
    'Устраните конфликт canonical; укажите один и тот же предпочтительный URL в canonical в HTML, в заголовке Link и в sitemap',
  'core-canonical-to-homepage':
    'Укажите в canonical URL самой страницы; для каждой страницы используйте её собственный URL',
  'core-canonical-http-mismatch':
    'Укажите в canonical тот же протокол (HTTP/HTTPS), что и у страницы; по возможности используйте HTTPS',
  'core-canonical-loop':
    'Разорвите цикл canonical, указав один конечный URL, который ссылается сам на себя',
  'core-canonical-to-noindex':
    'Удалите noindex с целевой страницы canonical или укажите в canonical страницу, открытую для индексации',
  'core-canonical-outside-head':
    'Перенесите элемент <link rel="canonical"> в <head>; поисковые системы игнорируют canonical вне <head>',
  'core-canonical-attributes':
    'Удалите недопустимые и лишние атрибуты у элементов canonical; оставьте только rel и href',
  'core-canonical-multiple':
    'Оставьте один элемент <link rel="canonical"> с нужным URL',
  'core-canonical-external':
    'Убедитесь, что canonical на другом домене выбран намеренно; сигналы ранжирования страницы переходят к другому хосту',
  'core-robots-directive-mismatch':
    'Согласуйте директивы в метатегах и заголовке X-Robots-Tag; задавайте noindex/nofollow только в одном месте',
  'core-unavailable-after':
    'Удалите директиву unavailable_after или измените её дату, если страница должна остаться в поиске',
  'core-obsolete-robots-directives':
    'Удалите noodp и noydir из директив robots; поисковые системы их больше не читают',
  'core-canonical-fragment':
    'Укажите в canonical URL без #; выделите отдельный путь для каждого материала',

  // Технические проверки
  'technical-robots-txt-exists':
    'Создайте robots.txt в корне сайта с директивами User-agent и sitemap',
  'technical-robots-txt-valid':
    'Исправьте ошибки синтаксиса в robots.txt; используйте только стандартные директивы',
  'technical-sitemap-exists':
    'Создайте XML sitemap по пути /sitemap.xml и укажите его в robots.txt',
  'technical-sitemap-valid':
    'Исправьте ошибки в XML sitemap; убедитесь, что все URL доступны',
  'technical-url-structure':
    'Используйте короткие понятные имена страниц в URL, пишите их строчными буквами и разделяйте слова дефисами',
  'technical-trailing-slash':
    'Используйте один вариант URL с завершающим слешем или без него; настройте перенаправление с дублей',
  'technical-www-redirect':
    'Выберите версию с www или без www и настройте перенаправление с другой версии',
  'technical-404-page':
    'Создайте собственную страницу 404 со ссылками для навигации и поиском',
  'technical-soft-404':
    'Возвращайте код 404 для отсутствующих страниц вместо 200; ложные 404 расходуют лимит сканирования',
  'technical-server-error':
    'Устраните ошибки сервера 5xx; проверьте журналы сервера, увеличьте доступные ресурсы или исправьте ошибки приложения',
  'technical-4xx-non-404':
    'Устраните ошибки 4xx (403 Forbidden, 410 Gone и другие); проверьте права доступа, аутентификацию и удалённые материалы',
  'technical-timeout':
    'Сократите время ответа страницы; оптимизируйте сервер, включите кеширование или увеличьте предельное время ожидания',
  'technical-bad-content-type':
    'Укажите в Content-Type фактический тип содержимого (text/html для страниц, application/json для API)',
  'technical-empty-html':
    'Выясните, почему сервер возвращает пустой HTML; восстановите содержимое или верните 404/410, если страницы больше нет',
  'technical-form-get-method':
    'Переведите формы на method="post" или закройте URL отправки GET-форм в robots.txt, если метод выбран намеренно',
  'technical-duplicate-gtm':
    'Проверьте, нужен ли каждый контейнер GTM; по возможности объедините их в один',
  'technical-duplicate-ga':
    'Проверьте, нужен ли каждый ресурс Google Analytics; удалите дубли и старые коды отслеживания',
  'technical-consent-mode':
    'Вызовите gtag consent default с ad_storage, ad_user_data и ad_personalization до загрузки тега Google',
  'technical-amp-pairing':
    'Восстановите доступ к версии AMP и укажите в её canonical текущую страницу',

  // Производительность
  'cwv-lcp':
    'Улучшите LCP: предзагрузите главные изображения, используйте CDN и сократите время ответа сервера',
  'cwv-cls':
    'Уменьшите CLS: задайте width/height для изображений и встроенных элементов, избегайте динамической вставки содержимого',
  'cwv-inp':
    'Сократите INP: оптимизируйте JavaScript, разбейте длительные задачи, используйте Web Workers',
  'cwv-ttfb':
    'Сократите TTFB: используйте CDN, включите кеширование и оптимизируйте запросы к базе данных',
  'cwv-fcp':
    'Улучшите FCP: встройте критический CSS, отложите некритические скрипты и предзагрузите шрифты',
  'perf-dom-size':
    'Уменьшите размер DOM: удалите неиспользуемые элементы и используйте виртуализацию для длинных списков',
  'perf-css-file-size':
    'Объедините и минифицируйте CSS; встройте критические стили, а остальные загружайте позже',
  'perf-font-loading':
    'Настройте загрузку шрифтов: добавьте font-display: swap в @font-face; предзагрузите критически важные шрифты',
  'perf-preconnect':
    'Добавьте <link rel="preconnect" href="..."> для сторонних источников',
  'perf-render-blocking':
    'Добавьте к скриптам async/defer; для некритического CSS используйте медиазапросы',
  'perf-lazy-above-fold':
    'Уберите loading="lazy" с изображений на первом экране; добавьте fetchpriority="high"',
  'perf-lcp-hints':
    'Добавьте изображению LCP атрибут fetchpriority="high" и укажите <link rel="preload" as="image"> в <head>',
  'perf-text-compression':
    'Включите на сервере сжатие gzip или Brotli для текстовых ответов (HTML, CSS, JS)',
  'perf-brotli':
    'Включите Brotli для сжатия на 15-25% эффективнее gzip; настройте его на сервере или в CDN',
  'perf-asset-compression':
    'Передавайте текстовые ресурсы свыше 2KB (CSS, JS, JSON, SVG) со сжатием gzip или Brotli',
  'perf-cache-policy':
    'Задайте в Cache-Control подходящее значение max-age; для ресурсов с версией в URL используйте immutable',
  'perf-asset-cache-policy':
    'Установите Cache-Control max-age не менее 1 часа для статических ресурсов (CSS, JS, изображений и шрифтов)',
  'perf-minify-css':
    'Минифицируйте файлы CSS, чтобы удалить пробелы и комментарии; используйте cssnano или lightningcss',
  'perf-minify-js':
    'Минифицируйте файлы JavaScript, чтобы уменьшить объём загрузки; используйте terser или esbuild',
  'perf-response-time':
    'Сократите время ответа сервера до значения ниже 200ms; используйте CDN, оптимизируйте серверную часть и включите кеширование',
  'perf-http2':
    'Включите HTTP/2 на сервере или в CDN, чтобы отправлять запросы параллельно и сжимать заголовки',
  'perf-page-weight':
    'Сократите общий объём страницы до значения ниже 3MB; сжимайте изображения, минифицируйте код и откладывайте загрузку ресурсов',
  'perf-js-file-size':
    'Разбейте крупные сборки JavaScript; разделите код на части и исключите неиспользуемый код, чтобы уменьшить размер файлов',
  'perf-video-for-animations':
    'Замените крупные анимированные GIF на видео MP4/WebM, чтобы уменьшить размер файлов на 80-90%',
  'perf-legacy-javascript':
    'Удалите устаревшие полифилы и вспомогательный код транспиляторов ES5, которые не нужны современным браузерам; используйте современный синтаксис',
  'perf-image-encoding':
    'Замените изображения BMP/TIFF на WebP или AVIF; сожмите изображения, объём передачи которых превышает 100KB',
  'perf-duplicate-js':
    'Загружайте каждую библиотеку по одному URL и в одной версии',
  'perf-source-maps':
    'Удалите комментарии sourceMappingURL и заголовок SourceMap из ответов рабочего сайта',
  'perf-unused-js':
    'Разделите сборки по маршрутам и загружайте код по мере необходимости; удалите библиотеки, которые страница не использует',
  'perf-unused-css':
    'Удалите неиспользуемые селекторы, разделите CSS по страницам и встройте только стили для первого экрана',

  // Ссылки
  'links-broken-internal':
    'Исправьте или удалите битые внутренние ссылки (ошибки 404)',
  'links-external-valid':
    'Удалите или обновите битые внешние ссылки',
  'links-internal-present':
    'Добавьте внутренние ссылки на страницы по теме, чтобы упростить навигацию',
  'links-nofollow-appropriate':
    'Используйте nofollow только для ненадёжных, рекламных или добавленных пользователями ссылок',
  'links-anchor-text':
    'Замените "click here", "read more" и подобные фразы текстом, который описывает, куда ведёт ссылка',
  'links-depth':
    'Сделайте важные страницы доступными не более чем за 3 перехода с главной',
  'links-dead-end-pages':
    'Добавьте ссылки для навигации, ссылки на материалы по теме или хлебные крошки, чтобы со страницы можно было перейти дальше',
  'links-https-downgrade':
    'Обновите ссылки с HTTP до HTTPS или удалите небезопасные внешние ссылки',
  'links-external-count':
    'Оставьте внешние ссылки только на необходимые ресурсы с качественными материалами',
  'links-invalid':
    'Исправьте некорректные ссылки: замените ссылки с протоколом javascript: кнопками и поправьте некорректные URL',
  'links-tel-mailto':
    'Укажите номер телефона в формате E.164 (+1234567890), а для mailto используйте корректный адрес электронной почты',
  'links-redirect-chains':
    'Обновите ссылки, чтобы они вели сразу на конечные URL',
  'links-orphan-pages':
    'Добавьте ссылки с других страниц сайта, чтобы эту страницу было легче найти',
  'links-localhost':
    'Удалите ссылки на localhost и 127.0.0.1 перед публикацией сайта',
  'links-local-file':
    'Удалите ссылки с протоколом file://; используйте относительные или абсолютные URL с HTTP',
  'links-broken-fragment':
    'Исправьте или удалите ссылки на фрагменты (#anchor), у которых нет соответствующего ID на странице',
  'links-excessive':
    'Сократите общее число ссылок на странице; избыток ссылок распределяет PageRank между большим числом страниц и затрудняет обход',
  'links-onclick':
    'Замените переходы через onclick ссылками <a href="...">, чтобы ими могли пользоваться посетители и поисковые роботы',
  'links-whitespace-href':
    'Уберите лишние пробелы из атрибутов href; убедитесь, что URL записаны корректно',
  'links-non-http-protocol':
    'Замените ссылки с нестандартными протоколами (ftp:, file:, intent:) на URL с HTTP(S), если протокол не выбран намеренно',
  'links-inbound-all-nofollow':
    'Удалите nofollow с внутренних ссылок на эту страницу, если они должны передавать сигналы ранжирования',
  'links-inbound-mixed-follow':
    'Решите, нужен ли nofollow во внутренних ссылках на эту страницу, и применяйте выбранный вариант последовательно',
  'links-inbound-low-quality':
    'Добавьте ссылки без nofollow со страниц, которые доступны для индексации и указывают в canonical собственный URL, чтобы передать вес этой странице',
  'links-inbound-anchor-text':
    'Замените текст "click here" во внутренних ссылках на эту страницу фразой, которая описывает её содержимое',
  'links-nofollow-internal':
    'Удалите rel=nofollow из ссылок на собственные страницы, чтобы роботы могли по ним переходить',
  'links-weak-inbound':
    'Добавьте вторую внутреннюю ссылку без nofollow со страницы по теме',
  'links-chrome-inbound':
    'Добавьте ссылку на эту страницу из основного текста, чтобы она была доступна и за пределами nav, header или footer',

  // Изображения
  'images-alt-present':
    'Добавьте ко всем изображениям содержательные описания в alt для доступности и SEO',
  'images-alt-quality':
    'Опишите содержимое изображения в alt и избегайте простого перечисления ключевых слов',
  'images-dimensions':
    'Добавьте атрибуты width и height, чтобы избежать сдвигов макета',
  'images-lazy-loading':
    'Добавьте loading="lazy" изображениям за пределами первого экрана',
  'images-modern-format':
    'Преобразуйте изображения в WebP или AVIF для более эффективного сжатия',
  'images-size':
    'Сожмите изображения, чтобы уменьшить размер файлов и сохранить качество',
  'images-responsive':
    'Используйте srcset и sizes, чтобы загружать изображения подходящего размера для разных устройств',
  'images-broken':
    'Исправьте или удалите ссылки на недоступные изображения (ошибки 404)',
  'images-figure-captions':
    'Добавьте элементы figcaption с описанием содержимого figure, чтобы сделать его доступнее',
  'images-filename-quality':
    'Используйте описательные имена файлов, например "red-running-shoes.jpg" вместо "IMG_001.jpg"',
  'images-inline-svg-size':
    'Вынесите крупные SVG (>5KB) во внешние файлы, чтобы улучшить кеширование',
  'images-picture-element':
    'Убедитесь, что в каждом элементе <picture> есть запасной элемент <img>',
  'images-alt-length':
    'Уложите текст alt в 5-125 символов; опишите изображение кратко и по существу',
  'images-background-seo':
    'Добавляйте значимые для содержимого изображения тегами <img> вместо CSS background-image, чтобы поисковые системы могли их индексировать',
  'images-oversized-delivery':
    'Отдавайте изображения размером не более чем вдвое больше размера при показе и используйте srcset для размеров, которые нужны макету',

  // Безопасность
  'security-https':
    'Установите SSL-сертификат и перенаправьте весь трафик с HTTP на HTTPS',
  'security-https-redirect':
    'Настройте перенаправление с HTTP на HTTPS',
  'security-hsts':
    'Добавьте заголовок Strict-Transport-Security с max-age не менее 1 года',
  'security-csp':
    'Настройте заголовок Content-Security-Policy для защиты от XSS',
  'security-x-frame-options':
    'Настройте защиту от кликджекинга: добавьте заголовок X-Frame-Options: DENY или SAMEORIGIN',
  'security-x-content-type-options':
    'Отключите автоматическое определение типа MIME: добавьте заголовок X-Content-Type-Options: nosniff',
  'security-external-links':
    'Добавьте rel="noopener noreferrer" к внешним ссылкам с target="_blank"',
  'security-form-https':
    'Укажите URL с HTTPS в атрибутах action у форм',
  'security-mixed-content':
    'Замените URL ресурсов с HTTP на HTTPS или используйте URL без указания протокола',
  'security-permissions-policy':
    'Добавьте заголовок Permissions-Policy, чтобы управлять доступом к возможностям браузера',
  'security-referrer-policy':
    'Добавьте заголовок Referrer-Policy: рекомендуемое значение strict-origin-when-cross-origin',
  'security-leaked-secrets':
    'Немедленно удалите открытые секреты и замените скомпрометированные данные доступа',
  'security-password-http':
    'Исключите отправку паролей по HTTP; укажите URL с HTTPS в action всех форм входа',
  'security-protocol-relative':
    'Замените URL без указания протокола (//example.com) на явные адреса с https://',
  'security-ssl-expiry':
    'Обновите SSL-сертификат до истечения срока; настройте автоматическое обновление через Let\'s Encrypt или свой центр сертификации',
  'security-ssl-protocol':
    'Отключите TLS 1.0/1.1; требуйте TLS 1.2+ для защищённых подключений',
  'security-cookie-flags':
    'Установите Secure и SameSite для всех файлов cookie, а HttpOnly — для файлов cookie сеанса',
  'security-cookie-lifetime':
    'Сократите срок хранения файлов cookie до значения меньше браузерного лимита в 400 дней; долгоживущие идентификаторы увеличивают требования к защите персональных данных',
  'security-coop':
    'Настройте изоляцию окна: добавьте заголовок Cross-Origin-Opener-Policy: same-origin (или same-origin-allow-popups)',
  'security-csp-xss':
    'Уберите из CSP unsafe-inline и источники скриптов с подстановочными знаками или добавьте одноразовые значения либо хеши; задайте object-src и base-uri',
  'security-info-disclosure':
    'Скройте заголовки, раскрывающие версии ПО (Server, X-Powered-By, X-Generator), или задайте в них общие значения',
  'security-paste-blocking':
    'Удалите обработчики onpaste, которые отменяют вставку; запрет вставки мешает работе менеджеров паролей',
  'security-trusted-types':
    'Добавьте require-trusted-types-for \'script\' в Content-Security-Policy, чтобы защитить уязвимые для XSS операции DOM',
  'security-sri':
    'Добавьте хеш integrity и crossorigin="anonymous" к скриптам и таблицам стилей с других источников',
  'security-obfuscated-script':
    'Удалите неизвестные длинные встроенные скрипты, которые вызывают eval, Function или atob',
  'security-brand-impersonation':
    'Направьте ссылки входа через Google, Microsoft или Apple на сайты этих сервисов или на URL своего хоста',

  // Структурированные данные
  'schema-present':
    'Добавьте структурированные данные JSON-LD для расширенных результатов поиска',
  'schema-valid':
    'Исправьте синтаксис JSON-LD с помощью Google Rich Results Test',
  'schema-type':
    'Выберите подходящий тип разметки (Article, Product, LocalBusiness и другие)',
  'schema-required-fields':
    'Добавьте обязательные поля для выбранного типа разметки',
  'schema-article':
    'Добавьте разметку Article с полями headline, author (Person/Organization), datePublished и image',
  'schema-breadcrumb':
    'Добавьте разметку BreadcrumbList с массивом itemListElement, отражающим иерархию навигации',
  'schema-faq':
    'Добавьте разметку FAQPage с массивом mainEntity из элементов Question с полем acceptedAnswer',
  'schema-local-business':
    'Добавьте разметку LocalBusiness с полями name, address (PostalAddress), telephone и координатами geo',
  'schema-organization':
    'Добавьте разметку Organization с полями name, logo, url и sameAs для профилей в соцсетях',
  'schema-product':
    'Добавьте разметку Product с полями name, image и offers (price, priceCurrency, availability)',
  'schema-review':
    'Добавьте разметку Review с полями itemReviewed, author и reviewRating; либо используйте AggregateRating с полями ratingValue и reviewCount',
  'schema-video':
    'Добавьте разметку VideoObject с полями name, thumbnailUrl, uploadDate и description',
  'schema-website-search':
    'Добавьте разметку WebSite с действием SearchAction в potentialAction для показа поля поиска по сайту рядом с быстрыми ссылками',
  'schema-entity-id':
    'Задайте для каждой сущности Organization, WebSite и Person один абсолютный @id и используйте тот же URL на всех страницах',
  'schema-rating-scope':
    'Оставьте AggregateRating на странице, которую он описывает, и покажите то же значение ratingValue в видимом тексте',
  'schema-entity-conflict':
    'Укажите для каждого абсолютного @id один logo и один telephone и повторяйте эти значения на всех страницах',
  'schema-entity-dangling':
    'Объявите каждый @id из полей publisher, author и isPartOf хотя бы на одной из просканированных страниц',
  'schema-entity-type-drift':
    'Указывайте одинаковый @type для @id на всех страницах, где объявлен этот идентификатор',
  'schema-entity-split':
    'Используйте один абсолютный @id для имени организации или человека',

  // Социальные сети
  'social-og-title':
    'Добавьте <meta property="og:title" content="..."> для публикаций в соцсетях',
  'social-og-description':
    'Добавьте <meta property="og:description" content="..."> для публикаций в соцсетях',
  'social-og-image':
    'Добавьте <meta property="og:image" content="..."> с изображением размером 1200x630px',
  'social-og-image-size':
    'Укажите в og:image:width и og:image:height фактические размеры og:image в пикселях',
  'social-twitter-card':
    'Добавьте <meta name="twitter:card" content="summary_large_image">',
  'social-og-url':
    'Добавьте <meta property="og:url" content="..."> с тем же URL, что и в canonical',
  'social-og-url-canonical':
    'Укажите в og:url точно такой же URL, как в canonical, чтобы согласовать сигналы для поисковых систем',
  'social-share-buttons':
    'Добавьте кнопки, чтобы посетители могли делиться страницей в Facebook, Twitter/X и LinkedIn',
  'social-profiles':
    'Добавьте ссылки на профили в соцсетях в шапку или подвал; укажите sameAs в разметке Organization',
  'social-og-image-reachable':
    'Отдавайте по URL из og:image изображение JPEG или PNG размером не менее 1200x630 и объёмом менее 5 MB',
  'social-meta-multiple':
    'Оставьте один тег на каждое свойство og:* и twitter:*; если тегов несколько, платформы могут выбрать разные значения',
  'social-twitter-attribute':
    'Объявляйте теги twitter:* через name= вместо property=',
  'social-duplicate-og':
    'Задайте каждой странице уникальные og:title и og:description',

  // Содержимое страницы
  'content-word-count':
    'Дополните информационные страницы с коротким текстом до 300 слов или больше',
  'content-reading-level':
    'Упростите текст для более широкой аудитории; ориентируйтесь на уровень чтения 8-го класса',
  'content-keyword-stuffing':
    'Пишите естественно; не повторяйте ключевые слова слишком часто',
  'content-article-links':
    'Добавьте в текст статьи уместные внутренние и внешние ссылки',
  'content-broken-html':
    'Исправьте ошибки HTML с помощью валидатора W3C',
  'content-meta-in-body':
    'Перенесите все элементы <meta> в <head>; проверьте шаблон, который их выводит',
  'content-mime-type':
    'Укажите в Content-Type значение, соответствующее фактическому содержимому',
  'content-duplicate-description':
    'Задайте каждой странице уникальный description',
  'content-heading-hierarchy':
    'Соблюдайте порядок заголовков (H1 → H2 → H3, без пропуска уровней)',
  'content-heading-length':
    'Пишите краткие (менее 70 символов) и содержательные заголовки',
  'content-heading-unique':
    'Задайте заголовки, которые отличаются друг от друга и от title страницы',
  'content-text-html-ratio':
    'Увеличьте долю текста в HTML; сократите лишнюю разметку, встроенные стили и скрипты',
  'content-title-same-as-h1':
    'Разведите формулировки title и H1; используйте title для результатов поиска, а H1 — для темы самой страницы',
  'content-title-same-as-description':
    'Напишите отдельный description, который дополняет title и даёт повод открыть страницу',
  'content-title-pixel-width':
    'Уложите ширину title в ~580px, чтобы он не обрезался в результатах поиска Google',
  'content-description-pixel-width':
    'Уложите ширину description в ~920px, чтобы он не обрезался в результатах поиска',
  'content-duplicate-exact':
    'Удалите или объедините страницы с одинаковым содержимым; для намеренных дублей используйте canonical',
  'content-duplicate-near':
    'Разведите страницы с почти одинаковым содержимым; добавьте каждой свои полезные материалы или объедините дубли с помощью canonical',
  'content-duplicate-h1':
    'Задайте каждой странице уникальный H1, отражающий её тему',
  'content-mojibake':
    'Пересохраните страницу в UTF-8 и отдавайте её с charset=utf-8, чтобы кавычки и буквы с диакритикой отображались правильно',
  'content-unrendered-markup':
    'Преобразуйте Markdown в HTML перед публикацией, чтобы посетители не видели разметку **bold** или [label](url)',
  'content-placeholder-text':
    'Обрабатывайте шаблоны перед отдачей страницы и удалите заметки TODO и FIXME из видимого текста',
  'content-stale-copyright':
    'Укажите текущий год в уведомлении об авторских правах в подвале',
  'content-date-agreement':
    'Укажите один и тот же год публикации в datePublished, видимом элементе time и в URL',
  'content-hidden-text':
    'Удалите длинный текст, скрытый встроенными стилями; для текста, предназначенного программам чтения с экрана, используйте класс sr-only',
  'content-thin-vs-site':
    'Приблизьте объём текста к числу слов на других страницах того же вида',
  'content-title-pattern':
    'Используйте в title ту же концовку и разделитель, что и на других страницах сайта',

  // Доступность
  'a11y-aria-labels':
    'Добавьте интерактивным элементам aria-label или видимый текст для программ чтения с экрана',
  'a11y-color-contrast':
    'Обеспечьте соотношение контраста текста и фона не ниже 4.5:1',
  'a11y-focus-visible':
    'Сохраните видимый индикатор фокуса; используйте :focus-visible для навигации с клавиатуры',
  'a11y-form-labels':
    'Добавьте <label for="id"> или aria-label для каждого поля формы',
  'a11y-heading-order':
    'Соблюдайте иерархию заголовков (H1→H2→H3); не пропускайте уровни',
  'a11y-landmark-regions':
    'Добавьте элементы-ориентиры <main>, <nav>, <header>, <footer>',
  'a11y-link-text':
    'Замените "click here", "read more" и подобные фразы описанием того, куда ведёт ссылка',
  'a11y-skip-link':
    'Добавьте в начало страницы ссылку для перехода к основному содержимому с клавиатуры',
  'a11y-table-headers':
    'Добавьте <th scope="col/row"> для заголовков таблиц данных',
  'a11y-touch-targets':
    'Задайте интерактивным элементам размер не менее 44x44 CSS-пикселей',
  'a11y-video-captions':
    'Добавьте к видео <track kind="captions"> или ссылку на расшифровку',
  'a11y-zoom-disabled':
    'Разрешите увеличение масштаба: уберите user-scalable=no и maximum-scale=1 из тега viewport',
  'a11y-iframe-title':
    'Добавьте описательный атрибут title каждому элементу <iframe> и <frame>',
  'a11y-object-alt':
    'Добавьте текстовую альтернативу элементам <object> через запасное содержимое или aria-label',
  'a11y-empty-heading':
    'Удалите пустые заголовки или добавьте в них доступный текст',
  'a11y-input-image-alt':
    'Опишите действие кнопки <input type="image"> в её атрибуте alt',
  'a11y-main-landmark':
    'Поместите основное содержимое страницы внутрь единственного элемента <main>',
  'a11y-list-structure':
    'Размещайте <li> только внутри <ul>/<ol> и оставляйте внутри этих списков только элементы <li>',
  'a11y-duplicate-id':
    'Задайте каждому элементу уникальный id; дубли ID нарушают связи в ARIA и привязку подписей',
  'a11y-tabindex-positive':
    'Используйте tabindex="0" или уберите tabindex; положительные значения нарушают естественный порядок фокуса',
  'a11y-accesskey-unique':
    'Назначайте каждое значение accesskey только одному элементу; повторения делают действие клавиши неоднозначным',
  'a11y-form-multiple-labels':
    'Свяжите каждый элемент формы с одной подписью; удалите дубли',
  'a11y-aria-valid':
    'Исправьте недопустимые роли ARIA и опечатки в атрибутах aria-*; используйте допустимые имена и значения ARIA',
  'a11y-aria-hidden-focusable':
    'Удалите aria-hidden с элементов, внутри которых можно установить фокус, или исключите вложенные элементы из навигации с клавиатуры',
  'a11y-svg-img-alt':
    'Добавьте доступное имя (aria-label или <title>) к SVG с role="img"',
  'a11y-presentation-role-conflict':
    'Уберите атрибуты ARIA и запретите фокус на элементах с role="presentation" или role="none"',
  'a11y-valid-lang-element':
    'Указывайте в атрибутах lang корректные языковые теги BCP 47, например "en" или "en-GB"',
  'a11y-redundant-alt':
    'Удалите текст alt, который повторяет соседнюю ссылку или подпись; оставьте пустой alt у дублирующих декоративных изображений',
  'a11y-table-caption':
    'Добавьте к таблицам данных элемент <caption> вместо объединённой ячейки заголовка',
  'a11y-identical-links-purpose':
    'Задайте различимый текст ссылкам, у которых сейчас одинаковый текст, но разные адреса',
  'a11y-label-name-mismatch':
    'Включите видимую подпись элемента в текст aria-label',
  'a11y-button-name':
    'Добавьте каждой кнопке видимый текст, aria-label или изображение с alt',
  'a11y-autocomplete':
    'Укажите autocomplete="email" для полей электронной почты и autocomplete="tel" для полей телефона',
  'a11y-xml-lang-mismatch':
    'Задайте одинаковый языковой тег в lang и xml:lang у элемента html',
  'a11y-aria-hidden-body':
    'Удалите aria-hidden с элементов html и body',
  'a11y-aria-required':
    'Поместите tab, menuitem, option и treeitem в элементы с обязательными родительскими ролями и задайте этим родителям дочерние элементы',
  'a11y-axe-names':
    'Задайте отмеченным элементам доступные имена: используйте текст alt, элемент label или aria-label',
  'a11y-axe-landmarks':
    'Разместите содержимое внутри ориентиров (header, nav, main, footer) и оставьте по одному main и banner на страницу',
  'a11y-axe-keyboard':
    'Сделайте прокручиваемые области и фреймы доступными с клавиатуры и не вкладывайте интерактивные элементы друг в друга',
  'a11y-axe-tables':
    'Заполните текст каждого заголовка таблицы, задайте допустимые значения scope и добавьте различимые подписи к таблицам',
  'a11y-axe-lists':
    'Соблюдайте допустимую структуру элементов dl, dt и dd',
  'a11y-axe-media':
    'Отключите автовоспроизведение звука и удалите blink и marquee',
  'a11y-axe-frames':
    'Задайте каждому фрейму уникальный title и обеспечьте доступ к его содержимому для проверки',
  'a11y-axe-aria':
    'Используйте только те роли, атрибуты и значения ARIA, которые допустимы для каждого элемента',
  'a11y-axe-language':
    'Укажите в атрибуте lang допустимый код языка',
  'a11y-axe-other':
    'Исправьте проблемы из списка axe по очереди, ориентируясь на идентификаторы правил',

  // Языковые и региональные версии
  'i18n-lang-attribute':
    'Добавьте атрибут lang в тег <html>: <html lang="en">',
  'i18n-hreflang':
    'Добавьте <link rel="alternate" hreflang="xx"> для каждой языковой версии и укажите ссылку на саму версию',
  'i18n-hreflang-return-links':
    'Добавьте взаимные ссылки hreflang; если страница A ссылается на страницу B, страница B должна ссылаться обратно на страницу A',
  'i18n-hreflang-to-noindex':
    'Удалите noindex с целевых страниц или уберите ссылки hreflang на них',
  'i18n-hreflang-to-non-canonical':
    'Указывайте в hreflang только канонические URL; уберите ссылки на неканонические версии',
  'i18n-hreflang-to-broken':
    'Исправьте битые URL в hreflang (4xx/5xx); убедитесь, что все указанные страницы доступны',
  'i18n-hreflang-to-redirect':
    'Укажите в hreflang конечные URL без перенаправлений',
  'i18n-hreflang-conflicting':
    'Устраните конфликты hreflang, когда несколько страниц указаны для одной пары языка и региона',
  'i18n-hreflang-relative-url':
    'Указывайте в hreflang абсолютные URL; относительные URL недопустимы',
  'i18n-hreflang-x-default':
    'Убедитесь, что один URL выбран намеренно; x-default задаёт запасной вариант без указания языка',
  'i18n-hreflang-lang-mismatch':
    'Укажите в hreflang код языка, на котором написано содержимое целевой страницы',
  'i18n-hreflang-multiple-methods':
    'Выберите один способ указания hreflang (теги HTML, заголовки HTTP или sitemap); уберите дубли из остальных источников',
  'i18n-hreflang-incoming-invalid':
    'Исправьте коды hreflang на ссылающихся страницах (язык по ISO 639-1, необязательный регион по ISO 3166-1, например "en-GB")',

  // Сканирование и индексация
  'crawl-schema-noindex-conflict':
    'Удалите noindex, чтобы страница могла появляться в расширенных результатах, или уберите разметку, если страница должна оставаться скрытой',
  'crawl-pagination-canonical':
    'Укажите в canonical каждой страницы пагинации её собственный URL; уберите общие ссылки на страницу 1',
  'crawl-sitemap-domain':
    'Удалите из sitemap URL с другого домена; у всех URL должен быть тот же домен, что у файла sitemap',
  'crawl-noindex-in-sitemap':
    'Удалите страницу с noindex из sitemap или уберите директиву noindex со страницы',
  'crawl-indexability-conflict':
    'Выберите один способ блокировки: запрет в robots.txt или noindex в метатеге',
  'crawl-canonical-redirect':
    'Укажите в canonical сразу конечный URL; избегайте цепочек перенаправлений',
  'crawl-sitemap-url-limit':
    'Разбейте sitemap с более чем 50,000 URL на несколько файлов и перечислите их в индексе sitemap',
  'crawl-sitemap-size-limit':
    'Разбейте sitemap размером более 50MB на файлы поменьше и перечислите их в индексе sitemap',
  'crawl-sitemap-duplicate-urls':
    'Удалите повторяющиеся URL из sitemap; оставьте по одной записи на URL',
  'crawl-sitemap-orphan-urls':
    'Добавьте внутренние ссылки на страницы, указанные только в sitemap, или уберите их из sitemap, если они не важны',
  'crawl-blocked-resources':
    'Разрешите доступ к файлам CSS и JS в robots.txt, чтобы поисковые роботы могли правильно отрисовывать страницы',
  'crawl-blocked-images':
    'Разрешите пути к изображениям в robots.txt или отдавайте изображения по путям, которые открыты для сканирования',
  'crawl-crawl-delay':
    'Удалите crawl-delay из robots.txt или уменьшите значение; большие задержки замедляют индексацию',
  'crawl-sitemap-in-robotstxt':
    'Укажите sitemap в robots.txt: Sitemap: https://example.com/sitemap.xml',
  'crawl-pagination-broken':
    'Исправьте битые ссылки rel=prev/next; убедитесь, что страницы пагинации доступны и возвращают 200',
  'crawl-pagination-loop':
    'Исправьте цикл пагинации, при котором ссылки возвращают на более ранние страницы последовательности',
  'crawl-pagination-sequence':
    'Проверьте порядок страниц пагинации (страница 1 → 2 → 3); устраните пропуски и нарушения порядка',
  'crawl-pagination-noindex':
    'Уберите noindex со страниц пагинации; укажите их собственные URL в canonical, чтобы сохранить ссылочный вес',
  'crawl-pagination-orphaned':
    'Добавьте ссылки на страницы пагинации из основного списка или навигации; без ссылок поисковые роботы могут пропустить эти страницы',
  'crawl-sitemap-lastmod':
    'Указывайте в <lastmod> фактические даты в формате W3C Datetime; избегайте дат в будущем и одной и той же даты для всех URL',
  'crawl-pagination-isolated':
    'Добавьте обычные ссылки на страницы пагинации, например в блоке навигации по списку, в дополнение к тегам rel="next"/"prev"',
  'crawl-sitemap-non-200':
    'Уберите из sitemap URL с ошибками или исправьте их ответы; указывайте конечные URL без перенаправлений',
  'crawl-sitemap-non-canonical':
    'Замените в sitemap URL, у которых canonical указывает на другой адрес, конечными каноническими URL',
  'crawl-sitemap-disallowed':
    'Уберите заблокированные URL из sitemap или разрешите их в robots.txt, в зависимости от того, нужно ли их сканировать',
  'crawl-sitemap-cross-duplicates':
    'Указывайте каждый URL только в одном файле sitemap, чтобы отчёты об охвате были точными',
  'crawl-canonical-to-noindex':
    'Укажите в canonical URL, открытый для индексации, или уберите noindex с целевой страницы',
  'crawl-canonical-to-disallowed':
    'Укажите в canonical URL, открытый для сканирования, или снимите запрет в robots.txt для текущего целевого URL',
  'crawl-canonical-chain':
    'Укажите в canonical сразу конечный канонический URL, минуя промежуточные страницы',
  'crawl-canonical-loop':
    'Укажите один и тот же конечный URL в canonical каждой страницы цикла',
  'crawl-hreflang-to-noindex':
    'Уберите noindex с целевых страниц hreflang или уберите ссылки hreflang на них',
  'crawl-hreflang-to-disallowed':
    'Разрешите доступ к целевым URL hreflang в robots.txt или уберите ссылки hreflang на них',
  'crawl-hreflang-disallowed-target':
    'Снимите запрет для этого URL в robots.txt или уберите ссылки hreflang на него',
  'crawl-hreflang-incoming-conflict':
    'Указывайте для каждого URL один и тот же код языка и региона на всех страницах группы hreflang',
  'crawl-hreflang-reciprocity':
    'Добавьте на целевые страницы обратные ссылки hreflang на этот URL',
  'crawl-isolated-url':
    'Добавьте обычные ссылки на эту страницу со страниц по теме, открытых для индексации; одних canonical или sitemap недостаточно',
  'crawl-canonical-form-drift':
    'Используйте на всех страницах единый хост, протокол и правило для завершающего слеша в canonical',
  'crawl-sitemap-date-drift':
    'Укажите один и тот же день в lastmod файла sitemap и в dateModified разметки',
  'crawl-pdf-size':
    'Сожмите PDF или разделите их на части, чтобы каждый файл был меньше 10 MB',
  'crawl-indexable-not-in-sitemap':
    'Добавьте страницу в XML sitemap или укажите noindex, если она должна быть скрыта из поиска',

  // Структура URL
  'url-slug-keywords':
    'Используйте в URL слова, описывающие страницу (например, /blue-running-shoes вместо /product-12345)',
  'url-stop-words':
    'Уберите стоп-слова (a, the, of) из URL; используйте /best-running-shoes вместо /the-best-running-shoes-for-you',
  'url-uppercase':
    'Замените заглавные буквы в URL строчными; настройте перенаправления 301 с вариантов в верхнем регистре',
  'url-underscores':
    'Замените подчёркивания в URL дефисами; поисковые системы используют дефисы как разделители слов',
  'url-double-slash':
    'Уберите двойные слеши из путей URL; настройте на сервере исправление адресов или перенаправление',
  'url-spaces':
    'Уберите пробелы из URL (включая %20 и +); используйте дефисы',
  'url-non-ascii':
    'Замените символы вне ASCII в URL на эквиваленты из ASCII или транслитерируйте их',
  'url-length':
    'Ограничьте длину URL значением меньше 2048 символов; URL короче 75 символов проще запомнить и передать',
  'url-repetitive-path':
    'Уберите повторяющиеся сегменты пути (например, /blog/blog/post); упростите структуру URL',
  'url-parameters':
    'Сократите число параметров в URL; для важных страниц используйте понятные пути вместо строки запроса',
  'url-session-ids':
    'Удалите идентификаторы сеансов из URL; храните их в файлах cookie, чтобы не создавать дубли',
  'url-tracking-params':
    'Удалите параметры отслеживания (utm_*, gclid, fbclid) из канонических URL; используйте теги canonical или настройте обработку параметров в GSC',
  'url-internal-search':
    'Закройте страницы внутреннего поиска от индексации с помощью noindex или robots.txt; на таких страницах мало содержимого',
  'url-http-https-duplicate':
    'Перенаправьте версию с HTTP на HTTPS и укажите HTTPS в canonical, чтобы избежать дублей',

  // Мобильная версия
  'mobile-font-size':
    'Задайте основному тексту не меньше 16px, а остальному — не меньше 12px; по возможности используйте относительные единицы (rem, em)',
  'mobile-horizontal-scroll':
    'Исправьте выход за края экрана: задайте max-width: 100% для изображений и overflow-x: auto для таблиц, используйте адаптивные элементы iframe',
  'mobile-interstitials':
    'Уберите всплывающие окна, которые закрывают основное содержимое на мобильных устройствах; замените полноэкранные блоки компактными баннерами',
  'mobile-viewport-width':
    'Уберите фиксированную ширину из метатега viewport; используйте width=device-width для адаптивной вёрстки',
  'mobile-multiple-viewports':
    'Удалите дубли метатега viewport; оставьте один с width=device-width, initial-scale=1',
  'mobile-image-maps':
    'Замените карты изображений ссылками SVG или ссылками, расположенными поверх адаптивного изображения',
  'mobile-viewport-content':
    'Используйте <meta name="viewport" content="width=device-width, initial-scale=1">',
  'mobile-parity-content':
    'Показывайте одинаковое основное содержимое на мобильных и настольных устройствах; при индексации с приоритетом мобильных устройств используется мобильная версия',
  'mobile-parity-title':
    'Задайте одинаковые title и description на мобильной и настольной версиях',
  'mobile-parity-canonical':
    'Укажите один и тот же URL в canonical на мобильной и настольной версиях',
  'mobile-parity-structured-data':
    'Разместите одинаковую разметку JSON-LD на мобильной и настольной версиях',
  'mobile-parity-links':
    'Показывайте одни и те же внутренние ссылки на мобильных и настольных устройствах; при индексации с приоритетом мобильных устройств скрытые в мобильной версии ссылки не учитываются',
  'mobile-separate-urls':
    'Укажите настольную страницу в canonical мобильной версии и убедитесь, что мобильная страница открывается',

  // Юридические требования
  'legal-cookie-consent':
    'Добавьте баннер согласия на файлы cookie с помощью CookieYes, OneTrust или Cookiebot; дайте посетителям возможность принять или отклонить необязательные файлы cookie',

  // E-E-A-T
  'eeat-about-page':
    'Добавьте страницу "About" или "About Us" с информацией о компании и её опыте',
  'eeat-affiliate-disclosure':
    'Добавьте рядом с партнёрскими материалами и ссылками уведомление о партнёрстве согласно требованиям FTC',
  'eeat-author-byline':
    'Укажите имя автора, добавьте краткую биографию и ссылку на страницу автора',
  'eeat-author-expertise':
    'Добавьте сведения о квалификации автора, ссылки на профессиональные профили и информацию об опыте по теме',
  'eeat-citations':
    'Подтвердите утверждения ссылками на авторитетные источники (сайты .gov, .edu, научные статьи)',
  'eeat-contact-page':
    'Добавьте страницу контактов и укажите несколько способов связи, например электронную почту, телефон, форму связи или почтовый адрес',
  'eeat-content-dates':
    'Добавьте datePublished и dateModified в разметку Article или используйте элементы <time>',
  'eeat-disclaimers':
    'Добавьте подходящие оговорки к медицинским, финансовым и юридическим материалам (YMYL)',
  'eeat-editorial-policy':
    'Добавьте страницу редакционной политики и опишите требования к материалам и порядок их проверки',
  'eeat-physical-address':
    'Добавьте адрес компании через Schema.org PostalAddress, чтобы подтвердить её местоположение',
  'eeat-privacy-policy':
    'Добавьте ссылку на политику конфиденциальности в подвал каждой страницы; опишите, как сайт собирает данные',
  'eeat-terms-of-service':
    'Добавьте ссылку на условия использования в подвал, особенно для интернет-магазинов, сервисов SaaS и платформ с пользовательскими материалами',
  'eeat-trust-signals':
    'Добавьте отзывы клиентов, сертификаты, значки безопасности или упоминания в СМИ',
  'eeat-ymyl-detection':
    'Усильте сигналы E-E-A-T на страницах YMYL (здоровье, финансы, право) с помощью экспертных авторов и ссылок на источники',
  'eeat-geo-meta':
    'Добавьте geo.region, geo.placename или geo.position на страницы с разметкой местной компании',
  'eeat-nap-consistency':
    'Укажите один номер телефона и один почтовый адрес для каждого названия организации',

  // Перенаправления
  'redirect-meta-refresh':
    'Замените перенаправления через <meta http-equiv="refresh"> серверными перенаправлениями 301',
  'redirect-javascript':
    'Замените перенаправления через JavaScript (window.location) серверными перенаправлениями 301, чтобы поисковые роботы могли их пройти',
  'redirect-http-refresh':
    'Замените заголовки HTTP Refresh перенаправлениями с кодами 301/302',
  'redirect-loop':
    'Разорвите цикл перенаправлений, направив цепочку на конечный URL без дальнейших перенаправлений',
  'redirect-type':
    'Используйте 301 для перемещённых страниц, а 302 — только для временных перенаправлений',
  'redirect-broken':
    'Исправьте перенаправления, которые ведут к ошибкам 4xx/5xx; укажите доступные целевые URL',
  'redirect-resource':
    'Исправьте адреса ресурсов с перенаправлениями (CSS, JS, изображения); отдавайте их напрямую, чтобы ускорить загрузку',
  'redirect-case-normalization':
    'Приведите URL к единому регистру; перенаправляйте URL с заглавными буквами на канонические варианты со строчными',
  'redirect-resource-broken':
    'Укажите в URL ресурсов сразу рабочий адрес, чтобы избежать битых перенаправлений',
  'redirect-resource-loop':
    'Исправьте целевой URL перенаправления, чтобы цепочка завершалась на конечном ресурсе и не зацикливалась',
  'redirect-resource-chain':
    'Укажите конечные URL ресурсов, чтобы исключить промежуточные перенаправления',

  // Видимость в системах ИИ
  'geo-semantic-html':
    'Используйте семантические элементы HTML (<article>, <section>, <nav>, <aside>) вместо универсальных тегов <div>',
  'geo-content-structure':
    'Разбейте содержимое на понятные заголовки, списки и абзацы, чтобы его было проще использовать в ответах ИИ и выделенных сниппетах',
  'geo-ai-bot-access':
    'Разрешите доступ роботам ИИ (GPTBot, Claude, Perplexity) в robots.txt, чтобы сайт мог появляться в поиске с ИИ',
  'geo-llms-txt':
    'Добавьте файл /llms.txt с информацией о сайте и подсказками по его материалам для систем ИИ',
  'geo-schema-drift':
    'Согласуйте структурированные данные JSON-LD с видимым содержимым страницы; исправьте расхождения между разметкой и текстом',
  'geo-content-signals':
    'Исправьте синтаксис Content-Signal и задайте ai-train=no, если robots.txt блокирует роботов, собирающих данные для обучения',
  'geo-noai-signals':
    'Проверьте директивы noai и noimageai; аудит лишь сообщает об их наличии. Удалите их, если страницу можно цитировать в ответах ИИ',
  'geo-agents-md':
    'Опубликуйте /AGENTS.md в виде текста или Markdown, чтобы по этому адресу открывался файл',
  'geo-well-known':
    'Опубликуйте /.well-known/mcp.json или /.well-known/agent-card.json для агентов, которые должны обращаться к сайту',
  'geo-rsl-license':
    'Укажите в директиве License файла robots.txt адрес документа с условиями лицензии, который возвращает 200',
  'geo-markdown-response':
    'Настройте отдачу Markdown для /: обрабатывайте Accept: text/markdown или опубликуйте /index.md',
  'geo-markdown-page':
    'Настройте отдачу Markdown для этого URL: обрабатывайте Accept: text/markdown или опубликуйте тот же путь с окончанием .md',
  'geo-pay-per-crawl':
    'Добавьте заголовок Pay или Crawler-Price либо ссылку на оплату в ответ HTTP 402',

  // Проверка HTML
  'htmlval-missing-doctype':
    'Добавьте <!DOCTYPE html> первой строкой документов HTML, чтобы браузеры отображали их в стандартном режиме',
  'htmlval-missing-charset':
    'Поместите <meta charset="utf-8"> в самое начало <head>, чтобы текст декодировался корректно',
  'htmlval-invalid-head':
    'Вынесите элементы, которые не относятся к метаданным, за пределы <head>; оставьте внутри только meta, link, title, style, script и base',
  'htmlval-noscript-in-head':
    'Перенесите содержимое <noscript> из <head> в <body>; <noscript> в <head> может вызвать ошибки разбора HTML',
  'htmlval-multiple-heads':
    'Удалите повторяющиеся элементы <head>; в документе HTML должен быть ровно один <head>',
  'htmlval-size-limit':
    'Сократите размер HTML-документа до значения меньше 5MB; файлы большого размера медленнее разбираются и могут индексироваться лишь частично',
  'htmlval-lorem-ipsum':
    'Замените заглушку "Lorem ipsum" настоящим текстом перед публикацией',
  'htmlval-multiple-titles':
    'Удалите повторяющиеся теги <title>; в разделе <head> документа HTML должен быть ровно один <title>',
  'htmlval-multiple-descriptions':
    'Удалите повторяющиеся метатеги description; оставьте только один <meta name="description"> на страницу',
  'htmlval-title-outside-head':
    'Перенесите элемент <title> в <head>; поисковые системы могут игнорировать <title> вне <head>',
  'htmlval-base-url':
    'Оставьте не более одного элемента <base> с корректным непустым href; этот адрес служит основой для относительных ссылок',
  'htmlval-body-structure':
    'Оставьте один <body> внутри <html>, а перед <head> — только пробельные символы и комментарии',

  // Отрисовка и JavaScript
  'js-rendered-title':
    'Добавьте title страницы в исходный HTML, чтобы он был доступен до выполнения JavaScript',
  'js-rendered-description':
    'Добавьте метатег description в HTML, который отдаёт сервер; это сделает description доступным до выполнения JavaScript',
  'js-rendered-h1':
    'Добавьте H1 в HTML, который отдаёт сервер, чтобы ускорить индексацию; так заголовок будет доступен до отрисовки в браузере',
  'js-rendered-canonical':
    'Добавьте тег canonical в HTML, который отдаёт сервер; поисковые роботы могут пропустить canonical, добавленный через JavaScript',
  'js-canonical-mismatch':
    'Устраните расхождение между URL в canonical исходного HTML и DOM после отрисовки; укажите один и тот же предпочтительный URL',
  'js-noindex-mismatch':
    'Устраните расхождение noindex между исходным HTML и HTML после отрисовки; уберите из JavaScript код, который добавляет или удаляет noindex',
  'js-title-modified':
    'Уберите код JavaScript, меняющий title после загрузки; поисковые системы могут использовать исходный title',
  'js-description-modified':
    'Уберите код JavaScript, меняющий description после загрузки; передавайте итоговый description в HTML с сервера',
  'js-h1-modified':
    'Уберите код JavaScript, меняющий H1 после загрузки; включите итоговый H1 в HTML, который отдаёт сервер',
  'js-rendered-content':
    'Включите основное содержимое в HTML, который отдаёт сервер; поисковые системы могут пропустить содержимое, появляющееся только после выполнения JavaScript',
  'js-rendered-links':
    'Добавьте навигационные ссылки в HTML, который отдаёт сервер; поисковые роботы могут пропустить ссылки, появляющиеся только после выполнения JavaScript',
  'js-blocked-resources':
    'Разрешите доступ к файлам JavaScript и CSS в robots.txt, чтобы поисковые роботы могли правильно отрисовывать страницы',
  'js-ssr-check':
    'Настройте серверную отрисовку (SSR) или статическую генерацию важных страниц с содержимым',
  'js-console-errors':
    'Исправьте необработанные ошибки JavaScript; остановившийся скрипт не добавит содержимое или теги, за которые отвечал',
  'js-failed-requests':
    'Исправьте ошибки при загрузке скриптов и таблиц стилей; если ресурс не загрузился, браузер не сможет показать зависящее от него содержимое',
  'js-document-write':
    'Замените document.write() методами работы с DOM; document.write() блокирует разбор HTML и замедляет отрисовку',
  'js-ajax-crawling-scheme':
    'Замените URL с #! обычными путями (History API) и отрисовывайте их содержимое на сервере',
};
