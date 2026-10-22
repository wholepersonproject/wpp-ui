import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DrawerViewportScroller } from './drawer-viewport-scroller';

/** Stubs layout for an element, since jsdom does not compute it */
function stubRect(element: Element, top: number, left = 0): void {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top, left } as DOMRect);
}

describe('DrawerViewportScroller', () => {
  let scroller: ViewportScroller;
  let windowScrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ViewportScroller, useClass: DrawerViewportScroller }],
    });
    scroller = TestBed.inject(ViewportScroller);
    windowScrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  describe('with a drawer', () => {
    let drawer: HTMLElement;
    let drawerScrollTo: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      drawer = document.createElement('mat-drawer-content');
      drawerScrollTo = vi.fn();
      drawer.scrollTo = drawerScrollTo as never;
      drawer.scrollTop = 200;
      drawer.scrollLeft = 10;
      stubRect(drawer, 56);
      document.body.append(drawer);
    });

    it('reports the drawer scroll position', () => {
      expect(scroller.getScrollPosition()).toEqual([10, 200]);
    });

    it('scrolls the drawer instead of the window', () => {
      scroller.scrollToPosition([0, 0], { behavior: 'instant' });

      expect(drawerScrollTo).toHaveBeenCalledWith({ behavior: 'instant', left: 0, top: 0 });
      expect(windowScrollTo).not.toHaveBeenCalled();
    });

    it('scrolls an anchor found by id to the top of the drawer and focuses it', () => {
      const section = document.createElement('section');
      section.id = 'workshops';
      section.tabIndex = -1;
      stubRect(section, 356, 0);
      drawer.append(section);

      scroller.scrollToAnchor('workshops');

      expect(drawerScrollTo).toHaveBeenCalledWith({ left: 10, top: 500 });
      expect(section).toHaveFocus();
    });

    it('finds an anchor by name and applies the offset', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('name', 'legacy');
      stubRect(anchor, 156);
      drawer.append(anchor);
      scroller.setOffset([0, 24]);

      scroller.scrollToAnchor('legacy');

      expect(drawerScrollTo).toHaveBeenCalledWith({ left: 10, top: 276 });
    });

    it('accepts an offset function', () => {
      const section = document.createElement('section');
      section.id = 'target';
      stubRect(section, 56);
      drawer.append(section);
      scroller.setOffset(() => [5, 50]);

      scroller.scrollToAnchor('target');

      expect(drawerScrollTo).toHaveBeenCalledWith({ left: 5, top: 150 });
    });

    it('ignores a missing anchor', () => {
      scroller.scrollToAnchor('missing');

      expect(drawerScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('without a drawer', () => {
    it('falls back to the window', () => {
      const section = document.createElement('section');
      section.id = 'target';
      stubRect(section, 300);
      document.body.append(section);

      expect(scroller.getScrollPosition()).toEqual([window.scrollX, window.scrollY]);

      scroller.scrollToAnchor('target');

      expect(windowScrollTo).toHaveBeenCalledWith({ left: window.scrollX, top: 300 + window.scrollY });
    });
  });

  it('sets history scroll restoration', () => {
    scroller.setHistoryScrollRestoration('manual');

    expect(window.history.scrollRestoration).toBe('manual');

    scroller.setHistoryScrollRestoration('auto');
  });

  it('tolerates a window that rejects scroll restoration', () => {
    vi.spyOn(window.history, 'scrollRestoration', 'set').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
  });
});
