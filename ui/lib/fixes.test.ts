import { describe, it, expect } from 'vitest';
import { agentLine, formatPointAmount, formatPoints, missingPoints, nextGrade, nextGradeLine, rankedFixes, splitFix, tied, type Fix } from './fixes.js';
import type { AuditResult } from '../../src/types.js';

function result(rules: Array<{ ruleId: string; status: string; message?: string; ruleName?: string; points?: number; priority?: number; advisory?: boolean; overridden?: { priority?: 'high' | 'normal' | 'low' | 'ignore' } }>, extra: Partial<AuditResult> = {}): AuditResult {
  return {
    url: 'https://example.com',
    overallScore: 90,
    timestamp: '2026-11-18T00:00:00Z',
    crawledPages: 1,
    categoryResults: [
      {
        categoryId: 'perf',
        score: 80,
        passCount: 0,
        warnCount: 0,
        failCount: 0,
        results: rules.map((r) => ({ message: '', score: 0, ...r })) as AuditResult['categoryResults'][number]['results'],
      },
    ],
    ...extra,
  } as AuditResult;
}

const fix = (points: number): Fix => ({ points } as Fix);

describe('splitFix', () => {
  it('makes the text before a colon or semicolon the headline', () => {
    expect(splitFix('Reduce DOM size: remove unused elements, use virtualization for long lists')).toEqual({
      headline: 'Reduce DOM size',
      rest: 'Remove unused elements, use virtualization for long lists',
    });
    expect(splitFix('Remove loading="lazy" from above-fold images; add fetchpriority="high"')).toEqual({
      headline: 'Remove loading="lazy" from above-fold images',
      rest: 'Add fetchpriority="high"',
    });
  });

  it('keeps a fix with no separator whole and drops a trailing full stop', () => {
    expect(splitFix('Add width and height attributes to prevent layout shifts.')).toEqual({
      headline: 'Add width and height attributes to prevent layout shifts',
      rest: '',
    });
  });

  it('does not split on a colon inside a value', () => {
    // "4.5:1" has no space after the colon
    expect(splitFix('Ensure text has minimum 4.5:1 contrast ratio against background').rest).toBe('');
  });
});

describe('rankedFixes', () => {
  it('translates the category and result while using the rule metadata as sent', () => {
    const ruleId = 'core-title-present';
    const audit = result([{ ruleId, status: 'fail', message: 'No <title> tag found in the document' }]);
    audit.categoryResults[0]!.categoryId = 'core';
    const metadata = { [ruleId]: { name: 'Название из метаданных', description: 'Описание из метаданных', fix: 'Добавьте <title>' } };
    const [fix] = rankedFixes(audit, metadata);
    expect(fix).toMatchObject({
      name: 'Название из метаданных',
      description: 'Описание из метаданных',
      headline: 'Добавьте <title>',
      categoryName: 'Основное SEO',
      message: 'В документе нет тега <title>',
    });
    expect(rankedFixes(audit, undefined)[0]?.name).toBe('Наличие тега title');
  });
  it('ranks by points across failures and warnings, not failures first', () => {
    const fixes = rankedFixes(
      result([
        { ruleId: 'narrow-fail', status: 'fail', points: 0.3 },
        { ruleId: 'heavy-warn', status: 'warn', points: 0.4 },
        { ruleId: 'passing', status: 'pass', points: 0 },
        { ruleId: 'unmeasured', status: 'not-measured', points: 0 },
        { ruleId: 'advisory-fail', status: 'fail', points: 0, advisory: true },
      ]),
      undefined
    );
    expect(fixes.map((f) => f.ruleId)).toEqual(['heavy-warn', 'narrow-fail']);
  });

  it('falls back to priority when a payload carries no points', () => {
    const fixes = rankedFixes(
      result([
        { ruleId: 'a', status: 'warn', priority: 10 },
        { ruleId: 'b', status: 'fail', priority: 40 },
      ]),
      undefined
    );
    expect(fixes.map((f) => f.ruleId)).toEqual(['b', 'a']);
  });

  it('leaves ignored findings out without losing their missing score points', () => {
    const audit = result([
      { ruleId: 'visible', status: 'fail', points: 2 },
      { ruleId: 'ignored', status: 'fail', points: 5, overridden: { priority: 'ignore' } },
    ]);
    const all = rankedFixes(audit, undefined, { includeIgnored: true });
    const fixes = rankedFixes(audit, undefined);
    expect(fixes.map((f) => f.ruleId)).toEqual(['visible']);
    expect(missingPoints(all)).toBe(7);
    expect(agentLine(fixes, audit, missingPoints(all))).toBe(
      '1 исправление вернёт 2 балла. Странице не хватает 7 баллов.'
    );
  });

  it('applies high and low priority to the order while printing exact points', () => {
    const fixes = rankedFixes(
      result([
        { ruleId: 'ordinary', status: 'fail', points: 2 },
        { ruleId: 'urgent', status: 'fail', points: 1, overridden: { priority: 'high' } },
        { ruleId: 'later', status: 'fail', points: 20, overridden: { priority: 'low' } },
      ]),
      undefined
    );
    expect(fixes.map((f) => f.ruleId)).toEqual(['later', 'urgent', 'ordinary']);
    expect(fixes.map((f) => f.points)).toEqual([20, 1, 2]);
  });
});

