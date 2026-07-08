export type KeywordValue = string | string[];
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

export interface LanguagePack {
  name: string;
  languageCode: string;
  locale: string;
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
  glossary?: GlossTierMap;
  placeholders?: GlossTierMap;
  commonLiterals?: GlossTierMap;
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
  ideReady?: boolean;
}

export interface PackIndex {
  packs: PackIndexEntry[];
}

export interface ResolvedKeyword {
  logical: string;
  phrases: string[];
}

export interface ResolvedGlossTier {
  key: string;
  phrases: string[];
}
