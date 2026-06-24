import { ResolveFn, Route } from '@angular/router';
import { ContentPage } from './components/content-page/content-page';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as yaml from 'js-yaml';
import { map } from 'rxjs';

export function createYamlSpecResolver(
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
    loadComponent: () =>
      import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'data',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/data-page/data.yaml'),
    },
  },
];
