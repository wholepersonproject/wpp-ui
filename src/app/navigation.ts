import type { HeaderShellNavigationItem } from '@atlasng/labs/header-shell';

const CONTACT_ITEM = {
  id: 'contact',
  label: 'Contact us',
  link: { command: '/about', fragment: 'contact-us' },
} satisfies HeaderShellNavigationItem;

export const PRIMARY_NAVIGATION_ITEMS: readonly HeaderShellNavigationItem[] = [
  { id: 'home', label: 'Home', link: '/', icon: 'home' },
  { id: 'about', label: 'About', link: '/about', icon: 'info' },
  { id: 'data', label: 'Data', link: '/data', icon: 'database' },
  {
    id: 'visualizations',
    label: 'Visualizations',
    link: '/visualizations',
    icon: 'bar_chart',
  },
  { id: 'models', label: 'Models', link: '/models', icon: 'timeline' },
  {
    id: 'resources',
    label: 'Resources',
    link: '/resources',
    icon: 'quick_reference',
  },
  { id: 'events', label: 'Events', link: '/events', icon: 'event' },
];

export const APP_MENU_ITEMS: readonly HeaderShellNavigationItem[] = [
  { id: 'home', label: 'Home', link: '/' },
  {
    id: 'multiscale-model-explorer',
    label: 'Multiscale Model Explorer',
    link: 'https://wholepersonproject.github.io/wpp-eui-experiment/',
  },
  {
    id: 'kg-explorer',
    label: 'Knowledge Graph Explorer',
    link: 'https://kg.wholepersonphysiome.org',
  },
  CONTACT_ITEM,
];

/**
 * Adds the contact link to the end of local navigation
 *
 * @param navigationItems Existing local navigation items
 * @returns A new navigation collection with the contact link appended
 */
export function createLocalNavigationItems(
  navigationItems: readonly HeaderShellNavigationItem[],
): HeaderShellNavigationItem[] {
  return [...navigationItems, { ...CONTACT_ITEM, icon: 'mail' }];
}
