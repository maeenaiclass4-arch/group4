import { COUNTRY_BY_ID, type CountryRef } from './countries';

/**
 * Curated historical polities/regions that don't correspond to a single modern
 * country. Each maps to the set of modern country ids it approximately
 * overlapped at its height, so the map layer can still color/highlight it.
 * This list is intentionally extensible — add an entry any time a creator
 * needs a region the base country list doesn't cover.
 */
export interface HistoricalRegion {
  id: string;
  nameEn: string;
  nameAr: string;
  countryIds: string[];
  /** Approximate centroid used for camera focus, arrows, and effect origin. */
  centroid: [number, number];
}

export const HISTORICAL_REGIONS: HistoricalRegion[] = [
  {
    id: 'rashidun-caliphate',
    nameEn: 'Rashidun Caliphate',
    nameAr: 'الخلافة الراشدة',
    countryIds: ['682', '887', '400', '760', '368', '376', '275', '818', '434', '422'],
    centroid: [42, 26],
  },
  {
    id: 'umayyad-caliphate',
    nameEn: 'Umayyad Caliphate',
    nameAr: 'الدولة الأموية',
    countryIds: [
      '760', '368', '682', '887', '400', '376', '275', '818', '434', '788', '012', '504', '724', '620',
      '364', '860', '795', '762', '004', '586',
    ],
    centroid: [30, 30],
  },
  {
    id: 'abbasid-caliphate',
    nameEn: 'Abbasid Caliphate',
    nameAr: 'الدولة العباسية',
    countryIds: [
      '368', '760', '682', '887', '400', '376', '275', '818', '364', '795', '860', '762', '004', '586', '031', '051', '268',
    ],
    centroid: [44, 30],
  },
  {
    id: 'al-andalus',
    nameEn: 'Al-Andalus',
    nameAr: 'الأندلس',
    countryIds: ['724', '620'],
    centroid: [-4, 38],
  },
  {
    id: 'ottoman-empire',
    nameEn: 'Ottoman Empire',
    nameAr: 'الدولة العثمانية',
    countryIds: [
      '792', '300', '100', '642', '688', '070', '191', '499', '008', '807', '196', '760', '368', '400', '376', '275',
      '818', '012', '788', '434', '682', '887', '400',
    ],
    centroid: [33, 39],
  },
  {
    id: 'fatimid-caliphate',
    nameEn: 'Fatimid Caliphate',
    nameAr: 'الدولة الفاطمية',
    countryIds: ['818', '434', '788', '012', '400', '376', '275', '760'],
    centroid: [25, 29],
  },
  {
    id: 'mamluk-sultanate',
    nameEn: 'Mamluk Sultanate',
    nameAr: 'سلطنة المماليك',
    countryIds: ['818', '760', '400', '376', '275', '434', '682'],
    centroid: [33, 28],
  },
  {
    id: 'safavid-empire',
    nameEn: 'Safavid Empire',
    nameAr: 'الدولة الصفوية',
    countryIds: ['364', '031', '051', '268', '795', '860', '004', '368'],
    centroid: [53, 33],
  },
  {
    id: 'mongol-empire',
    nameEn: 'Mongol Empire',
    nameAr: 'الإمبراطورية المغولية',
    countryIds: ['496', '156', '643', '398', '860', '795', '762', '417', '004', '364', '368', '804', '643'],
    centroid: [90, 47],
  },
  {
    id: 'timurid-empire',
    nameEn: 'Timurid Empire',
    nameAr: 'الدولة التيمورية',
    countryIds: ['860', '795', '762', '417', '004', '364', '586'],
    centroid: [65, 38],
  },
  {
    id: 'mughal-empire',
    nameEn: 'Mughal Empire',
    nameAr: 'الإمبراطورية المغولية الهندية',
    countryIds: ['356', '586', '050', '004'],
    centroid: [77, 25],
  },
  {
    id: 'roman-empire',
    nameEn: 'Roman Empire',
    nameAr: 'الإمبراطورية الرومانية',
    countryIds: [
      '380', '250', '724', '620', '826', '056', '528', '040', '756', '191', '705', '070', '499', '008', '300',
      '792', '760', '400', '376', '275', '818', '434', '788', '012', '100', '642', '688',
    ],
    centroid: [15, 41],
  },
  {
    id: 'byzantine-empire',
    nameEn: 'Byzantine Empire',
    nameAr: 'الإمبراطورية البيزنطية',
    countryIds: ['792', '300', '100', '642', '688', '070', '191', '196', '760', '818', '434'],
    centroid: [30, 39],
  },
  {
    id: 'persian-empire',
    nameEn: 'Persian Empire',
    nameAr: 'الإمبراطورية الفارسية',
    countryIds: ['364', '368', '031', '051', '268', '795', '860', '004', '586', '760', '818'],
    centroid: [50, 32],
  },
  {
    id: 'british-empire',
    nameEn: 'British Empire',
    nameAr: 'الإمبراطورية البريطانية',
    countryIds: ['826', '356', '586', '050', '710', '036', '554', '124', '818', '404', '566'],
    centroid: [10, 30],
  },
  {
    id: 'mali-empire',
    nameEn: 'Mali Empire',
    nameAr: 'إمبراطورية مالي',
    countryIds: ['466', '854', '324', '270', '686', '624', '288'],
    centroid: [-5, 15],
  },
  {
    id: 'songhai-empire',
    nameEn: 'Songhai Empire',
    nameAr: 'إمبراطورية سونغاي',
    countryIds: ['466', '562', '854', '324', '270', '686'],
    centroid: [0, 16],
  },
  {
    id: 'aksumite-empire',
    nameEn: 'Aksumite Empire',
    nameAr: 'مملكة أكسوم',
    countryIds: ['231', '232', '262', '887'],
    centroid: [40, 12],
  },
  {
    id: 'khmer-empire',
    nameEn: 'Khmer Empire',
    nameAr: 'إمبراطورية الخمير',
    countryIds: ['116', '764', '418', '704'],
    centroid: [104, 13],
  },
  {
    id: 'qing-dynasty',
    nameEn: 'Qing Dynasty (China)',
    nameAr: 'أسرة تشينغ الصينية',
    countryIds: ['156', '496', '158', '410', '408'],
    centroid: [103, 36],
  },
  {
    id: 'holy-roman-empire',
    nameEn: 'Holy Roman Empire',
    nameAr: 'الإمبراطورية الرومانية المقدسة',
    countryIds: ['276', '040', '756', '528', '056', '442', '380', '203', '703'],
    centroid: [12, 49],
  },
  {
    id: 'spanish-empire',
    nameEn: 'Spanish Empire',
    nameAr: 'الإمبراطورية الإسبانية',
    countryIds: ['724', '484', '170', '604', '032', '152', '862', '068', '218', '188', '591'],
    centroid: [-30, 15],
  },
  {
    id: 'inca-empire',
    nameEn: 'Inca Empire',
    nameAr: 'إمبراطورية الإنكا',
    countryIds: ['604', '068', '152', '218', '170'],
    centroid: [-73, -13],
  },
  {
    id: 'aztec-empire',
    nameEn: 'Aztec Empire',
    nameAr: 'إمبراطورية الأزتك',
    countryIds: ['484', '320', '084'],
    centroid: [-99, 19],
  },
];

