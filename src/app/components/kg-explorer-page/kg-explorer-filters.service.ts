import { Service, signal } from '@angular/core';

/** Filter menu state shared by the table view and its toggle button in the app header */
@Service()
export class KgExplorerFiltersService {
  /** Whether a table view with a filter menu is displayed */
  readonly available = signal(false);

  /** Whether the filter menu is open */
  readonly open = signal(false);

  /** Opens or closes the filter menu */
  toggle(): void {
    this.open.update((open) => !open);
  }
}
