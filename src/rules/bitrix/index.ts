/**
 * Сайтметр: 1C-Bitrix rules (category `bitrix`).
 *
 * Every rule is not-applicable on a page without Bitrix signals, so on other
 * sites the whole category measures nothing and the auditor leaves it out of
 * the score (see runCategories in src/auditor.ts).
 */

import { registerRule } from '../registry.js';
import { BITRIX_RULES } from './bitrix.js';
import { registerRunetFixes } from '../runet-helpers.js';

export { BITRIX_RULES };

for (const rule of BITRIX_RULES) registerRule(rule);
registerRunetFixes();
