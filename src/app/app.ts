import { Component, computed, inject, model, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { AnyLink } from '@atlasng/common';
import { CookieBanner, CookieBannerPrivacyPolicy } from '@atlasng/design-system/cookie-banner';
import { Footer } from '@atlasng/design-system/footer';
import { TextLink } from '@atlasng/design-system/links/text-link';
import { CookieModal, CookieModalData } from '@atlasng/labs/cookie-modal';
import {
  HeaderShell,
  HeaderShellAction,
  HeaderShellNavigationItem,
  NavigationContainer,
} from '@atlasng/labs/header-shell';
import { KgExplorerFiltersService } from './components/kg-explorer-page/kg-explorer-filters.service';
import { closeDrawersOnNavigation } from './close-drawers-on-navigation';
import { APP_MENU_ITEMS, createLocalNavigationItems, PRIMARY_NAVIGATION_ITEMS } from './navigation';

@Component({
  selector: 'wpp-website',
  imports: [
    RouterModule,
    AnyLink,
    CookieBanner,
    CookieBannerPrivacyPolicy,
    Footer,
    HeaderShell,
    HeaderShellAction,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NavigationContainer,
    TextLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly permissionsManager = inject(AnalyticsPermissionsManager);
  private ref?: MatDialogRef<CookieModal>;

  /** Filter menu of the knowledge graph explorer table view */
  protected readonly kgExplorerFilters = inject(KgExplorerFiltersService);
  private readonly navigationContainer = viewChild(NavigationContainer);

  readonly preferencesSet = signal(this.permissionsManager.syncFromStorage());

  readonly navigationItems = model<HeaderShellNavigationItem[]>([...PRIMARY_NAVIGATION_ITEMS]);

  readonly localNavigationItems = computed<HeaderShellNavigationItem[]>(() =>
    createLocalNavigationItems(this.navigationItems()),
  );

  readonly appMenuItems = model<HeaderShellNavigationItem[]>([...APP_MENU_ITEMS]);

  readonly socialMediaIds = model<string[]>(['youtube', 'github', 'bluesky', 'x']);

  readonly currentTheme = model<'light' | 'dark'>();

  readonly headerLogo = computed(() => (this.currentTheme() === 'dark' ? 'wpp-header-dark.svg' : 'wpp-header.svg'));

  constructor() {
    closeDrawersOnNavigation(this.navigationContainer);

    this.currentTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      this.currentTheme.set(event.matches ? 'dark' : 'light');
    });
  }

  openPrivacyPolicy(): void {
    void this.router.navigate(['/privacy-policy']);
  }

  openPrivacyPreferences(): void {
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

  allowAllCookies(): void {
    this.permissionsManager.setFullPermissions();
  }

  allowNecessaryCookies(): void {
    this.permissionsManager.setDefaultPermissions();
  }
}
