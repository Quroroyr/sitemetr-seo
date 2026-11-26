import type { AuditErrorCode } from '../../src/errors.js';
import { formatNumber } from './format.js';

const MESSAGES: Record<string, string> = {
  'Could not connect to the site': 'Не удалось подключиться к сайту',
  'domain does not resolve': 'Не удалось определить IP-адрес домена',
  'connection refused': 'Соединение отклонено',
  'no response': 'Нет ответа',
  'timed out': 'Истекло время ожидания',
  'private address': 'Частный IP-адрес',
  'Audit cancelled': 'Проверка отменена',
  'An audit is already running': 'Проверка уже запущена',
  'An audit is already running.': 'Проверка уже запущена.',
  'A "url" is required.': 'Укажите "url".',
  'The database is locked.': 'База данных занята другим процессом.',
  'Failed to fetch': 'Не удалось получить ответ от сервера',
  'The dashboard hit an unexpected error handling this request.': 'Веб-панель столкнулась с ошибкой при обработке запроса.',
  'The server log has the details.': 'Подробности в журнале сервера.',
  'This request carried no valid dashboard token.': 'Сессия веб-панели устарела. Обновите страницу.',
  'This request did not come from the local dashboard.': 'Запрос отправлен за пределами локальной веб-панели.',
  'The request URL could not be parsed.': 'Не удалось разобрать URL запроса.',
  'The request body is not valid JSON.': 'В теле запроса некорректный JSON.',
  'The request body must be a JSON object.': 'Тело запроса должно быть объектом JSON.',
  'It was already saved, or it is no longer retained.': 'Результат уже сохранён или больше недоступен.',
  'Run `sitemetr self doctor`.': 'Запустите `sitemetr self doctor`.',
};

const PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^Not a valid URL: (.+)$/, 'Некорректный URL — $1'],
  [/^Cannot audit a (.+) URL: only http and https are supported$/, 'Адреса с протоколом $1 не поддерживаются. Используйте http или https.'],
  [/^Could not resolve the hostname: (.+)$/s, 'Не удалось определить IP-адрес хоста. $1'],
  [/^Could not connect to the site \(([^)]+)\): (.+)$/s, 'Не удалось подключиться к сайту ($1). $2'],
  [/^The site's TLS certificate was rejected \(([^)]+)\)$/, 'Сертификат TLS сайта отклонён ($1).'],
  [/^The site did not respond in time: (.+)$/s, 'Сайт не ответил вовремя. $1'],
  [/^(.+) did not respond within (\d+) ms$/, '$1 не ответил за $2 мс'],
  [/^The browser could not be started: (.+)$/s, 'Не удалось запустить браузер. $1'],
  [/^The crawl of (.+) found no pages to audit$/, 'При обходе $1 не найдено страниц для проверки.'],
  [/^(.+) is not built on 1C-Bitrix, so the 1C-Bitrix checks have nothing to score$/, 'Сайт $1 не на 1С-Битрикс: проверкам Битрикса здесь нечего оценивать. Проверка не сохранена.'],
  [/^None of the selected checks \((.+)\) applies to (.+), so there is nothing to score$/, 'Выбранные разделы ($1) не подходят для $2: оценивать нечего. Проверка не сохранена.'],
  [/^The page returned HTTP (\d+)\.$/, 'Страница вернула HTTP $1.'],
  [/^The page returned HTTP (\d+) \(redirected to (.+)\)\.$/, 'После редиректа на $2 получен HTTP $1.'],
  [/^(.+) returned an empty response body, so there is nothing to audit$/, '$1 вернул пустой ответ. Проверять нечего.'],
  [/^(.+) returned (\S+), which is not an HTML page$/, '$1 вернул $2. Для проверки нужна HTML-страница.'],
  [/^(.+) returned no Content-Type and no HTML markup$/, 'В ответе $1 нет Content-Type и разметки HTML.'],
  [/^Audit (.+) was not found\.$/, 'Проверка $1 не найдена.'],
  [/^"(.+)" is not an audit id\.$/, 'Некорректный идентификатор проверки «$1».'],
  [/^"(.+)" is not an export format\.$/, 'Формат экспорта «$1» не поддерживается.'],
  [/^"(.+)" is not valid\.$/, 'Некорректное значение параметра «$1».'],
  [/^"(.+)" must be an integer between (\d+) and (\d+)\.$/, 'Укажите для «$1» целое число от $2 до $3.'],
  [/^An unsaved result for run (.+) was not found\.$/, 'Несохранённый результат проверки $1 не найден.'],
  [/^The result of run (.+) was not found\.$/, 'Результат проверки $1 не найден.'],
  [/^Run (.+) was not found\.$/, 'Запуск $1 не найден.'],
  [/^Config file not found: (.+)$/, 'Файл настроек не найден — $1'],
  [/^Saving failed again: (.+)$/s, 'Повторно сохранить проверку не удалось. $1'],
  [/^rate-limited \(HTTP (\d+)\)$/, 'Превышен лимит запросов (HTTP $1)'],
  [/^refused \(HTTP (\d+)\)$/, 'Запрос отклонён (HTTP $1)'],
];

