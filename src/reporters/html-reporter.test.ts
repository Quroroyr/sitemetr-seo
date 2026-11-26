import { afterEach, describe, it, expect, vi } from 'vitest';
// Side-effect import: registers every rule, so the reporter resolves real rule
// names and descriptions rather than falling back to the formatted rule id.
import '../rules/loader.js';
import { renderHtmlReport } from './html-reporter.js';
import { renderMarkdownReport } from './markdown-reporter.js';
import * as i18n from '../i18n/index.js';
import type { AuditResult, RuleResult } from '../types.js';

/**
 * Slice out one rule card by id.
 *
 * Matching on the id alone finds the issues-summary table row first, since that
 * table renders above the category sections. The status attribute precedes the
 * id on the card itself, which is what makes the match unambiguous.
 */
function cardFor(html: string, status: string, ruleId: string): string {
  const start = html.indexOf(`data-status="${status}" data-rule-id="${ruleId}"`);
  expect(start).toBeGreaterThan(-1);
  const end = html.indexOf('<div class="rule-card"', start + 1);
  return html.slice(start, end === -1 ? undefined : end);
}

/**
 * A result that took no reading. `notMeasured()` encodes this as status 'warn'
 * with weight 0, because RuleResult has no fourth status — weight 0 is the only
 * marker distinguishing it from a real warning.
 */
function unmeasured(ruleId: string, message: string, url: string): RuleResult {
  return { ruleId, status: 'warn', message, score: 50, weight: 0, details: { url } };
}

function weighted(
  ruleId: string,
  status: 'pass' | 'warn' | 'fail',
  message: string,
  url: string
): RuleResult {
  return {
    ruleId,
    status,
    message,
    score: status === 'pass' ? 100 : status === 'warn' ? 50 : 0,
    weight: 1,
    details: { url },
  };
}

function buildResult(overrides: Partial<AuditResult> = {}): AuditResult {
  const url = 'https://example.com';
  return {
    url,
    overallScore: 85,
    timestamp: '2026-05-08T00:00:00.000Z',
    crawledPages: 1,
    categoryResults: [
      {
        categoryId: 'perf',
        score: 90,
        passCount: 1,
        warnCount: 1,
        failCount: 1,
        notMeasuredCount: 1,
        results: [
          weighted('cwv-lcp', 'pass', 'LCP is 0.44s (good, under 2.5s)', url),
          weighted('perf-page-weight', 'warn', 'HTML document is 200KB', url),
          weighted('perf-render-blocking', 'fail', 'Render-blocking resources found', url),
          unmeasured('cwv-inp', 'INP not measured - it requires real user interaction', url),
        ],
      },
    ],
    ...overrides,
  };
}

describe('renderHtmlReport — unmeasured checks are not warnings', () => {
  it('gives a weight-0 result its own display status rather than amber', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('data-rule-id="cwv-inp"');
    expect(out).toMatch(/data-status="notmeasured" data-rule-id="cwv-inp"/);
    // The real warning keeps its amber status.
    expect(out).toMatch(/data-status="warn" data-rule-id="perf-page-weight"/);
  });

  it('counts it separately from warnings in the filter tabs', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toMatch(/Предупреждения <span class="filter-tab-count">1<\/span>/);
    expect(out).toMatch(/Не измерено <span class="filter-tab-count">1<\/span>/);
  });

  it('offers no fix advice for a check that took no reading', () => {
    const inpCard = cardFor(renderHtmlReport(buildResult()), 'notmeasured', 'cwv-inp');
    expect(inpCard).not.toContain('Как исправить');
    expect(inpCard).toContain('Не измерено');
  });

  it('still offers fix advice for a real warning', () => {
    const warnCard = cardFor(renderHtmlReport(buildResult()), 'warn', 'perf-page-weight');
    expect(warnCard).toContain('Как исправить');
  });

  it('keeps unmeasured checks out of the issues-to-fix table', () => {
    const out = renderHtmlReport(buildResult());
    const table = out.slice(out.indexOf('issues-summary'), out.indexOf('</table>'));
    expect(table).toContain('perf-page-weight');
    expect(table).not.toContain('cwv-inp');
  });

  it('omits the Not measured tab entirely when every check took a reading', () => {
    const result = buildResult();
    result.categoryResults[0].results = result.categoryResults[0].results.filter(
      (r) => r.weight !== 0
    );
    const out = renderHtmlReport(result);
    expect(out).not.toContain('data-filter="notmeasured"');
  });
});

