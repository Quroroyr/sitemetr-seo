import { defineRule, pass, warn } from '../define-rule.js';
import { bitrixNotApplicable } from './helpers.js';
import { header, isBitrix } from '../runet-helpers.js';

const id = 'bitrix-composite';
const SLOW_RESPONSE_MS = 600;
const CACHE_BYPASS = /(?:^|,)\s*(?:no-store|no-cache)(?=\s*(?:=|,|$))/i;
const SESSION_COOKIE = /(?:^|,)\s*PHPSESSID\s*=/;

/** Проверяет признаки работы композитного кеша в ответе для гостя. */
export const bitrixCompositeRule = defineRule({
  id,
  name: 'Композитный кеш 1С-Битрикс',
  description: 'Проверяет X-Bitrix-Composite и признаки ответа без кеша для анонимного посетителя.',
  category: 'bitrix',
  weight: 5,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const composite = header(context, 'X-Bitrix-Composite');
    if (composite) return pass(id, `Есть X-Bitrix-Composite (${composite})`, { header: composite });

    const cacheControl = header(context, 'Cache-Control');
    const preventsCaching = CACHE_BYPASS.test(cacheControl);
    const setsSession = context.cookies?.some(({ name }) => name === 'PHPSESSID')
      || SESSION_COOKIE.test(header(context, 'Set-Cookie'));
    if (!preventsCaching && !setsSession) return pass(id, 'Нет признаков отключённого композитного кеша');

    const { responseTime } = context;
    const timing = responseTime > SLOW_RESPONSE_MS
      ? `Ответ занял ${responseTime} мс и превысил порог ${SLOW_RESPONSE_MS} мс`
      : `Время ответа ${responseTime} мс`;
    return warn(id, `Композитный кеш, вероятно, не работает. ${timing}`, {
      responseTime,
      ...(preventsCaching && { cacheControl }),
      ...(setsSession && { cookie: 'PHPSESSID' }),
    });
  },
});
