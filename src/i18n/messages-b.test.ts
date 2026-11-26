import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuditContext } from '../crawler/fetcher.js';
import { UrlService } from '../net/url-service.js';
import { privacyPolicyRule } from '../rules/legal/privacy-policy.js';
import { termsOfServiceRule } from '../rules/legal/terms-of-service.js';
import '../rules/loader.js';
import { getAllRules } from '../rules/registry.js';
import { createTestContext, createTestSite } from '../rules/test-context.js';
import { getLocale, setLocale, trMessage } from './index.js';
import { MESSAGES_RU_B } from './ru/messages-b.js';
import { MESSAGES_RU_SHARED } from './ru/messages-shared.js';

const categories = new Set([
  'legal', 'links', 'mobile', 'perf', 'redirect', 'schema', 'security', 'social', 'technical', 'url',
]);
const cyrillic = /[а-яё]/i;

let previousLocale: ReturnType<typeof getLocale>;

beforeEach(() => {
  previousLocale = getLocale();
  setLocale('ru');
});

afterEach(() => {
  setLocale(previousLocale);
  vi.unstubAllGlobals();
});

interface Example {
  rule: string;
  message: string;
  keeps: string[];
}

const examples: Example[] = [
  { rule: 'legal-privacy-policy', message: 'Privacy policy link found in footer (1 link)', keeps: ['1 ссылка', 'в подвале сайта'] },
  { rule: 'legal-cookie-consent', message: 'Cookie consent mechanism detected (3 indicators)', keeps: ['cookie', '3 признака'] },
  { rule: 'links-non-http-protocol', message: 'Found 2 link(s) using non-HTTP protocol(s): ftp:, custom:', keeps: ['2 ссылки', 'ftp:, custom:'] },
  { rule: 'links-external-valid', message: 'Found 1 broken external link(s) out of 18 checked (3 could not be verified, 2 not checked)', keeps: ['1 из 18', 'проверить: 3', 'пропущено: 2'] },
  { rule: 'mobile-viewport-width', message: 'Viewport sets a fixed width of 1024px instead of device-width; mobile browsers will scale the page down', keeps: ['1024px', 'device-width'] },
  {
    rule: 'mobile-viewport-content',
    message: 'Viewport meta tag has 3 content issue(s): width directive is missing; initial-scale is set to "broken; value" instead of 1; minimum-scale is set, limiting how far users can zoom out',
    keeps: ['нет width', '«broken; value»', 'minimum-scale ограничивает'],
  },
  { rule: 'mobile-parity-title', message: 'Title differs between mobile and desktop - mobile: "Sale $9\nToday" vs desktop: "Shop All"', keeps: ['Sale $9\nToday', 'Shop All'] },
  { rule: 'cwv-lcp', message: 'LCP is 4.81s (poor, should be under 2.5s)', keeps: ['LCP', '4.81s', '2.5s'] },
  { rule: 'perf-asset-cache-policy', message: '2 of 5 static asset(s) lack an efficient cache policy: https://example.com/a.css?note=bytes (no cache-control), https://example.com/b.js (max-age=300s)', keeps: ['2 из 5', 'https://example.com/a.css?note=bytes', 'без cache-control', 'https://example.com/b.js (max-age=300s)'] },
  { rule: 'redirect-loop', message: 'Redirect loop detected: 2 URL(s) appear more than once in the chain', keeps: ['2', 'URL'] },
  { rule: 'redirect-type', message: 'Permanent redirect (308 → 301) correctly used', keeps: ['308 → 301'] },
  { rule: 'schema-article', message: 'Article schema validation failed: NewsArticle: missing required fields: headline, author; BlogPosting: missing required fields: datePublished', keeps: ['NewsArticle', 'headline, author', 'BlogPosting', 'datePublished', 'отсутствуют обязательные поля'] },
  {
    rule: 'schema-product',
    message: 'Product missing: image; Offer missing price; Offer missing priceCurrency',
    keeps: ['в Product отсутствуют поля: image', 'в Offer нет поля price', 'в Offer нет поля priceCurrency'],
  },
  {
    rule: 'schema-entity-conflict',
    message: 'HTTPS://example.com/#org name has 2 logos; HTTPS://example.com/#org name has 3 phone numbers',
    keeps: ['HTTPS://example.com/#org name', '2 логотипа', '3 номера телефона'],
  },
  { rule: 'schema-entity-type-drift', message: 'https://example.com/#team: Organization vs Person', keeps: ['https://example.com/#team', 'Organization и Person'] },
  { rule: 'security-cookie-lifetime', message: '2 cookie(s) set a lifetime beyond the 400-day browser cap (longest: visitor_id at 730 days)', keeps: ['2 cookie', '400', 'visitor_id', '730 дней'] },
  { rule: 'security-csp-xss', message: "Content-Security-Policy restricts scripts but could be tightened: no object-src directive (plugins can execute; set object-src 'none'); no base-uri directive (a <base> injection can redirect relative scripts)", keeps: ['Content-Security-Policy', "задайте object-src 'none'", 'Вставка <base>'] },
  { rule: 'social-profiles', message: 'Only 1 social profile found (LinkedIn). Consider adding more for brand presence', keeps: ['1 профиль', 'LinkedIn'] },
  { rule: 'social-og-image-reachable', message: 'og:image https://example.com/og.png is 500×200; the minimum is 600×315; twitter:image https://example.com/x.png cannot be loaded (HTTP 404)', keeps: ['og:image https://example.com/og.png', '500×200, минимум — 600×315', 'twitter:image https://example.com/x.png (HTTP 404)'] },
  { rule: 'technical-duplicate-gtm', message: 'Page contains 2 distinct Google Tag Manager containers: GTM-AAAA, GTM-BBBB', keeps: ['2 отдельных контейнера', 'Google Tag Manager', 'GTM-AAAA, GTM-BBBB'] },
  { rule: 'technical-soft-404', message: 'Page returns 200 but appears to be a soft 404: title reads "not found"; the text says "page not found", on a page of 5 words', keeps: ['200', '404', 'not found', 'page not found', '5 слов'] },
  {
    rule: 'technical-robots-txt-valid',
    message: 'Failed to fetch robots.txt for validation: https://example.com/robots.txt did not answer (timeout)',
    keeps: ['https://example.com/robots.txt', 'истекло время ожидания'],
  },
  { rule: 'url-tracking-params', message: 'URL contains 2 tracking parameter(s): utm_source, gclid', keeps: ['2 параметра', 'utm_source, gclid'] },
  { rule: 'url-parameters', message: "URL query string is malformed: query string contains 2 '?' characters; repetitive parameter(s): q", keeps: ["2 символа '?'", 'повторяются параметры: q'] },
  { rule: 'technical-amp-pairing', message: 'The AMP page could not be checked: rate-limited (HTTP 429)', keeps: ['сервер ограничил частоту запросов', 'HTTP 429'] },
  { rule: 'social-duplicate-og', message: 'Not compared: canonicalised to https://example.com/new?q=1', keeps: ['canonical', 'https://example.com/new?q=1'] },
  { rule: 'mobile-parity-content', message: 'Needs a browser render: rerun with --render', keeps: ['--render'] },
  { rule: 'perf-minify-css', message: 'No inline CSS found — additionally, 2 external stylesheet(s) appear unminified (heuristic: >4096 bytes and URL lacks ".min." — asset bodies are not inspected): https://example.com/theme.css, and 1 more; additionally, 1 stylesheet(s) were served without a content-length header (chunked or HTTP/2 framing), so their size could not be read', keeps: ['Встроенный CSS не найден', '4096', '".min."', 'https://example.com/theme.css и ещё 1', 'content-length', '1 таблицы стилей'] },
];

