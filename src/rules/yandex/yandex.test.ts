import { describe, expect, it } from 'vitest';
import { createTestContext } from '../test-context.js';
import { technicalHostIndexableRule } from './technical-host-indexable.js';
import { yandexCleanParamRule } from './yandex-clean-param.js';
import { yandexMetrikaRule } from './yandex-metrika.js';
import { yandexRobotsObsoleteRule } from './yandex-robots-obsolete.js';
import { technicalHostReason } from '../runet-helpers.js';
import type { LinkInfo } from '../../types.js';

const page = '<html><head><title>t</title></head><body><p>x</p></body></html>';
const link = (href: string): LinkInfo => ({ href, text: 'x', isInternal: true, isNoFollow: false });

/** robots.txt as 1C-Bitrix ships it */
const BITRIX_ROBOTS = [
  'User-agent: *',
  'Disallow: /bitrix/',
  'Disallow: /search/',
  'Disallow: /*?print=',
  'Disallow: /*index.php$',
].join('\n');

describe('technicalHostReason', () => {
  it('knows hosting service domains and staging prefixes', () => {
    expect(technicalHostReason('shop.tw1.ru')).toContain('*.tw1.ru');
    expect(technicalHostReason('shop.beget.tech')).toContain('*.beget.tech');
    expect(technicalHostReason('test.example.ru')).toContain('тестовой копии');
    expect(technicalHostReason('staging2.example.ru')).toContain('тестовой копии');
  });

  it('leaves production hosts alone', () => {
    expect(technicalHostReason('example.ru')).toBeNull();
    expect(technicalHostReason('www.example-motors.ru')).toBeNull();
    expect(technicalHostReason('testo-shop.ru')).toBeNull();
  });
});

describe('yandex-technical-host-indexable', () => {
  it('fails an open copy on a hosting domain', async () => {
    const ctx = createTestContext(page, { url: 'https://shop.tw1.ru/', robotsTxtContent: BITRIX_ROBOTS });
    const result = await technicalHostIndexableRule.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.message).toContain('shop.tw1.ru');
  });

  it('passes when the copy says noindex', async () => {
    const html = '<html><head><meta name="robots" content="noindex, nofollow"></head><body></body></html>';
    const result = await technicalHostIndexableRule.run(createTestContext(html, { url: 'https://shop.tw1.ru/' }));
    expect(result.status).toBe('pass');
  });

  it('passes when robots.txt disallows everything for Yandex', async () => {
    const ctx = createTestContext(page, {
      url: 'https://dev.example.ru/',
      robotsTxtContent: 'User-agent: *\nDisallow: /',
    });
    expect((await technicalHostIndexableRule.run(ctx)).status).toBe('pass');
  });

  it('passes on a production host', async () => {
    const result = await technicalHostIndexableRule.run(createTestContext(page, { url: 'https://example.ru/' }));
    expect(result.status).toBe('pass');
  });
});

describe('yandex-clean-param', () => {
  it('warns about tracking and sort parameters robots.txt leaves open', async () => {
    const ctx = createTestContext(page, {
      url: 'https://example.ru/catalog/',
      robotsTxtContent: BITRIX_ROBOTS,
      links: [link('/catalog/?sort=price&order=asc'), link('/promo/?utm_source=vk&utm_medium=post')],
    });
    const result = await yandexCleanParamRule.run(ctx);
    expect(result.status).toBe('warn');
    expect(result.details?.params).toEqual(expect.arrayContaining(['sort', 'order', 'utm_source', 'utm_medium']));
  });

  it('passes when Clean-param covers them', async () => {
    const ctx = createTestContext(page, {
      url: 'https://example.ru/catalog/',
      robotsTxtContent: `${BITRIX_ROBOTS}\nClean-param: sort&order\nClean-param: utm_source&utm_medium /`,
      links: [link('/catalog/?sort=price&order=asc'), link('/promo/?utm_source=vk&utm_medium=post')],
    });
    expect((await yandexCleanParamRule.run(ctx)).status).toBe('pass');
  });

  it('passes when the URLs are disallowed instead', async () => {
    const ctx = createTestContext(page, {
      url: 'https://example.ru/',
      robotsTxtContent: 'User-agent: Yandex\nDisallow: /*?sort=\nDisallow: /*&sort=',
      links: [link('/catalog/?sort=price')],
    });
    expect((await yandexCleanParamRule.run(ctx)).status).toBe('pass');
  });

  it('ignores ordinary parameters such as pagination', async () => {
    const ctx = createTestContext(page, { links: [link('/news/?PAGEN_1=2'), link('/search/?q=test')] });
    expect((await yandexCleanParamRule.run(ctx)).status).toBe('pass');
  });
});

describe('yandex-robots-obsolete', () => {
  it('warns about Host and Crawl-delay', async () => {
    const ctx = createTestContext(page, {
      robotsTxtContent: 'User-agent: Yandex\nCrawl-delay: 2\nDisallow: /bitrix/\nHost: https://example.ru',
    });
    const result = await yandexRobotsObsoleteRule.run(ctx);
    expect(result.status).toBe('warn');
    expect(result.details?.directives).toEqual(['Host: https://example.ru', 'Crawl-delay']);
  });

  it('passes a clean robots.txt and skips a missing one', async () => {
    expect((await yandexRobotsObsoleteRule.run(createTestContext(page, { robotsTxtContent: BITRIX_ROBOTS }))).status).toBe('pass');
    expect((await yandexRobotsObsoleteRule.run(createTestContext(page))).status).toBe('not-measured');
  });
});

describe('yandex-metrika', () => {
  it('finds the tag.js counter and its number', async () => {
    const html = `<html><body><script>(function(m,e,t,r,i,k,a){})(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");ym(12345678, "init", {clickmap:true});</script></body></html>`;
    const result = await yandexMetrikaRule.run(createTestContext(html));
    expect(result.status).toBe('pass');
    expect(result.details?.counter).toBe('12345678');
  });

  it('warns when there is no counter, and is advisory', async () => {
    expect((await yandexMetrikaRule.run(createTestContext(page))).status).toBe('warn');
    expect(yandexMetrikaRule.advisory).toBe(true);
  });
});
