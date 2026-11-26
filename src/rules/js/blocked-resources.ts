import type { AuditContext } from '../../types.js';
import { defineRule, pass, warn } from '../define-rule.js';
import { RobotsMatcher } from '../../crawler/robots.js';

/**
 * Parse Disallow paths from robots.txt content.
 * Returns an array of disallowed path prefixes.
 */
function parseDisallowPaths(robotsTxtContent: string): string[] {
  const paths: string[] = [];
  const lines = robotsTxtContent.split('\n');
  let inUserAgentAll = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track User-agent sections
    if (/^user-agent:\s*\*/i.test(trimmed)) {
      inUserAgentAll = true;
      continue;
    }
    if (/^user-agent:/i.test(trimmed)) {
      inUserAgentAll = false;
      continue;
    }

    // Collect Disallow paths from the wildcard user-agent section
    if (inUserAgentAll && /^disallow:\s*/i.test(trimmed)) {
      const path = trimmed.replace(/^disallow:\s*/i, '').trim();
      if (path) {
        paths.push(path);
      }
    }
  }

  return paths;
}


/**
 * Rule: Blocked JS Resources
 *
 * Checks if the page loads JavaScript from paths that might be blocked
 * by robots.txt. When search engines cannot fetch JS resources, they
 * cannot properly render the page, leading to incomplete indexing.
 */
export const blockedResourcesRule = defineRule({
  id: 'js-blocked-resources',
  name: 'Blocked JavaScript Resources',
  description: 'Checks if JavaScript resources may be blocked by robots.txt',
  category: 'js',
  weight: 7,
  run: async (context: AuditContext) => {
    const robotsTxtContent = (context as any).robotsTxtContent as string | undefined;

    if (!robotsTxtContent) {
      return pass(
        'js-blocked-resources',
        'No robots.txt available to check for blocked JS resources'
      );
    }

    const disallowPaths = parseDisallowPaths(robotsTxtContent);

    if (disallowPaths.length === 0) {
      return pass(
        'js-blocked-resources',
        'No Disallow rules found in robots.txt',
        { disallowCount: 0 }
      );
    }

    // Collect all script sources
    const scriptSources: string[] = [];
    context.$('script[src]').each((_, el) => {
      const src = context.$(el).attr('src');
      if (src) {
        scriptSources.push(src);
      }
    });

    if (scriptSources.length === 0) {
      return pass(
        'js-blocked-resources',
        'No external script sources found on the page',
        { scriptCount: 0 }
      );
    }

    // Check each script source against robots.txt as Googlebot reads it.
    // Сайтметр: matching Disallow prefixes alone ignored Allow lines, so the
    // stock 1C-Bitrix robots.txt (`Disallow: /bitrix/` + `Allow: /bitrix/*/*.js`)
    // was reported as blocking /bitrix/js/... scripts it explicitly allows.
    const matcher = new RobotsMatcher(robotsTxtContent, 'Googlebot');
    const blockedScripts: string[] = [];
    const pageUrl = new URL(context.url);

    for (const src of scriptSources) {
      try {
        // Resolve relative URLs against the page URL
        const scriptUrl = new URL(src, context.url);

        // Only check scripts on the same domain
        if (scriptUrl.hostname !== pageUrl.hostname) continue;

        if (!matcher.isAllowed(scriptUrl.href)) {
          blockedScripts.push(src);
        }
      } catch {
        // Invalid URL, skip
      }
    }

    if (blockedScripts.length > 0) {
      return warn(
        'js-blocked-resources',
        `${blockedScripts.length} JavaScript resource(s) may be blocked by robots.txt`,
        {
          blockedScripts,
          totalScripts: scriptSources.length,
          impact: 'Search engines cannot render the page properly if JS resources are blocked',
          recommendation: 'Allow search engine access to JavaScript files in robots.txt',
        }
      );
    }

    return pass(
      'js-blocked-resources',
      'No JavaScript resources are blocked by robots.txt',
      {
        totalScripts: scriptSources.length,
        disallowPatterns: disallowPaths.length,
      }
    );
  },
});
