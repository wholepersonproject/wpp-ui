import { Service, signal } from '@angular/core';
import { parse } from 'papaparse';

/** Column configuration for a table loaded from a page's YAML file */
export interface TableColumnConfig {
  /** CSV column holding the cell value */
  column: string;
  /** Header label */
  label: string;
  /** CSV column holding a link for the cell; cells without a link render as plain text */
  urlColumn?: string;
  /** Keeps the column visible while scrolling horizontally */
  sticky?: boolean;
  /** Parses values as numbers, right-aligns them, and sums them in the summary row */
  numeric?: boolean;
  /** Minimum width of the column in pixels */
  minWidth?: number;
}

/** Table row keyed by CSV column name; empty numeric cells are `null` */
export type TableRow = Record<string, string | number | null>;

export interface TableContent {
  type: 'table';
  url: string;
  columns: TableColumnConfig[];
  /** Shows a summary row totaling every numeric column */
  footer?: boolean;
}

@Service()
export class TableService {
  /** Loaded table rows keyed by CSV URL */
  protected readonly tableRowsByUrl = signal<Partial<Record<string, TableRow[]>>>({});

  private readonly tableRowRequests = new Map<string, Promise<TableRow[]>>();

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

  getTableRows(tableContent: TableContent): TableRow[] {
    return this.tableRowsByUrl()[tableContent.url] ?? [];
  }

  private fetchCsvTableRows(tableContent: TableContent): Promise<TableRow[]> {
    const numericColumns = new Set(
      tableContent.columns.filter((column) => column.numeric).map((column) => column.column),
    );

    return new Promise((resolve) => {
      parse<TableRow>(tableContent.url, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        transform: (value) => value.trim(),
        dynamicTyping: (field) => numericColumns.has(String(field)),
        complete: (result) => resolve(result.data),
      });
    });
  }
}
