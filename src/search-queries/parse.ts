/**
 * Read a search-query export into rows.
 *
 * Accepts what the two consoles hand out without asking the user to unpack
 * or rename anything:
 * - Google Search Console: the CSV download (a ZIP with Queries.csv among
 *   other tables), the Excel download (.xlsx with a «Запросы»/«Queries»
 *   sheet), or Queries.csv on its own;
 * - Yandex Webmaster: its CSV or Excel table of search queries.
 *
 * Columns are found by their header text, not their position, in Russian or
 * English. A table that repeats a metric per period (Webmaster puts one
 * column per week) is summed into one figure.
 */

import { isZip, readZip, type ZipEntry } from './zip.js';

export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  /** Average position, or null when the export has none */
  position: number | null;
}

export type ExportSource = 'gsc' | 'yandex' | 'unknown';

export interface ParsedExport {
  rows: QueryRow[];
  source: ExportSource;
  /** Whether the export had a clicks column at all */
  hasClicks: boolean;
  hasPosition: boolean;
  /** Which file or sheet the rows came from, for the summary line */
  table: string;
}

export class ExportFormatError extends Error {}

// ---------------------------------------------------------------- text

/** UTF-8 when the bytes are valid UTF-8, otherwise Windows-1251 (old Excel CSV) */
export function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^﻿/, '');
  } catch {
    return new TextDecoder('windows-1251').decode(bytes);
  }
}

/** RFC 4180 CSV with the delimiter guessed from the first line */
export function parseCsv(text: string): string[][] {
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const delimiter = [',', ';', '\t'].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best
  );

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** "1 234", "3,45%", "12.5" → number; blanks and dashes → 0 */
export function parseNumber(raw: string | undefined): number {
  if (raw === undefined) return 0;
  const cleaned = raw.replace(/[\s  %]/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '—') return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

// ---------------------------------------------------------------- xlsx

function xmlText(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? 'A';
  let index = 0;
  for (const ch of letters) index = index * 26 + (ch.charCodeAt(0) - 64);
  return index - 1;
}

async function readEntry(entries: ZipEntry[], name: string): Promise<string | null> {
  const entry = entries.find((e) => e.name === name);
  return entry ? new TextDecoder().decode(await entry.read()) : null;
}

/** Every sheet of an .xlsx workbook as rows of cell text */
export async function readXlsxSheets(entries: ZipEntry[]): Promise<{ name: string; rows: string[][] }[]> {
  const workbook = (await readEntry(entries, 'xl/workbook.xml')) ?? '';
  const rels = (await readEntry(entries, 'xl/_rels/workbook.xml.rels')) ?? '';
  const sharedXml = (await readEntry(entries, 'xl/sharedStrings.xml')) ?? '';
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    xmlText([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))
  );

  const targets = new Map(
    [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => [
      /\bId="([^"]+)"/.exec(m[0])?.[1] ?? '',
      /\bTarget="([^"]+)"/.exec(m[0])?.[1] ?? '',
    ])
  );

  const sheets: { name: string; rows: string[][] }[] = [];
  for (const m of workbook.matchAll(/<sheet\b[^>]*>/g)) {
    const name = xmlText(/\bname="([^"]*)"/.exec(m[0])?.[1] ?? '');
    const rid = /\br:id="([^"]+)"/.exec(m[0])?.[1] ?? '';
    let target = targets.get(rid) ?? '';
    target = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
    const xml = await readEntry(entries, target);
    if (!xml) continue;

    const rows: string[][] = [];
    for (const r of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const row: string[] = [];
      for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1];
        const body = c[2] ?? '';
        const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1];
        const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
        const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
        let text = '';
        if (type === 's' && v !== undefined) text = shared[Number(v)] ?? '';
        else if (type === 'inlineStr') text = xmlText(/<is>([\s\S]*?)<\/is>/.exec(body)?.[1] ?? '');
        else if (v !== undefined) text = xmlText(v);
        const index = ref ? columnIndex(ref) : row.length;
        while (row.length < index) row.push('');
        row[index] = text;
      }
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
    }
    sheets.push({ name, rows });
  }
  return sheets;
}

// ---------------------------------------------------------------- columns

const QUERY_HEADER = /запрос|query|queries|ключев|keyword|фраз/i;
const IMPRESSIONS_HEADER = /показ|impression|shows|демонстрац/i;
const CLICKS_HEADER = /клик|click|переход/i;
const POSITION_HEADER = /позици|position/i;
// Webmaster has both; the position of a show is the one comparable to Google's
const CLICK_POSITION_HEADER = /позици[яи]\s+клик|click\s+position/i;
const NOT_A_METRIC = /ctr|доля|%|dynamics|динамик|измен|delta|прирост/i;

interface Columns {
  header: number;
  query: number;
  impressions: number[];
  clicks: number[];
  position: number[];
}

