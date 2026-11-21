import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { SortPropDir } from '@atlasng/design-system/table';
import {
  KgExplorerDownloadHeaderCellDefinition,
  KgExplorerFilter,
  kgExplorerChipColumn,
  kgExplorerDateColumn,
  kgExplorerLinkColumn,
  kgExplorerNumberColumn,
  kgExplorerTextColumn,
  KgExplorerTableView,
  KgExplorerTableViewConfig,
} from '@atlasng/kg-explorer';
import { FileDownloadService } from '../../file-download.service';
import { PageFooterService } from '../../page-footer.service';
import { KgDataService } from './kg-data.service';
import { getKgFileName, getKgFileUrl, KG_GRAPH_FORMATS, KgFileFormat } from './kg-digital-objects';
import { KgDownloadCellDefinition } from './kg-download-cell';
import { KG_EXPLORER_FILTERS_DOCK_BREAKPOINT, KgExplorerFiltersService } from './kg-explorer-filters.service';
import { FilterDialogTitle, setFilterDialogTitles } from './kg-filter-dialog-titles';
import { KgExplorerItem } from './kg-terms';

/**
 * Sizes a column between a minimum and maximum width. Columns grow from their minimum and share the
 * table's remaining width, each stopping at its maximum.
 *
 * @param minWidth Minimum width in pixels
 * @param maxWidth Maximum width in pixels
 * @returns Column overrides
 */
function specWidth(minWidth: number, maxWidth: number) {
  return { fitContent: false, minWidth, maxWidth, flexGrow: 1 };
}

/** Wraps a hugging column's header to two lines on screens narrower than 1919px */
const TWO_LINE_HEADER = { headerClass: 'two-line-header' };

/**
 * Filter menu definitions, with the titles of their full-screen dialogs below 960px.
 *
 * TODO(cns-iu/AtlasNG#515): drop `FilterDialogTitle` and `setFilterDialogTitles` once filters accept `dialogTitle`
 */
const FILTERS: (KgExplorerFilter<KgExplorerItem> & FilterDialogTitle)[] = [
  { id: 'type', label: 'Digital object types', dialogTitle: 'Digital object type filters', field: 'type' },
  { id: 'organs', label: 'Organs', dialogTitle: 'Organ filters', field: 'organs' },
  {
    id: 'anatomicalStructures',
    label: 'Anatomical structures',
    dialogTitle: 'Anatomical structure filters',
    field: 'anatomicalStructures',
  },
  { id: 'cellTypes', label: 'Cell types', dialogTitle: 'Cell type filters', field: 'cellTypes' },
  { id: 'biomarkerTypes', label: 'Biomarker types', dialogTitle: 'Biomarker filters', field: 'biomarkers' },
];

setFilterDialogTitles(FILTERS);

/** Knowledge graph explorer table view of the WPP digital objects */
@Component({
  selector: 'wpp-kg-explorer-page',
  imports: [KgExplorerTableView, NgTemplateOutlet],
  templateUrl: './kg-explorer-page.html',
  styleUrl: './kg-explorer-page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KgExplorerPage {
  /** Filter menu state, toggled from the app header */
  protected readonly filtersMenu = inject(KgExplorerFiltersService);

  /** App footer, rendered at the end of the table view's scroll area */
  protected readonly pageFooter = inject(PageFooterService);

  /** Saves the digital objects' files */
  private readonly fileDownload = inject(FileDownloadService);

  /** Files of each digital object by IRI, loaded after the table renders */
  private readonly files = toSignal(inject(KgDataService).files$);

  /** Digital objects with their terms, resolved by the route */
  readonly data = input.required<KgExplorerItem[]>();

  /**
   * Table columns, created once so cell templates stay cached. Text columns grow to the design's maximum widths,
   * and their minimums keep each header to two lines at most. Number and date columns hug their header, which wraps
   * to two lines below 1919px. The minimums fit the table beside the docked filter drawer on 1366px screens.
   * The download column lists the graph formats until each digital object's files load.
   */
  readonly columns = [
    {
      name: 'Download',
      prop: '$$download',
      width: 40,
      flexGrow: 0,
      sortable: false,
      headerTemplate: KgExplorerDownloadHeaderCellDefinition,
      cellTemplate: KgDownloadCellDefinition,
      cellConfig: {
        labelProp: 'title',
        formats: (row: KgExplorerItem) => this.files()?.get(row.id) ?? KG_GRAPH_FORMATS,
        download: (row: KgExplorerItem, format: KgFileFormat) => this.download(row, format),
      },
    },
    kgExplorerLinkColumn<KgExplorerItem>(
      'Digital object',
      'path',
      { labelProp: 'title' },
      {
        ...specWidth(160, 336),
        cellClass: 'balanced-cell',
      },
    ),
    kgExplorerTextColumn<KgExplorerItem>('Digital object types', 'type', specWidth(136, 192)),
    kgExplorerChipColumn<KgExplorerItem>('Organs', 'organLabels', specWidth(272, 500)),
    kgExplorerNumberColumn<KgExplorerItem>('#Cell types', 'cellCount', TWO_LINE_HEADER),
    kgExplorerNumberColumn<KgExplorerItem>('#Biomarker types', 'biomarkerCount', TWO_LINE_HEADER),
    kgExplorerDateColumn<KgExplorerItem>('Last published', 'lastUpdated', TWO_LINE_HEADER),
  ];

  /** Column sorts, sorted by digital object title by default */
  readonly sorts = signal<SortPropDir[]>([{ prop: 'path', dir: 'asc' }]);

  /** Filter menu definitions */
  readonly filters: KgExplorerFilter<KgExplorerItem>[] = FILTERS;

  /** Table view configuration */
  readonly config: KgExplorerTableViewConfig<KgExplorerItem, KgFileFormat> = {
    searchSuggestionField: 'title',
    filtersDockBreakpoint: KG_EXPLORER_FILTERS_DOCK_BREAKPOINT,
    filterOptions: {
      breadcrumbs: [{ name: 'Home', command: '/' }, { name: 'Knowledge Graph Explorer' }],
    },
  };

  /**
   * Shows the header's filter toggle and moves the footer into the table view while it is displayed. The filter menu
   * starts open when docked, so it doesn't slide in on arrival.
   */
  constructor() {
    this.filtersMenu.available.set(true);
    this.filtersMenu.reset();
    this.pageFooter.inPage.set(true);
    inject(DestroyRef).onDestroy(() => {
      this.filtersMenu.available.set(false);
      this.pageFooter.inPage.set(false);
    });
  }

  /**
   * Saves a file of a digital object's latest version
   *
   * @param item Digital object
   * @param format File to download
   */
  download(item: KgExplorerItem, format: KgFileFormat): void {
    void this.fileDownload.download(
      getKgFileUrl(item, item.version, format),
      getKgFileName(item, item.version, format),
    );
  }
}
