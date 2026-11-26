/**
 * The two quiet sections under the fixes: what the audit could not measure,
 * and where its numbers come from. Both say plainly what counts for nothing,
 * so a score is never read as more complete than it was.
 */

import type { AuditResult } from '../../src/types.js';
import { formatChecks, formatNumber } from '../lib/format.js';
import { formatPointAmount } from '../lib/fixes.js';
import { localizeCapReason, NOT_MEASURED_REASONS, notMeasuredByReason } from '../lib/audit-state.js';
import { StatusShape } from './Status.js';

export function MeasurementGaps({ result, advisory }: { result: AuditResult; advisory: number }) {
  const groups = notMeasuredByReason(result);
  const total = groups.reduce((sum, g) => sum + g.ruleIds.length, 0);
  if (total === 0 && advisory === 0) return null;

  return (
    <section id="gaps" aria-labelledby="gaps-title" className="pt-10 scroll-mt-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
        <h3 id="gaps-title" className="text-xl leading-7 font-semibold tracking-[-0.01em]">Что не удалось измерить</h3>
        <span className="figure text-xs text-[var(--color-text-muted)]">
          Без оценки · {formatChecks(total)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Причина</th>
              <th className="hidden md:table-cell">Как измерить</th>
              <th className="num">Проверки</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.reason}>
                <td>
                  <span className="status">
                    <StatusShape status="not-measured" />
                    <span className="text-[var(--color-text)]">{group.label.charAt(0).toUpperCase() + group.label.slice(1)}</span>
                  </span>
                </td>
                <td className="hidden md:table-cell text-[13px] text-[var(--color-text-secondary)]">
                  {NOT_MEASURED_REASONS[group.reason].action ?? '–'}
                </td>
                <td className="num figure">{formatNumber(group.ruleIds.length)}</td>
              </tr>
            ))}
            {advisory > 0 && (
              <tr>
                <td>
                  <span className="status">
                    <StatusShape status="advisory" />
                    <span className="text-[var(--color-text)]">Справочно, без оценки</span>
                  </span>
                </td>
                <td className="hidden md:table-cell text-[13px] text-[var(--color-text-secondary)]">
                  Новые проверки начнут влиять на оценку после включения в расчёт.
                </td>
                <td className="num figure">{formatNumber(advisory)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function NumbersNote({
  result,
  missing,
  fixCount,
  engineVersion,
}: {
  result: AuditResult;
  missing: number;
  fixCount: number;
  engineVersion: string | null | undefined;
}) {
  const exact = 100 - missing;
  const run = result.run as { scoringVersion?: number } | undefined;
  return (
    <section aria-labelledby="numbers" className="pt-10 pb-12">
      <h3 id="numbers" className="text-xl leading-7 font-semibold tracking-[-0.01em] mb-3">Как рассчитываются показатели</h3>
      <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-[var(--color-text-secondary)] max-w-[72ch]">
        <li>
          <b className="font-medium text-[var(--color-text)]">Оценка.</b> Среднее взвешенное по проверенным категориям (основы SEO — 11, производительность — 10 … правовые требования — 1). Результат каждой проверки умножается на её вес. Пройдено — 100, предупреждение — 50, ошибка — 0.
        </li>
        <li>
          <b className="font-medium text-[var(--color-text)]">Баллы.</b> Прирост оценки за успешную проверку рассчитывается по тем же весам.
          Всего исправлений — {formatNumber(fixCount)}. Не хватает {formatPointAmount(missing, 1, 'genitive')}
          {!result.scoreCap && ` (оценка до округления — ${formatNumber(exact, 2)})`}.
        </li>
        <li>
          <b className="font-medium text-[var(--color-text)]">Ограничения.</b>{' '}
          {result.scoreCap
            ? `${result.scoreCap.caps.map(localizeCapReason).join(' ')} До исправления оценка ограничена ${formatNumber(result.overallScore)}.`
            : 'Ограничений нет. Когда страницу нельзя проиндексировать, оценка ограничена сверху. Исправление, которое снимает ограничение, возвращает всю разницу.'}
        </li>
        <li>
          <b className="font-medium text-[var(--color-text)]">Неизмеренные и справочные проверки.</b> Видны в отчёте и не влияют на оценку. Движок {engineVersion ?? '—'}
          {run?.scoringVersion !== undefined && `, версия расчёта оценки ${formatNumber(run.scoringVersion)}`}.
        </li>
      </ul>
    </section>
  );
}
