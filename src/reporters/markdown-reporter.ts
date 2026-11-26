import type { AuditResult, ScoreCap } from '../types.js';
import type { CustomResults } from '../custom/custom-checks.js';
import { collectFindings, type Finding } from './findings.js';
import { collectIgnoredFindings } from '../rules/overrides.js';
import { brokenExternalSection } from './external-links-section.js';
import type { ExternalLinksExtras } from '../site/external-links.js';
import type { LinkScoreSummary } from '../site/link-score.js';
import { customResults, customSearchRows } from './custom-section.js';
import { scoreToVerdict } from '../verdict.js';
import { getCategoryById } from '../categories/index.js';
import { getRuleById } from '../rules/registry.js';
import { getFixSuggestion } from './fix-suggestions.js';
import { BRAND_NAME } from '../design/brand.js';
import { plural, trCategoryDescription, trCategoryName, trFix, trMessage, trRuleDescription, trRuleName } from '../i18n/index.js';

// Wording shared by the two client-facing exports.
export const REPORT_STATUS = {
  fail: 'Ошибка',
  warn: 'Предупреждение',
  pass: 'Пройдено',
  notmeasured: 'Не измерено',
  stopped: 'Прервано',
  unchecked: 'Не проверено',
} as const;

export const reportDecimal = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function reportPageCount(count: number): string {
  return `${count.toLocaleString('ru-RU')} ${plural(count, 'страница', 'страницы', 'страниц')}`;
}

export function reportCustomSearchRows(custom: CustomResults) {
  return customSearchRows(custom).map((row, index) => {
    const { expect, checked, failing, stopped } = custom.searches[index]!;
    const expectation = expect === 'present' ? 'ожидалось совпадение' : 'совпадений быть не должно';
    const limit = stopped > 0 ? `. Время проверки истекло на ${stopped} ${plural(stopped, 'странице', 'страницах', 'страницах')}` : '';
    const summary = row.outcome === 'unchecked'
      ? 'Нет подходящих страниц'
      : failing > 0
        ? `Проверка выявила проблему на ${failing} из ${checked} ${plural(checked, 'страницы', 'страниц', 'страниц')}`
        : `${reportPageCount(checked)} ${plural(checked, 'прошла', 'прошли', 'прошли')} проверку`;
    return { ...row, outcome: REPORT_STATUS[row.outcome], summary: `${summary} (${expectation})${limit}` };
  });
}

export function reportBrokenExternalSection(result: AuditResult, maxTargets: number, maxPages: number) {
  const section = brokenExternalSection(result, maxTargets, maxPages);
  if (!section) return null;
  const external = result.extras?.externalLinks as ExternalLinksExtras;
  const reasons = new Map([
    ['domain does not resolve', 'Домен не найден в DNS'],
    ['connection refused', 'Сервер отклонил соединение'],
    ['no response', 'Нет ответа'],
  ]);
  const aside = [
    external.couldNotVerify > 0 ? `Не удалось проверить ${external.couldNotVerify}` : '',
    external.notChecked > 0 ? `Не проверено ${external.notChecked}` : '',
  ].filter(Boolean).join(' · ');
  return {
    ...section,
    aside,
    targets: section.targets.map((target) => ({ ...target, reason: reasons.get(target.reason) ?? target.reason })),
  };
}

