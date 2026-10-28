import { ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideAnalytics, withDefaultBackend } from '@atlasng/analytics';
import { provideLinkHandler, withRouterHandler } from '@atlasng/common';
import {
  provideSocialMediaButtons,
  SocialMediaButtonDefinition,
} from '@atlasng/design-system/buttons/social-media-button';
import { provideMarkdown } from 'ngx-markdown';
import { appRoutes } from './app.routes';
import { DrawerViewportScroller } from './drawer-viewport-scroller';

// Social media button definitions for the application
const SOCIAL_MEDIA_DEFS: SocialMediaButtonDefinition[] = [
  {
    id: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@wholepersonphysiome',
    classes: ['youtube'],
  },
  {
    id: 'github',
    label: 'GitHub',
    url: 'https://github.com/wholepersonproject',
    classes: ['github'],
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    url: 'https://bsky.app/profile/wholepersonphys.bsky.social',
    classes: ['bluesky'],
  },
  {
    id: 'x',
    label: 'X (formerly Twitter)',
    url: 'https://x.com/wholepersonphys',
    classes: ['x'],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideMarkdown({ loader: HttpClient }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    { provide: ViewportScroller, useClass: DrawerViewportScroller },
    provideSocialMediaButtons(SOCIAL_MEDIA_DEFS),
    provideAnalytics(
      {},
      withDefaultBackend({
        endpoint: `https://cdn.wholepersonphysiome.org/tr${isDevMode() ? '-dev' : ''}`,
      }),
    ),
    provideLinkHandler(withRouterHandler()),
  ],
};
