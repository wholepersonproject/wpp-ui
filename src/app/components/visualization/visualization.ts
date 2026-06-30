import { Component, effect, ElementRef, input, viewChild } from '@angular/core';
import embed from 'vega-embed';

@Component({
  selector: 'wpp-visualization',
  imports: [],
  templateUrl: './visualization.html',
  styleUrl: './visualization.scss',
})
export class Visualization {
  readonly url = input.required<string>();

  /** Reference to the element where visualization is to be embedded */
  protected readonly visRef =
    viewChild.required<ElementRef<HTMLDivElement>>('vis');

  constructor() {
    effect((onCleanup) => {
      const el = this.visRef().nativeElement;
      let finalize: (() => void) | undefined;
      onCleanup(() => {
        finalize?.();
      });

      void (async () => {
        const result = await embed(el, this.url(), {
          renderer: 'canvas',
        });
        finalize = result.finalize;
      })();
    });
  }
}
