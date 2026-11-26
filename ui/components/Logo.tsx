/**
 * The Сайтметр lockup, emblem and agent.
 *
 * The geometry lives in `src/design/brand.ts`, shared with the HTML report and
 * the icon generator. In the app the emblem is painted with the theme's agent
 * colour (`--color-agent`), so it is the same cobalt as the one primary button
 * on the screen, a step lighter on dark grounds. The wordmark is live text in
 * Geist and follows the surrounding text colour.
 */

import type { CSSProperties } from 'react';
import {
  BRAND_NAME,
  BRAND_WORDMARK,
  EMBLEM_BODY,
  EMBLEM_DEFAULT_VALUE,
  EMBLEM_DIAL,
  EMBLEM_NEEDLE,
  EMBLEM_PIVOT,
  EMBLEM_STROKE,
  EMBLEM_VIEWBOX,
  needleAngle,
} from '../../src/design/brand.js';

const AGENT_FILL = 'var(--color-agent)';

/** The dial, its reading and the needle, over the body; `value` is 0..100 */
function EmblemParts({ value, live = false }: { value: number; live?: boolean }) {
  const { x, y, r } = EMBLEM_PIVOT;
  return (
    <>
      <path className="agent-body" d={EMBLEM_BODY} fill={AGENT_FILL} />
      <path
        d={EMBLEM_DIAL}
        pathLength={100}
        fill="none"
        stroke="white"
        strokeOpacity={0.38}
        strokeWidth={EMBLEM_STROKE.dial}
        strokeLinecap="round"
      />
      <path
        className="agent-reading"
        d={EMBLEM_DIAL}
        pathLength={100}
        fill="none"
        stroke="white"
        strokeWidth={EMBLEM_STROKE.dial}
        strokeLinecap="round"
        strokeDasharray={live ? '100 100' : `${value} 100`}
      />
      <path
        className="agent-needle"
        d={EMBLEM_NEEDLE}
        stroke="white"
        strokeWidth={EMBLEM_STROKE.needle}
        strokeLinecap="round"
        transform={live ? undefined : `rotate(${needleAngle(value)} ${x} ${y})`}
      />
      <circle cx={x} cy={y} r={r} fill="white" />
    </>
  );
}

interface LogoProps {
  /** Height of the lockup in px; the emblem is a little taller than the cap height */
  height?: number;
  className?: string;
}

/** Emblem plus wordmark, sized by height */
export function Logo({ height = 22, className }: LogoProps) {
  const emblem = Math.round(height * 1.1);
  return (
    <span
      role="img"
      aria-label={BRAND_NAME}
      className={['inline-flex items-center', className].filter(Boolean).join(' ')}
      style={{ gap: Math.round(height * 0.36) }}
    >
      <svg viewBox={EMBLEM_VIEWBOX} width={emblem} height={emblem} aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
        <EmblemParts value={EMBLEM_DEFAULT_VALUE} />
      </svg>
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 650,
          fontSize: Math.round(height * 0.95),
          lineHeight: 1,
          letterSpacing: '-0.035em',
          color: 'var(--color-text)',
          // Optical: lowercase Cyrillic sits low next to a square emblem
          transform: 'translateY(-0.04em)',
        }}
      >
        {BRAND_WORDMARK}
      </span>
    </span>
  );
}

/** The emblem on its own, for places too tight for the wordmark */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox={EMBLEM_VIEWBOX}
      width={size}
      height={size}
      role="img"
      aria-label={BRAND_NAME}
      className={className}
      style={{ display: 'block' }}
    >
      <EmblemParts value={EMBLEM_DEFAULT_VALUE} />
    </svg>
  );
}

/** The six states of the agent in product UI */
export type AgentState = 'idle' | 'crawling' | 'focused' | 'alert' | 'shocked' | 'delighted';

/**
 * The emblem as a character: the dial is the agent's face. Each state sets the
 * reading through the `--gauge` custom property in `globals.css`, which moves
 * the needle and the white arc together: `crawling` sweeps (the only loop, and
 * only while a run is live), `alert` drops low, `delighted` swings high once.
 */
export function Agent({
  state = 'idle',
  size = 28,
  label = BRAND_NAME,
  className,
}: {
  state?: AgentState;
  size?: number;
  label?: string;
  className?: string;
}) {
  const { x, y } = EMBLEM_PIVOT;
  return (
    <svg
      viewBox={EMBLEM_VIEWBOX}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={['agent', className].filter(Boolean).join(' ')}
      data-state={state}
      style={{ display: 'block', ['--pivot' as string]: `${x}px ${y}px` } as CSSProperties}
    >
      <EmblemParts value={EMBLEM_DEFAULT_VALUE} live />
    </svg>
  );
}
