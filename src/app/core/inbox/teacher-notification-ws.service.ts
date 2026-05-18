import { Injectable, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';

export interface TeacherNotificationPush {
  notificationId: string;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherNotificationWsService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private client: Client | null = null;

  readonly notification$ = new Subject<TeacherNotificationPush>();
  readonly unreadCount = signal(0);

  connect(teacherPortalId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.disconnect();

    const wsUrl = environment.apiBaseUrl.replace('/api', '') + '/ws';

    this.client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require('sockjs-client');
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe(
          `/topic/notification/${teacherPortalId}`,
          (frame: IMessage) => {
            try {
              const push: TeacherNotificationPush = JSON.parse(frame.body);
              this.notification$.next(push);
              this.unreadCount.update(n => n + 1);
            } catch {
              // ignore malformed frames
            }
          }
        );
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client?.active) this.client.deactivate();
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
