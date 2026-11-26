/**
 * Сайтметр: Russian overlay for engine texts.
 *
 * The engine (rules, fix suggestions, result messages) stays in English, as
 * upstream ships it, so `git merge upstream/main` keeps working. Every text a
 * person reads goes through one of these functions at display time and comes
 * back in the active locale, falling back to the English original when there
 * is no translation.
 *
 * Locale: `SITEMETR_LANG=en` (process env) switches back to English; the
 * default is Russian.
 */

import { RULES_RU } from './ru/rules.js';
import { FIXES_RU } from './ru/fixes.js';
import { FIXES_RUNET } from './ru/fixes-runet.js';
import { CATEGORIES_RU } from './ru/categories.js';
import { MESSAGES_RU_A } from './ru/messages-a.js';
import { MESSAGES_RU_B } from './ru/messages-b.js';
import { MESSAGES_RU_SHARED } from './ru/messages-shared.js';
import { MESSAGES_RU_REC } from './ru/messages-rec.js';

export type Locale = 'ru' | 'en';

/**
 * One message translation: an anchored pattern over the English message and
 * a replacement in `String.prototype.replace` syntax ($1, $2, $<name>), or a
 * function for cases that need plural forms.
 */
export type MessagePattern = readonly [RegExp, string | ((...groups: string[]) => string)];

export type MessageTable = Readonly<Record<string, readonly MessagePattern[]>>;

let current: Locale = readEnvLocale();

function readEnvLocale(): Locale {
  try {
    const value = typeof process !== 'undefined' ? process.env?.SITEMETR_LANG : undefined;
    return value === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

/**
 * Own-property lookup: a rule or category id such as `constructor` must not
 * pick up something from Object.prototype.
 */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
}

export function trRuleName(ruleId: string, english: string): string {
  if (current === 'en') return english;
  return own(RULES_RU, ruleId)?.name ?? english;
}

export function trRuleDescription(ruleId: string, english: string): string {
  if (current === 'en') return english;
  return own(RULES_RU, ruleId)?.description ?? english;
}

export function trFix(ruleId: string, english: string): string {
  if (current === 'en') return english;
  return own(FIXES_RU, ruleId) ?? own(FIXES_RUNET, ruleId) ?? english;
}

export function trCategoryName(categoryId: string, english: string): string {
  if (current === 'en') return english;
  return own(CATEGORIES_RU, categoryId)?.name ?? english;
}

export function trCategoryDescription(categoryId: string, english: string): string {
  if (current === 'en') return english;
  return own(CATEGORIES_RU, categoryId)?.description ?? english;
}

function applyPatterns(patterns: readonly MessagePattern[] | undefined, message: string): string | null {
  if (!patterns) return null;
  for (const [pattern, replacement] of patterns) {
    pattern.lastIndex = 0;
    const match = pattern.exec(message);
    if (!match || match.index !== 0 || match[0].length !== message.length) continue;
    if (typeof replacement === 'function') {
      return replacement(...match.slice(1).map((g) => g ?? ''));
    }
    return message.replace(pattern, replacement);
  }
  return null;
}

/**
 * Translate a result message a rule produced, or a recommendation from its
 * details. Patterns for the rule itself are tried first, then the shared ones (messages built by helpers that many rules
 * use). An untranslated message comes back unchanged.
 */
export function trMessage(ruleId: string, message: string): string {
  if (current === 'en' || !message) return message;
  return (
    applyPatterns(own(MESSAGES_RU_A, ruleId), message) ??
    applyPatterns(own(MESSAGES_RU_B, ruleId), message) ??
    applyPatterns(own(MESSAGES_RU_REC, ruleId), message) ??
    applyPatterns(own(MESSAGES_RU_SHARED, '*'), message) ??
    message
  );
}

/**
 * Russian plural form: plural(5, 'страница', 'страницы', 'страниц') → 'страниц'.
 */
export function plural(n: number | string, one: string, few: string, many: string): string {
  const value = Math.abs(Math.trunc(Number(n)));
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
