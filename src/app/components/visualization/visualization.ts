import { Component, DestroyRef, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import type { Config } from 'vega-embed';

/** Media query that tracks the user's light or dark mode preference */
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

/**
 * Resolves a CSS color expression, such as a `var()` reference, to a concrete color.
 * Vega draws on a canvas, which can't read CSS variables or `light-dark()`.
 *
 * @param parent Element whose styles the color is resolved against
 * @param value CSS color expression
 * @returns The computed color, e.g. `rgb(28, 27, 30)`
 */
function resolveColor(parent: HTMLElement, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  parent.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/**
 * Builds a Vega config that colors the chart from the page's current theme tokens.
 *
 * @param container Element the chart is embedded in, which defines the color tokens
 * @returns Config merged under each spec's own config
 */
function createThemeConfig(container: HTMLElement): Config {
  const color = (name: string) => resolveColor(container, `var(--wpp-visualization-${name}-color)`);
  const titleColor = color('title');
  const labelColor = color('label');
  const axisColor = color('axis');
  const background = color('background');

  return {
    background,
    title: { color: titleColor },
    axis: { titleColor, labelColor, domainColor: axisColor, tickColor: axisColor, gridColor: color('grid') },
    legend: { titleColor, labelColor, symbolFillColor: background },
  };
}

@Component({
  selector: 'wpp-visualization',
  imports: [],
  templateUrl: './visualization.html',
  styleUrl: './visualization.scss',
})
export class Visualization {
  readonly url = input.required<string>();

  /** Reference to the element where visualization is to be embedded */
  protected readonly visRef = viewChild.required<ElementRef<HTMLDivElement>>('vis');

  /**
   * Reference to the element where the visualization's input controls are rendered.
   * Kept outside the aspect-ratio box so controls of any height never overflow it.
   */
  protected readonly bindingsRef = viewChild.required<ElementRef<HTMLDivElement>>('bindings');

  /** Whether dark mode is active; the chart is re-embedded with new colors when it changes */
  private readonly isDarkMode = signal(window.matchMedia(DARK_MODE_QUERY).matches);

  constructor() {
    const darkModeQuery = window.matchMedia(DARK_MODE_QUERY);
    const onColorSchemeChange = (event: MediaQueryListEvent) => this.isDarkMode.set(event.matches);
    darkModeQuery.addEventListener('change', onColorSchemeChange);
    inject(DestroyRef).onDestroy(() => darkModeQuery.removeEventListener('change', onColorSchemeChange));

    effect((onCleanup) => {
      const container = this.visRef().nativeElement;
      const bindings = this.bindingsRef().nativeElement;
      const url = this.url();
      this.isDarkMode();
      let isDisposed = false;
      let finalizeCallback: (() => void) | undefined;

      this.embedVisualization(container, bindings, url).then((finalize) => {
        if (isDisposed) {
          finalize();
        } else {
          finalizeCallback = finalize;
        }
      });

      onCleanup(() => {
        isDisposed = true;
        finalizeCallback?.();
      });
    });
  }

  private async embedVisualization(container: HTMLElement, bindings: HTMLElement, url: string): Promise<() => void> {
    const { default: embed } = await import('vega-embed');
    const { finalize } = await embed(container, url, {
      renderer: 'canvas',
      bind: bindings,
      config: createThemeConfig(container),
    });

    return finalize;
  }
}
