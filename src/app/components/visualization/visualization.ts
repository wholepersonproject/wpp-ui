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
    effect(async (onCleanup) => {
      const el = this.visRef().nativeElement;
      const { finalize } = await embed(el, this.url());
      onCleanup(() => finalize());
    });
  }
}