describe('Русские сообщения аудита', () => {
  it.each(examples)('$rule сохраняет подставленные значения: $message', ({ rule, message, keeps }) => {
    const translated = trMessage(rule, message);
    expect(translated).not.toBe(message);
    expect(translated).toMatch(cyrillic);
    for (const value of keeps) expect(translated).toContain(value);
  });

  it('переводит только целое сообщение и сохраняет английский в локали en', () => {
    const message = 'Page is served over HTTPS';
    expect(trMessage('security-https', message + '\nextra')).toBe(message + '\nextra');
    expect(trMessage('security-https', message + '\n')).toBe(message + '\n');
    setLocale('en');
    expect(trMessage('security-https', message)).toBe(message);
  });

  it('использует ^ и $ в каждом шаблоне двух словарей', () => {
    for (const table of [MESSAGES_RU_B, MESSAGES_RU_SHARED]) {
      for (const [id, patterns] of Object.entries(table)) {
        for (const [regex] of patterns) {
          expect(regex.source, id).toMatch(/^\^.*\$$/);
        }
      }
    }
  });

  it('проверяет сообщения всех правил на нескольких страницах', async () => {
    // URL из фикстур и запросы технических правил получают локальные ответы.
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { pathname } = new URL(input.toString());
      if (pathname.startsWith('/seo-audit-test-nonexistent-page-') || pathname === '/missing') {
        return new Response(null, { status: 404 });
      }
      const isRobots = pathname === '/robots.txt';
      const isSitemap = pathname === '/sitemap.xml';
      const type = isRobots ? 'text/plain' : isSitemap ? 'application/xml' : 'text/html';
      const body = isRobots ? 'User-agent: *\nDisallow:'
        : isSitemap ? '<urlset><url><loc>https://example.com/</loc></url></urlset>'
        : '<html><body><p>Fixture</p></body></html>';
      return new Response(init?.method === 'HEAD' ? null : body, { headers: { 'Content-Type': type } });
    }));

    // Варианты из проверок parity, site graph и asset rules.
    const url = 'https://example.com/Privacy_Page/?utm_source=search&sort=desc';
    const richHtml = `<!doctype html><html><head>
      <title>Page not found</title>
      <meta name="viewport" content="width=1200, initial-scale=2, minimum-scale=1">
      <meta name="og:title" content="Sample share title">
      <meta property="og:image" content="/card.png">
      <meta name="twitter:card" content="summary">
      <link rel="amphtml" href="/amp">
      <link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.example.com/privacy/">
      <script type="application/ld+json">[
        {"@type":"Product","name":"Demo","offers":{"@type":"Offer"}},
        {"@type":"FAQPage","mainEntity":[{"@type":"Thing"},{"@type":"Question"}]},
        {"@type":"Organization","@id":"https://example.com/#org","name":"Example","logo":"https://example.com/a.png"}
      ]</script>
      </head><body><h1>Page not found</h1>
      <a href="#missing">click here</a><a href="/missing">read more</a>
      <form action="http://example.com/session"><input type="password" onpaste="return false"></form>
      <img src="http://example.com/hero.png" loading="lazy" width="1500">
      <footer><a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms of Service</a></footer>
      </body></html>`;
    const secondHtml = `<title>Shop</title><meta property="og:title" content="Sample share title">
      <script type="application/ld+json">{"@type":"LocalBusiness","@id":"https://example.com/#org",
      "name":"Example","logo":"https://example.com/b.png"}</script><h1>Shop</h1>`;
    const { site, contexts } = await createTestSite([
      { url: 'https://example.com/', html: secondHtml },
      { url, html: richHtml },
    ]);
    site.inboundEdgesByUrl = new Map([
      [url, [{ from: 'https://example.com/', anchor: 'click here', nofollow: false, chrome: true }]],
    ]);
    const richPage = contexts.get(url)!;
    const richContext = {
      ...richPage,
      ...createAuditContext(url, richPage),
      urls: new UrlService({ siteUrl: url }),
      renderedHtml: richHtml,
      rendered$: richPage.$,
      mobile$: createTestContext('<title>Mobile shop</title><p>Shop</p>').$,
      responseTime: 6200,
      cwv: { lcp: 4810, cls: 0.24, fcp: 2200, ttfb: 1140 },
      headers: { 'content-type': 'text/html', 'content-security-policy': "script-src 'self' 'unsafe-eval'" },
      assets: [{
        url: 'https://example.com/app.js',
        resourceType: 'script',
        headers: { 'content-length': '50000' },
        statusCode: 200,
        redirectChain: [],
        redirectLoop: false,
      }],
      redirectChain: [
        { url: 'https://example.com/old', statusCode: 301 },
        { url: 'https://example.com/missing', statusCode: 404 },
      ],
      coverage: { js: [], css: [] },
    } satisfies typeof richPage;

    const fixtures = [
      createTestContext('<html></html>'),
      richContext,
      createTestContext(secondHtml, { statusCode: 503, site, url: 'https://example.com/' }),
    ];
    // Старые карточки legal встречаются в сохранённых аудитах.
    const rules = [
      ...getAllRules().filter((rule) => categories.has(rule.category)),
      privacyPolicyRule,
      termsOfServiceRule,
    ];
    expect(rules.map((rule) => rule.id).sort()).toEqual(Object.keys(MESSAGES_RU_B).sort());

    const seen = new Set<string>();
    const untranslated = new Set<string>();
    for (const context of fixtures) {
      for (const rule of rules) {
        const { message } = await rule.run(context);
        if (!message) continue;
        const entry = `${rule.id}: ${message}`;
        seen.add(entry);
        const translated = trMessage(rule.id, message);
        if (translated === message || !cyrillic.test(translated)) untranslated.add(entry);
      }
    }
    const summary = `${rules.length} правил, ${seen.size} уникальных пар «правило и сообщение», ${untranslated.size} без перевода`;
    console.info([summary, ...untranslated].join('\n'));
  });
});
