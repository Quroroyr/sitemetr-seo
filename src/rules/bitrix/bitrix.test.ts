import { describe, expect, it } from 'vitest';
import type { AuditContext, LinkInfo } from '../../types.js';
import { createTestContext } from '../test-context.js';
import { bitrixCompositeRule } from './bitrix-composite.js';
import { bitrixIndexPhpRule } from './bitrix-index-php.js';
import { bitrixPoweredHeaderRule } from './bitrix-powered-header.js';
import { bitrixRobotsAssetsRule } from './bitrix-robots-assets.js';
import { bitrixServiceUrlsRule } from './bitrix-service-urls.js';
import { bitrixSessidLinksRule } from './bitrix-sessid-links.js';

const BITRIX_ROBOTS = [
  'User-agent: *',
  'Disallow: /bitrix/',
  'Disallow: /search/',
  'Disallow: /*?print=',
  'Disallow: /*index.php$',
].join('\n');

const BITRIX_STYLESHEET = '<link rel="stylesheet" href="/bitrix/cache/css/s1/main/template_abc.css">';
const bitrixContext = (overrides: Partial<AuditContext> = {}) => createTestContext(BITRIX_STYLESHEET, overrides);
const link = (href: string, isInternal = true): LinkInfo => ({ href, text: 'Ссылка', isInternal, isNoFollow: false });

it.each([
  bitrixPoweredHeaderRule,
  bitrixRobotsAssetsRule,
  bitrixSessidLinksRule,
  bitrixServiceUrlsRule,
  bitrixIndexPhpRule,
  bitrixCompositeRule,
])('$id is not applicable outside Bitrix', async (rule) => {
  const context = createTestContext('<p>Обычная страница</p>');
  expect(await rule.run(context)).toMatchObject({
    status: 'not-measured',
    reason: 'not-applicable',
    weight: 0,
    message: 'Сайт не на 1С-Битрикс',
  });
});

describe('bitrix-powered-header', () => {
  it('fails on a Bitrix header and masks the license hash', async () => {
    const context = createTestContext('', {
      headers: { 'X-Powered-CMS': 'Bitrix Site Manager (0123456789abcdef0123456789abcdef)' },
    });
    expect(await bitrixPoweredHeaderRule.run(context)).toMatchObject({
      status: 'fail',
      details: { header: 'Bitrix Site Manager (0123…)' },
    });
  });

  it('fails on a Bitrix header without a hash', async () => {
    const context = createTestContext('', { headers: { 'x-powered-cms': 'Bitrix Site Manager' } });
    expect(await bitrixPoweredHeaderRule.run(context)).toMatchObject({
      status: 'fail',
      details: { header: 'Bitrix Site Manager' },
    });
  });

  it('passes when the Bitrix site does not disclose its CMS in X-Powered-CMS', async () => {
    const context = bitrixContext({ headers: { 'x-powered-cms': 'Other CMS' } });
    expect((await bitrixPoweredHeaderRule.run(context)).status).toBe('pass');
  });
});

