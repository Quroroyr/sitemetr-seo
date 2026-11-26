/**
 * Сайтметр client report: a print-first HTML page meant to become a PDF.
 *
 * The interactive HTML report is a working tool (filters, a theme toggle, a
 * sidebar) and prints badly. This one is the document a site owner is sent:
 * page one answers "how bad is it and what do we do first", the rest is the
 * whole fix queue as a table. Always the light theme, A4 portrait, no script.
 *
 * Numbers come from the same places the app takes them: points per rule from
 * `rules/points.ts`, the next-grade sentence from `fix-brief.ts`, texts through
 * the Russian overlay in `src/i18n`.
 */

import type { AuditResult } from '../types.js';
import { collectFindings, type Finding } from './findings.js';
import { pointsByRule } from '../rules/points.js';
import { getRuleById } from '../rules/registry.js';
import { getCategoryById } from '../categories/index.js';
import { overridePriorityFactor } from '../rules/overrides.js';
import { getFixSuggestion } from './fix-suggestions.js';
import { capHeadline, formatPoints, formatPointAmount, nextGradeLine, splitFix } from './fix-brief.js';
import { scoreToVerdict } from '../verdict.js';
import { LIGHT } from '../design/tokens.js';
import { BRAND_NAME, BRAND_WORDMARK, emblemSvg } from '../design/brand.js';
import { plural, trCategoryName, trFix, trMessage, trRuleName } from '../i18n/index.js';

export interface ClientReportOptions {
  /** Who prepared the report: an agency or a specialist, printed in the header */
  preparedBy?: string;
  /** When the document is generated; defaults to now */
  generatedAt?: Date;
}

/** One fix as the client report lists it */
export interface ClientFix {
  ruleId: string;
  status: 'fail' | 'warn';
  headline: string;
  rest: string;
  name: string;
  message: string;
  categoryId: string;
  categoryName: string;
  pageCount: number;
  measuredPages: number;
  points: number;
}

/** How many fixes page one features */
export const TOP_FIXES = 5;

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * The ranked fix queue: one entry per scored rule (worst status, all its
 * pages), advisory and config-ignored findings left out, ordered by the score
 * points a fix returns. The same queue the app and the HTML report show.
 */
export function clientFixQueue(result: AuditResult): ClientFix[] {
  const points = pointsByRule(result.categoryResults);
  const byRule = new Map<string, Finding>();
  for (const finding of collectFindings(result)) {
    if (finding.status !== 'fail' && finding.status !== 'warn') continue;
    if (finding.override === 'ignore') continue;
    if (getRuleById(finding.ruleId)?.advisory) continue;
    const queued = byRule.get(finding.ruleId);
    if (!queued) {
      byRule.set(finding.ruleId, finding);
      continue;
    }
    const [worst, other] = queued.status === 'fail' ? [queued, finding] : [finding, queued];
    byRule.set(finding.ruleId, {
      ...worst,
      pageCount: worst.pageCount + other.pageCount,
      measuredPages: Math.max(worst.measuredPages, other.measuredPages),
    });
  }

  const fixes = [...byRule.values()].map((finding): ClientFix => {
    const english = getRuleById(finding.ruleId)?.name ?? finding.ruleName;
    const { headline, rest } = splitFix(trFix(finding.ruleId, getFixSuggestion(finding.ruleId)));
    return {
      ruleId: finding.ruleId,
      status: finding.status as 'fail' | 'warn',
      headline,
      rest,
      name: trRuleName(finding.ruleId, english),
      message: trMessage(finding.ruleId, finding.message),
      categoryId: finding.categoryId,
      categoryName: trCategoryName(finding.categoryId, getCategoryById(finding.categoryId)?.name ?? finding.categoryId),
      pageCount: finding.pageCount,
      measuredPages: finding.measuredPages,
      points: points.get(finding.ruleId) ?? 0,
    };
  });

  const overrides = new Map(collectFindings(result).map((f) => [f.ruleId, f.override]));
  return fixes.sort(
    (a, b) =>
      b.points * overridePriorityFactor(overrides.get(b.ruleId)) - a.points * overridePriorityFactor(overrides.get(a.ruleId)) ||
      (a.status === b.status ? 0 : a.status === 'fail' ? -1 : 1) ||
      b.pageCount - a.pageCount ||
      a.ruleId.localeCompare(b.ruleId)
  );
}

