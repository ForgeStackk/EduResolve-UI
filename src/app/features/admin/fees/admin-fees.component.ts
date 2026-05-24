import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
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
  private destroy$ = new Subject<void>();
  private searchTrigger$ = new Subject<void>();

  fees       = signal<FeeSummary[]>([]);
  total      = signal(0);
  page       = signal(0);
  totalPages = signal(1);
  loading    = signal(true);
  search     = signal('');
  status     = signal('');

  linkData    = signal<PaymentLinkData | null>(null);
  linkLoading = signal(false);
  actionMsg   = signal('');

  readonly pageSize = 20;
  readonly statuses = ['', 'Paid', 'Unpaid', 'Partial', 'Overdue', 'Waived'];

  ngOnInit(): void {
    this.searchTrigger$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.page.set(0);
      this.load();
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(): void { this.searchTrigger$.next(); }

  load(): void {
    this.loading.set(true);
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
