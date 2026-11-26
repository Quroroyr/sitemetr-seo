import { describe, it, expect } from 'vitest';
import {
  getGlobalDir,
  getGlobalSettingsPath,
  getLinkCachePath,
  getProjectDir,
  getProjectSettingsPath,
  getCrawlsDir,
  getReportsDir,
  generateId,
} from './paths.js';
import * as os from 'os';
import * as path from 'path';

describe('paths', () => {
  describe('getGlobalDir', () => {
    it('honours SITEMETR_HOME when set', () => {
      const previous = process.env['SITEMETR_HOME'];
      process.env['SITEMETR_HOME'] = '/tmp/sitemetr-home-test';
      try {
        expect(getGlobalDir()).toBe('/tmp/sitemetr-home-test');
      } finally {
        if (previous === undefined) delete process.env['SITEMETR_HOME'];
        else process.env['SITEMETR_HOME'] = previous;
      }
    });

    it('ignores a blank SITEMETR_HOME', () => {
      const previous = process.env['SITEMETR_HOME'];
      process.env['SITEMETR_HOME'] = '   ';
      try {
        expect(getGlobalDir()).toBe(path.join(os.homedir(), '.sitemetr'));
      } finally {
        if (previous === undefined) delete process.env['SITEMETR_HOME'];
        else process.env['SITEMETR_HOME'] = previous;
      }
    });

    it('should return ~/.sitemetr on Unix', () => {
      const globalDir = getGlobalDir();
      expect(globalDir).toBe(path.join(os.homedir(), '.sitemetr'));
    });
  });

  describe('getGlobalSettingsPath', () => {
    it('should return settings.json in global dir', () => {
      const settingsPath = getGlobalSettingsPath();
      expect(settingsPath).toBe(path.join(os.homedir(), '.sitemetr', 'settings.json'));
    });
  });

  describe('getLinkCachePath', () => {
    it('should return link-cache.db in global dir', () => {
      const cachePath = getLinkCachePath();
      expect(cachePath).toBe(path.join(os.homedir(), '.sitemetr', 'link-cache.db'));
    });
  });

  describe('getProjectDir', () => {
    it('should return .sitemetr in given directory', () => {
      const projectDir = getProjectDir('/some/project');
      expect(projectDir).toBe('/some/project/.sitemetr');
    });
  });

  describe('getProjectSettingsPath', () => {
    it('should return settings.json in project dir', () => {
      const settingsPath = getProjectSettingsPath('/some/project');
      expect(settingsPath).toBe('/some/project/.sitemetr/settings.json');
    });
  });

  describe('getCrawlsDir', () => {
    it('should return crawls subdirectory', () => {
      const crawlsDir = getCrawlsDir('/some/project');
      expect(crawlsDir).toBe('/some/project/.sitemetr/crawls');
    });
  });

  describe('getReportsDir', () => {
    it('should return reports subdirectory', () => {
      const reportsDir = getReportsDir('/some/project');
      expect(reportsDir).toBe('/some/project/.sitemetr/reports');
    });
  });

  describe('generateId', () => {
    it('should generate ID in format YYYY-MM-DD-xxxxxx', () => {
      const id = generateId();
      // Should match pattern: 2024-01-23-abc123
      expect(id).toMatch(/^\d{4}-\d{2}-\d{2}-[a-z0-9]{6}$/);
    });

    it('should include current date', () => {
      const id = generateId();
      const today = new Date().toISOString().split('T')[0];
      expect(id.startsWith(today)).toBe(true);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
