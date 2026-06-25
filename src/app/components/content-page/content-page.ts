import { coerceArray } from '@angular/cdk/coercion';
import { Component, computed, effect, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumbs } from '@atlasng/design-system/buttons/breadcrumbs';
import { SectionHeader } from '@atlasng/labs/section-header';
import { Table } from '@atlasng/labs/table';
import { MarkdownModule } from 'ngx-markdown';
import { TextLink } from '@atlasng/design-system/text-link';
import { RouterLink } from "@angular/router";

export type TableRow = Record<string, string | number | TableCell>;

export type TableCell = {
  label: string | number;
  link?: string;
};

export type TableColumn = {
  column: string;
  label: string;
  sticky?: boolean;
  numeric?: boolean;
};

interface MarkdownContent {
  type: 'markdown';
  data: string;
}

interface ButtonContent {
  type: 'button';
  text: string;
  route: string;
  icon?: string;
}

interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
}

interface TableContent {
  type: 'table';
  rows: TableRow[];
  columns: TableColumn[];
}

type Content =
  | PageSection
  | MarkdownContent
  | ButtonContent
  | TableContent
  | ImageContent;

interface PageSection {
  type: 'section';
  tagline: string;
  anchor: string;
  level: number;
  content: Content[];
}

interface ContentPageData {
  headerContent: {
    title: string;
    subtitle: string;
    breadcrumbs: { name: string; command: string }[];
  };
  content: Content[];
}

const isPageSection = (content: Content): content is PageSection => content.type === 'section';

@Component({
  selector: 'wpp-content-page',
  imports: [Breadcrumbs, SectionHeader, MatButtonModule, MatIconModule, Table, MarkdownModule, TextLink, RouterLink],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export class ContentPage {
  /** Input data for content page */
  readonly data = input.required<ContentPageData>();

  /** Content data */
  protected readonly content = computed(() => coerceArray(this.data().content));

  /** All nested sections flattened into a single list */
  protected readonly flattenedSections = computed(() => this.flattenSectionContent(this.content()));

  constructor() {
    effect(() => {
      console.log('ContentPage data:', this.data());
      console.log(this.flattenedSections());
    });
  }

  protected flattenSectionContent(content: Content[]): PageSection[] {
    const sections: PageSection[] = [];

    for (const item of content) {
      if (!isPageSection(item)) {
        continue;
      }

      sections.push(item);
      sections.push(...this.flattenSectionContent(item.content));
    }

    return sections;
  }
}
