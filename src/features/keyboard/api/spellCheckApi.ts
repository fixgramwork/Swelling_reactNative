import { API_URL } from '../../../constants';
import type { SpellCheckResult, SpellCheckSuggestion } from '../types';

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

const previewRules = [
  {
    pattern: /안되요/g,
    replacement: '안 돼요',
    reason: '되다의 활용은 문맥상 돼요가 자연스럽습니다.',
  },
  {
    pattern: /되요/g,
    replacement: '돼요',
    reason: '되어요의 준말은 돼요입니다.',
  },
  {
    pattern: /됬/g,
    replacement: '됐',
    reason: '되었다의 준말은 됐다입니다.',
  },
  {
    pattern: /할께/g,
    replacement: '할게',
    reason: '의지를 나타낼 때는 할게로 적습니다.',
  },
  {
    pattern: /몇일/g,
    replacement: '며칠',
    reason: '표준어는 며칠입니다.',
  },
  {
    pattern: /왠만/g,
    replacement: '웬만',
    reason: '웬만하다가 바른 표기입니다.',
  },
];

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
  let correctedText = text;

  previewRules.forEach((rule, ruleIndex) => {
    const matches = Array.from(text.matchAll(rule.pattern));

    matches.forEach((match, matchIndex) => {
      suggestions.push({
        id: `preview-${ruleIndex}-${matchIndex}`,
        original: match[0],
        replacement: rule.replacement,
        reason: rule.reason,
        confidence: 0.86,
      });
    });

    correctedText = correctedText.replace(rule.pattern, rule.replacement);
  });

  return {
    originalText: text,
    correctedText,
    suggestions,
    source: 'preview',
  };
}
