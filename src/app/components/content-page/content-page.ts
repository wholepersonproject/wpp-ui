import { coerceArray } from '@angular/cdk/coercion';
import { Component, computed, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Breadcrumbs } from '@atlasng/design-system/buttons/breadcrumbs';
import { TextLink } from '@atlasng/design-system/text-link';
import { SectionHeader } from '@atlasng/labs/section-header';
import { Table } from '@atlasng/labs/table';
import { MarkdownModule } from 'ngx-markdown';
import { parse } from 'papaparse';
export type TableRow = Record<string, string | number | TableCell>;

export type TableCell = {
  label: string | number;
  link?: string;
};

export type TableColumn = {
  column: string;
  label: string;
  urlColumn?: string;
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
  url: string;
  columns: TableColumn[];
}

type Content = PageSection | MarkdownContent | ButtonContent | TableContent | ImageContent;
type CsvRow = Record<string, string>;

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
const isTableContent = (content: Content): content is TableContent => content.type === 'table';

@Component({
  selector: 'wpp-content-page',
  imports: [Breadcrumbs, SectionHeader, MatButtonModule, MatIconModule, Table, MarkdownModule, TextLink],
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

  /** Loaded table rows keyed by CSV URL */
  protected readonly tableRowsByUrl = signal<Partial<Record<string, TableRow[]>>>({});

  private readonly tableRowRequests = new Map<string, Promise<TableRow[]>>();

  constructor() {
    effect(() => {
      for (const tableContent of this.flattenTableContent(this.content())) {
        void this.generateTableRows(tableContent);
      }
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

  protected getTableRows(tableContent: TableContent): TableRow[] {
    return this.tableRowsByUrl()[tableContent.url] ?? [];
  }

  async generateTableRows(tableContent: TableContent): Promise<TableRow[]> {
    const cachedRows = this.tableRowsByUrl()[tableContent.url];

    if (cachedRows) {
      return cachedRows;
    }

    const pendingRows = this.tableRowRequests.get(tableContent.url);

    if (pendingRows) {
      return pendingRows;
    }

    const request = this.fetchCsvTableRows(tableContent)
      .then((rows) => {
        this.tableRowsByUrl.update((rowsByUrl) => ({
          ...rowsByUrl,
          [tableContent.url]: rows,
        }));
        return rows;
      })
      .finally(() => {
        this.tableRowRequests.delete(tableContent.url);
      });

    this.tableRowRequests.set(tableContent.url, request);
    return request;
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

  private fetchCsvTableRows(tableContent: TableContent): Promise<TableRow[]> {
    return new Promise((resolve) => {
      parse<CsvRow>(tableContent.url, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: (result) => {
          resolve(result.data.map((row) => this.toTableRow(row, tableContent.columns)));
        }
      });
    });
  }

  private toTableRow(csvRow: CsvRow, columns: TableColumn[]): TableRow {
    const tableRow: TableRow = {};

    for (const column of columns) {
      const rawValue = this.getCsvValue(csvRow, column.column);
      const value = this.coerceCsvValue(rawValue, column.numeric);

      if (column.urlColumn) {
        const link = this.getCsvValue(csvRow, column.urlColumn);
        tableRow[column.column] = link ? { label: value, link } : value;
        continue;
      }

      tableRow[column.column] = value;
    }

    return tableRow;
  }

  private getCsvValue(csvRow: CsvRow, column: string): string {
    return (csvRow[column] ?? '').trim();
  }

  private coerceCsvValue(value: string, numeric?: boolean): string | number {
    if (!numeric || value === '') {
      return value;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : value;
  }
}
