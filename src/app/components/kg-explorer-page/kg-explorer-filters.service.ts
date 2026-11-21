import { Service, signal } from '@angular/core';
import { BreakpointExpression, watchBreakpoint } from '@atlasng/cdk';

/** Breakpoint from which the filter menu docks beside the table instead of sliding over it */
export const KG_EXPLORER_FILTERS_DOCK_BREAKPOINT: BreakpointExpression = 'large';

/** Filter menu state shared by the table view and its toggle button in the app header */
@Service()
export class KgExplorerFiltersService {
  /** Whether a table view with a filter menu is displayed */
  readonly available = signal(false);

  /** Whether the filter menu is open */
  readonly open = signal(false);

  /** Whether the filter menu is docked beside the table */
  readonly docked = watchBreakpoint(KG_EXPLORER_FILTERS_DOCK_BREAKPOINT);

  /** Opens or closes the filter menu */
  toggle(): void {
    this.open.update((open) => !open);
  }

  /**
   * Opens a docked filter menu and closes one that slides over the page. Call it before the table view renders, so
   * the menu arrives in place instead of sliding in once the table view opens it.
   *
   * @see https://github.com/cns-iu/AtlasNG/issues/516
   */
  reset(): void {
    this.open.set(this.docked());
  }

  /** Closes the filter menu when it slides over the page; a docked menu stays open */
  closeOverlay(): void {
    if (!this.docked()) {
      this.open.set(false);
    }
  }
}
