/**
 * What the audit detail page says about a run, beyond its findings: why a
 * check took no reading, whether a render would add checks, how much of the
 * site was measured. Pure functions, so the wording is tested once and both
 * surfaces (desktop and web) say the same thing.
 */
import type { AuditResult, NotMeasuredReason, RuleResult, ScoreCap } from '../../src/types.js';
import { plural } from '../../src/i18n/index.js';
import { formatChecks, formatCount, formatNumber } from './format.js';
import { isNotMeasured } from '../../src/rules/define-rule.js';

/** Each reason's label, and the one thing to do about it */
export const NOT_MEASURED_REASONS: Record<NotMeasuredReason, { label: string; action?: string }> = {
  'not-applicable': { label: 'не применимо' },
  'needs-render': { label: 'нужна отрисовка в браузере', action: 'Включите «Core Web Vitals и отрисовка в браузере» и проверьте снова' },
  'needs-crawl': { label: 'нужен обход сайта', action: 'Включите «Обход сайта по ссылкам» и проверьте снова' },
  'could-not-verify': { label: 'не удалось проверить', action: 'Попробуйте позже. Сайт или сторонний сервис не ответил' },
  'not-compared': { label: 'сравнение не выполнено', action: 'Сравниваются только страницы, доступные для индексации, с canonical на себя' },
  'probe-failed': { label: 'не удалось выполнить проверку', action: 'Включите отрисовку в браузере и проверьте снова. Страница не ответила' },
  disabled: { label: 'отключено в настройках', action: 'Включите в sitemetr.toml' },
  unsupported: { label: 'недоступно в этой сборке', action: 'Запустите из командной строки или веб-панели' },
  'rule-error': { label: 'не удалось выполнить проверку', action: 'Сообщите об ошибке проверки' },
};

/** A not-measured result's reason; old rows without one count as "could not verify" */
export function reasonOf(result: Pick<RuleResult, 'reason'>): NotMeasuredReason {
  return result.reason ?? 'could-not-verify';
}

function allResults(result: AuditResult): RuleResult[] {
  return result.categoryResults.flatMap((category) => category.results);
}

/** Not-measured results grouped by reason, largest group first */
export function notMeasuredByReason(result: AuditResult): Array<{ reason: NotMeasuredReason; label: string; ruleIds: string[] }> {
  const groups = new Map<NotMeasuredReason, Set<string>>();
  for (const rule of allResults(result)) {
    if (!isNotMeasured(rule)) continue;
    const reason = reasonOf(rule);
    if (!groups.has(reason)) groups.set(reason, new Set());
    groups.get(reason)!.add(rule.ruleId);
  }
  return [...groups]
    .map(([reason, ids]) => ({ reason, label: NOT_MEASURED_REASONS[reason].label, ruleIds: [...ids].sort() }))
    .sort((a, b) => b.ruleIds.length - a.ruleIds.length || a.label.localeCompare(b.label, 'ru-RU'));
}

/** "N checks need a browser render", or null when none do */
export function renderHint(result: AuditResult, browserRender: boolean): string | null {
  const count = notMeasuredByReason(result).find((group) => group.reason === 'needs-render')?.ruleIds.length ?? 0;
  if (count === 0) return null;
  const checks = `Нужна отрисовка в браузере (${formatChecks(count)})`;
  return browserRender ? `${checks} · Проверьте снова с отрисовкой` : `${checks} · Недоступна в этой сборке`;
}

/** How the run ended: every page measured, or some not */
export function completionLabel(result: AuditResult): 'Завершено' | 'Проверка неполная' {
  if (result.completionState === 'completed-with-gaps') return 'Проверка неполная';
  const coverage = result.coverage;
  const gaps = (coverage?.rateLimited ?? 0) + (coverage?.failed ?? 0) + (coverage?.notFetched ?? 0);
  return gaps > 0 ? 'Проверка неполная' : 'Завершено';
}

