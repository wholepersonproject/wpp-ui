import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { getKgMetadataUrl, KG_DIGITAL_OBJECTS_URL, KgDigitalObject, parseKgDigitalObjects } from './kg-digital-objects';
import {
  addKgTerms,
  KG_ASCTB_TERMS_URL,
  KG_TERMS_INDEX_URL,
  KgExplorerItem,
  parseKgTerms,
  parseKgTermsIndex,
} from './kg-terms';

/** Loads the knowledge graph digital objects and their metadata */
@Service()
export class KgDataService {
  /** Fetches the listing and metadata */
  private readonly http = inject(HttpClient);

  /** Digital object listing, loaded once and shared by the table and metadata pages */
  readonly digitalObjects$: Observable<KgDigitalObject[]> = this.http
    .get(KG_DIGITAL_OBJECTS_URL)
    .pipe(map(parseKgDigitalObjects), shareReplay({ bufferSize: 1, refCount: false }));

  /** Digital objects with their anatomical structures, cell types, and biomarkers, for the explorer table */
  readonly explorerItems$: Observable<KgExplorerItem[]> = combineLatest([
    this.digitalObjects$,
    this.http.get(KG_ASCTB_TERMS_URL).pipe(map(parseKgTerms)),
    this.http.get(KG_TERMS_INDEX_URL).pipe(map(parseKgTermsIndex)),
  ]).pipe(
    map(([items, terms, index]) => addKgTerms(items, terms, index)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

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
