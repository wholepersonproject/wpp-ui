import { inject, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { filter } from 'rxjs';

/** The navigation container's drawer state, as on `ang-navigation-container` */
interface NavigationDrawers {
  leftMenuOpen: WritableSignal<boolean>;
  rightMenuOpen: WritableSignal<boolean>;
}

/**
 * Closes both navigation drawers after every navigation, including a click on the current page's link.
 *
 * AtlasNG's `ang-navigation-container` only closes a drawer on a backdrop click, Escape, or its toggle,
 * so a page picked from a drawer would otherwise leave the drawer open over the new page.
 * Must be called in an injection context.
 *
 * @param drawers The app's navigation container, once rendered
 */
export function closeDrawersOnNavigation(drawers: Signal<NavigationDrawers | undefined>): void {
  inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd || event instanceof NavigationSkipped),
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      drawers()?.leftMenuOpen.set(false);
      drawers()?.rightMenuOpen.set(false);
    });
}
