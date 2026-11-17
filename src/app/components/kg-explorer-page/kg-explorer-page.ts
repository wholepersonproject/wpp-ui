import { Component, input } from '@angular/core';
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
import { getKgGraphUrl, KG_GRAPH_FORMATS, KgDigitalObject, KgGraphFormat } from './kg-digital-objects';

/** Knowledge graph explorer table view of the WPP digital objects */
@Component({
  selector: 'wpp-kg-explorer-page',
  imports: [KgExplorerTableView],
  templateUrl: './kg-explorer-page.html',
  styleUrl: './kg-explorer-page.scss',
})
export class KgExplorerPage {
  /** Digital objects resolved by the route */
  readonly data = input.required<KgDigitalObject[]>();

  /** Table columns, created once so cell templates stay cached */
  readonly columns = [
    kgExplorerLinkColumn<KgDigitalObject>('Digital Object', 'url', { labelProp: 'title' }),
    kgExplorerTextColumn<KgDigitalObject>('Type', 'type'),
    kgExplorerChipColumn<KgDigitalObject>('Organs', 'organs'),
    kgExplorerTextColumn<KgDigitalObject>('Version', 'version'),
    kgExplorerNumberColumn<KgDigitalObject>('#Cell Types', 'cellCount'),
    kgExplorerDateColumn<KgDigitalObject>('Last Updated', 'lastUpdated'),
  ];

  /** Filter menu definitions */
  readonly filters: KgExplorerFilter<KgDigitalObject>[] = [
    { id: 'type', label: 'Type', field: 'type', searchDisabled: true },
    { id: 'organs', label: 'Organs', field: 'organs' },
  ];

  /** Table view configuration */
  readonly config: KgExplorerTableViewConfig<KgDigitalObject, KgGraphFormat> = {
    searchSuggestionField: 'title',
    downloadFormats: KG_GRAPH_FORMATS,
  };

  /** Opens the latest graph of a digital object in the chosen format */
  download({ item, format }: KgExplorerDownloadRequest<KgDigitalObject, KgGraphFormat>): void {
    window.open(getKgGraphUrl(item, format), '_blank', 'noopener');
  }
}
