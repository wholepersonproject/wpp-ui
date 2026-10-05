import { Component, computed, inject, Injector, model, Service, Signal, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, IsActiveMatchOptions, NavigationBehaviorOptions, Router, RouterModule } from '@angular/router';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { AnyLink, LinkAttributes, LinkCommand, LinkHandler, PreparedLink } from '@atlasng/common';
import { CookieBanner, CookieBannerPrivacyPolicy } from '@atlasng/design-system/cookie-banner';
import { Footer } from '@atlasng/design-system/footer';
import { TextLink } from '@atlasng/design-system/links/text-link';
import { CookieModal, CookieModalData } from '@atlasng/labs/cookie-modal';
import { HeaderShell, HeaderShellNavigationItem, NavigationContainer } from '@atlasng/labs/header-shell';
import { APP_MENU_ITEMS, createLocalNavigationItems, PRIMARY_NAVIGATION_ITEMS } from './navigation';

/**
 * Link handler that works around AtlasNG link issues before delegating to the router handler.
 *
 * - Opens the header shell logo link in the same tab.
 *   TODO: Remove once the logo link target issue is fixed in `@atlasng/labs/header-shell`.
 * - Resolves `'.'` commands (used by content header self-links) against the active route instead of the
 *   router root, so fragment links stay on the current page.
 *   TODO: Remove once `RouterLinkHandler` resolves relative commands against the active route.
 */
@Service({ autoProvided: false })
class AppLinkHandler implements LinkHandler {
  private readonly parentHandler = inject(LinkHandler, { skipSelf: true });
  private readonly router = inject(Router);

  prepareLink(command: LinkCommand, element?: Element, attributes?: LinkAttributes, injector?: Injector): PreparedLink {
    if (command.command === '.' && !command.relativeTo) {
      command = { ...command, relativeTo: this.getActiveRoute() };
    }

    const link = this.parentHandler.prepareLink(command, element, attributes, injector);
    if (command.command === '/') {
      // A null attribute overrides the `target` input on the host element; undefined falls back to it
      return { ...link, attributes: { ...link.attributes, target: null } };
    }

    return link;
  }

  navigateTo(link: PreparedLink, event: Event, options: NavigationBehaviorOptions): boolean | void {
    return this.parentHandler.navigateTo(link, event, options);
  }

  isActive(link: PreparedLink, matchOptions?: Partial<IsActiveMatchOptions>): Signal<boolean> {
    return this.parentHandler.isActive(link, matchOptions);
  }

  /** Returns the deepest activated route, which owns the current page URL. */
  private getActiveRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route;
  }
}

@Component({
  selector: 'wpp-website',
  imports: [
    RouterModule,
    AnyLink,
    CookieBanner,
    CookieBannerPrivacyPolicy,
    Footer,
    HeaderShell,
    NavigationContainer,
    TextLink,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [
    {
      provide: LinkHandler,
      useClass: AppLinkHandler,
    },
  ],
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
