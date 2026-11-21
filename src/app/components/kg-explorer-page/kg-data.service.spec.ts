import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { KgDataService } from './kg-data.service';
import { KG_DIGITAL_OBJECTS_URL } from './kg-digital-objects';

const URINARY = 'https://kg.wholepersonphysiome.org/wpp/urinary-system';
const SCHEMA = 'https://kg.wholepersonphysiome.org/schema/wpp';

/**
 * Listing entry of a digital object
 *
 * @param id Digital object IRI
 * @param doType Digital object type
 */
function entry(id: string, doType: string) {
  return {
    '@id': id,
    title: id,
    purl: id,
    doType,
    doVersion: 'v1',
    versions: ['v1'],
    lastUpdated: '2026-10-28',
  };
}

describe('KgDataService', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it("loads each digital object's files, falling back to the graph formats when metadata fails", async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    const files = firstValueFrom(TestBed.inject(KgDataService).files$);

    http.expectOne(KG_DIGITAL_OBJECTS_URL).flush({ '@graph': [entry(URINARY, 'wpp'), entry(SCHEMA, 'schema')] });
    http.expectOne(`${URINARY}/latest/metadata.json`).flush({
      version: 'v1',
      distributions: [{ downloadUrl: `${URINARY}/v1/graph.ttl` }],
      was_derived_from: { distributions: [{ downloadUrl: `${URINARY}/v1/assets/Urinary_System.csv` }] },
    });
    http.expectOne(`${SCHEMA}/latest/metadata.json`).flush('Not found', { status: 404, statusText: 'Not Found' });

    const byId = await files;
    expect(byId.get(URINARY)?.map(({ label }) => label)).toEqual(['CSV', 'Turtle']);
    expect(byId.get(SCHEMA)?.map(({ label }) => label)).toEqual([
      'JSON',
      'JSON-LD',
      'N-Quads',
      'N-Triples',
      'RDF/XML',
      'Turtle',
    ]);
  });
});
