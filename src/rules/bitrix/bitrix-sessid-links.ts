import { defineRule, fail, pass } from '../define-rule.js';
import { bitrixNotApplicable, bitrixUrlExample } from './helpers.js';
import { internalUrls, isBitrix } from '../runet-helpers.js';

const id = 'bitrix-sessid-links';

/** Ищет параметр sessid во внутренних ссылках. */
export const bitrixSessidLinksRule = defineRule({
  id,
  name: 'Параметр sessid во внутренних ссылках',
  description: 'Ищет внутренние ссылки с параметром sessid, который меняется от посетителя к посетителю.',
  category: 'bitrix',
  weight: 6,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const links = internalUrls(context).filter((url) => /(?:^\?|&)sessid=/.test(url.search));
    if (links.length === 0) return pass(id, 'Во внутренних ссылках нет sessid');

    return fail(id, `Найдены ссылки с sessid (${links.length}). Параметр меняется для каждого посетителя и создаёт дубли`, {
      count: links.length,
      examples: links.slice(0, 5).map(bitrixUrlExample),
    });
  },
});
