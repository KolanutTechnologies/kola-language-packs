export type KeywordValue = string | string[];

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
  targets: Array<'javascript' | 'python' | 'typescript' | 'go' | 'rust'>;
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
}

export interface PackIndex {
  packs: PackIndexEntry[];
}

export interface ResolvedKeyword {
  logical: string;
  phrases: string[];
}
