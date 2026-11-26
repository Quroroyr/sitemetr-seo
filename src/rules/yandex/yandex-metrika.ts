import type { AuditContext } from '../../types.js';
import { defineRule, pass, warn } from '../define-rule.js';

const METRIKA = /mc\.yandex\.(?:ru|com|by|kz|uz)\/(?:metrika\/(?:tag|watch)\.js|watch\/\d+)|\bym\(\s*\d{5,}\s*,\s*['"]init['"]|yandex_metrika_callbacks/i;

/**
 * Rule: a Yandex.Metrika counter is on the page.
 *
 * Not a ranking factor, so it starts advisory: without Metrika the site owner
 * cannot see Yandex search traffic, behaviour or Webvisor, and Webmaster
 * cannot pull visit data for the site.
 */
export const yandexMetrikaRule = defineRule({
  id: 'yandex-metrika',
  name: 'Счётчик Яндекс.Метрики',
  description: 'Проверяет, установлен ли на странице счётчик Яндекс.Метрики.',
  category: 'yandex',
  weight: 3,
  advisory: true,
  run: (context: AuditContext) => {
    const id = 'yandex-metrika';
    const html = `${context.html ?? ''}\n${context.renderedHtml ?? ''}`;
    const match = html.match(METRIKA);
    if (match) {
      const counter = html.match(/\bym\(\s*(\d{5,})/)?.[1] ?? html.match(/watch\/(\d{5,})/)?.[1];
      return pass(id, counter ? `Счётчик Метрики найден (номер ${counter})` : 'Счётчик Метрики найден', {
        ...(counter && { counter }),
      });
    }
    return warn(id, 'Счётчик Яндекс.Метрики на странице не найден', {
      note: 'Если счётчик подключается через Google Tag Manager или после согласия на cookie, проверка его не увидит',
    });
  },
});
