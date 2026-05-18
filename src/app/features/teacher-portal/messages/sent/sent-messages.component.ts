import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessagesService } from '../messages.service';
import { MessageSummary } from '../../shared/models/teacher-portal.models';

@Component({
  selector: 'app-sent-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './sent-messages.component.html'
})
export class SentMessagesComponent implements OnInit {
  private svc = inject(MessagesService);

  messages = signal<MessageSummary[]>([]);
  total = signal(0);
  page = signal(0);
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.getSent(undefined, this.page(), 20).subscribe({
      next: res => { this.messages.set(res.content); this.total.set(res.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  prev(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  next(): void { this.page.update(p => p + 1); this.load(); }
}
