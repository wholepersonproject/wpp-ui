import type { HeaderShellNavigationItem } from '@atlasng/labs/header-shell';

const WEBSITE_FEEDBACK_ITEM = {
  id: 'website-feedback',
  label: 'Website feedback',
  link: 'https://github.com/wholepersonproject/wpp-ui/issues/new/choose',
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
  WEBSITE_FEEDBACK_ITEM,
];

/**
 * Adds the website feedback link to the end of local navigation
 *
 * @param navigationItems Existing local navigation items
 * @returns A new navigation collection with website feedback appended
 */
export function createLocalNavigationItems(
  navigationItems: readonly HeaderShellNavigationItem[],
): HeaderShellNavigationItem[] {
  return [...navigationItems, { ...WEBSITE_FEEDBACK_ITEM, icon: 'feedback' }];
}
