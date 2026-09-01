export type KeywordConfidence = 'verified' | 'community' | 'draft';

export type ConfidentPhrases = {
  phrases: string | string[];
  confidence?: KeywordConfidence;
};

export type KeywordValue = string | string[] | ConfidentPhrases;
export type GlossTierValue = string | string[];

export type TargetLanguage =
  | 'javascript'
  | 'python'
  | 'typescript'
  | 'go'
  | 'rust'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'kotlin'
  | 'swift'
  | 'dart'
  | 'ruby'
  | 'php'
  | 'r';

export type GlossTierMap = Record<string, GlossTierValue>;

/** Runtime keyword map from generated `keywords.json` (native phrases + English fallbacks). */
export type PublishedKeywordMap = Record<string, string[]>;

export interface LanguagePack {
  name: string;
  languageCode: string;
  locale: string;
  direction?: 'ltr' | 'rtl';
  countries: string[];
  regions: string[];
  scopeNote?: string;
  reviewStatus?: 'starter' | 'community-reviewed' | 'partner-verified';
  recommendedPartners?: string[];
  version: string;
  displayName?: string;
  description?: string;
  contributors?: string[];
  targets: TargetLanguage[];
  keywords: Record<string, KeywordValue>;
}

export interface PackIndexEntry {
  name: string;
  languageCode: string;
  locale: string;
  displayName?: string;
  countries: string[];
  regions: string[];
  version: string;
  targets?: TargetLanguage[];
  direction?: 'ltr' | 'rtl';
  ideReady?: boolean;
}

export interface PackIndex {
  packs: PackIndexEntry[];
}

export interface ResolvedKeyword {
  logical: string;
  phrases: string[];
  confidence?: KeywordConfidence;
}

export interface ResolvedGlossTier {
  key: string;
  phrases: string[];
}

/** Secondary-alias link exported in coverage-summary.json for tool disambiguation. */
export interface AmbiguousForm {
  form: string;
  logical: string;
  alsoOn: string[];
  primaryOwner?: string;
}

export interface PackCoverageEntry {
  translatedFull: number;
  totalFull: number;
  fullPct: number;
  translatedCore: number;
  coreTotal: number;
  corePct: number;
  untranslatedCore: string[];
  untranslatedCount: number;
  secondaryAliasAmbiguities: number;
  sharedAliasForms: number;
  ambiguousForms: AmbiguousForm[];
}

export interface CoverageSummary {
  generatedAt: string;
  logicalTokenCount: number;
  africanLanguagePackCount: number;
  packCoverage: Record<string, PackCoverageEntry>;
}