describe('renderHtmlReport — single-page reports', () => {
  it('drops the per-rule page link when the report covers one URL', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).not.toContain('class="pages-inline"');
    expect(out).not.toContain('<th>Страницы</th>');
  });

  it('keeps the per-rule page link once a second URL appears', () => {
    const result = buildResult();
    result.crawledPages = 2;
    result.categoryResults[0].results.push(
      weighted('cwv-lcp', 'fail', 'LCP is 5.1s', 'https://example.com/pricing')
    );
    const out = renderHtmlReport(result);
    expect(out).toContain('class="pages-inline"');
    expect(out).toContain('<th>Страницы</th>');
  });

  it('names the site root in Russian', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('<span>Главная</span>');
  });
});

describe('renderHtmlReport — branding', () => {
  it('inlines the wordmark so the report needs no network fetch', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('aria-label="Сайтметр"');
    expect(out).toContain('<span class="brand-word">сайтметр</span>');
    expect(out).not.toContain('logo.svg');
    expect(out).not.toMatch(/<img[^>]+src="https?:/);
  });

  it('carries Geist and Geist Mono inline, so the report reads in brand type offline', () => {
    // A path here would point at a file next to whatever built the report;
    // an emailed report has no such file (DESIGN.md, Typography).
    const out = renderHtmlReport(buildResult());
    const faces = out.match(/@font-face \{ font-family: '(Geist(?: Mono)? Variable)'; src: url\(data:font\/woff2;base64,/g) ?? [];
    expect(faces).toHaveLength(2);
  });

  it('draws the cobalt emblem and inlines the tab icon', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('fill="#2F5BEA"');
    expect(out).toMatch(/<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+">/);
  });

  it('sets a Russian page title and links the project in the footer', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('<html lang="ru">');
    expect(out).toContain('<title>Сайтметр — отчёт о проверке https://example.com</title>');
    expect(out).toContain('SEO-аудит сайта с открытым кодом');
    expect(out).not.toContain('на основе');
  });

  it('opens the project link safely in a new tab', () => {
    const out = renderHtmlReport(buildResult());
    expect(out).toContain('href="https://github.com/Quroroyr/sitemetr-seo" target="_blank" rel="noopener"');
  });
});

describe('renderHtmlReport — the finding leads the card', () => {
  it('renders the measured result above the rule definition', () => {
    const card = cardFor(renderHtmlReport(buildResult()), 'pass', 'cwv-lcp');
    const message = card.indexOf('class="rule-message"');
    const description = card.indexOf('class="rule-description"');
    expect(message).toBeGreaterThan(-1);
    // The definition is present for reference, but the finding reads first.
    expect(description).toBeGreaterThan(message);
  });
});

describe('client report translations', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses the rule overlay in both formats and translates the queue before splitting advice', () => {
    const ruleId = 'perf-page-weight';
    vi.spyOn(i18n, 'trRuleName').mockImplementation((id, fallback) => id === ruleId ? 'Размер HTML' : fallback);
    vi.spyOn(i18n, 'trRuleDescription').mockImplementation((id, fallback) => id === ruleId ? 'Размер влияет на загрузку страницы' : fallback);
    vi.spyOn(i18n, 'trFix').mockImplementation((id, fallback) => id === ruleId ? 'Уменьшите HTML: сократите разметку' : fallback);
    vi.spyOn(i18n, 'trMessage').mockImplementation((id, fallback) => id === ruleId ? 'Размер <html> — 200KB' : fallback);

    const result = buildResult();
    const html = renderHtmlReport(result);
    const card = cardFor(html, 'warn', ruleId);
    expect(html).toContain('<div class="issue-row-text">Уменьшите HTML</div>');
    expect(html).toContain('<span class="category-name" title="Core Web Vitals,');
    expect(card).toContain('<span class="rule-title">Размер HTML</span>');
    expect(card).toContain('Размер &lt;html&gt; — 200KB');
    expect(card).toContain('Размер влияет на загрузку страницы');
    expect(card).toContain('Уменьшите HTML: сократите разметку');

    const markdown = renderMarkdownReport(result);
    expect(markdown).toContain('# Сайтметр — отчёт о проверке сайта');
    expect(markdown).toContain('| Скорость — Core Web Vitals,');
    expect(markdown).toContain('### Размер HTML (`perf-page-weight`)');
    expect(markdown).toContain('**Что нашли:** Размер &lt;html&gt; — 200KB');
    expect(markdown).toContain('**Почему это важно:** Размер влияет на загрузку страницы');
    expect(markdown).toContain('**Как исправить:** Уменьшите HTML: сократите разметку');
  });
});
