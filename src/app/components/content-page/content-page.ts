import { coerceArray } from '@angular/cdk/coercion';
import { AfterViewInit, Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumbs } from '@atlasng/design-system/buttons/breadcrumbs';
import { SectionHeader } from '@atlasng/labs/section-header';
import { Table } from '@atlasng/labs/table';
import { MarkdownModule } from 'ngx-markdown';
import { ActiveSectionService } from './active-section-service';
import { TableContent, TableService } from './table-service';

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
  url: string;
}

type Content =
  | PageSection
  | MarkdownContent
  | ButtonContent
  | TableContent
  | ImageContent
  | YoutubeContent;

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

const isPageSection = (content: Content): content is PageSection => content.type === 'section';
const isTableContent = (content: Content): content is TableContent => content.type === 'table';

@Component({
  selector: 'wpp-content-page',
  imports: [
    Breadcrumbs,
    SectionHeader,
    MatButtonModule,
    MatIconModule,
    Table,
    MarkdownModule,
  ],
  providers: [ActiveSectionService],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export class ContentPage implements AfterViewInit {
  /** Input data for content page */
  readonly data = input.required<ContentPageData>();

  readonly activeSectionService = inject(ActiveSectionService);
  readonly tableService = inject(TableService);

  /** Content data */
  protected readonly content = computed(() => coerceArray(this.data().content));

  /** All nested sections flattened into a single list */
  protected readonly flattenedSections = computed(() => this.flattenSectionContent(this.content()));

  constructor() {
    effect(() => {
      this.activeSectionService.setSections(this.flattenedSections());

      for (const tableContent of this.flattenTableContent(this.content())) {
        void this.tableService.generateTableRows(tableContent);
      }
    });
  }

  ngAfterViewInit(): void {
    this.activeSectionService.initialize();
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

  private flattenTableContent(content: Content[]): TableContent[] {
    const tables: TableContent[] = [];

    for (const item of content) {
      if (isTableContent(item)) {
        tables.push(item);
        continue;
      }

      if (isPageSection(item)) {
        tables.push(...this.flattenTableContent(item.content));
      }
    }

    return tables;
  }
}
