import { describe, expect, it } from 'vitest';
import { KgDigitalObject } from './kg-digital-objects';
import { buildKgMetadata } from './kg-metadata';

const ITEM: KgDigitalObject = {
  id: 'https://kg.wholepersonphysiome.org/wpp/urinary-system',
  title: 'Whole Person Physiome (WPP) table for urinary system',
  path: '/kg-explorer/wpp/urinary-system',
  url: 'https://purl.wholepersonphysiome.org/wpp/urinary-system',
  type: 'WPP table',
  typeId: 'wpp',
  organs: ['kidney', 'urinary bladder'],
  organLabels: ['Kidney', 'Urinary bladder'],
  version: 'v0.20261028',
  versions: ['draft', 'v0.20261028'],
  cellCount: 20,
  lastUpdated: '2026-10-28',
};

const METADATA = {
  description: 'The graph representation of the urinary system dataset.',
  creation_date: '2026-10-29',
  publisher: 'HuBMAP',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  was_derived_from: {
    description: 'TODO: description',
    creators: [
      { id: 'https://orcid.org/0000-0001-8187-0507', label: 'Jacob C. Scherba', fullName: 'Jacob C. Scherba' },
      { id: 'https://orcid.org/0000-0002-1868-3896', label: 'Minyan Zhu', fullName: 'Minyan Zhu' },
    ],
    reviewers: [{ id: 'https://orcid.org/0000-0002-1005-3726', fullName: 'Katalin Susztak' }],
    project_leads: [{ id: 'https://orcid.org/0000-0002-3321-6137', fullName: 'Katy Börner' }],
    creation_date: '2026-10-28',
    publisher: 'WPP',
    license:
      'Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))',
    funders: [{ funder: 'National Institutes of Health', awardNumber: 'U24AT013504' }],
    distributions: [
      {
        downloadUrl:
          'https://cdn.wholepersonphysiome.org/digital-objects/wpp/urinary-system/v0.20261028/assets/Urinary_System.csv',
      },
    ],
  },
};

function section(title: string, value: unknown = METADATA) {
  return buildKgMetadata(ITEM, value).sections.find((candidate) => candidate.title === title);
}

describe('buildKgMetadata', () => {
  it('uses the listing title, purl, and versions with the latest first', () => {
    const metadata = buildKgMetadata(ITEM, METADATA);

    expect(metadata.title).toBe(ITEM.title);
    expect(metadata.url).toBe(ITEM.url);
    expect(metadata.versions?.map((version) => version.label)).toEqual(['v0.20261028', 'draft']);
    expect(metadata.versions?.[0]?.formats.length).toBeGreaterThan(0);
  });

  it('shows the product and organ icons above the title', () => {
    expect(buildKgMetadata(ITEM, METADATA).icons?.map(({ name }) => name)).toEqual(['asctb', 'kidneys']);
  });

  it('lists the sections in the order of the design', () => {
    expect(buildKgMetadata(ITEM, METADATA).sections.map(({ title }) => title)).toEqual([
      'Description',
      'Creator(s)',
      'Project lead(s)',
      'Internal reviewer(s)',
      'Date published',
      'Date last processed',
      'Publisher',
      'Funder',
      'License',
      'Tags',
    ]);
  });

  it('separates the source publication date from the graph processing date', () => {
    expect(section('Date published')?.content).toEqual({ component: 'ContentParagraph', content: '2026-10-28' });
    expect(section('Date last processed')?.content).toEqual({ component: 'ContentParagraph', content: '2026-10-29' });
  });

  it('spells out the source publisher', () => {
    expect(section('Publisher')?.content).toEqual({ component: 'ContentParagraph', content: 'Whole Person Physiome' });
  });

  it('shows the funder with its award number', () => {
    expect(section('Funder')?.content).toEqual([
      { component: 'ContentParagraph', content: 'National Institutes of Health (Award number U24AT013504)' },
    ]);
  });

  it('tags the type and capitalized organs', () => {
    expect(section('Tags')?.content).toEqual({
      component: 'MetadataChips',
      config: { labels: ['WPP table', 'Kidney', 'Urinary bladder'] },
    });
  });

  it('falls back to the graph description when the source description is a placeholder', () => {
    expect(section('Description')?.content).toEqual({
      component: 'ContentParagraph',
      content: 'The graph representation of the urinary system dataset.',
    });
  });

  it('links creators to their ORCID', () => {
    expect(section('Creator(s)')?.content).toEqual({
      component: 'ContentParagraph',
      content: [
        {
          component: 'TextLink',
          config: { href: 'https://orcid.org/0000-0001-8187-0507' },
          content: 'Jacob C. Scherba',
        },
        ', ',
        { component: 'TextLink', config: { href: 'https://orcid.org/0000-0002-1868-3896' }, content: 'Minyan Zhu' },
      ],
    });
  });

  it('turns markdown links in the license into text links', () => {
    expect(section('License')?.content).toEqual({
      component: 'ContentParagraph',
      content: [
        'Creative Commons Attribution 4.0 International (',
        {
          component: 'TextLink',
          config: { href: 'https://creativecommons.org/licenses/by/4.0/' },
          content: 'CC BY 4.0',
        },
        ')',
      ],
    });
  });

  it('still renders a page without metadata', () => {
    expect(buildKgMetadata(ITEM, undefined).sections.map(({ title }) => title)).toEqual(['Tags']);
  });
});
