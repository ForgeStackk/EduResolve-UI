import { Injectable, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
// @ts-ignore
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../../environments/environment';

export interface ClassroomEvent {
  eventType: string;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class ClassroomWsService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private client: Client | null = null;

  readonly event$ = new Subject<ClassroomEvent>();
  readonly unreadCount = signal(0);

  connect(classroomId: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.disconnect();

    const wsUrl = environment.apiBaseUrl
      .replace('/api', '/ws/websocket')
      .replace(/^http/, 'ws');

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe(`/topic/classroom/${classroomId}`, (frame: IMessage) => {
          try {
            const evt: ClassroomEvent = JSON.parse(frame.body);
            this.event$.next(evt);
            if (evt.eventType === 'NEW_MESSAGE') {
              this.unreadCount.update(n => n + 1);
            }
          } catch { /* ignore malformed */ }
        });
      },
      onStompError: (frame: any) => console.error('Classroom STOMP error', frame)
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
    this.event$.complete();
  }
}
