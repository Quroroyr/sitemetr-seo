import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import {
  QUERY_FILTERS,
  analyzeQueries,
  brandTerms,
  expectedCtr,
  matchesFilter,
  parseCsv,
  parseNumber,
  parseQueryExport,
  type QueryRow,
} from './index.js';

/** A minimal ZIP writer, deflating every entry, for fixtures */
function makeZip(files: Record<string, string | Uint8Array>): Uint8Array {
  const enc = new TextEncoder();
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const raw = typeof content === 'string' ? enc.encode(content) : content;
    const data = deflateRawSync(raw);
    const nameBytes = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(Object.keys(files).length, 8);
  eocd.writeUInt16LE(Object.keys(files).length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, ...centrals, eocd]));
}

const GSC_QUERIES_CSV = [
  'Самые популярные запросы,Клики,Показы,CTR,Позиция',
  'как выбрать пластиковые окна,12,"1 480","0,81%","6,4"',
  'купить окна недорого,40,900,"4,44%",3.1',
  'окна пвх,5,200,"2,5%",12',
].join('\n');

const enc = (s: string) => new TextEncoder().encode(s);

describe('parsing exports', () => {
  it('reads a Search Console Queries.csv with Russian headers and decimal commas', async () => {
    const parsed = await parseQueryExport('Queries.csv', enc('﻿' + GSC_QUERIES_CSV));
    expect(parsed.source).toBe('gsc');
    expect(parsed.rows).toEqual([
      { query: 'как выбрать пластиковые окна', clicks: 12, impressions: 1480, position: 6.4 },
      { query: 'купить окна недорого', clicks: 40, impressions: 900, position: 3.1 },
      { query: 'окна пвх', clicks: 5, impressions: 200, position: 12 },
    ]);
  });

  it('picks the queries table out of the Search Console CSV archive', async () => {
    const zip = makeZip({
      'Dates.csv': 'Дата,Клики,Показы,CTR,Позиция\n2026-11-01,3,100,3%,5',
      'Pages.csv': 'Самые популярные страницы,Клики,Показы,CTR,Позиция\nhttps://example.ru/,57,2580,2%,6',
      'Queries.csv': GSC_QUERIES_CSV,
    });
    const parsed = await parseQueryExport('example.ru-Performance-on-Search-2026-11-26.zip', zip);
    expect(parsed.table).toBe('Queries.csv');
    expect(parsed.rows.map((r) => r.query)).toContain('окна пвх');
  });

  it('reads the queries sheet of the Search Console Excel export', async () => {
    const strings = ['Самые популярные запросы', 'Клики', 'Показы', 'CTR', 'Позиция', 'окна &amp; двери цена'];
    const xlsx = makeZip({
      'xl/workbook.xml':
        '<workbook xmlns:r="r"><sheets><sheet name="Диаграмма" sheetId="1" r:id="rId1"/><sheet name="Запросы" sheetId="2" r:id="rId2"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':
        '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="worksheets/sheet2.xml"/></Relationships>',
      'xl/sharedStrings.xml': `<sst>${strings.map((s) => `<si><t>${s}</t></si>`).join('')}</sst>`,
      'xl/worksheets/sheet1.xml': '<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Дата</t></is></c></row></sheetData></worksheet>',
      'xl/worksheets/sheet2.xml':
        '<worksheet><sheetData>' +
        '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c><c r="E1" t="s"><v>4</v></c></row>' +
        '<row r="2"><c r="A2" t="s"><v>5</v></c><c r="B2"><v>7</v></c><c r="C2"><v>350</v></c><c r="D2"><v>0.02</v></c><c r="E2"><v>4.25</v></c></row>' +
        '</sheetData></worksheet>',
    });
    const parsed = await parseQueryExport('export.xlsx', xlsx);
    expect(parsed.table).toBe('Запросы');
    expect(parsed.rows).toEqual([{ query: 'окна & двери цена', clicks: 7, impressions: 350, position: 4.25 }]);
  });

  it('sums a Webmaster-style table with a column per week, in Windows-1251', async () => {
    const text = [
      'Запрос;01.11.2026 Показы;01.11.2026 Клики;01.11.2026 Средняя позиция показа;08.11.2026 Показы;08.11.2026 Клики;08.11.2026 Средняя позиция показа',
      'ремонт окон;100;4;5;300;6;9',
    ].join('\r\n');
    // Windows-1251 by hand: the Cyrillic letters used above
    const cp1251 = new Uint8Array([...text].map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 0x410 && code <= 0x44f) return code - 0x410 + 0xc0;
      if (code === 0x401) return 0xa8;
      if (code === 0x451) return 0xb8;
      return code;
    }));
    const parsed = await parseQueryExport('queries.csv', cp1251);
    expect(parsed.source).toBe('yandex');
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].query).toBe('ремонт окон');
    expect(parsed.rows[0].impressions).toBe(400);
    expect(parsed.rows[0].clicks).toBe(10);
    // weighted by shows: (5*100 + 9*300) / 400
    expect(parsed.rows[0].position).toBeCloseTo(8, 5);
  });

  it('merges a query that appears twice and skips a totals row', async () => {
    const parsed = await parseQueryExport(
      'q.csv',
      enc('Query,Impressions,Clicks\nOkna,10,1\nokna,30,2\nИтого,40,3\n')
    );
    expect(parsed.rows).toEqual([{ query: 'okna', impressions: 40, clicks: 3, position: null }]);
    expect(parsed.hasPosition).toBe(false);
  });

  it('refuses a legacy .xls and a table without queries, in words', async () => {
    await expect(parseQueryExport('a.xls', new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0]))).rejects.toThrow(/xls/);
    await expect(parseQueryExport('a.csv', enc('Страница,Клики\n/,1'))).rejects.toThrow(/таблицы запросов/);
  });

  it('parses quoted CSV fields and numbers', () => {
    expect(parseCsv('a;b\n"x;""y""";2\n')).toEqual([['a', 'b'], ['x;"y"', '2']]);
    expect(parseNumber('1 234')).toBe(1234);
    expect(parseNumber('3,45%')).toBe(3.45);
    expect(parseNumber('—')).toBe(0);
  });
});

