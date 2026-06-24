import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SpellCheckSocketClient } from '../api/spellCheckSocket';
import type { SpellCheckResult, SpellCheckSuggestion } from '../types';
import {
  composeHangulInput,
  countCharacters,
  deleteHangulInput,
} from '../../../lib/hangulKeyboard';

const toss = {
  blue: '#0064FF',
  bluePressed: '#0050D8',
  blueTint: '#E8F2FF',
  background: '#F2F4F6',
  surface: '#FFFFFF',
  elevated: '#F9FAFB',
  text: '#202632',
  textMuted: '#4E5968',
  textSubtle: '#8B95A1',
  line: '#E5E8EB',
  lineStrong: '#D1D6DB',
  keyAction: '#E5E8EB',
  success: '#20C997',
  warning: '#F59F00',
};

const topRow = ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'];
const shiftedTopRow = ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ'];
const middleRow = ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'];
const bottomLetterRow = ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'];

type CheckStatus = 'idle' | 'connecting' | 'checking' | 'complete' | 'preview';

function getStatusLabel(status: CheckStatus) {
  if (status === 'connecting') {
    return '연결 중';
  }

  if (status === 'checking') {
    return '실시간 검사';
  }

  if (status === 'complete') {
    return 'socket 완료';
  }

  if (status === 'preview') {
    return '미리보기';
  }

  return '입력 대기';
}

function getDisplayText(text: string, result: SpellCheckResult | null) {
  if (result?.suggestions.length) {
    return result.suggestions
      .map((suggestion) => `${suggestion.original} → ${suggestion.replacement}`)
      .join('\n');
  }

  if (text.trim().length > 0) {
    return '발견된 맞춤법 오류가 없습니다.';
  }

  return '문장을 입력하면 교정 결과가 여기에 표시됩니다.';
}

function isChangedResult(text: string, result: SpellCheckResult | null) {
  return Boolean(result && result.correctedText !== text);
}

interface KeyButtonProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'letter' | 'action' | 'primary';
}

