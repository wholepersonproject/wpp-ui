import type {
  NewsAndEventItem,
  NewsAndEventsContent,
} from './news-and-events/news-and-events';

export interface LandingPageContent {
  splash: {
    backgroundImageUrl: string;
    title: string;
    description: string;
    funder: string;
  };
  newsAndEvents: NewsAndEventsContent;
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid landing-page content: ${path} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Invalid landing-page content: ${path}.${key} must be a non-empty string.`,
    );
  }

  return value;
}

function readNewsItem(value: unknown, index: number): NewsAndEventItem {
  const path = `newsAndEvents.items[${index}]`;
  const item = readRecord(value, path);
  const tag = readRecord(item['tag'], `${path}.tag`);

  return {
    id: readString(item, 'id', path),
    date: readString(item, 'date', path),
    title: readString(item, 'title', path),
    summary: readString(item, 'summary', path),
    tag: {
      label: readString(tag, 'label', `${path}.tag`),
      icon: readString(tag, 'icon', `${path}.tag`),
    },
    url: readString(item, 'url', path),
  };
}

/** Validates and normalizes content parsed from the landing-page YAML file. */
export function validateLandingPageContent(value: unknown): LandingPageContent {
  const root = readRecord(value, 'root');
  const splash = readRecord(root['splash'], 'splash');
  const newsAndEvents = readRecord(root['newsAndEvents'], 'newsAndEvents');
  const rawItems = newsAndEvents['items'];

  if (!Array.isArray(rawItems)) {
    throw new Error(
      'Invalid landing-page content: newsAndEvents.items must be an array.',
    );
  }

  const items = rawItems.map(readNewsItem);
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(
        `Invalid landing-page content: duplicate newsAndEvents item id "${item.id}".`,
      );
    }
    ids.add(item.id);
  }

  return {
    splash: {
      backgroundImageUrl: readString(splash, 'backgroundImageUrl', 'splash'),
      title: readString(splash, 'title', 'splash'),
      description: readString(splash, 'description', 'splash'),
      funder: readString(splash, 'funder', 'splash'),
    },
    newsAndEvents: {
      title: readString(newsAndEvents, 'title', 'newsAndEvents'),
      items,
    },
  };
}