const row = (query: string, extra: Partial<QueryRow> = {}): QueryRow => ({
  query,
  clicks: 0,
  impressions: 100,
  position: 5,
  ...extra,
});

function groupsOf(query: string, extra: Partial<QueryRow> = {}): string[] {
  return QUERY_FILTERS.filter((f) => matchesFilter(f, row(query, extra))).map((f) => f.id);
}

describe('query filters', () => {
  it('every regex is portable to Search Console (RE2): no \\b, no lookarounds, no backreferences', () => {
    for (const filter of QUERY_FILTERS.filter((f) => f.regex)) {
      expect(filter.regex, filter.id).not.toMatch(/\\b|\(\?[=!<]|\\[1-9]/);
    }
  });

  it('finds Russian questions without catching words that only start like one', () => {
    expect(groupsOf('как выбрать окна')).toContain('questions');
    expect(groupsOf('можно ли мыть окна зимой')).toContain('questions');
    expect(groupsOf('какао рецепт')).not.toContain('questions');
    expect(groupsOf('what is seo')).toContain('questions');
  });

  it('sorts intent groups', () => {
    expect(groupsOf('как сделать полку своими руками')).toContain('howto');
    expect(groupsOf('что такое клининг')).toContain('definitions');
    expect(groupsOf('принтер не печатает ошибка 5')).toContain('problems');
    expect(groupsOf('окна rehau или veka')).toContain('compare');
    expect(groupsOf('топ 10 сериалов')).toContain('compare');
    expect(groupsOf('топливо цена')).not.toContain('compare');
    expect(groupsOf('топливо цена')).toContain('commercial');
    expect(groupsOf('окна в перми')).toContain('local');
    expect(groupsOf('перманентный макияж')).not.toContain('local');
    expect(groupsOf('подскажи хороший ноутбук')).toContain('prompts');
  });

  it('counts words for the long-tail groups', () => {
    expect(groupsOf('окна пвх цена')).not.toContain('long');
    expect(groupsOf('окна пвх цена москва')).toContain('long');
    expect(groupsOf('какие окна лучше поставить в деревянном доме зимой')).toContain('very-long');
  });

  it('flags near-top and low-CTR rows by their numbers', () => {
    expect(groupsOf('x', { position: 7 })).toContain('near-top');
    expect(groupsOf('x', { position: 2 })).not.toContain('near-top');
    expect(groupsOf('x', { position: null })).not.toContain('near-top');
    // position 1 expects 28%; 5 clicks of 100 is 5%
    expect(groupsOf('x', { position: 1, clicks: 5 })).toContain('low-ctr');
    expect(groupsOf('x', { position: 1, clicks: 20 })).not.toContain('low-ctr');
  });
});

describe('analysis', () => {
  it('ranks a group by missed clicks and leaves brand queries out', () => {
    expect(expectedCtr(1)).toBeGreaterThan(expectedCtr(5));
    const analysis = analyzeQueries(
      [
        row('как выбрать окна', { impressions: 1000, position: 3, clicks: 10 }),
        row('как мыть окна', { impressions: 100, position: 3, clicks: 10 }),
        row('как купить окна в окнамаркет', { impressions: 5000, position: 1, clicks: 0 }),
      ],
      brandTerms('Окнамаркет, ')
    );
    expect(analysis.brandQueries).toBe(1);
    const questions = analysis.groups.find((g) => g.filter.id === 'questions')!;
    expect(questions.rows.map((r) => r.query)).toEqual(['как выбрать окна', 'как мыть окна']);
    // 1000 * 0.11 - 10
    expect(questions.rows[0].missedClicks).toBe(100);
    expect(questions.rows[1].missedClicks).toBe(1);
    expect(analysis.total.queries).toBe(3);
  });
});
