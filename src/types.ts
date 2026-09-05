export interface Station {
  name: string;
  km: number;
  opened: string;
  existedIn1972: boolean;
}

export interface SameFareFarthest {
  from: string;
  to: string;
  km: number;
  timesFarther: number;
}

export interface Pair {
  from: string;
  to: string;
  km: number;
  fareKm: number;
  stationsBetween: number;
  fare: number;
  reservedLtd: number;
  reservedTotal: number;
  freeLtd: number;
  freeTotal: number;
  isTokutei: boolean;
  adjacentNow: boolean;
  adjacent1972: boolean;
  yenPerKmFree: number;
  yenPerKmTotal: number;
  freeMultipleOfFare: number;
  reservedCalc: number;
  matchesRule: boolean;
  sameFareFarthest: SameFareFarthest | null;
}

export interface HighlightPair {
  from: string;
  to: string;
  km: number;
  fare: number;
  freeLtd: number;
  freeTotal: number;
  reservedLtd: number;
  reservedTotal: number;
  yenPerKmFree: number;
  isTokutei: boolean;
  stationsBetween: number;
  note: string;
}

export interface Highlights {
  hero: HighlightPair;
  sameFareLongerRide: HighlightPair;
  cheaperButLonger: HighlightPair;
  cheaperButLonger2: HighlightPair;
  oneStop: HighlightPair;
  oneStopWest: HighlightPair;
}

export interface FareTier {
  label: string;
  minKm: number;
  maxKm: number;
  reservedLtd: number;
  freeLtd: number;
  note: string;
}

export interface TokuteiRule {
  amounts: {
    upTo50km: number;
    over50km: number;
  };
  thresholdKm: number;
  basisYear: string;
  basisNote: string;
  enumeratedSections: [string, string][];
  enumeratedReason: Record<string, string>;
  whyOdawaraMishimaExcluded: string;
}

export interface Split {
  from: string;
  via: string;
  to: string;
  legs: {
    from: string;
    to: string;
    ltd: number;
    isTokutei: boolean;
  }[];
  splitLtd: number;
  throughLtd: number;
  saving: number;
}

export interface ConventionalLine {
  note: string;
  boundary: {
    station: string;
    east: string;
    west: string;
    physicalBoundary: string;
    icRule: string;
    practical: string;
    operation: string;
    shinkansenNote: string;
  };
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  used: string;
}

export interface Meta {
  fareBasis: string;
  reservedSource: string;
  tokuteiBasis: string;
  caveats: string[];
}

export interface TokaidoData {
  stations: Station[];
  pairs: Pair[];
  highlights: Highlights;
  fareTiers: FareTier[];
  tokuteiRule: TokuteiRule;
  splits: Split[];
  conventionalLine: ConventionalLine;
  sources: Source[];
  meta: Meta;
}
