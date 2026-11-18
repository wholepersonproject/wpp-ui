import { Component, computed, inject, input } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import type { BreadcrumbItem } from '@atlasng/design-system/buttons/breadcrumbs';
import type { VersionDownload } from '@atlasng/design-system/version-control';
import { KgExplorerMetadata, KgExplorerMetadataView } from '@atlasng/kg-explorer';
import { catchError, map, of, switchMap } from 'rxjs';
import { FileDownloadService } from '../../file-download.service';
import { KgDataService } from '../kg-explorer-page/kg-data.service';
import {
  getKgGraphFileName,
  getKgGraphUrl,
  KgDigitalObject,
  KgGraphFormat,
} from '../kg-explorer-page/kg-digital-objects';
import { buildKgMetadata } from '../kg-explorer-page/kg-metadata';

/** Data resolved for a digital object's metadata page */
export interface KgMetadataPageData {
  /** Digital object from the listing */
  item: KgDigitalObject;
  /** Page content built from the digital object's metadata */
  metadata: KgExplorerMetadata<KgGraphFormat>;
}

/**
 * Resolves the digital object at `kg-explorer/:type/:name` and its latest metadata.
 * Unknown digital objects show the not found page.
 */
export const kgMetadataResolver: ResolveFn<KgMetadataPageData> = (route) => {
  const service = inject(KgDataService);
  const router = inject(Router);
  const path = `/kg-explorer/${route.paramMap.get('type')}/${route.paramMap.get('name')}`;

  return service.digitalObjects$.pipe(
    switchMap((items) => {
      const item = items.find((candidate) => candidate.path === path);
      if (!item) {
        return of(new RedirectCommand(router.parseUrl('/404'), { skipLocationChange: true }));
      }
      return service.getMetadata(item).pipe(
        catchError(() => of(undefined)),
        map((value) => ({ item, metadata: buildKgMetadata(item, value) })),
      );
    }),
  );
};

/** Metadata page of a knowledge graph digital object */
@Component({
  selector: 'wpp-kg-metadata-page',
  imports: [KgExplorerMetadataView],
  templateUrl: './kg-metadata-page.html',
})
export class KgMetadataPage {
  private readonly fileDownload = inject(FileDownloadService);

  /** Digital object and metadata resolved by the route */
  readonly data = input.required<KgMetadataPageData>();

  /** Home / Knowledge Graph Explorer / [title] */
  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    { name: 'Home', command: '/' },
    { name: 'Knowledge Graph Explorer', command: '/kg-explorer' },
    { name: this.data().metadata.title },
  ]);

  /** Saves the digital object's graph in the chosen version and format */
  download({ item, format }: VersionDownload<KgGraphFormat>): void {
    const digitalObject = this.data().item;
    void this.fileDownload.download(
      getKgGraphUrl(digitalObject, item.label, format),
      getKgGraphFileName(digitalObject, item.label, format),
    );
  }
}
