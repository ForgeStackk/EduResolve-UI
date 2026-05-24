import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService, type TicketSummary, type TicketDetail, type PagedResponse } from '../../../core/api/admin-api.service';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-tickets.component.html',
})
export class AdminTicketsComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  tickets    = signal<TicketSummary[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);

  statusFilter   = signal('');
  categoryFilter = signal('');

  selectedTicket = signal<TicketDetail | null>(null);
  detailLoading  = signal(false);
  replyBody      = signal('');
  replyError     = signal('');

  readonly pageSize   = 20;
  readonly statuses   = ['', 'Pending', 'InReview', 'Resolved', 'Closed'];
  readonly categories = ['', 'billing', 'technical', 'transport', 'academic', 'other'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getTickets(this.page(), this.pageSize, this.statusFilter(), this.categoryFilter())
      .subscribe({
        next: (r: PagedResponse<TicketSummary>) => {
          this.tickets.set(r.data);
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

  openTicket(id: number): void {
    this.detailLoading.set(true);
    this.selectedTicket.set(null);
    this.replyBody.set('');
    this.replyError.set('');
    this.adminApi.getTicket(id).subscribe({
      next: t => { this.selectedTicket.set(t); this.detailLoading.set(false); },
      error: () => this.detailLoading.set(false),
    });
  }

  closeDetail(): void { this.selectedTicket.set(null); }

  updateStatus(id: number, status: string): void {
    this.adminApi.updateTicket(id, { status }).subscribe({ next: () => { this.load(); this.closeDetail(); } });
  }

  sendReply(): void {
    const t = this.selectedTicket();
    if (!t || !this.replyBody().trim()) return;
    this.adminApi.addTicketMessage(t.id, this.replyBody()).subscribe({
      next: () => { this.openTicket(t.id); this.replyBody.set(''); },
      error: () => this.replyError.set('Failed to send reply'),
    });
  }

  priorityColor(p: string): string {
    return { critical: 'bg-red-100 text-red-800', high: 'bg-orange-50 text-orange-700',
             medium: 'bg-amber-50 text-amber-700', low: 'bg-surface-2 text-ink-500' }[p] ?? '';
  }

  statusColor(s: string): string {
    return { Pending: 'bg-red-50 text-red-600', InReview: 'bg-blue-50 text-blue-700',
             Resolved: 'bg-emerald-50 text-emerald-700', Closed: 'bg-surface-2 text-ink-500' }[s] ?? '';
  }
}
