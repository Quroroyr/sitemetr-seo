/**
 * A run while it is running (DESIGN.md, run screen).
 *
 * The agent is `crawling` — the one loop in the product, and only while a run
 * is live — beside one sentence that says what it is doing. The phase is the
 * headline, a 2px orange line shows the work done, and the right column is the
 * run's scope and Stop. Nothing is ranked yet: the fix queue appears once,
 * complete, when the run ends, so rows never re-sort under the reader.
 *
 * Driven by the run state streamed from the server or the main process, so a
 * crawl shows one row per category rather than one per category per page.
 */

import { useEffect, useState } from 'react';
import type { RunState } from '../../electron/shared/ipc-types.js';
import { runTiming, formatDuration } from '../lib/eta.js';
import { Agent } from './Logo.js';
import { StatusShape } from './Status.js';
import { trMessage, trRuleName } from '../../src/i18n/index.js';
import { formatNumber } from '../lib/format.js';
import { localizeActivity } from '../lib/audit-state.js';
import { categoryName } from '../lib/fixes.js';

interface ProgressStreamProps {
  run: RunState;
  onStop: () => void;
}

// All 22 categories in audit order (Сайтметр adds `yandex` and `bitrix`)
const ALL_CATEGORIES = [
  'core', 'technical', 'perf', 'links', 'images', 'security', 'crawl', 'schema', 'a11y', 'content',
  'social', 'eeat', 'url', 'mobile', 'i18n', 'legal', 'js', 'redirect', 'htmlval', 'geo', 'yandex', 'bitrix',
];