/** Coverage when the crawl could not measure every page. */
export function coverageText(result: AuditResult): string | null {
  const coverage = result.coverage;
  if (!coverage?.attempted || coverage.measured === undefined || coverage.measured >= coverage.attempted) return null;
  const parts = [`Измерено ${formatNumber(coverage.measured)} из ${formatNumber(coverage.attempted)} страниц`];
  if (coverage.rateLimited) parts.push(`лимит запросов: ${formatNumber(coverage.rateLimited)}`);
  if (coverage.failed) parts.push(`ошибка загрузки: ${formatNumber(coverage.failed)}`);
  if (coverage.notFetched) parts.push(`пропущено: ${formatNumber(coverage.notFetched)}`);
  return parts.join(' · ');
}

/** The engine sends activity as text in both transports. */
export function localizeActivity(activity: string): string {
  const links = /^Checking (\d+) external links?$/.exec(activity);
  if (links) {
    const count = Number(links[1]);
    const noun = plural(count, 'внешнюю ссылку', 'внешние ссылки', 'внешних ссылок');
    return `Проверяем ${formatNumber(count)} ${noun}`;
  }
  const wait = /^Waiting on (.+), (\d+) s \(it asked to slow down\)$/.exec(activity);
  if (wait) return `${wait[1]} ограничил частоту запросов. Ждём ${formatNumber(Number(wait[2]))} с`;
  const delay = /^(.+) asks for ([\d.]+) s between requests; this crawl may take up to (\d+) min$/.exec(activity);
  if (delay) {
    return `${delay[1]} просит ждать ${formatNumber(Number(delay[2]))} с между запросами. Обход может занять до ${formatNumber(Number(delay[3]))} мин`;
  }
  return activity;
}

/** Display reasons from current and stored audits without changing the persisted data. */
export function localizeCapReason({ id, reason }: ScoreCap): string {
  const start = /the start page \((.*?)\)(?= out of Google's index|, so search engines)/.exec(reason);
  const page = start ? `стартовую страницу (${start[1]})` : 'страницу';
  const words = /\b(\d+) words?\b/.exec(reason);
  const content = words ? formatCount(Number(words[1]), 'слово', 'слова', 'слов') : null;
  switch (id) {
    case 'noindex':
      return `Директива noindex (метатег robots или X-Robots-Tag) исключает ${page} из индекса Google. ${reason.endsWith('Remove it at launch.') ? 'Уберите её перед запуском сайта.' : 'Для тестового сайта запустите проверку с параметром --staging.'}`;
    case 'robots-disallowed':
      return `robots.txt запрещает Googlebot загружать ${page}. Поисковые системы не могут прочитать её содержимое. ${reason.endsWith('it at launch.') ? 'Уберите соответствующее правило Disallow перед запуском сайта.' : 'Уберите или сузьте соответствующее правило Disallow. Для тестового сайта используйте --staging.'}`;
    case 'empty-page':
      return content ? `На странице нет <title>, а в основном контенте всего ${content}. Поисковой системе нечего индексировать.` : reason;
    case 'thin-content':
      return content ? `В основном контенте страницы всего ${content}. Этого мало, чтобы поисковая система сопоставила страницу с поисковым запросом.` : reason;
    case 'no-title':
      return 'На странице нет <title>. Поисковые системы сами составят заголовок для выдачи.';
    default:
      return reason;
  }
}

/** Advisory findings: reported, not counted in the score yet */
export const ADVISORY_CHIP = 'Справочно, без оценки';

/** Counts the page's chip and stats show for advisory results */
export function advisoryCount(result: AuditResult): number {
  return allResults(result).filter((rule) => rule.advisory && !isNotMeasured(rule)).length;
}

/** The run page link for "Run again", carrying the stored run options */
export function rerunHref(startUrl: string, result: AuditResult, render = false): string {
  const params = new URLSearchParams({ url: startUrl });
  const run = result.run as { crawl?: boolean; maxPages?: number; measureCwv?: boolean } | undefined;
  if (render || run?.measureCwv) params.set('render', '1');
  if (run?.crawl) params.set('crawl', '1');
  if (run?.crawl && run.maxPages) params.set('maxPages', String(run.maxPages));
  return `/run?${params.toString()}`;
}
