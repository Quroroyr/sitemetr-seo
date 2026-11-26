/**
 * The wording of "what to fix first", shared by the dashboard, the desktop app
 * and the HTML report so the three can never phrase it differently: the fix
 * text split into a headline, the points format, the cap headlines, and the
 * agent's one sentence (DESIGN.md "The agent in the product").
 *
 * Shared with `ui/`.
 */

import { plural } from '../i18n/index.js';
import { scoreToVerdict } from '../verdict.js';

const pointsFormat = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const counts = new Intl.NumberFormat('ru-RU');

/** What the wording needs to know about a fix */
export interface PointedFix {
  points: number;
}

/** What the wording needs to know about the audit */
export interface FixBriefAudit {
  crawledPages: number;
  scoreCap?: unknown;
}

/**
 * Split a rule's fix text into a headline and the rest.
 *
 * "Reduce DOM size: remove unused elements, use virtualization" becomes
 * "Reduce DOM size" and "Remove unused elements, use virtualization". Every
 * rule's fix text is imperative, so the headline reads as an instruction.
 */
export function splitFix(fix: string): { headline: string; rest: string } {
  const text = fix.trim().replace(/\.$/, '');
  const match = /^(.+?)[:;]\s+(.+)$/.exec(text);
  if (!match) return { headline: text, rest: '' };
  const rest = match[2]!.replace(/\.$/, '');
  return { headline: match[1]!, rest: rest.charAt(0).toUpperCase() + rest.slice(1) };
}

/** What the score is missing: every fix's points added up */
export function missingPoints(fixes: readonly PointedFix[]): number {
  return fixes.reduce((sum, fix) => sum + fix.points, 0);
}

/** «+0,6» or «+<0,1» for a fix too small to show at one decimal. */
export function formatPoints(points: number): string {
  if (points > 0 && points < 0.05) return '+<0,1';
  return `+${pointsFormat.format(points)}`;
}

function pointParts(points: number, decimals: number): Intl.NumberFormatPart[] {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: decimals }).formatToParts(points);
}

function pointUnit(parts: readonly Intl.NumberFormatPart[], grammaticalCase: 'nominative' | 'genitive' = 'nominative'): string {
  if (parts.some((part) => part.type === 'fraction')) return 'балла';
  const integer = Number(parts.filter((part) => part.type === 'integer').map((part) => part.value).join(''));
  return grammaticalCase === 'genitive'
    ? plural(integer, 'балла', 'баллов', 'баллов')
    : plural(integer, 'балл', 'балла', 'баллов');
}

/** The unit for a score change printed separately from the number. */
export function pointWord(points: number, decimals = 1): string {
  return pointUnit(pointParts(points, decimals));
}

/** Points with a unit for prose. */
export function formatPointAmount(points: number, decimals = 1, grammaticalCase: 'nominative' | 'genitive' = 'nominative'): string {
  const parts = pointParts(points, decimals);
  return `${parts.map((part) => part.value).join('')} ${pointUnit(parts, grammaticalCase)}`;
}

/** Two fixes worth the same, as the report rounds them */
export function tied(a: PointedFix | undefined, b: PointedFix | undefined): boolean {
  return Boolean(a && b && formatPoints(a.points) === formatPoints(b.points));
}

/** The fix that lifts a page-level cap, said where the score names the cap */
const CAP_HEADLINES: Record<string, string> = {
  noindex: 'Уберите директиву noindex',
  'robots-disallowed': 'Разрешите Googlebot загружать страницу',
  'empty-page': 'Добавьте <title> и содержимое страницы',
  'thin-content': 'Добавьте на страницу основной контент',
  'no-title': 'Добавьте <title>',
};

export function capHeadline(capId: string): string {
  return CAP_HEADLINES[capId] ?? 'Снимите ограничение оценки';
}

/**
 * The agent's one sentence over the fix queue.
 *
 * It speaks about the queue as a whole, never as a pitch for one fix, and may
 * only say what the numbers support: "more than the next four together" is
 * printed when it is true and never as a slogan.
 */
