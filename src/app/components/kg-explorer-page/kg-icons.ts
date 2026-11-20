import type { KgExplorerMetadataIcon } from '@atlasng/kg-explorer';
import type { KgDigitalObject } from './kg-digital-objects';

/** Product icon of each digital object type (`doType`) */
const PRODUCT_ICONS: Record<string, string> = {
  collection: 'collections',
  schema: 'schema',
  wpp: 'asctb',
};

/** Icon used when no organ applies, e.g. for schemas */
const ALL_ORGANS = 'all organs';

/** `@atlasng/icons` organ icon of each organ name */
const ORGAN_ICONS: Record<string, string> = {
  'renal pelvis': 'renal-pelvis',
  pelvis: 'pelvis',
  'bone marrow': 'bone-marrow',
  [ALL_ORGANS]: 'all-organs',
  adipose: 'adipose-tissue',
  'anatomical systems': 'anatomical-systems',
  'blood vasculature': 'vasculature-thick',
  brain: 'brain',
  breast: 'breast',
  eye: 'eye',
  'fallopian tube': 'fallopian-tubes',
  glomerulus: 'glomerulus',
  heart: 'heart',
  'intervertebral disc': 'intervertebral-disc',
  kidney: 'kidneys',
  knee: 'knee',
  'large intestine': 'large-intestine',
  larynx: 'larynx',
  liver: 'liver',
  lung: 'lungs',
  'lymph node': 'lymph-nodes',
  'lymph vasculature': 'lymphatic-vasculature',
  'main bronchus': 'extrapulmonary-bronchus',
  manubrium: 'manubrium',
  mouth: 'mouth',
  'muscular system': 'muscular-system',
  ovary: 'ovaries',
  'palatine tonsil': 'palatine-tonsil',
  pancreas: 'pancreas',
  'peripheral nervous system': 'peripheral-nervous-system',
  placenta: 'placenta',
  prostate: 'prostate',
  skeleton: 'skeletal-system',
  skin: 'skin',
  'small intestine': 'small-intestine',
  sternum: 'sternum',
  'spinal cord': 'spinal-cord',
  spleen: 'spleen',
  stomach: 'stomach',
  thymus: 'thymus',
  trachea: 'trachea',
  ureter: 'ureters',
  'urinary bladder': 'bladder',
  uterus: 'uterus',
};

/**
 * Alternative names of organs, matched in titles and organ lists, including WPP organ names and organ systems that
 * have no icon of their own
 */
const ORGAN_ALIASES: Record<string, string> = {
  colon: 'large intestine',
  intestines: 'small intestine',
  'mammary gland': 'breast',
  musculoskeletal: 'muscular system',
  omentum: 'adipose',
  retina: 'eye',
  'salivary gland': 'mouth',
  'prostate gland': 'prostate',
  'thoracic thymus': 'thymus',
  'nervous system': 'brain',
  lymphatic: 'lymph node',
  pulmonary: 'lung',
  skeletal: 'skeleton',
  'urinary system': 'kidney',
};

/** Organ of digital objects whose title and organs point to the wrong icon, keyed by persistent URL */
const ORGAN_OVERRIDES: Record<string, string> = {
  'https://purl.wholepersonphysiome.org/collection/wpp': ALL_ORGANS,
};

/**
 * Finds the organ shown for a digital object: an override, then an organ named in the title, then the first organ
 * the digital object covers
 *
 * @param item Digital object
 * @returns Organ name with an icon, or `undefined` when none applies
 */
function findOrganName(item: Pick<KgDigitalObject, 'title' | 'url' | 'organs'>): string | undefined {
  const title = item.title.toLowerCase();
  const alias = Object.keys(ORGAN_ALIASES).find((name) => title.includes(name));
  const organs = item.organs.map((organ) => ORGAN_ALIASES[organ] ?? organ);

  return (
    ORGAN_OVERRIDES[item.url] ??
    (alias && ORGAN_ALIASES[alias]) ??
    Object.keys(ORGAN_ICONS).find((name) => title.includes(name)) ??
    organs.find((organ) => ORGAN_ICONS[organ])
  );
}

/**
 * Describes the organ icon for assistive technology, e.g. `Heart + 1 organ`
 *
 * @param organ Organ shown by the icon
 * @param count Number of organs the digital object covers
 * @returns Icon label
 */
function getOrganLabel(organ: string | undefined, count: number): string {
  if (!organ || organ === ALL_ORGANS || organ === 'anatomical systems') {
    return `${count > 1 ? count : 'Multiple'} organs`;
  }
  const label = organ.charAt(0).toUpperCase() + organ.slice(1);
  return count > 1 ? `${label} + ${count - 1} organ${count > 2 ? 's' : ''}` : label;
}

/**
 * Builds the icons above a digital object's metadata page title: its product and its main organ
 *
 * @param item Digital object
 * @returns Product icon (omitted for unknown types) followed by the organ icon
 */
export function getKgMetadataIcons(
  item: Pick<KgDigitalObject, 'title' | 'url' | 'organs' | 'type' | 'typeId'>,
): KgExplorerMetadataIcon[] {
  const organ = findOrganName(item);
  const product = PRODUCT_ICONS[item.typeId];

  return [
    ...(product ? [{ name: product, label: item.type, type: 'product' as const }] : []),
    {
      name: ORGAN_ICONS[organ ?? ALL_ORGANS],
      label: getOrganLabel(organ, item.organs.length),
      type: 'organ',
    },
  ];
}
