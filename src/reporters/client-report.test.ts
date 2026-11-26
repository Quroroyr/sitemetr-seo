import { describe, expect, it } from 'vitest';
import '../rules/loader.js'; // rule weights and advisory flags come from the registry
import { clientFixQueue, clientReportFileName, renderClientReportHtml, TOP_FIXES } from './client-report.js';
import type { AuditResult, CategoryResult, RuleResult } from '../types.js';

function rule(ruleId: string, status: RuleResult['status'], pageUrl = 'https://example.ru/'): RuleResult {
  return {
    ruleId,
    status,
    score: status === 'pass' ? 100 : status === 'warn' ? 50 : 0,
    weight: 1,
    message: status === 'fail' ? 'No <link rel="canonical"> tag found in the document' : `${ruleId} says something`,
    details: { pageUrl },
  };
}

function category(categoryId: string, results: RuleResult[], score = 60): CategoryResult {
  return {
    categoryId,
    score,
    passCount: results.filter((r) => r.status === 'pass').length,
    warnCount: results.filter((r) => r.status === 'warn').length,
    failCount: results.filter((r) => r.status === 'fail').length,
    notMeasuredCount: 0,
    results,
  };
}

function audit(categoryResults: CategoryResult[], overrides: Partial<AuditResult> = {}): AuditResult {
  return {
    url: 'https://example.ru/',
    overallScore: 72,
    timestamp: '2026-11-21T10:00:00.000Z',
    crawledPages: 1,
    categoryResults,
    ...overrides,
  } as AuditResult;
}

describe('clientFixQueue', () => {
  it('lists each scored rule once, worst status first, and leaves advisory rules out', () => {
    const result = audit(
      [
        category('core', [
          rule('core-canonical-present', 'fail', 'https://example.ru/a'),
          rule('core-canonical-present', 'warn', 'https://example.ru/b'),
          rule('core-title-present', 'pass'),
        ]),
        // advisory: reported, never a fix to rank
        category('yandex', [rule('yandex-metrika', 'warn')]),
      ],
      { crawledPages: 2 }
    );
    const queue = clientFixQueue(result);
    expect(queue.map((f) => f.ruleId)).toEqual(['core-canonical-present']);
    expect(queue[0]!.status).toBe('fail');
    expect(queue[0]!.pageCount).toBe(2);
  });

  it('speaks Russian: fix headline, rule name, message and category', () => {
    const [fix] = clientFixQueue(audit([category('core', [rule('core-canonical-present', 'fail')])]));
    expect(fix!.headline).toMatch(/^Добавьте <link rel="canonical"/);
    expect(fix!.message).toBe('В документе нет тега <link rel="canonical">');
    expect(fix!.categoryName).toBe('Основное SEO');
    expect(fix!.points).toBeGreaterThan(0);
  });

  it('ranks by the points a fix returns', () => {
    const queue = clientFixQueue(
      audit([
        category('legal', [rule('legal-cookie-consent', 'fail')]),
        category('core', [rule('core-canonical-present', 'fail')]),
      ])
    );
    expect(queue.map((f) => f.ruleId)).toEqual(['core-canonical-present', 'legal-cookie-consent']);
    expect(queue[0]!.points).toBeGreaterThan(queue[1]!.points);
  });
});

describe('renderClientReportHtml', () => {
  const many = Array.from({ length: 8 }, (_, i) => `core-x${i}`);
  const result = audit([
    category('core', [rule('core-canonical-present', 'fail'), rule('core-title-present', 'warn')]),
    category('security', [rule('security-hsts', 'fail')], 40),
  ]);

  it('is a Russian A4 document with the brand, the host and the score', () => {
    const html = renderClientReportHtml(result, { generatedAt: new Date('2026-11-21T12:00:00Z') });
    expect(html).toContain('<html lang="ru">');
    expect(html).toContain('@page { size: A4');
    expect(html).toContain('сайтметр');
    expect(html).toContain('SEO-аудит example.ru');
    expect(html).toContain('72<small>/100</small>');
    expect(html).toContain('Что исправить в первую очередь');
    expect(html).not.toContain('<script');
  });

  it('prints points with a single sign', () => {
    const html = renderClientReportHtml(result);
    expect(html).toMatch(/>\+\d+,\d</);
    expect(html).not.toContain('++');
  });

  it('features at most five fixes on page one and lists every one below', () => {
    const big = audit([
      category(
        'core',
        many.map(() => rule('core-canonical-present', 'fail'))
      ),
      ...['security-hsts', 'security-x-frame-options', 'security-x-content-type-options', 'social-og-title', 'social-og-image', 'schema-present'].map((id) =>
        category(id.split('-')[0]!, [rule(id, 'fail')])
      ),
    ]);
    const html = renderClientReportHtml(big);
    expect((html.match(/class="top-fix"/g) ?? []).length).toBe(TOP_FIXES);
    expect(html).toContain(`Все исправления (${clientFixQueue(big).length})`);
  });

  it('names who prepared it, escaped', () => {
    const html = renderClientReportHtml(result, { preparedBy: 'Студия <Вектор>' });
    expect(html).toContain('Подготовил: Студия &lt;Вектор&gt;');
  });

  it('escapes page data', () => {
    const hostile = audit([category('core', [{ ...rule('core-title-present', 'warn'), message: '<img src=x onerror=alert(1)>' }])]);
    expect(renderClientReportHtml(hostile)).not.toContain('<img src=x');
  });
});

describe('clientReportFileName', () => {
  it('is built from the host and the audit date', () => {
    expect(clientReportFileName(audit([]))).toBe('seo-audit-example.ru-2026-11-21.pdf');
  });
});
