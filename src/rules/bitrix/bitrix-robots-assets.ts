import { RobotsMatcher } from '../../crawler/robots.js';
import { defineRule, fail, pass } from '../define-rule.js';
import { bitrixNotApplicable, bitrixUrlExample } from './helpers.js';
import { isBitrix, yandexRobots } from '../runet-helpers.js';

const id = 'bitrix-robots-assets';
const ASSET_PATH = /^\/bitrix\/(?:cache|js|templates|components|css|panel)\//;
const ASSET_SELECTOR = [
  'link[rel~="stylesheet" i][href]',
  'script[src]',
  'link[rel~="preload" i][as="style" i][href]',
  'link[rel~="preload" i][as="script" i][href]',
].join(', ');
const MAX_EXAMPLES = 10;

interface BlockedAsset {
  url: string;
  robots: { bot: string; pattern: string | null }[];
  reason: string;
}

/** Проверяет, могут ли роботы скачать стили и скрипты 1С-Битрикс для отрисовки. */
export const bitrixRobotsAssetsRule = defineRule({
  id,
  name: 'Доступ роботов к CSS и JS 1С-Битрикс',
  description: 'Проверяет, разрешает ли robots.txt Яндексу и Google загружать подключённые CSS и JS из /bitrix/.',
  category: 'bitrix',
  weight: 8,
  run: (context) => {
    if (!isBitrix(context)) return bitrixNotApplicable(id);

    const content = context.robotsTxtContent;
    const yandex = yandexRobots(context);
    if (!content || !yandex) return pass(id, 'Нет robots.txt с ограничениями для CSS и JS');

    const google = new RobotsMatcher(content, 'Googlebot');
    const { $, url } = context;
    const page = new URL(url);
    const baseHref = $('base[href]').first().attr('href');
    const base = baseHref && URL.canParse(baseHref, page) ? new URL(baseHref, page) : page;
    const seen = new Set<string>();
    const blocked: BlockedAsset[] = [];
    let count = 0;

    for (const element of $(ASSET_SELECTOR).toArray()) {
      const asset = $(element);
      const address = asset.is('script') ? asset.attr('src') : asset.attr('href');
      if (!address?.trim() || !URL.canParse(address, base)) continue;

      const assetUrl = new URL(address, base);
      if (assetUrl.origin !== page.origin || !ASSET_PATH.test(assetUrl.pathname)) continue;

      assetUrl.hash = '';
      if (seen.has(assetUrl.href)) continue;
      seen.add(assetUrl.href);

      const robots = [];
      const yandexDecision = yandex.explain(assetUrl.href);
      const googleDecision = google.explain(assetUrl.href);
      if (!yandexDecision.allowed) robots.push({ bot: 'Яндекс', pattern: yandexDecision.pattern });
      if (!googleDecision.allowed) robots.push({ bot: 'Google', pattern: googleDecision.pattern });
      if (robots.length === 0) continue;

      count++;
      if (blocked.length < MAX_EXAMPLES) {
        blocked.push({
          url: bitrixUrlExample(assetUrl),
          robots,
          reason: robots.map(({ bot, pattern }) => `${bot} — Disallow ${pattern}`).join(', '),
        });
      }
    }

    if (count === 0) return pass(id, 'robots.txt не блокирует подключённые CSS и JS 1С-Битрикс');

    return fail(id, `robots.txt блокирует CSS или JS из /bitrix/ (${count}). Поисковые роботы могут отрисовать страницу не полностью`, { count, blocked });
  },
});
