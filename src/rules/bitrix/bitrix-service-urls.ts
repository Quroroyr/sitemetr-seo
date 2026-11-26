import { defineRule, pass, warn } from '../define-rule.js';
import { bitrixNotApplicable, bitrixUrlExample } from './helpers.js';
import { internalUrls, isBitrix, yandexRobots } from '../runet-helpers.js';

const id = 'bitrix-service-urls';
const SERVICE_PARAMS = new Set([
  'clear_cache', 'clear_cache_session', 'bitrix_include_areas', 'show_page_exec_time',
  'show_include_exec_time', 'show_sql_stat', 'compress', 'back_url_admin',
]);
const AUTH_PARAMS = new Set(['login', 'logout', 'register', 'forgot_password', 'change_password']);
const PAGINATION_PARAM = /^PAGEN_\d+$/;

function isServiceParam(param: string, value: string): boolean {
  return SERVICE_PARAMS.has(param)
    || (AUTH_PARAMS.has(param) && value === 'yes')
    || (param === 'print' && value === 'Y')
    || (PAGINATION_PARAM.test(param) && value === '1');
}

/** Ищет ссылки со служебными параметрами, доступные Яндексу. */
export const bitrixServiceUrlsRule = defineRule({
  id,
  name: 'Служебные URL 1С-Битрикс',
  description: 'Ищет внутренние ссылки со служебными параметрами и ссылки на первую страницу пагинации, открытые для Яндекса.',
  category: 'bitrix',
  weight: 5,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const robots = yandexRobots(context);
    const params = new Set<string>();
    const examples: string[] = [];
    let count = 0;

    for (const url of internalUrls(context)) {
      const matches = [...url.searchParams].filter(([param, value]) => isServiceParam(param, value));
      if (matches.length === 0 || robots?.isAllowed(url.href) === false) continue;

      for (const [param] of matches) params.add(param);
      count++;
      if (examples.length < 5) examples.push(bitrixUrlExample(url));
    }

    if (count === 0) return pass(id, 'Яндексу не открыты ссылки со служебными параметрами 1С-Битрикс');

    return warn(id, `Яндексу доступны ссылки со служебными параметрами 1С-Битрикс (${count})`, {
      count,
      params: [...params],
      examples,
    });
  },
});
