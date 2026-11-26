/**
 * What a crawl learned about the site as a whole: hosts that slowed it down,
 * broken external links by target, and which pages the internal links favour.
 * Crawl audits only; older audits without these extras show nothing.
 */
import type { AuditResult } from '../../src/types.js';
import type { ExternalLinksExtras } from '../../src/site/external-links.js';
import type { LinkScoreSummary } from '../../src/site/link-score.js';
import { localizeDiagnostic } from '../lib/diagnostics.js';
import { formatNumber, formatPages, safeHref } from '../lib/format.js';

interface CrawlExtras {
  rateLimitedPages?: number;
  rateLimitedHosts?: Array<{ host: string; pages: number }>;
  notFetched?: number;
  abandonedHosts?: string[];
  stoppedByDeadline?: boolean;
  crawlDelayApplied?: { host: string; delayMs: number } | null;
}

const path = (url: string) => {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url;
  }
};

function UrlLink({ url }: { url: string }) {
  const href = safeHref(url);
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent)', overflowWrap: 'anywhere' }}>
      {url}
    </a>
  ) : (
    <span style={{ overflowWrap: 'anywhere' }}>{url}</span>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-sm font-semibold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>
      {children}
    </h4>
  );
}

export function SiteSection({ result }: { result: AuditResult }) {
  const crawl = result.extras?.['crawl'] as CrawlExtras | undefined;
  const external = result.extras?.externalLinks as ExternalLinksExtras | undefined;
  const links = result.extras?.linkScoreSummary as LinkScoreSummary | undefined;
  if (!crawl && !external && !links) return null;

  const crawlNotes = [
    crawl?.crawlDelayApplied && `${crawl.crawlDelayApplied.host} запросил паузу в ${formatNumber(crawl.crawlDelayApplied.delayMs / 1000)} с между запросами. Обход учёл эту паузу.`,
    ...(crawl?.rateLimitedHosts ?? []).map((h) => `${h.host} ограничил частоту запросов. Из оценки исключены страницы (${formatNumber(h.pages)}).`),
    ...(crawl?.abandonedHosts ?? []).map((host) => `${host} несколько раз вернул ошибку. Обход этого хоста остановлен.`),
    crawl?.stoppedByDeadline && 'Обход сайта достиг лимита времени. Оценка рассчитана по загруженным страницам.',
    crawl?.notFetched ? `Не загружено: ${formatPages(crawl.notFetched)} из очереди.` : null,
  ].filter(Boolean) as string[];

  return (
    <section id="site" className="scroll-mt-4">
      <h3 className="text-xl leading-7 font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-text)' }}>
        Сайт
      </h3>

      {crawlNotes.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {crawlNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      {external && (
        <>
          <Subheading>Неработающие внешние ссылки</Subheading>
          {external.broken === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Неработающих ссылок не найдено. Проверено: {formatNumber(external.checked)}
              {external.couldNotVerify > 0 && ` · не удалось проверить: ${formatNumber(external.couldNotVerify)}`}
              {external.notChecked > 0 && ` · пропущено: ${formatNumber(external.notChecked)}`}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--color-text-muted)' }}>
                    <th className="text-left font-medium py-1 pr-3">Адрес</th>
                    <th className="text-left font-medium py-1 pr-3">Ответ</th>
                    <th className="text-left font-medium py-1">Где найдена</th>
                  </tr>
                </thead>
                <tbody>
                  {external.brokenTargets.slice(0, 50).map((target) => (
                    <tr key={target.url} className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                      <td className="py-1.5 pr-3 align-top"><UrlLink url={target.url} /></td>
                      <td className="py-1.5 pr-3 align-top" style={{ color: 'var(--color-fail)' }}>{localizeDiagnostic(target.reason)}</td>
                      <td className="py-1.5 align-top" style={{ color: 'var(--color-text-secondary)' }}>
                        <details>
                          <summary className="cursor-pointer">{formatPages(target.linkedFromCount)}</summary>
                          <ul className="mt-1 space-y-0.5">
                            {target.linkedFrom.map((page) => (
                              <li key={page}><UrlLink url={page} /></li>
                            ))}
                          </ul>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {external.broken > 50 && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Показано 50 из {formatNumber(external.broken)}. Экспортируйте JSON, чтобы увидеть остальные.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {links && links.pages >= 5 && (
        <>
          <Subheading>Рейтинг страниц по внутренним ссылкам</Subheading>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            100 — показатель страницы с самым сильным ссылочным профилем по итогам обхода. На оценку сайта он не влияет.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreList title="Страницы с сильными ссылками" pages={links.top} />
            {links.lowestIndexable.length > 0 && (
              <ScoreList title="Добавьте ссылки с более сильных страниц" pages={links.lowestIndexable} />
            )}
          </div>
        </>
      )}
    </section>
  );
}

function ScoreList({ title, pages }: { title: string; pages: LinkScoreSummary['top'] }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
      <ol className="text-sm space-y-0.5">
        {pages.map((page) => (
          <li key={page.url} className="flex gap-3">
            <span className="tabular-nums w-10 text-right" style={{ color: 'var(--color-text)' }}>{formatNumber(page.score, 1)}</span>
            <span title={page.url} style={{ color: 'var(--color-text-secondary)', overflowWrap: 'anywhere' }}>{path(page.url)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
