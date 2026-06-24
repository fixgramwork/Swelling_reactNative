import { API_URL } from '../../../constants';
import type { SpellCheckResult, SpellCheckSuggestion } from '../types';
import { demoSpellCheckExamples } from '../constants/demoSpellCheckExamples';

export type BackendSuggestion = {
  id?: string;
  original?: string;
  source?: string;
  replacement?: string;
  suggestion?: string;
  corrected?: string;
  reason?: string;
  confidence?: number;
};

export type BackendSpellCheckResponse = {
  text?: string;
  originalText?: string;
  correctedText?: string;
  result?: string;
  suggestions?: BackendSuggestion[];
};

const SPELL_CHECK_ENDPOINT = `${API_URL.replace(/\/$/, '')}/api/spell-check`;

function replaceAllText(text: string, searchText: string, replacement: string) {
  return text.split(searchText).join(replacement);
}

function isOverlappingRange(
  ranges: ReadonlyArray<readonly [number, number]>,
  start: number,
  end: number,
) {
  return ranges.some(
    ([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart,
  );
}

export function normalizeSuggestion(
  suggestion: BackendSuggestion,
  index: number,
): SpellCheckSuggestion {
  const original = suggestion.original ?? suggestion.source ?? '';
  const replacement =
    suggestion.replacement ?? suggestion.suggestion ?? suggestion.corrected ?? '';

  return {
    id: suggestion.id ?? `${index}-${original}-${replacement}`,
    original,
    replacement,
    reason: suggestion.reason ?? '맞춤법 교정 제안',
    confidence: suggestion.confidence,
  };
}

export async function checkSpelling(
  text: string,
  signal?: AbortSignal,
): Promise<SpellCheckResult> {
  const response = await fetch(SPELL_CHECK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Spell check failed with status ${response.status}`);
  }

  const payload = (await response.json()) as BackendSpellCheckResponse;
  return normalizeSpellCheckResponse(text, payload, 'backend');
}

export function normalizeSpellCheckResponse(
  text: string,
  payload: BackendSpellCheckResponse,
  source: SpellCheckResult['source'] = 'backend',
): SpellCheckResult {
  const correctedText = payload.correctedText ?? payload.result ?? payload.text ?? text;

  return {
    originalText: payload.originalText ?? text,
    correctedText,
    suggestions: (payload.suggestions ?? []).map(normalizeSuggestion),
    source,
  };
}

export function createPreviewSpellCheck(text: string): SpellCheckResult {
  const suggestions: SpellCheckSuggestion[] = [];
  const matchedRanges: Array<[number, number]> = [];
  let correctedText = text;

  demoSpellCheckExamples.forEach((example) => {
    let searchIndex = text.indexOf(example.wrongText);
    let matchIndex = 0;

    while (searchIndex !== -1) {
      const matchEndIndex = searchIndex + example.wrongText.length;

      if (!isOverlappingRange(matchedRanges, searchIndex, matchEndIndex)) {
        matchedRanges.push([searchIndex, matchEndIndex]);
        suggestions.push({
          id: `${example.id}-${matchIndex}`,
          original: example.wrongText,
          replacement: example.correctText,
          reason: example.reason,
          confidence: 0.92,
        });
      }

      searchIndex = text.indexOf(example.wrongText, searchIndex + example.wrongText.length);
      matchIndex += 1;
    }

    correctedText = replaceAllText(
      correctedText,
      example.wrongText,
      example.correctText,
    );
  });

  return {
    originalText: text,
    correctedText,
    suggestions,
    source: 'preview',
  };
}
