import { Component, input } from '@angular/core';
import { LandingPageContent } from './landing-page-content';
import { NewsAndEvents } from './news-and-events/news-and-events';

export type { LandingPageContent } from './landing-page-content';

@Component({
  selector: 'wpp-landing-page',
  imports: [NewsAndEvents],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  /** All landing-page content resolved from the public YAML file. */
  readonly data = input.required<LandingPageContent>();
}
