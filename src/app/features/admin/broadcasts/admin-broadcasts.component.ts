import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminApiService, type BroadcastSummary, type PagedResponse } from '../../../core/api/admin-api.service';

@Component({
  selector: 'app-admin-broadcasts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-broadcasts.component.html',
})
export class AdminBroadcastsComponent implements OnInit {
  private adminApi = inject(AdminApiService);
  private auth     = inject(AuthService);

  broadcasts = signal<BroadcastSummary[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);
  sending    = signal(false);
  successMsg = signal('');
  errorMsg   = signal('');

  // Compose form
  channels      = signal<string[]>(['whatsapp']);
  audienceGrades = signal('');
  message       = signal('');
  isEmergency   = signal(false);

  readonly pageSize   = 10;
  readonly allChannels = ['whatsapp', 'sms', 'email'];
  readonly gradeOptions = ['', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getBroadcasts(this.page(), this.pageSize).subscribe({
      next: (r: PagedResponse<BroadcastSummary>) => {
        this.broadcasts.set(r.data);
        this.total.set(r.total);
        this.totalPages.set(r.totalPages || 1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  prevPage(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); } }

  toggleChannel(ch: string): void {
    const cur = this.channels();
    this.channels.set(cur.includes(ch) ? cur.filter(c => c !== ch) : [...cur, ch]);
  }

  send(): void {
    if (!this.message().trim() || !this.channels().length) return;
    this.sending.set(true);
    this.errorMsg.set('');
    const user = this.auth.currentUser();
    this.adminApi.createBroadcast({
      channels:      this.channels().join(','),
      audienceGrades: this.audienceGrades(),
      message:       this.message(),
      isEmergency:   this.isEmergency(),
      sentByName:    user ? `${user.firstName} ${user.lastName}` : 'Admin',
    }).subscribe({
      next: r => {
        this.sending.set(false);
        this.successMsg.set(`Sent to ~${r.recipientCount} recipients`);
        this.message.set('');
        this.load();
        setTimeout(() => this.successMsg.set(''), 4000);
      },
      error: () => { this.sending.set(false); this.errorMsg.set('Failed to send broadcast'); },
    });
  }
}
