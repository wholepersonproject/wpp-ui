import { Component, computed, input, numberAttribute } from '@angular/core';
import { MatButtonModule, type MatButtonAppearance } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';

export interface ContentCardAction {
  text: string;
  url: string;
  appearance?: MatButtonAppearance;
  icon?: string;
}

export interface ContentCardItem {
  id: string;
  title: string;
  description: string;
  actions: [ContentCardAction, ...ContentCardAction[]];
}

export interface ContentCardGridContent {
  type: 'card-grid';
  items: ContentCardItem[];
}

@Component({
  selector: 'wpp-content-card-grid',
  imports: [MarkdownModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './content-card-grid.html',
  styleUrl: './content-card-grid.scss',
})
export class ContentCardGrid {
  /** Card content loaded from a page's YAML file */
  readonly items = input.required<ContentCardItem[]>();

  /** Native heading level used for each card title */
  readonly headingLevel = input(3, { transform: numberAttribute });

  /** Keeps card headings within the native HTML heading range */
  protected readonly normalizedHeadingLevel = computed(() => Math.min(Math.max(this.headingLevel(), 2), 6));
}
