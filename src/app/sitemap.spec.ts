import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appRoutes } from './app.routes';

const SITE_URL = 'https://www.wholepersonphysiome.org';
const ERROR_PATHS = ['500', '**'];

function readPublicFile(path: string): string {
  return readFileSync(join(process.cwd(), 'public', path), 'utf-8');
}

function getPageUrls(): string[] {
  return appRoutes
    .map((route) => route.path ?? '')
    .filter((path) => !ERROR_PATHS.includes(path))
    .map((path) => `${SITE_URL}/${path}`);
}

function getSitemapUrls(): string[] {
  return Array.from(readPublicFile('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g), ([, url]) => url);
}

describe('sitemap.xml', () => {
  it('lists every page route', () => {
    expect(getSitemapUrls().sort()).toEqual(getPageUrls().sort());
  });
});

describe('robots.txt', () => {
  it('points crawlers to the sitemap', () => {
    expect(readPublicFile('robots.txt')).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
