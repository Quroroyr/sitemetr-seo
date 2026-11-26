import type { AuditRule } from '../../types.js';
import { bitrixPoweredHeaderRule } from './bitrix-powered-header.js';
import { bitrixRobotsAssetsRule } from './bitrix-robots-assets.js';
import { bitrixSessidLinksRule } from './bitrix-sessid-links.js';
import { bitrixServiceUrlsRule } from './bitrix-service-urls.js';
import { bitrixIndexPhpRule } from './bitrix-index-php.js';
import { bitrixCompositeRule } from './bitrix-composite.js';

/**
 * 1C-Bitrix rules. Each rule returns notMeasured('not-applicable') when the
 * page is not served by Bitrix (see isBitrix in ./helpers.ts).
 */
export const BITRIX_RULES: AuditRule[] = [
  bitrixPoweredHeaderRule,
  bitrixRobotsAssetsRule,
  bitrixSessidLinksRule,
  bitrixServiceUrlsRule,
  bitrixIndexPhpRule,
  bitrixCompositeRule,
];
