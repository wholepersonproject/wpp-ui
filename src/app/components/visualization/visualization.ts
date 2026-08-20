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

  constructor() {
    effect((onCleanup) => {
      const container = this.visRef().nativeElement;
      const url = this.url();
      let isDisposed = false;
      let finalizeCallback: (() => void) | undefined;

      this.embedVisualization(container, url).then((finalize) => {
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

  private async embedVisualization(container: HTMLElement, url: string): Promise<() => void> {
    const { default: embed } = await import('vega-embed');
    const { finalize } = await embed(container, url, {
      renderer: 'canvas',
    });

    return finalize;
  }
}
