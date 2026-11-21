import { describe, expect, it } from 'vitest';
import { KG_GRAPH_FORMATS } from './kg-digital-objects';
import { hasDividerAfter } from './kg-download-cell';

const CSV = { label: 'CSV', description: '', path: 'assets/Urinary_System.csv' };

describe('hasDividerAfter', () => {
  it('separates a source CSV listed first from the other formats', () => {
    const formats = [CSV, ...KG_GRAPH_FORMATS];

    expect(formats.map((_, index) => hasDividerAfter(formats, index))).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
  });

  it('adds no divider without a CSV or after a lone CSV', () => {
    expect(KG_GRAPH_FORMATS.some((_, index) => hasDividerAfter(KG_GRAPH_FORMATS, index))).toBe(false);
    expect(hasDividerAfter([CSV], 0)).toBe(false);
  });
});