function statusMark(status: 'fail' | 'warn'): string {
  return status === 'fail'
    ? '<span class="st st-fail"><i></i>Ошибка</span>'
    : '<span class="st st-warn"><i></i>Предупреждение</span>';
}

function pagesCell(fix: ClientFix, multiPage: boolean): string {
  if (!multiPage) return '';
  return `${fix.pageCount}&nbsp;из&nbsp;${Math.max(fix.measuredPages, fix.pageCount)}`;
}

/** The print HTML for the client report */
export function renderClientReportHtml(result: AuditResult, options: ClientReportOptions = {}): string {
  const generatedAt = options.generatedAt ?? new Date();
  const host = hostOf(result.url);
  const auditedAt = new Date(result.timestamp);
  const pages = result.crawledPages ?? 1;
  const multiPage = pages > 1;

  const fixes = clientFixQueue(result);
  const missing = fixes.reduce((sum, fix) => sum + fix.points, 0);
  const exact = result.scoreCap ? result.overallScore : Math.max(0, Math.min(100, 100 - missing));
  const verdict = scoreToVerdict(result.overallScore);
  const fails = fixes.filter((f) => f.status === 'fail').length;
  const warns = fixes.length - fails;
  const top = fixes.slice(0, TOP_FIXES);
  const topPoints = top.reduce((sum, f) => sum + f.points, 0);

  const scoreColor = result.overallScore < 70 ? LIGHT['color-fail'] : result.overallScore < 80 ? LIGHT['color-warn'] : LIGHT['color-text'];

  const nextLine = result.scoreCap
    ? `Оценка ограничена: ${escapeHtml(capHeadline(result.scoreCap.caps[0]?.id ?? ''))}. ${escapeHtml(result.scoreCap.caps[0]?.reason ?? '')}`
    : escapeHtml(nextGradeLine(exact, fixes.map((f) => ({ points: f.points }))));

  const categories = result.categoryResults
    .map((c) => ({
      id: c.categoryId,
      name: trCategoryName(c.categoryId, getCategoryById(c.categoryId)?.name ?? c.categoryId),
      score: c.score,
      items: fixes.filter((f) => f.categoryId === c.categoryId).length,
    }))
    .sort((a, b) => a.score - b.score);

  const topCards = top
    .map(
      (fix, i) => `
      <li class="top-fix">
        <div class="top-rank">${String(i + 1).padStart(2, '0')}</div>
        <div class="top-body">
          <div class="top-head">${escapeHtml(fix.headline)}</div>
          <div class="top-seen">${escapeHtml(fix.message)}</div>
          <div class="top-meta">${statusMark(fix.status)}<span>${escapeHtml(fix.categoryName)}</span>${multiPage ? `<span>${pagesCell(fix, true)} стр.</span>` : ''}</div>
        </div>
        <div class="top-points">${formatPoints(fix.points)}</div>
      </li>`
    )
    .join('');

  const rows = fixes
    .map(
      (fix, i) => `
        <tr>
          <td class="num">${String(i + 1).padStart(2, '0')}</td>
          <td>${statusMark(fix.status)}</td>
          <td><div class="row-head">${escapeHtml(fix.headline)}</div>${fix.rest ? `<div class="row-rest">${escapeHtml(fix.rest)}</div>` : ''}<div class="row-seen">${escapeHtml(fix.message)}</div></td>
          <td class="cat">${escapeHtml(fix.categoryName)}</td>
          ${multiPage ? `<td class="num">${pagesCell(fix, true)}</td>` : ''}
          <td class="num pts">${formatPoints(fix.points)}</td>
        </tr>`
    )
    .join('');

  const categoryRows = categories
    .map(
      (c) => `
        <tr>
          <td>${escapeHtml(c.name)}</td>
          <td class="bar"><span style="width:${Math.max(0, Math.min(100, c.score))}%;background:${c.score < 70 ? LIGHT['color-fail'] : c.score < 80 ? LIGHT['color-warn'] : LIGHT['color-text']}"></span></td>
          <td class="num">${c.score}</td>
          <td class="num muted">${c.items ? `${c.items} ${plural(c.items, 'пункт', 'пункта', 'пунктов')}` : ''}</td>
        </tr>`
    )
    .join('');

  const preparedBy = options.preparedBy?.trim();

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>SEO-аудит ${escapeHtml(host)} — ${BRAND_NAME}</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font: 10.5pt/1.45 "Segoe UI", "Helvetica Neue", Arial, sans-serif; color: ${LIGHT['color-text']}; background: #fff; }
  .mono, .num, .pts, .label { font-family: Consolas, "SF Mono", "Cascadia Mono", monospace; font-variant-numeric: tabular-nums; }
  .label { font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; color: ${LIGHT['color-text-muted']}; }
  header.doc { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid ${LIGHT['color-border']}; }
  .lockup { display: flex; align-items: center; gap: 8px; }
  .lockup svg { width: 22px; height: 22px; }
  .word { font-weight: 650; font-size: 15pt; letter-spacing: -.035em; }
  .prepared { text-align: right; font-size: 9pt; color: ${LIGHT['color-text-secondary']}; }
  h1 { font-size: 20pt; letter-spacing: -.02em; margin: 22px 0 2px; }
  .sub { color: ${LIGHT['color-text-secondary']}; font-size: 9.5pt; }
  .score { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: end; margin: 22px 0 6px; padding: 18px 0; border-top: 1px solid ${LIGHT['color-border']}; border-bottom: 1px solid ${LIGHT['color-border']}; }
  .score-num { font-family: Consolas, monospace; font-size: 46pt; line-height: 1; letter-spacing: -.03em; font-weight: 600; }
  .score-num small { font-size: 14pt; color: ${LIGHT['color-text-muted']}; font-weight: 400; }
  .verdict { font-family: "Segoe UI", Arial, sans-serif; font-weight: 600; font-size: 13pt; letter-spacing: 0; margin-left: 14px; }
  .meter { position: relative; height: 8px; background: ${LIGHT['color-border']}; margin: 6px 0 4px; }
  .meter > span { position: absolute; inset: 0 auto 0 0; }
  .meter i { position: absolute; top: -3px; bottom: -3px; width: 1px; background: #fff; }
  .scale { position: relative; height: 12px; font-size: 7pt; color: ${LIGHT['color-text-muted']}; font-family: Consolas, monospace; }
  .scale span { position: absolute; transform: translateX(-50%); }
  .next { margin: 8px 0 0; font-size: 10pt; }
  .facts { display: flex; gap: 26px; margin-top: 10px; }
  .facts div b { display: block; font-family: Consolas, monospace; font-size: 13pt; font-weight: 600; }
  h2 { font-size: 13pt; letter-spacing: -.01em; margin: 24px 0 4px; }
  .lead { color: ${LIGHT['color-text-secondary']}; margin: 0 0 10px; font-size: 9.5pt; }
  ol.top { list-style: none; padding: 0; margin: 0; border-top: 1px solid ${LIGHT['color-border']}; }
  .top-fix { display: grid; grid-template-columns: 28px 1fr auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid ${LIGHT['color-border']}; break-inside: avoid; }
  .top-rank { font-family: Consolas, monospace; color: ${LIGHT['color-text-muted']}; padding-top: 1px; }
  .top-head { font-weight: 600; }
  .top-seen { color: ${LIGHT['color-text-secondary']}; font-size: 9.5pt; margin-top: 2px; overflow-wrap: anywhere; }
  .top-meta { display: flex; gap: 14px; margin-top: 4px; font-size: 8.5pt; color: ${LIGHT['color-text-muted']}; }
  .top-points { font-family: Consolas, monospace; font-weight: 600; color: ${LIGHT['color-agent-text']}; white-space: nowrap; }
  .st { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .st i { width: 8px; height: 8px; display: inline-block; }
  .st-fail i { background: ${LIGHT['color-fail']}; }
  .st-warn i { border: 1px solid ${LIGHT['color-warn']}; background: linear-gradient(to top, ${LIGHT['color-warn']} 50%, transparent 50%); }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  th { text-align: left; font-weight: 500; padding: 6px 6px 6px 0; border-bottom: 1px solid ${LIGHT['color-border-strong']}; }
  td { vertical-align: top; padding: 7px 6px 7px 0; border-bottom: 1px solid ${LIGHT['color-border']}; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  td.cat { font-size: 8pt; color: ${LIGHT['color-text-secondary']}; white-space: nowrap; }
  .row-head { font-weight: 600; }
  .row-rest { color: ${LIGHT['color-text-secondary']}; margin-top: 1px; }
  .row-seen { color: ${LIGHT['color-text-muted']}; margin-top: 2px; overflow-wrap: anywhere; }
  .pts { color: ${LIGHT['color-agent-text']}; font-weight: 600; }
  .muted { color: ${LIGHT['color-text-muted']}; }
  td.bar { width: 45%; }
  td.bar span { display: block; height: 6px; margin-top: 5px; }
  .page-break { break-before: page; }
  .two { display: grid; grid-template-columns: 1fr; }
  .note { margin-top: 18px; font-size: 8.5pt; color: ${LIGHT['color-text-muted']}; }
</style>
</head>
<body>
  <header class="doc">
    <div class="lockup">${emblemSvg({ size: 22 })}<span class="word">${BRAND_WORDMARK}</span></div>
    <div class="prepared">${preparedBy ? `Подготовил: ${escapeHtml(preparedBy)}<br>` : ''}${escapeHtml(dateFormat.format(generatedAt))}</div>
  </header>

  <h1>SEO-аудит ${escapeHtml(host)}</h1>
  <div class="sub mono">${escapeHtml(result.url)} · проверка ${escapeHtml(dateFormat.format(auditedAt))} · ${pages} ${plural(pages, 'страница', 'страницы', 'страниц')}</div>

  <section class="score">
    <div>
      <div class="label">Оценка</div>
      <div class="score-num" style="color:${scoreColor}">${result.overallScore}<small>/100</small><span class="verdict" style="color:${LIGHT['color-text']}">${escapeHtml(verdict.label)}</span></div>
    </div>
    <div>
      <div class="meter"><span style="width:${exact.toFixed(2)}%;background:${scoreColor}"></span>${[50, 70, 80, 90].map((t) => `<i style="left:${t}%"></i>`).join('')}</div>
      <div class="scale">${[50, 70, 80, 90].map((t) => `<span style="left:${t}%">${t}</span>`).join('')}</div>
      <p class="next">${nextLine}</p>
    </div>
  </section>
  <div class="facts">
    <div><span class="label">Ошибки</span><b>${fails}</b></div>
    <div><span class="label">Предупреждения</span><b>${warns}</b></div>
    <div><span class="label">Не хватает</span><b>${escapeHtml(formatPointAmount(missing, 1, 'genitive'))}</b></div>
  </div>

  <h2>Что исправить в первую очередь</h2>
  <p class="lead">${top.length > 0 ? `${top.length === 1 ? 'Это исправление вернёт' : `Эти ${top.length} ${plural(top.length, 'исправление', 'исправления', 'исправлений')} вернут`} ${escapeHtml(formatPointAmount(topPoints))} из ${escapeHtml(formatPointAmount(missing, 1, 'genitive'))}, которых не хватает сайту.` : 'В проверенном исправлять нечего.'}</p>
  ${top.length > 0 ? `<ol class="top">${topCards}</ol>` : ''}

  <h2>Оценка по разделам</h2>
  <table>
    <thead><tr><th>Раздел</th><th></th><th class="num">Оценка</th><th class="num">В очереди</th></tr></thead>
    <tbody>${categoryRows}</tbody>
  </table>

  ${fixes.length > 0 ? `
  <section>
    <h2>Все исправления (${fixes.length})</h2>
    <p class="lead">По порядку: сначала то, что вернёт больше всего баллов. «Баллы» — насколько вырастет оценка, если исправить пункт на всех страницах.</p>
    <table>
      <thead><tr><th class="num">#</th><th>Статус</th><th>Что сделать</th><th>Раздел</th>${multiPage ? '<th class="num">Страницы</th>' : ''}<th class="num">Баллы</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>` : ''}

  <p class="note">Отчёт подготовлен в ${BRAND_NAME}. Проверено автоматически; оценка показывает соответствие техническим рекомендациям поисковых систем, а не позиции сайта в выдаче.</p>
</body>
</html>`;
}

/** Footer template for the printed PDF: brand, site and page numbers */
export function clientReportFooter(result: AuditResult): string {
  return `<div style="width:100%;font:8px Consolas,monospace;color:#5e5e5e;padding:0 14mm;display:flex;justify-content:space-between">
    <span>${BRAND_NAME} · ${escapeHtml(hostOf(result.url))}</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;
}

/** File name for the PDF, from the host and the audit date */
export function clientReportFileName(result: AuditResult): string {
  const date = new Date(result.timestamp);
  const stamp = Number.isNaN(date.getTime()) ? 'report' : date.toISOString().slice(0, 10);
  return `seo-audit-${hostOf(result.url).replace(/[^a-z0-9.-]/gi, '_')}-${stamp}.pdf`;
}
