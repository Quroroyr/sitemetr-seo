import { readFileSync } from 'node:fs';

/**
 * The running package version, read from package.json rather than hardcoded.
 *
 * The published layout is dist/cli.js with package.json one level up, so this
 * resolves to the root manifest and can never drift from the released version.
 * Every entry point bundles to dist/, so the relative path holds regardless of
 * which source file asks.
 *
 * The desktop build bundles to dist-electron/main/, two levels below the
 * manifest, so that location is tried second (it reported 0.0.0 before).
 *
 * Falls back gracefully if the manifest cannot be read.
 */
export function getVersion(): string {
  for (const relative of ['../package.json', '../../package.json']) {
    try {
      const pkg = JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
      if (typeof pkg.version === 'string') return pkg.version;
    } catch {
      // try the next location
    }
  }
  return '0.0.0';
}