function KeyButton({ label, onPress, active, style, variant = 'letter' }: KeyButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        variant === 'action' && styles.actionKey,
        variant === 'primary' && styles.primaryKey,
        active && styles.activeKey,
        pressed && styles.pressedKey,
        style,
      ]}
    >
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[
          styles.keyLabel,
          variant === 'primary' && styles.primaryKeyLabel,
          active && styles.activeKeyLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface SuggestionChipProps {
  suggestion: SpellCheckSuggestion;
  onPress: () => void;
}

function SuggestionChip({ suggestion, onPress }: SuggestionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${suggestion.original}을 ${suggestion.replacement}로 교정`}
      onPress={onPress}
      style={({ pressed }) => [styles.suggestionChip, pressed && styles.suggestionChipPressed]}
    >
      <Text numberOfLines={1} style={styles.suggestionReplacement}>
        {suggestion.replacement}
      </Text>
      <Text numberOfLines={1} style={styles.suggestionOriginal}>
        {suggestion.original}
      </Text>
    </Pressable>
  );
}

export function CorrectionKeyboard() {
  const { width } = useWindowDimensions();
  const socketClientRef = useRef<SpellCheckSocketClient | null>(null);
  const [text, setText] = useState('');
  const [isShifted, setIsShifted] = useState(false);
  const [result, setResult] = useState<SpellCheckResult | null>(null);
  const [status, setStatus] = useState<CheckStatus>('idle');

  const characterCount = useMemo(() => countCharacters(text), [text]);
  const activityPercent = text.trim().length > 0 ? 100 : 0;
  const displayText = getDisplayText(text, result);
  const visibleSuggestions = result?.suggestions.slice(0, 3) ?? [];
  const hasChangedResult = isChangedResult(text, result);
  const shouldFramePreview = width >= 520;

  useEffect(() => {
    socketClientRef.current = new SpellCheckSocketClient({
      onResult: (nextResult) => {
        setResult(nextResult);
        setStatus(nextResult.source === 'preview' ? 'preview' : 'complete');
      },
      onStatusChange: (nextStatus) => {
        if (nextStatus === 'connecting') {
          setStatus('connecting');
        }

        if (nextStatus === 'open') {
          setStatus('checking');
        }

        if (nextStatus === 'error') {
          setStatus('preview');
        }
      },
    });

    return () => {
      socketClientRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      setStatus('idle');
      return;
    }

    setStatus('checking');
    socketClientRef.current?.check(text);
  }, [text]);

  const inputKey = (key: string) => {
    setText((currentText) => composeHangulInput(currentText, key));
    setIsShifted(false);
  };

  const inputPlainText = (value: string) => {
    setText((currentText) => currentText + value);
    setIsShifted(false);
  };

  const deleteLast = () => {
    setText((currentText) => deleteHangulInput(currentText));
  };

  const clearText = () => {
    setText('');
    setResult(null);
    setStatus('idle');
  };

  const applySuggestion = (suggestion: SpellCheckSuggestion) => {
    setText((currentText) =>
      currentText.replace(suggestion.original, suggestion.replacement),
    );
  };

  const applyCorrectedText = () => {
    if (result?.correctedText) {
      setText(result.correctedText);
    }
  };

  return (
    <View style={[styles.screen, shouldFramePreview && styles.webScreen]}>
      <View style={[styles.container, shouldFramePreview && styles.webFrame]}>
        <View style={styles.hostPreview}>
        <View style={styles.chatHeader}>
          <View>
            <Text style={styles.chatTitle}>대화</Text>
            <Text style={styles.chatSubtitle}>Swelling</Text>
          </View>
          <View style={styles.headerIndicator} />
        </View>

        <ScrollView
          contentContainerStyle={styles.messageArea}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.friendBubble}>
            <Text style={styles.friendBubbleText}>오늘 회의 내용 정리해서 보내줄 수 있어?</Text>
          </View>

          {text.length > 0 ? (
            <View style={styles.myBubble}>
              <Text style={styles.myBubbleText}>
                {text}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyBubble}>
              <Text style={styles.emptyBubbleText}>메시지 입력</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.keyboardDock}>
        <View style={styles.outputBox}>
          <View style={styles.outputHeader}>
            <Text style={styles.outputTitle}>교정 결과</Text>
            <View style={styles.outputMeta}>
              <View
                style={[
                  styles.statusPill,
                  status === 'checking' && styles.checkingPill,
                  status === 'complete' && styles.completePill,
                  status === 'preview' && styles.previewPill,
                ]}
              >
                <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
              </View>
              <Text style={styles.counterText}>{characterCount}자</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${activityPercent}%` }]} />
          </View>

          <View style={styles.outputTextBox}>
            <Text selectable style={[styles.outputText, !text && styles.outputPlaceholder]}>
              {displayText}
            </Text>
          </View>

          <View style={styles.outputActions}>
            {visibleSuggestions.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionRail}
              >
                {visibleSuggestions.map((suggestion) => (
                  <SuggestionChip
                    key={suggestion.id}
                    suggestion={suggestion}
                    onPress={() => applySuggestion(suggestion)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptySuggestionRail} />
            )}

            {hasChangedResult ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="교정문 적용"
                onPress={applyCorrectedText}
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.applyButtonPressed,
                ]}
              >
                <Text numberOfLines={1} style={styles.applyButtonText}>
                  적용
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.keyPanel}>
          <View style={styles.keyRow}>
            {(isShifted ? shiftedTopRow : topRow).map((key) => (
              <KeyButton key={key} label={key} onPress={() => inputKey(key)} />
            ))}
          </View>

          <View style={[styles.keyRow, styles.middleKeyRow]}>
            {middleRow.map((key) => (
              <KeyButton key={key} label={key} onPress={() => inputKey(key)} />
            ))}
          </View>

          <View style={styles.keyRow}>
            <KeyButton
              active={isShifted}
              label="⇧"
              onPress={() => setIsShifted((current) => !current)}
              style={styles.sideKey}
              variant="action"
            />
            {bottomLetterRow.map((key) => (
              <KeyButton key={key} label={key} onPress={() => inputKey(key)} />
            ))}
            <KeyButton label="⌫" onPress={deleteLast} style={styles.sideKey} variant="action" />
          </View>

          <View style={styles.keyRow}>
            <KeyButton label=".,?" onPress={() => inputPlainText('.')} variant="action" />
            <KeyButton label="비움" onPress={clearText} variant="action" />
            <KeyButton
              label="space"
              onPress={() => inputPlainText(' ')}
              style={styles.spaceKey}
              variant="action"
            />
            <KeyButton label="↵" onPress={() => inputPlainText('\n')} variant="primary" />
          </View>
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: toss.background,
    width: '100%',
  },
  webScreen: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    backgroundColor: toss.background,
    flex: 1,
    maxWidth: 420,
    overflow: 'hidden',
    width: '100%',
  },
  webFrame: {
    borderRadius: 28,
    boxShadow: '0 18px 50px rgba(25, 31, 40, 0.14)',
    maxHeight: 820,
  },
  hostPreview: {
    flex: 1,
    backgroundColor: toss.background,
    paddingTop: 48,
  },
  chatHeader: {
    alignItems: 'center',
    backgroundColor: toss.surface,
    borderBottomColor: toss.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 24,
  },
  chatTitle: {
    color: toss.text,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  chatSubtitle: {
    color: toss.textSubtle,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  headerIndicator: {
    backgroundColor: toss.success,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  messageArea: {
    flexGrow: 1,
    gap: 14,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 24,
  },
  friendBubble: {
    alignSelf: 'flex-start',
    backgroundColor: toss.surface,
    borderRadius: 18,
    borderTopLeftRadius: 8,
    maxWidth: '84%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  friendBubbleText: {
    color: toss.text,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 23,
  },
  myBubble: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: toss.blue,
    borderRadius: 18,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    maxWidth: '84%',
    minHeight: 46,
    minWidth: 48,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  myBubbleText: {
    color: toss.surface,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  emptyBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E9ECEF',
    borderRadius: 18,
    borderTopRightRadius: 8,
    minWidth: 128,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyBubbleText: {
    color: toss.textSubtle,
    fontSize: 16,
    fontWeight: '500',
  },
  keyboardDock: {
    backgroundColor: toss.background,
    borderTopColor: toss.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    boxShadow: '0 -12px 32px rgba(25, 31, 40, 0.08)',
  },
  outputBox: {
    backgroundColor: toss.surface,
    borderBottomColor: toss.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 132,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  outputHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 0,
  },
  outputTitle: {
    color: toss.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  outputMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: '#F2F4F6',
    borderRadius: 999,
    minHeight: 22,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  checkingPill: {
    backgroundColor: '#FFF4D6',
  },
  completePill: {
    backgroundColor: '#E6FCF5',
  },
  previewPill: {
    backgroundColor: toss.blueTint,
  },
  statusText: {
    color: toss.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  counterText: {
    color: toss.textSubtle,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: '#EEF1F4',
    borderRadius: 999,
    height: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: toss.blue,
    borderRadius: 999,
    height: 4,
  },
  outputTextBox: {
    justifyContent: 'center',
    minHeight: 54,
    paddingTop: 9,
  },
  outputText: {
    color: toss.text,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
  },
  outputPlaceholder: {
    color: toss.textSubtle,
    fontWeight: '500',
  },
  outputActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    paddingBottom: 8,
    paddingTop: 5,
  },
  suggestionRail: {
    gap: 8,
    paddingRight: 4,
  },
  emptySuggestionRail: {
    flex: 1,
  },
  suggestionChip: {
    backgroundColor: toss.blueTint,
    borderColor: '#CDE3FF',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 34,
    minWidth: 88,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  suggestionChipPressed: {
    backgroundColor: '#D8EAFF',
  },
  suggestionReplacement: {
    color: toss.bluePressed,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  suggestionOriginal: {
    color: toss.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 1,
    textDecorationLine: 'line-through',
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: toss.blue,
    borderRadius: 10,
    minHeight: 34,
    minWidth: 56,
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  applyButtonPressed: {
    backgroundColor: toss.bluePressed,
  },
  applyButtonText: {
    color: toss.surface,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  keyPanel: {
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 14,
    paddingTop: 10,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 7,
    minWidth: 0,
  },
  middleKeyRow: {
    paddingHorizontal: 15,
  },
  key: {
    alignItems: 'center',
    backgroundColor: toss.surface,
    borderRadius: 9,
    flex: 1,
    flexBasis: 0,
    height: 45,
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(25, 31, 40, 0.10)',
  },
  actionKey: {
    backgroundColor: toss.keyAction,
  },
  primaryKey: {
    backgroundColor: toss.blue,
    flex: 1.15,
  },
  activeKey: {
    backgroundColor: toss.text,
  },
  pressedKey: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
  keyLabel: {
    color: toss.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
    width: '100%',
  },
  primaryKeyLabel: {
    color: toss.surface,
  },
  activeKeyLabel: {
    color: toss.surface,
  },
  sideKey: {
    flex: 1.18,
  },
  spaceKey: {
    flex: 3.4,
  },
});
