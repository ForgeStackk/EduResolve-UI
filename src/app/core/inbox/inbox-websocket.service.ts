import { Injectable, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
// @ts-ignore
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';

export interface InboxNotification {
  messageId: string;
  preview: string;
  senderName: string;
  sentAt: string;
}

@Injectable({ providedIn: 'root' })
export class InboxWebSocketService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  private client: Client | null = null;

  /** Emits every incoming inbox push from the teacher. */
  readonly notification$ = new Subject<InboxNotification>();

  /** Unread badge count — incremented on push, reset to 0 on inbox open. */
  readonly unreadCount = signal(0);

  /**
   * Call once after login. Connects to the STOMP endpoint and subscribes to
   * /topic/inbox/{recipientId}  (recipientId = student or parent portal UUID).
   */
  connect(recipientId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.disconnect();

    const wsUrl = environment.apiBaseUrl
      .replace('/api', '/ws/websocket')
      .replace(/^http/, 'ws');

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe(`/topic/inbox/${recipientId}`, (frame: IMessage) => {
          try {
            const payload: InboxNotification = JSON.parse(frame.body);
            this.notification$.next(payload);
            this.unreadCount.update(n => n + 1);
          } catch {
            // malformed frame — ignore
          }
        });
      },
      onStompError: (frame: any) => {
        console.error('STOMP error', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
  }

  clearBadge(): void {
    this.unreadCount.set(0);
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.notification$.complete();
  }
}
