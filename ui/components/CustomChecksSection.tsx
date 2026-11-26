/**
 * The team's own checks from sitemetr.toml: per-page assertions and the
 * values each extraction pulled. Shown last, and never scored.
 */
import type { AuditResult } from '../../src/types.js';
import type { CustomSearchResult } from '../../src/custom/custom-checks.js';
import { formatNumber, formatPages } from '../lib/format.js';
import { customResults } from '../../src/reporters/custom-section.js';

const OUTCOME_COLOR = {
  pass: 'var(--color-text-muted)',
  warn: 'var(--color-warn)',
  fail: 'var(--color-fail)',
  stopped: 'var(--color-warn)',
  unchecked: 'var(--color-text-muted)',
} as const;

function searchSummary(search: CustomSearchResult): string {
  const expectation = search.expect === 'present' ? 'совпадение ожидается' : 'совпадений быть не должно';
  if (search.checked === 0 && search.stopped === 0) return `Нет подходящих страниц (${expectation})`;
  const count = search.failing > 0
    ? `${search.severity === 'warn' ? 'Предупреждения' : 'Ошибки'} на ${formatNumber(search.failing)} из ${formatNumber(search.checked)} страниц`
    : `Пройдено: ${formatPages(search.checked)}`;
  const stopped = search.stopped > 0 ? ` · по лимиту времени прервано: ${formatPages(search.stopped)}` : '';
  return `${count} (${expectation})${stopped}`;
}

export function CustomChecksSection({ result }: { result: AuditResult }) {
  const custom = customResults(result);
  if (!custom) return null;
  return (
    <section id="custom-checks" className="pt-10 scroll-mt-4">
      <h3 className="text-xl leading-7 font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-text)' }}>
        Пользовательские проверки
      </h3>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Из sitemetr.toml. Без оценки.
      </p>
      <ul className="space-y-2 text-sm">
        {custom.searches.map((search) => (
          <li key={search.name}>
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{search.name}</span>{' '}
            <span style={{ color: OUTCOME_COLOR[search.failing ? search.severity : search.stopped ? 'stopped' : search.checked ? 'pass' : 'unchecked'] }}>{searchSummary(search)}</span>
            {search.failingPages.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Страницы с ошибками
                </summary>
                <ul className="mt-1 space-y-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {search.failingPages.map((page) => (
                    <li key={page} style={{ overflowWrap: 'anywhere' }}>{page}</li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>
      {custom.extractions.map((extraction) => (
        <div key={extraction.name} className="mt-4">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {extraction.name}{' '}
            <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>
              Значения · {formatPages(extraction.pages.length)}
            </span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs mt-1">
              <tbody>
                {extraction.pages.slice(0, 50).map((page) => (
                  <tr key={page.url} className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <td className="py-1 pr-3 align-top" style={{ color: 'var(--color-text-secondary)', overflowWrap: 'anywhere' }}>{page.url}</td>
                    <td className="py-1 align-top" style={{ color: 'var(--color-text)' }}>{page.values.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {extraction.pages.length > 50 && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Показано 50 из {formatNumber(extraction.pages.length)} страниц. Экспортируйте Markdown или HTML, чтобы увидеть остальные.
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
