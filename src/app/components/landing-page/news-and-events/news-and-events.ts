import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AnyLink } from '@atlasng/common';
import { TextLink } from '@atlasng/design-system/text-link';

export interface NewsAndEventItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  tag: {
    label: string;
    /** Material Symbols Rounded ligature displayed with this card's tag. */
    icon: string;
  };
  url: string;
}

export interface NewsAndEventsContent extends Record<string, unknown> {
  title: string;
  items: NewsAndEventItem[];
}

@Component({
  selector: 'wpp-news-and-events',
  imports: [AnyLink, MatIconModule, TextLink],
  templateUrl: './news-and-events.html',
  styleUrl: './news-and-events.scss',
})
export class NewsAndEvents {
  /** Section copy and cards loaded from the landing-page YAML file. */
  readonly content = input.required<NewsAndEventsContent>();

  /** Returns the route or URL portion consumed by AtlasNG's link directive. */
  protected linkCommand(url: string): string {
    return url.split('#', 1)[0];
  }

  /** Preserves an optional URL fragment when AtlasNG handles an internal link. */
  protected linkFragment(url: string): string | undefined {
    const fragmentIndex = url.indexOf('#');
    return fragmentIndex >= 0 ? url.slice(fragmentIndex + 1) : undefined;
  }
}
