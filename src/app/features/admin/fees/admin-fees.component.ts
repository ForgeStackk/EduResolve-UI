import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AdminApiService, type FeeSummary, type PagedResponse } from '../../../core/api/admin-api.service';

interface PaymentLinkData {
  upiLink: string;
  waLink: string;
  studentName: string;
  balance: number;
  phone: string;
}

@Component({
  selector: 'app-admin-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-fees.component.html',
})
export class AdminFeesComponent implements OnInit, OnDestroy {
  private adminApi = inject(AdminApiService);
  private debounce: ReturnType<typeof setTimeout> | null = null;

  fees       = signal<FeeSummary[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);
  search     = signal('');
  status     = signal('');

  // Bulk selection
  selectedIds  = signal<Set<number>>(new Set());
  bulkSending  = signal(false);
  bulkDone     = signal(0);

  // Payment link
  linkData    = signal<PaymentLinkData | null>(null);
  linkLoading = signal(false);
  actionMsg   = signal('');

  readonly pageSize = 20;
  readonly statuses = ['', 'Paid', 'Unpaid', 'Partial', 'Overdue', 'Waived'];

  selectableIds = computed(() =>
    this.fees().filter(f => !this.isPaidOrWaived(f)).map(f => f.id)
  );

  isAllSelected = computed(() => {
    const sel = this.selectableIds();
    return sel.length > 0 && sel.every(id => this.selectedIds().has(id));
  });

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void { if (this.debounce) clearTimeout(this.debounce); }

  onInput(): void {
    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = setTimeout(() => { this.page.set(0); this.load(); }, 300);
  }

  load(): void {
    this.loading.set(true);
    this.selectedIds.set(new Set());
    this.adminApi.getFees(this.page(), this.pageSize, this.search(), this.status())
      .subscribe({
        next: (r: PagedResponse<FeeSummary>) => {
          this.fees.set(r.data);
          this.total.set(r.total);
          this.totalPages.set(r.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  prevPage(): void { if (this.page() > 0) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.page() < this.totalPages() - 1) { this.page.update(p => p + 1); this.load(); } }

  isPaidOrWaived(f: FeeSummary): boolean {
    return f.status === 'Paid' || f.status === 'Waived';
  }

  isSelected(id: number): boolean { return this.selectedIds().has(id); }

  toggleSelect(id: number): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.selectableIds()));
    }
  }

  clearSelection(): void { this.selectedIds.set(new Set()); }

  bulkRemind(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    this.bulkSending.set(true);
    this.bulkDone.set(0);
    forkJoin(ids.map(id => this.adminApi.sendFeeReminder(id))).subscribe({
      next: () => {
        this.bulkSending.set(false);
        this.bulkDone.set(ids.length);
        this.actionMsg.set(`Reminder sent to ${ids.length} students`);
        this.selectedIds.set(new Set());
        setTimeout(() => { this.actionMsg.set(''); this.bulkDone.set(0); }, 4000);
      },
      error: () => {
        this.bulkSending.set(false);
        this.actionMsg.set('Some reminders failed. Please try again.');
        setTimeout(() => this.actionMsg.set(''), 4000);
      },
    });
  }

  openPaymentLink(id: number): void {
    this.linkData.set(null);
    this.linkLoading.set(true);
    this.adminApi.getPaymentLink(id).subscribe({
      next: data => { this.linkData.set(data); this.linkLoading.set(false); },
      error: () => this.linkLoading.set(false),
    });
  }

  closeLink(): void { this.linkData.set(null); }

  copyLink(link: string): void {
    navigator.clipboard.writeText(link).then(() => {
      this.actionMsg.set('Link copied!');
      setTimeout(() => this.actionMsg.set(''), 2500);
    });
  }

  remind(id: number): void {
    this.adminApi.sendFeeReminder(id).subscribe({
      next: () => { this.actionMsg.set('Reminder queued'); setTimeout(() => this.actionMsg.set(''), 3000); },
    });
  }

  statusColor(s: string): string {
    return { Paid: 'bg-emerald-50 text-emerald-700', Unpaid: 'bg-red-50 text-red-700',
             Partial: 'bg-amber-50 text-amber-700', Overdue: 'bg-red-100 text-red-800',
             Waived: 'bg-surface-2 text-ink-500' }[s] ?? 'bg-surface-2 text-ink-600';
  }
}
