/**
 * Electron BrowserWindow-based page fetcher.
 *
 * Replaces Playwright inside the Electron app so we don't need an
 * external Chromium binary (which macOS Gatekeeper blocks inside .app bundles).
 * Returns the same PlaywrightFetchResult interface so the Auditor is agnostic.
 */

import { BrowserWindow, session } from 'electron';
import type { PlaywrightFetchResult, RenderOptions } from '@core/crawler/index.js';
import { runProbes } from '@core/render/probes.js';
import type { CoreWebVitals } from '@core/types.js';
import { AuditAbortedError } from '@core/errors.js';

/**
 * How long a page that has its document may keep loading subresources before
 * the render stops it and measures what is there.
 *
 * `loadURL` resolves on the window's load event, which waits for every
 * subresource. An ad network or tracker that never answers (blocked in the
 * user's country, or a request held open on purpose) kept that event from
 * ever firing: wealthyexile.com had its document in 1.7 s and was still
 * "loading" after 90 s, and the desktop app spent minutes per page of a
 * crawl. Playwright's fetcher has a navigation timeout; this one had none.
 */
const LOAD_GRACE_MS = 5000;

/**
 * Navigate and wait until the page is usable: the load event, or the
 * document plus LOAD_GRACE_MS, whichever is first. Throws when not even the
 * document arrives within `timeout`, or when the run is cancelled.
 */
async function loadPage(win: BrowserWindow, url: string, timeout: number, signal?: AbortSignal): Promise<void> {
  const contents = win.webContents;
  let resolveDom!: () => void;
  const domReady = new Promise<void>((resolve) => (resolveDom = resolve));
  contents.once('dom-ready', () => resolveDom());

  // stop() below rejects the pending loadURL with ERR_ABORTED: expected
  const load = win.loadURL(url).then(
    () => 'loaded' as const,
    (error: unknown) => ({ error }),
  );

  const timers: NodeJS.Timeout[] = [];
  const after = <T>(ms: number, value: T) =>
    new Promise<T>((resolve) => timers.push(setTimeout(() => resolve(value), ms)));
  const cancelled = new Promise<'cancelled'>((resolve) => {
    if (signal?.aborted) resolve('cancelled');
    signal?.addEventListener('abort', () => resolve('cancelled'), { once: true });
  });

  try {
    const first = await Promise.race([load, domReady.then(() => 'dom' as const), after(timeout, 'timeout' as const), cancelled]);
    if (first === 'cancelled') throw new AuditAbortedError();
    if (first === 'timeout') throw new Error(`${url} did not respond within ${timeout} ms`);
    if (first !== 'dom' && first !== 'loaded') throw first.error;
    if (first === 'dom') {
      const settled = await Promise.race([load, after(LOAD_GRACE_MS, 'grace' as const), cancelled]);
      if (settled === 'cancelled') throw new AuditAbortedError();
      // Still loading: stop the stragglers and measure the page as it stands
      if (settled === 'grace') contents.stop();
    }
  } finally {
    for (const timer of timers) clearTimeout(timer);
  }
}

/**
 * Fetch a page using a hidden Electron BrowserWindow.
 * Captures rendered HTML, HTTP status code, response time, and Core Web Vitals.
 */
export async function fetchPageWithBrowserWindow(
  url: string,
  timeout = 30000,
  options: RenderOptions = {},
): Promise<PlaywrightFetchResult> {
  // Dedicated session so interceptors don't affect the main window
  const ses = session.fromPartition(`cwv-fetch-${Date.now()}`);

  // Capture the status code from the main-frame navigation response
  let statusCode = 0;
  ses.webRequest.onHeadersReceived(
    { urls: ['*://*/*'] },
    (details, callback) => {
      // Only capture the top-level navigation, not sub-resources
      if (details.resourceType === 'mainFrame') {
        statusCode = details.statusCode;
      }
      callback({});
    },
  );

  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 720,
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      session: ses,
      // A hidden window is throttled like a background tab; probes and
      // timers would run slower than in Playwright
      backgroundThrottling: false,
    },
  });
  try {
    // The layout Playwright renders: 1280x720 at a pixel ratio of 1, whatever
    // the display, so axe and the image-size probe see the same boxes.
    //
    // Emulation is switched on only once the window has a document. On
    // Windows (Electron 40) calling enableDeviceEmulation on a window that has
    // never navigated kills the whole main process with no JS error and exit
    // code 0xFFFF7003 — the desktop app vanished the moment an audit with
    // browser rendering started. about:blank first, then emulation, so it is
    // already in force for the real page's first layout.
    await win.loadURL('about:blank');
    win.webContents.enableDeviceEmulation({
      screenPosition: 'desktop',
      screenSize: { width: 1280, height: 720 },
      viewPosition: { x: 0, y: 0 },
      viewSize: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      scale: 1,
    });

    const startTime = performance.now();

    // Navigate to the URL, bounded (see LOAD_GRACE_MS)
    await loadPage(win, url, timeout, options.signal);

    const loadTime = performance.now() - startTime;

    // Wait for dynamic content (mirrors Playwright fetcher's 1s wait)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get rendered HTML
    const html = await win.webContents.executeJavaScript(
      'document.documentElement.outerHTML',
    );

    // Measure Core Web Vitals
    const cwv = await measureCwvInWindow(win);

    // The same probe scripts the CLI runs through Playwright
    const probes = await runProbes((script) => win.webContents.executeJavaScript(script));

    return {
      html,
      statusCode,
      responseTime: Math.round(loadTime),
      cwv,
      probes,
    };
  } finally {
    win.destroy();
  }
}

/**
 * Measure Core Web Vitals via executeJavaScript.
 * Uses the same PerformanceObserver approach as playwright-fetcher.ts.
 */
async function measureCwvInWindow(win: BrowserWindow): Promise<CoreWebVitals> {
  return win.webContents.executeJavaScript(`
    new Promise((resolve) => {
      const metrics = {};

      // TTFB from Navigation Timing API
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        metrics.ttfb = Math.round(navEntry.responseStart - navEntry.requestStart);
      }

      // FCP from Paint Timing API
      const paintEntries = performance.getEntriesByType('paint');
      for (const entry of paintEntries) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = Math.round(entry.startTime);
        }
      }

      // LCP via PerformanceObserver
      let lcpValue;
      let lcpObserver;
      try {
        lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) lcpValue = Math.round(last.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {}

      // CLS via PerformanceObserver
      let clsValue = 0;
      let clsObserver;
      try {
        clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) clsValue += entry.value;
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {}

      setTimeout(() => {
        if (lcpObserver) lcpObserver.disconnect();
        if (clsObserver) clsObserver.disconnect();

        if (lcpValue !== undefined) metrics.lcp = lcpValue;
        metrics.cls = Math.round(clsValue * 1000) / 1000;

        resolve(metrics);
      }, 1000);
    })
  `);
}
