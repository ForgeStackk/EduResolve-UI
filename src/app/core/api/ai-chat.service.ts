import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatResponse {
  sessionId: string;
  reply: string;
  model: string;
  tokensUsed: number;
  source: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);

  readonly messages = signal<ChatMessage[]>([]);
  readonly isStreaming = signal(false);
  sessionId = signal<string | null>(null);

  /** Blocking call — full reply at once. */
  ask(message: string, opts: {
    userId?: number;
    grade?: string;
    subject?: string;
    language?: string;
  } = {}): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${environment.apiBaseUrl}/ai/chat`, {
      sessionId: this.sessionId(),
      userId:    opts.userId    ?? null,
      message,
      grade:     opts.grade    ?? '9',
      subject:   opts.subject  ?? null,
      language:  opts.language ?? 'en',
      stream:    false
    });
  }

  /**
   * SSE streaming — calls OpenAI and emits token deltas.
   * Appends a streaming assistant message to this.messages().
   * Returns a cleanup function.
   */
  askStream(message: string, opts: {
    userId?: number;
    grade?: string;
    subject?: string;
    language?: string;
    onDone?: (sessionId: string) => void;
    onError?: (err: string) => void;
  } = {}): () => void {
    this.isStreaming.set(true);

    // Add the user turn immediately
    this.messages.update(msgs => [...msgs, {
      role: 'user', content: message, timestamp: new Date()
    }]);

    // Placeholder assistant turn we'll fill in as tokens arrive
    let assistantIdx: number;
    this.messages.update(msgs => {
      assistantIdx = msgs.length;
      return [...msgs, { role: 'assistant', content: '', timestamp: new Date() }];
    });

    const body = JSON.stringify({
      sessionId: this.sessionId(),
      userId:    opts.userId    ?? null,
      message,
      grade:     opts.grade    ?? '9',
      subject:   opts.subject  ?? null,
      language:  opts.language ?? 'en',
      stream:    true
    });

    const ctrl = new AbortController();
    fetch(`${environment.apiBaseUrl}/ai/chat/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal:  ctrl.signal
    }).then(async res => {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (!data.trim()) continue;

            if (currentEvent === 'delta') {
              this.messages.update(msgs => msgs.map((m, i) =>
                i === assistantIdx ? { ...m, content: m.content + data } : m
              ));
            } else if (currentEvent === 'done') {
              this.sessionId.set(data.trim());
              opts.onDone?.(data.trim());
            } else if (currentEvent === 'error') {
              opts.onError?.(data.trim());
            }
          } else if (line === '') {
            currentEvent = '';
          }
        }
      }
    }).catch(err => {
      if (err.name !== 'AbortError') {
        opts.onError?.('Connection lost. Please try again.');
      }
    }).finally(() => {
      this.isStreaming.set(false);
    });

    return () => ctrl.abort();
  }

  clearHistory(): void {
    this.messages.set([]);
    this.sessionId.set(null);
  }
}
