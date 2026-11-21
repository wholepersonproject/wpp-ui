import { ResolveFn, Route } from '@angular/router';
import { ContentPage } from './components/content-page/content-page';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as yaml from 'js-yaml';
import { map } from 'rxjs';
import { KgDataService } from './components/kg-explorer-page/kg-data.service';
import { KgExplorerPage } from './components/kg-explorer-page/kg-explorer-page';
import { KgMetadataPage, kgMetadataResolver } from './components/kg-metadata-page/kg-metadata-page';
import { LandingPage } from './components/landing-page/landing-page';
import { validateLandingPageContent } from './components/landing-page/landing-page-content';
import { NotFoundPage } from './components/not-found-page/not found page';
import { ServerErrorPage } from './components/server-error-page/server error page';

/**
 * Creates a resolver that loads a YAML content file
 *
 * @param url URL of the YAML file
 * @param validate Optional check that converts the parsed value, throwing when it is invalid
 * @returns Resolver of the parsed (and validated) content
 */
function createYamlSpecResolver<T = Record<string, unknown>>(
  url: string,
  validate?: (value: unknown) => T,
): ResolveFn<T> {
  return () => {
    const http = inject(HttpClient);
    return http.get(url, { responseType: 'text' }).pipe(
      map((data) => {
        const value: unknown = yaml.load(data, { filename: url });
        return validate ? validate(value) : (value as T);
      }),
    );
  };
}

/** Routes of the website */
export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/landing-page/data.yaml', validateLandingPageContent),
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
    path: 'events',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/events-page/data.yaml'),
    },
  },
  {
    path: 'events',
    component: ContentPage,
    resolve: {
      data: createYamlSpecResolver('assets/content/events-page/data.yaml'),
    },
  },
  // TODO(#88): title the Knowledge Graph Explorer routes and list them in the sitemap, as noted on #92
  {
    path: 'kg-explorer',
    component: KgExplorerPage,
    resolve: {
      data: () => inject(KgDataService).explorerItems$,
    },
  },
  {
    path: 'kg-explorer/:type/:name',
    component: KgMetadataPage,
    resolve: {
      data: kgMetadataResolver,
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
      data: createYamlSpecResolver('assets/content/privacy-policy-page/data.yaml'),
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
      data: createYamlSpecResolver('assets/content/visualizations-page/data.yaml'),
    },
  },

  // Error pages
  {
    path: '500',
    component: ServerErrorPage,
    data: {
      reportIssueLink: 'https://github.com/wholepersonproject/wpp-ui/issues/new',
    },
  },
  {
    path: '**',
    component: NotFoundPage,
  },
];
