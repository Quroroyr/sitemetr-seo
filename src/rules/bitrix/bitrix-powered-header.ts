import { defineRule, fail, pass } from '../define-rule.js';
import { bitrixNotApplicable } from './helpers.js';
import { header, isBitrix } from '../runet-helpers.js';

const id = 'bitrix-powered-header';

/** Проверяет, раскрывает ли X-Powered-CMS название CMS. */
export const bitrixPoweredHeaderRule = defineRule({
  id,
  name: 'Раскрытие 1С-Битрикс в X-Powered-CMS',
  description: 'Проверяет, выдаёт ли заголовок X-Powered-CMS название CMS и хеш лицензии.',
  category: 'bitrix',
  weight: 8,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const poweredCms = header(context, 'X-Powered-CMS');
    if (!/bitrix/i.test(poweredCms)) return pass(id, 'X-Powered-CMS не раскрывает 1С-Битрикс');

    const maskedHeader = poweredCms.replace(/\(([^()]+)\)/g, (_, hash: string) => `(${hash.trim().slice(0, 4)}…)`);
    return fail(id, 'Заголовок X-Powered-CMS раскрывает 1С-Битрикс', { header: maskedHeader });
  },
});
