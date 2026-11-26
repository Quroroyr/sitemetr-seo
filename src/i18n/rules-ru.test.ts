import { describe, expect, it } from 'vitest';
import { splitFix } from '../reporters/fix-brief.js';
import { FIX_SUGGESTIONS } from '../reporters/fix-suggestions.js';
import '../rules/loader.js';
import { getAllRules } from '../rules/registry.js';
import { FIXES_RU } from './ru/fixes.js';
import { RULES_RU } from './ru/rules.js';

// Сайтметр's own `yandex` and `bitrix` rules are written in Russian and need no overlay
const OWN_RULE = /^(?:yandex|bitrix)-/;
const rules = getAllRules().filter(({ id }) => !OWN_RULE.test(id));
const fixIds = Object.keys(FIX_SUGGESTIONS).filter((id) => !OWN_RULE.test(id));
const mixedAlphabets = /[а-яё][a-z]|[a-z][а-яё]/iu;

function fixSeparator(fix: string): string {
  const { headline, rest } = splitFix(fix);
  return rest ? fix.trim().charAt(headline.length) : '';
}

describe('Russian rule translations', () => {
  it('has exactly one name and description for each registered rule', () => {
    expect(rules.length).toBeGreaterThan(0);
    expect(Object.keys(RULES_RU).sort()).toEqual(rules.map(({ id }) => id).sort());

    const incomplete = rules
      .filter(({ id }) => !RULES_RU[id]?.name.trim() || !RULES_RU[id]?.description.trim())
      .map(({ id }) => id);
    expect(incomplete).toEqual([]);
  });

  it('has exactly one non-empty translation for each fix suggestion', () => {
    expect(fixIds.length).toBeGreaterThan(0);
    expect(Object.keys(FIXES_RU).sort()).toEqual([...fixIds].sort());
    expect(fixIds.filter((id) => !FIXES_RU[id]?.trim())).toEqual([]);
  });

  it('preserves the separator between the fix headline and details', () => {
    const mismatches = fixIds.filter((id) => {
      const translation = FIXES_RU[id];
      return !translation || fixSeparator(translation) !== fixSeparator(FIX_SUGGESTIONS[id]);
    });
    expect(mismatches).toEqual([]);
  });

  it('has no adjacent Cyrillic and Latin letters within a word', () => {
    const mixed: string[] = [];

    for (const [id, { name, description }] of Object.entries(RULES_RU)) {
      if (mixedAlphabets.test(name)) mixed.push(`${id} (name)`);
      if (mixedAlphabets.test(description)) mixed.push(`${id} (description)`);
    }
    for (const [id, fix] of Object.entries(FIXES_RU)) {
      if (mixedAlphabets.test(fix)) mixed.push(`${id} (fix)`);
    }

    expect(mixed).toEqual([]);
  });
});
