import type { ContentNode } from '@atlasng/content-blocks/types';
import {
  CSV_FILE_FORMAT,
  JSON_FILE_FORMAT,
  JSON_LD_FILE_FORMAT,
  JSON_LD_GRAPH_DATA_FILE_FORMAT,
  JSON_LD_RAW_DATA_FILE_FORMAT,
  PDF_FILE_FORMAT,
  PNG_FILE_FORMAT,
  SVG_FILE_FORMAT,
  TSV_FILE_FORMAT,
  VersionControlFileFormat,
  YAML_FILE_FORMAT,
} from '@atlasng/design-system/version-control';
import type { KgExplorerMetadata, KgExplorerMetadataSection } from '@atlasng/kg-explorer';
import { KG_GRAPH_FORMATS, KgDigitalObject, KgFileFormat } from './kg-digital-objects';
import { getKgMetadataIcons } from './kg-icons';

/** A JSON object of unknown shape */
type JsonRecord = Record<string, unknown>;

/** Returns the value if it is a JSON object, otherwise an empty object */
function asRecord(value: unknown): JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as JsonRecord) : {};
}

/** Returns the trimmed value if it is a non-empty string */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** Returns the value, or each item of a list, as JSON objects; a missing value is an empty list */
function asRecords(value: unknown): JsonRecord[] {
  return (Array.isArray(value) ? value : value === undefined ? [] : [value]).map(asRecord);
}

/** Wraps content in a paragraph content block */
function paragraph(content: ContentNode | ContentNode[]): ContentNode {
  return { component: 'ContentParagraph', content };
}

/** Creates a text link content block */
function link(href: string, label: string): ContentNode {
  return { component: 'TextLink', config: { href }, content: label };
}

/** Splits text with markdown links, e.g. `CC BY ([license](https://...))`, into text and link nodes */
function inlineMarkdownLinks(text: string): ContentNode[] {
  const nodes: ContentNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > offset) {
      nodes.push(text.slice(offset, match.index));
    }
    nodes.push(link(match[2], match[1]));
    offset = match.index + match[0].length;
  }
  if (offset < text.length) {
    nodes.push(text.slice(offset));
  }
  return nodes;
}

/** Comma separated list of people, linked to their ORCID or other IRI */
function peopleSection(title: string, value: unknown): KgExplorerMetadataSection | undefined {
  const nodes = asRecords(value).flatMap((person, index): ContentNode[] => {
    const name = asString(person['fullName']) ?? asString(person['label']) ?? asString(person['name']);
    if (!name) {
      return [];
    }
    const id = asString(person['id']);
    const node = id?.startsWith('http') ? link(id, name) : name;
    return index === 0 ? [node] : [', ', node];
  });
  return nodes.length > 0 ? { title, content: paragraph(nodes) } : undefined;
}

/**
 * Description of the source data, or of the graph when the source description is still a `TODO` placeholder
 *
 * @param metadata Graph metadata (`metadata.json`)
 * @param source Source data metadata (`was_derived_from`)
 * @returns The section, or `undefined` when neither has a description
 */
function descriptionSection(metadata: JsonRecord, source: JsonRecord): KgExplorerMetadataSection | undefined {
  const sourceDescription = asString(source['description']);
  const description =
    sourceDescription && !sourceDescription.startsWith('TODO') ? sourceDescription : asString(metadata['description']);
  return description ? { title: 'Description', content: paragraph(description) } : undefined;
}

/** Section with one paragraph of text, or `undefined` when there is no text */
function textSection(title: string, text: string | undefined): KgExplorerMetadataSection | undefined {
  return text ? { title, content: paragraph(text) } : undefined;
}

/** Funders of the source data with their award numbers */
function funderSection(source: JsonRecord): KgExplorerMetadataSection | undefined {
  const content = asRecords(source['funders']).flatMap((funder) => {
    const name = asString(funder['funder']);
    const award = asString(funder['awardNumber']);
    if (!name) {
      return [];
    }
    return [paragraph(award ? `${name} (Award number ${award})` : name)];
  });
  return content.length > 0 ? { title: 'Funder', content } : undefined;
}

/** License of the source data with its markdown links, falling back to the graph's license URL */
function licenseSection(metadata: JsonRecord, source: JsonRecord): KgExplorerMetadataSection | undefined {
  const sourceLicense = asString(source['license']);
  const licenseUrl = asString(metadata['license']);
  if (sourceLicense) {
    return { title: 'License', content: paragraph(inlineMarkdownLinks(sourceLicense)) };
  }
  return licenseUrl ? { title: 'License', content: paragraph(link(licenseUrl, licenseUrl)) } : undefined;
}

/** Full names of publishers that the metadata abbreviates */
const PUBLISHER_NAMES: Record<string, string> = {
  WPP: 'Whole Person Physiome',
};

/** Publisher of the source data, falling back to the graph's publisher, with abbreviations spelled out */
function publisherSection(metadata: JsonRecord, source: JsonRecord): KgExplorerMetadataSection | undefined {
  const publisher = asString(source['publisher']) ?? asString(metadata['publisher']);
  return textSection('Publisher', publisher && (PUBLISHER_NAMES[publisher] ?? publisher));
}

/** Chips with the digital object type and its capitalized organs */
function tagsSection(item: KgDigitalObject): KgExplorerMetadataSection {
  const organs = item.organs.map((organ) => organ.charAt(0).toUpperCase() + organ.slice(1));
  return { title: 'Tags', content: { component: 'MetadataChips', config: { labels: [item.type, ...organs] } } };
}

