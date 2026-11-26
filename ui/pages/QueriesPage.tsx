/**
 * Search queries: an export from Search Console or Yandex Webmaster, sorted
 * into groups worth answering on the page (src/search-queries).
 *
 * Everything happens in the renderer: the file is read, unzipped and parsed
 * here, so the page works the same in the desktop app and the dashboard and
 * sends the user's query data nowhere. The last import is kept in
 * localStorage, a per-viewer convenience: losing it costs one more drop.
 */

import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactElement } from 'react';
import {
  analyzeQueries,
  brandTerms,
  parseQueryExport,
  type ParsedExport,
  type QueryGroup,
} from '../../src/search-queries/index.js';
import { Agent } from '../components/Logo.js';
import { formatNumber } from '../lib/format.js';
import { plural } from '../../src/i18n/index.js';

const STORAGE_KEY = 'sitemetr.queries.v1';
const PAGE_ROWS = 50;

interface Saved {
  fileName: string;
  parsed: ParsedExport;
  brand: string;
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function save(value: Saved | null): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage full or blocked: the page still works for this session
  }
}

const SOURCE_NAMES: Record<ParsedExport['source'], string> = {
  gsc: 'Google Search Console',
  yandex: 'Яндекс.Вебмастер',
  unknown: 'таблица запросов',
};

export function QueriesPage() {
  const [data, setData] = useState<Saved | null>(() => load());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Запросы · Сайтметр';
    return () => {
      document.title = 'Сайтметр';
    };
  }, []);

  const readFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseQueryExport(file.name, new Uint8Array(await file.arrayBuffer()));
      const next = { fileName: file.name, parsed, brand: data?.brand ?? '' };
      setData(next);
      save(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось прочитать файл.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void readFile(file);
  };

  const setBrand = (brand: string) => {
    if (!data) return;
    const next = { ...data, brand };
    setData(next);
    save(next);
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept=".csv,.tsv,.txt,.zip,.xlsx"
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void readFile(file);
      }}
    />
  );

  return (
    <div
      className="max-w-[var(--content-max-width)] mx-auto px-4 md:px-6 py-10"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2.5 mb-6">
        <Agent state={busy ? 'crawling' : error ? 'alert' : 'idle'} size={40} />
        <span className="agent-say" aria-live="polite">
          {busy
            ? 'Читаем выгрузку…'
            : error
              ? error
              : data
                ? `${formatNumber(data.parsed.rows.length)} ${plural(data.parsed.rows.length, 'запрос', 'запроса', 'запросов')} из файла ${data.fileName}.`
                : 'Покажу, на какие вопросы и запросы стоит ответить на страницах сайта.'}
        </span>
      </div>
      <h1 className="text-[32px] leading-[36px] lg:text-[40px] lg:leading-[44px] font-semibold tracking-[-0.02em] mb-6">
        Поисковые запросы
      </h1>

      {data ? (
        <Analysis data={data} onBrand={setBrand} picker={picker} onPick={() => inputRef.current?.click()} onClear={() => { setData(null); save(null); }} />
      ) : (
        <Intro picker={picker} dragging={dragging} busy={busy} onPick={() => inputRef.current?.click()} />
      )}
    </div>
  );
}

