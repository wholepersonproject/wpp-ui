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
  /** Display title */
  title: string;
  /** Persistent URL of the digital object */
  url: string;
  /** Display label of the digital object type */
  type: string;
  /** Organs covered by the digital object */
  organs: string[];
  /** Latest version */
  version: string;
  /** Number of cell types, when known */
  cellCount?: number;
  /** Creation date of the latest version (YYYY-MM-DD) */
  lastUpdated: string;
  /** URL of the latest version directory, which holds the graph files */
  latestVersionUrl: string;
};

const TYPE_LABELS: Record<string, string> = {
  collection: 'Collection',
  schema: 'Schema',
  wpp: 'WPP Table',
};

function invalid(message: string): never {
  throw new Error(`Invalid knowledge graph digital objects: ${message}`);
}

function readString(record: Record<string, unknown>, key: string, path: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') {
    invalid(`${path}.${key} must be a non-empty string.`);
  }
  return value;
}

function readStrings(record: Record<string, unknown>, key: string, path: string): string[] {
  const value = record[key] ?? [];
  const values = Array.isArray(value) ? value : [value];
  if (!values.every((item) => typeof item === 'string')) {
    invalid(`${path}.${key} must be a string or a list of strings.`);
  }
  return values;
}

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

function readDigitalObject(value: unknown, index: number): KgDigitalObject {
  const path = `@graph[${index}]`;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    invalid(`${path} must be an object.`);
  }

  const record = value as Record<string, unknown>;
  const type = readString(record, 'doType', path);
  return {
    title: readString(record, 'title', path),
    url: readString(record, 'purl', path),
    type: TYPE_LABELS[type] ?? type,
    organs: readStrings(record, 'organs', path),
    version: readString(record, 'doVersion', path),
    cellCount: readCount(record, 'cell_count', path),
    lastUpdated: readString(record, 'lastUpdated', path),
    latestVersionUrl: readString(record, 'lod', path),
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
 * Builds the URL of a digital object's latest graph in a format
 *
 * @param item Digital object
 * @param format Graph format
 * @returns URL of the graph file
 */
export function getKgGraphUrl(item: KgDigitalObject, format: KgGraphFormat): string {
  return `${item.latestVersionUrl.replace(/\/$/, '')}/graph.${format.extension}`;
}
