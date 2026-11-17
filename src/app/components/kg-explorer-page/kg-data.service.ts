import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { getKgMetadataUrl, KG_DIGITAL_OBJECTS_URL, KgDigitalObject, parseKgDigitalObjects } from './kg-digital-objects';

/** Loads the knowledge graph digital objects and their metadata */
@Service()
export class KgDataService {
  private readonly http = inject(HttpClient);

  /** Digital object listing, loaded once and shared by the table and metadata pages */
  readonly digitalObjects$: Observable<KgDigitalObject[]> = this.http
    .get(KG_DIGITAL_OBJECTS_URL)
    .pipe(map(parseKgDigitalObjects), shareReplay({ bufferSize: 1, refCount: false }));

  /**
   * Loads the metadata of a digital object's latest version
   *
   * @param item Digital object
   * @returns Parsed `metadata.json` content
   */
  getMetadata(item: KgDigitalObject): Observable<unknown> {
    return this.http.get(getKgMetadataUrl(item));
  }
}