function Intro({ picker, dragging, busy, onPick }: { picker: ReactElement; dragging: boolean; busy: boolean; onPick: () => void }) {
  return (
    <>
      <p className="text-[15px] leading-6 text-[var(--color-text-secondary)] max-w-[680px] mb-8">
        Скачайте отчёт по запросам из Search Console или Яндекс.Вебмастера и перетащите файл сюда. Сайтметр разложит
        запросы на группы — вопросы, инструкции, сравнения, коммерческие, «почти в топе» — и покажет, где сайт
        теряет больше всего кликов. Файл никуда не отправляется: всё считается на этом компьютере.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <section className="tbl p-5">
          <h2 className="label mb-3">Google Search Console</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-[14px] leading-6">
            <li>Откройте search.google.com/search-console и выберите сайт.</li>
            <li>Слева — «Эффективность» → «Результаты поиска».</li>
            <li>Вверху выберите период: «Последние 3 месяца» или больше.</li>
            <li>Справа вверху — «Экспортировать» → «Скачать CSV» или «Скачать в формате Excel».</li>
            <li>Перетащите скачанный файл сюда. ZIP-архив распаковывать не нужно.</li>
          </ol>
          <p className="text-[13px] mt-3 text-[var(--color-text-muted)]">Search Console отдаёт в выгрузке до 1000 самых частых запросов.</p>
        </section>
        <section className="tbl p-5">
          <h2 className="label mb-3">Яндекс.Вебмастер</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-[14px] leading-6">
            <li>Откройте webmaster.yandex.ru и выберите сайт.</li>
            <li>Слева — «Поисковые запросы» → «Статистика запросов».</li>
            <li>Выберите период и включите показатели «Показы», «Клики» и «Средняя позиция показа».</li>
            <li>Под таблицей — «Скачать таблицу» → CSV или XLSX.</li>
            <li>Перетащите скачанный файл сюда.</li>
          </ol>
          <p className="text-[13px] mt-3 text-[var(--color-text-muted)]">
            Если в вашем Вебмастере пункты называются иначе, подойдёт любая таблица со столбцом запросов и столбцом показов.
          </p>
        </section>
      </div>

      <label
        className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center rounded-[4px] cursor-pointer"
        style={{
          border: `1px dashed ${dragging ? 'var(--color-agent)' : 'var(--color-border-strong)'}`,
          background: dragging ? 'var(--color-bg-elevated)' : 'transparent',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPick();
          }
        }}
        tabIndex={0}
      >
        {picker}
        <span className="text-[15px] font-medium">{busy ? 'Читаем файл…' : 'Перетащите файл сюда или нажмите, чтобы выбрать'}</span>
        <span className="text-[13px] text-[var(--color-text-muted)]">CSV, ZIP из Search Console или Excel (.xlsx)</span>
      </label>
    </>
  );
}

