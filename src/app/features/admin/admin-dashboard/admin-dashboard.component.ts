import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { AdminApiService, type AdminDashboardData, type TicketSummary } from '../../../core/api/admin-api.service';

type Range = 'today' | '7d' | '30d';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  range          = signal<Range>('7d');
  loading        = signal(true);
  ticketsLoading = signal(true);

  revenue           = signal(0);
  enrollment        = signal(0);
  enrollmentTarget  = signal(1300);
  activeTickets     = signal(0);
  feeCollectionRate = signal(0);

  recentTickets = signal<TicketSummary[]>([]);

  readonly ticketSpark = [65, 85, 45, 72, 58, 78, 90];
  readonly ranges: Range[] = ['today', '7d', '30d'];

  enrollmentPct = computed(() => {
    const t = this.enrollmentTarget() || 1;
    return Math.max(0, Math.min(100, Math.round((this.enrollment() / t) * 100)));
  });

  ngOnInit(): void {
    this.loadDashboard();
    this.loadTickets();
  }

  setRange(r: Range): void {
    this.range.set(r);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.adminApi.dashboard(this.range()).subscribe({
      next: (d: AdminDashboardData) => {
        this.revenue.set(d.revenue);
        this.enrollment.set(d.enrollment);
        this.enrollmentTarget.set(d.enrollmentTarget);
        this.activeTickets.set(d.activeTickets);
        this.feeCollectionRate.set(d.feeCollectionRate ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTickets(): void {
    this.ticketsLoading.set(true);
    this.adminApi.getTickets(0, 5, 'Pending').subscribe({
      next: r => { this.recentTickets.set(r.data); this.ticketsLoading.set(false); },
      error: () => this.ticketsLoading.set(false),
    });
  }

  priorityColor(p: string): string {
    return { critical: 'bg-red-100 text-red-800', high: 'bg-orange-50 text-orange-700',
             medium: 'bg-amber-50 text-amber-700', low: 'bg-surface-2 text-ink-500' }[p] ?? '';
  }

  formatCurrency(n: number): string {
    return `₹${(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
}
