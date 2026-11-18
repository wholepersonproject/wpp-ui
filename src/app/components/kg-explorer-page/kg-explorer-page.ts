import { Component, DestroyRef, inject, input, signal } from '@angular/core';
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
import {
  getKgGraphFileName,
  getKgGraphUrl,
  KG_GRAPH_FORMATS,
  KgDigitalObject,
  KgGraphFormat,
} from './kg-digital-objects';
import { KgExplorerFiltersService } from './kg-explorer-filters.service';

/** Knowledge graph explorer table view of the WPP digital objects */
@Component({
  selector: 'wpp-kg-explorer-page',
  imports: [KgExplorerTableView],
  templateUrl: './kg-explorer-page.html',
  styleUrl: './kg-explorer-page.scss',
})
export class KgExplorerPage {
  /** Filter menu state, toggled from the app header */
  protected readonly filtersMenu = inject(KgExplorerFiltersService);

  /** Saves graph files */
  private readonly fileDownload = inject(FileDownloadService);

  /** Digital objects resolved by the route */
  readonly data = input.required<KgDigitalObject[]>();

  /** Table columns, created once so cell templates stay cached */
  readonly columns = [
    kgExplorerLinkColumn<KgDigitalObject>('Digital objects', 'path', { labelProp: 'title' }),
    kgExplorerTextColumn<KgDigitalObject>('Digital object types', 'type'),
    kgExplorerChipColumn<KgDigitalObject>('Organs', 'organLabels'),
    kgExplorerNumberColumn<KgDigitalObject>('#Cell types', 'cellCount'),
    kgExplorerNumberColumn<KgDigitalObject>('#Biomarker types', 'biomarkerCount'),
    kgExplorerDateColumn<KgDigitalObject>('Last published', 'lastUpdated'),
  ];

  /** Column sorts, sorted by digital object title by default */
  readonly sorts = signal<SortPropDir[]>([{ prop: 'path', dir: 'asc' }]);

  /** Filter menu definitions */
  readonly filters: KgExplorerFilter<KgDigitalObject>[] = [
    { id: 'type', label: 'Type', field: 'type', disableSearch: true },
    { id: 'organs', label: 'Organs', field: 'organs' },
  ];

  /** Table view configuration */
  readonly config: KgExplorerTableViewConfig<KgDigitalObject, KgGraphFormat> = {
    searchSuggestionField: 'title',
    downloadFormats: KG_GRAPH_FORMATS,
  };

  /** Shows the header's filter toggle while the table view is displayed */
  constructor() {
    this.filtersMenu.available.set(true);
    inject(DestroyRef).onDestroy(() => this.filtersMenu.available.set(false));
  }

  /** Saves the latest graph of a digital object in the chosen format */
  download({ item, format }: KgExplorerDownloadRequest<KgDigitalObject, KgGraphFormat>): void {
    void this.fileDownload.download(
      getKgGraphUrl(item, item.version, format),
      getKgGraphFileName(item, item.version, format),
    );
  }
}