export function localizeDiagnostic(message: string): string {
  const exact = Object.hasOwn(MESSAGES, message) ? MESSAGES[message] : undefined;
  if (exact !== undefined) return exact;
  for (const [pattern, translation] of PATTERNS) {
    if (pattern.test(message)) return message.replace(pattern, translation);
  }
  const limit = /^(.+?) (?:answered 503 Service Unavailable to all (\d+) requests|is limiting how fast Sitemetr can request pages \(HTTP (\d+) to all (\d+) requests)(?:; it last asked to wait (\d+) s)?[.)]/.exec(message);
  if (limit) {
    const status = limit[3] ?? '503';
    const requests = formatNumber(Number(limit[2] ?? limit[4]));
    const wait = limit[5] ? ` Сервер попросил подождать ${formatNumber(Number(limit[5]))} с.` : '';
    return `${limit[1]} вернул HTTP ${status} на все запросы (${requests}).${wait} Данные не сохранены.`;
  }
  return message.replace(/\bSitemetr\b/g, 'Сайтметр');
}

const HINTS: Partial<Record<AuditErrorCode | 'run-in-progress', string>> = {
  dns: 'Проверьте имя хоста и подключение к интернету.',
  unreachable: 'Проверьте URL, порт, доступность сайта, настройки брандмауэра и прокси.',
  tls: 'Проверьте срок действия сертификата HTTPS и соответствие имени хоста. Если сертификата нет, проверьте адрес с http://.',
  timeout: 'Попробуйте снова, увеличьте время ожидания или отключите обход сайта.',
  'non-html': 'Укажите URL HTML-страницы.',
  'http-error': 'Убедитесь, что URL доступен извне и возвращает HTTP 200.',
  'playwright-missing': 'Запустите `npx playwright install chromium` или отключите отрисовку в браузере.',
  'no-pages': 'Проверьте robots.txt, шаблоны включения и исключения и ссылки на стартовой странице.',
  'not-applicable': 'Добавьте другие разделы в проверку или запустите эти проверки на сайте, к которому они относятся.',
  config: 'Проверьте настройки командой `sitemetr config validate`.',
  'rate-limited': 'Попробуйте позже, снизьте число одновременных запросов до 1 или задайте паузу в crawler.per_host_delay_ms, например 2000.',
  'crawl-too-slow': 'Сократите число страниц, увеличьте лимит времени или отключите учёт Crawl-delay.',
  'private-address': 'Проверьте, что адрес доступен для проверки. В веб-панели и настольном приложении используйте локальный URL или адрес внутренней сети как стартовый.',
  'run-in-progress': 'Остановите текущую проверку или дождитесь её завершения.',
};

export function localizeRunHint(code: AuditErrorCode | string, hint: string | undefined): string | undefined {
  if (!hint) return undefined;
  if (/[А-Яа-яЁё]/.test(hint)) return hint;
  if (Object.hasOwn(HINTS, code)) return HINTS[code as keyof typeof HINTS];
  return localizeDiagnostic(hint);
}
