import type { HeaderShellNavigationItem } from '@atlasng/labs/header-shell';

/** Link to the contact section of the about page */
const CONTACT_ITEM = {
  id: 'contact',
  label: 'Contact us',
  link: { command: '/about', fragment: 'contact-us' },
} satisfies HeaderShellNavigationItem;

/** Pages linked from the header and the left drawer */
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

/** Apps and links in the right drawer */
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
    link: '/kg-explorer',
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
