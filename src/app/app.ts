import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, model, signal, TemplateRef, viewChild } from '@angular/core';
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
import { PageFooterService } from './page-footer.service';

/** Root shell of the website: header, navigation drawers, routed page, footer, and cookie consent */
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
    NgTemplateOutlet,
    TextLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Opens the cookie preferences dialog */
  private readonly dialog = inject(MatDialog);
  /** Navigates to the privacy policy */
  private readonly router = inject(Router);
  /** Stores the user's analytics and cookie permissions */
  private readonly permissionsManager = inject(AnalyticsPermissionsManager);
  /** Open cookie preferences dialog, if any */
  private ref?: MatDialogRef<CookieModal>;

  /** Filter menu of the knowledge graph explorer table view */
  protected readonly kgExplorerFilters = inject(KgExplorerFiltersService);
  /** Navigation drawers, closed after each navigation */
  private readonly navigationContainer = viewChild(NavigationContainer);
  /** Footer placement, moved into pages that scroll inside their own scroll area */
  protected readonly pageFooter = inject(PageFooterService);
  /** Footer template, rendered by the shell or by the displayed page */
  private readonly footer = viewChild.required<TemplateRef<unknown>>('footer');

  /** Whether the user has already chosen cookie preferences; hides the cookie banner */
  readonly preferencesSet = signal(this.permissionsManager.syncFromStorage());

  /** Pages linked from the header */
  readonly navigationItems = model<HeaderShellNavigationItem[]>([...PRIMARY_NAVIGATION_ITEMS]);

  /** Pages in the left drawer: the header pages plus the contact link */
  readonly localNavigationItems = computed<HeaderShellNavigationItem[]>(() =>
    createLocalNavigationItems(this.navigationItems()),
  );

  /** Apps and links in the right drawer */
  readonly appMenuItems = model<HeaderShellNavigationItem[]>([...APP_MENU_ITEMS]);

  /** Social media buttons shown in the drawers and footer */
  readonly socialMediaIds = model<string[]>(['youtube', 'github', 'bluesky', 'x']);

  /** Color scheme the user's system prefers */
  readonly currentTheme = model<'light' | 'dark'>();

  /** Logo matching the current color scheme */
  readonly headerLogo = computed(() => (this.currentTheme() === 'dark' ? 'wpp-header-dark.svg' : 'wpp-header.svg'));

  /** Closes the drawers after navigation, shares the footer with pages, and follows the system color scheme */
  constructor() {
    closeDrawersOnNavigation(this.navigationContainer);
    effect(() => this.pageFooter.template.set(this.footer()));

    this.currentTheme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      this.currentTheme.set(event.matches ? 'dark' : 'light');
    });
  }

  /** Navigates to the privacy policy page */
  openPrivacyPolicy(): void {
    void this.router.navigate(['/privacy-policy']);
  }

  /** Opens the cookie preferences dialog and saves the permissions the user picks */
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

  /** Grants every cookie category */
  allowAllCookies(): void {
    this.permissionsManager.setFullPermissions();
  }

  /** Grants only the necessary cookies */
  allowNecessaryCookies(): void {
    this.permissionsManager.setDefaultPermissions();
  }
}
