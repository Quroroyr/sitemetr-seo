import type { AuditContext } from '../../types.js';
import { defineRule, pass, warn } from '../define-rule.js';
import { internalUrls, robotsLines, yandexRobots } from '../runet-helpers.js';

/**
 * Parameters that do not change what a page shows: tracking tags and the
 * sorting and view switches catalogues add. Yandex crawls every variant as a
 * separate URL unless robots.txt names them in `Clean-param` (or disallows).
 */
const TRACKING = /^(?:utm_[a-z]+|yclid|gclid|fbclid|ysclid|_openstat|openstat|from|ref)$/i;
const SORTING = /^(?:sort|order|by|direction|view|display|SORT_BY|SORT_ORDER|set_filter|del_filter)$/i;

function cleanParamCovers(content: string | undefined): (param: string, path: string) => boolean {
  if (!content) return () => false;
  const entries = robotsLines(content)
    .filter((l) => l.directive === 'clean-param' && l.value)
    .map((l) => {
      const [params = '', prefix = '/'] = l.value.split(/\s+/);
      return { params: params.split('&').map((p) => p.trim().toLowerCase()), prefix };
    });
  return (param, path) =>
    entries.some((e) => e.params.includes(param.toLowerCase()) && path.startsWith(e.prefix.replace(/\*$/, '')));
}

/**
 * Rule: links on the page carry tracking or sorting parameters that robots.txt
 * neither cleans (`Clean-param`) nor disallows for Yandex.
 */
export const yandexCleanParamRule = defineRule({
  id: 'yandex-clean-param',
  name: 'Clean-param для служебных параметров',
  description: 'Ищет в ссылках UTM-метки и параметры сортировки, которые не закрыты директивой Clean-param или Disallow для Яндекса.',
  category: 'yandex',
  weight: 6,
  run: (context: AuditContext) => {
    const id = 'yandex-clean-param';
    const urls = internalUrls(context);
    try {
      urls.push(new URL(context.url));
    } catch {
      // the page URL is always absolute in practice
    }

    const robots = yandexRobots(context);
    const covered = cleanParamCovers(context.robotsTxtContent);
    const uncovered = new Map<string, string>();
    let seen = 0;

    for (const url of urls) {
      for (const param of new Set(url.searchParams.keys())) {
        if (!TRACKING.test(param) && !SORTING.test(param)) continue;
        seen++;
        if (covered(param, url.pathname)) continue;
        if (robots && !robots.isAllowed(url.href)) continue;
        if (!uncovered.has(param)) uncovered.set(param, url.href);
      }
    }

    if (seen === 0) {
      return pass(id, 'В ссылках нет UTM-меток и параметров сортировки');
    }
    if (uncovered.size === 0) {
      return pass(id, 'Служебные параметры в ссылках закрыты Clean-param или Disallow');
    }

    const params = [...uncovered.keys()];
    return warn(
      id,
      `Параметры без Clean-param: ${params.join(', ')}. Яндекс будет обходить каждую комбинацию как отдельную страницу`,
      {
        params,
        examples: [...uncovered.values()].slice(0, 5),
        suggestion: `Clean-param: ${params.join('&')}`,
      }
    );
  },
});