describe('bitrix-robots-assets', () => {
  it('fails when the default robots.txt blocks the stylesheet for both bots', async () => {
    const result = await bitrixRobotsAssetsRule.run(bitrixContext({ robotsTxtContent: BITRIX_ROBOTS }));
    expect(result.status).toBe('fail');
    expect(result.details).toEqual({
      count: 1,
      blocked: [{
        url: 'https://example.com/bitrix/cache/css/s1/main/template_abc.css',
        robots: [{ bot: 'Яндекс', pattern: '/bitrix/' }, { bot: 'Google', pattern: '/bitrix/' }],
        reason: 'Яндекс — Disallow /bitrix/, Google — Disallow /bitrix/',
      }],
    });
  });

  it('uses each bot group and detects scripts and both types of preload', async () => {
    const context = createTestContext(`
      ${BITRIX_STYLESHEET}
      <base href="/bitrix/">
      <script src="js/main.js?v=3"></script>
      <link rel="preload" as="STYLE" href="components/theme.css">
      <link rel="PRELOAD" as="script" href="//example.com/bitrix/panel/main.js">
      <link rel="preload" as="font" href="templates/font.woff2">
      <script src="https://cdn.example.com/bitrix/js/external.js"></script>
    `, {
      robotsTxtContent: [
        BITRIX_ROBOTS, 'User-agent: Yandex',
        'Disallow: /bitrix/', 'Allow: /bitrix/*.js', 'Allow: /bitrix/cache/',
        'User-agent: Googlebot', 'Disallow: /bitrix/js/', 'Disallow: /bitrix/panel/',
      ].join('\n'),
    });
    const result = await bitrixRobotsAssetsRule.run(context);
    expect(result.status).toBe('fail');
    expect(result.details).toEqual({
      count: 3,
      blocked: [
        {
          url: 'https://example.com/bitrix/js/main.js?v=3',
          robots: [{ bot: 'Google', pattern: '/bitrix/js/' }],
          reason: 'Google — Disallow /bitrix/js/',
        },
        {
          url: 'https://example.com/bitrix/components/theme.css',
          robots: [{ bot: 'Яндекс', pattern: '/bitrix/' }],
          reason: 'Яндекс — Disallow /bitrix/',
        },
        {
          url: 'https://example.com/bitrix/panel/main.js',
          robots: [{ bot: 'Google', pattern: '/bitrix/panel/' }],
          reason: 'Google — Disallow /bitrix/panel/',
        },
      ],
    });
  });

  it('reports at most ten distinct blocked addresses', async () => {
    const scripts = Array.from({ length: 12 }, (_, i) => `<script src="/bitrix/js/main${i}.js"></script>`).join('');
    const context = createTestContext(`${scripts}<script src="/bitrix/js/main1.js#copy"></script>`, {
      robotsTxtContent: BITRIX_ROBOTS,
    });
    const result = await bitrixRobotsAssetsRule.run(context);
    expect(result.details?.count).toBe(12);
    expect(result.details?.blocked).toHaveLength(10);
  });

  it('passes with Allow overrides and without robots.txt', async () => {
    const context = createTestContext(`${BITRIX_STYLESHEET}<script src="/bitrix/js/main.js"></script>`, {
      robotsTxtContent: `${BITRIX_ROBOTS}\nAllow: /bitrix/*.css\nAllow: /bitrix/*.js`,
    });
    expect((await bitrixRobotsAssetsRule.run(context)).status).toBe('pass');
    expect((await bitrixRobotsAssetsRule.run(bitrixContext())).status).toBe('pass');
  });
});

describe('bitrix-sessid-links', () => {
  it('fails on internal sessid links and masks the values in examples', async () => {
    const context = bitrixContext({
      links: [link('/catalog/?sessid=abc'), link('/cart/?step=1&sessid=def'), link('https://other.example/?sessid=3', false)],
    });
    expect(await bitrixSessidLinksRule.run(context)).toMatchObject({
      status: 'fail',
      details: { count: 2, examples: ['https://example.com/catalog/?sessid=*', 'https://example.com/cart/?step=1&sessid=*'] },
    });
  });

  it('passes with a hidden form field, external URLs and similarly named parameters', async () => {
    const context = createTestContext(`${BITRIX_STYLESHEET}<form method="post"><input type="hidden" name="sessid" value="abc"></form>`, {
      links: [link('https://other.example/?sessid=def', false), link('/?old_sessid=1'), link('/?q=/cart?sessid=2')],
    });
    expect((await bitrixSessidLinksRule.run(context)).status).toBe('pass');
  });
});

