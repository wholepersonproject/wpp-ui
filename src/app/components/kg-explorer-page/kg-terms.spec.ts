import { describe, expect, it } from 'vitest';
import { KgDigitalObject } from './kg-digital-objects';
import { addKgTerms, parseKgTerms, parseKgTermsIndex } from './kg-terms';

const KIDNEY = 'http://purl.obolibrary.org/obo/UBERON_0002113';
const PODOCYTE = 'http://purl.obolibrary.org/obo/CL_0000653';
const NPHS1 = 'http://identifiers.org/hgnc/7908';
const URINARY_PURL = 'https://purl.wholepersonphysiome.org/wpp/urinary-system';
const SCHEMA_PURL = 'https://purl.wholepersonphysiome.org/schema/wpp';

const TERMS_JSON = [
  { asctb_type: 'AS', iri: KIDNEY, label: 'kidney' },
  { asctb_type: 'CT', iri: PODOCYTE, label: 'podocyte' },
  { asctb_type: 'BM', iri: NPHS1, label: 'NPHS1' },
];

const INDEX_JSON = {
  terms: [KIDNEY, PODOCYTE, NPHS1],
  purls: [URINARY_PURL],
  term_to_purls: [[0], [0], [0]],
  purl_to_terms: [[0, 1, 2]],
};

/** Builds a digital object row with only the fields term matching reads */
function row(url: string): KgDigitalObject {
  return { url } as KgDigitalObject;
}

describe('parseKgTerms', () => {
  it('converts entries into terms', () => {
    expect(parseKgTerms(TERMS_JSON)).toEqual([
      { iri: KIDNEY, label: 'kidney', type: 'AS' },
      { iri: PODOCYTE, label: 'podocyte', type: 'CT' },
      { iri: NPHS1, label: 'NPHS1', type: 'BM' },
    ]);
  });

  it('rejects a document that is not a list', () => {
    expect(() => parseKgTerms({})).toThrow('asctb-terms.json must be a list.');
  });

  it.each([null, { iri: KIDNEY, label: 'kidney' }, { iri: KIDNEY, label: 'kidney', asctb_type: 'XX' }])(
    'rejects a malformed entry: %o',
    (entry) => {
      expect(() => parseKgTerms([entry])).toThrow('[0] must have');
    },
  );
});

describe('parseKgTermsIndex', () => {
  it('converts the index', () => {
    expect(parseKgTermsIndex(INDEX_JSON)).toEqual({
      terms: [KIDNEY, PODOCYTE, NPHS1],
      purls: [URINARY_PURL],
      purlToTerms: [[0, 1, 2]],
    });
  });

  it.each([null, { ...INDEX_JSON, terms: [1] }, { ...INDEX_JSON, purls: 'x' }])(
    'rejects missing or non-string terms and purls: %o',
    (value) => {
      expect(() => parseKgTermsIndex(value)).toThrow('terms and purls must be lists of strings.');
    },
  );

  it.each([
    { ...INDEX_JSON, purl_to_terms: undefined },
    { ...INDEX_JSON, purl_to_terms: [] },
    { ...INDEX_JSON, purl_to_terms: [['0']] },
  ])('rejects malformed purl_to_terms: %o', (value) => {
    expect(() => parseKgTermsIndex(value)).toThrow('purl_to_terms must have a list of term positions for each purl.');
  });
});

describe('addKgTerms', () => {
  const terms = parseKgTerms(TERMS_JSON);

  it('adds the term labels of each digital object by category', () => {
    const [item] = addKgTerms([row(URINARY_PURL)], terms, parseKgTermsIndex(INDEX_JSON));
    expect(item).toMatchObject({ anatomicalStructures: ['kidney'], cellTypes: ['podocyte'], biomarkers: ['NPHS1'] });
  });

  it('gives digital objects missing from the index no terms', () => {
    const [item] = addKgTerms([row(SCHEMA_PURL)], terms, parseKgTermsIndex(INDEX_JSON));
    expect(item).toMatchObject({ anatomicalStructures: [], cellTypes: [], biomarkers: [] });
  });

  it('skips unknown terms and repeated labels', () => {
    const index = parseKgTermsIndex({
      terms: [KIDNEY, 'http://example.org/unknown', KIDNEY],
      purls: [URINARY_PURL],
      purl_to_terms: [[0, 1, 2]],
    });
    const [item] = addKgTerms([row(URINARY_PURL)], terms, index);
    expect(item).toMatchObject({ anatomicalStructures: ['kidney'], cellTypes: [], biomarkers: [] });
  });
});