function Analysis({
  data,
  onBrand,
  picker,
  onPick,
  onClear,
}: {
  data: Saved;
  onBrand: (brand: string) => void;
  picker: ReactElement;
  onPick: () => void;
  onClear: () => void;
}) {
  const analysis = useMemo(() => analyzeQueries(data.parsed.rows, brandTerms(data.brand)), [data.parsed.rows, data.brand]);
  const [selected, setSelected] = useState(analysis.groups[0].filter.id);
  const group = analysis.groups.find((g) => g.filter.id === selected) ?? analysis.groups[0];
  const { total } = analysis;

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3 pb-6 mb-6 border-b border-[var(--color-border)]">
        <Figure label="Источник" value={SOURCE_NAMES[data.parsed.source]} />
        <Figure label="Запросов" value={formatNumber(total.queries)} />
        <Figure label="Показов" value={formatNumber(total.impressions)} />
        {data.parsed.hasClicks && <Figure label="Кликов" value={formatNumber(total.clicks)} />}
        <label className="flex flex-col gap-1 min-w-[220px] flex-1 max-w-[340px]">
          <span className="label">Бренд — не учитывать</span>
          <input
            type="text"
            value={data.brand}
            onChange={(e) => onBrand(e.target.value)}
            placeholder="окнамаркет, okna market"
            className="h-8 px-2.5 rounded-[4px] text-[14px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)]"
          />
        </label>
        <div className="flex gap-2 ml-auto">
          {picker}
          <button type="button" className="btn" onClick={onPick}>
            Другой файл
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Убрать
          </button>
        </div>
      </div>

      {analysis.brandQueries > 0 && (
        <p className="text-[13px] text-[var(--color-text-muted)] -mt-3 mb-5">
          Не учтено {formatNumber(analysis.brandQueries)} {plural(analysis.brandQueries, 'брендовый запрос', 'брендовых запроса', 'брендовых запросов')}.
        </p>
      )}
      {!data.parsed.hasPosition && (
        <p className="text-[13px] text-[var(--color-text-muted)] -mt-3 mb-5">
          В файле нет позиций, поэтому группы «Почти в топе» и «Много показов, мало кликов» пусты, а запросы отсортированы по показам.
        </p>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <nav aria-label="Группы запросов" className="flex flex-col gap-0.5">
          {analysis.groups.map((g) => (
            <button
              key={g.filter.id}
              type="button"
              aria-pressed={g.filter.id === group.filter.id}
              onClick={() => setSelected(g.filter.id)}
              className="flex items-baseline justify-between gap-3 text-left px-3 py-2 rounded-[4px] hover:bg-[var(--color-bg-elevated)]"
              style={
                g.filter.id === group.filter.id
                  ? { background: 'var(--color-bg-elevated)', boxShadow: 'inset 2px 0 0 var(--color-agent)' }
                  : undefined
              }
            >
              <span className="text-[14px]" style={{ color: g.rows.length ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {g.filter.title}
              </span>
              <span className="figure text-[12px] text-[var(--color-text-muted)]">{formatNumber(g.rows.length)}</span>
            </button>
          ))}
        </nav>
        <GroupView key={group.filter.id} group={group} hasClicks={data.parsed.hasClicks} />
      </div>
    </>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <span className="figure text-[20px] leading-6">{value}</span>
    </div>
  );
}

function GroupView({ group, hasClicks }: { group: QueryGroup; hasClicks: boolean }) {
  const [all, setAll] = useState(false);
  const { filter, rows } = group;
  const shown = all ? rows : rows.slice(0, PAGE_ROWS);

  return (
    <section className="min-w-0">
      <h2 className="text-[22px] leading-7 font-semibold mb-1">{filter.title}</h2>
      <p className="text-[14px] text-[var(--color-text-secondary)] mb-3">{filter.finds}</p>
      <p className="agent-say mb-4">{filter.action}</p>

      {filter.regex ? (
        <RegexBox regex={filter.regex} />
      ) : (
        <p className="text-[13px] text-[var(--color-text-muted)] mb-4">
          Эта группа считается по цифрам, а не по словам: в Search Console её не задать регулярным выражением.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="tbl px-4 py-6 text-[14px] text-[var(--color-text-secondary)]">В этой выгрузке таких запросов нет.</p>
      ) : (
        <>
          <p className="text-[13px] text-[var(--color-text-muted)] mb-2">
            {formatNumber(rows.length)} {plural(rows.length, 'запрос', 'запроса', 'запросов')} · {formatNumber(group.impressions)}{' '}
            {plural(group.impressions, 'показ', 'показа', 'показов')}
            {group.missedClicks > 0 && ` · упущено около ${formatNumber(group.missedClicks)} ${plural(group.missedClicks, 'клика', 'кликов', 'кликов')}`}
          </p>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Запрос</th>
                  <th className="num">Показы</th>
                  {hasClicks && <th className="num">Клики</th>}
                  {hasClicks && <th className="num">CTR</th>}
                  <th className="num">Позиция</th>
                  <th className="num" title="Сколько кликов обычно получает страница на этой позиции сверх полученных">Упущено</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={row.query}>
                    <td className="text-[14px] [overflow-wrap:anywhere]">{row.query}</td>
                    <td className="num figure text-[13px]">{formatNumber(row.impressions)}</td>
                    {hasClicks && <td className="num figure text-[13px]">{formatNumber(row.clicks)}</td>}
                    {hasClicks && <td className="num figure text-[13px]">{formatNumber(row.ctr * 100, 1)}%</td>}
                    <td className="num figure text-[13px]">{row.position === null ? '—' : formatNumber(row.position, 1)}</td>
                    <td className="num figure text-[13px]">{row.missedClicks === null ? '—' : formatNumber(row.missedClicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > PAGE_ROWS && (
            <button type="button" className="btn btn-ghost mt-2 -ml-3" onClick={() => setAll(!all)}>
              {all ? 'Свернуть' : `Показать все ${formatNumber(rows.length)}`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

function RegexBox({ regex }: { regex: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(regex);
      setState('done');
      window.setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('failed');
    }
  };
  return (
    <div className="mb-5">
      <span className="label">Фильтр для Search Console</span>
      <pre className="tbl mt-1.5 px-3 py-2 text-[12px] leading-5 font-[var(--font-mono)] whitespace-pre-wrap [overflow-wrap:anywhere]">{regex}</pre>
      <div className="flex flex-wrap items-center gap-x-3">
        <button type="button" className="btn btn-ghost -ml-3" onClick={() => void copy()} aria-live="polite">
          <span key={state} className="copy-swap">
            {state === 'done' ? 'Скопировано' : state === 'failed' ? 'Не удалось скопировать' : 'Скопировать'}
          </span>
        </button>
        <span className="text-[12px] text-[var(--color-text-muted)]">
          «Эффективность» → «+ Добавить фильтр» → «Запрос» → «Пользовательское (регулярное выражение)»
        </span>
      </div>
    </div>
  );
}
