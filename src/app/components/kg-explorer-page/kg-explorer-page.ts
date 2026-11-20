import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, inject, input, signal, ViewEncapsulation } from '@angular/core';
import type { SortPropDir } from '@atlasng/design-system/table';
import {
  KgExplorerDownloadRequest,
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
import { getKgGraphFileName, getKgGraphUrl, KG_GRAPH_FORMATS, KgGraphFormat } from './kg-digital-objects';
import { KgExplorerFiltersService } from './kg-explorer-filters.service';
import { KgExplorerItem } from './kg-terms';

/**
 * Sizes a column between the design's minimum and maximum widths. Columns grow from their minimum and share the
 * table's remaining width, each stopping at its maximum.
 *
 * @param minWidth Minimum width in pixels
 * @param maxWidth Maximum width in pixels
 * @returns Column overrides
 */
function specWidth(minWidth: number, maxWidth: number) {
  return { fitContent: false, minWidth, maxWidth, flexGrow: 1 };
}

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

  /** Saves graph files */
  private readonly fileDownload = inject(FileDownloadService);

  /** Digital objects with their terms, resolved by the route */
  readonly data = input.required<KgExplorerItem[]>();

  /** Table columns with the design's minimum and maximum widths, created once so cell templates stay cached */
  readonly columns = [
    kgExplorerLinkColumn<KgExplorerItem>('Digital objects', 'path', { labelProp: 'title' }, specWidth(140, 336)),
    kgExplorerTextColumn<KgExplorerItem>('Digital object types', 'type', specWidth(140, 192)),
    kgExplorerChipColumn<KgExplorerItem>('Organs', 'organLabels', specWidth(248, 500)),
    kgExplorerNumberColumn<KgExplorerItem>('#Cell types', 'cellCount', specWidth(96, 128)),
    kgExplorerNumberColumn<KgExplorerItem>('#Biomarker types', 'biomarkerCount', specWidth(132, 164)),
    kgExplorerDateColumn<KgExplorerItem>('Last published', 'lastUpdated', specWidth(136, 144)),
  ];

  /** Column sorts, sorted by digital object title by default */
  readonly sorts = signal<SortPropDir[]>([{ prop: 'path', dir: 'asc' }]);

  /** Filter menu definitions */
  readonly filters: KgExplorerFilter<KgExplorerItem>[] = [
    { id: 'type', label: 'Digital objects', field: 'type' },
    { id: 'organs', label: 'Organs', field: 'organs' },
    {
      id: 'anatomicalStructures',
      label: 'Anatomical structures',
      field: 'anatomicalStructures',
    },
    { id: 'cellTypes', label: 'Cell types', field: 'cellTypes' },
    { id: 'biomarkerTypes', label: 'Biomarkers', field: 'biomarkers' },
  ];

  /** Table view configuration */
  readonly config: KgExplorerTableViewConfig<KgExplorerItem, KgGraphFormat> = {
    searchSuggestionField: 'title',
    downloadFormats: KG_GRAPH_FORMATS,
    filterOptions: {
      breadcrumbs: [{ name: 'Home', command: '/' }, { name: 'Knowledge Graph Explorer' }],
    },
  };

  /** Shows the header's filter toggle and moves the footer into the table view while it is displayed */
  constructor() {
    this.filtersMenu.available.set(true);
    this.pageFooter.inPage.set(true);
    inject(DestroyRef).onDestroy(() => {
      this.filtersMenu.available.set(false);
      this.pageFooter.inPage.set(false);
    });
  }

  /** Saves the latest graph of a digital object in the chosen format */
  download({ item, format }: KgExplorerDownloadRequest<KgExplorerItem, KgGraphFormat>): void {
    void this.fileDownload.download(
      getKgGraphUrl(item, item.version, format),
      getKgGraphFileName(item, item.version, format),
    );
  }
}