describe('formatPoints and tied', () => {
  it('agrees with Russian whole and fractional amounts', () => {
    expect([1, 2, 5, 11, 21, 22.4, 4.97].map((n) => formatPointAmount(n))).toEqual([
      '1 балл', '2 балла', '5 баллов', '11 баллов', '21 балл', '22,4 балла', '5 баллов',
    ]);
    expect([1, 2, 21, 3.5].map((n) => formatPointAmount(n, 1, 'genitive')))
      .toEqual(['1 балла', '2 баллов', '21 балла', '3,5 балла']);
  });
  it('prints one decimal, and never "+0,0" for a fix worth something', () => {
    expect(formatPoints(0.57)).toBe('+0,6');
    expect(formatPoints(0.02)).toBe('+<0,1');
    expect(formatPoints(0)).toBe('+0,0');
  });

  it('calls two fixes tied when they print the same', () => {
    expect(tied(fix(0.571), fix(0.568))).toBe(true);
    expect(tied(fix(0.57), fix(0.43))).toBe(false);
    expect(tied(fix(0.57), undefined)).toBe(false);
  });
});

describe('agentLine', () => {
  const page = result([]);

  it('says what the first five return of what is missing', () => {
    // The 2026-11-18 the reference site audit: 0.57, 0.57, 0.43, 0.43, 0.38, then more
    const fixes = [0.57, 0.57, 0.43, 0.43, 0.38, 0.35, 0.34].map(fix);
    expect(agentLine(fixes, page)).toBe(
      'Начните с первых пяти исправлений. Они вернут 2,4 балла. Странице не хватает 3,1 балла.'
    );
  });

  it('claims "more than the next four" only when it is true', () => {
    expect(agentLine([5, 1, 1, 1, 1, 0.5].map(fix), page)).toMatch(/больше баллов, чем следующие четыре вместе/);
    expect(agentLine([2, 1, 1, 1, 1, 0.5].map(fix), page)).not.toMatch(/следующие четыре/);
  });

  it('speaks to the whole site on a crawl', () => {
    expect(agentLine([0.5, 0.2].map(fix), { ...page, crawledPages: 40 })).toBe(
      'Сайту не хватает 0,7 балла. 2 исправления вернут все недостающие баллы.'
    );
  });

  it('puts the cap first while one holds, and has nothing to say when nothing failed', () => {
    const capped = { ...page, scoreCap: { uncappedScore: 88, caps: [{ id: 'noindex', ceiling: 20, reason: '' }] } };
    expect(agentLine([fix(1)], capped)).toBe('Сначала снимите ограничение оценки. После этого исправления из очереди смогут повысить оценку.');
    expect(agentLine([], page)).toBe('По измеренным проверкам исправлений нет.');
  });
});

describe('nextGrade', () => {
  it('measures to half a point under the threshold, because the grade reads the rounded score', () => {
    // 89.4 rounds to 89 (Good); 89.5 already rounds to 90 (Excellent)
    expect(nextGrade(89.4, [fix(0.3)])).toEqual({ label: 'Отлично', gap: expect.closeTo(0.1, 9), fixes: 1 });
    expect(nextGrade(89.5, [fix(0.3)]).label).toBeNull();
  });

  it('counts the shortest run from the top of the queue that covers the gap', () => {
    // 76.0 -> Good needs 3.5: 2 + 1 is 3.0, the third fix covers it
    expect(nextGrade(76, [2, 1, 1, 1].map(fix))).toEqual({ label: 'Хорошо', gap: 3.5, fixes: 3 });
  });

  it('says so at the top grade', () => {
    expect(nextGradeLine(91.24, [fix(8.76)])).toBe('Высшая оценка. До 100 не хватает 8,8 балла.');
    expect(nextGradeLine(100, [])).toBe('Высшая оценка. Исправлений больше нет.');
    expect(nextGradeLine(76, [2, 1, 1, 1].map(fix))).toBe('До оценки «Хорошо» не хватает 3,5 балла. Достаточно выполнить первые 3 исправления.');
  });
});
