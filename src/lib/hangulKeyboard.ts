const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const JUNGSEONG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];

const JONGSEONG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const COMPOUND_VOWELS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};

const COMPOUND_FINALS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
};

const SPLIT_FINALS: Record<string, [string, string]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
};

function getLastCharacter(text: string) {
  return Array.from(text).at(-1) ?? '';
}

function replaceLastCharacter(text: string, replacement: string) {
  const characters = Array.from(text);
  characters[characters.length - 1] = replacement;
  return characters.join('');
}

function removeLastCharacter(text: string) {
  const characters = Array.from(text);
  characters.pop();
  return characters.join('');
}

function composeSyllable(initial: string, vowel: string, final = '') {
  const initialIndex = CHOSEONG.indexOf(initial);
  const vowelIndex = JUNGSEONG.indexOf(vowel);
  const finalIndex = JONGSEONG.indexOf(final);

  if (initialIndex < 0 || vowelIndex < 0 || finalIndex < 0) {
    return `${initial}${vowel}${final}`;
  }

  return String.fromCharCode(
    HANGUL_BASE +
      (initialIndex * JUNGSEONG_COUNT + vowelIndex) * JONGSEONG_COUNT +
      finalIndex,
  );
}

function decomposeSyllable(character: string) {
  const code = character.charCodeAt(0);

  if (code < HANGUL_BASE || code > HANGUL_END) {
    return null;
  }

  const syllableIndex = code - HANGUL_BASE;
  const initialIndex = Math.floor(syllableIndex / (JUNGSEONG_COUNT * JONGSEONG_COUNT));
  const vowelIndex = Math.floor(
    (syllableIndex % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT,
  );
  const finalIndex = syllableIndex % JONGSEONG_COUNT;

  return {
    initial: CHOSEONG[initialIndex],
    vowel: JUNGSEONG[vowelIndex],
    final: JONGSEONG[finalIndex],
  };
}

export function countCharacters(text: string) {
  return Array.from(text.trim()).length;
}

export function deleteHangulInput(text: string) {
  return removeLastCharacter(text);
}

export function composeHangulInput(text: string, key: string) {
  const lastCharacter = getLastCharacter(text);

  if (!lastCharacter) {
    return text + key;
  }

  const isConsonant = CHOSEONG.includes(key);
  const isVowel = JUNGSEONG.includes(key);
  const lastSyllable = decomposeSyllable(lastCharacter);

  if (!isConsonant && !isVowel) {
    return text + key;
  }

  if (isConsonant && lastSyllable) {
    if (!lastSyllable.final && JONGSEONG.includes(key)) {
      return replaceLastCharacter(
        text,
        composeSyllable(lastSyllable.initial, lastSyllable.vowel, key),
      );
    }

    const compoundFinal = COMPOUND_FINALS[`${lastSyllable.final}${key}`];

    if (compoundFinal) {
      return replaceLastCharacter(
        text,
        composeSyllable(lastSyllable.initial, lastSyllable.vowel, compoundFinal),
      );
    }

    return text + key;
  }

  if (isConsonant) {
    return text + key;
  }

  if (isVowel && CHOSEONG.includes(lastCharacter)) {
    return replaceLastCharacter(text, composeSyllable(lastCharacter, key));
  }

  if (isVowel && lastSyllable) {
    if (!lastSyllable.final) {
      const compoundVowel = COMPOUND_VOWELS[`${lastSyllable.vowel}${key}`];

      if (compoundVowel) {
        return replaceLastCharacter(
          text,
          composeSyllable(lastSyllable.initial, compoundVowel),
        );
      }

      return text + key;
    }

    const splitFinal = SPLIT_FINALS[lastSyllable.final];

    if (splitFinal) {
      return (
        replaceLastCharacter(
          text,
          composeSyllable(lastSyllable.initial, lastSyllable.vowel, splitFinal[0]),
        ) + composeSyllable(splitFinal[1], key)
      );
    }

    return (
      replaceLastCharacter(text, composeSyllable(lastSyllable.initial, lastSyllable.vowel)) +
      composeSyllable(lastSyllable.final, key)
    );
  }

  if (isVowel) {
    const compoundVowel = COMPOUND_VOWELS[`${lastCharacter}${key}`];
    return compoundVowel ? replaceLastCharacter(text, compoundVowel) : text + key;
  }

  return text + key;
}
