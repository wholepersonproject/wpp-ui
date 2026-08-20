import { Component, computed, inject, model, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { CookieBanner } from '@atlasng/design-system/cookie-banner';
import { CookieModal, CookieModalData } from '@atlasng/labs/cookie-modal';
import { Footer } from '@atlasng/labs/footer';
import { HeaderShell, HeaderShellNavigationItem, NavigationContainer } from '@atlasng/labs/header-shell';
import { APP_MENU_ITEMS, createLocalNavigationItems, PRIMARY_NAVIGATION_ITEMS } from './navigation';

@Component({
  selector: 'wpp-website',
  imports: [RouterModule, Footer, HeaderShell, NavigationContainer, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly permissionsManager = inject(AnalyticsPermissionsManager);
  private ref?: MatDialogRef<CookieModal>;

  readonly preferencesSet = signal(this.permissionsManager.syncFromStorage());

  readonly navigationItems = model<HeaderShellNavigationItem[]>([...PRIMARY_NAVIGATION_ITEMS]);

  readonly localNavigationItems = computed<HeaderShellNavigationItem[]>(() =>
    createLocalNavigationItems(this.navigationItems()),
  );

  readonly appMenuItems = model<HeaderShellNavigationItem[]>([...APP_MENU_ITEMS]);

  readonly socialMediaIds = model<string[]>(['youtube', 'github', 'bluesky', 'x']);

  readonly currentTheme = model<'light' | 'dark'>();

  readonly headerLogo = computed(() => (this.currentTheme() === 'dark' ? 'wpp-header-dark.svg' : 'wpp-header.svg'));
  readonly footerLogo = computed(() => (this.currentTheme() === 'dark' ? 'wpp-footer-dark.svg' : 'wpp-footer.svg'));

  constructor() {
    this.currentTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
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

  allowAllCookies() {
    this.permissionsManager.setFullPermissions();
  }

  allowNecessaryCookies() {
    this.permissionsManager.setDefaultPermissions();
  }
}