export function agentLine(fixes: readonly PointedFix[], result: FixBriefAudit, totalMissing?: number): string {
  if (result.scoreCap) return 'Сначала снимите ограничение оценки. После этого исправления из очереди смогут повысить оценку.';
  if (fixes.length === 0) return 'По измеренным проверкам исправлений нет.';

  const where = result.crawledPages > 1 ? 'Сайту' : 'Странице';
  const visiblePoints = missingPoints(fixes);
  const missing = totalMissing ?? visiblePoints;
  const gap = `${where} не хватает ${formatPointAmount(missing, 1, 'genitive')}.`;
  const [lead, ...rest] = fixes;
  if (rest.length >= 4 && lead!.points > missingPoints(rest.slice(0, 4))) {
    return `Начните с первого исправления. Оно вернёт больше баллов, чем следующие четыре вместе. ${gap}`;
  }
  if (fixes.length <= 5) {
    const count = fixes.length;
    const noun = plural(count, 'исправление', 'исправления', 'исправлений');
    const fixesText = `${counts.format(count)} ${noun} ${count === 1 ? 'вернёт' : 'вернут'}`;
    return Math.abs(missing - visiblePoints) > 0.0001
      ? `${fixesText} ${formatPointAmount(visiblePoints)}. ${gap}`
      : `${gap} ${fixesText} все недостающие баллы.`;
  }
  const topFive = missingPoints(fixes.slice(0, 5));
  return `Начните с первых пяти исправлений. Они вернут ${formatPointAmount(topFive)}. ${gap}`;
}

/** Where a grade starts; the verdict reads the rounded score (`verdict.ts`) */
const GRADE_STEPS = [50, 70, 80, 90];

export interface NextGrade {
  /** The grade above the current one, or null at the top grade */
  label: string | null;
  /** Score points to reach it, measured on the exact score */
  gap: number;
  /** How many fixes from the top of the queue cover the gap */
  fixes: number;
}

/**
 * How far the next grade is, in the fix queue's own terms.
 *
 * The grade is read from the rounded score, so 89.5 is already Excellent: the
 * gap is to the threshold minus half a point, not to the threshold. The fixes
 * count is the shortest run from the top of the queue that covers the gap.
 *
 * @param exact - The score before rounding (100 minus every fix's points)
 * @param ranked - Fixes in queue order
 */
export function nextGrade(exact: number, ranked: readonly PointedFix[]): NextGrade {
  const next = GRADE_STEPS.find((threshold) => Math.round(exact) < threshold);
  if (!next) return { label: null, gap: Math.max(0, 100 - exact), fixes: ranked.length };
  const gap = Math.max(0, next - 0.5 - exact);
  let covered = 0;
  let fixes = 0;
  for (const fix of ranked) {
    if (covered >= gap) break;
    covered += fix.points;
    fixes++;
  }
  return { label: scoreToVerdict(next).label, gap, fixes };
}

/** The line under the score that says what the next grade costs */
export function nextGradeLine(exact: number, ranked: readonly PointedFix[]): string {
  const step = nextGrade(exact, ranked);
  if (step.label === null) {
    return step.gap < 0.05 ? 'Высшая оценка. Исправлений больше нет.' : `Высшая оценка. До 100 не хватает ${formatPointAmount(step.gap, 1, 'genitive')}.`;
  }
  const points = step.gap < 0.05 ? 'меньше 0,1 балла' : formatPointAmount(step.gap, 1, 'genitive');
  const target = `До оценки «${step.label}» не хватает ${points}.`;
  if (step.fixes === 0) return target;
  const count = counts.format(step.fixes);
  const instructions = step.fixes === 1
    ? 'Достаточно первого исправления.'
    : `Достаточно выполнить первые ${count} ${plural(step.fixes, 'исправление', 'исправления', 'исправлений')}.`;
  return `${target} ${instructions}`;
}
