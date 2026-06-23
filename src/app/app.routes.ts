import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
];
