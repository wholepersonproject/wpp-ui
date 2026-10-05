import { Component, computed, inject, input, signal, TemplateRef, viewChild } from '@angular/core';
import { AnyLink } from '@atlasng/common';
import { TextLink } from '@atlasng/design-system/links/text-link';
import { CellContext, SortPropDir, Table, TableColumn } from '@atlasng/design-system/table';
import {
  NumberCellDefinition,
  TextCellDefinition,
  TextHeaderCellDefinition,
} from '@atlasng/design-system/table/columns';
import { TableColumnConfig, TableContent, TableRow, TableService } from '../table-service';

/** Label shown in the first column of the totals row */
export const TOTALS_ROW_LABEL = 'Total';

/** Minimum width in pixels for sticky columns, which do not grow with the table */
const STICKY_COLUMN_MIN_WIDTH = 240;

/** Keeps the built-in datatable sort from reordering rows; sorting is applied by {@link DataTable} instead. */
const PRESERVE_ORDER_COMPARATOR = (): number => 0;

/**
 * Compares two cell values, ordering numbers numerically and everything else as natural-order text.
 *
 * @param a First cell value.
 * @param b Second cell value.
 * @returns A negative, zero, or positive number like `Array.prototype.sort` comparators.
 */
function compareCellValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
}

/**
 * Renders a CSV-backed table from page content with sortable columns, link cells, and an optional totals row.
 *
 * Rows are sorted here rather than by the underlying datatable so the totals row always stays last.
 */
@Component({
  selector: 'wpp-data-table',
  imports: [AnyLink, Table, TextLink],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  /** Table content loaded from a page's YAML file */
  readonly content = input.required<TableContent>();

  private readonly tableService = inject(TableService);

  /** Body cell template for columns with an associated link column */
  private readonly linkCellTemplate = viewChild.required<TemplateRef<CellContext<TableRow>>>('linkCell');

  /** Active sort state, two-way bound to the table */
  protected readonly sorts = signal<SortPropDir[]>([]);

  /** Totals row for the current content, if enabled */
  protected readonly totalsRow = computed(() => {
    const { footer, columns } = this.content();
    return footer ? this.createTotalsRow(this.tableService.getTableRows(this.content()), columns) : undefined;
  });

  /** Data rows sorted by the active sort state, followed by the totals row */
  protected readonly rows = computed(() => {
    const rows = this.sortRows(this.tableService.getTableRows(this.content()), this.sorts());
    const totalsRow = this.totalsRow();
    return totalsRow ? [...rows, totalsRow] : rows;
  });

  /** Link column names keyed by the value column they belong to */
  private readonly linkColumns = computed(
    () =>
      new Map(
        this.content()
          .columns.filter((column) => column.urlColumn)
          .map((column) => [column.column, column.urlColumn]),
      ),
  );

  /** Table column definitions derived from the content's column configuration */
  protected readonly columns = computed(() => this.content().columns.map((column) => this.createColumn(column)));

  /**
   * Returns the link for a link cell, if the row has one.
   *
   * @param row Row being rendered.
   * @param prop Value column of the cell.
   * @returns The link URL, or `undefined` when the cell should render as plain text.
   */
  protected getLink(row: TableRow, prop: string): string | undefined {
    const urlColumn = this.linkColumns().get(prop);
    const link = urlColumn ? row[urlColumn] : undefined;
    return link ? String(link) : undefined;
  }

  private createColumn(column: TableColumnConfig): TableColumn<TableRow> {
    const cellClass = ({ row }: { row: TableRow }) => (row === this.totalsRow() ? 'wpp-data-table-totals-cell' : '');
    const base: TableColumn<TableRow> = {
      prop: column.column,
      name: column.label.trim(),
      sortable: true,
      comparator: PRESERVE_ORDER_COMPARATOR,
      frozenLeft: column.sticky,
      minWidth: column.sticky ? STICKY_COLUMN_MIN_WIDTH : undefined,
      cellClass,
      headerTemplate: TextHeaderCellDefinition,
      headerConfig: { align: column.numeric ? 'end' : 'start' },
    };

    if (column.urlColumn) {
      return { ...base, cellTemplate: this.linkCellTemplate() };
    }

    return { ...base, cellTemplate: column.numeric ? NumberCellDefinition : TextCellDefinition };
  }

  private sortRows(rows: TableRow[], sorts: SortPropDir[]): TableRow[] {
    if (sorts.length === 0) {
      return rows;
    }

    return [...rows].sort((rowA, rowB) => {
      for (const { prop, dir } of sorts) {
        const comparison = compareCellValues(rowA[prop], rowB[prop]);
        if (comparison !== 0) {
          return dir === 'desc' ? -comparison : comparison;
        }
      }

      return 0;
    });
  }

  private createTotalsRow(rows: TableRow[], columns: TableColumnConfig[]): TableRow {
    const totalsRow: TableRow = {};
    columns.forEach((column, index) => {
      if (column.numeric) {
        totalsRow[column.column] = rows.reduce(
          (total, row) => total + (typeof row[column.column] === 'number' ? (row[column.column] as number) : 0),
          0,
        );
      } else {
        totalsRow[column.column] = index === 0 ? TOTALS_ROW_LABEL : '';
      }
    });

    return totalsRow;
  }
}
