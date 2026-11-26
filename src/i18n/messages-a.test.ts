import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAuditContext } from '../crawler/fetcher.js';
import type { AxeViolation } from '../render/axe.js';
import '../rules/loader.js';
import { getAllRules } from '../rules/registry.js';
import { createTestContext, createTestSite } from '../rules/test-context.js';
import { getLocale, setLocale, trMessage, type Locale } from './index.js';
import { MESSAGES_RU_A } from './ru/messages-a.js';

const categories = new Set(['a11y', 'content', 'core', 'crawl', 'eeat', 'geo', 'htmlval', 'i18n', 'images', 'js']);
const rules = getAllRules().filter(({ category }) => categories.has(category));
const cyrillic = /[А-ЯЁа-яё]/;
let previousLocale: Locale;

beforeEach(() => {
  previousLocale = getLocale();
  setLocale('ru');
});

afterEach(() => {
  setLocale(previousLocale);
  vi.unstubAllGlobals();
});

describe('Russian result messages, part A', () => {
  it.each([
    ['a11y-empty-heading', '22 empty heading(s) found', ['22 пустых заголовка']],
    ['a11y-aria-required', 'menuitem is outside menu or menubar; menu contains no menuitem', ['menu или menubar', 'не содержит menuitem']],
    ['a11y-axe-media', 'axe found media and motion problems: marquee (serious, 2 elements); blink (unrated, 11 elements)', ['marquee', 'blink', '2 элемента', '11 элементов']],
    ['a11y-identical-links-purpose', '2 link text(s) point to different destinations: "Find "$1"; a route" (2 targets), "Go, now" (5 targets)', ['Find "$1"; a route', 'Go, now', '2 адреса', '5 адресов']],
    ['content-duplicate-near', 'Near-duplicate content detected: 94% similar to https://example.com/news?year=2025', ['94%', 'https://example.com/news?year=2025']],
    ['content-date-agreement', 'schema datePublished 2022 disagrees with URL year 2024; URL year 2024 is not among visible time years 2022, 2023', ['datePublished', '2022', '2024', '2022, 2023']],
    ['content-placeholder-text', 'Visible text contains unrendered template syntax: {{ title }}; <% user\n.name %>', ['{{ title }}', '<% user\n.name %>']],
    ['content-reading-level', 'Acceptable readability: 67.5 (Standard (8th-9th grade))', ['67.5', '8-9-й класс']],
    ['core-canonical-header', 'Canonical mismatch: HTML tag "https://example.com/page1" differs from Link header "https://example.com/page2"', ['https://example.com/page1', 'https://example.com/page2']],
    ['core-nosnippet', 'Page blocks search snippets: Meta robots contains "nosnippet"; X-Robots-Tag header contains "max-snippet:0" (blocks snippets)', ['"nosnippet"', '"max-snippet:0"', 'X-Robots-Tag']],
    ['core-title-length', 'Title is too long (81 characters). Recommended: 30-60 characters', ['81 символ', '30-60']],
    ['crawl-canonical-redirect', 'Canonical URL has 4-redirect chain', ['4 перенаправления']],
    ['crawl-sitemap-domain', '2 of 9 sitemap URLs (22.2%) have incorrect domain', ['2 из 9', '22.2%']],
    ['crawl-sitemap-orphan-urls', '2 sitemap URL(s) (66.7%) are not linked from any crawled page; the sitemap was read in part (1 sitemap could not be fetched, URLs past 50,000 were dropped), so there may be more', ['2 URL', '66.7%', 'не удалось получить sitemap: 1', '50,000']],
    ['crawl-sitemap-url-limit', 'Sitemap https://example.com/eu.xml contains 60,001 URLs, exceeding the 50,000 limit', ['https://example.com/eu.xml', '60,001', '50,000']],
    ['eeat-nap-consistency', 'Acme, Inc.; Europe has 2 phone numbers; Northwind Ltd. has 3 addresses', ['Acme, Inc.; Europe', '2 номера телефона', 'Northwind Ltd.', '3 адреса']],
    ['eeat-privacy-policy', 'Privacy policy link found in footer (21 links)', ['в подвале страницы', '21 ссылка']],
    ['eeat-ymyl-detection', 'YMYL content detected: health, legal (high confidence)', ['YMYL', 'здоровье, право', 'высокая уверенность']],
    ['geo-ai-bot-access', '2 AI answer engine(s) blocked in robots.txt: ClaudeBot, OAI-SearchBot', ['2', 'robots.txt', 'ClaudeBot, OAI-SearchBot']],
    ['geo-content-signals', 'Content-Signal problem: unknown key experimental; ai-train=yes while GPTBot is disallowed', ['Content-Signal', 'experimental', 'ai-train=yes', 'GPTBot']],
    ['geo-markdown-page', 'https://example.com/docs/start.md is available', ['https://example.com/docs/start.md']],
    ['htmlval-base-url', '<base> href is empty or malformed: empty href, "javascript:void(0)" (invalid-protocol). Relative links on the page may not resolve correctly for crawlers', ['<base>', 'пустой href', 'javascript:void(0)', 'недопустимый протокол']],
    ['htmlval-body-structure', '2 <body> start tags (at character 76); text between <html> and <head> (at character 6)', ['<body>: 2', '76', '<html>', '<head>', 'позиция: 6']],
    ['htmlval-title-outside-head', 'Found 2 <title> element(s) outside of <head>. Search engines may ignore a title that is not in <head>', ['2', '<title>', '<head>']],
    ['i18n-hreflang-lang-mismatch', 'HTML lang "en-GB" does not match hreflang self-reference "fr-FR"', ['en-GB', 'fr-FR']],
    ['i18n-hreflang-to-redirect', 'Found hreflang URL(s) likely to redirect: 1 using HTTP on an HTTPS site; 2 returned a 3xx redirect during the crawl', ['HTTP', 'HTTPS', '3xx', ': 1', ': 2']],
    ['i18n-lang-attribute', 'HTML lang attribute set to "ru-RU"', ['lang', 'ru-RU']],
    ['images-alt-present', 'Found 11 image(s) missing alt attribute (27.5% of images)', ['11 изображений', 'alt', '27.5%']],
    ['images-oversized-delivery', '1 image(s) are larger than they are shown, wasting about 480 KiB', ['1 изображения', '480 KiB']],
    ['images-picture-element', '2 picture element(s) missing img fallback; 3 picture element(s) without source elements', ['без резервного img: 2', 'без элементов source: 3']],
    ['js-ajax-crawling-scheme', '2 internal link(s) use #! URLs and the page declares <meta name="fragment" content="!">; Google no longer supports the AJAX crawling scheme', ['#!', '2', '<meta name="fragment" content="!">', 'Google', 'AJAX']],
    ['js-console-errors', '1 uncaught JavaScript error(s) while rendering: TypeError: $1\nat init (https://example.com/app.js:32:5)', ['1', 'TypeError: $1\nat init (https://example.com/app.js:32:5)']],
    ['js-failed-requests', '2 script/stylesheet request(s) failed while rendering: script HTTP 503: https://example.com/app.js', ['2', 'скрипт HTTP 503', 'https://example.com/app.js']],
    ['js-rendered-title', 'Needs a browser render: rerun with --render', ['--render']],
  ])('%s translates %s and retains the values', (ruleId, message, values) => {
    const translated = trMessage(ruleId, message);
    expect(translated).toMatch(cyrillic);
    expect(translated).not.toBe(message);
    for (const value of values) expect(translated).toContain(value);
  });

  it('keeps the original message when English is selected', () => {
    const message = '22 empty heading(s) found';
    setLocale('en');
    expect(trMessage('a11y-empty-heading', message)).toBe(message);
  });

  it('anchors every regex to the full message', () => {
    for (const [id, patterns] of Object.entries(MESSAGES_RU_A)) {
      for (const [regex] of patterns) {
        expect(regex.source, id).toMatch(/^\^.*\$$/s);
      }
    }
  });

  it('has an entry for each registered rule in these categories', () => {
    // Keep translations for older audits that include retired rules.
    const retired = ['content-author-info', 'content-freshness'];
    expect(Object.keys(MESSAGES_RU_A).sort()).toEqual([...rules.map(({ id }) => id), ...retired].sort());
  });

  it('reports untranslated messages from every rule on several fixture pages', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    const root = 'https://example.com';
    // Shapes used in the core canonical, axe, HTML validation, and
    // partial-sitemap fixtures in src/rules and src/site.
    const healthy = createTestContext('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A descriptive page title</title></head><body><header>Site</header><nav>Navigation</nav><main><h1>Heading</h1><img src="/hero.webp" alt="A mountain at dawn" width="300" height="200"></main><footer>Site footer</footer></body></html>');
    const broken = createTestContext('<html lang="abc-XY">stray text<head><title>x</title><div>broken head</div><link rel="canonical" href="/redirect"><link rel="alternate" hreflang="fr-FR" href="http://example.com/fr"><meta name="robots" content="noindex, nosnippet"><meta name="fragment" content="!"><script type="application/ld+json">{"@type":"Article","datePublished":"2022-01-01"}</script></head><body><marquee>News</marquee><nav></nav><nav></nav><main><main><h1></h1><h3>Lorem ipsum dolor sit amet</h3><div role="tab"></div><button></button><form><input type="email"></form><time datetime="2023-01-01">2023</time><a href="/a">More</a><a href="/b">More</a><img src="/missing.jpg"><picture></picture><figure></figure><p>{{ title }}</p></main></main><body></body></html>', {
      url: root + '/2024/broken?page=2',
      headers: { link: '<https://example.com/canonical>; rel="canonical"', 'x-robots-tag': 'index, max-snippet:0' },
    });
    const violation = (id: string): AxeViolation => ({
      id, impact: 'serious', tags: ['wcag2a'], help: '', helpUrl: '', nodes: 2, targets: ['#a', '#b'],
    });
    const rendered = createTestContext('<html lang="en"><head><title>New title</title><meta name="robots" content="nofollow"></head><body><h1>New heading</h1></body></html>');
    const { contexts } = await createTestSite([
      { url: root + '/a', html: '<html><head><title>Shared title</title></head><body><a href="/b">b</a></body></html>' },
      { url: root + '/b', html: '<html><head><title>Shared title</title></head><body><a href="/a">a</a></body></html>' },
      { url: root + '/fr', html: '<html lang="fr"></html>', statusCode: 301 },
      { url: root + '/lost', html: '<html lang="en"></html>' },
    ]);
    const crawled = contexts.get(root + '/a')!;
    const fixtures = [
      createTestContext('<html><head></head><body></body></html>'),
      createAuditContext(healthy.url, healthy),
      {
        ...createAuditContext(broken.url, broken),
        robotsTxtContent: 'User-agent: GPTBot\nDisallow: /\nContent-Signal: ai-train=yes, incorrect\nCrawl-delay: 25\nSitemap: https://example.com/sitemap.xml',
      },
      {
        ...createAuditContext(broken.url, broken),
        renderedHtml: rendered.html,
        rendered$: rendered.$,
        renderDiagnostics: {
          pageErrors: ['ReferenceError: dataLayer is not defined'],
          consoleMessages: [],
          failedRequests: [{ url: root + '/app.js', resourceType: 'script', method: 'GET', failure: 'HTTP 503' }],
        },
        probes: { axe: { version: '4.14.1', violations: [violation('marquee'), violation('region'), violation('color-contrast')] } },
      },
      {
        ...crawled,
        sitemapUrls: [root + '/a', root + '/b', root + '/unknown'],
        sitemapComplete: false,
        sitemapSkippedCount: 1,
        sitemapGaps: [{ kind: 'fetch-failed' as const, url: root + '/b.xml', status: 503 }],
      },
    ];

    const untranslated = new Set<string>();
    for (const fixture of fixtures) {
      for (const rule of rules) {
        const { message } = await rule.run(fixture);
        const translated = trMessage(rule.id, message);
        if (!translated || translated === message || !cyrillic.test(translated)) {
          untranslated.add(rule.id + ' → ' + message);
        }
      }
    }

    const summary = rules.length + ' rules × ' + fixtures.length + ' fixtures';
    if (untranslated.size) {
      console.warn(summary + ': untranslated results\n' + [...untranslated].sort().join('\n'));
    } else {
      console.info(summary + ': all observed results are translated');
    }
  });
});
