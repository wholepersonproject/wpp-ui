import { describe, expect, it } from 'vitest';
import { getKgGraphUrl, KG_GRAPH_FORMATS, parseKgDigitalObjects } from './kg-digital-objects';

const URINARY_SYSTEM = {
  '@id': 'https://kg.wholepersonphysiome.org/wpp/urinary-system',
  '@type': 'dcat:Catalog',
  cell_count: '20',
  doVersion: 'v0.20261028',
  organs: ['ureter', 'urinary bladder', 'kidney'],
  title: 'Whole Person Physiome (WPP) table for urinary system',
  doType: 'wpp',
  lastUpdated: '2026-10-28',
  doName: 'urinary-system',
  purl: 'https://purl.wholepersonphysiome.org/wpp/urinary-system',
  lod: 'https://kg.wholepersonphysiome.org/wpp/urinary-system/v0.20261028',
};

const SCHEMA = {
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
        title: 'Whole Person Physiome (WPP) table for urinary system',
        url: 'https://purl.wholepersonphysiome.org/wpp/urinary-system',
        type: 'WPP Table',
        organs: ['ureter', 'urinary bladder', 'kidney'],
        version: 'v0.20261028',
        cellCount: 20,
        lastUpdated: '2026-10-28',
        latestVersionUrl: 'https://kg.wholepersonphysiome.org/wpp/urinary-system/v0.20261028',
      },
    ]);
  });

  it('defaults missing organs and cell counts', () => {
    const [row] = parseKgDigitalObjects({ '@graph': [SCHEMA] });

    expect(row?.organs).toEqual([]);
    expect(row?.cellCount).toBeUndefined();
    expect(row?.type).toBe('Schema');
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

describe('getKgGraphUrl', () => {
  it('points at the graph file of the latest version', () => {
    const [row] = parseKgDigitalObjects({ '@graph': [URINARY_SYSTEM] });
    const turtle = KG_GRAPH_FORMATS.find((format) => format.extension === 'ttl');

    expect(row && turtle && getKgGraphUrl(row, turtle)).toBe(
      'https://kg.wholepersonphysiome.org/wpp/urinary-system/v0.20261028/graph.ttl',
    );
  });
});
