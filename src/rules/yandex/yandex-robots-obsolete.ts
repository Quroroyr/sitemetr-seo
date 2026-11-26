import type { AuditContext } from '../../types.js';
import { defineRule, notMeasured, pass, warn } from '../define-rule.js';
import { robotsLines } from '../runet-helpers.js';

/**
 * Rule: robots.txt relies on directives Yandex no longer reads.
 *
 * `Host` (main mirror) was dropped in 2018: the main mirror is now set by a
 * 301 redirect and in Yandex Webmaster. `Crawl-delay` is ignored too; crawl
 * speed is set in Webmaster. Both are harmless but give a false sense that
 * the setting works.
 */
export const yandexRobotsObsoleteRule = defineRule({
  id: 'yandex-robots-obsolete',
  name: 'Устаревшие директивы для Яндекса',
  description: 'Ищет в robots.txt директивы Host и Crawl-delay, которые Яндекс больше не учитывает.',
  category: 'yandex',
  weight: 3,
  run: (context: AuditContext) => {
    const id = 'yandex-robots-obsolete';
    const content = context.robotsTxtContent;
    if (!content || !content.trim()) {
      return notMeasured(id, 'robots.txt не найден, проверять нечего', undefined, 'not-applicable');
    }

    const lines = robotsLines(content);
    const found: string[] = [];
    const host = lines.find((l) => l.directive === 'host');
    if (host) found.push(`Host: ${host.value}`);
    if (lines.some((l) => l.directive === 'crawl-delay')) found.push('Crawl-delay');

    if (found.length === 0) {
      return pass(id, 'В robots.txt нет устаревших для Яндекса директив');
    }
    return warn(id, `Яндекс не учитывает директивы: ${found.join(', ')}`, {
      directives: found,
      note: 'Главное зеркало задаётся 301-редиректом и в Яндекс Вебмастере, скорость обхода — в Вебмастере',
    });
  },
});
