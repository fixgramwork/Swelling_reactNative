import { API_URL } from '../../../constants';
import {
  createPreviewSpellCheck,
  normalizeSpellCheckResponse,
  type BackendSpellCheckResponse,
} from './spellCheckApi';
import type { SpellCheckResult } from '../types';

type SocketStatus = 'connecting' | 'open' | 'closed' | 'error';

type SpellCheckSocketHandlers = {
  onResult: (result: SpellCheckResult) => void;
  onStatusChange: (status: SocketStatus) => void;
};

type SocketMessage = BackendSpellCheckResponse & {
  type?: string;
  payload?: BackendSpellCheckResponse;
};

const SOCKET_PATH = '/ws/spell-check';

function getSocketUrl() {
  const configuredSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;

  if (configuredSocketUrl) {
    return configuredSocketUrl;
  }

  return `${API_URL.replace(/^http/, 'ws').replace(/\/$/, '')}${SOCKET_PATH}`;
}

function parseSocketMessage(message: string, fallbackText: string): SpellCheckResult {
  const parsed = JSON.parse(message) as SocketMessage;
  const payload = parsed.payload ?? parsed;

  return normalizeSpellCheckResponse(fallbackText, payload, 'socket');
}

export class SpellCheckSocketClient {
  private handlers: SpellCheckSocketHandlers;
  private latestText = '';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private socket: WebSocket | null = null;
  private url = getSocketUrl();

  constructor(handlers: SpellCheckSocketHandlers) {
    this.handlers = handlers;
  }

  connect() {
    if (
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.socket?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.handlers.onStatusChange('connecting');
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.handlers.onStatusChange('open');
      this.sendLatestText();
    };

    this.socket.onmessage = (event) => {
      try {
        const result = parseSocketMessage(String(event.data), this.latestText);
        this.handlers.onResult(result);
      } catch (error) {
        this.handlers.onResult(createPreviewSpellCheck(this.latestText));
      }
    };

    this.socket.onerror = () => {
      this.handlers.onStatusChange('error');
      this.handlers.onResult(createPreviewSpellCheck(this.latestText));
    };

    this.socket.onclose = () => {
      this.handlers.onStatusChange('closed');
    };
  }

  check(text: string) {
    this.latestText = text;

    if (!text.trim()) {
      return;
    }

    this.connect();

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendLatestText();
    }
  }

  close() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.socket?.close();
    this.socket = null;
  }

  private sendLatestText() {
    if (!this.latestText.trim() || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        type: 'spell_check',
        text: this.latestText,
      }),
    );
  }
}
