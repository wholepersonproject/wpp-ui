import { describe, expect, it } from 'vitest';
import { getKgMetadataIcons } from './kg-icons';

/** WPP table for the given title and organs */
function table(title: string, organs: string[] = []) {
  return { title, url: `https://purl.wholepersonphysiome.org/wpp/${title}`, organs, type: 'WPP table', typeId: 'wpp' };
}

describe('getKgMetadataIcons', () => {
  it('shows the product icon of the type and the first organ', () => {
    expect(getKgMetadataIcons(table('cardiovascular system', ['heart', 'kidney']))).toEqual([
      { name: 'asctb', label: 'WPP table', type: 'product' },
      { name: 'heart', label: 'Heart + 1 organ', type: 'organ' },
    ]);
  });

  it('prefers an organ named in the title', () => {
    expect(getKgMetadataIcons(table('muscular system', ['knee']))[1]?.name).toBe('muscular-system');
  });

  it('maps organ systems and alternative organ names to organ icons', () => {
    expect(getKgMetadataIcons(table('pulmonary system', ['trachea', 'lung']))[1]?.name).toBe('lungs');
    expect(getKgMetadataIcons(table('immune and lymphatic system', ['brain', 'skin']))[1]?.name).toBe('lymph-nodes');
    expect(getKgMetadataIcons(table('male reproductive system', ['prostate gland', 'skin']))[1]?.name).toBe('prostate');
  });

  it('applies organ overrides', () => {
    const collection = {
      title: 'Whole Person Physiome (WPP)',
      url: 'https://purl.wholepersonphysiome.org/collection/wpp',
      organs: ['fallopian tube', 'pancreas', 'mouth'],
      type: 'Collection',
      typeId: 'collection',
    };

    expect(getKgMetadataIcons(collection)).toEqual([
      { name: 'collections', label: 'Collection', type: 'product' },
      { name: 'all-organs', label: '3 organs', type: 'organ' },
    ]);
  });

  it('falls back to all organs when no organ applies', () => {
    expect(getKgMetadataIcons(table('glucose homeostasis'))[1]).toEqual({
      name: 'all-organs',
      label: 'Multiple organs',
      type: 'organ',
    });
  });

  it('labels a single organ without a count', () => {
    expect(getKgMetadataIcons(table('integumentary system', ['skin']))[1]?.label).toBe('Skin');
  });

  it('omits the product icon of an unknown type', () => {
    expect(getKgMetadataIcons({ ...table('heart'), typeId: 'unknown' }).map(({ name }) => name)).toEqual(['heart']);
  });
});
