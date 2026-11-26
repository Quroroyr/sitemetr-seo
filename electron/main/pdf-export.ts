/**
 * Сайтметр client report as a PDF, printed by Electron itself.
 *
 * The CLI and the web dashboard print through Playwright (src/reporters/pdf.ts);
 * the desktop app already is a Chromium, so it prints the same HTML from a
 * hidden window and needs no browser on the machine.
 */

import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { AuditResult } from '@core/types.js';
import { clientReportFooter, renderClientReportHtml } from '@core/reporters/client-report.js';

export async function printClientReportPdf(result: AuditResult): Promise<Buffer> {
  // A file rather than a data: URL, so a long queue is not limited by URL size
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemetr-pdf-'));
  const htmlPath = path.join(dir, 'report.html');
  fs.writeFileSync(htmlPath, renderClientReportHtml(result), 'utf8');

  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false },
  });
  try {
    await win.loadFile(htmlPath);
    return await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: clientReportFooter(result),
    });
  } finally {
    win.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