function findColumns(rows: string[][]): Columns | null {
  for (let h = 0; h < Math.min(rows.length, 15); h++) {
    const cells = rows[h].map((c) => c.trim());
    const query = cells.findIndex((c) => QUERY_HEADER.test(c) && !IMPRESSIONS_HEADER.test(c) && !CLICKS_HEADER.test(c));
    if (query === -1) continue;
    const pick = (test: (c: string) => boolean) =>
      cells.map((c, i) => (i !== query && test(c) ? i : -1)).filter((i) => i !== -1);
    const impressions = pick((c) => IMPRESSIONS_HEADER.test(c) && !POSITION_HEADER.test(c) && !NOT_A_METRIC.test(c));
    if (impressions.length === 0) continue;
    const clicks = pick((c) => CLICKS_HEADER.test(c) && !POSITION_HEADER.test(c) && !NOT_A_METRIC.test(c));
    const positions = pick((c) => POSITION_HEADER.test(c) && !NOT_A_METRIC.test(c));
    const showPositions = positions.filter((i) => !CLICK_POSITION_HEADER.test(cells[i]));
    return {
      header: h,
      query,
      impressions,
      clicks,
      position: showPositions.length > 0 ? showPositions : positions,
    };
  }
  return null;
}

function sourceOf(header: string[]): ExportSource {
  const text = header.join(' | ').toLowerCase();
  if (/самые популярные запросы|top queries/.test(text)) return 'gsc';
  if (/средняя позиция|демонстрац|\d{2}[.-]\d{2}[.-]\d{2,4}/.test(text)) return 'yandex';
  return 'unknown';
}

/** Turn a table into query rows, or null when it is not a query table */
export function rowsFromTable(table: string[][]): Omit<ParsedExport, 'table'> | null {
  const columns = findColumns(table);
  if (!columns) return null;

  const byQuery = new Map<string, QueryRow & { positionWeight: number }>();
  for (const cells of table.slice(columns.header + 1)) {
    const query = (cells[columns.query] ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
    if (!query || /^(итого|всего|total)/i.test(query)) continue;

    const impressions = columns.impressions.reduce((sum, i) => sum + parseNumber(cells[i]), 0);
    const clicks = columns.clicks.reduce((sum, i) => sum + parseNumber(cells[i]), 0);
    // Per-period positions are averaged weighted by that period's shows
    let positionSum = 0;
    let positionWeight = 0;
    columns.position.forEach((col, k) => {
      const position = parseNumber(cells[col]);
      if (position <= 0) return;
      const weight =
        columns.position.length === columns.impressions.length
          ? parseNumber(cells[columns.impressions[k]]) || 1
          : 1;
      positionSum += position * weight;
      positionWeight += weight;
    });

    const existing = byQuery.get(query);
    if (existing) {
      // The same query twice (two groups, two regions): one row
      existing.impressions += impressions;
      existing.clicks += clicks;
      if (positionWeight > 0) {
        const total = existing.positionWeight + positionWeight;
        existing.position = ((existing.position ?? 0) * existing.positionWeight + positionSum) / total;
        existing.positionWeight = total;
      }
    } else {
      byQuery.set(query, {
        query,
        impressions,
        clicks,
        position: positionWeight > 0 ? positionSum / positionWeight : null,
        positionWeight,
      });
    }
  }

  const rows = [...byQuery.values()]
    .map(({ positionWeight: _, ...row }) => row)
    .filter((row) => row.impressions > 0 || row.clicks > 0);
  return {
    rows,
    source: sourceOf(table[columns.header]),
    hasClicks: columns.clicks.length > 0,
    hasPosition: columns.position.length > 0,
  };
}

// ---------------------------------------------------------------- files

/** Tables named like a query table come first */
const QUERY_TABLE_NAME = /quer|запрос/i;

function byLikelyName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(QUERY_TABLE_NAME.test(b.name)) - Number(QUERY_TABLE_NAME.test(a.name)));
}

function pickTable(tables: { name: string; rows: string[][] }[]): ParsedExport {
  for (const table of byLikelyName(tables)) {
    const parsed = rowsFromTable(table.rows);
    if (parsed && parsed.rows.length > 0) return { ...parsed, table: table.name };
  }
  throw new ExportFormatError(
    'В файле не нашлось таблицы запросов: нужны столбцы с запросом и показами. Выгрузите отчёт «Эффективность» из Search Console или «Поисковые запросы» из Вебмастера.'
  );
}

/** Parse whatever file the user dropped */
export async function parseQueryExport(fileName: string, bytes: Uint8Array): Promise<ParsedExport> {
  // Legacy binary .xls (an OLE compound file) cannot be read here
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    throw new ExportFormatError('Старый формат .xls не поддерживается. Скачайте таблицу в CSV или пересохраните её в Excel как .xlsx.');
  }

  if (isZip(bytes)) {
    const entries = readZip(bytes);
    if (entries.some((e) => e.name === 'xl/workbook.xml')) {
      return pickTable(await readXlsxSheets(entries));
    }
    const csvs = entries.filter((e) => /\.(csv|tsv|txt)$/i.test(e.name));
    if (csvs.length === 0) throw new ExportFormatError('В архиве нет CSV-файлов.');
    const tables = [];
    for (const entry of byLikelyName(csvs)) {
      tables.push({ name: entry.name.split('/').pop() ?? entry.name, rows: parseCsv(decodeText(await entry.read())) });
    }
    return pickTable(tables);
  }

  return pickTable([{ name: fileName, rows: parseCsv(decodeText(bytes)) }]);
}
