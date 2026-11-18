import { Component, DestroyRef, inject, input } from '@angular/core';
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
    kgExplorerLinkColumn<KgDigitalObject>('Digital Object', 'path', { labelProp: 'title' }),
    kgExplorerTextColumn<KgDigitalObject>('Type', 'type'),
    kgExplorerChipColumn<KgDigitalObject>('Organs', 'organs'),
    kgExplorerTextColumn<KgDigitalObject>('Version', 'version'),
    kgExplorerNumberColumn<KgDigitalObject>('#Cell Types', 'cellCount'),
    kgExplorerDateColumn<KgDigitalObject>('Last Updated', 'lastUpdated'),
  ];

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
