import { coerceArray } from '@angular/cdk/coercion';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsEventCategory } from '@atlasng/analytics/events';
import { AnalyticsPermissionsManager } from '@atlasng/analytics/permissions';
import { Breadcrumbs } from '@atlasng/design-system/buttons/breadcrumbs';
import { BasicProfileCard } from '@atlasng/design-system/cards/basic-profile-card';
import { ContentHeader } from '@atlasng/design-system/content/content-header';
import { Notice, NoticeVariant } from '@atlasng/design-system/indicators/notice';
import { YouTubePlayer, YouTubePlayerEnableRequest } from '@atlasng/design-system/youtube-player';
import { GridContainer } from '@atlasng/labs/grid-container';
import { MarkdownModule } from 'ngx-markdown';
import { Visualization } from '../visualization/visualization';
import { ActiveSectionService } from './active-section-service';
import { ContentCardGrid, ContentCardGridContent } from './content-card-grid/content-card-grid';
import { DataTable } from './data-table/data-table';
import { EmailContact, EmailContactContent } from './email-contact/email-contact';
import { TableContent, TableService } from './table-service';

interface MarkdownContent {
  type: 'markdown';
  data: string;
}

/** Highlighted message box whose body is rendered as markdown */
interface NoticeContent {
  type: 'notice';
  data: string;
  /** Tone of the notice; defaults to `info` */
  variant?: NoticeVariant;
  /** Optional title shown above the body */
  tagline?: string;
}

interface ButtonContent {
  type: 'button';
  text: string;
  route: string;
  icon?: string;
  download?: boolean;
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

interface GridContent {
  type: 'grid';
  content: Card[];
}

interface Card {
  type: 'profile-card';
  name: string;
  description: string;
  pictureUrl: string;
  nameLink?: string;
}

type Content =
  | PageSection
  | MarkdownContent
  | NoticeContent
  | ButtonContent
  | TableContent
  | ImageContent
  | YoutubeContent
  | VisualizationContent
  | GridContent
  | EmailContactContent
  | ContentCardGridContent;

interface PageSection {
  type: 'section';
  tagline: string;
  anchor: string;
  level: number;
  content: Content[];
  underline?: boolean;
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
    ContentHeader,
    MatButtonModule,
    MatIconModule,
    DataTable,
    MarkdownModule,
    Notice,
    Visualization,
    YouTubePlayer,
    YouTubePlayerEnableRequest,
    GridContainer,
    BasicProfileCard,
    ContentCardGrid,
    EmailContact,
  ],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
  providers: [ActiveSectionService],
})
export class ContentPage {
  /** Input data for content page */
  readonly data = input.required<ContentPageData>();

  readonly activeSectionService = inject(ActiveSectionService);
  readonly tableService = inject(TableService);
  private readonly permissionsManager = inject(AnalyticsPermissionsManager);

  /** Content data */
  protected readonly content = computed(() => coerceArray(this.data().content));

  /** All nested sections flattened into a single list */
  protected readonly flattenedSections = computed(() => this.flattenSectionContent(this.content()));

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

  protected enableMarketingPermissions(): void {
    this.permissionsManager.updatePermissions((permissions) =>
      permissions.enableCategory(AnalyticsEventCategory.Marketing),
    );
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
