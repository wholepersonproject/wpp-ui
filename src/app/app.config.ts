import { HttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import {
  provideSocialMediaButtons,
  SocialMediaButtonDef,
} from '@atlasng/design-system/buttons/social-media';
import { provideMarkdown } from 'ngx-markdown';
import { appRoutes } from './app.routes';
import { provideAnalytics, withDefaultBackend } from '@atlasng/analytics';

// Social media button definitions for the application
const SOCIAL_MEDIA_DEFS: SocialMediaButtonDef[] = [
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
    provideSocialMediaButtons(SOCIAL_MEDIA_DEFS),
    provideAnalytics(
      {},
      withDefaultBackend({
        endpoint:
          'https://www.wholepersonphysiome.org/tr' +
          (typeof ngDevMode === 'undefined' || ngDevMode ? '-dev' : ''),
      }),
    ),
  ],
};
