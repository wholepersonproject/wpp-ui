import { describe, expect, it } from 'vitest';
import {
  APP_MENU_ITEMS,
  createLocalNavigationItems,
  PRIMARY_NAVIGATION_ITEMS,
} from './navigation';

const WEBSITE_FEEDBACK_URL =
  'https://github.com/wholepersonproject/wpp-ui/issues/new/choose';

describe('navigation', () => {
  it('adds website feedback last in local navigation in the current tab', () => {
    const navigationItems = createLocalNavigationItems(
      PRIMARY_NAVIGATION_ITEMS,
    );

    expect(navigationItems[navigationItems.length - 1]).toEqual({
      id: 'website-feedback',
      label: 'Website feedback',
      link: WEBSITE_FEEDBACK_URL,
      icon: 'feedback',
    });
    expect(navigationItems[navigationItems.length - 1]).not.toHaveProperty(
      'external',
    );
  });

  it('adds website feedback last in the apps menu in the current tab without an icon', () => {
    const feedbackItem = APP_MENU_ITEMS[APP_MENU_ITEMS.length - 1];

    expect(feedbackItem).toEqual({
      id: 'website-feedback',
      label: 'Website feedback',
      link: WEBSITE_FEEDBACK_URL,
    });
    expect(feedbackItem).not.toHaveProperty('external');
    expect(feedbackItem).not.toHaveProperty('icon');
  });

  it('keeps website feedback out of the desktop header navigation', () => {
    expect(PRIMARY_NAVIGATION_ITEMS).not.toContainEqual(
      expect.objectContaining({ id: 'website-feedback' }),
    );
  });
});
