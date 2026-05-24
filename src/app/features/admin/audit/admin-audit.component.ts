import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService, type AuditLogEntry, type PagedResponse } from '../../../core/api/admin-api.service';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-audit.component.html',
})
export class AdminAuditComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  logs       = signal<AuditLogEntry[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);

  actionFilter  = signal('');
  actorIdFilter = signal('');

  readonly pageSize = 25;
  readonly actionOptions = ['', 'PAYMENT_RECORDED', 'FEE_REMINDER', 'TICKET_UPDATED', 'TICKET_REPLY', 'BROADCAST_SENT'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getAuditLogs(this.page(), this.pageSize, this.actionFilter(), this.actorIdFilter())
      .subscribe({
        next: (r: PagedResponse<AuditLogEntry>) => {
          this.logs.set(r.data);
          this.total.set(r.total);
          this.totalPages.set(r.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onFilter(): void { this.page.set(0); this.load(); }
  prevPage(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); } }

  actionColor(action: string): string {
    if (action.startsWith('PAYMENT'))  return 'bg-emerald-50 text-emerald-700';
    if (action.startsWith('TICKET'))   return 'bg-blue-50 text-blue-700';
    if (action.startsWith('BROADCAST')) return 'bg-amber-50 text-amber-700';
    return 'bg-surface-2 text-ink-600';
  }
}
