import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Viewport scroller that scrolls the app shell's `mat-drawer-content`.
 *
 * Pages scroll inside the drawer content rather than the window, so Angular's
 * default scroller never resets, anchors, or restores the page on navigation.
 * Providing this class lets `withInMemoryScrolling` drive the drawer instead.
 * Falls back to the window when the drawer is not rendered.
 *
 * @see https://github.com/wholepersonproject/wpp-ui/issues/61
 */
@Injectable()
export class DrawerViewportScroller extends ViewportScroller {
  private readonly document = inject(DOCUMENT);
  private offset: () => [number, number] = () => [0, 0];

  private get window(): Window {
    return this.document.defaultView as Window;
  }

  setOffset(offset: [number, number] | (() => [number, number])): void {
    this.offset = Array.isArray(offset) ? () => offset : offset;
  }

  getScrollPosition(): [number, number] {
    const container = this.getScrollContainer();

    if (container) {
      return [container.scrollLeft, container.scrollTop];
    }

    return [this.window.scrollX, this.window.scrollY];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    const [left, top] = position;
    (this.getScrollContainer() ?? this.window).scrollTo({ ...options, left, top });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    const element = this.findAnchor(anchor);

    if (element) {
      this.scrollToElement(element, options);
      element.focus({ preventScroll: true });
    }
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    try {
      this.window.history.scrollRestoration = scrollRestoration;
    } catch {
      // Sandboxed or inactive windows may reject the assignment; scrolling still works.
    }
  }

  /**
   * Looks up the drawer on every call because it is created after this root
   * service and may be re-rendered.
   */
  private getScrollContainer(): HTMLElement | null {
    return this.document.querySelector<HTMLElement>('mat-drawer-content');
  }

  /** Matches the router's anchor lookup: an element id first, then a `name` attribute. */
  private findAnchor(anchor: string): HTMLElement | undefined {
    return (
      this.document.getElementById(anchor) ?? (this.document.getElementsByName(anchor)[0] as HTMLElement | undefined)
    );
  }

  private scrollToElement(element: HTMLElement, options?: ScrollOptions): void {
    const container = this.getScrollContainer();
    const rect = element.getBoundingClientRect();
    const [offsetLeft, offsetTop] = this.offset();
    let left: number;
    let top: number;

    if (container) {
      const containerRect = container.getBoundingClientRect();
      left = rect.left - containerRect.left + container.scrollLeft;
      top = rect.top - containerRect.top + container.scrollTop;
    } else {
      left = rect.left + this.window.scrollX;
      top = rect.top + this.window.scrollY;
    }

    this.scrollToPosition([left - offsetLeft, top - offsetTop], options);
  }
}