/** Formats of source data files, by file extension */
const SOURCE_FORMATS: Record<string, VersionControlFileFormat> = {
  csv: CSV_FILE_FORMAT,
  json: JSON_FILE_FORMAT,
  jsonld: JSON_LD_FILE_FORMAT,
  mmd: { label: 'Mermaid', description: 'Diagram written in Mermaid text syntax.' },
  pdf: PDF_FILE_FORMAT,
  png: PNG_FILE_FORMAT,
  svg: SVG_FILE_FORMAT,
  tsv: TSV_FILE_FORMAT,
  yaml: YAML_FILE_FORMAT,
  yml: YAML_FILE_FORMAT,
};

/**
 * Describes a file by its path in a version directory. Graph files use the graph formats, and other files are
 * described by their extension.
 *
 * @param path Path of the file, e.g. `graph.ttl` or `assets/Urinary_System.csv`
 * @returns The file as a download format
 */
function fileFormat(path: string): KgFileFormat {
  const graph = KG_GRAPH_FORMATS.find((format) => format.path === path);
  if (graph) {
    return graph;
  }
  const file = path.slice(path.lastIndexOf('/') + 1);
  const dot = file.lastIndexOf('.');
  const extension = dot >= 0 ? file.slice(dot + 1).toLowerCase() : '';
  return { ...(SOURCE_FORMATS[extension] ?? { label: extension.toUpperCase() || file, description: '' }), path };
}

/**
 * Lists the files of a metadata `distributions` value, with their paths relative to the version directory
 *
 * @param value Distributions of the graph or of its source data
 * @param version Version the download URLs point into
 * @returns One download format per distribution with a download URL
 */
function distributionFiles(value: unknown, version: string): KgFileFormat[] {
  return asRecords(value).flatMap((distribution) => {
    const url = asString(distribution['downloadUrl']);
    if (!url) {
      return [];
    }
    const marker = `/${version}/`;
    const index = url.indexOf(marker);
    return [fileFormat(index >= 0 ? url.slice(index + marker.length) : url.slice(url.lastIndexOf('/') + 1))];
  });
}

/** Lists CSV first, as the source of the WPP tables, then the other files alphabetically */
function compareFiles(a: KgFileFormat, b: KgFileFormat): number {
  const csvFirst = Number(b.label === CSV_FILE_FORMAT.label) - Number(a.label === CSV_FILE_FORMAT.label);
  return csvFirst || a.label.localeCompare(b.label);
}

/**
 * Lists the graph and source data files of a digital object. A format both include, such as a schema's JSON,
 * is labeled as graph data or raw data. Without graph distributions, the published graph formats are listed.
 *
 * @param metadata Graph metadata (`metadata.json`)
 * @param source Source data metadata (`was_derived_from`)
 * @param version Version of the metadata
 * @returns The files, CSV first and the rest alphabetically
 */
function kgFiles(metadata: JsonRecord, source: JsonRecord, version: string): KgFileFormat[] {
  const listedGraph = distributionFiles(metadata['distributions'], version);
  const graph = listedGraph.length > 0 ? listedGraph : KG_GRAPH_FORMATS;
  const raw = distributionFiles(source['distributions'], version);
  const graphLabels = new Set(graph.map(({ label }) => label));
  const shared = new Set(raw.map(({ label }) => label).filter((label) => graphLabels.has(label)));
  const qualify = (file: KgFileFormat, kind: VersionControlFileFormat, name: string): KgFileFormat =>
    shared.has(file.label) ? { ...file, label: `${file.label} (${name})`, description: kind.description } : file;

  return [
    ...graph.map((file) => qualify(file, JSON_LD_GRAPH_DATA_FILE_FORMAT, 'graph data')),
    ...raw.map((file) => qualify(file, JSON_LD_RAW_DATA_FILE_FORMAT, 'raw data')),
  ].sort(compareFiles);
}

/**
 * Lists the files published in each version of a digital object
 *
 * @param item Digital object
 * @param value Parsed `latest/metadata.json`, or `undefined` when it didn't load
 * @returns The files, CSV first and the rest alphabetically
 */
export function getKgFiles(item: KgDigitalObject, value: unknown): KgFileFormat[] {
  const metadata = asRecord(value);
  return kgFiles(metadata, asRecord(metadata['was_derived_from']), asString(metadata['version']) ?? item.version);
}

/**
 * Builds the metadata page content of a digital object
 *
 * @param item Digital object from the listing
 * @param value Parsed `latest/metadata.json` of the digital object
 * @returns Title, icons, sections, URL and versions of the metadata page
 */
export function buildKgMetadata(item: KgDigitalObject, value: unknown): KgExplorerMetadata<KgFileFormat> {
  const metadata = asRecord(value);
  const source = asRecord(metadata['was_derived_from']);

  const sections = [
    descriptionSection(metadata, source),
    peopleSection('Creator(s)', source['creators']),
    peopleSection('Project lead(s)', source['project_leads']),
    peopleSection('Internal reviewer(s)', source['reviewers']),
    textSection('Date published', asString(source['creation_date'])),
    textSection('Date last processed', asString(metadata['creation_date'])),
    publisherSection(metadata, source),
    funderSection(source),
    licenseSection(metadata, source),
    tagsSection(item),
  ].filter((section): section is KgExplorerMetadataSection => section !== undefined);

  const versions = [item.version, ...item.versions.filter((version) => version !== item.version)];
  // Every published version has the same files as the latest.
  const files = getKgFiles(item, value);

  return {
    title: item.title,
    icons: getKgMetadataIcons(item),
    url: item.url,
    sections,
    versions: versions.map((label) => ({ label, formats: files })),
  };
}
