import { coerceArray } from '@angular/cdk/coercion';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumbs } from '@atlasng/design-system/buttons/breadcrumbs';
import { SectionHeader } from '@atlasng/labs/section-header';
import { Table } from '@atlasng/labs/table';
import { MarkdownModule } from 'ngx-markdown';
import { ActiveSectionService } from './active-section-service';
import { TableContent, TableService } from './table-service';
import { Visualization } from './visualization/visualization';
import { YoutubePlayer } from '@atlasng/labs/youtube-player';

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

interface YoutubeContent {
  type: 'youtube';
  videoId: string;
}

interface VisualizationContent {
  type: 'visualization';
  url: string;
}

type Content =
  | PageSection
  | MarkdownContent
  | ButtonContent
  | TableContent
  | ImageContent
  | YoutubeContent
  | VisualizationContent;

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
  content: PageSection[];
}

@Component({
  selector: 'wpp-content-page',
  imports: [
    Breadcrumbs,
    SectionHeader,
    MatButtonModule,
    MatIconModule,
    Table,
    MarkdownModule,
    Visualization,
    YoutubePlayer,
  ],
  providers: [ActiveSectionService],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export class ContentPage {
  /** Input data for content page */
  readonly data = input.required<ContentPageData>();

  readonly activeSectionService = inject(ActiveSectionService);
  readonly tableService = inject(TableService);

  /** Content data */
  protected readonly content = computed(() => coerceArray(this.data().content));

  /** All nested sections flattened into a single list */
  protected readonly flattenedSections = computed(() =>
    this.flattenSectionContent(this.content()),
  );

  constructor() {
    effect(() => {
      this.activeSectionService.initialize();
      this.activeSectionService.setSections(this.flattenedSections());

      for (const tableContent of this.flattenTableContent(this.content())) {
        void this.tableService.generateTableRows(tableContent);
      }
    });
  }

  protected flattenSectionContent(content: Content[]): PageSection[] {
    const sections: PageSection[] = [];

    for (const item of content) {
      if (item.type !== 'section') {
        continue;
      }

      sections.push(item);
      sections.push(...this.flattenSectionContent(item.content));
    }

    return sections;
  }

  private flattenTableContent(content: Content[]): TableContent[] {
    const tables: TableContent[] = [];

    for (const item of content) {
      if (item.type === 'table') {
        tables.push(item);
        continue;
      }

      if (item.type === 'section') {
        tables.push(...this.flattenTableContent(item.content));
      }
    }

    return tables;
  }
}
