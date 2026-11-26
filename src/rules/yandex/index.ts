/**
 * Сайтметр: Yandex rules (category `yandex`).
 *
 * The fork's own code, so rule texts are written in Russian directly. Their
 * fix texts live in the Russian table; they are made the engine's too, so
 * `explain`, the LLM report and every fallback see them, not the generic line.
 */

import { registerRule } from '../registry.js';
import { technicalHostIndexableRule } from './technical-host-indexable.js';
import { yandexCleanParamRule } from './yandex-clean-param.js';
import { yandexMetrikaRule } from './yandex-metrika.js';
import { yandexRobotsObsoleteRule } from './yandex-robots-obsolete.js';
import { registerRunetFixes } from '../runet-helpers.js';

export { technicalHostIndexableRule, yandexCleanParamRule, yandexMetrikaRule, yandexRobotsObsoleteRule };

export const YANDEX_RULES = [technicalHostIndexableRule, yandexCleanParamRule, yandexRobotsObsoleteRule, yandexMetrikaRule];

for (const rule of YANDEX_RULES) registerRule(rule);
registerRunetFixes();
