import {
  JSON_FILE_FORMAT,
  JSON_LD_FILE_FORMAT,
  N_QUADS_FILE_FORMAT,
  N_TRIPLES_FILE_FORMAT,
  RDF_XML_FILE_FORMAT,
  TURTLE_FILE_FORMAT,
  VersionControlFileFormat,
} from '@atlasng/design-system/version-control';

/** URL of the knowledge graph digital object listing */
export const KG_DIGITAL_OBJECTS_URL = 'https://kg.wholepersonphysiome.org/kg/digital-objects.jsonld';

/** A graph download format with the file extension it is served under */
export interface KgGraphFormat extends VersionControlFileFormat {
  /** Extension of the graph file in a version directory, e.g. `ttl` for `graph.ttl` */
  extension: string;
}

/** Graph serializations published for every digital object version */
export const KG_GRAPH_FORMATS: KgGraphFormat[] = [
  { ...JSON_LD_FILE_FORMAT, extension: 'jsonld' },
  { ...TURTLE_FILE_FORMAT, extension: 'ttl' },
  { ...N_TRIPLES_FILE_FORMAT, extension: 'nt' },
  { ...N_QUADS_FILE_FORMAT, extension: 'nq' },
  { ...RDF_XML_FILE_FORMAT, extension: 'xml' },
  { ...JSON_FILE_FORMAT, extension: 'json' },
];

/** A knowledge graph digital object listed in the explorer table */
export type KgDigitalObject = {
  /** Digital object IRI (`@id`), the base URL of its versions */
  id: string;
  /** Display title */
  title: string;
  /** Route of the digital object's metadata page */
  path: string;
  /** Persistent URL of the digital object */
  url: string;
  /** Display label of the digital object type */
  type: string;
  /** Digital object type as published (`doType`), e.g. `wpp` */
  typeId: string;
  /** Organs covered by the digital object */
  organs: string[];
  /** Organs as shown in the table: capitalized and sorted alphabetically, or `Multiple organs` when none are listed */
  organLabels: string[];
  /** Latest version */
  version: string;
  /** Every published version */
  versions: string[];
  /** Number of cell types, when known */
  cellCount?: number;
  /** Number of biomarker types, when known */
  biomarkerCount?: number;
  /** Creation date of the latest version (YYYY-MM-DD) */
  lastUpdated: string;
};

/** Display labels of the digital object types (`doType`) */
const TYPE_LABELS: Record<string, string> = {
  collection: 'Collection',
  schema: 'Schema',
  wpp: 'WPP table',
};

/**
 * Reports a malformed digital object listing
 *
 * @param message What is wrong, including the path of the value
 * @throws Error describing the problem
 */
function invalid(message: string): never {
  throw new Error(`Invalid knowledge graph digital objects: ${message}`);
}

/**
 * Reads a required, non-empty string
 *
 * @param record Digital object
 * @param key Property to read
 * @param path Path of the digital object, used in error messages
 * @returns The string
 * @throws Error when the value is missing, empty, or not a string
 */
function readString(record: Record<string, unknown>, key: string, path: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    invalid(`${path}.${key} must be a non-empty string.`);
  }
  return value;
}

/**
 * Reads a string or list of strings, treating a missing value as an empty list
 *
 * @param record Digital object
 * @param key Property to read
 * @param path Path of the digital object, used in error messages
 * @returns The strings
 * @throws Error when a value is not a string
 */
function readStrings(record: Record<string, unknown>, key: string, path: string): string[] {
  const value = record[key] ?? [];
  const values = Array.isArray(value) ? value : [value];
  if (!values.every((item) => typeof item === 'string')) {
    invalid(`${path}.${key} must be a string or a list of strings.`);
  }
  return values;
}

/**
 * Reads an optional integer, which the listing may serialize as a string
 *
 * @param record Digital object
 * @param key Property to read
 * @param path Path of the digital object, used in error messages
 * @returns The integer, or `undefined` when missing
 * @throws Error when the value is not an integer
 */
function readCount(record: Record<string, unknown>, key: string, path: string): number | undefined {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
  const count = Number(value);
  if (!Number.isInteger(count)) {
    invalid(`${path}.${key} must be an integer.`);
  }
  return count;
}

/** Capitalizes the first letter of a text, e.g. `large intestine` to `Large intestine` */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts one `@graph` entry into a table row
 *
 * @param value Graph entry
 * @param index Position of the entry, used in error messages
 * @returns Table row of the digital object
 * @throws Error when the entry is malformed
 */
function readDigitalObject(value: unknown, index: number): KgDigitalObject {
  const path = `@graph[${index}]`;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    invalid(`${path} must be an object.`);
  }

  const record = value as Record<string, unknown>;
  const id = readString(record, '@id', path);
  const organs = readStrings(record, 'organs', path);
  const type = readString(record, 'doType', path);
  return {
    id,
    title: readString(record, 'title', path),
    path: getKgMetadataPagePath(id),
    url: readString(record, 'purl', path),
    type: TYPE_LABELS[type] ?? type,
    typeId: type,
    organs,
    organLabels: organs.length > 0 ? organs.map(capitalize).sort((a, b) => a.localeCompare(b)) : ['Multiple organs'],
    version: readString(record, 'doVersion', path),
    versions: readStrings(record, 'versions', path),
    cellCount: readCount(record, 'cell_count', path),
    biomarkerCount: readCount(record, 'biomarker_count', path),
    lastUpdated: readString(record, 'lastUpdated', path),
  };
}

/**
 * Converts the JSON-LD digital object listing into table rows
 *
 * @param value Parsed `digital-objects.jsonld` document
 * @returns One row per digital object in the `@graph`
 */
export function parseKgDigitalObjects(value: unknown): KgDigitalObject[] {
  const graph = (value as { '@graph'?: unknown } | null)?.['@graph'];
  if (!Array.isArray(graph)) {
    invalid('@graph must be a list.');
  }
  return graph.map(readDigitalObject);
}

/**
 * Builds the route of a digital object's metadata page from its IRI
 *
 * @param id Digital object IRI, e.g. `https://kg.wholepersonphysiome.org/wpp/urinary-system`
 * @returns Route such as `/kg-explorer/wpp/urinary-system`
 */
export function getKgMetadataPagePath(id: string): string {
  return `/kg-explorer${new URL(id).pathname.replace(/\/$/, '')}`;
}

/**
 * Builds the URL of a digital object's metadata for its latest version
 *
 * @param item Digital object
 * @returns URL of `latest/metadata.json`
 */
export function getKgMetadataUrl(item: Pick<KgDigitalObject, 'id'>): string {
  return `${item.id}/latest/metadata.json`;
}

/**
 * Builds the URL of a digital object's graph in a version and format
 *
 * @param item Digital object
 * @param version Version of the graph
 * @param format Graph format
 * @returns URL of the graph file
 */
export function getKgGraphUrl(item: Pick<KgDigitalObject, 'id'>, version: string, format: KgGraphFormat): string {
  return `${item.id}/${version}/graph.${format.extension}`;
}

/**
 * Builds the file name of a digital object's graph download
 *
 * @param item Digital object
 * @param version Version of the graph
 * @param format Graph format
 * @returns File name such as `urinary-system-v0.20261028.ttl`
 */
export function getKgGraphFileName(item: Pick<KgDigitalObject, 'id'>, version: string, format: KgGraphFormat): string {
  const name = item.id.replace(/\/$/, '').split('/').pop();
  return `${name}-${version}.${format.extension}`;
}
