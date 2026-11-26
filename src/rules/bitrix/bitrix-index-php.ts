import { defineRule, pass, warn } from '../define-rule.js';
import { bitrixNotApplicable, bitrixUrlExample } from './helpers.js';
import { internalUrls, isBitrix, yandexRobots } from '../runet-helpers.js';

const id = 'bitrix-index-php';

/** Ищет ссылки на index.php, доступные Яндексу. */
export const bitrixIndexPhpRule = defineRule({
  id,
  name: 'Дубли разделов с index.php',
  description: 'Ищет внутренние ссылки на index.php в корне и разделах сайта, открытые для Яндекса.',
  category: 'bitrix',
  weight: 4,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const robots = yandexRobots(context);
    const links = internalUrls(context).filter((url) =>
      url.pathname.endsWith('/index.php') && robots?.isAllowed(url.href) !== false
    );
    if (links.length === 0) return pass(id, 'Яндексу не открыты ссылки на index.php');

    return warn(id, 'Яндексу доступны ссылки на index.php. Такие адреса дублируют адреса разделов', {
      examples: links.slice(0, 5).map(bitrixUrlExample),
    });
  },
});
