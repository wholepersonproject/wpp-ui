import { Service, signal } from '@angular/core';
import { parse } from 'papaparse';

type CsvRow = Record<string, string>;

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
  /** Parses values as numbers, right-aligns them, and includes them in the totals row */
  numeric?: boolean;
}

/** Table row keyed by CSV column name */
export type TableRow = Record<string, string | number>;

export interface TableContent {
  type: 'table';
  url: string;
  columns: TableColumnConfig[];
  /** Appends a totals row summing every numeric column */
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
    return new Promise((resolve) => {
      parse<CsvRow>(tableContent.url, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: (result) => {
          resolve(result.data.map((row) => this.toTableRow(row, tableContent.columns)));
        },
      });
    });
  }

  private toTableRow(csvRow: CsvRow, columns: TableColumnConfig[]): TableRow {
    const tableRow: TableRow = {};
    for (const column of columns) {
      const rawValue = this.getCsvValue(csvRow, column.column);
      tableRow[column.column] = this.coerceCsvValue(rawValue, column.numeric);
      if (column.urlColumn) {
        tableRow[column.urlColumn] = this.getCsvValue(csvRow, column.urlColumn);
      }
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
