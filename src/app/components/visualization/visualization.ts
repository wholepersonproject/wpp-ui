import { Component, effect, ElementRef, input, viewChild } from '@angular/core';

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

  constructor() {
    effect((onCleanup) => {
      const container = this.visRef().nativeElement;
      const bindings = this.bindingsRef().nativeElement;
      const url = this.url();
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
    });

    return finalize;
  }
}