export const HISTORICAL_REGION_BY_ID: Record<string, HistoricalRegion> = Object.fromEntries(
  HISTORICAL_REGIONS.map((r) => [r.id, r]),
);

export type RegionRef = CountryRef | HistoricalRegion;

/** True when the ref is a curated multi-country historical region rather than a modern country. */
export function isHistoricalRegion(ref: RegionRef): ref is HistoricalRegion {
  return 'countryIds' in ref;
}

/** Resolve a region id (country ISO id or historical region id) to the set of country ids it covers. */
export function resolveCountryIds(regionId: string): string[] {
  const region = HISTORICAL_REGION_BY_ID[regionId];
  if (region) return region.countryIds;
  return COUNTRY_BY_ID[regionId] ? [regionId] : [];
}

/** All selectable regions (modern countries + curated historical polities), sorted by Arabic name. */
export function getAllRegionOptions(): RegionRef[] {
  return [...HISTORICAL_REGIONS, ...Object.values(COUNTRY_BY_ID)];
}

export function getRegionCentroid(regionId: string): [number, number] | undefined {
  const region = HISTORICAL_REGION_BY_ID[regionId];
  if (region) return region.centroid;
  return COUNTRY_BY_ID[regionId]?.centroid;
}

export function getRegionName(regionId: string, lang: 'ar' | 'en'): string {
  const region = HISTORICAL_REGION_BY_ID[regionId];
  if (region) return lang === 'ar' ? region.nameAr : region.nameEn;
  const country = COUNTRY_BY_ID[regionId];
  if (country) return lang === 'ar' ? country.nameAr : country.nameEn;
  return regionId;
}
