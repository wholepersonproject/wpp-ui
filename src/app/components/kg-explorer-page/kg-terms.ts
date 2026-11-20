import { KgDigitalObject } from './kg-digital-objects';

/** URL of the anatomical structure, cell type, and biomarker terms used in the knowledge graph */
export const KG_ASCTB_TERMS_URL = 'https://kg.wholepersonphysiome.org/kg/asctb-terms.json';

/** URL of the index linking terms to the digital objects that use them */
export const KG_TERMS_INDEX_URL = 'https://kg.wholepersonphysiome.org/kg/kg-terms-index.json';

/** Term category: anatomical structure, cell type, or biomarker */
export type KgTermType = 'AS' | 'CT' | 'BM';

/** An anatomical structure, cell type, or biomarker term */
export interface KgTerm {
  /** Term IRI */
  iri: string;
  /** Display label */
  label: string;
  /** Term category */
  type: KgTermType;
}

/** Index linking terms to digital objects, with both sides stored as positions in their lists */
export interface KgTermsIndex {
  /** Term IRIs */
  terms: string[];
  /** Digital object PURLs */
  purls: string[];
  /** Positions in {@link terms} of the terms used by each PURL in {@link purls} */
  purlToTerms: number[][];
}

/** A digital object with the labels of the terms it uses, filterable by term category */
export type KgExplorerItem = KgDigitalObject & {
  /** Labels of the anatomical structures in the digital object */
  anatomicalStructures: string[];
  /** Labels of the cell types in the digital object */
  cellTypes: string[];
  /** Labels of the biomarkers in the digital object */
  biomarkers: string[];
};

/** Term categories published in `asctb_type` */
const TERM_TYPES = new Set<string>(['AS', 'CT', 'BM']);

/**
 * Reports a malformed term file
 *
 * @param message What is wrong, including the path of the value
 * @throws Error describing the problem
 */
function invalid(message: string): never {
  throw new Error(`Invalid knowledge graph terms: ${message}`);
}

/** Whether a value is a list of strings */
function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** Whether a value is a list of lists of integers */
function isIndexLists(value: unknown): value is number[][] {
  return Array.isArray(value) && value.every((list) => Array.isArray(list) && list.every(Number.isInteger));
}

/**
 * Converts the published `asctb-terms.json` list into terms
 *
 * @param value Parsed `asctb-terms.json` document
 * @returns One term per entry
 * @throws Error when an entry is malformed
 */
export function parseKgTerms(value: unknown): KgTerm[] {
  if (!Array.isArray(value)) {
    invalid('asctb-terms.json must be a list.');
  }
  return value.map((entry: unknown, index) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    const { iri, label, asctb_type: type } = record;
    if (typeof iri !== 'string' || typeof label !== 'string' || typeof type !== 'string' || !TERM_TYPES.has(type)) {
      invalid(`[${index}] must have a string iri and label and an asctb_type of AS, CT, or BM.`);
    }
    return { iri, label, type: type as KgTermType };
  });
}

/**
 * Converts the published `kg-terms-index.json` document into a terms index
 *
 * @param value Parsed `kg-terms-index.json` document
 * @returns Terms index
 * @throws Error when the index is malformed
 */
export function parseKgTermsIndex(value: unknown): KgTermsIndex {
  const record = (value ?? {}) as Record<string, unknown>;
  const { terms, purls, purl_to_terms: purlToTerms } = record;
  if (!isStringList(terms) || !isStringList(purls)) {
    invalid('terms and purls must be lists of strings.');
  }
  if (!isIndexLists(purlToTerms) || purlToTerms.length !== purls.length) {
    invalid('purl_to_terms must have a list of term positions for each purl.');
  }
  return { terms, purls, purlToTerms };
}

/**
 * Adds the labels of the terms each digital object uses, matched by its PURL.
 * Digital objects missing from the index get no terms.
 *
 * @param items Digital objects
 * @param terms Terms with their labels and categories
 * @param index Index linking terms to digital objects
 * @returns Digital objects with their anatomical structures, cell types, and biomarkers
 */
export function addKgTerms(items: KgDigitalObject[], terms: KgTerm[], index: KgTermsIndex): KgExplorerItem[] {
  const termsByIri = new Map(terms.map((term) => [term.iri, term]));
  const termsByPurl = new Map(
    index.purls.map((purl, position) => [
      purl,
      index.purlToTerms[position].flatMap((termPosition) => termsByIri.get(index.terms[termPosition]) ?? []),
    ]),
  );

  return items.map((item) => {
    const itemTerms = termsByPurl.get(item.url) ?? [];
    const labels = (type: KgTermType) => [
      ...new Set(itemTerms.filter((term) => term.type === type).map((term) => term.label)),
    ];
    return {
      ...item,
      anatomicalStructures: labels('AS'),
      cellTypes: labels('CT'),
      biomarkers: labels('BM'),
    };
  });
}
