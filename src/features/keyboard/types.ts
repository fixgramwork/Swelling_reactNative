export interface SpellCheckSuggestion {
  id: string;
  original: string;
  replacement: string;
  reason: string;
  confidence?: number;
}

export interface SpellCheckResult {
  originalText: string;
  correctedText: string;
  suggestions: SpellCheckSuggestion[];
  source: 'backend' | 'socket' | 'preview';
}
