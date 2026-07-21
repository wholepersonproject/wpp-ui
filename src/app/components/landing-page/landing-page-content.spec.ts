import { describe, expect, it } from 'vitest';
import {
  LandingPageContent,
  validateLandingPageContent,
} from './landing-page-content';

const validContent: LandingPageContent = {
  splash: {
    backgroundImageUrl: './home-splash.png',
    title: 'Landing title',
    description: 'Landing description',
    funder: 'Landing funder',
  },
  newsAndEvents: {
    title: 'News and events',
    items: [
      {
        id: 'example-item',
        date: 'August 24-25, 2026',
        title: 'Example event',
        summary: 'Example summary',
        tag: { label: 'Virtual', icon: 'public' },
        url: '/events#example',
      },
    ],
  },
};

describe('validateLandingPageContent', () => {
  it('returns valid landing-page content', () => {
    expect(validateLandingPageContent(validContent)).toEqual(validContent);
  });

  it('reports the path of a missing nested field', () => {
    const invalidContent = structuredClone(validContent) as unknown as Record<
      string,
      unknown
    >;
    const newsAndEvents = invalidContent['newsAndEvents'] as Record<
      string,
      unknown
    >;
    const item = (newsAndEvents['items'] as Record<string, unknown>[])[0];
    const tag = item['tag'] as Record<string, unknown>;
    delete tag['icon'];

    expect(() => validateLandingPageContent(invalidContent)).toThrow(
      'newsAndEvents.items[0].tag.icon must be a non-empty string',
    );
  });

  it('rejects duplicate card IDs', () => {
    const duplicate = structuredClone(validContent);
    duplicate.newsAndEvents.items.push({
      ...duplicate.newsAndEvents.items[0],
    });

    expect(() => validateLandingPageContent(duplicate)).toThrow(
      'duplicate newsAndEvents item id "example-item"',
    );
  });
});
