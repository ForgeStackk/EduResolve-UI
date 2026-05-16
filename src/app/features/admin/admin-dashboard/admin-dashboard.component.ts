import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminApiService } from '../../../core/api/admin-api.service';

interface FeeRecord {
  studentId: string;
  parentName: string;
  amount: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminApi = inject(AdminApiService);

  revenue = signal(0);
  enrollment = signal(0);
  enrollmentTarget = signal(1300);

  activeTickets = signal(0);

  feeData = signal<FeeRecord[]>([]);
  loading = signal(true);

  /** Broadcast composer state. */
  broadcastChannel = signal<'whatsapp' | 'sms'>('whatsapp');
  broadcastMessage = '';
  recipientGroup = 'All Parents (Grade 9-12)';

  /** Enrollment fill percentage toward target. */
  enrollmentPct = computed(() => {
    const t = this.enrollmentTarget() || 1;
    return Math.max(0, Math.min(100, Math.round((this.enrollment() / t) * 100)));
  });

  /** Static ticket-volume sparkline heights (backend doesn't expose history yet). */
  readonly ticketSpark = [65, 85, 45, 72, 58, 78, 90];

  ngOnInit(): void {
    this.adminApi.dashboard().subscribe({
      next: d => {
        this.revenue.set(d.revenue);
        this.enrollment.set(d.enrollment);
        this.enrollmentTarget.set(d.enrollmentTarget);
        this.activeTickets.set(d.activeTickets);
        this.feeData.set((d.recentUnpaidFees || []).map(f => ({
          studentId: `#FS-${f.id ?? ''}`,
          parentName: f.studentName,
          amount: this.formatCurrency(f.amount)
        })));
        this.loading.set(false);
      },
      error: err => {
        console.error('Admin dashboard load failed', err);
        this.loading.set(false);
      }
    });
  }

  private formatCurrency(n: number): string {
    return `$${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
