/**
 * Print the client report to PDF through the same headless browser the audit
 * uses for rendering (Playwright, falling back to the system Chrome or Edge).
 *
 * The desktop app does not come here: it prints with Electron's own
 * webContents.printToPDF (electron/main/pdf-export.ts), so it needs no browser.
 */

import type { AuditResult } from '../types.js';
import { initBrowser } from '../crawler/playwright-fetcher.js';
import { clientReportFooter, renderClientReportHtml, type ClientReportOptions } from './client-report.js';

/** PDF bytes of the client report */
export async function renderClientReportPdf(result: AuditResult, options: ClientReportOptions = {}): Promise<Buffer> {
  const html = renderClientReportHtml(result, options);
  const browser = await initBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: clientReportFooter(result),
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}