export function reportCapReason(cap: ScoreCap): string {
  const { id, reason } = cap;
  const startUrl = /the start page \((.+)\)/.exec(reason)?.[1];
  const subject = startUrl ? `стартовую страницу (${startUrl})` : 'эту страницу';
  if (id === 'noindex') {
    const explanation = `Директива noindex (мета-тег robots или X-Robots-Tag) исключает ${subject} из индекса Google.`;
    return reason.endsWith('Remove it at launch.')
      ? `${explanation} Уберите директиву перед запуском сайта.`
      : `${explanation} Для тестового сайта запустите проверку с --staging.`;
  }
  if (id === 'robots-disallowed') {
    const explanation = `robots.txt запрещает Googlebot загружать ${subject}. Поисковые системы не могут прочитать её содержимое.`;
    return reason.endsWith('at launch.')
      ? `${explanation} Уберите правило Disallow для этой страницы перед запуском сайта.`
      : `${explanation} Уберите или уточните правило Disallow для этой страницы. Для тестового сайта запустите проверку с --staging.`;
  }
  if (id === 'no-title') {
    return 'На странице нет <title>. Поисковые системы используют его как заголовок результата поиска. Без него они подберут заголовок сами.';
  }
  const count = /\b(\d+) words? of main content\b/.exec(reason)?.[1];
  if (count && (id === 'empty-page' || id === 'thin-content')) {
    const words = `${count} ${plural(count, 'слово', 'слова', 'слов')}`;
    return id === 'empty-page'
      ? `На странице нет <title>, а в основном тексте ${words}. Поисковым системам нечего индексировать.`
      : `В основном тексте страницы ${words}. Этого мало, чтобы поисковая система сопоставила страницу с запросом.`;
  }
  return reason;
}

/**
 * Get emoji for score range
 */
function getScoreEmoji(score: number): string {
  if (score >= 90) return ':white_check_mark:';
  if (score >= 70) return ':yellow_circle:';
  if (score >= 50) return ':orange_circle:';
  return ':red_circle:';
}

/**
 * Escape text from a page for a markdown report.
 *
 * Markdown punctuation is escaped, and so is HTML: most markdown viewers
 * render inline HTML, and titles, messages and extracted values come from
 * the audited site. Line breaks collapse to a space so a value cannot break
 * out of a table row, and control characters are dropped.
 */
