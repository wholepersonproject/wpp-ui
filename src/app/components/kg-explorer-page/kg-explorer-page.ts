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
import { getKgGraphFileName, getKgGraphUrl, KG_GRAPH_FORMATS, KgGraphFormat } from './kg-digital-objects';
import { KgExplorerFiltersService } from './kg-explorer-filters.service';
import { KgExplorerItem } from './kg-terms';

/** Knowledge graph explorer table view of the WPP digital objects */
@Component({
  selector: 'wpp-kg-explorer-page',
  imports: [KgExplorerTableView],
  templateUrl: './kg-explorer-page.html',
  styleUrl: './kg-explorer-page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class KgExplorerPage {
  /** Filter menu state, toggled from the app header */
  protected readonly filtersMenu = inject(KgExplorerFiltersService);

  /** Saves graph files */
  private readonly fileDownload = inject(FileDownloadService);

  /** Digital objects with their terms, resolved by the route */
  readonly data = input.required<KgExplorerItem[]>();

  /** Table columns, created once so cell templates stay cached */
  readonly columns = [
    kgExplorerLinkColumn<KgExplorerItem>('Digital objects', 'path', { labelProp: 'title' }),
    kgExplorerTextColumn<KgExplorerItem>('Digital object types', 'type'),
    kgExplorerChipColumn<KgExplorerItem>('Organs', 'organLabels'),
    kgExplorerNumberColumn<KgExplorerItem>('#Cell types', 'cellCount'),
    kgExplorerNumberColumn<KgExplorerItem>('#Biomarker types', 'biomarkerCount'),
    kgExplorerDateColumn<KgExplorerItem>('Last published', 'lastUpdated'),
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
      breadcrumbs: [{ name: 'Home', command: '/' }, { name: 'Digital objects' }],
    },
  };

  /** Shows the header's filter toggle while the table view is displayed */
  constructor() {
    this.filtersMenu.available.set(true);
    inject(DestroyRef).onDestroy(() => this.filtersMenu.available.set(false));
  }

  /** Saves the latest graph of a digital object in the chosen format */
  download({ item, format }: KgExplorerDownloadRequest<KgExplorerItem, KgGraphFormat>): void {
    void this.fileDownload.download(
      getKgGraphUrl(item, item.version, format),
      getKgGraphFileName(item, item.version, format),
    );
  }
}
