import { Injectable, signal } from '@angular/core';
import { parse } from 'papaparse';

type CsvRow = Record<string, string>;

type TableColumn = {
  column: string;
  label: string;
  urlColumn?: string;
  sticky?: boolean;
  numeric?: boolean;
};

type TableRow = Record<string, string | number | TableCell>;

type TableCell = {
  label: string | number;
  link?: string;
};

export interface TableContent {
  type: 'table';
  url: string;
  columns: TableColumn[];
  footer?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TableService {
  /** Loaded table rows keyed by CSV URL */
  protected readonly tableRowsByUrl = signal<
    Partial<Record<string, TableRow[]>>
  >({});

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
          resolve(
            result.data.map((row) =>
              this.toTableRow(row, tableContent.columns),
            ),
          );
        },
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
