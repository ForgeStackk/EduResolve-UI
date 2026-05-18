import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { InboxWebSocketService, InboxNotification } from './inbox-websocket.service';

@Component({
  selector: 'app-inbox-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toast()) {
      <div class="fixed bottom-5 right-5 z-50 bg-gray-900 border border-red-600
                  rounded-xl px-4 py-3 shadow-lg max-w-xs animate-slide-up">
        <p class="text-xs text-red-400 font-bold uppercase tracking-wider mb-0.5">
          {{ toast()!.senderName }}
        </p>
        <p class="text-sm text-white line-clamp-2">{{ toast()!.preview }}</p>
      </div>
    }
  `
})
export class InboxToastComponent implements OnInit, OnDestroy {
  private ws = inject(InboxWebSocketService);
  private sub?: Subscription;
  private timer?: ReturnType<typeof setTimeout>;

  toast = signal<InboxNotification | null>(null);

  ngOnInit(): void {
    this.sub = this.ws.notification$.subscribe(n => {
      this.toast.set(n);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.toast.set(null), 4000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.timer);
  }
}
