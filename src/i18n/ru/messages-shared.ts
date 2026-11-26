import type { MessagePattern, MessageTable } from '../index.js';

const requestReasons: readonly MessagePattern[] = [
  [/^external requests are off \(\[external_links\] enabled = false\)$/, 'внешние запросы отключены ([external_links] enabled = false)'],
  [/^rate-limited \(HTTP (\d+)\)$/, 'сервер ограничил частоту запросов (HTTP $1)'],
  [/^refused \(HTTP (\d+)\)$/, 'сервер отклонил запрос (HTTP $1)'],
  [/^(?:timeout|timed out)$/, 'истекло время ожидания'],
  [/^dns$/, 'ошибка DNS'],
  [/^(?:refused|connection refused)$/, 'сервер отклонил подключение'],
  [/^network$/, 'сетевая ошибка'],
  [/^(?:private-address|private address)$/, 'частный сетевой адрес'],
  [/^too-large$/, 'превышен допустимый размер ответа'],
  [/^no response$/, 'сервер не ответил'],
  [/^domain does not resolve$/, 'домен не разрешается'],
];

const comparisonReasons: readonly MessagePattern[] = [
  [/^not in the crawl records$/, 'страницы нет в результатах обхода'],
  [/^the page could not be fetched$/, 'не удалось загрузить страницу'],
  [/^the page returned HTTP (\d+)$/, 'страница вернула HTTP $1'],
  [/^blocked by robots\.txt$/, 'страница закрыта в robots.txt'],
  [/^canonicalised to (.*)$/s, 'canonical указывает на $1'],
  [/^a later page of a paginated series$/, 'страница находится в середине или конце серии с пагинацией'],
];

function translateReason(reason: string, patterns: readonly MessagePattern[]): string {
  for (const [pattern, replacement] of patterns) {
    if (typeof replacement === 'string' && pattern.exec(reason)?.[0] === reason) {
      return reason.replace(pattern, replacement);
    }
  }
  return reason;
}

/** Переводы сообщений, которые строят общие помощники (ключ '*'). */
export const MESSAGES_RU_SHARED: MessageTable = {
  '*': [
    [/^Needs a browser render: rerun with --render$/, 'Для проверки нужно открыть страницу в браузере. Повторите аудит с --render'],
    [/^The browser render failed for this page$/, 'Не удалось открыть страницу в браузере для проверки'],
    [/^The check failed to run: Unknown error$/, 'Не удалось выполнить проверку: неизвестная ошибка'],
    [/^The check failed to run: (.*)$/s, 'Не удалось выполнить проверку: $1'],
    [/^Mobile parity not measured - run with --cwv --mobile to render desktop and mobile and compare them$/, 'Для сравнения мобильной и настольной версий запустите аудит с --cwv --mobile'],
    [/^This renderer does not collect code coverage \(the desktop app cannot yet\)$/, 'В настольном приложении пока нельзя определить, какой код использует страница'],
    [/^Rendered page assets not captured - run with --cwv to measure resource redirects$/, 'Нет данных о ресурсах, загруженных браузером. Запустите аудит с --cwv, чтобы проверить перенаправления ресурсов'],
    [/^Redirect chain was not recorded for this page$/, 'Цепочка перенаправлений для этой страницы не записана'],
    [/^Inbound link analysis needs the site-wide link graph - run with --crawl to build it$/, 'Для анализа входящих ссылок нужен граф ссылок сайта. Запустите аудит с --crawl'],
    [/^No inbound internal links - inbound link counting is covered by links-orphan-pages$/, 'Входящих внутренних ссылок нет. Их количество проверяет правило links-orphan-pages'],
    [/^No followed inbound internal links - covered by links-inbound-all-nofollow$/, 'Входящих внутренних ссылок без nofollow нет. Это проверяет правило links-inbound-all-nofollow'],
    [/^Schema identity across pages needs a crawl of at least two pages — run with --crawl$/, 'Для сравнения сущностей в разметке обойдите хотя бы две страницы с --crawl'],
    [/^No structured data on the crawled pages to compare$/, 'На страницах обхода нет структурированных данных для сравнения'],
    [/^No JSON-LD to check \(schema-present reports its absence\)$/, 'Данные JSON-LD отсутствуют. Это проверяет правило schema-present'],
    [/^Needs other pages to compare against - run with --crawl$/, 'Для сравнения нужны другие страницы. Запустите аудит с --crawl'],
    [/^Not compared: (.*)$/s, (reason) => 'Страница не участвовала в сравнении: ' + translateReason(reason, comparisonReasons)],
    [/^The mobile page could not be checked: (.*)$/s, (reason) => 'Не удалось проверить мобильную страницу: ' + translateReason(reason, requestReasons)],
    [/^The AMP page could not be checked: (.*)$/s, (reason) => 'Не удалось проверить AMP-страницу: ' + translateReason(reason, requestReasons)],
    [/^The share image could not be checked: (.*)$/s, (reason) => 'Не удалось проверить изображение для соцсетей: ' + translateReason(reason, requestReasons)],
    [/^The real size of the og:image could not be read: the image header does not state its size$/, 'Не удалось определить фактический размер og:image: в заголовке изображения нет размеров'],
    [/^The real size of the og:image could not be read: the (.*) header does not state its size$/s, (format) => format === 'unknown'
      ? 'Не удалось определить фактический размер og:image: формат изображения не распознан'
      : 'Не удалось определить фактический размер og:image: в заголовке ' + format + ' нет размеров'],
    [/^The real size of the og:image could not be read: (.*)$/s, (reason) => 'Не удалось определить фактический размер og:image: ' + translateReason(reason, requestReasons)],
    [/^Open Graph (?:title|description|image|URL) is present but declared as (<meta name="og:(?:title|description|image|url)">); the Open Graph protocol specifies (<meta property="og:(?:title|description|image|url)">)$/, 'Тег Open Graph задан как $1. По протоколу Open Graph используйте $2'],
    [/^Could not parse URL$/, 'Не удалось разобрать URL'],
    [/^Could not verify$/, 'Не удалось проверить'],
    [/^Could not be verified$/, 'Проверить не удалось'],
    [/^(\d+) could not be verified$/, 'Не удалось проверить: $1'],
    [/^(\d+) not checked$/, 'Пропущено: $1'],
    [/^(https?:\/\/\S+) did not answer \((timeout|dns|refused|network|private-address|too-large)\)$/, (url, reason) =>
      `Сервер не ответил на запрос к ${url} (${translateReason(reason, requestReasons)})`],
    ...requestReasons,
  ],
};
