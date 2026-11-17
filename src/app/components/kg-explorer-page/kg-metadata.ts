import type { ContentNode } from '@atlasng/content-blocks/types';
import type { KgExplorerMetadata, KgExplorerMetadataSection } from '@atlasng/kg-explorer';
import { KG_GRAPH_FORMATS, KgDigitalObject, KgGraphFormat } from './kg-digital-objects';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function asRecords(value: unknown): JsonRecord[] {
  return (Array.isArray(value) ? value : value === undefined ? [] : [value]).map(asRecord);
}

function paragraph(content: ContentNode | ContentNode[]): ContentNode {
  return { component: 'ContentParagraph', content };
}

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

function descriptionSection(metadata: JsonRecord, source: JsonRecord): KgExplorerMetadataSection | undefined {
  const sourceDescription = asString(source['description']);
  const description =
    sourceDescription && !sourceDescription.startsWith('TODO') ? sourceDescription : asString(metadata['description']);
  return description ? { title: 'Description', content: paragraph(description) } : undefined;
}

function textSection(title: string, text: string | undefined): KgExplorerMetadataSection | undefined {
  return text ? { title, content: paragraph(text) } : undefined;
}

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

function publisherSection(metadata: JsonRecord, source: JsonRecord): KgExplorerMetadataSection | undefined {
  const publisher = asString(source['publisher']) ?? asString(metadata['publisher']);
  return textSection('Publisher', publisher && (PUBLISHER_NAMES[publisher] ?? publisher));
}

function tagsSection(item: KgDigitalObject): KgExplorerMetadataSection {
  const organs = item.organs.map((organ) => organ.charAt(0).toUpperCase() + organ.slice(1));
  return { title: 'Tags', content: { component: 'MetadataChips', config: { labels: [item.type, ...organs] } } };
}

/**
 * Builds the metadata page content of a digital object
 *
 * @param item Digital object from the listing
 * @param value Parsed `latest/metadata.json` of the digital object
 * @returns Title, sections, URL and versions of the metadata page
 */
export function buildKgMetadata(item: KgDigitalObject, value: unknown): KgExplorerMetadata<KgGraphFormat> {
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

  return {
    title: item.title,
    url: item.url,
    sections,
    versions: versions.map((label) => ({ label, formats: KG_GRAPH_FORMATS })),
  };
}
