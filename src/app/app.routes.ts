import { ResolveFn, Route } from '@angular/router';
import { ContentPage } from './components/content-page/content-page';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as yaml from 'js-yaml';
import { map } from 'rxjs';
import { LandingPage } from './components/landing-page/landing-page';
import { NotFoundPage } from './components/not-found-page/not found page';
import { ServerErrorPage } from './components/server-error-page/server error page';

function createYamlSpecResolver(
  url: string,
): ResolveFn<Record<string, unknown>> {
  return () => {
    const http = inject(HttpClient);
    return http
      .get(url, { responseType: 'text' })
      .pipe(
        map(
          (data) =>
            yaml.load(data, { filename: url }) as Record<string, unknown>,
        ),
      );
  };
}

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingPage,
    data: {
      backgroundImageUrl: './home-splash.png',
    },
  },
  {
    path: 'about',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/about-page/data.yaml'),
    },
  },
  {
    path: 'data',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/data-page/data.yaml'),
    },
  },
  {
    path: 'models',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/models-page/data.yaml'),
    },
  },
  {
    path: 'privacy-policy',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver(
        'assets/content/privacy-policy-page/data.yaml',
      ),
    },
  },
  {
    path: 'resources',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/resources-page/data.yaml'),
    },
  },
  {
    path: 'visualizations',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver(
        'assets/content/visualizations-page/data.yaml',
      ),
    },
  },

  // Error pages
  {
    path: '500',
    component: ServerErrorPage,
    data: {
      reportIssueLink:
        'https://github.com/wholepersonproject/wpp-ui/issues/new',
    },
  },
  {
    path: '404',
    component: NotFoundPage,
  },
];
