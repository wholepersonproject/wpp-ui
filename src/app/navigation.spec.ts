import { describe, expect, it } from 'vitest';
import { APP_MENU_ITEMS, createLocalNavigationItems, PRIMARY_NAVIGATION_ITEMS } from './navigation';

const CONTACT_LINK = { command: '/about', fragment: 'contact-us' };

describe('navigation', () => {
  it('adds the contact link last in local navigation in the current tab', () => {
    const navigationItems = createLocalNavigationItems(PRIMARY_NAVIGATION_ITEMS);
    const contactItem = navigationItems[navigationItems.length - 1];

    expect(contactItem).toEqual(
      expect.objectContaining({
        id: 'contact',
        label: 'Contact us',
        link: CONTACT_LINK,
        icon: 'mail',
      }),
    );
    expect(contactItem?.external).not.toBe(true);
  });

  it('adds the contact link last in the apps menu in the current tab without an icon', () => {
    const contactItem = APP_MENU_ITEMS[APP_MENU_ITEMS.length - 1];

    expect(contactItem).toEqual(
      expect.objectContaining({
        id: 'contact',
        label: 'Contact us',
        link: CONTACT_LINK,
      }),
    );
    expect(contactItem?.external).not.toBe(true);
    expect(contactItem).not.toHaveProperty('icon');
  });

  it('keeps the contact link out of the desktop header navigation', () => {
    expect(PRIMARY_NAVIGATION_ITEMS).not.toContainEqual(expect.objectContaining({ id: 'contact' }));
  });
});
