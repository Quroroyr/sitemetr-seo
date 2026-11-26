/** Названия и описания правил по id. */
export const RULES_RU: Readonly<Record<string, { name: string; description: string }>> = {
  // Основные проверки SEO
  'core-title-present': {
    name: 'Наличие тега title',
    description: 'Проверяет, есть ли тег <title> в разделе <head>.',
  },
  'core-title-length': {
    name: 'Длина тега title',
    description: 'Проверяет, укладывается ли длина title в диапазон от 30 до 60 символов.',
  },
  'core-description-present': {
    name: 'Наличие метатега description',
    description: 'Проверяет, есть ли в документе тег <meta name="description">.',
  },
  'core-description-length': {
    name: 'Длина метатега description',
    description: 'Проверяет, укладывается ли длина description в диапазон от 120 до 160 символов.',
  },
  'core-canonical-present': {
    name: 'Наличие тега canonical',
    description: 'Проверяет, есть ли в документе тег <link rel="canonical">.',
  },
  'core-canonical-valid': {
    name: 'Корректность URL в canonical',
    description: 'Проверяет, содержит ли canonical корректный абсолютный URL.',
  },
  'core-viewport-present': {
    name: 'Наличие метатега viewport',
    description: 'Проверяет, есть ли в документе тег <meta name="viewport">.',
  },
  'core-favicon-present': {
    name: 'Наличие значка сайта',
    description: 'Проверяет, есть ли тег <link rel="icon"> или <link rel="shortcut icon">.',
  },
  'core-h1-present': {
    name: 'Наличие заголовка H1',
    description: 'Проверяет, есть ли в документе хотя бы один тег <h1>.',
  },
  'core-h1-single': {
    name: 'Единственный заголовок H1',
    description: 'Проверяет, что в документе ровно один тег <h1>.',
  },
  'core-canonical-header': {
    name: 'Согласованность canonical и Link',
    description: 'Выявляет расхождения между canonical в HTML и HTTP-заголовком Link.',
  },
  'core-nosnippet': {
    name: 'Директива nosnippet',
    description: 'Находит страницы, для которых директивы robots запрещают показывать сниппет в поиске.',
  },
  'core-robots-meta': {
    name: 'Директивы для роботов',
    description: 'Ищет noindex, nofollow и похожие директивы в метатеге robots и X-Robots-Tag.',
  },
  'core-title-unique': {
    name: 'Уникальность тега title',
    description: 'Проверяет, есть ли такой же <title> на других просканированных страницах.',
  },
  'core-canonical-conflicting': {
    name: 'Конфликт URL в canonical',
    description: 'Проверяет, указывают ли canonical в HTML и в HTTP-заголовке на разные URL.',
  },
  'core-canonical-to-homepage': {
    name: 'Canonical на главную страницу',
    description: 'Проверяет, указывает ли canonical внутренней страницы на главную.',
  },
  'core-canonical-http-mismatch': {
    name: 'Разные протоколы страницы и canonical',
    description: 'Проверяет, совпадает ли протокол canonical с протоколом страницы (HTTP или HTTPS).',
  },
  'core-canonical-loop': {
    name: 'Цикл ссылок canonical',
    description: 'Проверяет, может ли canonical образовать цикл, когда он указывает на другую страницу.',
  },
  'core-canonical-to-noindex': {
    name: 'Конфликт canonical и noindex',
    description: 'Проверяет, есть ли на странице одновременно noindex и canonical с другим URL.',
  },
  'core-canonical-outside-head': {
    name: 'Canonical вне раздела head',
    description: 'Проверяет, есть ли элементы <link rel="canonical"> за пределами <head>.',
  },
  'core-canonical-attributes': {
    name: 'Допустимые атрибуты canonical',
    description: 'Проверяет, что у элементов <link rel="canonical"> есть только атрибуты rel и href.',
  },
  'core-canonical-multiple': {
    name: 'Несколько тегов canonical',
    description: 'Проверяет, есть ли в HTML несколько элементов <link rel="canonical"> и совпадают ли их URL.',
  },
  'core-canonical-external': {
    name: 'Canonical на внешний URL',
    description: 'Сообщает, если canonical указывает на другой хост, что может быть уместно при перепубликации материалов.',
  },
  'core-robots-directive-mismatch': {
    name: 'Согласованность директив robots',
    description: 'Проверяет, что директивы robots в метатегах и заголовке X-Robots-Tag согласованы и не дублируются.',
  },
  'core-unavailable-after': {
    name: 'Дата в unavailable_after',
    description: 'Проверяет дату unavailable_after в директивах robots, после которой страница исчезает из результатов поиска.',
  },
  'core-obsolete-robots-directives': {
    name: 'Устаревшие директивы robots',
    description: 'Находит директивы robots, которые поисковые системы больше не читают (noodp, noydir).',
  },
  'core-canonical-fragment': {
    name: 'Canonical без фрагмента URL',
    description: 'Проверяет, что URL в canonical не содержит #fragment, который поисковые системы игнорируют.',
  },

  // Технические проверки
  'technical-robots-txt-exists': {
    name: 'Наличие файла robots.txt',
    description: 'Проверяет, доступен ли файл robots.txt по пути /robots.txt.',
  },
  'technical-robots-txt-valid': {
    name: 'Синтаксис файла robots.txt',
    description: 'Проверяет синтаксис robots.txt с директивами User-agent и Allow/Disallow.',
  },
  'technical-sitemap-exists': {
    name: 'Наличие файла sitemap',
    description: 'Проверяет, доступен ли sitemap.xml по пути /sitemap.xml или указан ли он в robots.txt.',
  },
  'technical-sitemap-valid': {
    name: 'Структура файла sitemap',
    description: 'Проверяет корректность структуры XML и элементов sitemap.',
  },
  'technical-url-structure': {
    name: 'Структура адреса страницы',
    description: 'Проверяет, что URL имеет разумную длину, написан строчными буквами и использует дефисы вместо подчёркиваний.',
  },
  'technical-trailing-slash': {
    name: 'Единообразие завершающего слеша',
    description: 'Проверяет, одинаково ли оформлен завершающий слеш во внутренних ссылках.',
  },
  'technical-www-redirect': {
    name: 'Перенаправление с www',
    description: 'Проверяет, сводятся ли версии с www и без www к одному каноническому адресу.',
  },
  'technical-404-page': {
    name: 'Собственная страница 404',
    description: 'Проверяет, показывает ли сайт собственную страницу 404 вместо стандартной ошибки сервера.',
  },
  'technical-soft-404': {
    name: 'Ложная ошибка 404',
    description: 'Выявляет страницы, которые возвращают HTTP 200, но показывают сообщение об ошибке (ложная 404).',
  },
  'technical-server-error': {
    name: 'Ошибки сервера 5xx',
    description: 'Проверяет, возвращает ли страница код серверной ошибки 5xx.',
  },
  'technical-4xx-non-404': {
    name: 'Ошибки 4xx кроме 404',
    description: 'Ищет клиентские ошибки 4xx, кроме 404, например 401, 403, 410 и 429.',
  },
  'technical-timeout': {
    name: 'Предельное время ответа',
    description: 'Проверяет, не приближается ли время ответа страницы к предельному.',
  },
  'technical-bad-content-type': {
    name: 'Корректность заголовка Content-Type',
    description: 'Проверяет, соответствует ли значение заголовка Content-Type странице HTML.',
  },
  'technical-empty-html': {
    name: 'Пустой документ HTML',
    description: 'Проверяет, возвращает ли страница HTML с содержимым.',
  },
  'technical-form-get-method': {
    name: 'Метод GET в формах',
    description: 'Находит формы, которые отправляют данные методом GET, из-за чего эти данные попадают в параметры URL.',
  },
  'technical-duplicate-gtm': {
    name: 'Несколько контейнеров Google Tag Manager',
    description: 'Находит страницы, на которых подключено больше одного идентификатора контейнера Google Tag Manager.',
  },
  'technical-duplicate-ga': {
    name: 'Несколько ресурсов Google Analytics',
    description: 'Находит страницы, на которых указан более чем один идентификатор ресурса Google Analytics (UA- или G-).',
  },
  'technical-consent-mode': {
    name: 'Режим согласия Google',
    description: 'Проверяет, передаёт ли страница обновление согласия, если на ней загружаются теги Google.',
  },
  'technical-amp-pairing': {
    name: 'Связь с версией AMP',
    description: 'Проверяет, открывается ли указанная версия AMP и ссылается ли её canonical на текущую страницу.',
  },

  // Производительность
  'cwv-lcp': {
    name: 'Отрисовка крупнейшего элемента (LCP)',
    description: 'Измеряет, сколько времени проходит до появления самого крупного элемента содержимого.',
  },
  'cwv-cls': {
    name: 'Суммарный сдвиг макета (CLS)',
    description: 'Оценивает стабильность макета по тому, насколько он смещается при загрузке.',
  },
  'cwv-inp': {
    name: 'Скорость отклика интерфейса (INP)',
    description: 'Измеряет задержку между действием пользователя и следующим обновлением экрана.',
  },
  'cwv-ttfb': {
    name: 'Время до первого байта (TTFB)',
    description: 'Измеряет, сколько времени проходит до получения первого байта ответа сервера.',
  },
  'cwv-fcp': {
    name: 'Отрисовка первого содержимого (FCP)',
    description: 'Измеряет время до появления первого содержимого на экране.',
  },
  'perf-dom-size': {
    name: 'Размер дерева DOM',
    description: 'Оценивает число узлов, глубину и число дочерних элементов DOM с точки зрения производительности.',
  },
  'perf-css-file-size': {
    name: 'Размер файлов CSS',
    description: 'Проверяет число файлов CSS и объём встроенного CSS с точки зрения производительности.',
  },
  'perf-font-loading': {
    name: 'Загрузка шрифтов',
    description: 'Проверяет настройки загрузки шрифтов, включая font-display и preload.',
  },
  'perf-preconnect': {
    name: 'Предварительное подключение через preconnect',
    description: 'Проверяет, задан ли preconnect для важных сторонних источников, таких как шрифты, аналитика и CDN.',
  },
  'perf-render-blocking': {
    name: 'Ресурсы, блокирующие отрисовку',
    description: 'Ищет CSS и JavaScript в <head>, которые блокируют отрисовку.',
  },
  'perf-lazy-above-fold': {
    name: 'Отложенная загрузка первого экрана',
    description: 'Находит изображения на первом экране, которые должны загружаться сразу, но загружаются отложенно.',
  },
  'perf-lcp-hints': {
    name: 'Приоритет загрузки для LCP',
    description: 'Проверяет наличие preload и fetchpriority для крупнейшего элемента содержимого (LCP).',
  },
  'perf-text-compression': {
    name: 'Сжатие текстовых ответов',
    description: 'Проверяет, используется ли в ответе сжатие текста (gzip, br, deflate, zstd).',
  },
  'perf-brotli': {
    name: 'Сжатие через Brotli',
    description: 'Проверяет, используется ли Brotli для более эффективного сжатия, чем gzip.',
  },
  'perf-asset-compression': {
    name: 'Сжатие текстовых ресурсов',
    description: 'Проверяет, передаются ли текстовые ресурсы объёмом свыше 2KB со сжатием gzip или Brotli.',
  },
  'perf-cache-policy': {
    name: 'Политика кеширования HTTP',
    description: 'Проверяет HTTP-заголовки кеширования (cache-control, expires, etag, last-modified).',
  },
  'perf-asset-cache-policy': {
    name: 'Кеширование статических ресурсов',
    description: 'Проверяет, задано ли статическим ресурсам (CSS, JS, изображениям, шрифтам) время кеширования cache-control max-age не менее 1 часа.',
  },
  'perf-minify-css': {
    name: 'Минификация встроенного CSS',
    description: 'Проверяет признаки минификации CSS в тегах <style> и отмечает крупные внешние таблицы стилей без .min. в URL.',
  },
  'perf-minify-js': {
    name: 'Минификация встроенного JavaScript',
    description: 'Проверяет признаки минификации JavaScript в тегах <script> и отмечает крупные внешние скрипты без .min. в URL.',
  },
  'perf-response-time': {
    name: 'Время ответа страницы',
    description: 'Сопоставляет время ответа страницы с порогами производительности.',
  },
  'perf-http2': {
    name: 'Поддержка HTTP/2 и выше',
    description: 'Ищет признаки поддержки HTTP/2 или HTTP/3 по заголовку alt-svc.',
  },
  'perf-page-weight': {
    name: 'Объём документа HTML',
    description: 'Сравнивает размер документа HTML с рекомендуемыми пределами.',
  },
  'perf-js-file-size': {
    name: 'Объём встроенного JavaScript',
    description: 'Проверяет суммарный объём встроенного JavaScript во всех тегах <script>.',
  },
  'perf-video-for-animations': {
    name: 'Видео вместо анимированных GIF',
    description: 'Ищет GIF-изображения, которые стоит заменить видео или WebP.',
  },
  'perf-legacy-javascript': {
    name: 'Устаревший код JavaScript',
    description: 'Проверяет, загружает ли страница полифилы и вспомогательный код транспиляторов, которые современным браузерам не нужны.',
  },
  'perf-image-encoding': {
    name: 'Эффективность кодирования изображений',
    description: 'Находит отрисованные изображения, у которых объём передачи превышает 100KB или используется старый формат BMP/TIFF.',
  },
  'perf-duplicate-js': {
    name: 'Дубли библиотек JavaScript',
    description: 'Проверяет, загружается ли известная библиотека с нескольких URL скриптов.',
  },
  'perf-source-maps': {
    name: 'Открытые карты исходников',
    description: 'Ищет комментарии sourceMappingURL и заголовок ответа SourceMap.',
  },
  'perf-unused-js': {
    name: 'Неиспользуемый код JavaScript',
    description: 'Измеряет объём JavaScript, который скачивается из каждого файла, но не выполняется при загрузке страницы.',
  },
  'perf-unused-css': {
    name: 'Неиспользуемые стили CSS',
    description: 'Измеряет объём CSS в каждой таблице стилей, который не применяется ни к одному элементу страницы.',
  },

  // Ссылки
  'links-broken-internal': {
    name: 'Битые внутренние ссылки',
    description: 'Проверяет, что все внутренние ссылки возвращают статус HTTP 200.',
  },
  'links-external-valid': {
    name: 'Доступность внешних ссылок',
    description: 'Проверяет, доступны ли адреса по внешним ссылкам и возвращают ли они корректные ответы.',
  },
  'links-internal-present': {
    name: 'Наличие внутренних ссылок',
    description: 'Проверяет наличие внутренних ссылок, которые помогают пользователям и поисковым роботам переходить между страницами.',
  },
  'links-nofollow-appropriate': {
    name: 'Уместность атрибута nofollow',
    description: 'Проверяет, уместен ли nofollow у внешних ссылок и ссылок в пользовательских материалах.',
  },
  'links-anchor-text': {
    name: 'Понятный текст ссылок',
    description: 'Проверяет, описывает ли текст ссылки её назначение и нет ли общих фраз вроде "click here" или "read more".',
  },
  'links-depth': {
    name: 'Глубина вложенности страницы',
    description: 'Измеряет число переходов от начальной страницы сканирования и отмечает страницы, до которых больше 3 переходов.',
  },
  'links-dead-end-pages': {
    name: 'Страницы без внутренних ссылок',
    description: 'Проверяет, есть ли на странице хотя бы одна ссылка на другую страницу сайта.',
  },
  'links-https-downgrade': {
    name: 'Ссылки с HTTPS на HTTP',
    description: 'Проверяет, есть ли на страницах HTTPS ссылки на URL с HTTP.',
  },
  'links-external-count': {
    name: 'Число внешних ссылок',
    description: 'Проверяет, нет ли на странице слишком большого числа внешних ссылок.',
  },
  'links-invalid': {
    name: 'Некорректные адреса ссылок',
    description: 'Ищет пустые и некорректные значения href, а также ссылки с javascript:.',
  },
  'links-tel-mailto': {
    name: 'Ссылки на телефон и почту',
    description: 'Проверяет корректность формата ссылок tel: и mailto:.',
  },
  'links-redirect-chains': {
    name: 'Цепочки перенаправлений по ссылкам',
    description: 'Проверяет, ведут ли внутренние ссылки через несколько перенаправлений.',
  },
  'links-orphan-pages': {
    name: 'Входящие внутренние ссылки',
    description: 'Считает, сколько внутренних страниц ссылаются на текущую, а страницы совсем без ссылок проверяет правило crawl-sitemap-orphan-urls.',
  },
  'links-localhost': {
    name: 'Ссылки на локальный сервер',
    description: 'Ищет ссылки на localhost, 127.0.0.1 или типичные порты серверов разработки.',
  },
  'links-local-file': {
    name: 'Ссылки на локальные файлы',
    description: 'Ищет ссылки с протоколом file:// и абсолютные пути файловой системы в атрибутах href/src.',
  },
  'links-broken-fragment': {
    name: 'Битые ссылки на якоря',
    description: 'Проверяет, ведут ли ссылки на фрагменты (#id) к существующим элементам страницы.',
  },
  'links-excessive': {
    name: 'Общее число ссылок',
    description: 'Проверяет, нет ли на странице слишком большого числа ссылок.',
  },
  'links-onclick': {
    name: 'Навигация через onclick',
    description: 'Находит элементы, которые для перехода используют обработчик onclick вместо атрибута href.',
  },
  'links-whitespace-href': {
    name: 'Пробелы в атрибуте href',
    description: 'Ищет ссылки, в которых href начинается или заканчивается пробельными символами либо состоит только из них.',
  },
  'links-non-http-protocol': {
    name: 'Ссылки с другими протоколами',
    description: 'Ищет ссылки с протоколами, отличными от HTTP(S), tel: и mailto: (например, ftp:, file:, intent:).',
  },
  'links-inbound-all-nofollow': {
    name: 'Nofollow на всех входящих ссылках',
    description: 'Предупреждает, если все входящие внутренние ссылки имеют nofollow и не передают странице ссылочный вес.',
  },
  'links-inbound-mixed-follow': {
    name: 'Разный nofollow на входящих ссылках',
    description: 'Предупреждает, если только часть внутренних ссылок на страницу помечена nofollow.',
  },
  'links-inbound-low-quality': {
    name: 'Передача веса входящими ссылками',
    description: 'Предупреждает, если все входящие внутренние ссылки помечены nofollow или ведут со страниц с canonical на другой адрес и поэтому не передают вес.',
  },
  'links-inbound-anchor-text': {
    name: 'Текст входящих внутренних ссылок',
    description: 'Предупреждает, если у всех входящих внутренних ссылок без nofollow общий текст вроде "click here".',
  },
  'links-nofollow-internal': {
    name: 'Nofollow на внутренних ссылках',
    description: 'Проверяет, что ссылки на тот же хост не содержат rel=nofollow.',
  },
  'links-weak-inbound': {
    name: 'Единственная входящая ссылка',
    description: 'Проверяет, что у страницы, с которой не начинали сканирование, есть больше одной входящей внутренней ссылки без nofollow.',
  },
  'links-chrome-inbound': {
    name: 'Входящие ссылки из текста',
    description: 'Проверяет, есть ли хотя бы одна входящая внутренняя ссылка за пределами nav, header и footer.',
  },

  // Изображения
  'images-alt-present': {
    name: 'Наличие атрибута alt',
    description: 'Проверяет, есть ли у всех изображений атрибуты alt для доступности и SEO.',
  },
  'images-alt-quality': {
    name: 'Качество текста alt',
    description: 'Проверяет, описывает ли текст alt изображение и нет ли общих слов вроде "image" или "photo".',
  },
  'images-dimensions': {
    name: 'Заданные размеры изображений',
    description: 'Проверяет, заданы ли у изображений атрибуты width и height для предотвращения сдвигов макета (CLS).',
  },
  'images-lazy-loading': {
    name: 'Отложенная загрузка изображений',
    description: 'Проверяет, задан ли у изображений за пределами первого экрана атрибут loading="lazy" для ускорения загрузки страницы.',
  },
  'images-modern-format': {
    name: 'Современные форматы изображений',
    description: 'Проверяет, используются ли форматы с более эффективным сжатием, например WebP или AVIF.',
  },
  'images-size': {
    name: 'Размер файлов изображений',
    description: 'Проверяет, нет ли слишком больших изображений, и предупреждает, если оценочный размер превышает 200KB.',
  },
  'images-responsive': {
    name: 'Адаптивная загрузка изображений',
    description: 'Проверяет, используются ли srcset или элементы picture, чтобы подобрать изображение под экран.',
  },
  'images-broken': {
    name: 'Доступность файлов изображений',
    description: 'Проверяет, доступны ли все изображения и нет ли ошибок 404.',
  },
  'images-figure-captions': {
    name: 'Подписи к элементам figure',
    description: 'Проверяет, сопровождаются ли медиа в блоках <figure> подписью <figcaption>.',
  },
  'images-filename-quality': {
    name: 'Имена файлов изображений',
    description: 'Проверяет, описывают ли имена файлов изображений их содержимое и нет ли имён вроде IMG_001.jpg.',
  },
  'images-inline-svg-size': {
    name: 'Размер встроенных SVG',
    description: 'Ищет большие встроенные SVG, увеличивающие объём HTML, и отмечает элементы свыше 5KB, которые стоит вынести в файлы.',
  },
  'images-picture-element': {
    name: 'Запасное изображение в picture',
    description: 'Проверяет, содержат ли элементы picture обязательное запасное изображение img.',
  },
  'images-alt-length': {
    name: 'Длина текста alt',
    description: 'Проверяет, не превышает ли длина текста alt 125 символов.',
  },
  'images-background-seo': {
    name: 'Индексация фоновых изображений',
    description: 'Находит важные изображения, заданные фоном в CSS, из-за чего поисковые роботы не могут их просканировать.',
  },
  'images-oversized-delivery': {
    name: 'Соответствие размеров изображений макету',
    description: 'Сравнивает исходный размер каждого изображения с размером при показе и оценивает избыточный трафик.',
  },

  // Безопасность
  'security-https': {
    name: 'Доступ по HTTPS',
    description: 'Проверяет, отдаётся ли страница по HTTPS.',
  },
  'security-https-redirect': {
    name: 'Перенаправление с HTTP на HTTPS',
    description: 'Проверяет, перенаправляются ли запросы с HTTP на HTTPS.',
  },
  'security-hsts': {
    name: 'Заголовок HSTS',
    description: 'Проверяет наличие заголовка Strict-Transport-Security с подходящими настройками.',
  },
  'security-csp': {
    name: 'Заголовок Content-Security-Policy',
    description: 'Проверяет наличие заголовка Content-Security-Policy.',
  },
  'security-x-frame-options': {
    name: 'Заголовок X-Frame-Options',
    description: 'Проверяет, задан ли X-Frame-Options со значением DENY или SAMEORIGIN для защиты от кликджекинга.',
  },
  'security-x-content-type-options': {
    name: 'Заголовок X-Content-Type-Options',
    description: 'Проверяет, задано ли в X-Content-Type-Options значение nosniff, чтобы браузер не определял тип MIME по содержимому.',
  },
  'security-external-links': {
    name: 'Безопасность внешних ссылок',
    description: 'Проверяет наличие noopener и noreferrer во внешних ссылках с target="_blank".',
  },
  'security-form-https': {
    name: 'Отправка форм по HTTPS',
    description: 'Находит формы, которые отправляют данные по небезопасному URL с http://.',
  },
  'security-mixed-content': {
    name: 'Смешанное содержимое страницы',
    description: 'Находит ресурсы с http://, которые загружаются на странице с HTTPS.',
  },
  'security-permissions-policy': {
    name: 'Заголовок Permissions-Policy',
    description: 'Проверяет наличие заголовка Permissions-Policy.',
  },
  'security-referrer-policy': {
    name: 'Политика Referrer-Policy',
    description: 'Проверяет, задана ли политика Referrer-Policy заголовком или метатегом.',
  },
  'security-leaked-secrets': {
    name: 'Утечка секретных данных',
    description: 'Ищет ключи API, токены и пароли, оставленные в открытом доступе в HTML и встроенных скриптах.',
  },
  'security-password-http': {
    name: 'Поля пароля на HTTP',
    description: 'Проверяет, передаются ли поля ввода пароля по небезопасному HTTP.',
  },
  'security-protocol-relative': {
    name: 'URL без указания протокола',
    description: 'Ищет адреса ресурсов, которые начинаются с //.',
  },
  'security-ssl-expiry': {
    name: 'Состояние сертификата SSL',
    description: 'Оценивает обслуживание SSL-сертификата косвенно по значению max-age в HSTS.',
  },
  'security-ssl-protocol': {
    name: 'Настройки протокола TLS',
    description: 'Оценивает настройки TLS по директивам HSTS и другим заголовкам безопасности.',
  },
  'security-cookie-flags': {
    name: 'Атрибуты защиты cookie',
    description: 'Проверяет атрибуты Secure, HttpOnly и SameSite в заголовках Set-Cookie для файлов cookie сеанса.',
  },
  'security-cookie-lifetime': {
    name: 'Срок хранения cookie',
    description: 'Находит файлы cookie со сроком хранения больше браузерного лимита в 400 дней.',
  },
  'security-coop': {
    name: 'Заголовок Cross-Origin-Opener-Policy',
    description: 'Проверяет, изолирует ли Cross-Origin-Opener-Policy страницу от окон, которые её открыли.',
  },
  'security-csp-xss': {
    name: 'Защита от XSS через CSP',
    description: 'Проверяет, ограничивает ли Content-Security-Policy выполнение скриптов.',
  },
  'security-info-disclosure': {
    name: 'Раскрытие версий программного обеспечения',
    description: 'Проверяет, раскрывают ли заголовки ответа имя и версию серверного ПО.',
  },
  'security-paste-blocking': {
    name: 'Вставка текста в поля',
    description: 'Проверяет, не блокируют ли поля ввода вставку текста.',
  },
  'security-trusted-types': {
    name: 'Защита через Trusted Types',
    description: 'Проверяет, требует ли Content-Security-Policy использовать Trusted Types в операциях DOM, подверженных XSS.',
  },
  'security-sri': {
    name: 'Контроль целостности ресурсов',
    description: 'Проверяет, задан ли хеш целостности у скриптов и стилей, загружаемых с других источников.',
  },
  'security-obfuscated-script': {
    name: 'Обфусцированный встроенный скрипт',
    description: 'Ищет длинные встроенные скрипты с высокой энтропией, которые вызывают eval, Function или atob.',
  },
  'security-brand-impersonation': {
    name: 'Адрес входа через бренд',
    description: 'Проверяет, ведут ли ссылки входа через сторонний сервис на сайт этого сервиса или на текущий хост.',
  },

  // Структурированные данные
  'schema-present': {
    name: 'Наличие структурированных данных',
    description: 'Проверяет, есть ли на странице структурированные данные в формате JSON-LD или микроданные.',
  },
  'schema-valid': {
    name: 'Синтаксис JSON в разметке',
    description: 'Проверяет, что все скрипты JSON-LD содержат корректный JSON.',
  },
  'schema-type': {
    name: 'Тип структурированных данных',
    description: 'Проверяет наличие обязательного поля @type в структурированных данных JSON-LD.',
  },
  'schema-required-fields': {
    name: 'Обязательные поля разметки',
    description: 'Проверяет, что структурированные данные JSON-LD содержат обязательные для выбранного @type поля.',
  },
  'schema-article': {
    name: 'Разметка статьи Article',
    description: 'Проверяет обязательные и рекомендуемые поля в разметке Article, NewsArticle, BlogPosting, TechArticle и ScholarlyArticle.',
  },
  'schema-breadcrumb': {
    name: 'Разметка хлебных крошек',
    description: 'Проверяет наличие BreadcrumbList на внутренних страницах и корректность структуры itemListElement.',
  },
  'schema-faq': {
    name: 'Разметка вопросов и ответов',
    description: 'Проверяет структуру Question и Answer и обязательные поля в разметке FAQPage.',
  },
  'schema-local-business': {
    name: 'Разметка местной компании',
    description: 'Проверяет обязательные и рекомендуемые поля разметки LocalBusiness, Restaurant, Store и других типов местных компаний.',
  },
  'schema-organization': {
    name: 'Разметка организации Organization',
    description: 'Проверяет, подходит ли разметка Organization для панели знаний о бренде.',
  },
  'schema-product': {
    name: 'Разметка товара Product',
    description: 'Проверяет, содержит ли разметка Product поля для расширенных результатов с товарами.',
  },
  'schema-review': {
    name: 'Разметка отзывов и оценок',
    description: 'Проверяет разметку Review и AggregateRating для показа оценок в виде звёзд.',
  },
  'schema-video': {
    name: 'Разметка видео VideoObject',
    description: 'Проверяет разметку VideoObject для расширенных результатов поиска с видео.',
  },
  'schema-website-search': {
    name: 'Разметка поиска по сайту',
    description: 'Проверяет разметку WebSite для показа поля поиска по сайту рядом с быстрыми ссылками.',
  },
  'schema-entity-id': {
    name: 'Идентификатор сущности @id',
    description: 'Проверяет, задан ли абсолютный @id у сущностей Organization, WebSite, Person и Business.',
  },
  'schema-rating-scope': {
    name: 'Уместность разметки AggregateRating',
    description: 'Проверяет, что AggregateRating размещён вне юридических страниц и страниц аккаунта, а ratingValue виден в тексте.',
  },
  'schema-entity-conflict': {
    name: 'Расхождения в данных сущности',
    description: 'Проверяет, указаны ли для одного абсолютного @id разные логотипы или номера телефонов.',
  },
  'schema-entity-dangling': {
    name: 'Ссылки на необъявленные сущности',
    description: 'Проверяет, объявлены ли абсолютные @id из полей publisher, author и isPartOf на просканированных страницах.',
  },
  'schema-entity-type-drift': {
    name: 'Единый тип сущности',
    description: 'Проверяет, совпадает ли @type для одного абсолютного @id на всех просканированных страницах.',
  },
  'schema-entity-split': {
    name: 'Несколько идентификаторов одной сущности',
    description: 'Проверяет, не указаны ли два абсолютных @id для одного имени организации или человека.',
  },

  // Социальные сети
  'social-og-title': {
    name: 'Заголовок Open Graph',
    description: 'Проверяет, есть ли в документе тег <meta property="og:title">.',
  },
  'social-og-description': {
    name: 'Описание Open Graph',
    description: 'Проверяет, есть ли в документе тег <meta property="og:description">.',
  },
  'social-og-image': {
    name: 'Изображение Open Graph',
    description: 'Проверяет, есть ли тег <meta property="og:image"> с корректным URL.',
  },
  'social-og-image-size': {
    name: 'Размер изображения Open Graph',
    description: 'Проверяет, совпадают ли og:image:width и og:image:height с фактическим размером og:image.',
  },
  'social-twitter-card': {
    name: 'Карточка для Twitter',
    description: 'Проверяет, есть ли тег <meta name="twitter:card"> с допустимым типом карточки.',
  },
  'social-og-url': {
    name: 'URL в Open Graph',
    description: 'Проверяет, есть ли тег <meta property="og:url"> с корректным URL.',
  },
  'social-og-url-canonical': {
    name: 'Совпадение og:url и canonical',
    description: 'Проверяет, совпадает ли og:url с URL в canonical, чтобы сигналы для поисковых систем были согласованы.',
  },
  'social-share-buttons': {
    name: 'Кнопки публикации в соцсетях',
    description: 'Ищет кнопки публикации в соцсетях на страницах статей и других материалов.',
  },
  'social-profiles': {
    name: 'Ссылки на профили в соцсетях',
    description: 'Ищет ссылки на профили в соцсетях в шапке, подвале или структурированных данных.',
  },
  'social-og-image-reachable': {
    name: 'Доступность изображения для соцсетей',
    description: 'Проверяет, загружаются ли og:image и twitter:image, являются ли они изображениями, весят ли меньше 5 MB и достаточно ли велики.',
  },
  'social-meta-multiple': {
    name: 'Повторяющиеся метатеги соцсетей',
    description: 'Проверяет, задано ли у каждого свойства og:* и twitter:* одно значение, кроме массивов вроде og:image.',
  },
  'social-twitter-attribute': {
    name: 'Атрибут метатегов Twitter',
    description: 'Проверяет, объявлены ли теги twitter:* через name=, как требует разметка карточки.',
  },
  'social-duplicate-og': {
    name: 'Уникальность метатегов Open Graph',
    description: 'Проверяет, есть ли такие же og:title и og:description на других просканированных страницах.',
  },

  // Содержимое страницы
  'content-word-count': {
    name: 'Объём основного текста',
    description: 'Считает слова в основном тексте и отмечает страницы, на которых текста мало.',
  },
  'content-reading-level': {
    name: 'Читаемость основного текста',
    description: 'Оценивает читаемость текста по шкале Флеша — Кинкейда.',
  },
  'content-keyword-stuffing': {
    name: 'Избыток ключевых слов',
    description: 'Отмечает текст, в котором один термин повторяется гораздо чаще, чем при естественном изложении.',
  },
  'content-article-links': {
    name: 'Плотность ссылок в статье',
    description: 'Проверяет, достаточно ли в статье ссылок на связанные внутренние и внешние страницы с учётом её длины.',
  },
  'content-broken-html': {
    name: 'Ошибки структуры HTML',
    description: 'Ищет ошибки в структуре HTML.',
  },
  'content-meta-in-body': {
    name: 'Метатеги в разделе body',
    description: 'Отмечает элементы <meta> внутри <body>, где они не действуют.',
  },
  'content-mime-type': {
    name: 'Корректность типа MIME',
    description: 'Проверяет, верно ли указаны тип MIME и кодировка в заголовке Content-Type.',
  },
  'content-duplicate-description': {
    name: 'Повторяющиеся метатеги description',
    description: 'Проверяет, есть ли такой же метатег description на других просканированных страницах.',
  },
  'content-heading-hierarchy': {
    name: 'Иерархия заголовков страницы',
    description: 'Проверяет, идут ли заголовки по порядку (h1, h2, h3) без пропуска уровней.',
  },
  'content-heading-length': {
    name: 'Длина текста заголовков',
    description: 'Проверяет, укладывается ли длина заголовков в диапазон от 10 до 70 символов.',
  },
  'content-heading-unique': {
    name: 'Уникальность текста заголовков',
    description: 'Проверяет, не повторяется ли текст заголовков в пределах документа.',
  },
  'content-text-html-ratio': {
    name: 'Доля текста в HTML',
    description: 'Сравнивает объём видимого текста с общим объёмом HTML.',
  },
  'content-title-same-as-h1': {
    name: 'Совпадение title и H1',
    description: 'Проверяет, совпадают ли title и H1 там, где можно использовать разные ключевые слова.',
  },
  'content-title-same-as-description': {
    name: 'Совпадение title и description',
    description: 'Проверяет, совпадает ли текст в title и метатеге description.',
  },
  'content-title-pixel-width': {
    name: 'Ширина title в пикселях',
    description: 'Оценивает ширину title в пикселях, чтобы определить, обрежется ли он в поисковой выдаче.',
  },
  'content-description-pixel-width': {
    name: 'Ширина description в пикселях',
    description: 'Оценивает ширину метатега description в пикселях, чтобы определить, обрежется ли он в поисковой выдаче.',
  },
  'content-duplicate-exact': {
    name: 'Полные дубли содержимого',
    description: 'Сравнивает хеши содержимого просканированных страниц, чтобы найти полные совпадения.',
  },
  'content-duplicate-near': {
    name: 'Почти одинаковое содержимое',
    description: 'Выявляет почти одинаковое содержимое на просканированных страницах, сравнивая последовательности из трёх слов (триграммы).',
  },
  'content-duplicate-h1': {
    name: 'Повторяющиеся H1 на страницах',
    description: 'Ищет страницы, где текст h1 совпадает с текстом h1 другой просканированной страницы.',
  },
  'content-mojibake': {
    name: 'Искажённые символы в тексте',
    description: 'Ищет в видимом тексте участки, где байты UTF-8 декодировали как Latin-1 или Windows-1252.',
  },
  'content-unrendered-markup': {
    name: 'Видимая разметка Markdown',
    description: 'Ищет в видимом тексте разметку Markdown, которую вывели без преобразования.',
  },
  'content-placeholder-text': {
    name: 'Заглушки в видимом тексте',
    description: 'Ищет в видимом тексте необработанный синтаксис шаблонов и заметки TODO или FIXME.',
  },
  'content-stale-copyright': {
    name: 'Устаревший год авторских прав',
    description: 'Предупреждает, если год в уведомлении об авторских правах в подвале не обновили.',
  },
  'content-date-agreement': {
    name: 'Согласованность дат публикации',
    description: 'Проверяет, совпадают ли datePublished в разметке, значения видимых элементов time и год в URL.',
  },
  'content-hidden-text': {
    name: 'Скрытый текст страницы',
    description: 'Ищет длинный текст, скрытый встроенными стилями, исключая навигацию, диалоги и текст для программ чтения с экрана.',
  },
  'content-thin-vs-site': {
    name: 'Короткий текст для сайта',
    description: 'Проверяет, не намного ли короче страница, чем типичная страница того же вида по медиане длины.',
  },
  'content-title-pattern': {
    name: 'Общий шаблон title',
    description: 'Проверяет, используется ли в title та же концовка, что и на большинстве страниц сайта.',
  },

  // Доступность
  'a11y-aria-labels': {
    name: 'Названия элементов для доступности',
    description: 'Проверяет, есть ли у кнопок, ссылок и других элементов управления названия, которые распознают вспомогательные технологии.',
  },
  'a11y-color-contrast': {
    name: 'Контраст текста и фона',
    description: 'Ищет возможные проблемы с контрастностью цвета.',
  },
  'a11y-focus-visible': {
    name: 'Видимый фокус клавиатуры',
    description: 'Находит CSS, который убирает или скрывает обводку фокуса при навигации с клавиатуры.',
  },
  'a11y-form-labels': {
    name: 'Подписи полей формы',
    description: 'Проверяет, есть ли у каждого элемента формы подпись помимо текста подсказки.',
  },
  'a11y-heading-order': {
    name: 'Порядок уровней заголовков',
    description: 'Проверяет, не пропущены ли уровни заголовков.',
  },
  'a11y-landmark-regions': {
    name: 'Ориентиры структуры страницы',
    description: 'Проверяет наличие ориентиров страницы (main, nav, header, footer).',
  },
  'a11y-link-text': {
    name: 'Понятное назначение ссылки',
    description: 'Проверяет, ясно ли из текста ссылки, куда она ведёт.',
  },
  'a11y-skip-link': {
    name: 'Ссылка к основному содержимому',
    description: 'Проверяет, есть ли ссылка, по которой пользователи клавиатуры могут сразу перейти к основному содержимому.',
  },
  'a11y-table-headers': {
    name: 'Заголовки ячеек таблицы',
    description: 'Проверяет, обозначены ли ячейки заголовков таблиц данных тегом <th> с атрибутом scope.',
  },
  'a11y-touch-targets': {
    name: 'Размер областей касания',
    description: 'Ищет в CSS признаки того, что области касания меньше рекомендованных размеров.',
  },
  'a11y-video-captions': {
    name: 'Субтитры для видео',
    description: 'Проверяет, есть ли у каждого видео дорожка субтитров или расшифровка.',
  },
  'a11y-zoom-disabled': {
    name: 'Доступность масштабирования страницы',
    description: 'Ищет настройку viewport, которая мешает пользователям увеличивать масштаб.',
  },
  'a11y-iframe-title': {
    name: 'Названия встроенных фреймов',
    description: 'Проверяет, есть ли атрибут title у элементов <iframe> и <frame>.',
  },
  'a11y-object-alt': {
    name: 'Текстовая альтернатива для object',
    description: 'Проверяет, есть ли текстовая альтернатива у элементов <object>.',
  },
  'a11y-empty-heading': {
    name: 'Содержимое элементов заголовков',
    description: 'Проверяет, нет ли пустых или недоступных заголовков.',
  },
  'a11y-input-image-alt': {
    name: 'Текст alt для кнопок',
    description: 'Находит кнопки <input type="image"> без текста alt.',
  },
  'a11y-main-landmark': {
    name: 'Единственный ориентир main',
    description: 'Проверяет, что на странице ровно один ориентир <main> или role="main".',
  },
  'a11y-list-structure': {
    name: 'Структура элементов списков',
    description: 'Проверяет, состоят ли списки только из элементов списка и находятся ли эти элементы внутри списков.',
  },
  'a11y-duplicate-id': {
    name: 'Уникальность идентификаторов элементов',
    description: 'Проверяет, нет ли повторяющихся ID, из-за которых ломаются ссылки из ARIA и связи с подписями полей.',
  },
  'a11y-tabindex-positive': {
    name: 'Положительные значения tabindex',
    description: 'Проверяет, нет ли элементов с tabindex больше 0.',
  },
  'a11y-accesskey-unique': {
    name: 'Уникальность клавиш доступа',
    description: 'Проверяет, что одно и то же значение accesskey не назначено нескольким элементам.',
  },
  'a11y-form-multiple-labels': {
    name: 'Одна подпись на поле',
    description: 'Проверяет, не связано ли поле формы сразу с несколькими элементами <label>.',
  },
  'a11y-aria-valid': {
    name: 'Корректность ролей и атрибутов ARIA',
    description: 'Проверяет, существуют ли заданные роли ARIA и правильно ли записаны имена атрибутов aria-*.',
  },
  'a11y-aria-hidden-focusable': {
    name: 'Скрытые элементы с фокусом',
    description: 'Проверяет, нет ли aria-hidden на body или на элементах с потомками, которые могут получить фокус.',
  },
  'a11y-svg-img-alt': {
    name: 'Доступные названия изображений SVG',
    description: 'Проверяет, есть ли доступное имя у SVG с ролью img.',
  },
  'a11y-presentation-role-conflict': {
    name: 'Конфликт ролей представления',
    description: 'Проверяет, не отменяют ли атрибуты ARIA или возможность получить фокус действие role="none"/"presentation".',
  },
  'a11y-valid-lang-element': {
    name: 'Языковые теги элементов',
    description: 'Проверяет, соответствуют ли теги в атрибутах lang стандарту BCP 47.',
  },
  'a11y-redundant-alt': {
    name: 'Избыточный текст alt',
    description: 'Проверяет, не повторяет ли alt изображения текст соседней ссылки или подписи.',
  },
  'a11y-table-caption': {
    name: 'Названия таблиц данных',
    description: 'Проверяет, используется ли для названия таблицы данных <caption> вместо объединённой ячейки.',
  },
  'a11y-identical-links-purpose': {
    name: 'Одинаковый текст разных ссылок',
    description: 'Проверяет, ведут ли ссылки с одинаковым текстом по одному адресу.',
  },
  'a11y-label-name-mismatch': {
    name: 'Совпадение доступной и видимой подписи',
    description: 'Проверяет, включает ли aria-label видимый текст элемента.',
  },
  'a11y-button-name': {
    name: 'Доступные названия кнопок',
    description: 'Проверяет, есть ли доступное имя у кнопок и элементов с role=button.',
  },
  'a11y-autocomplete': {
    name: 'Значения атрибута autocomplete',
    description: 'Проверяет, заданы ли подходящие значения autocomplete у полей email и tel.',
  },
  'a11y-xml-lang-mismatch': {
    name: 'Совпадение lang и xml:lang',
    description: 'Проверяет, указан ли один и тот же язык в lang и xml:lang у элемента html.',
  },
  'a11y-aria-hidden-body': {
    name: 'Доступность документа для ARIA',
    description: 'Проверяет, не скрыты ли элементы html и body через aria-hidden.',
  },
  'a11y-aria-required': {
    name: 'Обязательные связи ролей ARIA',
    description: 'Проверяет обязательные родительские и дочерние роли для явно заданных ролей виджетов ARIA.',
  },
  'a11y-axe-names': {
    name: 'Доступные названия и подписи (axe)',
    description: 'Отмечает проблемы с именами и подписями элементов, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-landmarks': {
    name: 'Ориентиры страницы (axe)',
    description: 'Отмечает проблемы с ориентирами страницы, которые axe-core обнаруживает после отрисовки.',
  },
  'a11y-axe-keyboard': {
    name: 'Клавиатура и фокус (axe)',
    description: 'Отмечает проблемы с клавиатурой и фокусом, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-tables': {
    name: 'Доступность таблиц (axe)',
    description: 'Отмечает проблемы с таблицами, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-lists': {
    name: 'Доступность списков (axe)',
    description: 'Отмечает проблемы со списками, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-media': {
    name: 'Медиа и анимация (axe)',
    description: 'Отмечает проблемы с медиа и анимацией, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-frames': {
    name: 'Доступность фреймов (axe)',
    description: 'Отмечает проблемы с фреймами, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-aria': {
    name: 'Корректность ARIA (axe)',
    description: 'Отмечает ошибки ARIA, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-language': {
    name: 'Язык документа (axe)',
    description: 'Отмечает проблемы с языком документа, которые axe-core обнаруживает на отрисованной странице.',
  },
  'a11y-axe-other': {
    name: 'Другие проблемы доступности (axe)',
    description: 'Отмечает проблемы доступности, которые axe-core обнаруживает на отрисованной странице и которые не охвачены другими правилами.',
  },

  // Языковые и региональные версии
  'i18n-lang-attribute': {
    name: 'Язык страницы в lang',
    description: 'Проверяет, задан ли у элемента <html> корректный атрибут lang.',
  },
  'i18n-hreflang': {
    name: 'Разметка языковых версий hreflang',
    description: 'Проверяет наличие элементов link с hreflang для разных языков и регионов.',
  },
  'i18n-hreflang-return-links': {
    name: 'Обратные ссылки hreflang',
    description: 'Проверяет, содержит ли разметка hreflang ссылку на саму страницу.',
  },
  'i18n-hreflang-to-noindex': {
    name: 'Конфликт hreflang и noindex',
    description: 'Проверяет, указаны ли на странице одновременно ссылки hreflang и директива noindex.',
  },
  'i18n-hreflang-to-non-canonical': {
    name: 'Hreflang на неканонический URL',
    description: 'Проверяет, указывает ли hreflang на неканонические URL.',
  },
  'i18n-hreflang-to-broken': {
    name: 'Битые ссылки hreflang',
    description: 'Ищет некорректные или явно нерабочие URL в hreflang.',
  },
  'i18n-hreflang-to-redirect': {
    name: 'Hreflang на перенаправление',
    description: 'Проверяет, могут ли URL в hreflang вызывать перенаправление, например при использовании HTTP на сайте с HTTPS.',
  },
  'i18n-hreflang-conflicting': {
    name: 'Конфликт значений hreflang',
    description: 'Ищет случаи, когда один код языка указан для нескольких URL, один URL размечен несколькими кодами или у ссылки на текущую страницу несколько кодов.',
  },
  'i18n-hreflang-relative-url': {
    name: 'Относительные URL в hreflang',
    description: 'Проверяет, что в hreflang указаны абсолютные URL.',
  },
  'i18n-hreflang-x-default': {
    name: 'Совпадение hreflang и x-default',
    description: 'Сообщает, когда одна из языковых версий hreflang указывает на тот же URL, что и x-default.',
  },
  'i18n-hreflang-lang-mismatch': {
    name: 'Несовпадение lang и hreflang',
    description: 'Проверяет, совпадает ли lang страницы с кодом языка в её ссылке hreflang на саму себя.',
  },
  'i18n-hreflang-multiple-methods': {
    name: 'Несколько способов задать hreflang',
    description: 'Проверяет, указан ли hreflang одновременно в HTML-тегах link и HTTP-заголовках.',
  },
  'i18n-hreflang-incoming-invalid': {
    name: 'Некорректный входящий hreflang',
    description: 'Проверяет коды языка и региона в hreflang, которые ведут на этот URL с других просканированных страниц.',
  },

  // Сканирование и индексация
  'crawl-schema-noindex-conflict': {
    name: 'Конфликт разметки и noindex',
    description: 'Отмечает страницы, на которых есть разметка для расширенных результатов поиска и одновременно установлен noindex.',
  },
  'crawl-pagination-canonical': {
    name: 'Canonical страниц пагинации',
    description: 'Проверяет, указывает ли canonical каждой страницы пагинации на неё саму.',
  },
  'crawl-sitemap-domain': {
    name: 'Домен адресов в sitemap',
    description: 'Отмечает записи sitemap, где хост отличается от хоста проверяемого сайта.',
  },
  'crawl-noindex-in-sitemap': {
    name: 'Страница с noindex в sitemap',
    description: 'Отмечает страницы с noindex, которые всё ещё указаны в sitemap.',
  },
  'crawl-indexability-conflict': {
    name: 'Конфликт директив индексации',
    description: 'Выявляет конфликты между директивами в robots.txt и noindex.',
  },
  'crawl-canonical-redirect': {
    name: 'Перенаправление по URL canonical',
    description: 'Проверяет, вызывают ли URL из canonical перенаправления.',
  },
  'crawl-sitemap-url-limit': {
    name: 'Лимит адресов в sitemap',
    description: 'Проверяет, не превышает ли sitemap лимит в 50,000 URL на файл.',
  },
  'crawl-sitemap-size-limit': {
    name: 'Лимит размера файла sitemap',
    description: 'Проверяет, не превышает ли размер несжатого sitemap лимит в 50 MB.',
  },
  'crawl-sitemap-duplicate-urls': {
    name: 'Повторяющиеся URL в sitemap',
    description: 'Ищет повторяющиеся URL в sitemap.',
  },
  'crawl-sitemap-orphan-urls': {
    name: 'URL без ссылок в sitemap',
    description: 'Проверяет, есть ли в sitemap URL, на которые не ссылается ни одна просканированная страница.',
  },
  'crawl-blocked-resources': {
    name: 'Заблокированные ресурсы страницы',
    description: 'Проверяет, блокирует ли robots.txt доступ к важным ресурсам CSS/JS.',
  },
  'crawl-blocked-images': {
    name: 'Заблокированные адреса изображений',
    description: 'Отмечает URL изображений, доступ к которым запрещён в robots.txt.',
  },
  'crawl-crawl-delay': {
    name: 'Задержка сканирования в robots.txt',
    description: 'Проверяет, есть ли в robots.txt директива Crawl-delay.',
  },
  'crawl-sitemap-in-robotstxt': {
    name: 'Ссылка на sitemap в robots.txt',
    description: 'Проверяет, указан ли sitemap в robots.txt.',
  },
  'crawl-pagination-broken': {
    name: 'Битые ссылки пагинации',
    description: 'Проверяет корректность URL в ссылках пагинации rel="next"/"prev".',
  },
  'crawl-pagination-loop': {
    name: 'Цикл в ссылках пагинации',
    description: 'Проверяет, образует ли пагинация цикл из-за ссылки обратно на текущую страницу.',
  },
  'crawl-pagination-sequence': {
    name: 'Порядок ссылок пагинации',
    description: 'Проверяет, соблюдён ли порядок пагинации и ведут ли next и prev на разные страницы.',
  },
  'crawl-pagination-noindex': {
    name: 'Noindex на страницах пагинации',
    description: 'Проверяет, есть ли директива noindex на страницах пагинации.',
  },
  'crawl-pagination-orphaned': {
    name: 'Отсутствующие связи страниц пагинации',
    description: 'Проверяет, есть ли у страниц пагинации связи rel="next"/"prev".',
  },
  'crawl-sitemap-lastmod': {
    name: 'Корректность lastmod в sitemap',
    description: 'Ищет некорректные даты, даты в будущем и массово повторяющиеся значения в элементах <lastmod> файла sitemap.',
  },
  'crawl-pagination-isolated': {
    name: 'Страницы пагинации без входящих ссылок',
    description: 'Проверяет, есть ли хотя бы одна входящая внутренняя ссылка на каждый URL пагинации.',
  },
  'crawl-sitemap-non-200': {
    name: 'URL без статуса 200 в sitemap',
    description: 'Сопоставляет URL из sitemap с кодами ответов при сканировании, отмечая ошибки 4xx/5xx, перенаправления 3xx и превышение времени ожидания.',
  },
  'crawl-sitemap-non-canonical': {
    name: 'Неканонические URL в sitemap',
    description: 'Отмечает URL в sitemap, у которых canonical указывает на другой адрес.',
  },
  'crawl-sitemap-disallowed': {
    name: 'Заблокированные URL в sitemap',
    description: 'Отмечает URL из sitemap, доступ к которым запрещён в robots.txt.',
  },
  'crawl-sitemap-cross-duplicates': {
    name: 'Одинаковые URL в нескольких sitemap',
    description: 'Отмечает URL страниц, указанные сразу в нескольких файлах sitemap.',
  },
  'crawl-canonical-to-noindex': {
    name: 'Canonical на страницу с noindex',
    description: 'Проверяет, есть ли у целевой страницы canonical директива noindex.',
  },
  'crawl-canonical-to-disallowed': {
    name: 'Canonical на заблокированный URL',
    description: 'Проверяет, запрещён ли доступ к целевому URL из canonical в robots.txt.',
  },
  'crawl-canonical-chain': {
    name: 'Цепочка ссылок canonical',
    description: 'Проверяет, указывает ли canonical целевой страницы на другой URL.',
  },
  'crawl-canonical-loop': {
    name: 'Замкнутая цепочка canonical',
    description: 'Проверяет, ведут ли переходы по canonical обратно на уже посещённый URL.',
  },
  'crawl-hreflang-to-noindex': {
    name: 'Hreflang на страницы с noindex',
    description: 'Проверяет, ведут ли исходящие ссылки hreflang на URL с noindex.',
  },
  'crawl-hreflang-to-disallowed': {
    name: 'Hreflang на заблокированные URL',
    description: 'Проверяет, ведут ли исходящие ссылки hreflang на URL, запрещённые в robots.txt.',
  },
  'crawl-hreflang-disallowed-target': {
    name: 'Входящий hreflang на заблокированный URL',
    description: 'Проверяет, ведёт ли hreflang с другой страницы на эту страницу, запрещённую в robots.txt.',
  },
  'crawl-hreflang-incoming-conflict': {
    name: 'Конфликт входящих ссылок hreflang',
    description: 'Проверяет, используют ли другие просканированные страницы противоречащие друг другу коды hreflang для этого URL.',
  },
  'crawl-hreflang-reciprocity': {
    name: 'Взаимность ссылок hreflang',
    description: 'Проверяет, есть ли на просканированных целевых страницах hreflang ответные ссылки на текущую страницу.',
  },
  'crawl-isolated-url': {
    name: 'Страница без обычных ссылок',
    description: 'Проверяет, можно ли попасть на страницу по обычным внутренним ссылкам помимо canonical, перенаправлений или sitemap.',
  },
  'crawl-canonical-form-drift': {
    name: 'Единый формат URL в canonical',
    description: 'Проверяет согласованность www, протокола и завершающего слеша у просканированных canonical.',
  },
  'crawl-sitemap-date-drift': {
    name: 'Расхождение дат обновления в sitemap',
    description: 'Проверяет, совпадает ли день в lastmod файла sitemap с днём в dateModified разметки.',
  },
  'crawl-pdf-size': {
    name: 'Размер файлов PDF по ссылкам',
    description: 'Проверяет, не превышает ли размер PDF по ссылкам 10 MB.',
  },
  'crawl-indexable-not-in-sitemap': {
    name: 'Индексируемая страница вне sitemap',
    description: 'Проверяет, указаны ли просканированные страницы, открытые для индексации, в XML sitemap.',
  },

  // Структура URL
  'url-slug-keywords': {
    name: 'Ключевые слова в пути URL',
    description: 'Проверяет, содержит ли имя страницы в URL ключевые слова по теме вместо общих идентификаторов.',
  },
  'url-stop-words': {
    name: 'Стоп-слова в URL',
    description: 'Отмечает распространённые стоп-слова (a, an, the, of и другие), которые удлиняют адрес без пользы для SEO.',
  },
  'url-uppercase': {
    name: 'Заглавные буквы в URL',
    description: 'Ищет заглавные буквы в пути URL, которые могут привести к дублям содержимого.',
  },
  'url-underscores': {
    name: 'Подчёркивания в пути URL',
    description: 'Проверяет, используются ли в пути URL подчёркивания вместо дефисов, которые Google рекомендует как разделители слов.',
  },
  'url-double-slash': {
    name: 'Двойные слеши в URL',
    description: 'Ищет двойные слеши в пути URL, которые указывают на некорректный адрес.',
  },
  'url-spaces': {
    name: 'Пробелы в URL',
    description: 'Ищет в URL обычные пробелы или пробелы, закодированные как %20.',
  },
  'url-non-ascii': {
    name: 'Символы вне ASCII в URL',
    description: 'Ищет в пути URL символы вне ASCII, которые могут вызвать проблемы с кодировкой.',
  },
  'url-length': {
    name: 'Длина полного URL',
    description: 'Проверяет, укладывается ли длина полного URL в рекомендуемые для SEO пределы.',
  },
  'url-repetitive-path': {
    name: 'Повторяющиеся части пути URL',
    description: 'Ищет повторяющиеся подряд сегменты пути URL (например, /blog/blog/).',
  },
  'url-parameters': {
    name: 'Избыток параметров URL',
    description: 'Ищет избыточные параметры запроса, которые могут расходовать лимит сканирования и распылять вес страницы.',
  },
  'url-session-ids': {
    name: 'Идентификаторы сеансов в URL',
    description: 'Ищет идентификаторы сеансов в URL, которые создают дубли содержимого и проблемы с безопасностью.',
  },
  'url-tracking-params': {
    name: 'Параметры отслеживания в URL',
    description: 'Ищет распространённые параметры отслеживания (UTM, gclid, fbclid и другие), которые создают дубли URL.',
  },
  'url-internal-search': {
    name: 'Адреса внутреннего поиска',
    description: 'Проверяет, похож ли URL на страницу внутреннего поиска, которую нужно закрыть с помощью noindex.',
  },
  'url-http-https-duplicate': {
    name: 'Несовпадение HTTP/HTTPS в canonical',
    description: 'Проверяет, отличается ли протокол URL в canonical от протокола страницы (HTTP или HTTPS).',
  },

  // Мобильная версия
  'mobile-font-size': {
    name: 'Размер шрифта на телефонах',
    description: 'Проверяет, удобно ли читать текст с заданными размерами шрифта на мобильных устройствах.',
  },
  'mobile-horizontal-scroll': {
    name: 'Горизонтальная прокрутка на телефонах',
    description: 'Находит элементы, которые могут выходить за боковые края экрана телефона.',
  },
  'mobile-interstitials': {
    name: 'Навязчивые окна на телефонах',
    description: 'Выявляет потенциально навязчивые всплывающие окна и перекрывающие слои на мобильных устройствах.',
  },
  'mobile-viewport-width': {
    name: 'Фиксированная ширина в viewport',
    description: 'Проверяет, задана ли в метатеге viewport фиксированная ширина вместо device-width.',
  },
  'mobile-multiple-viewports': {
    name: 'Несколько метатегов viewport',
    description: 'Проверяет, нет ли нескольких метатегов viewport, из-за которых настройки могут толковаться неоднозначно.',
  },
  'mobile-image-maps': {
    name: 'Карты ссылок на изображениях',
    description: 'Ищет карты изображений <map>/<area>, которыми неудобно пользоваться на мобильных устройствах.',
  },
  'mobile-viewport-content': {
    name: 'Параметры метатега viewport',
    description: 'Проверяет директивы width, initial-scale и minimum-scale в метатеге viewport.',
  },
  'mobile-parity-content': {
    name: 'Совпадение содержимого на устройствах',
    description: 'Проверяет, показан ли на мобильной версии тот же объём основного содержимого, что и на настольной.',
  },
  'mobile-parity-title': {
    name: 'Совпадение title и description на устройствах',
    description: 'Проверяет, совпадают ли title и метатег description на мобильной и настольной версиях.',
  },
  'mobile-parity-canonical': {
    name: 'Совпадение canonical на устройствах',
    description: 'Проверяет, совпадает ли URL в canonical на мобильной и настольной версиях.',
  },
  'mobile-parity-structured-data': {
    name: 'Совпадение разметки на устройствах',
    description: 'Проверяет, есть ли разметка JSON-LD на мобильной и настольной версиях.',
  },
  'mobile-parity-links': {
    name: 'Совпадение ссылок на устройствах',
    description: 'Проверяет, сопоставимо ли число внутренних ссылок в мобильной и настольной версиях.',
  },
  'mobile-separate-urls': {
    name: 'Отдельный URL мобильной версии',
    description: 'Проверяет, открывается ли заявленная мобильная версия по отдельному URL и указывает ли её canonical на текущую страницу.',
  },

  // Юридические требования
  'legal-cookie-consent': {
    name: 'Согласие на файлы cookie',
    description: 'Проверяет, есть ли механизм получения согласия на использование файлов cookie.',
  },

  // E-E-A-T
  'eeat-about-page': {
    name: 'Страница о компании',
    description: 'Ищет ссылку на страницу о сайте или компании.',
  },
  'eeat-affiliate-disclosure': {
    name: 'Пометка партнёрских ссылок',
    description: 'Проверяет, отмечены ли партнёрские или рекламные ссылки на странице.',
  },
  'eeat-author-byline': {
    name: 'Указание автора статьи',
    description: 'Проверяет, указано ли в статьях имя автора.',
  },
  'eeat-author-expertise': {
    name: 'Квалификация автора материала',
    description: 'Ищет сведения о квалификации и биографии автора, а также ссылки на профили, подтверждающие его компетентность.',
  },
  'eeat-citations': {
    name: 'Ссылки на источники',
    description: 'Проверяет, есть ли в материалах ссылки на авторитетные источники, подтверждающие утверждения.',
  },
  'eeat-contact-page': {
    name: 'Страница с контактами',
    description: 'Ищет страницу контактов, где указано несколько способов связи.',
  },
  'eeat-content-dates': {
    name: 'Даты публикации и обновления',
    description: 'Проверяет, указано ли, когда материал опубликовали и обновили в последний раз.',
  },
  'eeat-disclaimers': {
    name: 'Оговорки для материалов YMYL',
    description: 'Проверяет, есть ли оговорка в материалах YMYL, например в советах о здоровье или финансах.',
  },
  'eeat-editorial-policy': {
    name: 'Публикация редакционной политики',
    description: 'Ищет опубликованную страницу с редакционной политикой или требованиями к материалам.',
  },
  'eeat-physical-address': {
    name: 'Физический адрес компании',
    description: 'Ищет адрес с улицей и номером дома в тексте или разметке страницы.',
  },
  'eeat-privacy-policy': {
    name: 'Ссылка на политику конфиденциальности',
    description: 'Проверяет, есть ли ссылка на политику конфиденциальности, предпочтительно в подвале сайта.',
  },
  'eeat-terms-of-service': {
    name: 'Ссылка на условия использования',
    description: 'Проверяет, есть ли ссылка на страницу условий использования.',
  },
  'eeat-trust-signals': {
    name: 'Признаки доверия к сайту',
    description: 'Ищет отзывы, сертификаты, значки безопасности и упоминания в СМИ.',
  },
  'eeat-ymyl-detection': {
    name: 'Материалы на темы YMYL',
    description: 'Определяет, затрагивает ли страница темы YMYL, такие как здоровье, финансы, право или безопасность.',
  },
  'eeat-geo-meta': {
    name: 'Географические метатеги страницы',
    description: 'Проверяет, есть ли географический метатег на странице с разметкой местной компании.',
  },
  'eeat-nap-consistency': {
    name: 'Согласованность контактов организации',
    description: 'Проверяет, указаны ли одинаковый номер телефона и почтовый адрес для одного названия организации на всех просканированных страницах.',
  },

  // Перенаправления
  'redirect-meta-refresh': {
    name: 'Перенаправление через meta refresh',
    description: 'Ищет перенаправления через meta refresh, которые стоит заменить серверным ответом 301.',
  },
  'redirect-javascript': {
    name: 'Перенаправления через JavaScript',
    description: 'Ищет перенаправления через JavaScript, по которым поисковые роботы могут не перейти.',
  },
  'redirect-http-refresh': {
    name: 'Перенаправление через заголовок Refresh',
    description: 'Ищет нестандартный HTTP-заголовок Refresh, вместо которого следует использовать коды 301/302.',
  },
  'redirect-loop': {
    name: 'Циклы HTTP-перенаправлений',
    description: 'Проверяет, есть ли циклы в цепочке перенаправлений.',
  },
  'redirect-type': {
    name: 'Код ответа при перенаправлении',
    description: 'Проверяет, используются ли для SEO постоянные перенаправления с кодами 301/308.',
  },
  'redirect-broken': {
    name: 'Битые перенаправления страниц',
    description: 'Проверяет, завершается ли цепочка перенаправлений на доступной странице с кодом 200.',
  },
  'redirect-resource': {
    name: 'Ресурсы HTTP с перенаправлением',
    description: 'Проверяет, ссылаются ли страницы HTTPS на ресурсы HTTP, которые запускают цепочки перенаправлений.',
  },
  'redirect-case-normalization': {
    name: 'Единый регистр в URL',
    description: 'Проверяет, приведены ли URL к единому регистру, чтобы избежать дублей содержимого.',
  },
  'redirect-resource-broken': {
    name: 'Битые перенаправления ресурсов',
    description: 'Проверяет, завершаются ли перенаправления ресурсов страницы ответами с кодами 4xx или 5xx.',
  },
  'redirect-resource-loop': {
    name: 'Циклы перенаправлений ресурсов',
    description: 'Проверяет, нет ли у ресурсов страницы циклических перенаправлений.',
  },
  'redirect-resource-chain': {
    name: 'Цепочки перенаправлений ресурсов',
    description: 'Проверяет, ведут ли URL ресурсов страницы через несколько перенаправлений.',
  },

  // Видимость в системах ИИ
  'geo-semantic-html': {
    name: 'Семантическая разметка HTML',
    description: 'Проверяет, использует ли страница семантические элементы HTML5, помогающие системам ИИ понять структуру содержимого.',
  },
  'geo-content-structure': {
    name: 'Структура содержимого для ИИ',
    description: 'Проверяет, может ли ИИ извлекать содержимое по основной области, иерархии заголовков, абзацам и структурированным данным.',
  },
  'geo-ai-bot-access': {
    name: 'Доступ для роботов ИИ',
    description: 'Проверяет, блокирует ли robots.txt роботов поисковых систем с ИИ (OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended), и сообщает о блокировках роботов только для обучения, таких как GPTBot, без снижения оценки.',
  },
  'geo-llms-txt': {
    name: 'Ссылка на файл llms.txt',
    description: 'Проверяет, ссылается ли страница на llms.txt, новый формат, помогающий системам ИИ находить материалы сайта.',
  },
  'geo-schema-drift': {
    name: 'Соответствие разметки видимому тексту',
    description: 'Сравнивает структурированные данные JSON-LD с видимым содержимым страницы.',
  },
  'geo-content-signals': {
    name: 'Директива Content-Signal в robots.txt',
    description: 'Проверяет синтаксис Content-Signal в robots.txt и возможные противоречия с запретами для роботов, собирающих данные для обучения.',
  },
  'geo-noai-signals': {
    name: 'Директивы noai и noimageai',
    description: 'Сообщает о директивах noai и noimageai в метатегах robots и заголовке X-Robots-Tag.',
  },
  'geo-agents-md': {
    name: 'Наличие файла AGENTS.md',
    description: 'Проверяет, отдаёт ли сервер файл AGENTS.md вместо запасной страницы HTML.',
  },
  'geo-well-known': {
    name: 'Манифест агента в .well-known',
    description: 'Ищет манифест MCP или agent-card в каталоге .well-known.',
  },
  'geo-rsl-license': {
    name: 'Документ лицензии в robots.txt',
    description: 'Проверяет, ведёт ли URL из директивы License в robots.txt на документ с лицензией.',
  },
  'geo-markdown-response': {
    name: 'Главная страница в Markdown',
    description: 'Проверяет, может ли сервер отдавать корневую страницу в формате Markdown.',
  },
  'geo-markdown-page': {
    name: 'Версия страницы в Markdown',
    description: 'Проверяет, есть ли версия в Markdown у страницы за пределами корня сайта.',
  },
  'geo-pay-per-crawl': {
    name: 'Условия оплаты сканирования',
    description: 'Проверяет, содержит ли ответ HTTP 402 условия оплаты.',
  },

  // Проверка HTML
  'htmlval-missing-doctype': {
    name: 'Объявление типа документа DOCTYPE',
    description: 'Проверяет, начинается ли документ HTML с объявления <!DOCTYPE>.',
  },
  'htmlval-missing-charset': {
    name: 'Объявление кодировки страницы',
    description: 'Проверяет, есть ли в head документа <meta charset> или метатег Content-Type.',
  },
  'htmlval-invalid-head': {
    name: 'Допустимые элементы в head',
    description: 'Проверяет, содержит ли <head> только допустимые элементы метаданных.',
  },
  'htmlval-noscript-in-head': {
    name: 'Элемент noscript в head',
    description: 'Проверяет, что внутри <noscript> в разделе <head> есть только допустимые элементы (link, style, meta).',
  },
  'htmlval-multiple-heads': {
    name: 'Единственный элемент head',
    description: 'Проверяет, что в документе ровно один элемент <head>.',
  },
  'htmlval-size-limit': {
    name: 'Размер документа HTML',
    description: 'Проверяет, укладывается ли размер HTML-документа в разумные пределы.',
  },
  'htmlval-lorem-ipsum': {
    name: 'Текстовые заглушки в содержимом',
    description: 'Ищет в содержимом страницы lorem ipsum и другие текстовые заглушки.',
  },
  'htmlval-multiple-titles': {
    name: 'Единственный элемент title',
    description: 'Проверяет, что документ содержит не более одного элемента <title>.',
  },
  'htmlval-multiple-descriptions': {
    name: 'Единственный метатег description',
    description: 'Проверяет, что документ содержит не более одного элемента <meta name="description">.',
  },
  'htmlval-title-outside-head': {
    name: 'Элемент title внутри head',
    description: 'Проверяет, есть ли элементы <title> за пределами <head>.',
  },
  'htmlval-base-url': {
    name: 'Базовый URL страницы',
    description: 'Проверяет, что в документе не более одного элемента <base> с корректным href.',
  },
  'htmlval-body-structure': {
    name: 'Структура документа HTML',
    description: 'Ищет в исходном коде второй <body>, элемент <body> перед <html> и содержимое перед <head>.',
  },

  // Отрисовка и JavaScript
  'js-rendered-title': {
    name: 'Наличие title после отрисовки',
    description: 'Проверяет, есть ли тег <title> в DOM после выполнения JavaScript.',
  },
  'js-rendered-description': {
    name: 'Наличие description после отрисовки',
    description: 'Проверяет, есть ли метатег description в DOM после выполнения JavaScript.',
  },
  'js-rendered-h1': {
    name: 'Наличие H1 после отрисовки',
    description: 'Проверяет, есть ли заголовок H1 в DOM после выполнения JavaScript.',
  },
  'js-rendered-canonical': {
    name: 'Наличие canonical после отрисовки',
    description: 'Проверяет, есть ли тег canonical в DOM после выполнения JavaScript.',
  },
  'js-canonical-mismatch': {
    name: 'Расхождение canonical при отрисовке',
    description: 'Проверяет, различаются ли URL в canonical исходного HTML и DOM после отрисовки.',
  },
  'js-noindex-mismatch': {
    name: 'Изменение noindex и nofollow',
    description: 'Проверяет, меняются ли директивы noindex или nofollow между исходным HTML и DOM после отрисовки.',
  },
  'js-title-modified': {
    name: 'Изменение title через JavaScript',
    description: 'Проверяет, меняется ли title страницы после выполнения JavaScript.',
  },
  'js-description-modified': {
    name: 'Изменение description через JavaScript',
    description: 'Проверяет, меняется ли метатег description после выполнения JavaScript.',
  },
  'js-h1-modified': {
    name: 'Изменение H1 через JavaScript',
    description: 'Проверяет, меняется ли заголовок H1 после выполнения JavaScript.',
  },
  'js-rendered-content': {
    name: 'Зависимость содержимого от JavaScript',
    description: 'Проверяет, появляется ли значительная часть содержимого только после отрисовки через JavaScript.',
  },
  'js-rendered-links': {
    name: 'Зависимость ссылок от JavaScript',
    description: 'Проверяет, появляются ли важные ссылки только после отрисовки через JavaScript.',
  },
  'js-blocked-resources': {
    name: 'Заблокированные ресурсы JavaScript',
    description: 'Проверяет, может ли robots.txt блокировать доступ к ресурсам JavaScript.',
  },
  'js-ssr-check': {
    name: 'Отрисовка на стороне сервера',
    description: 'Проверяет, используется ли серверная отрисовка (SSR) или страница отрисовывается только в браузере.',
  },
  'js-console-errors': {
    name: 'Ошибки в консоли JavaScript',
    description: 'Сообщает о необработанных исключениях JavaScript и ошибках консоли, обнаруженных при отрисовке страницы.',
  },
  'js-failed-requests': {
    name: 'Неудачные запросы ресурсов',
    description: 'Сообщает о скриптах, таблицах стилей и других ресурсах, которые не загрузились при отрисовке.',
  },
  'js-document-write': {
    name: 'Использование метода document.write()',
    description: 'Проверяет, используют ли встроенные скрипты document.write().',
  },
  'js-ajax-crawling-scheme': {
    name: 'Устаревшая схема сканирования AJAX',
    description: 'Отмечает ссылки с #! и метатег fragment из схемы сканирования AJAX, которую Google больше не поддерживает.',
  },
};
