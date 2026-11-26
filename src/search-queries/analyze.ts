/**
 * Sort an export into the groups of ./filters.ts and rank what is in them.
 *
 * Within a group the rows are ranked by missed clicks: what the query's
 * shows would bring at a typical CTR for its position, minus the clicks it
 * got. A query that is seen and not chosen, or seen a lot near the top, is
 * where a change to the page pays first. Without positions in the export
 * (some Webmaster tables) the rank falls back to shows.
 */

import type { QueryRow } from './parse.js';
import { QUERY_FILTERS, expectedCtr, matchesFilter, type QueryFilter } from './filters.js';

export interface RankedQuery extends QueryRow {
  ctr: number;
  /** Clicks a typical page at this position would get beyond these, or null without a position */
  missedClicks: number | null;
}

export interface QueryGroup {
  filter: QueryFilter;
  rows: RankedQuery[];
  impressions: number;
  clicks: number;
  missedClicks: number;
}

export interface QueryAnalysis {
  total: { queries: number; impressions: number; clicks: number };
  /** Queries left out as brand queries */
  brandQueries: number;
  groups: QueryGroup[];
}

export function rankQuery(row: QueryRow): RankedQuery {
  const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0;
  const missedClicks =
    row.position === null ? null : Math.max(0, Math.round(row.impressions * expectedCtr(row.position) - row.clicks));
  return { ...row, ctr, missedClicks };
}

function byOpportunity(a: RankedQuery, b: RankedQuery): number {
  return (b.missedClicks ?? 0) - (a.missedClicks ?? 0) || b.impressions - a.impressions || a.query.localeCompare(b.query);
}

/** Brand words from a comma-separated field, lowercased, blanks dropped */
export function brandTerms(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= 2);
}

export function analyzeQueries(rows: QueryRow[], brand: string[] = []): QueryAnalysis {
  const isBrand = (row: QueryRow) => brand.some((term) => row.query.includes(term));
  const kept = rows.filter((row) => !isBrand(row)).map(rankQuery);

  const groups = QUERY_FILTERS.map((filter) => {
    const matched = kept.filter((row) => matchesFilter(filter, row)).sort(byOpportunity);
    return {
      filter,
      rows: matched,
      impressions: matched.reduce((sum, row) => sum + row.impressions, 0),
      clicks: matched.reduce((sum, row) => sum + row.clicks, 0),
      missedClicks: matched.reduce((sum, row) => sum + (row.missedClicks ?? 0), 0),
    };
  });

  return {
    total: {
      queries: rows.length,
      impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
      clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    },
    brandQueries: rows.length - kept.length,
    groups,
  };
}
