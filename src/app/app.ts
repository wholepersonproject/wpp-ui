import { Component, computed, inject, model } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { CookieModal, CookieModalData } from '@atlasng/labs/cookie-modal';
import { Footer } from '@atlasng/labs/footer';
import {
  HeaderShell,
  HeaderShellNavigationItem,
  NavigationContainer,
} from '@atlasng/labs/header-shell';

@Component({
  imports: [RouterModule, Footer, HeaderShell, NavigationContainer],
  selector: 'wpp-website',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly permissionsManager = inject(AnalyticsPermissionsManager);
  private ref?: MatDialogRef<CookieModal>;

  readonly navigationItems = model<HeaderShellNavigationItem[]>([
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
  ]);

  readonly appMenuItems = model<HeaderShellNavigationItem[]>([
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
  ]);

  readonly socialMediaIds = model<string[]>([
    'youtube',
    'github',
    'bluesky',
    'x',
  ]);

  readonly currentTheme = model<'light' | 'dark'>();

  readonly headerLogo = computed(() =>
    this.currentTheme() === 'dark' ? 'wpp-header-dark.svg' : 'wpp-header.svg',
  );
  readonly footerLogo = computed(() =>
    this.currentTheme() === 'dark' ? 'wpp-footer-dark.svg' : 'wpp-footer.svg',
  );

  constructor() {
    this.currentTheme.set(
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
    );

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        this.currentTheme.set(event.matches ? 'dark' : 'light');
      });
  }

  openPrivacyPolicy() {
    void this.router.navigate(['/privacy-policy']);
  }

  openPrivacyPreferences() {
    this.ref = this.dialog.open(CookieModal, {
      data: {
        logoSrc: this.headerLogo(),
        permissions: this.permissionsManager.permissions(),
        providers: {
          marketing: [
            {
              label: 'YouTube',
              href: 'https://policies.google.com/privacy',
            },
          ],
        },
      } satisfies CookieModalData,
    });

    this.ref.afterClosed().subscribe((value) => {
      if (value) {
        this.permissionsManager.setPermissions(value);
      }
    });
  }
}