function hostOf(url: string | null): string {
  if (!url) return 'сайта';
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function pathOf(url: string): string {
  try {
    const { pathname, search } = new URL(url);
    return pathname + search || '/';
  } catch {
    return url;
  }
}

export function ProgressStream({ run, onStop }: ProgressStreamProps) {
  // Elapsed has to advance between server events, which arrive per page — on a
  // slow page that is tens of seconds of a frozen clock, which is exactly when
  // a reader starts wondering whether the run has died.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const scores = new Map(run.categories.map((c) => [c.categoryId, c.score]));
  const crawling = run.phase === 'crawling' && run.crawl !== null;

  // During the crawl the meaningful number is pages found; during scoring it
  // is categories finished.
  const [value, total] = crawling
    ? [run.crawl!.crawled, Math.max(run.crawl!.total, 1)]
    : [scores.size, ALL_CATEGORIES.length];
  const done = `${formatNumber(value)} из ${formatNumber(total)} ${crawling ? 'страниц' : 'категорий'}`;
  const currentUrl = crawling ? run.crawl?.currentUrl : run.pages.currentUrl;
  const host = hostOf(run.url);

  const timing = runTiming({
    startedAt: run.startedAt,
    firstPageAt: run.firstPageAt,
    lastPageAt: run.lastPageAt,
    completed: run.pages.completed,
    total: run.pages.total,
    crawling,
    now,
  });

  const sentence = run.activity
    ? localizeActivity(run.activity).replace(/\.?$/, '.')
    : currentUrl
      ? `Читаем ${pathOf(currentUrl)}. Готово ${done}.`
      : 'Запускаем проверку.';
  const args = run.args;
  const multiPage = Boolean(args?.crawl);

  return (
    <div className="grid lg:grid-cols-[8fr_4fr] min-h-[440px]">
      <div className="py-10 lg:pr-12 min-w-0">
        {/*
          The live region is this line and not the panel around it. With
          `aria-live` on the whole section a screen reader re-announced every
          element in it each time any one of them changed, which during a crawl
          is hundreds of times. This text changes only when the count does.
        */}
        <p className="sr-only" aria-live="polite">
          {crawling ? `Идёт обход сайта. Найдено ${done}` : `Идёт проверка. Готово ${done}`}
        </p>

        <div className="flex items-center gap-2.5 mb-6">
          <Agent state="crawling" size={40} label="Сайтметр. Идёт проверка" />
          <span className="agent-say">{sentence}</span>
        </div>
        <h1 className="text-[32px] leading-[36px] lg:text-[40px] lg:leading-[44px] font-semibold tracking-[-0.02em] [overflow-wrap:anywhere]">
          {crawling ? 'Обход' : run.phase === 'saving' ? 'Сохранение проверки' : 'Проверка'} {host}
        </h1>
        <div
          className="track mt-7"
          role="progressbar"
          aria-label={crawling ? 'Страниц пройдено' : 'Категорий проверено'}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={value}
        >
          <span style={{ transform: `scaleX(${Math.min(1, value / total)})` }} />
        </div>
        <p className="mt-4 figure text-xs text-[var(--color-text-muted)]">
          {done} · прошло {formatDuration(timing.elapsedSeconds)}
          {timing.remainingSeconds !== null && ` · осталось около ${formatDuration(timing.remainingSeconds)}`}
          {!crawling && run.pages.total > 1 && ` · страница ${formatNumber(run.pages.completed)} из ${formatNumber(run.pages.total)}`}
        </p>
        {currentUrl && (
          <p className="mt-1 figure text-xs text-[var(--color-text-secondary)] truncate">{currentUrl}</p>
        )}

        {run.recentRules.length > 0 && (
          <div className="mt-8">
            <div className="label mb-2">Последние результаты</div>
            <ul>
              {run.recentRules.slice(0, 3).map((rule, i) => (
                <li key={`${rule.ruleId}-${i}`} className="flex items-baseline gap-3 py-1.5 border-t border-[var(--color-border)] text-[13px] min-w-0">
                  <span className="status shrink-0 translate-y-[1px]">
                    <StatusShape status={rule.status} />
                  </span>
                  <span className="font-medium shrink-0">{trRuleName(rule.ruleId, rule.ruleName)}</span>
                  <span className="truncate text-[var(--color-text-muted)]">{trMessage(rule.ruleId, rule.message)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <div className="label mb-2">Категории</div>
          <ul className="grid grid-cols-2 gap-x-6">
            {ALL_CATEGORIES.map((id) => {
              const score = scores.get(id);
              const done = score !== undefined;
              return (
                <li key={id} className="flex items-center gap-2 py-1 text-[13px]">
                  <span className="status">
                    <StatusShape status={done ? 'pass' : 'not-measured'} />
                  </span>
                  <span style={{ color: done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {categoryName(id)}
                  </span>
                  {done && <span className="figure ml-auto text-[var(--color-text-muted)]">{Math.round(score)}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <aside aria-label="Текущая проверка" className="py-10 lg:pl-8 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] min-w-0">
        <div className="label">Текущая проверка</div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
          <dt className="text-[var(--color-text-muted)]">Сайт</dt>
          <dd className="figure text-right truncate">{host}</dd>
          <dt className="text-[var(--color-text-muted)]">Страницы</dt>
          <dd className="figure text-right">{multiPage ? (args?.maxPages ? `до ${formatNumber(args.maxPages)}` : '—') : '1'}</dd>
          <dt className="text-[var(--color-text-muted)]">Отрисовка в браузере</dt>
          <dd className="text-right">{args?.measureCwv ? 'Включена' : 'Выключена'}</dd>
          <dt className="text-[var(--color-text-muted)]">Категории</dt>
          <dd className="figure text-right">{args?.categories?.length ? formatNumber(args.categories.length) : `Все ${formatNumber(ALL_CATEGORIES.length)}`}</dd>
        </dl>
        <button type="button" className="btn mt-6" onClick={onStop}>
          Остановить
        </button>
        <p className="mt-6 text-xs text-[var(--color-text-muted)]">
          Очередь исправлений появится после проверки.
        </p>
      </aside>
    </div>
  );
}
