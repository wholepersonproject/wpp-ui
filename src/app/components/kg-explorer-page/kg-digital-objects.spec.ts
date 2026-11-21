import { describe, expect, it } from 'vitest';
import {
  getKgGraphFileName,
  getKgGraphUrl,
  getKgMetadataPagePath,
  getKgMetadataUrl,
  KG_GRAPH_FORMATS,
  parseKgDigitalObjects,
} from './kg-digital-objects';

const URINARY_SYSTEM = {
  '@id': 'https://kg.wholepersonphysiome.org/wpp/urinary-system',
  '@type': 'dcat:Catalog',
  cell_count: '20',
  biomarker_count: '3',
  doVersion: 'v0.20261028',
  organs: ['ureter', 'urinary bladder', 'kidney'],
  title: 'Whole Person Physiome (WPP) table for urinary system',
  doType: 'wpp',
  lastUpdated: '2026-10-28',
  doName: 'urinary-system',
  versions: ['draft', 'v0.20261028'],
  purl: 'https://purl.wholepersonphysiome.org/wpp/urinary-system',
  lod: 'https://kg.wholepersonphysiome.org/wpp/urinary-system/v0.20261028',
};

const SCHEMA = {
  '@id': 'https://kg.wholepersonphysiome.org/schema/wpp',
  versions: ['draft'],
  doVersion: 'draft',
  title: 'wpp linkml schema',
  doType: 'schema',
  lastUpdated: '2026-08-11',
  purl: 'https://purl.wholepersonphysiome.org/schema/wpp',
  lod: 'https://kg.wholepersonphysiome.org/schema/wpp/draft',
};

describe('parseKgDigitalObjects', () => {
  it('converts digital objects into table rows', () => {
    expect(parseKgDigitalObjects({ '@graph': [URINARY_SYSTEM] })).toEqual([
      {
        id: 'https://kg.wholepersonphysiome.org/wpp/urinary-system',
        title: 'Whole Person Physiome (WPP) table for urinary system',
        path: '/kg-explorer/wpp/urinary-system',
        url: 'https://purl.wholepersonphysiome.org/wpp/urinary-system',
        type: 'WPP table',
        typeId: 'wpp',
        organs: ['ureter', 'urinary bladder', 'kidney'],
        organLabels: ['Kidney', 'Ureter', 'Urinary bladder'],
        version: 'v0.20261028',
        versions: ['draft', 'v0.20261028'],
        cellCount: 20,
        biomarkerCount: 3,
        lastUpdated: '2026-10-28',
      },
    ]);
  });

  it('defaults missing organs, cell counts, and biomarker counts', () => {
    const [row] = parseKgDigitalObjects({ '@graph': [SCHEMA] });

    expect(row?.organs).toEqual([]);
    expect(row?.organLabels).toEqual(['Multiple organs']);
    expect(row?.cellCount).toBeUndefined();
    expect(row?.biomarkerCount).toBeUndefined();
    expect(row?.type).toBe('Schema');
  });

  it('capitalizes organ labels', () => {
    const [row] = parseKgDigitalObjects({ '@graph': [{ ...SCHEMA, organs: ['large intestine'] }] });

    expect(row?.organLabels).toEqual(['Large intestine']);
  });

  it('wraps a single organ in a list', () => {
    const [row] = parseKgDigitalObjects({ '@graph': [{ ...SCHEMA, organs: 'kidney' }] });

    expect(row?.organs).toEqual(['kidney']);
  });

  it('rejects documents without a graph', () => {
    expect(() => parseKgDigitalObjects({})).toThrow('@graph must be a list');
  });

  it('rejects digital objects missing required fields', () => {
    expect(() => parseKgDigitalObjects({ '@graph': [{ ...SCHEMA, title: undefined }] })).toThrow(
      '@graph[0].title must be a non-empty string',
    );
  });
});

describe('digital object URLs', () => {
  const item = { id: 'https://kg.wholepersonphysiome.org/wpp/urinary-system' };

  it('builds the metadata page route from the IRI path', () => {
    expect(getKgMetadataPagePath(item.id)).toBe('/kg-explorer/wpp/urinary-system');
  });

  it('points at the latest metadata', () => {
    expect(getKgMetadataUrl(item)).toBe('https://kg.wholepersonphysiome.org/wpp/urinary-system/latest/metadata.json');
  });

  it('points at the graph file of a version', () => {
    const turtle = KG_GRAPH_FORMATS.find((format) => format.extension === 'ttl');

    expect(turtle && getKgGraphUrl(item, 'draft', turtle)).toBe(
      'https://kg.wholepersonphysiome.org/wpp/urinary-system/draft/graph.ttl',
    );
  });

  it('names graph downloads after the digital object and version', () => {
    const turtle = KG_GRAPH_FORMATS.find((format) => format.extension === 'ttl');

    expect(turtle && getKgGraphFileName(item, 'v0.20261028', turtle)).toBe('urinary-system-v0.20261028.ttl');
  });

  it('ignores a trailing slash in the digital object IRI', () => {
    const json = KG_GRAPH_FORMATS.find((format) => format.extension === 'json');

    expect(json && getKgGraphFileName({ id: `${item.id}/` }, 'draft', json)).toBe('urinary-system-draft.json');
  });
});
