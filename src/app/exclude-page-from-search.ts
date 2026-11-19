import { DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/**
 * Asks search engines not to index the current page until the calling component is destroyed.
 *
 * Use it on error pages: every unknown URL loads the app with status 200, so without it search
 * engines index error pages as real pages. Must be called in a component's injection context.
 */
export function excludePageFromSearch(): void {
  const meta = inject(Meta);
  meta.updateTag({ name: 'robots', content: 'noindex' });
  inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
}
