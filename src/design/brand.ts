/**
 * Сайтметр brand: the name and the gauge emblem.
 *
 * One definition for every surface that draws the mark: the React lockup and
 * agent (`ui/components/Logo.tsx`), the HTML report, the app icon generator
 * and the terminal. The emblem is a dial on a cobalt squircle: a pale track
 * for the whole 0-100 scale, a white arc for the reading, a white needle.
 *
 * Geometry is in a 150x150 box. The dial's centre is (75, 84), radius 44; the
 * scale runs 240 degrees, from lower-left (value 0) over the top to lower-right
 * (value 100), so the needle's rotation from straight up is -120 + 2.4 * value.
 */

export const BRAND_NAME = 'Сайтметр';
/** Lowercase, as the wordmark sets it */
export const BRAND_WORDMARK = 'сайтметр';

/** The emblem's cobalt, fixed on every ground (the light theme's agent colour) */
export const EMBLEM_COBALT = '#2F5BEA';

export const EMBLEM_VIEWBOX = '0 0 150 150';
/** Rounded square body */
export const EMBLEM_BODY = 'M48 5H102C128 5 145 22 145 48V102C145 128 128 145 102 145H48C22 145 5 128 5 102V48C5 22 22 5 48 5Z';
/** The dial: lower-left, over the top, to lower-right. Use with pathLength="100". */
export const EMBLEM_DIAL = 'M36.9 106A44 44 0 1 1 113.1 106';
/** Needle, drawn pointing straight up from the pivot; rotate about EMBLEM_PIVOT */
export const EMBLEM_NEEDLE = 'M75 84V56';
export const EMBLEM_PIVOT = { x: 75, y: 84, r: 11 } as const;
export const EMBLEM_STROKE = { dial: 13, needle: 11 } as const;
/** The reading the still mark shows */
export const EMBLEM_DEFAULT_VALUE = 72;

/** Needle rotation in degrees for a dial value 0..100 */
export function needleAngle(value: number): number {
  const v = Math.max(0, Math.min(100, value));
  return Math.round((-120 + 2.4 * v) * 10) / 10;
}

function escapeAttr(value: string): string {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The emblem as a standalone SVG string, for the HTML report, icons and other
 * places outside React. `size` is the rendered width and height in px.
 */
export function emblemSvg({
  size = 32,
  fill = EMBLEM_COBALT,
  value = EMBLEM_DEFAULT_VALUE,
  title = BRAND_NAME,
}: { size?: number; fill?: string; value?: number; title?: string } = {}): string {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const px = Math.max(1, Math.round(Number(size) || 32));
  const { x, y, r } = EMBLEM_PIVOT;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEM_VIEWBOX}" width="${px}" height="${px}" role="img" aria-label="${escapeAttr(title)}">` +
    `<path d="${EMBLEM_BODY}" fill="${escapeAttr(fill)}"/>` +
    `<path d="${EMBLEM_DIAL}" pathLength="100" fill="none" stroke="#fff" stroke-opacity="0.38" stroke-width="${EMBLEM_STROKE.dial}" stroke-linecap="round"/>` +
    `<path d="${EMBLEM_DIAL}" pathLength="100" fill="none" stroke="#fff" stroke-width="${EMBLEM_STROKE.dial}" stroke-linecap="round" stroke-dasharray="${v} 100"/>` +
    `<path d="${EMBLEM_NEEDLE}" stroke="#fff" stroke-width="${EMBLEM_STROKE.needle}" stroke-linecap="round" transform="rotate(${needleAngle(v)} ${x} ${y})"/>` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>` +
    `</svg>`
  );
}
