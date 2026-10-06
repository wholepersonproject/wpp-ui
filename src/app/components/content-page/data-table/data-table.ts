import { Component, computed, inject, input, TemplateRef, viewChild } from '@angular/core';
import { AnyLink } from '@atlasng/common';
import { TextLink } from '@atlasng/design-system/links/text-link';
import { CellContext, Table, TableColumn } from '@atlasng/design-system/table';
import {
  NumberCellDefinition,
  NumberSummaryCellDefinition,
  TextCellDefinition,
  TextHeaderCellDefinition,
} from '@atlasng/design-system/table/columns';
import { TableColumnConfig, TableContent, TableRow, TableService } from '../table-service';

/** Label shown in the first column of the summary row */
export const TOTALS_ROW_LABEL = 'Total';

/** Minimum width in pixels for sticky columns, which do not grow with the table */
const STICKY_COLUMN_MIN_WIDTH = 240;

/**
 * Renders a CSV-backed table from page content with sortable columns, link cells, and an optional summary row
 * totaling numeric columns.
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

  /** Data rows for the current content */
  protected readonly rows = computed(() => this.tableService.getTableRows(this.content()));

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
  protected readonly columns = computed(() =>
    this.content().columns.map((column, index) => this.createColumn(column, index)),
  );

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

  private createColumn(column: TableColumnConfig, index: number): TableColumn<TableRow> {
    const base: TableColumn<TableRow> = {
      prop: column.column,
      name: column.label.trim(),
      sortable: true,
      frozenLeft: column.sticky,
      minWidth: column.minWidth ?? (column.sticky ? STICKY_COLUMN_MIN_WIDTH : 132),
      headerTemplate: TextHeaderCellDefinition,
      headerConfig: { align: column.numeric ? 'end' : 'start' },
      ...this.createSummary(column, index),
    };

    if (column.urlColumn) {
      return { ...base, cellTemplate: this.linkCellTemplate() };
    }

    return { ...base, cellTemplate: column.numeric ? NumberCellDefinition : TextCellDefinition };
  }

  /**
   * Builds the summary row configuration for a column.
   *
   * @param column Column configuration.
   * @param index Position of the column in the table.
   * @returns A sum for numeric columns, the totals label for a leading text column, and no summary otherwise.
   */
  private createSummary(column: TableColumnConfig, index: number): Partial<TableColumn<TableRow>> {
    if (column.numeric) {
      return { summaryTemplate: NumberSummaryCellDefinition };
    }

    return { summaryFunc: index === 0 ? () => TOTALS_ROW_LABEL : null };
  }
}
