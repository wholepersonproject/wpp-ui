import { DOCUMENT, Location } from '@angular/common';
import {
  DestroyRef,
  ElementRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

export interface ActiveSection {
  anchor: string;
}

@Injectable()
export class ActiveSectionService {
  private readonly activeSectionOffset = 96;
  private readonly pendingActiveSectionDuration = 1200;
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly location = inject(Location);
  private readonly sections = signal<readonly ActiveSection[]>([]);
  private initialized = false;
  private scrollContainer: HTMLElement | undefined;
  private pendingActiveSectionAnchor: string | undefined;
  private pendingActiveSectionExpiresAt = 0;

  private readonly selectedSectionAnchor = signal<string | undefined>(
    undefined,
  );

  readonly activeSectionAnchor = computed(() => {
    const sections = this.sections();
    const selectedAnchor = this.selectedSectionAnchor();

    if (
      selectedAnchor &&
      sections.some((section) => section.anchor === selectedAnchor)
    ) {
      return selectedAnchor;
    }

    return sections[0]?.anchor;
  });

  initialize(): void {
    if (this.initialized) {
      this.syncActiveSectionOnNextFrame();
      return;
    }

    this.initialized = true;

    const host = this.elementRef.nativeElement;
    const scrollContainer = host.closest(
      'mat-drawer-content',
    ) as HTMLElement | null;
    this.scrollContainer = scrollContainer ?? undefined;

    const scrollTarget = this.scrollContainer ?? this.document.defaultView;
    scrollTarget?.addEventListener('scroll', this.syncActiveSectionWithScroll, {
      passive: true,
    });
    this.document.defaultView?.addEventListener(
      'resize',
      this.syncActiveSectionWithScroll,
      { passive: true },
    );
    host.addEventListener('click', this.scrollToLocalAnchor);

    this.destroyRef.onDestroy(() => {
      scrollTarget?.removeEventListener(
        'scroll',
        this.syncActiveSectionWithScroll,
      );
      this.document.defaultView?.removeEventListener(
        'resize',
        this.syncActiveSectionWithScroll,
      );
      host.removeEventListener('click', this.scrollToLocalAnchor);
    });

    this.syncActiveSectionOnNextFrame();
  }

  setSections(sections: readonly ActiveSection[]): void {
    this.sections.set(sections);

    const selectedAnchor = this.selectedSectionAnchor();

    if (
      !selectedAnchor ||
      !sections.some((section) => section.anchor === selectedAnchor)
    ) {
      this.selectedSectionAnchor.set(sections[0]?.anchor);
    }

    this.syncActiveSectionOnNextFrame();
  }

  isSectionActive(anchor: string): boolean {
    return this.activeSectionAnchor() === anchor;
  }

  private readonly scrollToLocalAnchor = (event: MouseEvent): void => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    const href = link?.getAttribute('href');
    const anchor = href ? this.getAnchorFromHref(href) : undefined;

    if (!anchor) {
      return;
    }

    const section = this.document.getElementById(anchor);

    if (!section) {
      return;
    }

    event.preventDefault();
    this.selectedSectionAnchor.set(anchor);
    this.pendingActiveSectionAnchor = anchor;
    this.pendingActiveSectionExpiresAt =
      Date.now() + this.pendingActiveSectionDuration;
    this.location.go(
      `${this.location.path().split('#')[0]}#${encodeURIComponent(anchor)}`,
    );
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  private readonly syncActiveSectionWithScroll = (): void => {
    if (this.shouldKeepPendingSectionActive()) {
      return;
    }

    this.pendingActiveSectionAnchor = undefined;
    const activeAnchor = this.getActiveSectionAnchorFromScroll();

    if (activeAnchor) {
      this.selectedSectionAnchor.set(activeAnchor);
    }
  };

  private getActiveSectionAnchorFromScroll(): string | undefined {
    const sections = this.sections();

    if (!sections.length) {
      return undefined;
    }

    if (this.isScrolledToBottom()) {
      return sections[sections.length - 1]?.anchor;
    }

    const activationLine = this.getActivationLine();
    let activeAnchor = sections[0]?.anchor;

    for (const section of sections) {
      const sectionElement = this.document.getElementById(section.anchor);

      if (!sectionElement) {
        continue;
      }

      if (sectionElement.getBoundingClientRect().top > activationLine) {
        break;
      }

      activeAnchor = section.anchor;
    }

    return activeAnchor;
  }

  private shouldKeepPendingSectionActive(): boolean {
    if (
      !this.pendingActiveSectionAnchor ||
      Date.now() > this.pendingActiveSectionExpiresAt
    ) {
      return false;
    }

    const sectionElement = this.document.getElementById(
      this.pendingActiveSectionAnchor,
    );

    if (!sectionElement) {
      return false;
    }

    const sectionTop = sectionElement.getBoundingClientRect().top;
    return (
      sectionTop < this.getScrollViewportTop() ||
      sectionTop > this.getActivationLine()
    );
  }

  private getActivationLine(): number {
    return this.getScrollViewportTop() + this.activeSectionOffset;
  }

  private getScrollViewportTop(): number {
    return this.scrollContainer?.getBoundingClientRect().top ?? 0;
  }

  private isScrolledToBottom(): boolean {
    if (this.scrollContainer) {
      return (
        Math.ceil(
          this.scrollContainer.scrollTop + this.scrollContainer.clientHeight,
        ) >=
        this.scrollContainer.scrollHeight - 1
      );
    }

    const windowRef = this.document.defaultView;

    if (!windowRef) {
      return false;
    }

    return (
      Math.ceil(windowRef.scrollY + windowRef.innerHeight) >=
      this.document.documentElement.scrollHeight - 1
    );
  }

  private getAnchorFromHref(href: string): string | undefined {
    const anchor = href.slice(1);

    if (!anchor) {
      return undefined;
    }

    try {
      return decodeURIComponent(anchor);
    } catch {
      return anchor;
    }
  }

  private syncActiveSectionOnNextFrame(): void {
    this.document.defaultView?.requestAnimationFrame(() =>
      this.syncActiveSectionWithScroll(),
    );
  }
}
