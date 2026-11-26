/**
 * Shared checks for Сайтметр's own categories `yandex` and `bitrix`.
 *
 * They are the fork's own code, so their rule texts are written in Russian
 * directly; there is no upstream English to keep.
 */

import type { AuditContext } from '../types.js';
import { RobotsMatcher } from '../crawler/robots.js';
import { FIX_SUGGESTIONS } from '../reporters/fix-suggestions.js';
import { FIXES_RUNET } from '../i18n/ru/fixes-runet.js';

/** Make the Russian fix texts of the fork's own rules the engine's fixes too */
export function registerRunetFixes(): void {
  for (const [ruleId, fix] of Object.entries(FIXES_RUNET)) FIX_SUGGESTIONS[ruleId] ??= fix;
}

/** Case-insensitive header read */
export function header(context: AuditContext, name: string): string {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(context.headers ?? {})) {
    if (key.toLowerCase() === wanted) return String(value);
  }
  return '';
}

/** Signals that the page is served by 1C-Bitrix, strongest first */
export function bitrixSignals(context: AuditContext): string[] {
  const signals: string[] = [];
  const poweredCms = header(context, 'x-powered-cms');
  if (/bitrix/i.test(poweredCms)) signals.push('заголовок X-Powered-CMS');
  if (header(context, 'x-bitrix-composite')) signals.push('заголовок X-Bitrix-Composite');
  const html = context.html ?? '';
  if (/["'(]\/bitrix\/(?:js|cache|templates|components|css)\//i.test(html)) signals.push('ресурсы из /bitrix/');
  if (/\bBX\.(?:message|setJSList|setCSSList|ready)\s*\(/.test(html)) signals.push('скрипты BX');
  return signals;
}

export function isBitrix(context: AuditContext): boolean {
  return bitrixSignals(context).length > 0;
}

/**
 * Technical and staging hosts: hosting providers' service domains and the
 * usual staging prefixes. A page here that is open to indexing competes with
 * the production site as a duplicate.
 */
const TECHNICAL_HOST_SUFFIXES = [
  '.tw1.ru', // Timeweb
  '.tw1.su',
  '.timeweb.ru',
  '.timeweb.cloud',
  '.beget.tech', // Beget
  '.beget.app',
  '.myjino.ru', // Jino
  '.sprinthost.ru', // SprintHost
  '.hostfl.ru',
  '.ru-host.ru',
  '.reg.site', // REG.RU
  '.nichost.ru', // RU-CENTER
  '.netangels.ru',
  '.1gb.ru',
  '.h1n.ru',
  '.tilda.ws', // Tilda staging subdomain
  '.netlify.app',
  '.vercel.app',
  '.herokuapp.com',
  '.pages.dev',
  '.ngrok.io',
  '.ngrok-free.app',
];

const STAGING_PREFIX = /^(?:test|dev|develop|stage|staging|stg|preprod|pre-prod|beta|demo|new|old|copy|tmp)[0-9-]*\./i;

/** Why a host looks technical, or null when it looks like a production host */
export function technicalHostReason(hostname: string): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const suffix = TECHNICAL_HOST_SUFFIXES.find((s) => host.endsWith(s));
  if (suffix) return `технический домен хостинга (*${suffix})`;
  if (STAGING_PREFIX.test(host)) return `адрес тестовой копии (${host.split('.')[0]}.)`;
  return null;
}

/** noindex from the meta robots tags (generic and Yandex) or X-Robots-Tag */
export function noindexSource(context: AuditContext): string | null {
  const $ = context.$;
  const metas = $('meta[name]')
    .toArray()
    .filter((el) => /^(?:robots|yandex)$/i.test($(el).attr('name') ?? ''))
    .map((el) => $(el).attr('content') ?? '');
  if (metas.some((c) => /\b(?:noindex|none)\b/i.test(c))) return 'meta robots';
  if (/\b(?:noindex|none)\b/i.test(header(context, 'x-robots-tag'))) return 'X-Robots-Tag';
  return null;
}

/** robots.txt as Yandex reads it, or null when there is no robots.txt */
export function yandexRobots(context: AuditContext): RobotsMatcher | null {
  const content = context.robotsTxtContent;
  if (!content || !content.trim()) return null;
  return new RobotsMatcher(content, 'Yandex');
}

/** Directive lines of robots.txt, comments stripped */
export function robotsLines(content: string): { directive: string; value: string }[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':');
      return colon === -1
        ? { directive: line.toLowerCase(), value: '' }
        : { directive: line.slice(0, colon).trim().toLowerCase(), value: line.slice(colon + 1).trim() };
    });
}

/** Internal link URLs on the page, resolved against the page URL */
export function internalUrls(context: AuditContext): URL[] {
  const urls: URL[] = [];
  for (const link of context.links ?? []) {
    if (!link.isInternal) continue;
    try {
      urls.push(new URL(link.href, context.url));
    } catch {
      // an unparseable href is another rule's business
    }
  }
  return urls;
}