describe('bitrix-service-urls', () => {
  it.each([
    'clear_cache=Y', 'clear_cache_session=Y', 'bitrix_include_areas=N', 'show_page_exec_time=Y',
    'show_include_exec_time=Y', 'show_sql_stat=Y', 'compress=Y', 'back_url_admin=%2Fbitrix%2Fadmin%2F',
    'login=yes', 'logout=yes', 'register=yes', 'forgot_password=yes', 'change_password=yes',
    'print=Y', 'PAGEN_1=1', 'PAGEN_42=1',
  ])('warns when Yandex can crawl %s', async (query) => {
    const path = `/catalog/?${query}`;
    const context = bitrixContext({ links: [link(path)] });
    expect(await bitrixServiceUrlsRule.run(context)).toMatchObject({
      status: 'warn',
      details: { count: 1, params: [query.split('=')[0]], examples: [`https://example.com${path}`] },
    });
  });

  it('passes URLs disallowed to Yandex and ignores tracking, sorting and later pages', async () => {
    const context = bitrixContext({
      robotsTxtContent: 'User-agent: Yandex\nDisallow: /*clear_cache=\nDisallow: /*PAGEN_1=1',
      links: [
        link('/?q=a&clear_cache=Y'), link('/?PAGEN_1=1'), link('/?PAGEN_2=2'),
        link('/?sort=price&order=asc&utm_source=vk'), link('/?login=no&print=N'),
        link('https://other.example/?print=Y', false),
      ],
    });
    expect((await bitrixServiceUrlsRule.run(context)).status).toBe('pass');
  });
});

describe('bitrix-index-php', () => {
  it('warns on root and section index.php URLs, including those with parameters', async () => {
    const context = bitrixContext({ links: [link('/index.php'), link('/catalog/index.php?from=home'), link('/catalog/')] });
    expect(await bitrixIndexPhpRule.run(context)).toMatchObject({
      status: 'warn',
      details: { examples: ['https://example.com/index.php', 'https://example.com/catalog/index.php?from=home'] },
    });
  });

  it('passes for index.php blocked by the default robots.txt', async () => {
    const context = bitrixContext({
      robotsTxtContent: BITRIX_ROBOTS,
      links: [link('/index.php#top'), link('/catalog/index.php'), link('/catalog/'), link('/article-index.php')],
    });
    expect((await bitrixIndexPhpRule.run(context)).status).toBe('pass');
  });

  it('warns when the end-anchored Disallow does not cover a query string', async () => {
    const context = bitrixContext({ robotsTxtContent: BITRIX_ROBOTS, links: [link('/index.php?id=1')] });
    expect(await bitrixIndexPhpRule.run(context)).toMatchObject({
      status: 'warn',
      details: { examples: ['https://example.com/index.php?id=1'] },
    });
  });
});

describe('bitrix-composite', () => {
  it.each(['private, no-cache', 'no-store'])('warns on Cache-Control %s and highlights a slow response', async (cacheControl) => {
    const context = bitrixContext({ headers: { 'Cache-Control': cacheControl }, responseTime: 750 });
    const result = await bitrixCompositeRule.run(context);
    expect(result.status).toBe('warn');
    expect(result.details).toEqual({ responseTime: 750, cacheControl });
    expect(result.message).toContain('750 мс и превысил порог 600 мс');
  });

  it('warns on a PHPSESSID in a combined Set-Cookie header', async () => {
    const context = bitrixContext({
      headers: { 'Set-Cookie': 'theme=1; Expires=Wed, 21 Oct 2026 07:28:00 GMT, PHPSESSID=abc; Path=/' },
      responseTime: 600,
    });
    const result = await bitrixCompositeRule.run(context);
    expect(result.status).toBe('warn');
    expect(result.details).toEqual({ responseTime: 600, cookie: 'PHPSESSID' });
    expect(result.message).toContain('Время ответа 600 мс');
  });

  it('passes with X-Bitrix-Composite and reports its value', async () => {
    const context = createTestContext('', {
      headers: { 'X-Bitrix-Composite': 'Cache (200)', 'Cache-Control': 'no-cache' },
    });
    const result = await bitrixCompositeRule.run(context);
    expect(result).toMatchObject({ status: 'pass', details: { header: 'Cache (200)' } });
    expect(result.message).toContain('Cache (200)');
  });

  it('passes without evidence of a cache bypass', async () => {
    const context = bitrixContext({ headers: { 'Cache-Control': 'public, max-age=300', 'Set-Cookie': 'theme=PHPSESSID' } });
    expect((await bitrixCompositeRule.run(context)).status).toBe('pass');
  });
});
