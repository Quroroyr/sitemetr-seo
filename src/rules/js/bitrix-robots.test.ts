import { describe, expect, it } from 'vitest';
import { createTestContext } from '../test-context.js';
import { blockedResourcesRule } from './blocked-resources.js';

// Сайтметр: the stock 1C-Bitrix robots.txt disallows /bitrix/ and allows its
// scripts back; the rule used to ignore Allow and report them blocked.
describe('js-blocked-resources on a 1C-Bitrix robots.txt', () => {
  const html = '<html><head><script src="/bitrix/js/main/core/core.js?1691589610487238"></script></head><body></body></html>';

  it('honours Allow: /bitrix/*/*.js', async () => {
    const robotsTxtContent = 'User-agent: *\nDisallow: /bitrix/\nAllow: /bitrix/*/*.js\nAllow: /bitrix/*/*.css';
    const result = await blockedResourcesRule.run(createTestContext(html, { url: 'https://example.ru/', robotsTxtContent }));
    expect(result.status).toBe('pass');
  });

  it('still flags a plain Disallow: /bitrix/', async () => {
    const robotsTxtContent = 'User-agent: *\nDisallow: /bitrix/';
    const result = await blockedResourcesRule.run(createTestContext(html, { url: 'https://example.ru/', robotsTxtContent }));
    expect(result.status).toBe('warn');
  });
});
