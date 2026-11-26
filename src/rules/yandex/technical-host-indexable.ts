import type { AuditContext } from '../../types.js';
import { defineRule, fail, pass } from '../define-rule.js';
import { noindexSource, technicalHostReason, yandexRobots } from '../runet-helpers.js';

/**
 * Rule: a copy of the site on a hosting provider's service domain or a
 * staging host (test., dev., *.tw1.ru, *.beget.tech...) is open to indexing.
 *
 * Yandex indexes such hosts readily and treats them as duplicates of the
 * production site: pages can be glued to the wrong host or drop from search.
 */
export const technicalHostIndexableRule = defineRule({
  id: 'yandex-technical-host-indexable',
  name: 'Тестовая копия закрыта от индексации',
  description: 'Проверяет, что копия сайта на техническом или тестовом домене закрыта от поисковых роботов.',
  category: 'yandex',
  weight: 10,
  run: (context: AuditContext) => {
    const id = 'yandex-technical-host-indexable';
    let host: string;
    try {
      host = new URL(context.url).hostname;
    } catch {
      return pass(id, 'Адрес страницы не похож на технический домен');
    }

    const reason = technicalHostReason(host);
    if (!reason) {
      return pass(id, `${host} — обычный домен, не тестовая копия`, { host });
    }

    const noindex = noindexSource(context);
    if (noindex) {
      return pass(id, `Тестовая копия закрыта от индексации (${noindex})`, { host, reason, closedBy: noindex });
    }

    const robots = yandexRobots(context);
    if (robots && !robots.isAllowed(context.url)) {
      return pass(id, 'Тестовая копия закрыта в robots.txt', { host, reason, closedBy: 'robots.txt' });
    }

    return fail(
      id,
      `Сайт открыт для индексации на ${host}: ${reason}. Для Яндекса это дубль основного сайта`,
      { host, reason, robotsTxt: robots ? 'разрешает' : 'нет' }
    );
  },
});