function escapeMarkdown(text: string | null | undefined): string {
  if (text == null) return '';
  return text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
    .replace(/\r\n|[\r\n]/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[|\\`*_{}[\]()#+\-.!]/g, '\\$&');
}

function inlineCode(text: string): string {
  const code = text.replace(/\r\n|[\r\n]/g, ' ');
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(longest + 1);
  return longest > 0 || code.startsWith(' ') || code.endsWith(' ')
    ? `${fence} ${code} ${fence}`
    : `${fence}${code}${fence}`;
}

/**
 * Where a finding was seen. A count alone ("8 pages") is not actionable, and
 * listing forty URLs is not readable, so it names a few and counts the rest.
 */
function pageAttribution(finding: Finding): string {
  if (finding.pageCount <= 1 && finding.pages.length <= 1) {
    return finding.pages.length === 1
      ? `- **Страница:** ${escapeMarkdown(finding.pages[0])}`
      : '';
  }
  const shown = finding.pages.slice(0, 3).map((p) => escapeMarkdown(p));
  const rest = finding.pages.length - shown.length;
  const where = shown.length
    ? `${shown.join(', ')}${rest > 0 ? ` и ещё ${reportPageCount(rest)}` : ''}`
    : 'по данным обхода сайта';
  const scope = finding.measuredPages > 0
    ? `${finding.pageCount} из ${finding.measuredPages} ${plural(finding.measuredPages, 'страницы', 'страниц', 'страниц')}`
    : reportPageCount(finding.pageCount);
  return `- **Страницы:** ${scope} — ${where}`;
}

function renderFinding(finding: Finding, advisory: boolean): string[] {
  const { ruleId } = finding;
  const rule = getRuleById(ruleId);
  const name = trRuleName(ruleId, finding.ruleName);
  const description = trRuleDescription(ruleId, rule?.description ?? '');
  const fix = trFix(ruleId, getFixSuggestion(ruleId));
  const message = trMessage(ruleId, finding.message);
  const category = trCategoryName(finding.categoryId, finding.categoryName);
  const status = finding.status === 'fail' ? `:x: ${REPORT_STATUS.fail}` : `:warning: ${REPORT_STATUS.warn}`;
  const lines = [
    `### ${escapeMarkdown(name)}${name === ruleId ? '' : ` (${inlineCode(ruleId)})`}`,
    '',
    `- **Категория:** ${escapeMarkdown(category)}`,
    `- **Статус:** ${advisory ? `${status} · Справочно, без оценки` : status}`,
    `- **Что нашли:** ${escapeMarkdown(message)}`,
  ];
  const where = pageAttribution(finding);
  if (where) lines.push(where);
  if (description && description !== message) lines.push(`- **Почему это важно:** ${escapeMarkdown(description)}`);
  lines.push(`- **Как исправить:** ${escapeMarkdown(fix)}`);
  if (finding.details && Object.keys(finding.details).length > 0) {
    lines.push('- **Подробности:**');
    for (const [key, value] of Object.entries(finding.details)) {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const truncated = displayValue.length > 100 ? displayValue.substring(0, 97) + '...' : displayValue;
      lines.push(`  - ${escapeMarkdown(key)}: ${inlineCode(truncated)}`);
    }
  }
  lines.push('');
  return lines;
}

function reportCoverage(result: AuditResult): string | null {
  const coverage = result.coverage;
  if (!coverage?.attempted || coverage.measured === undefined || coverage.measured >= coverage.attempted) return null;
  const parts = [`Проверено ${coverage.measured} из ${coverage.attempted} ${plural(coverage.attempted, 'страницы', 'страниц', 'страниц')}`];
  if (coverage.rateLimited) parts.push(`Сервер ограничил число запросов для ${coverage.rateLimited} ${plural(coverage.rateLimited, 'страницы', 'страниц', 'страниц')}`);
  if (coverage.failed) parts.push(`Не удалось загрузить ${reportPageCount(coverage.failed)}`);
  if (coverage.notFetched) parts.push(`Загрузка не выполнялась для ${coverage.notFetched} ${plural(coverage.notFetched, 'страницы', 'страниц', 'страниц')}`);
  return parts.join(' · ');
}

/** Generate a client-facing Markdown report. */
export function renderMarkdownReport(result: AuditResult): string {
  const lines: string[] = [];
  const timestamp = new Date(result.timestamp).toLocaleString('ru-RU');

  // Header
  lines.push(`# ${BRAND_NAME} — отчёт о проверке сайта`);
  lines.push('');
  lines.push(`**URL:** [${result.url}](${result.url})`);
  lines.push(`**Дата:** ${timestamp}`);
  if (result.crawledPages > 1) {
    lines.push(`**Проверено страниц:** ${result.crawledPages}`);
  }
  lines.push('');

  // Overall Score
  lines.push('## Итоговая оценка');
  lines.push('');
  lines.push('| Баллы | Оценка |');
  lines.push(`|-------|--------|`);
  lines.push(`| **${result.overallScore}/100** ${getScoreEmoji(result.overallScore)} | ${scoreToVerdict(result.overallScore).label} |`);
  lines.push('');
  lines.push(result.overallScore >= 70
    ? '> :white_check_mark: **Проверка пройдена** (70 баллов и выше)'
    : '> :x: **Проверка не пройдена** (меньше 70 баллов)');
  lines.push('');
  if (result.scoreCap) {
    lines.push(`Средний балл по категориям до ограничения оценки — **${result.scoreCap.uncappedScore}**.`);
    lines.push('');
    for (const cap of result.scoreCap.caps) {
      lines.push(`- ${escapeMarkdown(reportCapReason(cap))}`);
    }
    lines.push('');
  }
  if (result.waivedCaps) {
    lines.push('Ограничения оценки для рабочего сайта. При проверке тестового сайта они сняты.');
    lines.push('');
    for (const cap of result.waivedCaps) {
      lines.push(`- ${escapeMarkdown(reportCapReason(cap))} (до ${cap.ceiling} баллов)`);
    }
    lines.push('');
  }

  // Category Breakdown
  lines.push('## Оценки по категориям');
  lines.push('');
  // "Not measured" is its own column so a category cannot show a high score
  // beside a warning count that is really a list of checks that never ran.
  const anyNotMeasured = result.categoryResults.some((c) => (c.notMeasuredCount ?? 0) > 0);

  if (anyNotMeasured) {
    lines.push('| Категория | Оценка | Пройдено | Предупреждения | Ошибки | Не измерено |');
    lines.push('|----------|-------|--------|----------|--------|--------------|');
  } else {
    lines.push('| Категория | Оценка | Пройдено | Предупреждения | Ошибки |');
    lines.push('|----------|-------|--------|----------|--------|');
  }

  for (const categoryResult of result.categoryResults) {
    const category = getCategoryById(categoryResult.categoryId);
    const { categoryId } = categoryResult;
    const categoryName = trCategoryName(categoryId, category?.name ?? categoryId);
    const description = trCategoryDescription(categoryId, category?.description ?? '');
    const emoji = getScoreEmoji(categoryResult.score);

    const row =
      `| ${escapeMarkdown(categoryName)}${description ? ` — ${escapeMarkdown(description)}` : ''} | ${categoryResult.score} ${emoji} ` +
      `| ${categoryResult.passCount} | ${categoryResult.warnCount} | ${categoryResult.failCount} |`;

    lines.push(anyNotMeasured ? `${row} ${categoryResult.notMeasuredCount ?? 0} |` : row);
  }
  lines.push('');

  const coverage = reportCoverage(result);
  if (coverage) {
    lines.push(`> ${coverage}`);
    lines.push('');
  }

  // One entry per problem, ranked. A crawl produces one rule result per rule
  // per page, so listing them raw repeated the same finding once per page.
  const findings = collectFindings(result);
  const failures = findings.filter((f) => f.status === 'fail');
  const warnings = findings.filter((f) => f.status === 'warn');
  const advisoryRules = new Set(result.categoryResults.flatMap((category) =>
    category.results.filter((rule) => rule.advisory).map((rule) => rule.ruleId)
  ));

  // Failures Section
  if (failures.length > 0) {
    lines.push('## :x: Ошибки');
    lines.push('');
    lines.push(`Найдено ${failures.length} ${plural(failures.length, 'ошибка', 'ошибки', 'ошибок')}. Сначала самые важные.`);
    lines.push('');

    for (const f of failures) lines.push(...renderFinding(f, advisoryRules.has(f.ruleId)));
  }

  // Warnings Section
  if (warnings.length > 0) {
    lines.push('## :warning: Предупреждения');
    lines.push('');
    lines.push(`Найдено ${warnings.length} ${plural(warnings.length, 'предупреждение', 'предупреждения', 'предупреждений')}. Сначала самые важные.`);
    lines.push('');

    for (const f of warnings) lines.push(...renderFinding(f, advisoryRules.has(f.ruleId)));
  }

  // What `[rules.override]` hid, folded so it never vanishes silently
  const ignored = collectIgnoredFindings(result);
  if (ignored.length > 0) {
    lines.push('<details>');
    lines.push(`<summary>Исключено настройками (${ignored.length})</summary>`);
    lines.push('');
    for (const i of ignored) {
      const rule = getRuleById(i.ruleId);
      const name = trRuleName(i.ruleId, rule?.name ?? i.ruleId);
      lines.push(`- ${name === i.ruleId ? '' : `${escapeMarkdown(name)} `}${inlineCode(i.ruleId)} · ${i.status === 'fail' ? REPORT_STATUS.fail : REPORT_STATUS.warn}`);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  // Summary
  const totalPassed = result.categoryResults.reduce((sum, cat) => sum + cat.passCount, 0);
  const totalChecks = totalPassed + warnings.length + failures.length;

  const brokenExternal = reportBrokenExternalSection(result, 50, 3);
  if (brokenExternal) {
    lines.push('## Неработающие внешние ссылки');
    lines.push('');
    lines.push('| Адрес ссылки | Ответ | Страницы со ссылкой |');
    lines.push('|--------|--------|-------------|');
    for (const target of brokenExternal.targets) {
      const more = target.morePages > 0 ? `, ещё ${reportPageCount(target.morePages)}` : '';
      lines.push(`| ${escapeMarkdown(target.url)} | ${escapeMarkdown(target.reason)} | ${target.pages.map(escapeMarkdown).join(', ')}${more} |`);
    }
    lines.push('');
    if (brokenExternal.moreTargets > 0) lines.push(`В отчёте JSON ещё ${brokenExternal.moreTargets} ${plural(brokenExternal.moreTargets, 'неработающая ссылка', 'неработающие ссылки', 'неработающих ссылок')}.`);
    if (brokenExternal.aside) lines.push(`${brokenExternal.aside}.`);
    lines.push('');
  }

  const custom = customResults(result);
  if (custom) {
    lines.push('## Пользовательские проверки', '', 'Из `[[custom.search]]` и `[[custom.extract]]` в sitemetr.toml. Справочно, без оценки.', '');
    const rows = reportCustomSearchRows(custom);
    if (rows.length > 0) {
      lines.push('| Поиск | Результат | Страницы |', '|--------|--------|-------|');
      for (const row of rows) lines.push(`| ${escapeMarkdown(row.name)} | ${row.outcome} | ${escapeMarkdown(row.summary)} |`);
      lines.push('');
      for (const row of rows.filter((r) => r.failingPages.length > 0)) {
        lines.push(`Страницы с проблемой **${escapeMarkdown(row.name)}**`, '');
        for (const page of row.failingPages) lines.push(`- ${escapeMarkdown(page)}`);
        lines.push('');
      }
    }
    // One row per value, so the table pastes into a spreadsheet
    const values = custom.extractions.flatMap((e) => e.pages.flatMap((p) => p.values.map((v) => [e.name, p.url, v])));
    if (values.length > 0) {
      lines.push('| Извлечение данных | Страница | Значение |', '|------------|------|-------|');
      for (const [name, url, value] of values) lines.push(`| ${escapeMarkdown(name)} | ${escapeMarkdown(url)} | ${escapeMarkdown(value)} |`);
      lines.push('');
    }
  }

  const linkSummary = result.extras?.linkScoreSummary as LinkScoreSummary | undefined;
  if (linkSummary && linkSummary.pages > 1) {
    lines.push('## Вес внутренних ссылок');
    lines.push('');
    lines.push(`Вес внутренних ссылок по результатам обхода ${linkSummary.pages} ${plural(linkSummary.pages, 'страницы', 'страниц', 'страниц')}. Шкала от 0 до 100. Справочно, без оценки.`);
    lines.push('');
    const table = (title: string, pages: LinkScoreSummary['top']) => {
      lines.push(`**${title}**`, '', '| Страница | Вес ссылок |', '|------|-----------:|');
      for (const page of pages) lines.push(`| ${escapeMarkdown(page.url)} | ${reportDecimal.format(page.score)} |`);
      lines.push('');
    };
    table('Страницы с наибольшим весом ссылок', linkSummary.top);
    if (linkSummary.lowestIndexable.length > 0) table('Доступные для индексации страницы с наименьшим весом ссылок', linkSummary.lowestIndexable);
  }

  lines.push('## Сводка');
  lines.push('');
  lines.push('| Показатель | Количество |');
  lines.push('|--------|-------|');
  lines.push(`| Всего проверок | ${totalChecks} |`);
  lines.push(`| :white_check_mark: Пройдено | ${totalPassed} |`);
  lines.push(`| :warning: Предупреждения | ${warnings.length} |`);
  lines.push(`| :x: Ошибки | ${failures.length} |`);
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Отчёт подготовлен в [${BRAND_NAME}](https://github.com/Quroroyr/sitemetr-seo)*`);

  return lines.join('\n');
}

/**
 * Write Markdown report to a file
 * @param result - Audit result
 * @param filePath - Output file path
 */
export async function writeMarkdownReport(result: AuditResult, filePath: string): Promise<void> {
  const fs = await import('fs');
  const markdown = renderMarkdownReport(result);
  fs.writeFileSync(filePath, markdown, 'utf-8');
}
